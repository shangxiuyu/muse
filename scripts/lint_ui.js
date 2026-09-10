#!/usr/bin/env node

/**
 * Muse Deterministic Aesthetic & Accessibility Linter
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

const FORBIDDEN_WORDS = ["颠覆性", "赋能", "在当今快节奏的世界中", "不可否认", "全方位引领"];

function lintDirectoryContext(files) {
  let hasGlobalFocusVisible = false;
  let hasGlobalReducedMotion = false;

  files.forEach(f => {
    if (path.extname(f).toLowerCase() === '.css') {
      const c = fs.readFileSync(f, 'utf8');
      if (/:focus-visible/i.test(c)) hasGlobalFocusVisible = true;
      if (/prefers-reduced-motion/i.test(c)) hasGlobalReducedMotion = true;
    }
  });

  return { hasGlobalFocusVisible, hasGlobalReducedMotion };
}

function lintFile(filePath, context) {
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

  // 2. CSS / HTML Craftsmanship Rules
  if (ext === '.css' || ext === '.html') {
    const hasInteractive = /<(button|input|select|textarea|a\s)|(\.btn|\.button)/i.test(content);
    const hasFocusVisible = /:focus-visible/i.test(content) || context.hasGlobalFocusVisible;

    // A. Focus-visible Accessibility
    if (hasInteractive && !hasFocusVisible) {
      errors.push(`[8-State] 存在交互元素但未显式定义 ":focus-visible" 键盘可达焦点环`);
    }

    // B. Reduced-Motion Guard
    const hasAnimations = /(transition|animation)\s*:/i.test(content);
    const hasReducedMotion = /prefers-reduced-motion/i.test(content) || context.hasGlobalReducedMotion;
    if (hasAnimations && !hasReducedMotion) {
      warnings.push(`[Motion] 包含动效但缺少 "@media (prefers-reduced-motion: reduce)" 无障碍兜底`);
    }

    // C. Heavy Dirty Shadow & Extreme Gaussian Blur Taboos
    if (ext === '.css') {
      const extremeBlurRegex = /blur\(\s*(?:[5-9]\d{2,}|\d{4,})px\s*\)/i;
      if (extremeBlurRegex.test(content)) {
        errors.push(`[Optical Taboo] 发现大面积彩色高斯模糊光晕 (blur 半径过大)，违反 personal_taboos.yaml 红线`);
      }
    }
  }

  return { errors, warnings };
}

function run() {
  const target = process.argv[2] || '.';
  console.log(`\n${COLORS.bold}${COLORS.blue}🏛️  Muse Aesthetic & Craftsmanship Hard Linter${COLORS.reset}`);
  console.log(`${COLORS.dim}Target: ${path.resolve(target)}${COLORS.reset}\n`);

  let files = [];
  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    const scan = dir => {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (file.startsWith('.') || file === 'node_modules') return;
        if (fs.statSync(fullPath).isDirectory()) {
          scan(fullPath);
        } else if (['.html', '.css', '.js', '.tsx', '.jsx', '.md'].includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      });
    };
    scan(target);
  } else {
    files = [target];
  }

  const context = lintDirectoryContext(files);
  let totalErrors = 0;
  let totalWarnings = 0;

  files.forEach(f => {
    const rel = path.relative(process.cwd(), f);
    const { errors, warnings } = lintFile(f, context);
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    if (errors.length || warnings.length) {
      console.log(`${COLORS.bold}${rel}${COLORS.reset}`);
      errors.forEach(e => console.log(`  ${COLORS.red}✖ ${e}${COLORS.reset}`));
      warnings.forEach(w => console.log(`  ${COLORS.yellow}▲ ${w}${COLORS.reset}`));
      console.log('');
    }
  });

  console.log("─".repeat(50));
  if (totalErrors === 0) {
    console.log(`${COLORS.green}✓ All aesthetic and accessibility assertions passed!${COLORS.reset} (${totalWarnings} warnings)\n`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}✖ Linter failed with ${totalErrors} hard errors.${COLORS.reset}\n`);
    process.exit(1);
  }
}

run();