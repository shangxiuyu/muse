import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer, request as httpRequest } from 'node:http';
import { createApp } from '../server/app.mjs';
import { readConfig, configForMedia, publicConfig } from '../server/config.mjs';
import { AppError, validateArtifact } from '../server/validation.mjs';
import { Store } from '../server/store.mjs';
import { uiHtml, safePreview } from '../web/lib/artifacts.js';

async function fixture(t, agent, overrides = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'muse-test-'));
  const config = { ...readConfig({ MUSE_API_KEY: 'test-secret', MUSE_MODEL: 'test-model', MUSE_API: 'openai-completions' }), dataDir: directory, timeoutMs: 3000, ...overrides };
  const app = await createApp(config, agent ? { agent } : {});
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${app.server.address().port}`;
  const request = async (path, method = 'GET', body, headers = {}) => {
    const response = await fetch(url + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, data: await response.json() };
  };
  const project = async (type = 'text') => (await request('/projects', 'POST', { type, title: '测试作品' })).data;
  const start = async (id, prompt = '写一段文字', extra = {}) => request(`/projects/${id}/runs`, 'POST', { prompt, requestId: randomUUID(), style: '随内容判断', ...extra });
  const finish = async id => {
    const task = app.runs.active.get(id);
    if (task) await task.done;
    return app.runs.snapshot(id);
  };
  t.after(async () => { await app.close(); await rm(directory, { recursive: true, force: true }); });
  return { ...app, config, url, directory, request, project, start, finish };
}
const success = { async run({ input, project }) { return { artifact: validateArtifact({ title: '真实版本', direction: '测试', text: input.prompt }, project.type), message: '完成', session: [{ type: 'private-test' }] }; } };

test('export references return only whitelisted design specifications with local-origin protection', async t => {
  const f = await fixture(t, success);
  const selected = await f.request('/export/references?archetypeId=ppt_memphis&imageStyleId=watercolor');
  assert.equal(selected.status, 200);
  assert.deepEqual(selected.data.references.map(item => item.id), ['ppt_memphis', 'watercolor']);
  assert.match(selected.data.references[0].specification, /精确 Design Tokens/);
  assert.match(selected.data.references[0].specification, /演示端中文配对/);
  assert.doesNotMatch(selected.data.references[0].specification, /## 🏛️ 流派二/);
  assert.ok(selected.data.references.every(item => typeof item.specification === 'string' && !item.path));
  assert.deepEqual((await f.request('/export/references')).data, { references: [] });
  for (const query of ['archetypeId=../../.env', 'imageStyleId=../../.env', 'archetypeId=unknown', 'imageStyleId=unknown']) {
    assert.equal((await f.request(`/export/references?${query}`)).status, 400);
  }
  assert.equal((await f.request('/export/references?archetypeId=ppt_memphis', 'GET', undefined, { Origin: 'https://example.com' })).status, 403);
});

test('DeepSeek defaults ignore ambient company models and keep Pro text-only', () => {
  const c = readConfig({ DEEPSEEK_API_KEY: 'private-key', ANTHROPIC_AUTH_TOKEN: 'company-key', ANTHROPIC_MODEL: 'glm-5' });
  assert.equal(c.baseUrl, 'https://api.deepseek.com');
  assert.equal(c.key, 'private-key');
  assert.equal(c.api, 'openai-completions');
  for (const type of ['ui', 'ppt', 'image']) assert.equal(configForMedia(c, type).model, 'deepseek-v4-flash');
  assert.equal(configForMedia(c, 'text').model, 'deepseek-v4-pro');
  assert.equal(configForMedia(c, 'text').vision, false);
  assert.equal(configForMedia(c, 'ui').vision, true);
  assert.equal(readConfig({ ANTHROPIC_AUTH_TOKEN: 'company-key', ANTHROPIC_MODEL: 'glm-5' }).configured, false);
  assert.equal(JSON.stringify(publicConfig(c)).includes('private-key'), false);
  const custom = readConfig({ MUSE_BASE_URL: 'http://localhost:1234/v1', MUSE_MODEL: 'custom-model', MUSE_API_KEY: 'custom-key' });
  assert.equal(custom.textModel, 'custom-model');
  assert.equal(custom.deepseek, false);
});

test('a second server cannot write to the same workspace', async t => {
  const f = await fixture(t, success);
  await assert.rejects(createApp(f.config, { agent: success }), /另一个 Muse 服务/);
  assert.equal((await f.request('/workspace')).status, 200);
});

test('server stores versions, selected parent, scoped memory and private Pi sessions', async t => {
  const inputs = [];
  const f = await fixture(t, { async run(input) { inputs.push(input); return success.run(input); } });
  const p = await f.project();
  await f.request('/memories', 'POST', { type: 'text', text: '使用短句' });
  const r1 = (await f.start(p.id)).data;
  assert.equal((await f.finish(r1.id)).status, 'completed');
  const first = (await f.request(`/projects/${p.id}`)).data;
  assert.equal(first.versions.length, 1);
  assert.equal(first.versions[0].demo, false);
  assert.equal(first._session, undefined);
  const r2 = (await f.start(p.id, '改得更短', { baseVersionId: first.versions[0].id })).data;
  await f.finish(r2.id);
  const restored = await new Store(f.directory).load();
  assert.equal(restored.data.projects[0].versions.length, 2);
  assert.equal(inputs[1].input.baseVersionId, first.versions[0].id);
  assert.deepEqual(inputs[1].project._session, [{ type: 'private-test' }]);
  assert.equal(inputs[0].memories[0].text, '使用短句');
  const memory = (await f.request('/workspace')).data.memories[0];
  await f.request(`/memories/${memory.id}`, 'DELETE');
  assert.equal(f.store.data.projects[0]._session, undefined, 'removed preferences must not survive in old model context');
});

test('duplicate requests are idempotent, concurrent edits are rejected and cancellation commits no version', async t => {
  let started = 0;
  const f = await fixture(t, { async run({ signal }) { started++; await new Promise((_, reject) => { if (signal.aborted) reject(signal.reason); else signal.addEventListener('abort', () => reject(signal.reason), { once: true }); }); } });
  const p = await f.project();
  const requestId = randomUUID();
  const a = await f.start(p.id, '生成', { requestId });
  const b = await f.start(p.id, '生成', { requestId });
  assert.equal(a.data.id, b.data.id);
  assert.equal(a.data.requestId, requestId);
  assert.equal(started, 1);
  assert.equal((await f.start(p.id, '另一条')).status, 409);
  assert.equal((await f.request(`/projects/${p.id}`, 'DELETE')).status, 409);
  await f.request(`/runs/${a.data.id}/cancel`, 'POST', {});
  assert.equal((await f.finish(a.data.id)).status, 'cancelled');
  assert.equal(f.store.data.projects[0].versions.length, 0);
  assert.equal(f.store.data.projects[0].messages[0].status, 'cancelled');
});

test('failed and timed-out tasks keep the user input and never invent a demo', async t => {
  const f = await fixture(t, { async run() { throw new AppError('模型额度不足', 502); } });
  const p = await f.project();
  const run = (await f.start(p.id)).data;
  const result = await f.finish(run.id);
  assert.equal(result.status, 'failed');
  assert.equal(result.error, '模型额度不足');
  assert.equal(f.store.data.projects[0].messages[0].text, '写一段文字');
  assert.equal(f.store.data.projects[0].versions.length, 0);
  const timed = await fixture(t, { async run({ signal }) { await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })); } }, { timeoutMs: 30 });
  const p2 = await timed.project();
  const r2 = (await timed.start(p2.id)).data;
  assert.match((await timed.finish(r2.id)).error, /超时/);
});

test('workspace survives restart and unfinished tasks become retryable interruptions', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'muse-restart-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = await new Store(directory).load();
  await store.update(data => { data.projects.push({ id: 'p1', versions: [], messages: [{ role: 'user', runId: 'r1', status: 'running' }] }); data.runs.push({ id: 'r1', projectId: 'p1', status: 'running' }); });
  const restarted = await new Store(directory).load();
  assert.equal(restarted.data.runs[0].status, 'interrupted');
  assert.equal(restarted.data.projects[0].messages[0].status, 'interrupted');
  await writeFile(join(directory, 'workspace.json'), 'broken');
  await assert.rejects(() => new Store(directory).load(), /无法读取/);
  assert.equal(await readFile(join(directory, 'workspace.json'), 'utf8'), 'broken');
});

test('legacy import is atomic and idempotent; metadata edits persist', async t => {
  const f = await fixture(t, success);
  const id = randomUUID();
  const backup = { projects: [{ id, type: 'text', title: '原作品', messages: [{ role: 'user', text: '原需求' }], versions: [{ type: 'text', title: '原作品', direction: '样稿', text: '原文', demo: true }] }], memories: [{ type: 'text', text: '简短' }] };
  assert.equal((await f.request('/import', 'POST', backup)).status, 200);
  assert.equal((await f.request('/import', 'POST', backup)).data.projects.length, 1);
  await f.request(`/projects/${id}`, 'PATCH', { title: '新名字' });
  assert.equal((await f.request(`/projects/${id}`)).data.title, '新名字');
  await f.request(`/projects/${id}`, 'DELETE');
  assert.equal((await f.request('/import', 'POST', backup)).data.projects.length, 0, 'migration cannot resurrect deleted projects');
});

test('secrets, local files and cross-origin mutations are not exposed', async t => {
  const f = await fixture(t, success);
  const status = await f.request('/status');
  assert.equal(JSON.stringify(status).includes('test-secret'), false);
  assert.equal((await f.request('/projects', 'POST', { type: 'text', title: 'bad' }, { Origin: 'https://attacker.example' })).status, 403);
  const blockedHost = await new Promise((resolve, reject) => { const req = httpRequest(`${f.url}/api/workspace`, { headers: { Host: 'attacker.example' } }, res => { res.resume(); resolve(res.statusCode); }); req.on('error', reject); req.end(); });
  assert.equal(blockedHost, 403);
  for (const path of ['/.env', '/server/config.mjs', '/%2e%2e%2fpackage.json', '/lib/../../package.json']) assert.equal((await fetch(f.url + path)).status, 404);
  assert.equal((await f.request('/projects', 'POST', { type: 'unknown', title: 'bad' })).status, 400);
  assert.equal((await f.request('/projects', 'POST', { type: 'text', title: 'x'.repeat(101) })).status, 400);
});

test('SSE reconnect returns terminal state and disconnection does not cancel work', async t => {
  let release;
  const f = await fixture(t, { async run(args) { await new Promise(resolve => { release = resolve; }); return success.run(args); } });
  const p = await f.project();
  const run = (await f.start(p.id)).data;
  const controller = new AbortController();
  const response = await fetch(`${f.url}/api/runs/${run.id}/events`, { signal: controller.signal });
  assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');
  const reader = response.body.getReader();
  assert.match(new TextDecoder().decode((await reader.read()).value), /running/);
  controller.abort(); release();
  await f.finish(run.id);
  const replay = await fetch(`${f.url}/api/runs/${run.id}/events`);
  assert.match(await replay.text(), /completed/);
});

test('artifact format validation and exports cover all four media', () => {
  assert.throws(() => validateArtifact({ title: 'a', direction: 'b', html: '<h1>Hi</h1>', js: 'const = broken' }, 'ui'), /语法错误/);
  assert.throws(() => validateArtifact({ title: 'a', direction: 'b', slides: [] }, 'ppt'), /1–30/);
  assert.throws(() => validateArtifact({ title: 'a', direction: 'b', svg: '<script>bad</script>' }, 'image'), /SVG/);
  for (const [type, data] of Object.entries({ ui: { html: '<h1>Hi</h1>', css: 'h1{color:red}', js: 'document.title="Hi"' }, text: { text: '真实文案' }, ppt: { slides: [{ title: '第一页', body: '内容' }] }, image: { svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' } })) assert.equal(validateArtifact({ title: '作品', direction: '有用', ...data }, type).type, type);
  const html = uiHtml({ html: '<html><head></head><body><h1>Hi</h1></body></html>', css: 'h1{color:red}', js: 'window.answer=42' });
  assert.match(html, /<style>h1/); assert.match(html, /<script>window.answer/);
  assert.match(safePreview(html), /connect-src 'none'/);
});

test('real Pi SDK calls tools through an OpenAI-compatible endpoint and restores its session', { timeout: 60000 }, async t => {
  const observed = [];
  const mock = createServer(async (req, res) => {
    let text = ''; for await (const chunk of req) text += chunk;
    const payload = JSON.parse(text); observed.push(payload);
    const messages = payload.messages;
    const lastUser = messages.findLastIndex(m => m.role === 'user');
    const results = messages.slice(lastUser).filter(m => m.role === 'tool').length;
    const isFlash = payload.model === 'deepseek-v4-flash';
    const name = results === 0 ? 'get_task_context' : results === 1 ? (isFlash ? 'ask_clarification' : 'submit_artifact') : results === 2 && !isFlash ? 'inspect_artifact' : null;
    const content = isFlash ? { question: '测试澄清问题' } : results === 1 ? { title: 'SDK 验证', direction: '短句与具体内容', text: JSON.stringify(messages[lastUser].content).includes('修改') ? '# 第二版\n\n修改成功。' : '# 第一版\n\n生成成功。' } : {};
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const chunk = delta => ({ id: 'chatcmpl-test', object: 'chat.completion.chunk', created: 1, model: 'test-model', choices: [{ index: 0, delta, finish_reason: null }] });
    res.write(`data: ${JSON.stringify(chunk({ role: 'assistant' }))}\n\n`);
    res.write(`data: ${JSON.stringify(chunk(name ? { tool_calls: [{ index: 0, id: `call_${observed.length}`, type: 'function', function: { name, arguments: JSON.stringify(content) } }] } : { content: '作品已完成。' }))}\n\n`);
    const last = chunk({}); last.choices[0].finish_reason = name ? 'tool_calls' : 'stop';
    res.end(`data: ${JSON.stringify(last)}\n\ndata: [DONE]\n\n`);
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => mock.close(resolve)));
  const f = await fixture(t, null, { baseUrl: `http://127.0.0.1:${mock.address().port}/v1`, model: 'deepseek-v4-flash', textModel: 'deepseek-v4-pro', deepseek: true, timeoutMs: 50000, vision: false });
  const p = await f.project();
  const first = (await f.start(p.id, '写一段测试文案')).data;
  const final1 = await f.finish(first.id);
  assert.equal(final1.status, 'completed', final1.error);
  const second = (await f.start(p.id, '修改为第二版')).data;
  const final2 = await f.finish(second.id);
  assert.equal(final2.status, 'completed', final2.error);
  assert.equal(f.store.data.projects[0].versions.length, 2);
  assert.match(f.store.data.projects[0].versions[1].text, /第二版/);
  assert.ok(f.store.data.projects[0]._session.length > 5);
  assert.ok(observed.at(-1).messages.filter(m => m.role === 'user').length >= 2);
  const tools = observed[0].tools.map(t => t.function.name);
  assert.ok(tools.includes('submit_artifact'));
  assert.equal(tools.includes('bash'), false);
  assert.equal(tools.includes('read'), false);
  assert.ok(observed.every(payload => payload.model === 'deepseek-v4-pro'));
  assert.ok(observed.every(payload => payload.thinking?.type === 'disabled'));
  const ui = await f.project('ui');
  const clarification = (await f.start(ui.id, '等待具体需求')).data;
  assert.equal((await f.finish(clarification.id)).status, 'completed');
  assert.equal(observed.at(-1).model, 'deepseek-v4-flash');
  assert.equal(observed.at(-1).thinking.type, 'disabled');
});

