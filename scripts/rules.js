// muse:ignore-file: 本文件是规则引擎，源码中必然包含被禁模式的字面量与正则（100vh、Jane Doe、U+FE0F 等），不是 UI 产出
/**
 * Muse 规则引擎：把《负向底线》从散文变成可执行的检查。
 *
 * 这里的检查是**提示性**的：通过不等于作品美、可用或无障碍合规；
 * 失败也只指出可定位现象，不替代真实相遇（渲染、操作、播放）。
 *
 * 忽略机制（避免把「反例演示 / 军规清单描述行」误判为违规）：
 *   - 行内含 ❌ 🚫 严禁 禁止 封杀 拒绝 规避 伪数据 假数据 反例 等标记 → 跳过该行
 *     （契约模板里的禁令清单常以「严厉封杀…Jane Doe 伪数据」这类句式复述规则，
 *      它是**规则的文字描述**而非违规代码，因此按标记词跳过。
 *      2026-09 补入「拒绝 / 规避 / 摒弃」：muse 自己的〈绝对禁区〉清单用的是
 *      「拒绝『在当今时代』等开场白」这种句式，漏掉这三个词会让技能自己的
 *      禁区清单被自己的规则判罚——lint_text.js 与这里共用同一个判定。）
 *   - `<!-- audit:ignore-next -->` → 跳过下一行
 *   - `<!-- audit:ignore-file -->` → 跳过整个文件
 */

// U+1F000–1FAFF 是绝大多数图形 emoji 所在面；变体选择符 U+FE0F 强制彩色呈现。
const EMOJI = /[\u{1F000}-\u{1FAFF}]|\u{FE0F}|[\u{1F1E6}-\u{1F1FF}]/u;

// 允许的单色排版符号（DESIGN.md 明确接受 ✦ 这类排版符号）
const TYPOGRAPHIC = new Set(['✓', '✕', '✖', '✦', '❖', '→', '➔', '←', '↑', '↓', '·', '•', '—', '×', '÷', '★', '☆', '◆', '◇', '■', '□', '▲', '▼', '▸', '◦']);

