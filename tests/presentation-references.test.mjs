import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { presentationStyles } from '../web/lib/presentation-styles.js';
import { archetypes, getArchetypesForMedia } from '../web/lib/archetypes.js';
import { readSelectedArchetype } from '../server/archetypes.mjs';
import { importProject, runInput, validateArtifact, AppError } from '../server/validation.mjs';
import { Store } from '../server/store.mjs';
import { Runs } from '../server/runs.mjs';
import { createApp } from '../server/app.mjs';
import { readConfig } from '../server/config.mjs';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const deck = { title: '演示', direction: '测试', slides: [{ title: '让内容决定形式', body: '一页一个观点', color: '#f5f2eb' }] };

test('PPT exposes five distinct references and loads only the chosen school plus CJK rules', async () => {
  assert.equal(presentationStyles.length, 5);
  assert.equal(new Set([...archetypes, ...presentationStyles].map(item => item.id)).size, 15);
  assert.deepEqual(getArchetypesForMedia('ppt'), presentationStyles);
  assert.deepEqual(getArchetypesForMedia('ui'), archetypes);
  assert.ok(getArchetypesForMedia('text').every(item => item.media === 'text'));
  assert.deepEqual(getArchetypesForMedia('image'), []);
  for (const item of presentationStyles) {
    const selected = await readSelectedArchetype(rootDir, item.id);
    const source = await readFile(join(rootDir, item.path), 'utf8');
    assert.equal(selected.media, 'ppt');
    assert.equal(selected.section, item.section);
    assert.ok(selected.specification.startsWith(`## ${item.section}\n`));
    assert.match(selected.specification, /精确 Design Tokens/);
    assert.match(selected.specification, /演示端中文配对/);
    assert.match(selected.specification, /中文字体必须显式写进字体栈/);
    assert.ok(source.includes(selected.specification.split('\n\n## 🈶')[0]));
    for (const other of presentationStyles.filter(s => s.id !== item.id)) {
      assert.ok(!selected.specification.includes(`## ${other.section}\n`));
    }
    for (const path of selected.supportingReferences) await readFile(join(rootDir, path), 'utf8');
    assert.equal(runInput({ requestId: 'valid', prompt: '演示', archetypeId: item.id }).archetypeId, item.id);
    const preview = await readFile(join(rootDir, 'web', item.preview));
    assert.equal(preview.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(preview.readUInt32BE(16), 1280);
    assert.equal(preview.readUInt32BE(20), 720);
  }
  for (const id of ['ppt_unknown', '../../.env', '', {}, false]) {
    assert.throws(() => runInput({ requestId: 'valid', prompt: '演示', archetypeId: id }));
    await assert.rejects(readSelectedArchetype(rootDir, id));
  }
});

test('PPT references persist across generation, reopen, replacement and removal, with media validation', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'muse-ppt-reference-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = await new Store(dir).load();
  await store.update(data => {
    for (const type of ['ppt', 'ui', 'text', 'image']) data.projects.push({ id: type, type, title: '测试', messages: [], versions: [] });
    data.memories.push({ type: 'ppt', text: '保留我的偏好' });
  });
  const received = [];
  const runs = new Runs(store, { async run({ input }) {
    received.push(input.archetypeId || null);
    return { artifact: validateArtifact(deck, 'ppt'), message: '完成', session: [] };
  } }, { configured: true, timeoutMs: 3000 });
  t.after(() => runs.close());
  const choices = [...presentationStyles.map(s => s.id), null];
  for (const [index, archetypeId] of choices.entries()) {
    const input = runInput({ requestId: `choice-${index}`, prompt: '制作演示', archetypeId });
    const run = await runs.start('ppt', input);
    await runs.active.get(run.id)?.done;
    assert.equal(runs.snapshot(run.id).status, 'completed');
    const restored = await new Store(dir).load();
    const project = restored.data.projects[0];
    assert.equal(project.archetypeId, archetypeId);
    assert.equal(project.messages.filter(m => m.role === 'user').at(-1).archetypeId, archetypeId);
    assert.equal(project.versions.at(-1).archetypeId, archetypeId);
    if (archetypeId) assert.equal(project.versions.at(-1).reference.section, presentationStyles[index].section);
    else assert.equal(project.versions.at(-1).reference, undefined);
    assert.deepEqual(restored.data.memories, [{ type: 'ppt', text: '保留我的偏好' }]);
    assert.equal((await runs.start('ppt', input)).id, run.id);
  }
  assert.deepEqual(received, choices);
  assert.equal(store.data.projects[0].versions[0].archetypeId, choices[0]);
  for (const type of ['ui', 'text', 'image']) {
    await assert.rejects(runs.start(type, runInput({ requestId: 'wrong-media', prompt: '测试', archetypeId: choices[0] })), /演示参考只能/);
    assert.equal(store.data.projects.find(p => p.id === type).messages.length, 0);
  }
});

