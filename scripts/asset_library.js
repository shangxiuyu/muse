#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const { required, readVault, privateDir, vaultLocation, args } = require('./vault');
const CURRENT_SCHEMA_VERSION = 2;
const MEDIA = ['web', 'text', 'slides', 'image'];
const KINDS = ['reference', 'reaction', 'system', 'application'];
const SYSTEM_TYPES = ['aesthetic', 'author_voice'];
const SOURCES = ['personal', 'public', 'all'];
const REACTION_VALENCE = ['liked', 'disliked', 'mixed', 'neutral', 'unknown'];
const REACTION_STRENGTH = ['low', 'medium', 'high', 'unknown'];
const REASON_STATUS = ['user_stated', 'ai_inferred', 'co_formed', 'unknown'];
const REACTION_SUBJECTS = ['reference', 'application', 'artifact'];
const REACTION_TARGETS = ['whole', 'region', 'text', 'image', 'interaction', 'transition', 'sound', 'unknown'];
const CONTRADICTION_RELATIONS = ['conflicts', 'qualifies', 'contextualizes'];
const SKILL_ROOT = path.resolve(__dirname, '..');
function mapping(v, label) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error(`${label} must be an object`);
}
function keys(v, allowed, label) {
  mapping(v, label);
  for (const k of Object.keys(v)) if (!allowed.includes(k)) throw new Error(`Unknown ${label} field: ${k}`);
}
function strings(v, label, nonempty = false) {
  if (!Array.isArray(v) || nonempty && !v.length) throw new Error(`${label} must be an array${nonempty ? ' with entries' : ''}`);
  v.forEach(s => required(s, label));
}
function choice(v, options, label) {
  if (!options.includes(v)) throw new Error(`Invalid ${label}: ${v}`);
}
function integer(v, label, min = 1) {
  if (!Number.isSafeInteger(v) || v < min) throw new Error(`Invalid ${label}`);
}
function identifier(v) {
  if (typeof v !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,79}$/.test(v)) throw new Error('id must be 1–80 lowercase letters, digits, underscores or hyphens');
}
function stamp(v) {
  required(v, 'timestamp');
  if (!/^\d{4}-\d{2}-\d{2}T/.test(v) || !Number.isFinite(Date.parse(v))) throw new Error('Use an ISO timestamp');
}
function validateData(kind, d, options = {}) {
  const strictCurrent = options.strictCurrent === true;
  const shared = ['title', 'status', 'tags'];
  let extra;
  if (kind === 'reference') extra = ['source', 'observations', 'limits'];
  else if (kind === 'reaction') extra = ['subject', 'target', 'context', 'occurred_at', 'user_quote', 'valence', 'strength', 'felt_effect', 'reason', 'scope', 'contradictions'];
  else if (kind === 'system') extra = ['system_type', 'media', 'scope', 'intent', 'principles', 'limits'];
  else extra = ['system_id', 'system_revision', 'artifact', 'context', 'adaptations', 'outcome', 'feedback_source'];
  keys(d, [...shared, ...extra], kind);
  required(d.title, 'title'); strings(d.tags, 'tags');
  choice(d.status, kind === 'system' ? ['draft', 'ready', 'archived'] : ['active', 'archived'], 'status');
  if (kind === 'reference') {
    keys(d.source, ['kind', 'locator', 'captured_at', 'coverage'], 'source');
    choice(d.source.kind, ['website', 'image', 'article', 'mixed'], 'source kind');
    required(d.source.locator, 'source locator'); stamp(d.source.captured_at);
    choice(d.source.coverage, ['rendered', 'text-only', 'image-viewed', 'partial', 'unavailable'], 'coverage');
    if (!Array.isArray(d.observations)) throw new Error('observations must be an array');
    const seen = new Set();
    for (const o of d.observations) {
      keys(o, ['id', 'locator', 'observation'], 'observation'); identifier(o.id);
      required(o.locator, 'observation locator'); required(o.observation, 'observation');
      if (seen.has(o.id)) throw new Error('Duplicate observation id');
      seen.add(o.id);
    }
    if (d.source.coverage === 'unavailable' && d.observations.length) throw new Error('Unavailable sources cannot have observations');
    strings(d.limits, 'limits');
  } else if (kind === 'reaction') {
    keys(d.subject, ['kind', 'asset_id', 'asset_revision', 'locator'], 'reaction subject');
    choice(d.subject.kind, REACTION_SUBJECTS, 'reaction subject kind');
    if (d.subject.kind === 'artifact') {
      required(d.subject.locator, 'reaction artifact locator');
      if (d.subject.asset_id !== undefined || d.subject.asset_revision !== undefined) throw new Error('Artifact reaction subjects cannot use asset links');
    } else {
      identifier(d.subject.asset_id); integer(d.subject.asset_revision, 'reaction subject revision');
      if (d.subject.locator !== undefined) throw new Error('Linked reaction subjects cannot also use locator');
    }
    keys(d.target, ['kind', 'locator'], 'reaction target');
    choice(d.target.kind, REACTION_TARGETS, 'reaction target kind'); required(d.target.locator, 'reaction target locator');
    keys(d.context, ['medium', 'task', 'audience', 'environment', 'moment'], 'reaction context');
    choice(d.context.medium, MEDIA, 'reaction medium');
    for (const k of ['task', 'audience', 'environment', 'moment']) required(d.context[k], 'reaction context ' + k);
    if (d.occurred_at === undefined) {
      if (strictCurrent) throw new Error('reaction occurred_at is required for new or revised entries');
    } else if (d.occurred_at !== 'unknown') stamp(d.occurred_at);
    required(d.user_quote, 'reaction user quote');
    choice(d.valence, REACTION_VALENCE, 'reaction valence'); choice(d.strength, REACTION_STRENGTH, 'reaction strength');
    strings(d.felt_effect, 'reaction felt effect');
    keys(d.reason, ['status', 'text'], 'reaction reason'); choice(d.reason.status, REASON_STATUS, 'reaction reason status'); required(d.reason.text, 'reaction reason text');
    required(d.scope, 'reaction scope');
    if (!Array.isArray(d.contradictions)) throw new Error('reaction contradictions must be an array');
    for (const contradiction of d.contradictions) {
      if (typeof contradiction === 'string') {
        if (strictCurrent) throw new Error('New or revised reaction contradictions must use structured links');
        required(contradiction, 'legacy reaction contradiction');
        continue;
      }
      keys(contradiction, ['reaction_id', 'reaction_revision', 'relation', 'note'], 'reaction contradiction');
      identifier(contradiction.reaction_id); integer(contradiction.reaction_revision, 'contradiction reaction revision');
      choice(contradiction.relation, CONTRADICTION_RELATIONS, 'contradiction relation'); required(contradiction.note, 'contradiction note');
    }
  } else if (kind === 'system') {
    choice(d.system_type || 'aesthetic', SYSTEM_TYPES, 'system type');
    strings(d.media, 'media', true); d.media.forEach(m => choice(m, MEDIA, 'medium'));
    if (d.system_type === 'author_voice' && !d.media.includes('text')) throw new Error('Author voice systems must include text medium');
    required(d.scope, 'scope'); required(d.intent, 'intent'); strings(d.limits, 'limits');
    if (!Array.isArray(d.principles) || d.status === 'ready' && !d.principles.length) throw new Error('Ready systems require principles');
    for (const p of d.principles) {
      keys(p, ['name', 'rule', 'rationale', 'applies_when', 'avoid_when', 'confidence', 'evidence'], 'principle');
      for (const k of ['name', 'rule', 'rationale', 'applies_when', 'avoid_when']) required(p[k], k);
      choice(p.confidence, ['supported', 'provisional'], 'confidence');
      if (!Array.isArray(p.evidence) || !p.evidence.length) throw new Error('Every principle needs evidence');
      for (const e of p.evidence) {
        if (e.kind === 'reaction') {
          keys(e, ['kind', 'reaction_id', 'reaction_revision'], 'reaction evidence');
          identifier(e.reaction_id); integer(e.reaction_revision, 'reaction revision');
        } else {
          keys(e, e.kind === 'reference_observation'
            ? ['kind', 'reference_id', 'reference_revision', 'observation_id']
            : ['reference_id', 'reference_revision', 'observation_id'], 'reference evidence');
          if (e.kind !== undefined) choice(e.kind, ['reference_observation'], 'evidence kind');
          identifier(e.reference_id); integer(e.reference_revision, 'reference revision'); identifier(e.observation_id);
        }
      }
    }
  } else {
    identifier(d.system_id); integer(d.system_revision, 'system revision');
    for (const k of ['artifact', 'context', 'outcome', 'feedback_source']) required(d[k], k);
    strings(d.adaptations, 'adaptations');
  }
}
function snapshot(entry, revision) {
  return entry.revision === revision ? entry.data : entry.history.find(h => h.revision === revision)?.data;
}
function validateLibrary(lib) {
  keys(lib, ['schema_version', 'updated_at', 'entries'], 'library');
  if (![1, CURRENT_SCHEMA_VERSION].includes(lib.schema_version) || !Array.isArray(lib.entries)) throw new Error('Unsupported asset library schema');
  if (lib.updated_at !== null) stamp(lib.updated_at);
  const byId = new Map();
  for (const e of lib.entries) {
    keys(e, ['id', 'kind', 'revision', 'data', 'history', 'updated_at'], 'entry');
    identifier(e.id); choice(e.kind, KINDS, 'kind'); integer(e.revision, 'revision'); stamp(e.updated_at);
    if (byId.has(e.id)) throw new Error(`Duplicate entry: ${e.id}`);
    byId.set(e.id, e);
    if (!Array.isArray(e.history) || e.history.length !== e.revision - 1) throw new Error('Invalid revision history');
    e.history.forEach((h, i) => {
      keys(h, ['revision', 'data', 'updated_at'], 'history');
      if (h.revision !== i + 1) throw new Error('Nonsequential history');
      stamp(h.updated_at); validateData(e.kind, h.data);
    });
    validateData(e.kind, e.data);
  }
  for (const e of lib.entries) for (const d of [e.data, ...e.history.map(h => h.data)]) {
    if (e.kind === 'system') for (const p of d.principles) for (const link of p.evidence) {
      if (link.kind === 'reaction') {
        const reaction = byId.get(link.reaction_id);
        if (reaction?.kind !== 'reaction' || !snapshot(reaction, link.reaction_revision)) throw new Error(`Broken reaction evidence in ${e.id}`);
      } else {
        const ref = byId.get(link.reference_id);
        const source = ref?.kind === 'reference' && snapshot(ref, link.reference_revision);
        if (!source || !source.observations.some(o => o.id === link.observation_id)) throw new Error(`Broken evidence in ${e.id}`);
      }
    }
    if (e.kind === 'application') {
      const sys = byId.get(d.system_id);
      if (sys?.kind !== 'system' || !snapshot(sys, d.system_revision)) throw new Error(`Broken system link in ${e.id}`);
    }
    if (e.kind === 'reaction' && d.subject.kind !== 'artifact') {
      const subject = byId.get(d.subject.asset_id);
      if (subject?.kind !== d.subject.kind || !snapshot(subject, d.subject.asset_revision)) throw new Error(`Broken reaction subject in ${e.id}`);
    }
    if (e.kind === 'reaction') for (const contradiction of d.contradictions) {
      if (typeof contradiction === 'string') continue; // Read-only compatibility for transitional 4.3 records.
      const other = byId.get(contradiction.reaction_id);
      if (contradiction.reaction_id === e.id || other?.kind !== 'reaction' || !snapshot(other, contradiction.reaction_revision)) {
        throw new Error(`Broken contradiction link in ${e.id}`);
      }
    }
  }
  return lib;
}
function libraryFile(dir) {
  const file = path.join(dir, 'aesthetic_assets.json');
  if (fs.existsSync(file) && !fs.lstatSync(file).isFile()) throw new Error('Asset library must be a regular file, not a symlink');
  return file;
}
function readLibrary(input) {
  const dir = privateDir(vaultLocation(input));
  if (!fs.existsSync(dir)) return { schema_version: CURRENT_SCHEMA_VERSION, updated_at: null, entries: [] };
  readVault(dir);
  const file = libraryFile(dir);
  return validateLibrary(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { schema_version: CURRENT_SCHEMA_VERSION, updated_at: null, entries: [] });
}
function validatePublicLibrary(lib, root = SKILL_ROOT) {
  validateLibrary(lib);
  for (const e of lib.entries) {
    if (e.kind === 'application') throw new Error('Public catalog cannot contain personal applications');
    if (e.kind === 'reaction') throw new Error('Public catalog cannot contain personal reactions');
    if (e.kind === 'system' && [e.data, ...e.history.map(h => h.data)].some(d => d.system_type === 'author_voice')) {
      throw new Error('Public catalog cannot contain personal author voice profiles');
    }
    if (e.kind !== 'reference') continue;
    for (const d of [e.data, ...e.history.map(h => h.data)]) {
      for (const locator of [d.source.locator, ...d.observations.map(o => o.locator)]) {
        const relative = locator.split('#')[0];
        const file = path.resolve(root, relative);
        if (!relative.startsWith('exemplars/') || path.relative(root, file).startsWith('..') ||
            !fs.existsSync(file) || !fs.statSync(file).isFile() ||
            path.relative(fs.realpathSync(root), fs.realpathSync(file)).startsWith('..')) {
          throw new Error('Public teaching source must resolve inside skill exemplars: ' + locator);
        }
      }
    }
  }
  return lib;
}
function readPublicLibrary() {
  return validatePublicLibrary(JSON.parse(fs.readFileSync(path.join(SKILL_ROOT, 'references/public_cases.json'), 'utf8')));
}
function selectedLibraries(input, source = 'personal') {
  choice(source, SOURCES, 'source');
  if (source === 'public') return [{ source: 'public', library: readPublicLibrary() }];
  if (source === 'personal') return [{ source: 'personal', library: readLibrary(input) }];
  return [{ source: 'public', library: readPublicLibrary() }, { source: 'personal', library: readLibrary(input) }];
}
function put(input, bundle) {
  keys(bundle, ['entries'], 'bundle');
  if (!Array.isArray(bundle.entries) || !bundle.entries.length) throw new Error('Bundle must contain entries');
  const dir = privateDir(vaultLocation(input));
  readVault(dir); // Explicit initialization; never write into an unrelated directory.
  const lock = path.join(dir, '.muse.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx', 0o600); }
  catch (e) { if (e.code === 'EEXIST') throw new Error('Vault is locked'); throw e; }
  let temp;
  try {
    const lib = readLibrary(dir); const file = libraryFile(dir);
    const seen = new Set(); const changed = []; const unchanged = [];
    const now = new Date().toISOString();
    for (const item of bundle.entries) {
      keys(item, ['id', 'kind', 'expected_revision', 'data'], 'input entry');
      identifier(item.id); choice(item.kind, KINDS, 'kind'); integer(item.expected_revision, 'expected_revision', 0);
      validateData(item.kind, item.data);
      if (seen.has(item.id)) throw new Error('Duplicate entry in bundle');
      seen.add(item.id);
      const found = lib.entries.find(e => e.id === item.id);
      if (found && found.kind !== item.kind) throw new Error('Cannot change an asset kind');
      if (found && item.expected_revision <= found.revision && isDeepStrictEqual(found.data, item.data)) { unchanged.push(item.id); continue; }
      validateData(item.kind, item.data, { strictCurrent: true });
      if ((found?.revision || 0) !== item.expected_revision) throw new Error(`Revision conflict: ${item.id}; read current entry before revising`);
      if (found) {
        found.history.push({ revision: found.revision, data: found.data, updated_at: found.updated_at });
        found.data = item.data; found.revision++; found.updated_at = now;
      } else lib.entries.push({ id: item.id, kind: item.kind, revision: 1, data: item.data, history: [], updated_at: now });
      changed.push(item.id);
    }
    if (!changed.length) return { directory: dir, changed, unchanged };
    lib.schema_version = CURRENT_SCHEMA_VERSION;
    validateLibrary(lib);
    lib.updated_at = now;
    const serialized = JSON.stringify(lib, null, 2) + '\n';
    validateLibrary(JSON.parse(serialized));
    let backup;
    if (fs.existsSync(file)) {
      backup = `${file}.${Date.now()}.${crypto.randomUUID()}.bak`;
      fs.writeFileSync(backup, fs.readFileSync(file), { flag: 'wx', mode: 0o600 });
    }
    temp = `${file}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(temp, serialized, { flag: 'wx', mode: 0o600 });
    if (fs.readFileSync(temp, 'utf8') !== serialized) throw new Error('Write verification failed');
    fs.renameSync(temp, file);
    return { directory: dir, changed, unchanged, backup, revisions: changed.map(id => ({ id, revision: lib.entries.find(e => e.id === id).revision })) };
  } finally {
    if (temp && fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd); fs.unlinkSync(lock);
  }
}
function list(input, options = {}) {
  if (options.kind) choice(options.kind, KINDS, 'kind');
  if (options.medium) choice(options.medium, MEDIA, 'medium');
  if (options.valence) choice(options.valence, REACTION_VALENCE, 'reaction valence');
  const systemType = options.system_type || options['system-type'];
  if (systemType) choice(systemType, SYSTEM_TYPES, 'system type');
  const terms = (options.query || '').toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return selectedLibraries(input, options.source).flatMap(({ source, library }) => library.entries.filter(e => {
    if (!options.archived && e.data.status === 'archived') return false;
    if (options.kind && e.kind !== options.kind) return false;
    if (options.medium && !(e.kind === 'reaction' ? e.data.context.medium === options.medium : e.data.media?.includes(options.medium))) return false;
    if (options.valence && (e.kind !== 'reaction' || e.data.valence !== options.valence)) return false;
    if (systemType && (e.kind !== 'system' || (e.data.system_type || 'aesthetic') !== systemType)) return false;
    if (options.tag && !e.data.tags.includes(options.tag)) return false;
    const searchable = JSON.stringify(e.data).toLocaleLowerCase();
    return terms.every(t => searchable.includes(t));
  }).map(e => ({ id: e.id, kind: e.kind, revision: e.revision, title: e.data.title, status: e.data.status, tags: e.data.tags,
    ...(e.kind === 'system' ? { system_type: e.data.system_type || 'aesthetic', media: e.data.media, scope: e.data.scope, intent: e.data.intent, limits: e.data.limits } : {}),
    ...(e.kind === 'reaction' ? { medium: e.data.context.medium, valence: e.data.valence, strength: e.data.strength, target: e.data.target, scope: e.data.scope, reason_status: e.data.reason.status } : {}),
    ...(options.source ? { source } : {}) })));
}
function show(input, id, revision, options = {}) {
  identifier(id);
  const matches = selectedLibraries(input, options.source).flatMap(({ source, library }) =>
    library.entries.filter(e => e.id === id).map(entry => ({ source, entry })));
  if (!matches.length) throw new Error('Asset not found: ' + id);
  if (matches.length > 1) throw new Error('Ambiguous asset id: ' + id + '; choose --source public or personal');
  const { source, entry: e } = matches[0];
  const provenance = options.source ? { source } : {};
  if (revision === undefined) return { ...e, ...provenance };
  integer(revision, 'revision'); const data = snapshot(e, revision);
  if (!data) throw new Error('Revision not found');
  return { id: e.id, kind: e.kind, revision, data, ...provenance };
}
function run(argv) {
  const command = argv[0];
  const a = args(argv.slice(1), ['archived']);
  const allowed = { put: ['vault', 'file'], list: ['vault', 'kind', 'system-type', 'medium', 'valence', 'tag', 'query', 'archived', 'source'], show: ['vault', 'id', 'revision', 'source'], location: ['vault'] }[command];
  if (!allowed) throw new Error('Commands: location, put --file <bundle.json>, list, show --id <id>. See references/asset_schema.md');
  for (const k of Object.keys(a)) if (!allowed.includes(k)) throw new Error('Unknown flag: --' + k);
  let result;
  if (command === 'location') result = { directory: privateDir(vaultLocation(a.vault)) };
  if (command === 'put') result = put(a.vault, JSON.parse(fs.readFileSync(required(a.file, '--file'), 'utf8')));
  if (command === 'list') result = { matching: 'literal filters only; Agent must evaluate contextual fit', entries: list(a.vault, a) };
  if (command === 'show') result = show(a.vault, a.id, a.revision === undefined ? undefined : Number(a.revision), { source: a.source });
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) {
  try { run(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { validateLibrary, validatePublicLibrary, readLibrary, readPublicLibrary, put, list, show, run };
