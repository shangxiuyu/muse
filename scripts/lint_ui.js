#!/usr/bin/env node
/**
 * UI 提示性检查：对一个项目的界面文件执行《负向底线》。
 *
 *   node scripts/lint_ui.js <文件或目录> [...]
 *
 * 这是**提示性**检查：通过不等于作品美、可用或无障碍合规；
 * 失败也只指出可定位现象，不能替代真实渲染与操作。
 *
 * 在文件顶部声明例外（必须带理由，会被原样列出）：
 *   <!-- muse:allow pure-black: 新粗野画框以 2px 纯黑实线为形式语言 -->
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, extname, relative, dirname, resolve } from 'node:path';
import { lintCode, collectCssVars, RULES, parseDeclarations, NON_WAIVABLE_RULES } from './rules.js';

const TARGETS = ['.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.jsx', '.tsx', '.vue', '.svelte', '.astro'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.muse']);

async function collect(path, out = []) {
  const st = statSync(path);
  if (st.isFile()) {
    if (TARGETS.includes(extname(path))) out.push(path);
    return out;
  }
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = join(path, entry.name);
    if (entry.isDirectory()) await collect(full, out);
    else if (TARGETS.includes(extname(full))) out.push(full);
  }
  return out;
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!args.length) {
  console.error('用法: node scripts/lint_ui.js <文件或目录> [...]');
  process.exit(2);
}

let files = [];
for (const t of args) {
  if (!existsSync(t)) {
    console.error(`跳过不存在的路径: ${t}`);
    continue;
  }
  files = files.concat(await collect(t));
}
files = [...new Set(files)];

if (!files.length) {
  console.error(`\n✗ 没有匹配到可检查的文件（支持 ${TARGETS.join(' / ')}）。\n  这不算通过——什么都没检查。\n`);
  process.exit(2);
}

// 递归解析 @import 引入的 CSS 变量
function collectVarsWithImports(filePath, text, visited = new Set()) {
  if (visited.has(filePath)) return new Set();
  visited.add(filePath);
  const vars = collectCssVars(text);
  const dir = dirname(filePath);
  const importRe = /@import\s+(?:url\()?['"]([^'"]+)['"]\)?/g;
  let m;
  while ((m = importRe.exec(text)) !== null) {
    const importPath = resolve(dir, m[1]);
    if (existsSync(importPath) && !visited.has(importPath)) {
      try {
        const importedText = readFileSync(importPath, 'utf8');
        const importedVars = collectVarsWithImports(importPath, importedText, visited);
        for (const v of importedVars) vars.add(v);
      } catch {}
    }
  }
  return vars;
}

// 预收集本次扫描文件集合中的所有样式变量，支持跨文件设计系统引用
const projectCssVars = new Set();
for (const file of files) {
  if (['.css', '.html', '.htm'].includes(extname(file))) {
    try {
      const t = readFileSync(file, 'utf8');
      for (const v of collectCssVars(t)) projectCssVars.add(v);
    } catch {}
  }
}

const errors = [];
const warnings = [];
const infos = [];
const declaredReport = [];
const exemptFiles = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');

  // 整文件豁免：文件本身就要包含被禁的模式（规则引擎源码、反例示范页等）。
  // 与逐规则声明一样，必须带理由，并会在报告中列出。
  const exemption = text.match(/(?:\/\/|\/\*|<!--)\s*muse:ignore-file\s*:\s*([^>*\n]+)/);
  if (exemption && exemption[1].trim()) {
    exemptFiles.push({ file, reason: exemption[1].trim() });
    continue;
  }

  const declared = parseDeclarations(text);
  for (const [rule, reason] of declared) declaredReport.push({ file, rule, reason });

  const fileVars = collectVarsWithImports(file, text);
  const combinedVars = new Set([...projectCssVars, ...fileVars]);

  // 变量定义结合本文件、@import 链与扫描上下文合并
  const findings = lintCode(text, 1, { definedVars: combinedVars }).map((v) =>
    declared.has(v.rule) && !NON_WAIVABLE_RULES.has(v.rule)
      ? { ...v, severity: 'info', detail: `[已声明] ${declared.get(v.rule)} — ${v.detail}` }
      : v
  );

  for (const f of findings) {
    const rec = { file, ...f };
    if (f.severity === 'error') errors.push(rec);
    else if (f.severity === 'warning') warnings.push(rec);
    else infos.push(rec);
  }
}

const print = (list, mark) => {
  let current = null;
  for (const f of list) {
    if (f.file !== current) {
      current = f.file;
      console.log(`\n  ${relative(process.cwd(), f.file)}`);
    }
    console.log(`    ${mark} L${f.line} [${f.rule}] ${f.detail}`);
  }
};

console.log(`\nMuse UI 提示性检查 · ${files.length} 个文件`);
if (errors.length) {
  console.log(`\n✗ ${errors.length} 项触犯底线`);
  print(errors, '✗');
}
if (warnings.length) {
  console.log(`\n! ${warnings.length} 项需要确认`);
  print(warnings, '!');
}
if (declaredReport.length) {
  console.log('\n已声明的例外（偏离被允许，但必须可见）：');
  for (const d of declaredReport) console.log(`  · ${relative(process.cwd(), d.file)} → ${d.rule}：${d.reason}`);
}
if (exemptFiles.length) {
  console.log('\n整体豁免的文件（未检查，理由如下）：');
  for (const e of exemptFiles) console.log(`  · ${relative(process.cwd(), e.file)}：${e.reason}`);
}
if (infos.length) {
  const byRule = {};
  for (const i of infos) byRule[i.rule] = (byRule[i.rule] || 0) + 1;
  console.log(
    `\n· ${infos.length} 条提示（不判罚，需人工确认）：${Object.entries(byRule).map(([k, v]) => `${k}×${v}`).join('、')}`
  );
  for (const i of infos.slice(0, 5)) console.log(`    ${relative(process.cwd(), i.file)} L${i.line} [${i.rule}] ${i.detail}`);
  if (infos.length > 5) console.log(`    …另有 ${infos.length - 5} 条`);
}
if (!errors.length && !warnings.length) console.log('\n✓ 未发现触犯底线的现象');

console.log(
  `\n命中规则：${[...new Set([...errors, ...warnings].map((f) => f.rule))].map((r) => `${r}（${RULES[r]}）`).join('；') || '无'}`
);
console.log('\n注意：以上是代码级现象，不等于作品通过审美评估。渲染、操作与播放仍需真实相遇。\n');

process.exit(errors.length ? 1 : 0);
