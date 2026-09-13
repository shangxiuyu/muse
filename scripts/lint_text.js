#!/usr/bin/env node

/**
 * Muse Deterministic Text & Narrative Linter (SkillOpt-Hardened)
 * Zero dependencies. Runs on native Node.js.
 * Enforces Hemingway-style conciseness, breath rhythm, and Anti-Slop vocabulary blacklists.
 * Directly sourced from GitHub projects:
 * - jalaalrd/anti-ai-slop-writing
 * - harshaneel/humanize
 * - lguz/humanize-writing-skill
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
  dim: "\x1b[2m"
};

// 完整对齐 jalaalrd/anti-ai-slop-writing 及 harshaneel/humanize 统计学高危词库
const FORBIDDEN_WORDS = [
  // 英文动作动词
  "delve into", "delve", "embark upon", "embark", "harness the power", "harness", 
  "elevate the", "elevate", "unlock the", "foster collaboration", "foster", 
  "bolster", "champion the", "resonate with",
  // 英文形容词
  "pivotal role", "pivotal", "intricate details", "intricate", "vibrant community", 
  "vibrant", "seamless integration", "seamlessly", "multifaceted", "bespoke solution", 
  "bespoke", "transformative journey", "transformative", "paramount importance", 
  "quintessential", "unparalleled", "game-changer", "revolutionary",
  // 英文名词/隐喻
  "rich tapestry", "tapestry", "beacon of", "cornerstone of", "symphony of", 
  "testament to", "evolving landscape", "in the realm of", "synergy",
  // 英文陈词滥调连接词
  "in today's fast-paced world", "furthermore", "moreover", "consequently",
  
  // 中文假大空与公关套话
  "颠覆性", "赋能", "在当今快节奏的世界中", "不可否认", "全方位引领",
  "抓手", "一站式", "多维度", "闭环赋能", "重磅推出", "匠心打造",
  "底层逻辑", "顶层设计", "生态闭环", "痛点直击", "画卷", "双刃剑",
  "毋庸置疑", "深远影响", "令人叹为观止", "深入探讨"
];

function lintTextContent(content, filename = "") {
  const errors = [];
  const warnings = [];

  // 1. 如果是 Markdown 文件，先过滤代码块与行内代码，避免将规范/反例/代码本身当成违规
  let cleanLines = [];
  let inCodeBlock = false;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // 豁免教学中的反面教材行（如明确带有 ❌、改前、反例等修饰）
    if (trimmed.startsWith('❌') || trimmed.includes('改前') || trimmed.includes('反面教材') || trimmed.includes('反例')) {
      continue;
    }

    // 过滤行内代码 `...`，避免代码变量或引述触发
    const lineWithoutInlineCode = line.replace(/`[^`]+`/g, '');
    cleanLines.push(lineWithoutInlineCode);
  }

  const inspectableText = cleanLines.join('\n');

  // 2. 词汇黑名单探测 (Slop Blacklist)
  FORBIDDEN_WORDS.forEach(word => {
    // 词边界检查（英文加 \b，中文不加）
    const isAscii = /^[a-z0-9\s'-]+$/i.test(word);
    const pattern = isAscii ? `\\b${word}\\b` : word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(pattern, 'gi');

    let match;
    while ((match = regex.exec(inspectableText)) !== null) {
      errors.push(`[Text Anti-Slop] 发现违禁套话词汇: "${match[0]}"`);
    }
  });

  // 3. 双斜杠 AI 模板化 Eyebrow 标签探测 (如 "ARCHITECTURE // 01")
  const eyebrowRegex = /[A-Z\s]{3,}\s*\/\/\s*\d{2}/g;
  if (eyebrowRegex.test(inspectableText)) {
    warnings.push(`[Text Anti-Slop] 发现全大写双斜杠 Eyebrow 标签 (如 "ARCHITECTURE // 01")，建议用纯粹小标或省略`);
  }

  // 4. 连续长句无呼吸检测 (Run-on sentence with > 3 commas without breath)
  const sentences = inspectableText.split(/[\n。！？.!?]/);
  sentences.forEach(s => {
    const trimmed = s.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('<') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('|')) return;

    // 豁免生图 Prompt 参数行（如包含 --ar, --style 等参数）
    if (trimmed.includes('--ar') || trimmed.includes('--style') || trimmed.includes('--v ') || trimmed.includes('--no ')) {
      return;
    }

    // 统计中文逗号与英文逗号
    const commaCount = (trimmed.match(/[,，]/g) || []).length;
    if (commaCount > 4) {
      warnings.push(`[Breathing Cadence] 发现长句包含 ${commaCount} 个逗号无句点休止: "${trimmed.slice(0, 45)}..."，建议拆分为海明威短句`);
    }

    // 统计纯单句长度是否过长 (> 65 字)
    if (trimmed.length > 65 && !trimmed.includes('http')) {
      warnings.push(`[Micro-Hierarchy] 单句过长 (${trimmed.length} 字): "${trimmed.slice(0, 35)}..."，缺少节奏顿挫`);
    }
  });

  // 5. 滥用居中点探测 (A · B · C 模式堆砌)
  const middleDotRegex = /(?:\S+\s*[·•]\s*){4,}\S+/;
  if (middleDotRegex.test(inspectableText)) {
    warnings.push(`[Layout Taboo] 检测到 4 个以上元信息连续使用居中点 "·" 堆砌，容易破坏视觉重心`);
  }

  return { errors, warnings };
}

function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return lintTextContent(content, filePath);
}

function lintTarget(targetPath) {
  let files = [];
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    const scan = dir => {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === '.git' || file === 'scripts') return;
        if (fs.statSync(fullPath).isDirectory()) {
          scan(fullPath);
        } else if (['.md', '.txt', '.html', '.json'].includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      });
    };
    scan(targetPath);
  } else {
    files = [targetPath];
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  files.forEach(f => {
    const rel = path.relative(process.cwd(), f);
    const { errors, warnings } = lintFile(f);
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    if (errors.length || warnings.length) {
      results.push({ file: rel, errors, warnings });
    }
  });

  return { filesCount: files.length, totalErrors, totalWarnings, results };
}

function run() {
  const target = process.argv[2] || '.';
  console.log(`\n${COLORS.bold}${COLORS.blue}✍️  Muse Narrative & Text Craftsmanship Linter (SkillOpt-Hardened)${COLORS.reset}`);
  console.log(`${COLORS.dim}Target: ${path.resolve(target)}${COLORS.reset}\n`);

  try {
    const { filesCount, totalErrors, totalWarnings, results } = lintTarget(target);

    results.forEach(({ file, errors, warnings }) => {
      console.log(`${COLORS.bold}${file}${COLORS.reset}`);
      errors.forEach(e => console.log(`  ${COLORS.red}✖ ${e}${COLORS.reset}`));
      warnings.forEach(w => console.log(`  ${COLORS.yellow}▲ ${w}${COLORS.reset}`));
      console.log('');
    });

    console.log("─".repeat(50));
    if (totalErrors === 0) {
      console.log(`${COLORS.green}✓ All text narrative assertions passed!${COLORS.reset} (${filesCount} files checked, ${totalWarnings} warnings)\n`);
      process.exit(0);
    } else {
      console.log(`${COLORS.red}✖ Narrative Linter failed with ${totalErrors} hard errors across ${results.length} files.${COLORS.reset}\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`${COLORS.red}Execution error:${COLORS.reset}`, err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = { lintTarget, lintFile, lintTextContent };
