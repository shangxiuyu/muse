#!/usr/bin/env node
/**
 * 文本提示性检查：对照《24 种反 AI 腔微创手术》找出可定位的病灶。
 *
 *   node scripts/lint_text.js <文件或目录> [...]
 *   node scripts/lint_text.js --selftest        # 用技能自己的 ❌ / ✅ 范例验证规则（漏报与误伤都要查）
 *   node scripts/lint_text.js --stdin < draft.md
 *   node scripts/lint_text.js --json <file>
 *   node scripts/lint_text.js --genre spec <文件>   # 临时覆盖体裁，见下
 *
 * 体裁（prose 散文 / spec 规约）：
 *   prose 散文——给人读的。全套 24 种病灶。
 *   spec  规约——给模型或流程执行的。关掉三条与规约写法冲突的规则
 *         （#2 对偶句式 / #9 内联标题列表 / #16 粗体），并把引号内**被提及**
 *         的短语（「不许写『很好的问题』」）与真正**被使用**的短语区分开。
 *
 * 优先级：命令行 --genre > 文件正文里的 `<!-- muse:genre spec -->` 自述 > prose。
 * 自述这层是必需的——用户自己的提示词文件无从靠外部登记表声明体裁。
 *
 * 只扫正文，不扫围栏代码块（与 lintMarkdown 只扫围栏块正好互补）：围栏里放的是
 * 范例与模板，把它们当违规等于把「教人怎么写」误判成「这么写了」。
 *
 * 边界（重要）：本工具只报告**可定位的现象**，不判断文章好坏，也不打那 50 分。
 * 评分卡需要人的判断；工具能做的只是把病灶指出来，供人决定是否手术。
 * 检测模式报告现象；改写模式还必须确认没有新增事实、改变因果或磨平作者特征。
 *
 * 例外声明（与 ui 侧的 rules.js 同一套机制）：正文里写
 *   <!-- muse:allow text-12: 本段刻意用破折号插叙承载题外话，是这一节的声音 -->
 * 被声明的那条规则对**本文件**降级为「已声明」，不再计入退出码，但会在输出里原样列出。
 * 偏离被允许，但不被隐藏。
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDeclarations, parseGenre, isIgnoredLine } from './rules.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(HERE, '..');
const PROTOCOL = join(SKILL_ROOT, 'references/toolkit/text_quality_protocol.md');

const CJK = '\\u4e00-\\u9fa5';

/* 「三段式」在中文里本身完全正常（技术枚举、并列要件都靠它），
 * 病灶是**用形容词堆砌换深度**。纯正则判不了词性，所以 #3 走自定义判定：
 * 三个并列里至少有一个**空转形容词**才报。这样「色温、材质、圆角、阴影与字体气质」
 * 这类合法枚举不再被判罚。
 *
 * 词表只收「加的是语气不是信息」的词。像 稳定/丰富/深度/独特/沉浸 这类
 * 在设计语境里承载实义的形容词**不收**——收进来会让 muse 自己的母体
 * （「稳定与偏移」「依赖字形比例、字距和独特结构」）被自己的规则判罚。 */
const SLOP_ADJ = /无缝|直观|强大|极致|完美|卓越|一流|出色|颠覆|突破|赋能|闭环|抓手|打法|底层逻辑|深入探讨|广阔|深远/;
const TRICOLON = new RegExp(`([${CJK}]{2,6})、([${CJK}]{2,6})(?:和|与|及)([${CJK}]{2,6})`);

/* 引号区间。规约型文本里，引号内是被「提及」而不是被「使用」：
 * 「不许写『很好的问题』」是在立规矩，不是在犯这个毛病。
 * 散文体裁不启用这条——散文引用一句 AI 腔，那句话照样是 AI 腔。 */
const QUOTE_PAIRS = [['「', '」'], ['『', '』'], ['“', '”'], ['‘', '’']];
function quoteSpans(line) {
  const spans = [];
  for (const [open, close] of QUOTE_PAIRS) {
    let from = 0;
    for (;;) {
      const s = line.indexOf(open, from);
      if (s === -1) break;
      const e = line.indexOf(close, s + 1);
      if (e === -1) break;
      spans.push([s, e]);
      from = e + 1;
    }
  }
  return spans;
}

/** 体裁。散文与规约的判据不同，同一套规则不能原样套两次。 */
export const GENRES = ['prose', 'spec'];

/**
 * 24 种病灶。判定方式二选一：
 *   - `re`   正则可判定
 *   - `test` 正则判不了（需要词性、上下文或跨句判断），用自定义函数返回命中串
 * 二者都没有（`auto: false`）表示机器只能提示、无法判定，诚实标注出来，
 * 不让工具假装覆盖了它做不到的事。
 */
