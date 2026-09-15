const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { initVault, readVault, parse, privateDir, updateDNA } = require('../scripts/vault');
const { recordRejection, recordPreference } = require('../scripts/slow_update');
const { migrate } = require('../scripts/migrate_vault');
const { scanTranscript } = require('../scripts/muse_sleep');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const vault = path.join(dir, 'private'); initVault(vault);
  return { dir, vault, file: path.join(vault, 'personal_dna.yaml') };
}
const feedback = { artifact: 'page', because: 'too sparse', principle: 'Use compact comparison rows', scope: 'research tables', source: 'session-1', exceptions: 'single metric posters' };
test('new vault has no author preferences and cannot be overwritten', t => {
  const f = fixture(t); const { dna, taboos } = readVault(f.vault);
  assert.deepEqual(dna.preferences, []); assert.deepEqual(dna.rejected_cases, []); assert.deepEqual(taboos.taboos, []);
  assert.throws(() => initVault(f.vault));
});
test('append to empty list, serialize special characters, and preserve backup', t => {
  const f = fixture(t); const before = fs.readFileSync(f.file, 'utf8');
  const artifact = 'C:\\project\\file "quote"\n第二行';
  const r = recordRejection({ ...feedback, artifact, vault: f.vault });
  assert.equal(r.changed, true);
  const saved = readVault(f.vault).dna.rejected_cases[0];
  assert.equal(saved.artifact, artifact); assert.equal(saved.status, 'candidate');
  assert.equal(saved.scope, feedback.scope); assert.equal(saved.exceptions, feedback.exceptions);
  assert.equal(fs.readFileSync(r.backup, 'utf8'), before);
});
test('same source is idempotent; multiple sources never automatically confirm', t => {
  const f = fixture(t);
  recordRejection({ ...feedback, vault: f.vault });
  const before = fs.readFileSync(f.file, 'utf8');
  assert.equal(recordRejection({ ...feedback, vault: f.vault }).changed, false);
  assert.equal(fs.readFileSync(f.file, 'utf8'), before);
  recordRejection({ ...feedback, vault: f.vault, source: 'session-2' });
  assert.equal(readVault(f.vault).dna.rejected_cases.length, 2);
  assert.ok(readVault(f.vault).dna.rejected_cases.every(r => r.status === 'candidate'));
});
test('confirmation is explicit and does not duplicate record', t => {
  const f = fixture(t);
  const input = { ...feedback, vault: f.vault, category: 'typography', key: 'density', value: 'compact' };
  recordPreference(input); recordPreference({ ...input, confirmed: true });
  const rows = readVault(f.vault).dna.preferences;
  assert.equal(rows.length, 1); assert.equal(rows[0].status, 'confirmed');
});
test('confirmation preserves newly supplied qualifications and omission does not erase them', t => {
  const f = fixture(t);
  const input = { vault: f.vault, category: 'typography', key: 'length', value: 'short', scope: 'reports', source: 'user' };
  recordPreference(input);
  recordPreference({ ...input, confirmed: true, because: 'scan faster', exceptions: 'long quotations are allowed' });
  const record = readVault(f.vault).dna.preferences[0];
  assert.equal(record.exceptions, 'long quotations are allowed'); assert.equal(record.because, 'scan faster');
  recordPreference(input);
  assert.equal(readVault(f.vault).dna.preferences[0].exceptions, 'long quotations are allowed');
  assert.equal(readVault(f.vault).dna.preferences[0].status, 'confirmed');
});
test('same key in different categories and scopes stays distinct', t => {
  const f = fixture(t);
  for (const [category, scope] of [['layout', 'table'], ['typography', 'table'], ['typography', 'poster']]) {
    recordPreference({ vault: f.vault, category, scope, key: 'tone', value: 'clear', source: 'user' });
  }
  assert.equal(readVault(f.vault).dna.preferences.length, 3);
});
test('missing evidence and invalid vault never modify files', t => {
  const f = fixture(t); const before = fs.readFileSync(f.file, 'utf8');
  assert.throws(() => recordRejection({ ...feedback, source: '', vault: f.vault }));
  assert.equal(fs.readFileSync(f.file, 'utf8'), before);
  fs.writeFileSync(f.file, 'version: "2.0.0"\npreferences: broken\n');
  const bad = fs.readFileSync(f.file, 'utf8');
  assert.throws(() => recordRejection({ ...feedback, vault: f.vault }));
  assert.equal(fs.readFileSync(f.file, 'utf8'), bad);
  assert.equal(fs.existsSync(path.join(f.vault, '.muse.lock')), false);
});
test('held lock blocks writes; transform failure releases its own lock', t => {
  const f = fixture(t); const lock = path.join(f.vault, '.muse.lock');
  fs.writeFileSync(lock, 'another writer');
  assert.throws(() => recordRejection({ ...feedback, vault: f.vault }));
  assert.equal(fs.readFileSync(lock, 'utf8'), 'another writer'); fs.unlinkSync(lock);
  assert.throws(() => updateDNA(f.vault, () => { throw new Error('interrupted'); }));
  assert.equal(fs.existsSync(lock), false); assert.equal(readVault(f.vault).dna.rejected_cases.length, 0);
});
test('reject missing/private-in-skill directory and aliases/duplicate YAML keys', t => {
  assert.throws(() => privateDir()); assert.throws(() => privateDir(path.join(__dirname, '../vault')));
  assert.throws(() => parse('key: first\nkey: second\n'));
  assert.throws(() => parse('a: &a [1]\nb: *a\n'));
  const f = fixture(t); const link = path.join(f.dir, 'skill-link');
  fs.symlinkSync(path.resolve(__dirname, '..'), link, 'dir');
  assert.throws(() => privateDir(path.join(link, 'private')));
});
test('migration recovers known legacy defect, preserves original, and does not confirm old preferences', t => {
  const f = fixture(t); const old = path.join(f.dir, 'old'); fs.mkdirSync(old);
  const original = 'version: "1.1.0"\ntypography:\n  font: "Example"\nrejected_cases:  - date: "2026-09-10"\n    artifact: "example"\n';
  fs.writeFileSync(path.join(old, 'personal_dna.yaml'), original);
  fs.writeFileSync(path.join(old, 'personal_taboos.yaml'), 'taboos:\n  ui_patterns: [example]\n');
  const output = path.join(f.dir, 'migrated'); const r = migrate(old, output);
  assert.equal(r.repairedKnownLegacySyntax, true);
  assert.equal(fs.readFileSync(path.join(old, 'personal_dna.yaml'), 'utf8'), original);
  const data = readVault(output).dna;
  assert.equal(data.version, '2.0.0'); assert.equal(data.legacy_import.data.typography.font, 'Example');
  assert.deepEqual(data.preferences, []); assert.equal(data.legacy_import.status, 'candidate');
  assert.equal(fs.readFileSync(path.join(output, 'legacy-personal_dna.yaml.bak'), 'utf8'), original);
  assert.throws(() => migrate(old, output));
});
test('single-quoted legacy version migrates and remains writable', t => {
  const f = fixture(t); const old = path.join(f.dir, 'old'); fs.mkdirSync(old);
  fs.writeFileSync(path.join(old, 'personal_dna.yaml'), "version: '1.0.0'\nrejected_cases: []\n");
  const output = path.join(f.dir, 'migrated'); migrate(old, output);
  assert.equal(readVault(output).dna.version, '2.0.0');
  recordRejection({ ...feedback, vault: output });
  assert.equal(readVault(output).dna.rejected_cases.length, 1);
});
test('backup failure does not publish a partial migration and retry works', t => {
  const f = fixture(t); const old = path.join(f.dir, 'old'); fs.mkdirSync(old);
  fs.writeFileSync(path.join(old, 'personal_dna.yaml'), 'version: "1.0.0"\n');
  const output = path.join(f.dir, 'migrated');
  const originalWrite = fs.writeFileSync;
  fs.writeFileSync = function(file, ...rest) {
    if (String(file).endsWith('legacy-personal_dna.yaml.bak')) throw new Error('simulated disk full');
    return originalWrite.call(fs, file, ...rest);
  };
  try { assert.throws(() => migrate(old, output)); }
  finally { fs.writeFileSync = originalWrite; }
  assert.equal(fs.existsSync(output), false);
  migrate(old, output); assert.equal(readVault(output).dna.version, '2.0.0');
});
test('unknown version and unrelated malformed YAML leave destination absent', t => {
  const f = fixture(t); const old = path.join(f.dir, 'old'); fs.mkdirSync(old);
  const output = path.join(f.dir, 'migrated');
  for (const value of ['version: "8.0.0"\n', 'version: "1.1.0"\nbroken: [']) {
    fs.writeFileSync(path.join(old, 'personal_dna.yaml'), value);
    assert.throws(() => migrate(old, output)); assert.equal(fs.existsSync(output), false);
  }
});
test('log extraction distinguishes review cues, supports role/content, and reports malformed lines', async t => {
  const f = fixture(t); const log = path.join(f.dir, 'log.jsonl');
  const data = [ { role: 'user', content: '金额算错了，重新计算' }, { role: 'user', content: '以后研究报告的布局紧凑' }, { type: 'USER_INPUT', content: '字号太小' }, { role: 'assistant', content: '颜色太亮' } ];
  fs.writeFileSync(log, data.map(x => JSON.stringify(x)).join('\n') + '\nnot json\n');
  const before = fs.readFileSync(f.file, 'utf8'); const r = await scanTranscript(log);
  assert.equal(r.findings.length, 2); assert.equal(r.findings[0].line, 2);
  assert.equal(r.malformedLines, 1); assert.equal(r.recognizedMessages, 3);
  assert.equal(fs.readFileSync(f.file, 'utf8'), before);
});
test('no log produces no synthetic feedback; --apply and missing flags fail', t => {
  const f = fixture(t); const script = path.resolve(__dirname, '../scripts/muse_sleep.js');
  const none = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(none.status, 0); assert.deepEqual(JSON.parse(none.stdout).findings, []);
  assert.notEqual(spawnSync(process.execPath, [script, '--apply']).status, 0);
  const update = path.resolve(__dirname, '../scripts/slow_update.js');
  assert.notEqual(spawnSync(process.execPath, [update, '--type', 'rejection', '--vault', f.vault]).status, 0);
  assert.equal(readVault(f.vault).dna.rejected_cases.length, 0);
});
