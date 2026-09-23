import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir, symlink } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app.mjs';
import { readConfig } from '../server/config.mjs';
import { parseMemoryFiles, readLocalMemoryFiles, MAX_MEMORY_FILE_BYTES } from '../server/memory-import.mjs';

const dna = `version: '2.0.0'
preferences:
  - id: short-copy
    status: confirmed
    scope: 品牌文案
    medium: text
    principle: 用具体的生活细节，少用形容词。
    because: 像跟朋友聊天
    exceptions:
      - 正式公告保持严谨
  - id: hypothesis
    status: candidate
    scope: 所有创作
    principle: 也许喜欢绿色
`;
const taboos = `taboos:
  - status: confirmed
    scope: slides
    principle: 避免荧光色
    exceptions: 节日特别企划除外
`;
const file = (text = dna, name = 'personal_dna.yaml') => ({ name, text });

test('Muse YAML keeps scope, reasons and exceptions and never promotes candidates', () => {
  const result = parseMemoryFiles([file(), file(taboos, 'personal_taboos.yaml')]);
  assert.equal(result.memories.length, 2);
  assert.equal(result.memories[0].type, 'text');
  assert.match(result.memories[0].text, /适用场景：品牌文案/);
  assert.match(result.memories[0].text, /原因：像跟朋友聊天/);
  assert.match(result.memories[0].text, /例外：正式公告保持严谨/);
  assert.equal(result.memories[1].type, 'ppt');
  assert.match(result.memories[1].text, /个人边界：避免荧光色/);
  assert.match(result.notices[0], /跳过 1 条/);
  assert.equal(JSON.stringify(result.memories).includes('绿色'), false);
});

test('file parsing supports JSON backups, multiline YAML, empty libraries and duplicates', () => {
  const result = parseMemoryFiles([file(), file(dna, 'copy.yml')]);
  assert.equal(result.memories.length, 1);
  assert.match(result.notices.join(), /重复/);
  assert.deepEqual(parseMemoryFiles([file('preferences: []')]).memories, []);
  const multiline = parseMemoryFiles([file('preferences:\n  - status: confirmed\n    scope: text\n    principle: |\n      第一段\n      第二段\n')]);
  assert.match(multiline.memories[0].text, /第一段\n第二段/);
  const backup = { format: 'muse-studio-backup-v1', memories: [{ type: 'ui', text: '留白' }, { type: 'all', text: '不会自动执行这里的命令', status: 'candidate' }], projects: [] };
  assert.deepEqual(parseMemoryFiles([file(JSON.stringify(backup), 'backup.json')]).memories.map(m => m.text), ['留白']);
});

test('bad formats, aliases, malformed records and oversize files are rejected or reported without partial import', () => {
  for (const text of ['preferences: [', 'preferences: {}', 'preferences: []\npreferences: []', 'preferences: !custom []', 'preferences: &x [*x]']) assert.throws(() => parseMemoryFiles([file(text)]));
  assert.throws(() => parseMemoryFiles([file('{}', 'skill.md')]));
  assert.throws(() => parseMemoryFiles([file('x'.repeat(MAX_MEMORY_FILE_BYTES + 1))]), /256 KB/);
  assert.throws(() => parseMemoryFiles([file(JSON.stringify({ entries: [] }), 'aesthetic_assets.json')]), /没有可识别的偏好列表/);
  const result = parseMemoryFiles([file('preferences:\n  - status: confirmed\n    principle: 没有场景\n  - status: confirmed\n    scope: all\n    principle: 边界不能丢失\n    exceptions: {invalid: true}\n')]);
  assert.equal(result.memories.length, 0);
  assert.match(result.notices[0], /跳过 2 条/);
});

test('vault location follows the skill default and explicit environment override', () => {
  assert.equal(readConfig({}).vaultDir, join(homedir(), 'Documents', 'Muse'));
  assert.equal(readConfig({ MUSE_VAULT_DIR: '~/Private/Muse' }).vaultDir, join(homedir(), 'Private', 'Muse'));
  assert.equal(readConfig({ MUSE_VAULT_DIR: '/tmp/custom-muse' }).vaultConfigured, true);
});