export const PATTERNS = [
  { n: 1, name: '意义与格局虚胖', re: /标志着[^。；]{0,12}(关键时刻|重要里程碑|崭新阶段)|在不断演变的格局中|不可磨灭的(印记|贡献)|见证了[^。；]{0,10}(变迁|历程)/, fix: '删掉格局抬高，直接写该机构/事件实际做了什么' },
  { n: 2, name: '否定式假深刻排比', re: /不仅(仅)?是[^。；—]{0,40}(更是|而是)|不仅仅是[^。；—]{0,40}而是|不是[^。；—]{0,25}而是[^。；—]{0,25}(声明|宣言|态度)/, genres: ['prose'], fix: '改成一个具体断言，不用「不是A而是B」制造深度' },
  { n: 3, name: '强凑三段式', test: (l) => {
      // 表格行的「、」是单元格分隔符，不是散文的并列节奏——在表里判三段式
      // 只会把「…天花板、看重市场规模与商业模式闭环…」这类表格格判成病灶。
      if (l.trimStart().startsWith('|')) return null;
      const m = l.match(TRICOLON);
      if (!m) return null;
      return [m[1], m[2], m[3]].some((w) => SLOP_ADJ.test(w)) ? m[0] : null;
    }, fix: '三个并列里堆了 AI 腔形容词。检查是否各有实质，不是为凑「A、B 和 C」' },
  { n: 4, name: '虚假深度分词后缀', re: /(彰显|凸显|体现|昭示)了[^。；]{0,20}(联系|价值|意义|精神)|从而确保了|为推动[^。；]{0,15}做出(了)?(贡献|努力)/, fix: '换成当事人可核实的具体说法或直接引语' },
  { n: 5, name: '模糊权威归因', re: /(专家|学者|观察者|业内人士|分析师)(们)?(认为|指出|表示|强调)|(大量|多项|诸多)(研究|证据|数据)(表明|显示)|有关部门/, fix: '补上具体机构、年份与可查来源；补不上就删掉这句归因' },
  { n: 6, name: '回避直接动词', re: new RegExp(`作为[^。；]{0,18}的(体现|象征|代表|缩影)|作为[^。；]{0,15}(重要|核心|关键)?(阵地|标杆|典范|旗帜|桥梁|里程碑)|代表了[^。；]{0,20}(的)?(高度|精神|方向)|扮演着[^。；]{0,15}角色|发挥着[^。；]{0,15}作用`), fix: '用「是／有」直说，别绕着「作为…的体现」讲' },
  { n: 7, name: '挑战与展望套路', re: /尽管(面临|存在)[^。；]{0,25}(挑战|困难)[^。；]{0,30}(但|然而|凭借|依靠|借助|随着)|(未来|前景)[^。；]{0,12}(一片光明|充满希望|值得期待)|让我们拭目以待|必将(迎来|实现)/, fix: '写清具体困难与已采取的动作，或就此停笔' },
  { n: 8, name: '高频 AI 词汇', re: /织锦|格局|赋能|深入探讨|至关重要|关键作用|协同效应|底层逻辑|闭环|抓手|打法|生态位/, fix: '换成该领域的实词；「赋能/闭环/抓手」多为空转' },
  { n: 9, name: '内联标题垂直列表', re: /^\s*[-*]\s*\*\*[^*\n]{1,14}[:：]\*\*/, genres: ['prose'], fix: '取消「**小标题：**长句解释」的机械列表，改写成连贯段落' },
  { n: 10, name: '大团圆收尾', re: /(未来|明天)[^。；]{0,10}(一片光明|会更好|更加美好)|激动人心的(时代|时刻)[^。；]{0,15}(到来|即将)|让我们拭目以待|携手(并进|共创)|共同(拥抱|迎接|迈向)/, fix: '让结尾完成最后一个真实动作，不要升华口号' },
  { n: 11, name: '时代空话开场', re: /在(当今|如今|这个)[^。；]{0,15}(时代|今天|背景下)|众所周知|随着[^。；]{0,12}的(快速)?(发展|进步|普及)|毋庸置疑/, fix: '第一句直接给事实、数字或冲突' },
  { n: 12, name: '破折号滥用', re: /——[^。\n]{1,40}——/, fix: '一个自然段内不要用两处破折号插叙，改成逗号或分句' },
  { n: 13, name: '机械表情符号装饰', re: /^\s*[\u{1F300}-\u{1FAFF}]\s*\*\*[^*\n]{1,14}[:：]\*\*/u, fix: '删掉 emoji 装饰，让文字本身承担信息' },
  { n: 14, name: '虚假范围罗列', re: /从[^，。；\n]{1,18}到[^，。；\n]{1,18}(奇迹|宏大|宇宙|文明|思维)|从[^，。；\n]{1,18}(宏大|宇宙|文明|量子)[^，。；\n]{0,6}到[^，。；\n]{1,18}/, fix: '确认「从 X 到 Y」的 X 与 Y 在同一尺度上' },
  { n: 15, name: '同义词循环', re: null, auto: false, hint: '同一事物在相邻两三句里被换成不同称呼' },
  { n: 16, name: '粗体机械滥用', re: /(?:\*\*[^*\n]{1,20}\*\*[^*\n]{0,8}){3,}/, genres: ['prose'], fix: '一段里三处以上加粗等于没有重点' },
  { n: 17, name: '聊天对话残留', re: /当然！|好问题[！!]|希望(这|它)能(帮到|对您)|希望对您(有所)?(启发|帮助)|如有(需要|疑问)请(随时)?(告诉|联系)|还有什么(可以|需要)帮/, fix: '改写成直接交付的正文，剔除对话残留' },
  { n: 18, name: '谄媚与过度奉承', re: /您(说得|提得)(完全)?(正确|非常对)|极具(前瞻性|洞察力)|(敏锐|精准)地(指出|洞察)|非常好的问题/, fix: '直接回应问题本身' },
  { n: 19, name: '知识截止免责', re: /截至我(最后)?的?(更新|知识)|据公开(资料|记录|信息)(显示|表明)|由于我的知识|虽然具体细节[^。；]{0,20}(稀缺|有限)/, fix: '查一次工商/年报再写，或删掉这段推测' },
  { n: 20, name: '过度限定软化', re: /在某种程度上[^。；]{0,20}(可能|或许)|可能潜在地|或许可能|在一定程度上[^。；]{0,15}可能|似乎(可能)?(会)?有一定/, fix: '给出一个可验证的判断或具体数字' },
  { n: 21, name: '填充废话短语', re: /为了实现这一目标|在这个时间点|值得注意的是|需要(指出|强调)的是|值得一提的是|总而言之|综上所述/, fix: '删掉垫句，直接说下一句' },
  { n: 22, name: '引号体例混用', test: (l) =>
      (/[「」『』]/.test(l) && /[“”‘’]/.test(l) ? '同段混用「」与“”' : null),
    fix: '同一篇内统一引号体例：全角引号 “ ” 或 「」 二选一，不要混用。若某刊例强制「」，属风格选择，用 muse:allow text-22 声明' },
  { n: 23, name: '知名度标签', re: /被(多家)?(主流)?媒体(争相)?(报道|转载)|由(顶尖|知名)专家(打造|操刀)|拥有(极高|巨大)(人气|影响力)|广受(好评|赞誉)/, fix: '用一次具体专访或事件替代头衔堆砌' },
  { n: 24, name: '无灵魂平铺', re: /一些人(赞同|支持)[^。；]{0,10}另一些人(反对|担忧)|未来影响(尚不明确|有待观察)|(仁者见仁|见仁见智)/, fix: '给出你的立场与具体代价，不做无观点的中立播报' },
];

