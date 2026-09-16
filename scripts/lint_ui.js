#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { collect, summarize, print } = require('./scan');
const EXT = ['.html', '.css', '.scss', '.less', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte'];
function lintContent(source) {
  const content = source.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const findings = [];
  const add = (rule, message) => findings.push({ rule, message });
  const interactive = /<(button|input|select|textarea|a)\b|role=["']button["']/i.test(content);
  const focus = /:focus-visible\s*[{,:)]|focus-visible:(?:ring|outline|border)(?:[-\s"']|$)/i.test(content);
  if (interactive && !focus) add('ui.focus-review', 'Check visible keyboard focus on real interactive elements; native or imported styles may already provide it.');
  if (/:focus(?:-visible)?\s*\{[^}]*outline\s*:\s*(?:none|0)/i.test(content)) add('ui.focus-removal', 'Focus outline is removed; verify a visible alternative on the same element.');
  const motion = /(?:transition|animation)\s*:|\b(?:animate-[\w-]+|transition-(?:all|colors|transform|opacity))\b/i.test(content);
  const reduced = /prefers-reduced-motion|motion-reduce:|motion-safe:/i.test(content);
  if (motion && !reduced) add('ui.motion-review', 'Check a complete reduced-motion or static alternative, including imported styles and actual behavior.');
  if (/\btransition\s*:\s*all\b|transition-all\b/i.test(content)) add('ui.transition-scope', 'Review which properties change; explicit transitions make effects and cost easier to assess.');
  if (/aria-disabled=["']true|data-loading=["']true/i.test(content)) add('ui.state-behavior', 'Check keyboard activation and status feedback; attributes and pointer-events alone do not implement disabled/loading behavior.');
  for (const match of content.matchAll(/box-shadow\s*:\s*([^;}]+)/gi)) {
    const value = match[1];
    const opacity = value.match(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\s*\)/i);
    const large = [...value.matchAll(/(-?\d+(?:\.\d+)?)px/g)].some(m => Number(m[1]) >= 40);
    if (opacity && Number(opacity[1]) >= 0.3 && large) add('ui.shadow-review', 'Large dark shadow: inspect its role and visual weight; this can be intentional.');
  }
  if (/blur\(\s*(?:[6-9]\d|[1-9]\d{2,})(?:\.\d+)?px\s*\)/i.test(content)) add('ui.blur-review', 'Large blur: inspect legibility, purpose and rendering cost in context.');
  const tinyPx = [...content.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px\b/gi)].map(m => Number(m[1])).filter(n => n > 0 && n < 12);
  if (tinyPx.length) add('ui.small-text-review', `Found screen text below 12px (${[...new Set(tinyPx)].sort((a, b) => a - b).join(', ')}px); inspect computed size, information role and target viewing distance.`);
  if (/border-radius\s*:[^;}]+\b\d+px/i.test(content) && /border-left\s*:\s*[2-9]px/i.test(content)) {
    add('ui.accent-border-slop', 'Thick border-left on rounded container (Accent/Callout Stripe); causes corner-line geometric distortion and generic AI template look. Use hairline borders with subtle background tints or inner status dots instead.');
  }
  return { errors: [], warnings: findings.map(f => f.message), findings };
}
function lintFile(file) { return lintContent(fs.readFileSync(file, 'utf8')); }
function lintTarget(target) { return summarize(collect(target, EXT), lintFile); }
if (require.main === module) {
  try {
    if (!process.argv[2]) throw new Error('Provide an explicit UI file or directory');
    const r = lintTarget(process.argv[2]); print(r);
    if (!r.filesCount) process.exitCode = 2;
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { lintContent, lintFile, lintTarget };