export function isIgnoredLine(line) {
  if (/audit:ignore/i.test(line)) return true;
  if (/[❌🚫]/.test(line)) return true;
  if (/^\s*(?:[-*#>\d.]+\s*)?(?:反例|反面|Don'?t)\s*[：:]/i.test(line)) return true;
  if (/^\s*(?:[-*+]\s*|\d+[.)]\s*|[#>]+\s*)(?:严厉)?(?:封杀|严禁|禁止|拒绝|规避|摒弃)/.test(line)) return true;
  if (/(?:封杀|严禁|禁止)[“『][^”』]+[”』]/.test(line)) return true;
  return false;
}

/**
 * 把文档里**演示语法的地方**剥掉，只留正文。
 *
 * 这是必需的：文档要教人怎么写声明，就必然会在示例里写下声明本身。
 * 若不剥离，每份说明文档都会给自己发一张豁免——6.0 开发中这个坑踩了三次
 * （围栏代码块、行内代码、规则描述行），所以这里一次说清：
 *   - ``` 围栏代码块 → 示例
 *   - `行内代码` → 示例
 * 只认正文里的裸标记才算真声明。
 */
function stripExamples(markdown) {
  return markdown
    .replace(/^[ \t]*```[^\n`]*\n[\s\S]*?^[ \t]*```[ \t]*$/gm, '')
    .replace(/`[^`\n]*`/g, '');
}

/**
 * 显式声明的例外 —— 6.0 用来取代「绝对封杀」。
 *
 * 底线默认生效；当某个母体或某份契约确实需要偏离时，必须留下可见的声明与理由：
 *
 *   <!-- muse:allow pure-black: 新粗野画框以 2px 纯黑实线为形式语言 -->
 *
 * 声明只在**本文件内**生效，并会被 audit 原样列出。偏离被允许，但不被隐藏。
 * 没有理由的声明视为无效。
 */
export function parseDeclarations(markdown) {
  const prose = stripExamples(markdown);
  const allow = new Map();
  for (const m of prose.matchAll(/<!--\s*muse:allow\s+([^:>]+):\s*([^>]+?)\s*-->/g)) {
    const rules = m[1].split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    const reason = m[2].trim();
    if (!reason) continue;
    for (const r of rules) allow.set(r, reason);
  }
  return allow;
}

/**
 * 退役标记：文件自述已被取代，不再由主入口路由。
 * 用于「内容已折叠进别处、但保留在磁盘上供追溯」的文件，避免它们被当成孤儿或漏路由。
 *   <!-- muse:superseded: 内容已折叠进 ui_grammar.md / ui_floors.md -->
 */
export function parseSuperseded(markdown) {
  const m = stripExamples(markdown).match(/<!--\s*muse:superseded\s*:\s*([^>]+?)\s*-->/);
  return m ? m[1].trim() : null;
}

/**
 * 体裁声明：文件自述它是散文还是规约，供文本检查器选择判据。
 *   <!-- muse:genre spec -->
 * 与 muse:superseded 同类——文件级元信息，只认正文、不认示例。
 * 没有声明时按散文处理；命令行 --genre 可覆盖本声明。
 */
export function parseGenre(markdown) {
  const m = stripExamples(markdown).match(/<!--\s*muse:genre\s+([a-z]+)\s*-->/);
  return m ? m[1].trim() : null;
}

/** 从 markdown 中取出所有围栏代码块，保留起始行号以便定位。 */
export function extractFencedBlocks(markdown) {
  const blocks = [];
  const re = /^[ \t]*```([^\n`]*)\n([\s\S]*?)^[ \t]*```[ \t]*$/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    const lang = (m[1] || '').trim().toLowerCase();
    const body = m[2];
    const startLine = markdown.slice(0, m.index).split('\n').length + 1;
    blocks.push({ lang, body, startLine });
  }
  return blocks;
}

/** 逐行扫描一段文本，产出违规项。 */
function scanLines(text, startLine, test, rule, detailFn, severity = 'error') {
  const out = [];
  text.split('\n').forEach((line, i) => {
    if (isIgnoredLine(line)) return;
    const hit = test(line);
    if (hit) {
      out.push({
        rule,
        severity,
        line: startLine + i,
        detail: detailFn ? detailFn(line, hit) : line.trim().slice(0, 120),
      });
    }
  });
  return out;
}

/* ── 规则 1：Emoji 充当 UI 图标 ───────────────────────────────── */
function checkEmoji(text, startLine) {
  return scanLines(
    text,
    startLine,
    (l) => {
      const m = l.match(EMOJI);
      if (!m) return null;
      // 单色排版符号不算 emoji
      if (TYPOGRAPHIC.has(m[0]) && m[0] !== '️') return null;
      return m[0];
    },
    'emoji-icon',
    (l, ch) => `发现 emoji「${ch}」，应改用单色矢量 SVG（Lucide / Phosphor）`
  );
}

/* ── 规则 2：纯黑底 —— 只针对底色，不针对硬阴影 / 文字 ──────────────
 * 底线封杀的是「死黑底」，新粗野主义要用纯黑做偏置硬阴影与描边，
 * 二者不矛盾。因此把「底色」判为 error，「其他用途」只作提示。 */
const PURE_BLACK = /#000(?![0-9a-fA-F])|#000000|rgb\(\s*0\s*[,\s]\s*0\s*[,\s]\s*0\s*\)/i;
function checkPureBlack(text, startLine) {
  return scanLines(
    text,
    startLine,
    (l) => {
      // 必须精确判断「纯黑是 background 的值」，而不是「这一行既有 background 又有纯黑」。
      // 例：`background:#FFF; color:#000` 里的 #000 是文字色，不是底色。
      const bg = l.match(/(?:^|[;{\s])background(?:-color)?\s*:\s*([^;}]+)/i);
      if (bg && PURE_BLACK.test(bg[1])) return 'bg';
      if (!PURE_BLACK.test(l)) return null;
      return 'other';
    },
    'pure-black',
    (l, kind) =>
      kind === 'bg'
        ? '纯黑作为底色，应按底线改用深岩灰（如 #090B0E / #0F1115）'
        : `纯黑用于阴影 / 描边 / 文字（新粗野主义等母体的正当手法，需确认是有意选择）：${l.trim().slice(0, 70)}`,
    null // severity 由下方按 kind 决定
  ).map((v) => ({ ...v, severity: /纯黑作为底色/.test(v.detail) ? 'error' : 'info' }));
}

/* ── 规则 3：圆角容器贴单侧直边色条 ───────────────────────────── */
function checkRoundedLeftBar(text, startLine) {
  const out = [];
  const re = /([^{}\n][^{}]*)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const body = m[2];
    const line = startLine + text.slice(0, m.index).split('\n').length - 1;
    const bar = body.match(/border-(?:left|inline-start)(?:-width)?:\s*([\d.]+)px/);
    if (!bar) continue;
    const radius = body.match(/border-radius:\s*([^;}]+)/);
    if (!radius) continue;
    const nonzero = radius[1]
      .split('/')
      .some((part) => part.trim().split(/\s+/).some((v) => v !== '0' && v !== '0px' && v !== '0%'));
    if (!nonzero) continue;
    if (isIgnoredLine(body)) continue;
    out.push({
      rule: 'rounded-left-bar',
      severity: 'error',
      line,
      detail: `圆角容器上贴了 ${bar[1]}px 左侧直边色条（曲率冲突），应改为全包围 1px 细线或柔和色阶`,
    });
  }
  return out;
}