const AUTO = PATTERNS.filter((p) => p.re || p.test);
/** 机器判不了的病灶：#15 同义词循环需要跨句语义，纯正则做不到。 */
const UNCOVERED = PATTERNS.filter((p) => !p.re && !p.test);

export function scanText(text, { genre = 'prose' } = {}) {
  const findings = [];
  const lines = text.split('\n');
  let inFence = false;
  lines.forEach((line, i) => {
    // 只扫正文，不扫围栏代码块 —— 与 lintMarkdown 只扫围栏块正好互补。
    // 围栏里放的是范例与模板（契约模板、提示词正文），把它们当违规是把
    // 「教人怎么写」误判成「这么写了」。
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (!line.trim()) return;
    // 与 ui 侧 rules.js 同一套跳过机制：**复述禁令的行**（「封杀『让我们拭目以待』」
    // 「严禁赋能、闭环」）是在描述规则，不是违规文本。少了这一步，技能自己的
    // 禁区清单会被自己的规则判罚——6.0 在 ui 侧修过同一个坑。
    if (isIgnoredLine(line)) return;
    // 规约体裁里，引号内是被提及而非被使用，见 quoteSpans 注释。
    const spans = genre === 'spec' ? quoteSpans(line) : [];
    for (const p of AUTO) {
      if (p.genres && !p.genres.includes(genre)) continue;
      const m = p.test ? p.test(line) : line.match(p.re);
      if (!m) continue;
      const hit = typeof m === 'string' ? m : m[0];
      if (spans.length) {
        const at = typeof m === 'string' ? line.indexOf(hit) : m.index;
        if (at >= 0 && spans.some(([s, e]) => at >= s && at <= e)) continue;
      }
      findings.push({
        pattern: p.n,
        name: p.name,
        line: i + 1,
        excerpt: line.trim().slice(0, 90),
        hit,
        fix: p.fix,
      });
    }
  });
  return findings;
}

