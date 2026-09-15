#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { collect, summarize, print } = require('./scan');
function lintTextContent(source) {
  let fence = null; const lines = [];
  for (const line of source.split('\n')) {
    const marker = line.trim().match(/^(\x60{3,}|~{3,})/);
    if (marker) { if (!fence) fence = marker[1][0]; else if (fence === marker[1][0]) fence = null; continue; }
    if (!fence) lines.push(line.replace(/\x60[^\x60]+\x60/g, ''));
  }
  const content = lines.join('\n'); const findings = [];
  const add = (rule, message) => { if (!findings.some(f => f.rule === rule)) findings.push({ rule, message }); };
  for (const phrase of [
    '在当今快节奏的世界中', '在这个瞬息万变的时代', '全方位引领', '闭环赋能', '匠心打造',
    '让我们拭目以待', '标志着关键时刻', '不断演变的格局', "in today's fast-paced world", 'harness the power'
  ]) {
    if (content.toLowerCase().includes(phrase)) findings.push({ rule: 'text.vague-phrase', message: 'Review whether this phrase says anything specific: ' + phrase });
  }
  for (const phrase of ['当然！', '好问题！', '希望这能帮助你', '如有需要，我可以', 'let me know if you need', 'i hope this helps']) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) add('text.chat-residue', 'Review whether assistant-to-user language leaked into a standalone artifact: ' + phrase);
  }
  const sentences = content.split(/[。！？!?\n]/).map(sentence => sentence.trim().replace(/^[-*>#\d.、\s]+/, '')).filter(Boolean);
  for (const sentence of sentences) {
    if (sentence.length > 150 && (sentence.match(/[,，]/g) || []).length > 5) findings.push({ rule: 'text.dense-sentence', message: 'Review sentence structure and qualifications; length alone is not an error.' });
  }
  const formulaicContrasts = (content.match(/不是[^。！？!?\n]{0,40}[，,]?而是/g) || []).length + (content.match(/真正的[^。！？!?\n]{0,32}(?:从来)?不是/g) || []).length + (content.match(/不仅[^。！？!?\n]{0,40}[，,]?更/g) || []).length;
  if (formulaicContrasts >= 2) add('text.formulaic-contrast', 'Repeated contrast frames may be correcting objections the reader never had; review their actual argumentative work.');
  for (let i = 0; i + 2 < sentences.length; i++) {
    const openers = sentences.slice(i, i + 3).map(sentence => {
      const chinese = sentence.match(/^[\u3400-\u9fff]{2}/); if (chinese) return chinese[0];
      return (sentence.toLowerCase().match(/^[a-z]+/) || [''])[0];
    });
    if (openers[0] && openers.every(opener => opener === openers[0])) { add('text.repeated-opener', 'Three consecutive sentences share the same opener; review whether the repetition carries meaning.'); break; }
  }
  for (let i = 0; i + 3 < sentences.length; i++) {
    const lengths = sentences.slice(i, i + 4).map(sentence => sentence.replace(/\s/g, '').length);
    if (lengths.every(length => length >= 10) && Math.max(...lengths) - Math.min(...lengths) <= 3) { add('text.uniform-rhythm', 'Four consecutive sentences have nearly identical length; read aloud before deciding whether to vary the cadence.'); break; }
  }
  return { errors: [], warnings: findings.map(f => f.message), findings };
}
function lintFile(file) { return lintTextContent(fs.readFileSync(file, 'utf8')); }
function lintTarget(target) { return summarize(collect(target, ['.md', '.txt', '.html']), lintFile); }
if (require.main === module) {
  try {
    if (!process.argv[2]) throw new Error('Provide an explicit text file or directory');
    const r = lintTarget(process.argv[2]); print(r);
    if (!r.filesCount) process.exitCode = 2;
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { lintTextContent, lintFile, lintTarget };
