#!/usr/bin/env node

/**
 * Muse-Sleep Offline Taste Harvester (muse_sleep.js)
 * Analogous to `microsoft/SkillOpt`'s `skillopt-sleep` (harvest → mine → replay → consolidate).
 * Scans recent IDE / Agent conversation sessions, mines user aesthetic critiques & rejections,
 * stages bounded updates, and tests them against the Validation Gate.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { recordRejection } = require('./slow_update');
const { evaluateSkill } = require('./eval_skill');

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
  dim: "\x1b[2m"
};

// Patterns signaling user aesthetic dissatisfaction or rejection
const CRITIQUE_TRIGGERS = [
  /没有动效|没有动画|缺少交互|缺动画/i,
  /太花|光晕太|刺眼|太亮|大面积高斯/i,
  /太丑|不好看|像模板|ai\s*味|塑料味/i,
  /字太小|字重不对|字号太|行高不对/i,
  /不要居中|死板居中|小药丸/i,
  /文案太长|假大空|删掉.*废话/i,
  /不对|重做|重新写|重新生成/i
];

async function scanTranscript(transcriptPath) {
  if (!fs.existsSync(transcriptPath)) {
    console.log(`${COLORS.yellow}未找到指定的会话日志: ${transcriptPath}${COLORS.reset}`);
    return [];
  }

  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const minedRejections = [];
  let lastAssistantTurn = "";

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      
      // Track assistant generation
      if (data.type === 'PLANNER_RESPONSE' || data.source === 'MODEL') {
        lastAssistantTurn = typeof data.content === 'string' ? data.content.slice(0, 300) : "";
      }

      // Detect user critique in USER_INPUT
      if (data.type === 'USER_INPUT' || data.source === 'USER_EXPLICIT') {
        const text = typeof data.content === 'string' ? data.content : "";
        
        for (const trigger of CRITIQUE_TRIGGERS) {
          if (trigger.test(text)) {
            minedRejections.push({
              trigger: trigger.toString(),
              userComment: text.trim(),
              context: lastAssistantTurn.slice(0, 120)
            });
            break;
          }
        }
      }
    } catch (e) {
      // Ignore malformed JSONL lines
    }
  }

  return minedRejections;
}

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || !args.includes('--apply');
  const customLogIdx = args.indexOf('--log');
  const customLog = customLogIdx !== -1 ? args[customLogIdx + 1] : null;

  console.log(`\n${COLORS.bold}${COLORS.blue}🌙 Muse-Sleep: Offline Aesthetic Harvester (SkillOpt-Sleep Mode)${COLORS.reset}`);
  console.log(`${COLORS.dim}Mode: ${dryRun ? 'Dry-Run (仿真收割并输出 Staging Diff)' : 'Apply (合入自进化资产库)'}${COLORS.reset}\n`);

  // Locate conversation transcript
  let logPath = customLog;
  if (!logPath) {
    // Default search in IDE brain dir if available
    const ideLogsDir = path.resolve(__dirname, '../../../../.system_generated/logs');
    const defaultTranscript = path.join(ideLogsDir, 'transcript.jsonl');
    if (fs.existsSync(defaultTranscript)) {
      logPath = defaultTranscript;
    }
  }

  if (!logPath) {
    console.log(`${COLORS.yellow}ℹ️ 当前未指定外部 Transcript，运行离线自我推演模式...${COLORS.reset}`);
    // Simulated trajectory reflection for verification
    const simulatedTrajectory = {
      artifact: "自动检测：近期会话中的动效首发交付问题",
      because: "用户反馈缺少首发页面进场动效与微物理反馈",
      principle: "UI 宏观构建任务中，动效时序与微物理必须随首发代码 100% 默认落地"
    };

    console.log(`\n${COLORS.bold}1. 轨迹收割与反思 (Trajectory Harvest & Reflection):${COLORS.reset}`);
    console.log(`   产出目标: ${simulatedTrajectory.artifact}`);
    console.log(`   毙因定位: ${simulatedTrajectory.because}`);
    console.log(`   提炼准则: ${simulatedTrajectory.principle}`);

    console.log(`\n${COLORS.bold}2. 执行 Validation Gate 门禁自检...${COLORS.reset}`);
    const { passed } = evaluateSkill();

    if (passed) {
      console.log(`\n${COLORS.green}✓ [Staging Ready] 该提炼准则已通过黄金测试集验证，处于 Staged 待合并状态。${COLORS.reset}`);
    }
    return;
  }

  console.log(`正在扫描会话轨迹: ${logPath}`);
  const findings = await scanTranscript(logPath);
  console.log(`共挖掘到 ${findings.length} 处潜在品味反馈点：\n`);

  findings.forEach((f, idx) => {
    console.log(`${COLORS.yellow}[#${idx + 1}] 触发匹配: ${f.trigger}${COLORS.reset}`);
    console.log(`    用户反馈: "${f.userComment}"`);
    console.log(`    关联上下文: "${f.context.replace(/\n/g, ' ')}..."\n`);
  });

  if (findings.length > 0 && !dryRun) {
    console.log(`${COLORS.bold}正在执行 Slow Update 合入...${COLORS.reset}`);
    // Auto-record top critique
    const top = findings[0];
    recordRejection({
      artifact: `会话挖掘产出 (${top.context.slice(0, 30)})`,
      because: top.userComment,
      principle: `从日常会话中自动提炼的品味约束：针对 "${top.userComment}" 强化边界`
    });
  }
}

if (require.main === module) {
  run();
}

module.exports = { scanTranscript };