/**
 * 按本文件的 `<!-- muse:allow text-N: 理由 -->` 声明把对应命中降级。
 * 与 ui 侧一致：降级不等于静音——声明过的偏离会被单独列出。
 */
export function splitByDeclaration(text, { genre } = {}) {
  const declared = parseDeclarations(text);
  // 体裁优先级：命令行 --genre > 文件自述 <!-- muse:genre spec --> > 散文。
  // 自述这一层是必需的——否则用户自己的提示词文件无从声明体裁，
  // 只能被按散文口径误判（它的禁令会被当成 AI 腔）。
  const fileGenre = parseGenre(text);
  const effective = GENRES.includes(genre) ? genre : GENRES.includes(fileGenre) ? fileGenre : 'prose';
  const found = scanText(text, { genre: effective });
  return {
    genre: effective,
    findings: found.filter((f) => !declared.has(`text-${f.pattern}`)),
    declared: found
      .filter((f) => declared.has(`text-${f.pattern}`))
      .map((f) => ({ ...f, reason: declared.get(`text-${f.pattern}`) })),
  };
}

/* ── 自检：用技能自己的 ❌ / ✅ 范例同时验证漏报与误伤 ───────────────
 * 一条规则如果抓不住它自己举的反例，那它只是装饰；
 * 如果它还会把技能自己给出的 ✅ 正例判为病灶，那它是噪音源。
 * 两个方向都要测——2026-09 只测了前一个，于是 #3 与 #22 的正则
 * 在「与自己的文档打架」的状态下通过了 23/23。 */
function selftest() {
  if (!existsSync(PROTOCOL)) {
    console.error(`找不到 ${PROTOCOL}`);
    process.exit(2);
  }
  const md = readFileSync(PROTOCOL, 'utf8');
  const rows = md
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) => l.split('|').map((c) => c.trim()));

  let caught = 0;
  let clean = 0;
  const misses = [];
  const falsePositives = [];
  const crossHits = [];

  for (const p of AUTO) {
    const row = rows.find((c) => c[1] === `**${p.n}**`);
    if (!row) continue;
    const bad = row[4] || '';   // ❌ 改写前（AI 腔样例）
    const good = row[5] || '';  // ✅ 改写后（人类表达样例）

    if (scanText(bad).some((h) => h.pattern === p.n)) caught++;
    else misses.push({ n: p.n, name: p.name, sample: bad.slice(0, 46) });

    if (!good) continue;
    const fp = scanText(good).filter((h) => h.pattern === p.n);
    if (fp.length) falsePositives.push({ n: p.n, name: p.name, sample: good.slice(0, 46) });
    else clean++;

    // 正例被**其它**规则命中：不一定是错，但说明规则之间互相侵占，
    // 值得看一眼——误伤通常就是这样开始的。
    for (const h of scanText(good)) {
      if (h.pattern !== p.n) crossHits.push({ by: h.pattern, owner: p.n, hit: h.hit });
    }
  }

  console.log(`\n规则自检`);
  console.log(`  抓得住自己的 ❌ 反例：${caught}/${AUTO.length}`);
  console.log(`  不误伤自己的 ✅ 正例：${clean}/${clean + falsePositives.length}`);

  if (misses.length) {
    console.log('\n漏报（规则过窄或范例过特殊，需人工决定）：');
    for (const f of misses) console.log(`  · #${f.n} ${f.name} — 「${f.sample}…」`);
  }
  if (falsePositives.length) {
    console.log('\n误伤（规则把自己的 ✅ 正例判成病灶，必须修）：');
    for (const f of falsePositives) console.log(`  · #${f.n} ${f.name} — 「${f.sample}…」`);
  }
  if (crossHits.length) {
    console.log(`\n交叉命中（正例被别的规则命中，仅供参考，共 ${crossHits.length} 处）：`);
    for (const c of crossHits.slice(0, 12)) console.log(`  · #${c.by} 命中了 #${c.owner} 的正例：${c.hit}`);
    if (crossHits.length > 12) console.log(`  · …另有 ${crossHits.length - 12} 处`);
  }
  console.log();
  // 漏报留作人工判断（保守起见的范例可能确实特殊）；误伤是明确缺陷，直接判失败。
  process.exit(falsePositives.length ? 1 : 0);
}