/* ── 规则 4：可预测的假数据 ───────────────────────────────────── */
function checkFakeData(text, startLine) {
  return scanLines(
    text,
    startLine,
    (l) => /\b(John Doe|Jane Doe|Acme\s+Corp|Lorem ipsum|foo@bar|example\.com)\b|99\.99\s*%/i.test(l),
    'fake-data',
    () => '出现占位假数据（Jane Doe / Acme / 99.99%），应改用有机且具有业务深度的真实数据'
  );
}

/* ── 规则 5：驱动几何属性的动画（引发 reflow）──────────────────── */
function checkLayoutAnimation(text, startLine) {
  const out = [];
  // transition / animation 声明里点名了几何属性
  out.push(
    ...scanLines(
      text,
      startLine,
      (l) => /transition[^;}]*:\s*[^;}]*\b(width|height|top|left|right|bottom|margin|padding|font-size)\b/i.test(l),
      'layout-transition',
      (l) => `过渡驱动了几何属性，只允许 transform 与 opacity：${l.trim().slice(0, 90)}`
    )
  );
  // @keyframes 内改写几何属性
  const re = /@keyframes[^{]*\{([\s\S]*?)\n\s*\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const body = m[1];
    const line = startLine + text.slice(0, m.index).split('\n').length - 1;
    if (isIgnoredLine(body)) continue;
    const hit = body.match(/^\s*(width|height|top|left|right|bottom|margin|padding)\s*:/m);
    if (hit) {
      out.push({
        rule: 'layout-transition',
        severity: 'error',
        line,
        detail: `@keyframes 改写了 ${hit[1]}，引发 reflow；应改用 transform`,
      });
    }
  }
  return out;
}

/* ── 规则 6：100vh / h-screen ─────────────────────────────────── */
function checkViewportUnit(text, startLine) {
  return scanLines(
    text,
    startLine,
    (l) => /100vh|h-screen/.test(l),
    'viewport-unit',
    () => '使用 100vh / h-screen 会被移动端地址栏遮挡，应改用 100dvh / min-h-[100dvh]'
  );
}

