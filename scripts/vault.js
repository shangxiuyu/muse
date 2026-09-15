'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const YAML = require('yaml');
const ROOT = path.resolve(__dirname, '..');
const VERSION = '2.0.0';
function vaultLocation(input) {
  return input || process.env.MUSE_VAULT_DIR || path.join(require('node:os').homedir(), 'Documents', 'Muse');
}
function parse(text) {
  const doc = YAML.parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map(e => e.message).join('; '));
  return doc.toJS({ maxAliasCount: 0 });
}
function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be a mapping`);
}
function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  return value.trim();
}
function validateRecord(record) {
  object(record, 'record');
  for (const key of ['id', 'scope', 'principle', 'because', 'source', 'date']) required(record[key], key);
  if (!['candidate', 'confirmed'].includes(record.status)) throw new Error('Invalid record status');
  if (!['preference', 'rejection', 'taboo'].includes(record.kind)) throw new Error('Invalid record kind');
  if (typeof record.exceptions !== 'string') throw new Error('exceptions must be a string');
}
function validateDNA(data) {
  object(data, 'DNA');
  if (data.version !== VERSION) throw new Error(`Expected vault ${VERSION}; migrate the old vault first`);
  if (data.last_updated !== null && typeof data.last_updated !== 'string') throw new Error('Invalid last_updated');
  const ids = new Set();
  for (const key of ['preferences', 'rejected_cases']) {
    if (!Array.isArray(data[key])) throw new Error(`${key} must be an array`);
    for (const record of data[key]) {
      validateRecord(record);
      if (ids.has(record.id)) throw new Error(`Duplicate record id: ${record.id}`);
      ids.add(record.id);
    }
  }
  return data;
}
function validateTaboos(data) {
  object(data, 'taboos');
  if (data.version !== VERSION || !Array.isArray(data.taboos)) throw new Error('Invalid taboos schema');
  const ids = new Set();
  for (const record of data.taboos) {
    validateRecord(record);
    if (record.kind !== 'taboo' || ids.has(record.id)) throw new Error('Invalid or duplicate taboo');
    ids.add(record.id);
  }
  return data;
}
function readVault(dir) {
  return {
    dna: validateDNA(parse(fs.readFileSync(path.join(dir, 'personal_dna.yaml'), 'utf8'))),
    taboos: validateTaboos(parse(fs.readFileSync(path.join(dir, 'personal_taboos.yaml'), 'utf8')))
  };
}
function privateDir(input) {
  required(input, '--vault or MUSE_VAULT_DIR');
  const absolute = path.resolve(input);
  let ancestor = absolute;
  const suffix = [];
  while (!fs.existsSync(ancestor)) {
    suffix.unshift(path.basename(ancestor));
    const parent = path.dirname(ancestor);
    if (parent === ancestor) throw new Error('Cannot resolve vault path');
    ancestor = parent;
  }
  const resolved = path.join(fs.realpathSync(ancestor), ...suffix);
  const root = fs.realpathSync(ROOT);
  if (resolved === root || resolved.startsWith(root + path.sep)) throw new Error('Use a private vault outside the skill directory');
  return resolved;
}
function initVault(input, dna = { version: VERSION, last_updated: null, preferences: [], rejected_cases: [] }, taboos = { version: VERSION, taboos: [] }, backups = {}) {
  const dir = privateDir(input);
  validateDNA(dna); validateTaboos(taboos);
  for (const [name, content] of Object.entries(backups)) {
    if (!/^legacy-[a-z_]+\.yaml\.bak$/.test(name) || typeof content !== 'string') throw new Error('Invalid migration backup');
  }
  if (fs.existsSync(dir)) throw new Error('Destination exists; refusing to overwrite it');
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  const temp = fs.mkdtempSync(path.join(path.dirname(dir), '.muse-init-'));
  try {
    fs.writeFileSync(path.join(temp, 'personal_dna.yaml'), YAML.stringify(dna), { mode: 0o600 });
    fs.writeFileSync(path.join(temp, 'personal_taboos.yaml'), YAML.stringify(taboos), { mode: 0o600 });
    for (const [name, content] of Object.entries(backups)) {
      const file = path.join(temp, name);
      fs.writeFileSync(file, content, { flag: 'wx', mode: 0o600 });
      if (fs.readFileSync(file, 'utf8') !== content) throw new Error('Backup verification failed');
    }
    readVault(temp);
    fs.renameSync(temp, dir);
  } finally {
    if (fs.existsSync(temp)) fs.rmSync(temp, { recursive: true });
  }
  return { directory: dir, initialized: true };
}
function updateDNA(input, transform) {
  const dir = privateDir(input);
  const lock = path.join(dir, '.muse.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Vault is locked; another update may be in progress');
    throw error;
  }
  const file = path.join(dir, 'personal_dna.yaml');
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  try {
    const { dna } = readVault(dir);
    const before = fs.readFileSync(file, 'utf8');
    const result = transform(dna);
    validateDNA(dna);
    if (!result.changed) return result;
    dna.last_updated = new Date().toISOString();
    const after = YAML.stringify(dna);
    validateDNA(parse(after));
    const backup = `${file}.${Date.now()}.${crypto.randomUUID()}.bak`;
    fs.writeFileSync(backup, before, { flag: 'wx', mode: 0o600 });
    fs.writeFileSync(temp, after, { flag: 'wx', mode: 0o600 });
    if (fs.readFileSync(temp, 'utf8') !== after) throw new Error('Write verification failed');
    fs.renameSync(temp, file);
    return { ...result, backup };
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd); fs.unlinkSync(lock);
  }
}
function recordId(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 24);
}
function args(argv, booleanFlags = []) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (!flag.startsWith('--') || Object.hasOwn(out, flag.slice(2))) throw new Error(`Unexpected or duplicate argument: ${flag}`);
    const key = flag.slice(2);
    if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Invalid argument name');
    if (booleanFlags.includes(key)) out[key] = true;
    else {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Missing value for ${flag}`);
      out[key] = argv[++i];
    }
  }
  return out;
}
module.exports = { VERSION, parse, required, validateDNA, validateTaboos, readVault, privateDir, initVault, updateDNA, recordId, args, vaultLocation };
