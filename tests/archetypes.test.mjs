import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { archetypes } from '../web/lib/archetypes.js';
import { readSelectedArchetype } from '../server/archetypes.mjs';
import { importProject, runInput, validateArtifact } from '../server/validation.mjs';
import { Store } from '../server/store.mjs';
import { Runs } from '../server/runs.mjs';

const rootDir = fileURLToPath(new URL('../', import.meta.url));

test('all ten built-in choices resolve to the actual Muse specifications', async () => {
  const files = (await readdir(join(rootDir, 'references/archetypes'))).filter(file => file.endsWith('.md'));
  assert.equal(archetypes.length, 10);
  assert.deepEqual(archetypes.map(item => `${item.id}.md`).sort(), files.sort());
  for (const item of archetypes) {
    const selected = await readSelectedArchetype(rootDir, item.id);
    assert.equal(selected.specification, await readFile(join(rootDir, item.path), 'utf8'));
    assert.ok(selected.supportingReferences.includes('references/visual_grammar.md'));
    assert.equal(runInput({ requestId: 'valid', prompt: '制作页面', archetypeId: item.id }).archetypeId, item.id);
  }
  assert.equal(await readSelectedArchetype(rootDir, null), null);
  for (const id of ['../../.env', 'unknown', '', 3, false, {}]) {
    assert.throws(() => runInput({ requestId: 'valid', prompt: '制作页面', archetypeId: id }));
  }
});

test('selection reaches generation and survives reopening, replacing and clearing without modifying taste', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'muse-archetypes-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = await new Store(directory).load();
  await store.update(data => {
    data.projects.push({ id: 'project', type: 'ui', title: '参考母体测试', versions: [], messages: [] });
    data.memories.push({ type: 'text', text: '保留我的偏好' });
  });
  const received = [];
  const runs = new Runs(store, { async run({ input }) {
    received.push(input.archetypeId || null);
    return { artifact: validateArtifact({ title: '作品', direction: '测试', html: '<h1>作品</h1>' }, 'ui'), message: '完成', session: [] };
  } }, { configured: true, timeoutMs: 3000 });
  t.after(() => runs.close());
  const choices = ['writer_atelier', 'tech_flagship_dark', null];
  for (const [index, archetypeId] of choices.entries()) {
    const run = await runs.start('project', runInput({ requestId: `run-${index}`, prompt: '制作页面', archetypeId }));
    await runs.active.get(run.id)?.done;
    assert.equal(runs.snapshot(run.id).status, 'completed');
    const restored = await new Store(directory).load();
    const project = restored.data.projects[0];
    assert.equal(project.archetypeId, archetypeId);
    assert.equal(project.messages.filter(m => m.role === 'user').at(-1).archetypeId, archetypeId);
    assert.equal(project.versions.at(-1).archetypeId, archetypeId);
    if (archetypeId) assert.equal(project.versions.at(-1).reference.path, `references/archetypes/${archetypeId}.md`);
    assert.equal(restored.data.memories.length, 1);
  }
  assert.deepEqual(received, choices);
  assert.equal(store.data.projects[0].versions[0].archetypeId, 'writer_atelier');
});

test('import retains per-message and per-version selections and legacy file references', () => {
  const project = importProject({ id: 'saved', type: 'text', title: '已存作品', archetypeId: 'writer_atelier',
    messages: [{ role: 'user', text: '想法', archetypeId: 'writer_atelier' }, { role: 'user', text: '旧参考', attachment: 'notes.md', reference: '原来的材料' }],
    versions: [{ title: '版本', direction: '说明', text: '内容', archetypeId: 'writer_atelier' }],
  });
  assert.equal(project.archetypeId, 'writer_atelier');
  assert.equal(project.messages[0].archetypeId, 'writer_atelier');
  assert.equal(project.versions[0].archetypeId, 'writer_atelier');
  assert.equal(project.messages[1].reference, '原来的材料');
});
