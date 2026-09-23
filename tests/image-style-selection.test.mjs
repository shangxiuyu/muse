import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { imageStyles } from '../web/lib/image-styles.js';
import { readSelectedImageStyle } from '../server/image-styles.mjs';
import { importProject, runInput, validateArtifact, AppError } from '../server/validation.mjs';
import { Store } from '../server/store.mjs';
import { Runs } from '../server/runs.mjs';
import { createApp } from '../server/app.mjs';
import { readConfig } from '../server/config.mjs';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const picture = { title: '图片', direction: '测试', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="10"/></svg>' };

test('exactly 15 choices have real JPEG previews and resolve full style specifications', async () => {
  const files = (await readdir(join(rootDir, 'references/image_styles'))).filter(f => f.endsWith('.md'));
  assert.equal(imageStyles.length, 15);
  assert.deepEqual(imageStyles.map(s => `${s.id}.md`).sort(), files.sort());
  for (const style of imageStyles) {
    const selected = await readSelectedImageStyle(rootDir, style.id);
    assert.equal(selected.specification, await readFile(join(rootDir, style.path), 'utf8'));
    assert.equal(runInput({ requestId: 'valid', prompt: '画一个花园', imageStyleId: style.id }).imageStyleId, style.id);
    const preview = await readFile(join(rootDir, 'web', style.preview));
    assert.equal(preview.readUInt16BE(0), 0xffd8);
    assert.ok(preview.length > 10000 && preview.length < 500000, `${style.id}: optimized real image`);
  }
  assert.equal(await readSelectedImageStyle(rootDir, null), null);
  for (const id of ['../../.env', '../image_styles.md', 'unknown', '', 4, false, {}]) {
    assert.throws(() => runInput({ requestId: 'valid', prompt: '测试', imageStyleId: id }));
    await assert.rejects(readSelectedImageStyle(rootDir, id));
  }
});

test('all choices reach generation and persist per version; clearing does not change taste', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'muse-style-choice-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = await new Store(dir).load();
  await store.update(data => {
    data.projects.push({ id: 'image', type: 'image', title: '图片测试', versions: [], messages: [] });
    data.projects.push({ id: 'text', type: 'text', title: '文案测试', versions: [], messages: [] });
    data.memories.push({ type: 'image', text: '保留我的偏好' });
  });
  const received = [];
  const runs = new Runs(store, { async run({ input }) {
    received.push(input.imageStyleId || null);
    return { artifact: validateArtifact(picture, 'image'), message: '完成', session: [] };
  } }, { configured: true, timeoutMs: 3000 });
  t.after(() => runs.close());
  const choices = [...imageStyles.map(s => s.id), null];
  for (const [i, imageStyleId] of choices.entries()) {
    const run = await runs.start('image', runInput({ requestId: `choice-${i}`, prompt: '花园', imageStyleId }));
    await runs.active.get(run.id)?.done;
    assert.equal(runs.snapshot(run.id).status, 'completed');
    const restored = await new Store(dir).load();
    const project = restored.data.projects[0];
    assert.equal(project.imageStyleId, imageStyleId);
    assert.equal(project.messages.filter(m => m.role === 'user').at(-1).imageStyleId, imageStyleId);
    assert.equal(project.versions.at(-1).imageStyleId, imageStyleId);
    if (imageStyleId) assert.equal(project.versions.at(-1).styleReference.path, `references/image_styles/${imageStyleId}.md`);
    assert.deepEqual(restored.data.memories, [{ type: 'image', text: '保留我的偏好' }]);
  }
  assert.deepEqual(received, choices);
  assert.equal(store.data.projects[0].versions[0].imageStyleId, choices[0]);
  await assert.rejects(runs.start('text', runInput({ requestId: 'wrong-media', prompt: '测试', imageStyleId: 'watercolor' })), /图片风格只能/);
});

