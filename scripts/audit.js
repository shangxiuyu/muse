#!/usr/bin/env node
/**
 * Muse 自审：对技能资产本身做机械核对，而不是对作品做审美判断。
 *
 *   node scripts/audit.js             # 审计技能自身
 *   node scripts/audit.js --json      # 机器可读输出
 *   node scripts/audit.js --rules     # 只看规则自合规
 *
 * 检查项：
 *   1. link          markdown 相对链接是否可达
 *   2. promise       正文承诺的脚本 / 目录是否真实存在
 *   3. version       SKILL.md、README、CHANGELOG 的版本是否一致
 *   4. routing       路由覆盖、孤儿文件、已退役文件
 *   5. compliance    技能资产自己的代码示例是否违反自己的《负向底线》
 *   6. declaration   已声明的例外（列出，不判罚）
 *   7. cjk           中文排版基线是否在位；用了对中文有害的手法是否给了中文字体栈
 *   8. scope        各母体分支（主母体库 / 演示表层流派库）是否声明了「表层系统」边界，
 *                   没有冒充完整设计系统
 *   9. evidence      公共案例宣称的证据是否可解析
 *  10. prose        技能自己散文的文案自合规（同一套 24 种反 AI 腔规则）
 *
 * 边界：只核对结构一致性，不评价技能内容好不好，也不构成任何审美判断。
 * 退出码：有 error 时为 1，否则 0。
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, resolve, relative, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintMarkdown, RULES, parseSuperseded, parseDeclarations, parseGenre } from './rules.js';
import { splitByDeclaration, GENRES } from './lint_text.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const AS_JSON = args.includes('--json');
const ONLY_RULES = args.includes('--rules');

async function walk(dir, out = []) {
  const EXCLUDED_DIRS = new Set(['node_modules', 'output', 'web', 'server', 'deploy', 'tests']);
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (dir === ROOT && entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

const findings = [];
const report = (kind, severity, file, message, line) =>
  findings.push({ kind, severity, file: relative(ROOT, file) || file, line, message });

/* ── 1. 链接可达性 ─────────────────────────────────────────────── */
function checkLinks(mdFiles, contents) {
  let total = 0;
  for (const file of mdFiles) {
    const text = contents.get(file);
    for (const m of text.matchAll(/\]\(([^)\s]+\.(?:md|json|yaml|yml|js|mjs))\)/g)) {
      const target = m[1];
      if (/^(https?:|#|\/)/.test(target)) continue;
      total++;
      const resolved = resolve(dirname(file), target);
      if (!existsSync(resolved)) {
        const line = text.slice(0, m.index).split('\n').length;
        report('link', 'error', file, `失效链接 → ${target}`, line);
      }
    }
  }
  return total;
}

/* ── 2. 正文承诺的脚本与目录 ───────────────────────────────────── */
function checkPromises(mdFiles, contents) {
  const seen = new Map();
  for (const file of mdFiles) {
    const text = contents.get(file);
    for (const m of text.matchAll(/\b(?:node\s+)?((?:scripts|benchmarks|exemplars)\/[A-Za-z0-9_.\/-]+|package\.json)\b/g)) {
      const p = m[1];
      if (!seen.has(p)) seen.set(p, { file, line: text.slice(0, m.index).split('\n').length });
    }
  }
  for (const [p, where] of seen) {
    if (!existsSync(join(ROOT, p))) {
      report('promise', 'error', join(ROOT, where.file), `正文引用了不存在的路径 ${p}`, where.line);
    }
  }
}

