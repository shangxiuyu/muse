import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { textStyles } from '../web/lib/text-styles.js';
import { archetypes, getArchetype, getArchetypesForMedia, getActiveArchetype } from '../web/lib/archetypes.js';
import { readSelectedArchetype } from '../server/archetypes.mjs';
import { importProject, runInput, validateArtifact, AppError } from '../server/validation.mjs';
import { Store } from '../server/store.mjs';
import { Runs } from '../server/runs.mjs';
import { createApp } from '../server/app.mjs';
import { readConfig } from '../server/config.mjs';
import { buildSourceFiles } from '../web/lib/source-export.js';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const article = { title: '文案', direction: '测试', text: '# 读书笔记\n\n留下你的想法。' };

test('writing offers eight dedicated references with matching samples and complete writing specifications', async () => {
  assert.equal(textStyles.length, 8);
  assert.equal(new Set([...archetypes, ...textStyles].map(item => item.id)).size, 18);
  assert.deepEqual(getArchetypesForMedia('text'), textStyles);
  assert.deepEqual(textStyles.map(s => `${s.id}.md`).sort(), (await readdir(join(rootDir, 'references/text_styles'))).sort());
  for (const item of textStyles) {
    assert.equal(getArchetype(item.id), item);
    const selected = await readSelectedArchetype(rootDir, item.id);
    assert.equal(selected.media, 'text');
    assert.equal(selected.specification, await readFile(join(rootDir, item.path), 'utf8'));
    assert.ok(selected.specification.includes(item.sample));
    for (const heading of ['语气', '信息推进', '句式与节奏', '写作边界']) assert.ok(selected.specification.includes(`## ${heading}`));
    assert.doesNotMatch(selected.scope, /色彩|材质|字体/);
    for (const path of selected.supportingReferences) await readFile(join(rootDir, path), 'utf8');
  }
  assert.equal(getActiveArchetype('writer_atelier', 'text'), null);
  assert.equal(getActiveArchetype('text_companion', 'ui'), null);
  assert.equal(getActiveArchetype('text_companion', 'text'), textStyles[1]);
  assert.equal(getActiveArchetype('writer_atelier', 'ppt')?.id, 'writer_atelier', 'legacy PPT remains usable');
});

test('writing references persist, replace, clear and export without changing taste; cross-media requests cannot run', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'muse-text-reference-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = await new Store(dir).load();
  await store.update(data => {
    for (const type of ['text', 'ui', 'ppt', 'image']) data.projects.push({ id: type, type, title: '测试', messages: [], versions: [] });
    data.memories.push({ type: 'text', text: '保留我的偏好' });
  });
  const received = [];
  const runs = new Runs(store, { async run({ input }) {
    received.push(input.archetypeId || null);
    return { artifact: validateArtifact(article, 'text'), message: '完成', session: [] };
  } }, { configured: true, timeoutMs: 3000 });
  t.after(() => runs.close());
  const choices = [...textStyles.map(s => s.id), null];
  for (const [index, archetypeId] of choices.entries()) {
    const run = await runs.start('text', runInput({ requestId: `choice-${index}`, prompt: '写一段文案', archetypeId }));
    await runs.active.get(run.id)?.done;
    assert.equal(runs.snapshot(run.id).status, 'completed');
    const project = (await new Store(dir).load()).data.projects[0];
    assert.equal(project.archetypeId, archetypeId);
    assert.equal(project.messages.filter(m => m.role === 'user').at(-1).archetypeId, archetypeId);
    assert.equal(project.versions.at(-1).archetypeId, archetypeId);
    if (archetypeId) {
      const reference = await readSelectedArchetype(rootDir, archetypeId);
      assert.equal(project.versions.at(-1).reference.path, reference.path);
      const files = buildSourceFiles(project.versions.at(-1), { references: [reference] });
      assert.equal(files[`design-system/references/${archetypeId}.md`], reference.specification);
      assert.equal(files['content.md'], article.text);
    } else assert.equal(project.versions.at(-1).reference, undefined);
  }
  assert.deepEqual(received, choices);
  assert.deepEqual(store.data.memories, [{ type: 'text', text: '保留我的偏好' }]);
  for (const type of ['ui', 'ppt', 'image']) {
    await assert.rejects(runs.start(type, runInput({ requestId: `wrong-${type}`, prompt: '测试', archetypeId: 'text_clear' })), /文案参考只能/);
    assert.equal(store.data.projects.find(p => p.id === type).messages.length, 0);
  }
  const length = store.data.projects[0].messages.length;
  await assert.rejects(runs.start('text', runInput({ requestId: 'visual', prompt: '文案', archetypeId: 'writer_atelier' })), /请选择|请为文案选择/);
  assert.equal(store.data.projects[0].messages.length, length);
});