test('failed and cancelled runs retain their selected style without creating a version', async t => {
  for (const cancel of [false, true]) {
    const dir = await mkdtemp(join(tmpdir(), 'muse-style-failure-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const store = await new Store(dir).load();
    await store.update(data => data.projects.push({ id: 'image', type: 'image', title: '图片测试', versions: [], messages: [] }));
    const runs = new Runs(store, { async run({ signal }) {
      if (!cancel) throw new AppError('测试失败');
      await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
    } }, { configured: true, timeoutMs: 3000 });
    t.after(() => runs.close());
    const run = await runs.start('image', runInput({ requestId: 'run', prompt: '保留输入', imageStyleId: 'claymation' }));
    if (cancel) await runs.cancel(run.id); else await runs.active.get(run.id)?.done;
    assert.equal(runs.snapshot(run.id).status, cancel ? 'cancelled' : 'failed');
    assert.equal(store.data.projects[0].messages[0].imageStyleId, 'claymation');
    assert.equal(store.data.projects[0].versions.length, 0);
  }
});

test('backup import retains image styles and old projects remain compatible', () => {
  const project = importProject({ id: 'saved', type: 'image', title: '已存图片', imageStyleId: 'watercolor',
    messages: [{ role: 'user', text: '想法', imageStyleId: 'watercolor' }], versions: [{ ...picture, imageStyleId: 'watercolor' }] });
  assert.equal(project.imageStyleId, 'watercolor');
  assert.equal(project.messages[0].imageStyleId, 'watercolor');
  assert.equal(project.versions[0].imageStyleId, 'watercolor');
  assert.equal(project.versions[0].styleReference.path, 'references/image_styles/watercolor.md');
  assert.equal(importProject({ id: 'old', type: 'image', title: '旧图片', messages: [], versions: [picture] }).imageStyleId, null);
});

test('real Pi context receives selected style specification and clears it on the next run', { timeout: 60000 }, async t => {
  const contexts = [];
  const mock = createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    const latest = payload.messages.slice(payload.messages.findLastIndex(m => m.role === 'user'));
    const result = latest.find(m => m.role === 'tool');
    if (result) contexts.push(JSON.parse(result.content));
    const chunk = (delta, finish_reason = null) => ({ id: 'style-context', object: 'chat.completion.chunk', created: 1, model: payload.model, choices: [{ index: 0, delta, finish_reason }] });
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify(chunk({ role: 'assistant' }))}\n\n`);
    const delta = result ? { content: '已读取当前画法。' } : { tool_calls: [{ index: 0, id: `context_${contexts.length}`, type: 'function', function: { name: 'get_task_context', arguments: '{}' } }] };
    res.write(`data: ${JSON.stringify(chunk(delta))}\n\n`);
    res.end(`data: ${JSON.stringify(chunk({}, result ? 'stop' : 'tool_calls'))}\n\ndata: [DONE]\n\n`);
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => mock.close(resolve)));
  const dir = await mkdtemp(join(tmpdir(), 'muse-style-context-'));
  const config = { ...readConfig({ MUSE_API_KEY: 'test', MUSE_MODEL: 'test', MUSE_API: 'openai-completions', MUSE_BASE_URL: `http://127.0.0.1:${mock.address().port}/v1` }), dataDir: dir, vision: false, timeoutMs: 45000 };
  const app = await createApp(config);
  t.after(async () => { await app.close(); await rm(dir, { recursive: true, force: true }); });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  for (const style of imageStyles) {
    const res = await fetch(`${base}/assets/image-styles/${style.id}.jpg`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/jpeg');
  }
  await app.store.update(data => data.projects.push({ id: 'image', type: 'image', title: '测试', messages: [], versions: [] }));
  for (const [index, imageStyleId] of ['blueprint', null].entries()) {
    const res = await fetch(`${base}/api/projects/image/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: `test-${index}`, prompt: '先聊聊这张图', imageStyleId }) });
    assert.equal(res.status, 202);
    const run = await res.json();
    await app.runs.active.get(run.id)?.done;
    assert.equal(app.runs.snapshot(run.id).status, 'completed');
  }
  assert.equal(contexts.length, 2);
  assert.equal(contexts[0].selectedImageStyle.id, 'blueprint');
  assert.equal(contexts[0].selectedImageStyle.specification, await readFile(join(rootDir, 'references/image_styles/blueprint.md'), 'utf8'));
  assert.equal(contexts[1].selectedImageStyle, null);
});