/* ── 3. 版本一致性 ─────────────────────────────────────────────── */
function checkVersion(contents) {
  const versions = new Map();
  const skill = contents.get(join(ROOT, 'SKILL.md'));
  if (skill) {
    const m = skill.match(/^\s*version:\s*["']?([\d.]+)/m);
    if (m) versions.set('SKILL.md metadata', m[1]);
  }
  const readme = contents.get(join(ROOT, 'README.md'));
  if (readme) {
    const badge = readme.match(/Version-v([\d.]+)/);
    if (badge) versions.set('README badge', badge[1]);
    const heading = readme.match(/^###\s*([\d.]+)：/m);
    if (heading) versions.set('README 最新 changelog', heading[1]);
  }
  const values = [...new Set(versions.values())];
  if (values.length > 1) {
    const detail = [...versions].map(([k, v]) => `${k}=${v}`).join('、');
    report('version', 'error', join(ROOT, 'SKILL.md'), `版本号不一致：${detail}`);
  }
  return values[0] ?? null;
}

/* ── 4. 路由覆盖与孤儿文件 ─────────────────────────────────────── */
function checkRouting(mdFiles, contents) {
  const referenced = new Set();
  for (const file of mdFiles) {
    const text = contents.get(file);
    for (const m of text.matchAll(/\]\(([^)\s]+\.md)\)/g)) {
      if (/^https?:/.test(m[1])) continue;
      referenced.add(resolve(dirname(file), m[1]));
    }
    // 正文里以裸文件名提到的也算被引用
    for (const m of text.matchAll(/\b([a-z0-9_]+\.md)\b/g)) {
      referenced.add(resolve(dirname(file), m[1]));
      referenced.add(join(ROOT, 'references', m[1]));
    }
  }
  // 主入口可以经索引按需调度资源；沿本地链接检查可达性，不要求所有卡片平铺到入口。
  const skill = contents.get(join(ROOT, 'SKILL.md')) || '';
  const routed = new Set();
  for (const m of skill.matchAll(/\]\(([^)\s]+\.md)\)/g)) routed.add(resolve(ROOT, m[1]));
  for (const m of skill.matchAll(/\b([A-Za-z0-9_]+\.md)\b/g)) {
    routed.add(join(ROOT, 'references', m[1]));
    routed.add(join(ROOT, m[1]));
  }
  const pending = [...routed];
  for (let i = 0; i < pending.length; i++) {
    const file = pending[i];
    const text = contents.get(file);
    if (!text) continue;
    for (const m of text.matchAll(/\]\(([^)\s]+\.md)(?:#[^)\s]*)?\)/g)) {
      if (/^(?:https?:|#|\/)/.test(m[1])) continue;
      const target = resolve(dirname(file), m[1]);
      if (!contents.has(target) || routed.has(target)) continue;
      routed.add(target);
      pending.push(target);
    }
  }
  const ENTRY = new Set(['SKILL.md', 'README.md', 'LICENSE'].map((f) => join(ROOT, f)));

  const superseded = new Set();
  for (const file of mdFiles) {
    if (ENTRY.has(file)) continue;
    const reason = parseSuperseded(contents.get(file) || '');
    if (reason) {
      superseded.add(file);
      continue;
    }
    if (!referenced.has(file)) {
      report('routing', 'error', file, '孤儿文件：没有任何文件引用它');
    } else if (file.includes(`${sep}references${sep}`) && !routed.has(file) && !file.includes('archetypes')) {
      report('routing', 'warning', file, '未被 SKILL.md 调度，Agent 按主入口执行时不会加载');
    }
  }
  return superseded;
}

/* ── 5. 技能资产自己的规则自合规 ───────────────────────────────── */
function checkCompliance(mdFiles, contents) {
  for (const file of mdFiles) {
    if (!file.includes(`${sep}references${sep}`) && !file.endsWith('SKILL.md') && !file.endsWith('README.md')) continue;
    for (const v of lintMarkdown(contents.get(file))) {
      report('compliance', v.severity, file, `[${v.rule}] ${v.detail}`, v.line);
    }
  }
}

/* ── 6. 已声明的例外：偏离被允许，但必须被看见 ─────────────────── */
function checkDeclarations(mdFiles, contents) {
  const out = [];
  for (const file of mdFiles) {
    for (const [rule, reason] of parseDeclarations(contents.get(file) || '')) {
      out.push({ file, rule, reason });
    }
  }
  return out;
}

/* ── 表层母体库的统一登记表 ──────────────────────────────────────
 * 6.0 立下「母体是表层系统」这条边界时只覆盖了主母体库：检查里硬编码了
 * references/archetypes.md，而 `${sep}archetypes${sep}` 这种目录拼接也匹配
 * 不到 references/toolkit/presentation/archetypes.md。于是演示分支长期游离
 * 在检查之外——没有边界声明、7 个字体栈里没有一个中文字体、还自带一张
 * 「关键词 → 母版」的选型表，与它自己的总纲互相打架。
 *
 * 这里把两条分支登记成同一张表，让边界与 CJK 检查对两者一视同仁。
 * row 是该库在 SKILL.md 路由表里的识别词。 */
const ARCHETYPE_LIBS = [
  { path: 'references/archetypes.md', row: '视觉母体库', label: '主母体库' },
  { path: 'references/toolkit/presentation/archetypes.md', row: '演示表层流派', label: '演示表层流派库' },
];
const archetypeLibPaths = new Set(ARCHETYPE_LIBS.map((l) => join(ROOT, l.path)));

/** 母体库首页 + 各母体规范文件（含演示分支的单文件库）。 */
const isArchetypeSurface = (f) =>
  f.includes(`${sep}archetypes${sep}`) || archetypeLibPaths.has(f);

/* ── 7. 中文排版基线 ─────────────────────────────────────────────
 * 6.0 的渲染实测发现：10 个母体的字体栈里没有任何中文字体，把等宽母体
 * 直接套到中文界面会把字距撑碎。推理层早已警告过 CJK 陷阱，但母体层漏了。
 * 这个检查保证基线不会被再次遗忘——包括后来才补上的演示分支。 */
const CJK_FONT = /PingFang|Noto Sans SC|Noto Serif SC|Noto Sans Mono|Source Han|思源|苹方|Songti|Hiragino|LXGW|霞鹜|Microsoft YaHei|微软雅黑/;
const CJK_SECTION = /中文排版基线|中文配对|CJK Baseline|CJK Pairing/;

function checkCjkBaseline(contents) {
  // 每条分支都必须自己带一层中文基线：演示是中文默认场景，不能靠主库代偿
  for (const { path, label } of ARCHETYPE_LIBS) {
    const p = join(ROOT, path);
    const baseline = contents.get(p);
    if (!baseline) {
      report('cjk', 'error', p, `${label}首页缺失`);
      continue;
    }
    const fonts = new Set(baseline.match(new RegExp(CJK_FONT, 'g')) || []);
    if (!CJK_SECTION.test(baseline)) {
      report('cjk', 'error', p, `缺少中文排版基线一节（〈中文排版基线〉或〈中文配对〉）：该库只覆盖拉丁字形，中文会失守`);
    } else if (fonts.size < 3) {
      report('cjk', 'error', p, `中文基线里只出现 ${fonts.size} 种中文字体，配对表不完整`);
    }
  }

  // 母体若用了对中文有害的手法，必须有人提醒
  for (const file of [...contents.keys()].filter(isArchetypeSurface)) {
    const text = contents.get(file);
    const harmful = [
      /text-transform:\s*uppercase/i.test(text) && 'text-transform: uppercase（对中文无效）',
      /letter-spacing:\s*-\d/i.test(text) && '负字距（挤压中文字形）',
      /font-family:[^;]*monospace/i.test(text) && '等宽字体栈（中文会被撑开字距）',
    ].filter(Boolean);
    if (harmful.length && !CJK_FONT.test(text)) {
      report('cjk', 'warning', file, `使用了 ${harmful.join('、')} 但未给中文字体栈，请引用母体库的〈中文排版基线〉`);
    }
  }
}

/* ── 8. 母体库的职责边界 ─────────────────────────────────────────
 * 母体是表层系统，不是完整设计系统。这个边界必须写在库首页与主入口，
 * 否则 Agent 套完母体就以为版式也解决了——而那正是 3 等分卡片的来路。
 * 每条母体分支都要过这一关，演示分支也不例外。 */
const SURFACE_ONLY = /表层系统|表层语言|不是完整设计系统|不给版式|不负责版式/;

function checkArchetypeScope(contents) {
  const skill = contents.get(join(ROOT, 'SKILL.md')) || '';

  for (const { path, row, label } of ARCHETYPE_LIBS) {
    const lib = join(ROOT, path);
    const libText = contents.get(lib);
    if (!libText) continue;
    if (!SURFACE_ONLY.test(libText)) {
      report('scope', 'error', lib, `${label}缺少「母体是表层系统」的职责边界说明：Agent 会以为套上母体就得到完整版式`);
    }
    if (!/visual_grammar\.md/.test(libText)) {
      report('scope', 'error', lib, `${label}的边界说明里没有指向版式方法（visual_grammar.md），母体无法单独使用`);
    }

    const rowText = skill.split('\n').find((l) => l.includes(row));
    if (rowText && !SURFACE_ONLY.test(rowText)) {
      report('scope', 'error', join(ROOT, 'SKILL.md'), `SKILL.md 路由${label}时没有声明它是表层系统，与库首页的边界不一致`);
    }
  }

  // 母体文件不得声称自己提供完整方案
  for (const file of [...contents.keys()].filter(isArchetypeSurface)) {
    const t = contents.get(file);
    if (/自包含的?(完整)?设计系统|完整页面方案|开箱即用的完整/.test(t)) {
      report('scope', 'error', file, '声称提供完整方案，与「母体是表层系统」的边界矛盾');
    }
  }
}

/* ── 9. 公共案例的证据可解析性 ───────────────────────────────────
 * 条目宣称的证据必须真的取得到。指向从未发布的文件，等于伪造证据。 */
function checkPublicEvidence() {
  const p = join(ROOT, 'references/public_cases.json');
  if (!existsSync(p)) {
    report('evidence', 'error', p, '公共知识目录缺失');
    return;
  }
  let lib;
  try {
    lib = JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    report('evidence', 'error', p, `无法解析：${e.message}`);
    return;
  }
  const byId = new Map(lib.entries.map((e) => [e.id, e]));

  for (const e of lib.entries) {
    if (e.kind === 'reaction' || e.kind === 'application') {
      report('evidence', 'error', p, `${e.id}：公共目录不允许 ${e.kind}（需要特定用户所有权或真实使用记录）`);
    }
    if (e.kind === 'system' && e.data.system_type && e.data.system_type !== 'aesthetic') {
      report('evidence', 'error', p, `${e.id}：公共 system 只能 system_type=aesthetic`);
    }
    if (e.kind !== 'reference') continue;

    const checkAnchor = (locator, where) => {
      if (typeof locator !== 'string') {
        report('evidence', 'error', p, `${e.id}：${where} 缺失`);
        return;
      }
      if (locator.startsWith('references/public_cases.json#')) {
        const [target, obsId] = locator.split('#')[1].split('/');
        const targetEntry = byId.get(target);
        if (!targetEntry) {
          report('evidence', 'error', p, `${e.id}：${where} 锚点指向不存在的条目 ${target}`);
        } else if (obsId && !(targetEntry.data.observations || []).some((o) => o.id === obsId)) {
          report('evidence', 'error', p, `${e.id}：${where} 锚点指向不存在的 observation ${obsId}`);
        }
        return;
      }
      if (!existsSync(join(ROOT, locator))) {
        report('evidence', 'error', p, `${e.id}：${where} 指向技能内不存在的文件 ${locator}（宣称了取不到的证据）`);
      }
    };

    checkAnchor(e.data.source?.locator, 'source.locator');
    for (const o of e.data.observations || []) checkAnchor(o.locator, `observations[${o.id}].locator`);
  }
}

/* ── 10. 技能自己散文的文案自合规 ─────────────────────────────────
 * 6.0 把「母体是表层系统」这条边界同时挂上了库首页与主入口，但文案规则
 * 从未反过来扫过技能自己的散文。后果：协议自己 10 行用 “ ”、1 行用「」，
 * 而〈绝对禁区〉清单被自己的规则逐条判罚——规则被自己的资产违反，
 * 就没人遵守了。这里让技能自己的散文也过一遍它要求用户过的那套检查。
 * 命中走与用户产出相同的 muse:allow 声明机制（lint_text.js 与 rules.js 共用）。 */
const TEXT_EXEMPT = new Map([
  ['references/toolkit/text_quality_protocol.md', '本文件按设计逐条列出 24 种病灶的 ❌ 反例，属规则的文字描述而非违规文本'],
]);

/* 体裁由文件自己声明（`<!-- muse:genre spec -->`），不在审计里硬编码路径：
 * 硬编码只能管技能自己的文件，用户自己的提示词无从声明，会被按散文口径误判。 */
function checkTextCompliance(mdFiles, contents) {
  const exempt = [];
  for (const file of mdFiles) {
    const rel = relative(ROOT, file);
    // 技能自己的全部散文：references/ 下 + 根目录的 SKILL / README / 契约范例
    // （范例会被用户照抄，含 AI 腔就是缺陷，所以一并纳入）。
    const inScope = file.includes(`${sep}references${sep}`) || dirname(file) === ROOT;
    if (!inScope) continue;
    if (TEXT_EXEMPT.has(rel)) {
      exempt.push(rel);
      continue;
    }
    const text = contents.get(file) || '';
    const declaredGenre = parseGenre(text);
    if (declaredGenre && !GENRES.includes(declaredGenre)) {
      report('prose', 'error', file, `声明了未知体裁「${declaredGenre}」，可用：${GENRES.join(' / ')}`);
      continue;
    }
    for (const v of splitByDeclaration(text).findings) {
      report('prose', 'error', file, `[#${v.pattern} ${v.name}] 命中「${v.hit}」→ ${v.fix}`, v.line);
    }
  }
  return exempt;
}

/* ── 主流程 ───────────────────────────────────────────────────── */
const all = await walk(ROOT);
const mdFiles = all.filter((f) => extname(f) === '.md');
const contents = new Map();
for (const f of mdFiles) contents.set(f, await readFile(f, 'utf8'));

const linkCount = checkLinks(mdFiles, contents);
let supersededFiles = new Set();
if (!ONLY_RULES) {
  checkPromises(mdFiles, contents);
  const version = checkVersion(contents);
  supersededFiles = checkRouting(mdFiles, contents);
  if (version) report('version', 'info', join(ROOT, 'SKILL.md'), `声明版本 ${version}`);
}
checkCompliance(mdFiles, contents);
checkPublicEvidence();
checkCjkBaseline(contents);
checkArchetypeScope(contents);
const proseExempt = checkTextCompliance(mdFiles, contents);
const declarations = checkDeclarations(mdFiles, contents);

const errors = findings.filter((f) => f.severity === 'error');
const warnings = findings.filter((f) => f.severity === 'warning');

if (AS_JSON) {
  console.log(
    JSON.stringify(
      { root: ROOT, files: mdFiles.length, links: linkCount, superseded: [...supersededFiles].map((f) => relative(ROOT, f)), findings },
      null,
      2
    )
  );
} else {
  const byKind = {};
  for (const f of findings) (byKind[f.kind] ??= []).push(f);

  console.log(`\nMuse 自审 · ${relative(process.cwd(), ROOT) || '.'}`);
  console.log(`扫描 ${mdFiles.length} 个 markdown 文件、${linkCount} 条相对链接\n`);

  const LABEL = {
    link: '链接可达性',
    promise: '脚本与目录承诺',
    version: '版本一致性',
    routing: '路由与孤儿文件',
    compliance: '规则自合规',
    cjk: '中文排版基线',
    scope: '母体职责边界',
    prose: '散文质量自合规',
  };
  for (const [kind, items] of Object.entries(byKind)) {
    const errs = items.filter((i) => i.severity === 'error').length;
    const warns = items.filter((i) => i.severity === 'warning').length;
    if (kind === 'version' && errs === 0) {
      console.log(`✓ ${LABEL[kind] || kind}: ${items.map((i) => i.message).join('；')}`);
      continue;
    }
    const mark = errs ? '✗' : warns ? '!' : '✓';
    console.log(`${mark} ${LABEL[kind] || kind}: ${errs} error / ${warns} warning`);
    for (const i of items) {
      if (i.severity === 'info') continue;
      const tag = i.severity === 'error' ? '  ✗' : '  !';
      console.log(`${tag} ${i.file}${i.line ? ':' + i.line : ''} — ${i.message}`);
    }
    console.log('');
  }

  if (supersededFiles.size) {
    console.log('已退役（自述被取代、不再路由，保留仅为可追溯）：');
    for (const f of supersededFiles) console.log(`  · ${relative(ROOT, f)}`);
    console.log('');
  }

  if (declarations.length) {
    console.log('已声明的例外（偏离被允许，但必须可见）：');
    for (const d of declarations) console.log(`  · ${relative(ROOT, d.file)} → ${d.rule}：${d.reason}`);
    console.log('');
  }

  if (proseExempt.length) {
    console.log('散文自合规的豁免（因文件本身是反例清单，非违规文本）：');
    for (const f of proseExempt) console.log(`  · ${f} — ${TEXT_EXEMPT.get(f)}`);
    console.log('');
  }

  const infos = findings.filter((f) => f.severity === 'info' && f.kind === 'compliance');
  if (infos.length) {
    const byRule = {};
    for (const i of infos) {
      const m = i.message.match(/\[([a-z-]+)\]/);
      const k = m ? m[1] : i.kind;
      byRule[k] = (byRule[k] || 0) + 1;
    }
    console.log(
      `另有 ${infos.length} 条 info（不判罚，需人工确认）：${Object.entries(byRule).map(([k, v]) => `${k}×${v}`).join('、')}`
    );
    console.log('  用 --json 查看逐条位置。已声明的例外也在其中。\n');
  }

  const known = findings.filter((f) => RULES[f.rule]);
  if (known.length) {
    console.log('命中规则：');
    for (const rule of new Set(known.map((f) => f.rule))) {
      console.log(`  · ${rule} — ${RULES[rule]}`);
    }
  }
  console.log(`\n合计 ${errors.length} error / ${warnings.length} warning\n`);
}

// 让管道输出完成后自然退出，避免大库的 JSON 在写入中途被截断。
process.exitCode = errors.length ? 1 : 0;