/* ── 规则 7：字号是否来自一条明确的阶梯 ──────────────────────────
 * 原则不是「必须 N×4」，而是「有来源，不是随手填」。
 * 14/15/18px 是常见半档，只作提示；13/17/27 这类无来源的任意值同样只提示
 * ——因为是否成立取决于该母体声明的字阶，机械判罚会与「有原理，无公式」冲突。 */
function checkModularScale(text, startLine) {
  return scanLines(
    text,
    startLine,
    (l) => {
      const m = l.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
      if (!m) return null;
      const px = parseFloat(m[1]);
      if (px % 4 === 0 || px <= 3) return null;
      return m[1];
    },
    'modular-scale',
    (l, v) => `字号 ${v}px 不在 4px 阶梯上；若母体未声明该档位，应在设计契约中说明理由`,
    'info'
  );
}

/* ── 规则 8：引用了未定义的 CSS 变量 ────────────────────────────
 * 作用域是**整个文件**，不是单个代码块：母体常在一个块里给 :root，
 * 在后续块里使用。按块判断会产生大量误报。 */
export function collectCssVars(text) {
  const defined = new Set();
  for (const m of text.matchAll(/(^|[;{\s])(--[a-zA-Z0-9-]+)\s*:/gm)) defined.add(m[2]);
  return defined;
}

export function extractCssVarUsages(text) {
  const results = [];
  const regex = /var\(\s*(--[a-zA-Z0-9-]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1];
    const startIndex = match.index;
    let depth = 1;
    let currentIndex = startIndex + match[0].length;
    let hasComma = false;
    let fallbackText = '';

    while (currentIndex < text.length && depth > 0) {
      const ch = text[currentIndex];
      if (ch === '(') {
        depth++;
        if (hasComma) fallbackText += ch;
      } else if (ch === ')') {
        depth--;
        if (depth === 0) break;
        if (hasComma) fallbackText += ch;
      } else if (ch === ',' && depth === 1) {
        hasComma = true;
      } else if (hasComma) {
        fallbackText += ch;
      }
      currentIndex++;
    }

    const hasFallback = hasComma && fallbackText.trim().length > 0;
    results.push({
      name: varName,
      hasFallback,
      fallback: fallbackText.trim(),
    });
  }
  return results;
}

export function findUndefinedCssVars(text, defined = collectCssVars(text)) {
  const used = new Map();
  text.split('\n').forEach((line, i) => {
    const usages = extractCssVarUsages(line);
    for (const u of usages) {
      if (u.hasFallback) continue;
      if (!used.has(u.name)) used.set(u.name, i + 1);
    }
  });

  const out = [];
  for (const [name, line] of used) {
    if (!defined.has(name)) {
      out.push({
        rule: 'undefined-css-var',
        severity: 'error',
        line,
        detail: `使用了未定义的变量 var(${name})，复制该代码将失效`,
      });
    }
  }
  return out;
}

/* ── 规则 9：等宽三等分栅格 ──────────────────────────────────────
 * 《负向底线》封杀横排 3 等分等宽卡片（模板化布局的第一特征）。
 * 检测的是**等宽三列**这一事实，不禁止「三个元素」——三个元素用非等宽、
 * 错位、裸排或跨列都成立。 */
function checkThreeEqualColumns(text, startLine) {
  return scanLines(
    text,
    startLine,
    (l) => {
      if (/repeat\(\s*3\s*,\s*1fr\s*\)/i.test(l)) return 'repeat(3, 1fr)';
      if (/grid-template-columns\s*:\s*1fr\s+1fr\s+1fr/i.test(l)) return '1fr 1fr 1fr';
      if (/grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*minmax\([^)]*\)\s*\)/i.test(l)) return 'repeat(3, minmax(...))';
      return null;
    },
    'three-equal-columns',
    (l, hit) => `等宽三等分（${hit}）：模板化布局的第一特征。改用非等宽的 7:3、2 列错位 Zig-Zag、裸排数据列表，或让首项压舱加宽`
  );
}