test('plain conversation persists across media and can continue into creation without inventing versions', { timeout: 60000 }, async t => {
  const observed = [];
  const mock = createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body); observed.push(payload);
    const lastUser = payload.messages.findLastIndex(m => m.role === 'user');
    const prompt = JSON.stringify(payload.messages[lastUser].content);
    const hasResult = payload.messages.slice(lastUser).some(m => m.role === 'tool');
    const creating = /开始制作|坏作品/.test(prompt);
    const tool = creating && !hasResult;
    const args = prompt.includes('坏作品') ? { title: '缺少内容', direction: '测试' } : { title: '新文案', direction: '讨论后制作', text: '留一点时间，读一本书。' };
    const content = prompt.includes('写咖啡文案') ? '下面是咖啡店文案。\n\n---\n\n# 清晨咖啡\n\n给自己留三分钟。\n\n---\n\n**设计判断**：用具体场景展开。' : prompt.includes('改为夜读文案') ? '# 夜读\n\n留一盏灯，读一本书。' : prompt.includes('空回复') ? '  ' : prompt.includes('截断回复') ? '# 未写完\n\n还没有说完' : '你好！可以先聊聊你的想法。';
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const chunk = (delta, finish_reason = null) => ({ id: 'chat-conversation', object: 'chat.completion.chunk', created: 1, model: payload.model, choices: [{ index: 0, delta, finish_reason }] });
    res.write(`data: ${JSON.stringify(chunk({ role: 'assistant' }))}\n\n`);
    res.write(`data: ${JSON.stringify(chunk(tool ? { content: '正在制作。', tool_calls: [{ index: 0, id: `call_${observed.length}`, type: 'function', function: { name: 'submit_artifact', arguments: JSON.stringify(args) } }] } : { content }))}\n\n`);
    res.end(`data: ${JSON.stringify(chunk({}, tool ? 'tool_calls' : prompt.includes('截断回复') ? 'length' : 'stop'))}\n\ndata: [DONE]\n\n`);
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => mock.close(resolve)));
  const f = await fixture(t, null, { baseUrl: `http://127.0.0.1:${mock.address().port}/v1`, timeoutMs: 50000, vision: false });
  for (const type of ['ui', 'ppt', 'image', 'text']) {
    const p = await f.project(type);
    const greeting = (await f.start(p.id, '你好')).data;
    const result = await f.finish(greeting.id);
    assert.equal(result.status, 'completed', result.error);
    assert.equal(result.outcome, 'message');
    const saved = (await f.request(`/projects/${p.id}`)).data;
    assert.equal(saved.versions.length, 0);
    assert.match(saved.messages.at(-1).text, /你好/);
    assert.equal(saved.messages.at(-1).version, undefined);
    const discussion = (await f.start(p.id, '先聊一聊阅读的想法')).data;
    assert.equal((await f.finish(discussion.id)).status, 'completed');
    assert.ok(observed.at(-1).messages.some(m => m.role === 'assistant' && JSON.stringify(m.content).includes('你好')));
    if (type === 'text') {
      const creation = (await f.start(p.id, '开始制作文案')).data;
      assert.equal((await f.finish(creation.id)).outcome, 'artifact');
      const thanks = (await f.start(p.id, '谢谢')).data;
      assert.equal((await f.finish(thanks.id)).outcome, 'message');
      const restored = await new Store(f.directory).load();
      const project = restored.data.projects.find(item => item.id === p.id);
      assert.equal(project.versions.length, 1, 'chat must preserve the existing artifact');
      assert.equal(project.messages.at(-1).version, undefined);
      assert.ok(project._session.length > 1);
    }
  }
  const copyProject = await f.project('text');
  const copyRun = (await f.start(copyProject.id, '写咖啡文案')).data;
  assert.equal((await f.finish(copyRun.id)).outcome, 'artifact');
  const firstCopy = (await f.request(`/projects/${copyProject.id}`)).data;
  assert.equal(firstCopy.versions[0].text, '# 清晨咖啡\n\n给自己留三分钟。');
  assert.equal(firstCopy.versions[0].verification.format, true);
  assert.equal(firstCopy.messages.at(-1).version, 0);
  const changedCopy = (await f.start(copyProject.id, '改为夜读文案', { baseVersionId: firstCopy.versions[0].id })).data;
  assert.equal((await f.finish(changedCopy.id)).outcome, 'artifact');
  const copyThanks = (await f.start(copyProject.id, '谢谢')).data;
  assert.equal((await f.finish(copyThanks.id)).outcome, 'message');
  const restoredCopy = (await new Store(f.directory).load()).data.projects.find(item => item.id === copyProject.id);
  assert.equal(restoredCopy.versions.length, 2);
  assert.equal(restoredCopy.versions[1].text, '# 夜读\n\n留一盏灯，读一本书。');
  assert.equal(restoredCopy.versions[1].parentVersionId, firstCopy.versions[0].id);
  const p = await f.project('text');
  for (const prompt of ['空回复', '截断回复', '坏作品']) {
    const run = (await f.start(p.id, prompt)).data;
    assert.equal((await f.finish(run.id)).status, 'failed', 'empty, incomplete and invalid artifacts remain failures');
    assert.equal((await f.request(`/projects/${p.id}`)).data.versions.length, 0);
  }
});

