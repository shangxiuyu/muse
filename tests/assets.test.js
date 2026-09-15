const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { initVault, readVault, vaultLocation } = require('../scripts/vault');
const { put, list, show, readLibrary, readPublicLibrary, validatePublicLibrary } = require('../scripts/asset_library');
const template = require('../references/example_asset_bundle.json');
function bundle() { return structuredClone(template); }
function voiceBundle() {
  const b = bundle();
  b.entries[0].id = 'author-samples';
  b.entries[0].data.title = 'Author samples';
  b.entries[1].id = 'author-voice';
  b.entries[1].data.title = 'Author voice for project notes';
  b.entries[1].data.system_type = 'author_voice';
  b.entries[1].data.scope = 'Project notes by this author';
  b.entries[1].data.intent = 'Preserve direct judgment without copying signature phrases';
  b.entries[1].data.principles[0].evidence[0].reference_id = 'author-samples';
  return b;
}
function reactionBundle() {
  const reference = bundle().entries[0];
  return { entries: [reference, { id: 'reaction-repair-pause', kind: 'reaction', expected_revision: 0, data: {
    title: 'Paused at the repaired rim', status: 'active', tags: ['修补', '停留'],
    subject: { kind: 'reference', asset_id: reference.id, asset_revision: 1 },
    target: { kind: 'text', locator: '第一段：裂开的杯沿' },
    context: { medium: 'text', task: '阅读人物叙事', audience: '用户本人', environment: '桌面阅读', moment: '第一次完整阅读' },
    occurred_at: '2026-09-13T10:00:00+08:00',
    user_quote: '我说不清为什么，但这里让我停住了。', valence: 'liked', strength: 'high', felt_effect: ['停留', '亲近'],
    reason: { status: 'unknown', text: 'unknown' }, scope: '当前人物叙事阅读；是否迁移到其他文本未知', contradictions: []
  } }] };
}
function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-assets-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, 'private'); initVault(dir); return { dir, root };
}
function revision(dir, id, change) {
  const e = show(dir, id); change(e.data);
  return { entries: [{ id: e.id, kind: e.kind, expected_revision: e.revision, data: e.data }] };
}
test('reference and system are saved together, deduplicated and never become preferences', t => {
  const { dir } = setup(t); const before = readVault(dir);
  assert.equal(put(dir, bundle()).changed.length, 2);
  assert.equal(put(dir, bundle()).changed.length, 0);
  assert.equal(readLibrary(dir).entries.length, 2);
  assert.deepEqual(readVault(dir), before);
  assert.equal(fs.statSync(path.join(dir, 'aesthetic_assets.json')).mode & 0o777, 0o600);
});
test('reaction is first-class evidence, preserves unknown reasons and never mutates preferences', t => {
  const { dir } = setup(t); const before = readVault(dir);
  const saved = put(dir, reactionBundle());
  assert.deepEqual(saved.changed, ['teaching-repair-text', 'reaction-repair-pause']);
  const reactions = list(dir, { kind: 'reaction', medium: 'text', valence: 'liked' });
  assert.equal(reactions.length, 1);
  assert.equal(reactions[0].reason_status, 'unknown');
  assert.equal(reactions[0].target.locator, '第一段：裂开的杯沿');
  const full = show(dir, 'reaction-repair-pause');
  assert.equal(full.data.user_quote, '我说不清为什么，但这里让我停住了。');
  assert.equal(full.data.occurred_at, '2026-09-13T10:00:00+08:00');
  assert.equal(full.data.reason.text, 'unknown');
  assert.deepEqual(readVault(dir), before);
});
test('reaction subjects and interpretation boundaries fail atomically when invalid', t => {
  const { dir } = setup(t);
  for (const mutate of [
    d => { d.subject.asset_revision = 99; },
    d => { d.reason.status = 'certain'; },
    d => { d.context.medium = 'screen'; },
    d => { d.occurred_at = 'sometime'; },
    d => { d.target.locator = ''; }
  ]) {
    const b = reactionBundle(); mutate(b.entries[1].data);
    assert.throws(() => put(dir, b));
    assert.equal(readLibrary(dir).entries.length, 0);
  }
});
test('systems can cite reaction revisions as first-class evidence', t => {
  const { dir } = setup(t); const b = reactionBundle();
  b.entries.push({ id: 'pause-as-relationship', kind: 'system', expected_revision: 0, data: {
    title: 'Pause as a reading relationship', status: 'draft', tags: ['停顿'], system_type: 'aesthetic', media: ['text'],
    scope: '人物叙事中的局部阅读节奏', intent: '把一次真实停留作为待验证的形式线索',
    principles: [{ name: '让修补动作获得停顿', rule: '在具体动作之后保留一次节奏停顿', rationale: '用户曾在该处产生明确停留，但原因仍未知', applies_when: '人物叙事需要让动作被看见', avoid_when: '信息需连续快速扫描', confidence: 'provisional', evidence: [{ kind: 'reaction', reaction_id: 'reaction-repair-pause', reaction_revision: 1 }] }],
    limits: ['只有一次反应，尚未证明可迁移']
  }});
  put(dir, b);
  const evidence = show(dir, 'pause-as-relationship').data.principles[0].evidence[0];
  assert.deepEqual(evidence, { kind: 'reaction', reaction_id: 'reaction-repair-pause', reaction_revision: 1 });
  const invalid = revision(dir, 'pause-as-relationship', d => { d.principles[0].evidence[0].reaction_revision = 99; });
  assert.throws(() => put(dir, invalid), /Broken reaction evidence/);
  assert.equal(show(dir, 'pause-as-relationship').revision, 1);
});
test('structured contradictions remain contextual and point to real reaction revisions', t => {
  const { dir } = setup(t); const b = reactionBundle();
  const second = structuredClone(b.entries[1]);
  second.id = 'reaction-fast-scan-density';
  second.data.title = 'Density obstructed quick entry';
  second.data.context = { medium: 'web', task: '手机快速记账', audience: '用户本人', environment: '手机单手操作', moment: '准备快速完成一笔记录' };
  second.data.occurred_at = '2026-09-13T11:00:00+08:00';
  second.data.user_quote = '这么密让我喘不过气，我只想赶快记完。';
  second.data.valence = 'disliked';
  second.data.felt_effect = ['压迫'];
  second.data.scope = '手机快速记账任务';
  second.data.contradictions = [{ reaction_id: 'reaction-repair-pause', reaction_revision: 1, relation: 'contextualizes', note: '不同媒介与任务中的密度反应不能合并为全局规则' }];
  b.entries.push(second);
  put(dir, b);
  assert.equal(show(dir, second.id).data.contradictions[0].relation, 'contextualizes');
  const invalid = revision(dir, second.id, d => { d.contradictions[0].reaction_id = 'missing-reaction'; });
  assert.throws(() => put(dir, invalid), /Broken contradiction link/);
});
test('new reactions require occurrence time and structured contradictions', t => {
  const { dir } = setup(t);
  for (const mutate of [
    d => { delete d.occurred_at; },
    d => { d.contradictions = ['another response differs']; }
  ]) {
    const b = reactionBundle(); mutate(b.entries[1].data);
    assert.throws(() => put(dir, b));
    assert.equal(readLibrary(dir).entries.length, 0);
  }
});
test('schema v1 libraries remain readable and upgrade to v2 on the next real write', t => {
  const { dir } = setup(t); const file = path.join(dir, 'aesthetic_assets.json');
  const now = '2026-09-13T02:00:00.000Z';
  fs.writeFileSync(file, JSON.stringify({ schema_version: 1, updated_at: now, entries: [] }));
  assert.equal(readLibrary(dir).schema_version, 1);
  put(dir, bundle());
  assert.equal(readLibrary(dir).schema_version, 2);
});
test('transitional 4.3 reactions stay readable while new writes upgrade the library', t => {
  const { dir } = setup(t); const file = path.join(dir, 'aesthetic_assets.json');
  const now = '2026-09-13T02:00:00.000Z'; const legacy = reactionBundle();
  delete legacy.entries[1].data.occurred_at;
  legacy.entries[1].data.contradictions = ['A prior contextual reaction differed'];
  const entries = legacy.entries.map(item => ({ id: item.id, kind: item.kind, revision: 1, data: item.data, history: [], updated_at: now }));
  fs.writeFileSync(file, JSON.stringify({ schema_version: 1, updated_at: now, entries }));
  assert.equal(readLibrary(dir).entries.find(e => e.kind === 'reaction').data.occurred_at, undefined);
  assert.deepEqual(put(dir, legacy).unchanged, ['teaching-repair-text', 'reaction-repair-pause']);
  const result = put(dir, bundle());
  assert.deepEqual(result.changed, ['teaching-action-before-meaning']);
  const upgraded = readLibrary(dir);
  assert.equal(upgraded.schema_version, 2);
  assert.equal(typeof upgraded.entries.find(e => e.kind === 'reaction').data.contradictions[0], 'string');
});
test('reaction can address an explicit artifact without inventing an asset link', t => {
  const { dir } = setup(t); const b = reactionBundle();
  b.entries = [b.entries[1]];
  b.entries[0].id = 'reaction-live-artifact';
  b.entries[0].data.subject = { kind: 'artifact', locator: '/private/project/final-homepage.html' };
  b.entries[0].data.target = { kind: 'interaction', locator: '保存完成后的反馈' };
  b.entries[0].data.valence = 'mixed'; b.entries[0].data.strength = 'medium';
  put(dir, b);
  assert.equal(show(dir, 'reaction-live-artifact').data.subject.kind, 'artifact');
  const invalid = revision(dir, 'reaction-live-artifact', d => { d.subject.asset_id = 'made-up'; });
  assert.throws(() => put(dir, invalid), /cannot use asset links/);
});
test('author voice is a typed personal asset, not an implicit preference or public method', t => {
  const { dir } = setup(t); const before = readVault(dir);
  put(dir, voiceBundle());
  const voices = list(dir, { kind: 'system', system_type: 'author_voice', medium: 'text' });
  assert.equal(voices.length, 1);
  assert.equal(voices[0].id, 'author-voice');
  assert.equal(voices[0].system_type, 'author_voice');
  assert.equal(list(dir, { kind: 'system', system_type: 'aesthetic' }).length, 0);
  assert.deepEqual(readVault(dir), before);

  const noText = voiceBundle(); noText.entries[1].data.media = ['image'];
  assert.throws(() => put(dir, noText), /must include text/);
  assert.throws(() => list(dir, { system_type: 'persona' }), /Invalid system type/);

  const publicVoice = structuredClone(readPublicLibrary());
  publicVoice.entries.find(e => e.kind === 'system' && e.data.media.includes('text')).data.system_type = 'author_voice';
  assert.throws(() => validatePublicLibrary(publicVoice), /cannot contain personal author voice/);
  const publicReaction = structuredClone(readPublicLibrary());
  const personalReaction = reactionBundle().entries[1];
  personalReaction.data.subject = { kind: 'artifact', locator: '/private/example/output.html' };
  publicReaction.entries.push({ id: personalReaction.id, kind: personalReaction.kind, revision: 1, data: personalReaction.data, history: [], updated_at: new Date().toISOString() });
  assert.throws(() => validatePublicLibrary(publicReaction), /cannot contain personal reactions/);
});
test('missing observation and malformed entry reject the whole batch without partial publication', t => {
  const { dir } = setup(t); const b = bundle();
  b.entries[1].data.principles[0].evidence[0].observation_id = 'missing';
  assert.throws(() => put(dir, b), /Broken evidence/);
  assert.equal(readLibrary(dir).entries.length, 0);
  assert.equal(fs.existsSync(path.join(dir, 'aesthetic_assets.json')), false);
  const wrong = bundle(); wrong.entries[1].data.preferred = true;
  assert.throws(() => put(dir, wrong), /Unknown/);
  assert.equal(fs.existsSync(path.join(dir, '.muse.lock')), false);
});
test('revision history pins evidence even after source observations change', t => {
  const { dir } = setup(t); put(dir, bundle());
  put(dir, revision(dir, 'teaching-repair-text', data => { data.observations = []; data.limits.push('new snapshot unavailable'); }));
  assert.equal(show(dir, 'teaching-repair-text').revision, 2);
  assert.equal(show(dir, 'teaching-repair-text', 1).data.observations.length, 1);
  assert.equal(readLibrary(dir).entries.length, 2);
  const update = revision(dir, 'teaching-action-before-meaning', d => { d.principles[0].evidence[0].reference_revision = 2; });
  assert.throws(() => put(dir, update), /Broken evidence/);
  assert.equal(show(dir, 'teaching-action-before-meaning').revision, 1);
});
test('stale writes fail, prior content and backup survive valid revisions', t => {
  const { dir } = setup(t); put(dir, bundle());
  const id = 'teaching-action-before-meaning';
  const old = revision(dir, id, data => { data.intent = 'stale edit'; });
  const before = fs.readFileSync(path.join(dir, 'aesthetic_assets.json'), 'utf8');
  const result = put(dir, revision(dir, id, data => { data.limits.push('Only handcraft narration'); }));
  assert.equal(fs.readFileSync(result.backup, 'utf8'), before);
  assert.throws(() => put(dir, old), /Revision conflict/);
  assert.equal(show(dir, id).revision, 2);
  assert.equal(show(dir, id, 1).data.limits.length, 1);
});
test('archive hides normal retrieval and preserves historical application links', t => {
  const { dir } = setup(t); put(dir, bundle());
  const application = { entries: [{ id: 'use-1', kind: 'application', expected_revision: 0, data: {
    title: 'Temporary trial', status: 'active', tags: [], system_id: 'teaching-action-before-meaning', system_revision: 1,
    artifact: 'temporary-example.md', context: 'Workshop opening', adaptations: ['Use only given facts'], outcome: '未验证', feedback_source: '尚无用户反馈'
  } }] };
  put(dir, application);
  put(dir, revision(dir, 'teaching-action-before-meaning', d => { d.status = 'archived'; }));
  assert.equal(list(dir, { kind: 'system' }).length, 0);
  assert.equal(list(dir, { kind: 'system', archived: true }).length, 1);
  assert.equal(show(dir, 'use-1').data.system_revision, 1);
  const broken = structuredClone(application); broken.entries[0].id = 'use-2'; broken.entries[0].data.system_revision = 99;
  assert.throws(() => put(dir, broken), /Broken system link/);
});
test('list filters scope and tags literally; empty and cross-medium results remain honest', t => {
  const { dir } = setup(t); put(dir, bundle());
  assert.equal(list(dir, { kind: 'system', medium: 'text', query: '具体动作' }).length, 1);
  assert.equal(list(dir, { kind: 'system', medium: 'web' }).length, 0);
  assert.equal(list(dir, { kind: 'system', query: '并不存在的同义词' }).length, 0);
  assert.equal(list(dir, { kind: 'system', tag: '教学' }).length, 1);
  assert.throws(() => list(dir, { medium: 'typo' }), /Invalid/);
});
test('read of missing library creates nothing; invalid existing directory is not initialized', t => {
  const { root } = setup(t); const missing = path.join(root, 'absent');
  assert.equal(list(missing).length, 0); assert.equal(fs.existsSync(missing), false);
  assert.throws(() => put(root, bundle()));
  assert.equal(fs.existsSync(path.join(root, 'aesthetic_assets.json')), false);
});
test('lock contention and corrupt data fail without overwriting or clearing someone else’s lock', t => {
  const { dir } = setup(t); const lock = path.join(dir, '.muse.lock');
  fs.writeFileSync(lock, 'other writer');
  assert.throws(() => put(dir, bundle()), /locked/); assert.equal(fs.readFileSync(lock, 'utf8'), 'other writer');
  fs.unlinkSync(lock); const file = path.join(dir, 'aesthetic_assets.json'); fs.writeFileSync(file, '{broken');
  assert.throws(() => put(dir, bundle())); assert.equal(fs.readFileSync(file, 'utf8'), '{broken');
  assert.equal(fs.existsSync(lock), false);
});
test('failed atomic replacement retains original library and releases own resources', t => {
  const { dir } = setup(t); put(dir, bundle());
  const file = path.join(dir, 'aesthetic_assets.json'); const before = fs.readFileSync(file, 'utf8');
  const update = revision(dir, 'teaching-action-before-meaning', d => { d.intent = 'new intent'; });
  const rename = fs.renameSync;
  try {
    fs.renameSync = () => { throw new Error('Injected disk failure'); };
    assert.throws(() => put(dir, update), /Injected disk failure/);
  } finally { fs.renameSync = rename; }
  assert.equal(fs.readFileSync(file, 'utf8'), before);
  assert.equal(fs.readdirSync(dir).some(n => n.endsWith('.tmp') || n === '.muse.lock'), false);
});
test('library symlinks cannot redirect writes into another file', t => {
  const { dir, root } = setup(t); const outside = path.join(root, 'other.json'); fs.writeFileSync(outside, 'private');
  fs.symlinkSync(outside, path.join(dir, 'aesthetic_assets.json'));
  assert.throws(() => put(dir, bundle()), /regular file/); assert.equal(fs.readFileSync(outside, 'utf8'), 'private');
});
test('CLI performs the documented save, retrieve and version flow', t => {
  const { dir, root } = setup(t); const file = path.join(root, 'bundle.json'); fs.writeFileSync(file, JSON.stringify(bundle()));
  const call = (...params) => spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/asset_library.js'), ...params, '--vault', dir], { encoding: 'utf8' });
  const saved = call('put', '--file', file); assert.equal(saved.status, 0, saved.stderr);
  const listed = call('list', '--kind', 'system'); assert.equal(listed.status, 0, listed.stderr);
  assert.equal(JSON.parse(listed.stdout).entries.length, 1);
  const shown = call('show', '--id', 'teaching-repair-text', '--revision', '1'); assert.equal(shown.status, 0, shown.stderr);
  assert.equal(JSON.parse(shown.stdout).data.observations.length, 1);
  assert.notEqual(call('list', '--unknown', 'x').status, 0);
});
test('CLI filters personal author voice separately from ordinary aesthetic systems', t => {
  const { dir, root } = setup(t);
  const file = path.join(root, 'voice.json'); fs.writeFileSync(file, JSON.stringify(voiceBundle()));
  const script = path.resolve(__dirname, '../scripts/asset_library.js');
  const call = (...params) => spawnSync(process.execPath, [script, ...params, '--vault', dir], { encoding: 'utf8' });
  assert.equal(call('put', '--file', file).status, 0);
  const result = call('list', '--kind', 'system', '--system-type', 'author_voice', '--medium', 'text');
  assert.equal(result.status, 0, result.stderr);
  const entries = JSON.parse(result.stdout).entries;
  assert.equal(entries.length, 1);
  assert.equal(entries[0].system_type, 'author_voice');
});
test('CLI stores and filters reactions by medium and valence', t => {
  const { dir, root } = setup(t); const file = path.join(root, 'reaction.json'); fs.writeFileSync(file, JSON.stringify(reactionBundle()));
  const script = path.resolve(__dirname, '../scripts/asset_library.js');
  const call = (...params) => spawnSync(process.execPath, [script, ...params, '--vault', dir], { encoding: 'utf8' });
  assert.equal(call('put', '--file', file).status, 0);
  const found = call('list', '--kind', 'reaction', '--medium', 'text', '--valence', 'liked');
  assert.equal(found.status, 0, found.stderr);
  assert.equal(JSON.parse(found.stdout).entries[0].id, 'reaction-repair-pause');
  assert.equal(JSON.parse(call('list', '--kind', 'reaction', '--valence', 'disliked').stdout).entries.length, 0);
  assert.notEqual(call('list', '--valence', 'love').status, 0);
});
test('location resolves explicit then environment then stable user default without mutations', () => {
  const before = process.env.MUSE_VAULT_DIR;
  try {
    process.env.MUSE_VAULT_DIR = '/tmp/custom-muse-location';
    assert.equal(vaultLocation('/tmp/explicit'), '/tmp/explicit');
    assert.equal(vaultLocation(), '/tmp/custom-muse-location');
    delete process.env.MUSE_VAULT_DIR;
    assert.equal(vaultLocation(), path.join(os.homedir(), 'Documents', 'Muse'));
  } finally { if (before === undefined) delete process.env.MUSE_VAULT_DIR; else process.env.MUSE_VAULT_DIR = before; }
});