/* ── CLI ─────────────────────────────────────────────────────────
 * 只有直接运行本文件时才走 CLI。审计脚本要 import scanText / splitByDeclaration
 * 复用这套规则，若顶层直接 process.exit，import 方会被一起终止。 */
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

const AS_JSON = process.argv.slice(2).includes('--json');
const TARGETS = ['.md', '.txt', '.markdown'];

async function collect(path, out = []) {
  const st = statSync(path);
  if (st.isFile()) {
    out.push(path);
    return out;
  }
  for (const e of await readdir(path, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const full = join(path, e.name);
    if (e.isDirectory()) await collect(full, out);
    else if (TARGETS.includes(extname(full))) out.push(full);
  }
  return out;
}

async function main() {
  const raw = process.argv.slice(2);
  if (raw.includes('--selftest')) selftest();

  // --genre spec 与 --genre=spec 都收；值不能落进 targets 变成路径。
  // 未指定时留 null，交给 splitByDeclaration 去读文件自述的体裁。
  let flags = raw;
  let genre = null;
  const gi = raw.indexOf('--genre');
  const eq = raw.find((a) => a.startsWith('--genre='));
  if (gi !== -1 && raw[gi + 1] && !raw[gi + 1].startsWith('--')) {
    genre = raw[gi + 1];
    flags = raw.filter((_, i) => i !== gi && i !== gi + 1);
  } else if (eq) {
    genre = eq.slice('--genre='.length);
    flags = raw.filter((a) => a !== eq);
  }
  if (genre && !GENRES.includes(genre)) {
    console.error(`未知体裁「${genre}」。可用：${GENRES.join(' / ')}`);
    process.exit(2);
  }

  const USE_STDIN =
    flags.includes('--stdin') ||
    (!process.stdin.isTTY && !flags.filter((a) => !a.startsWith('--')).length);
  const targets = flags.filter((a) => !a.startsWith('--'));

  const reports = [];
  if (USE_STDIN && !targets.length) {
    const text = readFileSync(0, 'utf8');
    reports.push({ file: '<stdin>', ...splitByDeclaration(text, { genre }), chars: text.length });
  } else {
    let files = [];
    for (const t of targets) {
      if (!existsSync(t)) {
        console.error(`跳过不存在的路径: ${t}`);
        continue;
      }
      files = files.concat(await collect(t));
    }
    for (const f of [...new Set(files)]) {
      const text = readFileSync(f, 'utf8');
      reports.push({ file: f, ...splitByDeclaration(text, { genre }), chars: text.length });
    }
  }

  if (AS_JSON) {
    console.log(JSON.stringify(reports, null, 2));
  } else {
    let total = 0;
    let declaredTotal = 0;
    for (const r of reports) {
      if (!r.findings.length && !r.declared.length) continue;
      console.log(`\n${r.file}${r.genre && r.genre !== 'prose' ? `（体裁：${r.genre}）` : ''}`);
      if (r.findings.length) {
        const density = ((r.findings.length / Math.max(r.chars, 1)) * 1000).toFixed(1);
        console.log(`  ${r.findings.length} 处现象 / 千字密度 ${density}`);
        for (const f of r.findings) {
          console.log(`    L${f.line} #${f.pattern} ${f.name}：命中「${f.hit}」`);
          console.log(`         → ${f.fix}`);
        }
        total += r.findings.length;
      }
      if (r.declared.length) {
        console.log(`  已声明的例外 ${r.declared.length} 处（不计入退出码，但需可见）：`);
        for (const f of r.declared) {
          console.log(`    L${f.line} #${f.pattern} ${f.name}：${f.reason}`);
        }
        declaredTotal += r.declared.length;
      }
    }
    if (!total) console.log('\n✓ 未发现未声明的 AI 腔病征');
    console.log(
      `\n合计 ${total} 处${declaredTotal ? `（另有 ${declaredTotal} 处已声明）` : ''}。机器判不了的病灶：${UNCOVERED.map((p) => `#${p.n} ${p.name}（${p.hint}）`).join('；') || '无'}`
    );
    console.log('\n注意：本工具只报告可定位现象，不打那 50 分，也不判断文章好坏。\n');
  }

  process.exit(reports.some((r) => r.findings.length) ? 1 : 0);
}

if (isMain) main();
