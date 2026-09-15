#!/usr/bin/env node
'use strict';
const { required, initVault, updateDNA, recordId, args, vaultLocation } = require('./vault');
function record(input, kind) {
  const principle = required(input.principle, 'principle');
  const scope = required(input.scope, 'scope');
  const source = required(input.source, 'source');
  const because = required(input.because, 'because');
  const status = input.confirmed === true ? 'confirmed' : 'candidate';
  const identity = { kind, principle, scope, source, category: input.category || '', key: input.key || '' };
  const entry = { id: recordId(identity), kind, status, scope, principle, because, source,
    exceptions: input.exceptions || '', date: new Date().toISOString() };
  if (input.artifact) entry.artifact = input.artifact;
  if (input.category) entry.category = input.category;
  if (input.key) entry.key = input.key;
  return updateDNA(vaultLocation(input.vault), dna => {
    const list = kind === 'rejection' ? dna.rejected_cases : dna.preferences;
    const found = list.find(r => r.id === entry.id);
    if (found) {
      let changed = false;
      const supplied = input.providedFields || Object.keys(input);
      for (const field of ['because', 'exceptions', 'artifact']) {
        if (supplied.includes(field) && found[field] !== entry[field]) {
          found[field] = entry[field]; changed = true;
        }
      }
      if (status === 'confirmed' && found.status === 'candidate') { found.status = 'confirmed'; changed = true; }
      if (changed) { found.date = entry.date; return { changed: true, id: found.id, status: found.status }; }
      return { changed: false, id: found.id, status: found.status, reason: 'same source already recorded' };
    }
    list.push(entry);
    return { changed: true, id: entry.id, status };
  });
}
function recordRejection(input) {
  required(input.artifact, 'artifact');
  return record(input, 'rejection');
}
function recordPreference(input) {
  required(input.category, 'category');
  const key = required(input.key || input.ruleKey, 'key');
  const value = required(input.value || input.ruleValue, 'value');
  return record({ ...input, providedFields: Object.keys(input), key, principle: value, because: input.because || 'Explicit preference statement' }, 'preference');
}
function run(argv) {
  const a = args(argv, ['confirmed', 'help']);
  const allowed = ['type', 'vault', 'artifact', 'because', 'principle', 'scope', 'source', 'exceptions', 'category', 'key', 'value', 'confirmed', 'help'];
  for (const key of Object.keys(a)) if (!allowed.includes(key)) throw new Error('Unknown flag: --' + key);
  if (a.help) { console.log('See references/memory_protocol.md. Types: init, rejection, preference. Location: --vault, MUSE_VAULT_DIR, then ~/Documents/Muse.'); return; }
  let result;
  if (a.type === 'init') result = initVault(vaultLocation(a.vault));
  else if (a.type === 'rejection') result = recordRejection(a);
  else if (a.type === 'preference') result = recordPreference(a);
  else throw new Error('--type must be init, rejection or preference');
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) {
  try { run(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { recordRejection, recordPreference, run };
