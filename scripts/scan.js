'use strict';
const fs = require('node:fs');
const path = require('node:path');
function collect(target, extensions) {
  const files = []; const seen = new Set();
  function visit(p) {
    const stat = fs.lstatSync(p);
    if (stat.isSymbolicLink()) return;
    if (stat.isDirectory()) {
      const real = fs.realpathSync(p);
      if (seen.has(real)) return;
      seen.add(real);
      for (const name of fs.readdirSync(p)) {
        if (name.startsWith('.') || ['node_modules', 'dist', 'coverage'].includes(name)) continue;
        visit(path.join(p, name));
      }
    } else if (stat.isFile() && extensions.includes(path.extname(p).toLowerCase())) files.push(p);
  }
  visit(target);
  return files.sort();
}
function summarize(files, lint) {
  const results = files.map(file => ({ file, ...lint(file) }));
  return { filesCount: files.length, coverage: files.length ? 'heuristic-only' : 'none',
    totalErrors: results.reduce((n, r) => n + r.errors.length, 0),
    totalWarnings: results.reduce((n, r) => n + r.warnings.length, 0), results };
}
function print(result) {
  console.log(JSON.stringify({ ...result, notice: 'Text-level review cues only. This is not a visual, interaction or accessibility pass.' }, null, 2));
}
module.exports = { collect, summarize, print };