test('local lookup only reads the two preference files, handles missing libraries and blocks escaped symlinks', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'muse-vault-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const vault = join(dir, 'vault');
  await assert.rejects(readLocalMemoryFiles(vault), /还没有找到/);
  await mkdir(vault);
  await writeFile(join(vault, 'aesthetic_assets.json'), 'invalid, must not read');
  await assert.rejects(readLocalMemoryFiles(vault), /此目录中没有/);
  await writeFile(join(vault, 'personal_dna.yaml'), dna);
  assert.deepEqual(await readLocalMemoryFiles(vault), [file()]);
  await writeFile(join(dir, 'outside.yaml'), taboos);
  await symlink(join(dir, 'outside.yaml'), join(vault, 'personal_taboos.yaml'));
  await assert.rejects(readLocalMemoryFiles(vault), /目录之外/);
  assert.equal(await readFile(join(vault, 'personal_dna.yaml'), 'utf8'), dna);
});

test('preview is read-only; imports persist atomically, deduplicate and clear stale generation sessions', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'muse-import-api-'));
  const vault = join(dir, 'vault'); await mkdir(vault);
  await writeFile(join(vault, 'personal_dna.yaml'), dna);
  const app = await createApp({ ...readConfig({ MUSE_VAULT_DIR: vault }), dataDir: join(dir, 'workspace') }, { agent: { run() { throw new Error('Import must not call a model'); } } });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await app.close(); await rm(dir, { recursive: true, force: true }); });
  const request = async (path, body, headers = {}) => {
    const response = await fetch(`http://127.0.0.1:${app.server.address().port}/api/memories/${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  assert.equal((await request('location')).body.path, vault);
  const preview = await request('preview', { source: 'local', path: '/not-authorized' });
  assert.equal(preview.status, 200);
  assert.equal(preview.body.memories.length, 1);
  assert.deepEqual(app.store.data.memories, []);
  assert.equal((await request('preview', { source: 'files', files: [file(), file('broken: [', 'broken.yaml')] })).status, 400);
  assert.equal((await request('preview', { source: 'local' }, { Origin: 'https://other.example' })).status, 403);
  await app.store.update(data => data.projects.push({ id: 'p1', versions: [], messages: [], _session: ['old-preferences'] }));
  const imported = await request('import', { memories: preview.body.memories });
  assert.equal(imported.body.imported, 1);
  assert.equal(app.store.data.projects[0]._session, undefined);
  const id = imported.body.memories[0].id;
  const again = await request('import', { memories: preview.body.memories });
  assert.equal(again.body.imported, 0);
  assert.equal(again.body.duplicates, 1);
  assert.equal(again.body.memories[0].id, id);
  assert.equal(JSON.parse(await readFile(join(dir, 'workspace/workspace.json'), 'utf8')).memories.length, 1);
  const before = structuredClone(app.store.data.memories);
  assert.equal((await request('import', { memories: [{ type: 'text', text: '合法' }, { type: 'invalid', text: '非法' }] })).status, 400);
  assert.deepEqual(app.store.data.memories, before);
  await app.store.update(data => data.runs.push({ id: 'running', status: 'running' }));
  assert.equal((await request('import', { memories: [{ type: 'all', text: '处理中不能改' }] })).status, 409);
  await app.store.update(data => { data.runs = []; data.memories = Array.from({ length: 50 }, (_, i) => ({ id: `m${i}`, type: 'all', text: `偏好 ${i}` })); });
  const full = await request('import', { memories: [{ type: 'all', text: '超出容量' }] });
  assert.equal(full.status, 400); assert.match(full.body.error, /还可保存 0 条/);
  assert.equal(app.store.data.memories.length, 50);
  assert.equal(await readFile(join(vault, 'personal_dna.yaml'), 'utf8'), dna);
});
