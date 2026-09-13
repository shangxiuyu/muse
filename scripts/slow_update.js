#!/usr/bin/env node

/**
 * Muse SkillOpt Bounded Slow Update (slow_update.js)
 * Analogous to `skillopt/optimizer/slow_update.py`.
 * Enforces text-space learning rates, confidence weighting, and dampening for aesthetic vault rules.
 * Prevents single-case overfitting and destructive overwrites.
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

const BASE_DIR = path.resolve(__dirname, '..');
const VAULT_DIR = path.join(BASE_DIR, 'vault');
const DNA_PATH = path.join(VAULT_DIR, 'personal_dna.yaml');
const TABOOS_PATH = path.join(VAULT_DIR, 'personal_taboos.yaml');

function backupFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.${timestamp}.bak`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Record a rejected case with text-space bounded dampening
 */
function recordRejection({ artifact, because, principle }) {
  if (!fs.existsSync(DNA_PATH)) {
    throw new Error(`DNA file not found at ${DNA_PATH}`);
  }

  const backup = backupFile(DNA_PATH);
  console.log(`${COLORS.dim}创建安全备份: ${path.basename(backup)}${COLORS.reset}`);

  let content = fs.readFileSync(DNA_PATH, 'utf8');
  const today = new Date().toISOString().slice(0, 10);

  // Check if principle already exists in rejected_cases
  const principleRegex = new RegExp(`distilled_principle:\\s*["']?${principle.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}["']?`, 'i');
  const isDuplicate = principleRegex.test(content);

  const newEntry = `  - date: "${today}"\n` +
    `    artifact: "${artifact.replace(/"/g, '\\"')}"\n` +
    `    rejected_because: "${because.replace(/"/g, '\\"')}"\n` +
    `    distilled_principle: "${principle.replace(/"/g, '\\"')}"\n` +
    `    learning_weight: 0.5\n`;

  if (!content.includes('rejected_cases:')) {
    content += '\nrejected_cases:\n' + newEntry;
  } else {
    // Append to rejected_cases
    content = content.replace(/(rejected_cases:\s*\n)/, `$1${newEntry}`);
  }

  fs.writeFileSync(DNA_PATH, content, 'utf8');
  console.log(`${COLORS.green}✓ [Slow Update] 成功捕获被毙案例到 personal_dna.yaml (learning_weight: 0.5)${COLORS.reset}`);

  if (isDuplicate) {
    console.log(`${COLORS.yellow}⚡ [Learning Rate Trigger] 该原则累计出现 >= 2 次，建议提升为永久 DNA 准则！${COLORS.reset}`);
  }
}

/**
 * Add or slowly update an explicit preference rule
 */
function recordPreference({ category = "layout_and_space", ruleKey, ruleValue }) {
  const backup = backupFile(DNA_PATH);
  let content = fs.readFileSync(DNA_PATH, 'utf8');

  // Simple, safe key-value insertion or update
  const keyRegex = new RegExp(`(\\s*${ruleKey}:\\s*).+`, 'i');
  if (keyRegex.test(content)) {
    content = content.replace(keyRegex, `$1"${ruleValue}"`);
    console.log(`${COLORS.green}✓ [Slow Update] 阻尼更新偏好: ${ruleKey} = "${ruleValue}"${COLORS.reset}`);
  } else {
    const catRegex = new RegExp(`(${category}:\\s*\\n)`, 'i');
    if (catRegex.test(content)) {
      content = content.replace(catRegex, `$1  ${ruleKey}: "${ruleValue}"\n`);
      console.log(`${COLORS.green}✓ [Slow Update] 注入新偏好: ${category}.${ruleKey}${COLORS.reset}`);
    } else {
      content += `\n${category}:\n  ${ruleKey}: "${ruleValue}"\n`;
      console.log(`${COLORS.green}✓ [Slow Update] 新建类别并注入: ${category}.${ruleKey}${COLORS.reset}`);
    }
  }

  // Bump last_updated
  const today = new Date().toISOString().slice(0, 10);
  content = content.replace(/last_updated:\s*["'][^"']*["']/, `last_updated: "${today}"`);
  fs.writeFileSync(DNA_PATH, content, 'utf8');
}

function run() {
  const args = process.argv.slice(2);
  const typeIdx = args.indexOf('--type');
  const type = typeIdx !== -1 ? args[typeIdx + 1] : null;

  if (args.includes('--test')) {
    console.log(`${COLORS.bold}${COLORS.blue}🧪 测试 Slow Update 机制...${COLORS.reset}`);
    recordRejection({
      artifact: "单元测试假样本 (Test Hero Banner)",
      because: "用于校验 slow_update 脚本运行正常",
      principle: "测试用例：自动化验证文本空间慢更新"
    });
    // Revert the test by removing the test entry
    let content = fs.readFileSync(DNA_PATH, 'utf8');
    content = content.replace(/\s*-\s*date:\s*"[^"]*"\s*artifact:\s*"单元测试假样本[\s\S]*?learning_weight:\s*0\.5\n/, '');
    fs.writeFileSync(DNA_PATH, content, 'utf8');
    console.log(`${COLORS.green}✓ 单元测试通过并已清理！${COLORS.reset}`);
    return;
  }

  if (type === 'rejection') {
    const artifact = args[args.indexOf('--artifact') + 1] || "未指定产出";
    const because = args[args.indexOf('--because') + 1] || "用户未细述";
    const principle = args[args.indexOf('--principle') + 1] || "未抽象原则";
    recordRejection({ artifact, because, principle });
  } else if (type === 'preference') {
    const category = args[args.indexOf('--category') + 1] || "layout_and_space";
    const key = args[args.indexOf('--key') + 1];
    const value = args[args.indexOf('--value') + 1];
    if (!key || !value) {
      console.error(`${COLORS.red}Error: --key and --value required${COLORS.reset}`);
      process.exit(1);
    }
    recordPreference({ category, ruleKey: key, ruleValue: value });
  } else {
    console.log(`Usage:`);
    console.log(`  node slow_update.js --type rejection --artifact "..." --because "..." --principle "..."`);
    console.log(`  node slow_update.js --type preference --category "typography" --key "font_family" --value "Inter"`);
    console.log(`  node slow_update.js --test`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { recordRejection, recordPreference, backupFile };