test('imports preserve PPT choices and legacy references while rejecting cross-media choices at every level', () => {
  const input = { id: 'saved', type: 'ppt', title: '演示', archetypeId: 'ppt_editorial_linen',
    messages: [{ role: 'user', text: '想法', archetypeId: 'ppt_tech_flagship' }],
    versions: [{ ...deck, archetypeId: 'ppt_swiss_navy' }],
  };
  const project = importProject(input);
  assert.equal(project.archetypeId, input.archetypeId);
  assert.equal(project.messages[0].archetypeId, input.messages[0].archetypeId);
  assert.equal(project.versions[0].archetypeId, input.versions[0].archetypeId);
  assert.equal(importProject({ ...input, archetypeId: 'writer_atelier' }).archetypeId, 'writer_atelier');
  const text = { id: 'text', type: 'text', title: '文案', messages: [], versions: [] };
  assert.throws(() => importProject({ ...text, archetypeId: input.archetypeId }), /演示参考只能/);
  assert.throws(() => importProject({ ...text, messages: input.messages }), /演示参考只能/);
  assert.throws(() => importProject({ ...text, versions: [{ title: '文案', direction: '测试', text: '内容', archetypeId: input.archetypeId }] }), /演示参考只能/);
});

test('failed and cancelled PPT runs retain the reference for retry without creating a version', async t => {
  for (const cancel of [false, true]) {
    const dir = await mkdtemp(join(tmpdir(), 'muse-ppt-failure-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const store = await new Store(dir).load();
    await store.update(data => data.projects.push({ id: 'ppt', type: 'ppt', title: '演示', versions: [], messages: [] }));
    const runs = new Runs(store, { async run({ signal }) {
      if (!cancel) throw new AppError('测试失败');
      await new Promise((_, reject) => {
        if (signal.aborted) reject(signal.reason);
        else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    } }, { configured: true, timeoutMs: 3000 });
    t.after(() => runs.close());
    const run = await runs.start('ppt', runInput({ requestId: 'retry', prompt: '演示', archetypeId: 'ppt_memphis' }));
    if (cancel) await runs.cancel(run.id);
    else await runs.active.get(run.id)?.done;
    assert.equal(runs.snapshot(run.id).status, cancel ? 'cancelled' : 'failed');
    assert.equal(store.data.projects[0].archetypeId, 'ppt_memphis');
    assert.equal(store.data.projects[0].messages[0].archetypeId, 'ppt_memphis');
    assert.equal(store.data.projects[0].versions.length, 0);
  }
});

test('real Pi context receives selected presentation specification and clears it on the next run', { timeout: 60000 }, async t => {
  const contexts = [];
  const mock = createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    const latest = payload.messages.slice(payload.messages.findLastIndex(m => m.role === 'user'));
    const result = latest.find(m => m.role === 'tool');
    if (result) contexts.push(JSON.parse(result.content));
    const chunk = (delta, finish_reason = null) => ({ id: 'ppt-context', object: 'chat.completion.chunk', created: 1, model: payload.model, choices: [{ index: 0, delta, finish_reason }] });
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify(chunk({ role: 'assistant' }))}\n\n`);
    const delta = result ? { content: '已读取演示参考。' } : { tool_calls: [{ index: 0, id: `context_${contexts.length}`, type: 'function', function: { name: 'get_task_context', arguments: '{}' } }] };
    res.write(`data: ${JSON.stringify(chunk(delta))}\n\n`);
    res.end(`data: ${JSON.stringify(chunk({}, result ? 'stop' : 'tool_calls'))}\n\ndata: [DONE]\n\n`);
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => mock.close(resolve)));
  const dir = await mkdtemp(join(tmpdir(), 'muse-ppt-context-'));
  const config = { ...readConfig({ MUSE_API_KEY: 'test', MUSE_MODEL: 'test', MUSE_API: 'openai-completions', MUSE_BASE_URL: `http://127.0.0.1:${mock.address().port}/v1` }), dataDir: dir, vision: false, timeoutMs: 45000 };
  const app = await createApp(config);
  t.after(async () => { await app.close(); await rm(dir, { recursive: true, force: true }); });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  await app.store.update(data => data.projects.push({ id: 'ppt', type: 'ppt', title: '测试', messages: [], versions: [] }));
  for (const [index, archetypeId] of ['ppt_editorial_linen', null].entries()) {
    const res = await fetch(`http://127.0.0.1:${app.server.address().port}/api/projects/ppt/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: `test-${index}`, prompt: '先聊聊这份演示', archetypeId }) });
    assert.equal(res.status, 202);
    const run = await res.json();
    await app.runs.active.get(run.id)?.done;
    assert.equal(app.runs.snapshot(run.id).status, 'completed');
  }
  assert.equal(contexts.length, 2);
  assert.deepEqual(contexts[0].selectedArchetype, await readSelectedArchetype(rootDir, 'ppt_editorial_linen'));
  assert.equal(contexts[1].selectedArchetype, null);
});
