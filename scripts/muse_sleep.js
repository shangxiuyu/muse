#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const readline = require('node:readline');
const { args } = require('./vault');
// These are review cues, not learned principles. No raw log is applied to memory.
const aesthetic = /配色|颜色|色彩|字体|字号|字太|字重|行距|行高|留白|排版|居中|对齐|动效|动画|插画|构图|光晕|饱和|文案|布局|font|typography|color|layout|animation/i;
function textContent(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter(v => v && v.type === 'text' && typeof v.text === 'string').map(v => v.text).join('\n');
  return '';
}
async function scanTranscript(file) {
  if (!fs.existsSync(file)) throw new Error('Log not found: ' + file);
  const lines = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  const findings = []; let lineNumber = 0; let malformedLines = 0; let recognizedMessages = 0;
  for await (const line of lines) {
    lineNumber++;
    if (!line.trim()) continue;
    let data;
    try { data = JSON.parse(line); } catch { malformedLines++; continue; }
    if (!data || typeof data !== 'object') continue;
    if (data.role === 'user' || data.type === 'USER_INPUT' || data.source === 'USER_EXPLICIT') {
      recognizedMessages++;
      const text = textContent(data.content);
      if (aesthetic.test(text)) findings.push({ line: lineNumber, status: 'needs-context-review', excerpt: text.slice(0, 300) });
    }
  }
  return { findings, malformedLines, recognizedMessages };
}
async function run(argv) {
  const a = args(argv, ['dry-run', 'apply']);
  for (const key of Object.keys(a)) if (!['log', 'dry-run', 'apply'].includes(key)) throw new Error('Unknown flag: --' + key);
  if (a.apply) throw new Error('--apply is not supported. Review context and record an explicit scoped candidate with slow_update.js.');
  if (!a.log) { console.log(JSON.stringify({ status: 'no-data', findings: [], message: 'Specify --log; no simulated feedback or automatic log search.' }, null, 2)); return; }
  console.log(JSON.stringify(await scanTranscript(a.log), null, 2));
}
if (require.main === module) run(process.argv.slice(2)).catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { scanTranscript, run };
