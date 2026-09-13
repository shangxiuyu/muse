#!/usr/bin/env node

/**
 * Muse Deterministic Aesthetic & Accessibility Linter (SkillOpt-Hardened)
 * Zero dependencies. Runs on native Node.js.
 * Enforces hard assertions for UI craftsmanship, 8-state accessibility, and Anti-Slop taboos.
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

const FORBIDDEN_WORDS = [
  "颠覆性", "赋能", "在当今快节奏的世界中", "不可否认", "全方位引领",
  "抓手", "一站式", "多维度", "闭环赋能"
];

function lintDirectoryContext(files) {
  let hasGlobalFocusVisible = false;
  let hasGlobalReducedMotion = false;

  files.forEach(f => {
    if (['.css', '.scss', '.less'].includes(path.extname(f).toLowerCase())) {
      const c = fs.readFileSync(f, 'utf8');
      if (/:focus-visible/i.test(c) || /focus-visible/i.test(c)) hasGlobalFocusVisible = true;
      if (/prefers-reduced-motion/i.test(c)) hasGlobalReducedMotion = true;
    }
  });

  return { hasGlobalFocusVisible, hasGlobalReducedMotion };
}

function lintFile(filePath, context = {}) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();
  const errors = [];
  const warnings = [];

  // 1. Text Pattern Check (Anti-Slop Copywriting)
  FORBIDDEN_WORDS.forEach(word => {
    if (content.includes(word)) {
      errors.push(`[Anti-Slop] 发现违禁假大空词汇: "${word}"`);
    }
  });

  // Check for AI slop eyebrow pattern: uppercase words followed by // and digits
  const slopEyebrowRegex = /[A-Z\s]{3,}\s*\/\/\s*\d{2}/;
  if (slopEyebrowRegex.test(content)) {
    warnings.push(`[Anti-Slop] 检测到 AI 模板化全大写双斜杠 Eyebrow 标签 (如 "ARCHITECTURE // 01")，建议替换为语义明确的微标`);
  }

  // 2. CSS / HTML / JSX / TSX Craftsmanship Rules
  const isWebCode = ['.css', '.html', '.jsx', '.tsx', '.vue', '.svelte'].includes(ext);
  if (isWebCode) {
    const hasInteractive = /<(button|input|select|textarea|a\s)|(\.btn|\.button)|className=["'][^"']*\b(btn|button)\b/i.test(content);
    
    // Check for focus-visible in CSS (:focus-visible) or Tailwind (focus-visible:ring, focus-visible:outline)
    const hasFocusVisible = 
      /:focus-visible/i.test(content) || 
      /focus-visible:(ring|outline|border)/i.test(content) || 
      context.hasGlobalFocusVisible;

    // A. Focus-visible Accessibility
    if (hasInteractive && !hasFocusVisible) {
      errors.push(`[8-State] 存在交互元素但未显式定义 ":focus-visible" 键盘焦点环 (或 Tailwind "focus-visible:ring-*")`);
    }

    // B. Reduced-Motion Guard
    const hasAnimations = /(transition|animation)\s*:/i.test(content) || /\banimate-(spin|pulse|bounce|fade|slide)\b/i.test(content);
    const hasReducedMotion = /prefers-reduced-motion/i.test(content) || context.hasGlobalReducedMotion;
    if (hasAnimations && !hasReducedMotion) {
      warnings.push(`[Motion] 包含动效但缺少 "@media (prefers-reduced-motion: reduce)" 或 "motion-reduce:" 无障碍兜底`);
    }

    // C. Optical Taboos (Extreme Blobs & Dirty Shadows)
    // C1. Large ambient gaussian blur blobs (e.g. blur(60px) ~ blur(500px) with color gradients)
    const blobBlurRegex = /blur\(\s*(?:[6-9]\d|[1-9]\d{2,})px\s*\)/i;
    const hasBlobKeyword = /blob|ambient-light|glow-bg|halo/i.test(content);
    if (blobBlurRegex.test(content) && hasBlobKeyword) {
      errors.push(`[Optical Taboo] 发现大面积彩色高斯模糊光晕 (blur 半径过大伴随环境光斑)，违反 personal_taboos.yaml 红线`);
    }

    // C2. Heavy Dirty Shadows (large blur radius with high opacity black)
    const dirtyShadowRegex = /box-shadow:\s*[^;]*rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*(?:0\.[3-9]|[1-9])\)[^;]*(?:[4-9]\d|\d{3,})px/i;
    if (dirtyShadowRegex.test(content)) {
      errors.push(`[Optical Taboo] 发现高不透明度深黑厚重脏阴影，请改用多层浅色微弥散阴影 (opacity <= 0.08)`);
    }

    // C3. MacOS Fake Traffic Lights Window Model
    if (/traffic-lights|mac-buttons|window-controls|bg-red-500.*bg-yellow-500.*bg-green-500/i.test(content)) {
      warnings.push(`[Anti-Slop] 检测到悬浮红黄绿三圆点的假 MacOS 窗口模型，违反禁忌库`);
    }
  }

  return { errors, warnings };
}

function lintTarget(targetPath) {
  let files = [];
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    const scan = dir => {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === '.git' || file === 'references' || file === 'benchmarks') return;
        if (fs.statSync(fullPath).isDirectory()) {
          scan(fullPath);
        } else if (['.html', '.css', '.scss', '.less', '.tsx', '.jsx', '.vue', '.svelte'].includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      });
    };
    scan(targetPath);
  } else {
    files = [targetPath];
  }

  const context = lintDirectoryContext(files);
  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  files.forEach(f => {
    const rel = path.relative(process.cwd(), f);
    const { errors, warnings } = lintFile(f, context);
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
  console.log(`\n${COLORS.bold}${COLORS.blue}🏛️  Muse Aesthetic & Craftsmanship Hard Linter (SkillOpt-Hardened)${COLORS.reset}`);
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
      console.log(`${COLORS.green}✓ All aesthetic and accessibility assertions passed!${COLORS.reset} (${filesCount} files checked, ${totalWarnings} warnings)\n`);
      process.exit(0);
    } else {
      console.log(`${COLORS.red}✖ Linter failed with ${totalErrors} hard errors across ${results.length} files.${COLORS.reset}\n`);
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

module.exports = { lintTarget, lintFile };