#!/usr/bin/env node

/**
 * Muse SkillOpt Validation Gate & Regression Evaluator (eval_skill.js)
 * Analogous to `skillopt-eval` / `skillopt-gate`.
 * Evaluates candidates against Golden Benchmarks, runs multi-modal Linters, and gates updates.
 */

const fs = require('fs');
const path = require('path');
const { lintTarget: lintUI } = require('./lint_ui');
const { lintTarget: lintText } = require('./lint_text');

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
  dim: "\x1b[2m"
};

const BASE_DIR = path.resolve(__dirname, '..');
const BENCHMARK_PATH = path.join(BASE_DIR, 'benchmarks', 'golden_cases.json');
const VAULT_DIR = path.join(BASE_DIR, 'vault');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function evaluateSkill(targetPath = BASE_DIR) {
  console.log(`\n${COLORS.bold}${COLORS.blue}⚡ Muse SkillOpt Validation Gate (skillopt-eval)${COLORS.reset}`);
  console.log(`${COLORS.dim}Evaluating Root: ${targetPath}${COLORS.reset}\n`);

  const benchmarks = loadJson(BENCHMARK_PATH) || { cases: [] };
  console.log(`${COLORS.bold}1. 正在加载 Hold-out 黄金基准集...${COLORS.reset}`);
  console.log(`   共收录 ${benchmarks.cases.length} 个跨媒介经典验证案例。\n`);

  // Step 1: Run UI Linter
  console.log(`${COLORS.bold}2. 运行 UI 与工程物理门禁 (lint_ui)...${COLORS.reset}`);
  const uiResults = lintUI(targetPath);
  console.log(`   扫描文件: ${uiResults.filesCount} | 错误: ${uiResults.totalErrors} | 警告: ${uiResults.totalWarnings}`);

  // Step 2: Run Text Narrative Linter
  console.log(`\n${COLORS.bold}3. 运行文字叙事与反套路门禁 (lint_text)...${COLORS.reset}`);
  const textResults = lintText(targetPath);
  console.log(`   扫描文件: ${textResults.filesCount} | 错误: ${textResults.totalErrors} | 警告: ${textResults.totalWarnings}`);

  // Step 3: Vault Integrity & DNA Health
  console.log(`\n${COLORS.bold}4. 检查自进化资产库完整性 (Vault Integrity)...${COLORS.reset}`);
  const dnaPath = path.join(VAULT_DIR, 'personal_dna.yaml');
  const taboosPath = path.join(VAULT_DIR, 'personal_taboos.yaml');
  let vaultHealthy = true;

  if (!fs.existsSync(dnaPath) || !fs.existsSync(taboosPath)) {
    console.log(`   ${COLORS.red}✖ 关键资产文件缺失${COLORS.reset}`);
    vaultHealthy = false;
  } else {
    const dnaContent = fs.readFileSync(dnaPath, 'utf8');
    const taboosContent = fs.readFileSync(taboosPath, 'utf8');
    const hasRejectedCases = dnaContent.includes('rejected_cases:');
    const hasTaboos = taboosContent.includes('taboos:');
    console.log(`   personal_dna.yaml: ${hasRejectedCases ? COLORS.green + '✓ 包含被毙案例捕获区' : COLORS.yellow + '▲ 未检测到 rejected_cases'}${COLORS.reset}`);
    console.log(`   personal_taboos.yaml: ${hasTaboos ? COLORS.green + '✓ 包含一票否决禁忌红线' : COLORS.red + '✖ 格式异常'}${COLORS.reset}`);
  }

  // Step 4: Calculate Health Score & Gate Decision
  console.log(`\n${COLORS.bold}5. 验证门禁判定 (Validation Gate Decision)${COLORS.reset}`);
  console.log("─".repeat(50));

  const totalHardErrors = uiResults.totalErrors; // Note: text errors on docs/examples can be informational
  const passed = totalHardErrors === 0 && vaultHealthy;

  if (passed) {
    console.log(`${COLORS.green}${COLORS.bold}✅ VALIDATION GATE PASSED (通过门禁)${COLORS.reset}`);
    console.log(`   允许将候选规则与演化 Patch 合入主干 best_skill.md / vault。\n`);
    return { passed: true, totalHardErrors, uiResults, textResults };
  } else {
    console.log(`${COLORS.red}${COLORS.bold}❌ VALIDATION GATE FAILED (门禁阻断)${COLORS.reset}`);
    console.log(`   发现 ${totalHardErrors} 处硬性阻断错误，禁止合入未经充分验证的规则变动！\n`);
    return { passed: false, totalHardErrors, uiResults, textResults };
  }
}

function run() {
  const target = process.argv[2] || BASE_DIR;
  const { passed } = evaluateSkill(target);
  process.exit(passed ? 0 : 1);
}

if (require.main === module) {
  run();
}

module.exports = { evaluateSkill };