test('imports retain both writing references and historical visual references without reviving them as writing defaults', () => {
  for (const id of ['text_story', 'writer_atelier']) {
    const project = importProject({ id: 'saved', type: 'text', title: '文案', archetypeId: id,
      versions: [{ ...article, archetypeId: id }], messages: [{ role: 'user', text: '写文案', archetypeId: id }] });
    assert.equal(project.archetypeId, id);
    assert.equal(project.messages[0].archetypeId, id);
    assert.equal(project.versions[0].archetypeId, id);
    assert.equal(getActiveArchetype(project.archetypeId, project.type)?.id || null, id === 'text_story' ? id : null);
  }
  for (const field of ['project', 'messages', 'versions']) {
    const input = { id: 'saved', type: 'ui', title: 'UI', messages: [], versions: [] };
    if (field === 'project') input.archetypeId = 'text_story';
    if (field === 'messages') input.messages = [{ role: 'user', text: '内容', archetypeId: 'text_story' }];
    if (field === 'versions') input.versions = [{ title: '网页', direction: '测试', html: '<h1>页面</h1>', archetypeId: 'text_story' }];
    assert.throws(() => importProject(input), /文案参考只能/);
  }
});

test('failed and cancelled writing runs retain the selected reference and draft for retry', async t => {
  for (const cancel of [false, true]) {
    const dir = await mkdtemp(join(tmpdir(), 'muse-text-retry-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const store = await new Store(dir).load();
    await store.update(data => data.projects.push({ id: 'text', type: 'text', title: '文案', versions: [], messages: [] }));
    const runs = new Runs(store, { async run({ signal }) {
      if (!cancel) throw new AppError('测试失败');
      await new Promise((_, reject) => {
        if (signal.aborted) reject(signal.reason);
        else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    } }, { configured: true, timeoutMs: 3000 });
    t.after(() => runs.close());
    const run = await runs.start('text', runInput({ requestId: 'retry', prompt: '保留这段想法', archetypeId: 'text_companion' }));
    if (cancel) await runs.cancel(run.id);
    else await runs.active.get(run.id)?.done;
    assert.equal(runs.snapshot(run.id).status, cancel ? 'cancelled' : 'failed');
    assert.equal(store.data.projects[0].archetypeId, 'text_companion');
    assert.equal(store.data.projects[0].messages[0].text, '保留这段想法');
    assert.equal(store.data.projects[0].messages[0].archetypeId, 'text_companion');
    assert.equal(store.data.projects[0].versions.length, 0);
  }
});

test('real Pi context receives selected writing specification and clears it on the next run', { timeout: 60000 }, async t => {
  const contexts = [];
  const mock = createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    const latest = payload.messages.slice(payload.messages.findLastIndex(m => m.role === 'user'));
    const result = latest.find(m => m.role === 'tool');
    if (result) contexts.push(JSON.parse(result.content));
    const chunk = (delta, finish_reason = null) => ({ id: 'text-context', object: 'chat.completion.chunk', created: 1, model: payload.model, choices: [{ index: 0, delta, finish_reason }] });
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify(chunk({ role: 'assistant' }))}\n\n`);
    const delta = result ? { content: '已读取文案参考。' } : { tool_calls: [{ index: 0, id: `context_${contexts.length}`, type: 'function', function: { name: 'get_task_context', arguments: '{}' } }] };
    res.write(`data: ${JSON.stringify(chunk(delta))}\n\n`);
    res.end(`data: ${JSON.stringify(chunk({}, result ? 'stop' : 'tool_calls'))}\n\ndata: [DONE]\n\n`);
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => mock.close(resolve)));
  const dir = await mkdtemp(join(tmpdir(), 'muse-text-context-'));
  const config = { ...readConfig({ MUSE_API_KEY: 'test', MUSE_MODEL: 'test', MUSE_API: 'openai-completions', MUSE_BASE_URL: `http://127.0.0.1:${mock.address().port}/v1` }), dataDir: dir, vision: false, timeoutMs: 45000 };
  const app = await createApp(config);
  t.after(async () => { await app.close(); await rm(dir, { recursive: true, force: true }); });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  await app.store.update(data => data.projects.push({ id: 'text', type: 'text', title: '测试', messages: [], versions: [] }));
  for (const [index, archetypeId] of ['text_companion', null].entries()) {
    const res = await fetch(`http://127.0.0.1:${app.server.address().port}/api/projects/text/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: `test-${index}`, prompt: '先聊聊这份文案', archetypeId }) });
    assert.equal(res.status, 202);
    const run = await res.json();
    await app.runs.active.get(run.id)?.done;
    assert.equal(app.runs.snapshot(run.id).status, 'completed');
  }
  assert.equal(contexts.length, 2);
  assert.deepEqual(contexts[0].selectedArchetype, await readSelectedArchetype(rootDir, 'text_companion'));
  assert.equal(contexts[1].selectedArchetype, null);
});