test('streaming is visible before completion, reconnects with full text and separates assistant turns', async t => {
  let next, finish;
  const f = await fixture(t, { async run({ emit }) {
    emit({ replaceText: true, textDelta: '先了解需求。', progress: '正在回复' });
    await new Promise(resolve => { next = resolve; });
    emit({ replaceText: true, textDelta: '# 正式回复\n\n', progress: '正在回复' });
    emit({ textDelta: '甲'.repeat(17000) });
    await new Promise(resolve => { finish = resolve; });
    return { message: '# 正式回复\n\n' + '甲'.repeat(17000), session: [] };
  } });
  const p = await f.project();
  const run = (await f.start(p.id, '聊聊方向')).data;
  const controller = new AbortController();
  const response = await fetch(`${f.url}/api/runs/${run.id}/events`, { signal: controller.signal });
  const reader = response.body.getReader();
  const first = new TextDecoder().decode((await reader.read()).value);
  assert.match(first, /先了解需求/);
  assert.match(first, /"status":"running"/);
  controller.abort(); next();
  await new Promise(resolve => setImmediate(resolve));
  const snapshot = f.runs.snapshot(run.id);
  assert.ok(snapshot.text.startsWith('# 正式回复'));
  assert.equal(snapshot.text.includes('先了解需求'), false);
  assert.ok(snapshot.text.length > 17000, 'the start of a long reply must not be truncated');
  const reconnect = new AbortController();
  const replay = await fetch(`${f.url}/api/runs/${run.id}/events`, { signal: reconnect.signal });
  const replayChunk = new TextDecoder().decode((await replay.body.getReader().read()).value);
  assert.match(replayChunk, /正式回复/);
  reconnect.abort(); finish();
  assert.equal((await f.finish(run.id)).status, 'completed');
  assert.equal(f.runs.snapshot(run.id).text, '');
  assert.equal((await f.request(`/projects/${p.id}`)).data.messages.at(-1).text, snapshot.text);
});