/* ── 规则 10：z-index 滥用 ────────────────────────────────────── */
function checkZIndex(text, startLine) {
  return scanLines(
    text,
    startLine,
    (l) => /z-index:\s*(?:[5-9]\d|1\d\d+)\b|z-\[?[5-9]\d\]?/.test(l),
    'z-index-abuse',
    (l) => `z-index 偏高，应保留给模态与系统级图层：${l.trim().slice(0, 80)}`,
    'warning'
  );
}

/**
 * 对一段代码（CSS / HTML / JS 混排）执行全部规则。
 * @param {string} text
 * @param {number} startLine 该段在源文件中的起始行号
 * @param {{cssVars?: boolean}} opts
 */
export function lintCode(text, startLine = 1, opts = {}) {
  const results = [
    ...checkEmoji(text, startLine),
    ...checkPureBlack(text, startLine),
    ...checkRoundedLeftBar(text, startLine),
    ...checkFakeData(text, startLine),
    ...checkLayoutAnimation(text, startLine),
    ...checkViewportUnit(text, startLine),
    ...checkModularScale(text, startLine),
    ...checkThreeEqualColumns(text, startLine),
    ...checkZIndex(text, startLine),
  ];
  if (opts.cssVars !== false && opts.definedVars) {
    results.push(
      ...findUndefinedCssVars(text, opts.definedVars).map((v) => ({ ...v, line: startLine + v.line - 1 }))
    );
  }
  return results;
}

/**
 * 对 markdown 文件执行检查：只扫围栏代码块，散文里的规则描述不算违规。
 * 变量定义先按**整篇文件**收集，再逐块检查引用。
 */
export function lintMarkdown(markdown, { checkVars = true } = {}) {
  if (markdown.includes('<!-- audit:ignore-file -->')) return [];
  const defined = checkVars ? collectCssVars(markdown) : null;
  const declared = parseDeclarations(markdown);
  const out = [];
  for (const block of extractFencedBlocks(markdown)) {
    if (!block.lang) continue; // 无语言标记的块通常是目录树 / ASCII 图
    out.push(...lintCode(block.body, block.startLine, { cssVars: checkVars, definedVars: defined }));
  }
  // 已声明的例外降级为 info，并把理由带进报告，避免「声明即静音」
  // 不可豁免规则（事实与真实性底线，如 fake-data）禁止降级，保持原有的判罚级别
  return out.map((v) =>
    declared.has(v.rule) && !NON_WAIVABLE_RULES.has(v.rule)
      ? { ...v, severity: 'info', declared: declared.get(v.rule), detail: `[已声明] ${declared.get(v.rule)} — ${v.detail}` }
      : v
  );
}

export const NON_WAIVABLE_RULES = new Set(['fake-data']);

export const RULES = {
  'emoji-icon': 'Emoji 不作 UI 功能图标；单色排版符号（✓ ✦ → 等）不在其列',
  'pure-black': '纯黑不作底色；作硬阴影 / 描边是母体的正当手法，只提示不判罚',
  'rounded-left-bar': '圆角容器不贴单侧直边色条（曲率冲突）',
  'fake-data': '不使用可预测的占位假数据',
  'layout-transition': '动画只驱动 transform 与 opacity',
  'viewport-unit': '用 100dvh 而非 100vh / h-screen',
  'modular-scale': '字号应来自母体声明过的阶梯，而非随手填的任意值',
  'three-equal-columns': '横排 3 等分等宽是模板化布局的第一特征；三个元素要用非等宽/错位/裸排/跨列',
  'undefined-css-var': '引用的 CSS 变量必须在同一文件内定义（作用域为整篇）',
  'z-index-abuse': 'z-index 保留给模态与系统级图层',
};
