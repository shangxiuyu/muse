#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { VERSION, parse, initVault, readVault } = require('./vault');
function migrate(source, destination) {
  if (!source || !destination) throw new Error('Usage: node scripts/migrate_vault.js <old-vault> --output <new-private-dir>');
  const dnaFile = path.join(source, 'personal_dna.yaml');
  const original = fs.readFileSync(dnaFile, 'utf8');
  let text = original; let repaired = false;
  // Narrow recovery for the published 1.x inline block-list defect; never generic YAML repair.
  if (/^version:\s*["']?1\.[01]\.0["']?\s*$/m.test(text) && /^rejected_cases:[ \t]+- /m.test(text)) {
    text = text.replace(/^rejected_cases:[ \t]+- /m, 'rejected_cases:\n  - '); repaired = true;
  }
  const old = parse(text);
  if (!old || typeof old !== 'object' || Array.isArray(old)) throw new Error('Invalid legacy DNA');
  if (!['1.0.0', '1.1.0', VERSION].includes(old.version)) throw new Error('Unsupported vault version: ' + old.version);
  const tabooFile = path.join(source, 'personal_taboos.yaml');
  const tabooOriginal = fs.existsSync(tabooFile) ? fs.readFileSync(tabooFile, 'utf8') : null;
  const oldTaboos = tabooOriginal === null ? null : parse(tabooOriginal);
  let dna; let taboos;
  if (old.version === VERSION) ({ dna, taboos } = readVault(source));
  else {
    // Preserve all old information without assuming it was confirmed by the current user.
    dna = { version: VERSION, last_updated: null, preferences: [], rejected_cases: [],
      legacy_import: { status: 'candidate', source: path.resolve(source), original_version: old.version, data: old, taboos: oldTaboos } };
    taboos = { version: VERSION, taboos: [] };
  }
  const backups = { 'legacy-personal_dna.yaml.bak': original };
  if (tabooOriginal !== null) backups['legacy-personal_taboos.yaml.bak'] = tabooOriginal;
  const result = initVault(destination, dna, taboos, backups);
  return { ...result, version: VERSION, repairedKnownLegacySyntax: repaired, preferencesRequireReview: old.version !== VERSION };
}
if (require.main === module) {
  try {
    const a = process.argv.slice(2);
    if (a.length !== 3 || a[1] !== '--output') throw new Error('Usage: node scripts/migrate_vault.js <old-vault> --output <new-private-dir>');
    console.log(JSON.stringify(migrate(a[0], a[2]), null, 2));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { migrate };