test('public reads work without a private vault and return traceable teaching systems', t => {
  const { root } = setup(t); const absent = path.join(root, 'never-created');
  const systems = list(absent, { source: 'public', kind: 'system', medium: 'web' });
  assert.ok(systems.length >= 4);
  assert.ok(systems.every(e => e.source === 'public'));
  const e = show(absent, systems[0].id, 1, { source: 'public' });
  const link = e.data.principles[0].evidence[0];
  const ref = show(absent, link.reference_id, link.reference_revision, { source: 'public' });
  assert.ok(ref.data.observations.some(o => o.id === link.observation_id));
  const textSystems = list(absent, { source: 'public', kind: 'system', medium: 'text' });
  assert.ok(textSystems.length >= 4);
  assert.ok(textSystems.every(e => e.source === 'public' && e.media.includes('text')));
  assert.equal(ref.data.source.coverage, 'text-only');
  assert.equal(fs.existsSync(absent), false);
  // A public-only read must not inspect or repair unrelated private data.
  assert.equal(list(root, { source: 'public', kind: 'system', tag: '账单' }).length, 1);
  assert.throws(() => list(root, { source: 'all' }));
});
test('combined results preserve source identity and refuse ambiguous show', t => {
  const { dir } = setup(t);
  const publicRef = readPublicLibrary().entries.find(e => e.kind === 'reference');
  const personal = structuredClone(publicRef.data); personal.title = 'Personal namesake';
  put(dir, { entries: [{ id: publicRef.id, kind: 'reference', expected_revision: 0, data: personal }] });
  const combined = list(dir, { source: 'all', kind: 'reference' }).filter(e => e.id === publicRef.id);
  assert.deepEqual(combined.map(e => e.source).sort(), ['personal', 'public']);
  assert.throws(() => show(dir, publicRef.id, undefined, { source: 'all' }), /Ambiguous/);
  assert.equal(show(dir, publicRef.id).data.title, 'Personal namesake');
  assert.equal(show(dir, publicRef.id, undefined, { source: 'personal' }).source, 'personal');
  assert.notEqual(show(dir, publicRef.id, undefined, { source: 'public' }).data.title, 'Personal namesake');
  assert.equal(list(dir).length, 1);
  assert.equal(Object.hasOwn(list(dir)[0], 'source'), false);
});
test('public catalog validates evidence and confines source paths to shipped exemplars', () => {
  const lib = readPublicLibrary();
  const badEvidence = structuredClone(lib);
  badEvidence.entries.find(e => e.kind === 'system').data.principles[0].evidence[0].observation_id = 'absent';
  assert.throws(() => validatePublicLibrary(badEvidence), /Broken evidence/);
  for (const locator of ['exemplars/ui/missing.md', 'exemplars/../../README.md']) {
    const badPath = structuredClone(lib);
    badPath.entries.find(e => e.kind === 'reference').data.source.locator = locator;
    assert.throws(() => validatePublicLibrary(badPath), /Public teaching source/);
  }
});
test('source is explicit, validated and read-only at the CLI boundary', t => {
  const { root } = setup(t); const absent = path.join(root, 'absent');
  const script = path.resolve(__dirname, '../scripts/asset_library.js');
  const call = (...params) => spawnSync(process.execPath, [script, ...params, '--vault', absent], { encoding: 'utf8' });
  for (const source of ['public', 'all']) {
    const result = call('list', '--source', source, '--kind', 'system');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).entries.length, readPublicLibrary().entries.filter(e => e.kind === 'system').length);
  }
  const empty = call('list', '--source', 'personal');
  assert.equal(empty.status, 0, empty.stderr);
  assert.equal(JSON.parse(empty.stdout).entries.length, 0);
  const shown = call('show', '--source', 'public', '--id', 'public-ui-task-hierarchy');
  assert.equal(shown.status, 0, shown.stderr);
  assert.equal(JSON.parse(shown.stdout).source, 'public');
  for (const command of ['list', 'show']) {
    const result = call(command, '--source', 'publci', ...(command === 'show' ? ['--id', 'some-id'] : []));
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Invalid source/);
  }
  const rejected = call('put', '--source', 'public', '--file', 'unused.json');
  assert.notEqual(rejected.status, 0); assert.match(rejected.stderr, /Unknown flag/);
  assert.equal(fs.existsSync(absent), false);
});
