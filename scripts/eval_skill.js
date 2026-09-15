#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parse, readVault } = require('./vault');
const { lintContent } = require('./lint_ui');
const { lintTextContent } = require('./lint_text');
const { collect } = require('./scan');
const ROOT = path.resolve(__dirname, '..');
const RULES = new Set(['ui.focus-review', 'ui.focus-removal', 'ui.motion-review', 'ui.transition-scope', 'ui.small-text-review',
  'ui.state-behavior', 'ui.shadow-review', 'ui.blur-review', 'text.vague-phrase', 'text.dense-sentence',
  'text.chat-residue', 'text.formulaic-contrast', 'text.repeated-opener', 'text.uniform-rhythm']);
function evaluateSkill(root = ROOT) {
  const errors = []; const cases = [];
  const check = (name, fn) => { try { fn(); } catch (e) { errors.push(name + ': ' + e.message); } };
  check('metadata', () => {
    const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
    const match = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) throw new Error('Missing frontmatter');
    const meta = parse(match[1]);
    if (meta.name !== 'muse' || typeof meta.description !== 'string' || !meta.description.trim()) throw new Error('Invalid name or description');
    if (skill.split('\n').length > 500) throw new Error('Entrypoint exceeds 500 lines');
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
    const golden = JSON.parse(fs.readFileSync(path.join(root, 'benchmarks/golden_cases.json'), 'utf8'));
    const behavioral = JSON.parse(fs.readFileSync(path.join(root, 'benchmarks/behavioral_cases.json'), 'utf8'));
    const skillVersion = meta.metadata && meta.metadata.version;
    const versions = [skillVersion, pkg.version, lock.version, lock.packages && lock.packages[''] && lock.packages[''].version, golden.version, behavioral.version];
    if (typeof skillVersion !== 'string' || versions.some(version => version !== skillVersion)) throw new Error('Version metadata is inconsistent: ' + versions.join(', '));
  });
  check('references', () => {
    const documents = collect(root, ['.md']);
    for (const file of documents) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
        if (/^(?:https?:|#)/.test(m[1])) continue;
        const local = path.resolve(path.dirname(file), m[1].split('#')[0]);
        if (!fs.existsSync(local)) throw new Error(path.relative(root, file) + ' -> ' + m[1]);
      }
    }
  });
  check('execution-architecture', () => {
    const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
    if (!skill.includes('references/execution_architecture.md') || !skill.includes('references/toolkit/ui_product_tool.md') || !skill.includes('references/toolkit/ui_aesthetic_synthesis.md')) throw new Error('Core does not route through execution architecture, UI method and aesthetic synthesis');
    const uiMethod = fs.readFileSync(path.join(root, 'references/toolkit/ui_product_tool.md'), 'utf8');
    const synthesis = fs.readFileSync(path.join(root, 'references/toolkit/ui_aesthetic_synthesis.md'), 'utf8');
    for (const term of ['Content DNA', 'Distinctive Relation', 'Restraint Rule', 'Critical Slice']) {
      if (!uiMethod.includes(term) || !synthesis.includes(term)) throw new Error('UI methodology is missing synthesis concept: ' + term);
    }
    for (const term of ['归因测试', '替换测试', '三层同质化检查', '近期作品比较']) {
      if (!synthesis.includes(term)) throw new Error('UI synthesis is missing anti-convergence gate: ' + term);
    }
    if (fs.existsSync(path.join(root, 'references/toolkit/frontend_craft.md'))) throw new Error('Frontend implementation encyclopedia must not be embedded in Muse');
    const refs = collect(path.join(root, 'references'), ['.md']);
    for (const file of refs) {
      const rel = path.relative(root, file);
      if (['references/execution_architecture.md', 'references/toolkit/ui_product_tool.md'].includes(rel)) continue;
      if (/frontend-design/i.test(fs.readFileSync(file, 'utf8'))) throw new Error('frontend-design leaked outside the UI execution boundary: ' + rel);
    }
  });
  check('ui-project-lifecycle', () => {
    const uiMethod = fs.readFileSync(path.join(root, 'references/toolkit/ui_product_tool.md'), 'utf8');
    const context = fs.readFileSync(path.join(root, 'references/toolkit/ui_project_context.md'), 'utf8');
    const iteration = fs.readFileSync(path.join(root, 'references/toolkit/ui_iteration_protocol.md'), 'utf8');
    const assets = fs.readFileSync(path.join(root, 'references/toolkit/ui_asset_protocol.md'), 'utf8');
    for (const link of ['ui_project_context.md', 'ui_iteration_protocol.md', 'ui_asset_protocol.md']) {
      if (!uiMethod.includes(link)) throw new Error('UI method does not route through ' + link);
    }
    for (const term of ['existing', 'new_in_system', 'blank_slate', 'Context Manifest', 'fingerprints']) {
      if (!context.includes(term)) throw new Error('UI project context is missing lifecycle term: ' + term);
    }
    for (const term of ['direct_edit', 'replace', 'branch', 'revert', 'active_direction']) {
      if (!iteration.includes(term)) throw new Error('UI iteration protocol is missing mode: ' + term);
    }
    for (const term of ['reference', 'brand', 'content', 'placeholder/demo', 'Logo 不变量']) {
      if (!assets.includes(term)) throw new Error('UI asset protocol is missing boundary: ' + term);
    }
  });
  check('presentation-method', () => {
    const entry = fs.readFileSync(path.join(root, 'references/toolkit/presentation_tool.md'), 'utf8');
    const visual = fs.readFileSync(path.join(root, 'references/toolkit/presentation/visual_direction.md'), 'utf8');
    const encounter = fs.readFileSync(path.join(root, 'references/toolkit/presentation/encounter_and_rejection.md'), 'utf8');
    for (const link of ['presentation/visual_direction.md', 'presentation/encounter_and_rejection.md']) {
      if (!entry.includes(link)) throw new Error('Presentation entry does not route through ' + link);
    }
    for (const term of ['不交付第一个安全答案', '结构上不同', '平庸淘汰', '专业演示执行器']) {
      if (!entry.includes(term)) throw new Error('Presentation aesthetic direction is missing: ' + term);
    }
    for (const term of ['替换测试', '安全答案测试', '生命张力测试', '跨页节奏测试', '解释依赖测试']) {
      if (!encounter.includes(term)) throw new Error('Presentation rejection gate is missing: ' + term);
    }
    for (const term of ['内容的力', '竞争假设', '代表页', '明确代价']) {
      if (!visual.includes(term)) throw new Error('Presentation visual direction is missing concept: ' + term);
    }
    if (!encounter.includes('文件能打开') || !encounter.includes('不能证明作品有审美力量')) throw new Error('Presentation method confuses production and aesthetic evidence');
  });
  check('case-based-reasoning', () => {
    const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
    const reasoning = fs.readFileSync(path.join(root, 'references/aesthetic_intelligence.md'), 'utf8');
    const extraction = fs.readFileSync(path.join(root, 'references/extraction.md'), 'utf8');
    const training = fs.readFileSync(path.join(root, 'references/case_based_training.md'), 'utf8');
    if (!skill.includes('references/case_based_training.md')) throw new Error('Core does not route brand, designer and style references through case-based training');
    for (const term of ['表面层 Surface', '机制层 Mechanism', '系统层 System', '关系层 Relationship', '情境层 Context']) {
      if (!training.includes(term)) throw new Error('Case-based training is missing layer: ' + term);
    }
    for (const term of ['去标签测试', '换表面测试', '换情境测试', '系统一致性测试']) {
      if (!training.includes(term)) throw new Error('Case-based training is missing counterfactual: ' + term);
    }
    if (!reasoning.includes('case_based_training.md') || !extraction.includes('case_based_training.md')) throw new Error('Reasoning and extraction do not share the case-based method');
  });
  check('no-preset-ui-assets', () => {
    const assetsDir = path.join(root, 'assets');
    const hasVisibleFile = dir => fs.readdirSync(dir, { withFileTypes: true }).some(entry => {
      if (entry.name.startsWith('.')) return false;
      return entry.isDirectory() ? hasVisibleFile(path.join(dir, entry.name)) : entry.isFile();
    });
    if (fs.existsSync(assetsDir) && hasVisibleFile(assetsDir)) throw new Error('Muse must not ship reusable output assets or templates');
    const uiDir = path.join(root, 'exemplars/ui');
    const uiFiles = fs.readdirSync(uiDir).filter(name => !name.startsWith('.'));
    if (uiFiles.some(name => path.extname(name) !== '.md')) throw new Error('UI teaching cases must remain text-only');
    const styleAnchors = /(?:^|[-_.])(linear|stripe|apple|airbnb|notion|figma|vercel)(?:[-_.]|$)/i;
    if (uiFiles.some(name => styleAnchors.test(name))) throw new Error('UI teaching filenames must describe tasks, not brands or trend styles');
    for (const name of uiFiles) {
      const text = fs.readFileSync(path.join(uiDir, name), 'utf8');
      if (/#[0-9a-f]{3,8}\b/i.test(text)) throw new Error('UI teaching cases must not embed reusable color values: ' + name);
    }
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'references/public_cases.json'), 'utf8'));
    for (const entry of catalog.entries) {
      if (entry.kind !== 'reference') continue;
      const source = entry.data && entry.data.source;
      if (!source || source.coverage !== 'text-only' || !/\.md$/.test(source.locator)) throw new Error('Public teaching references must remain text-only Markdown');
      if (styleAnchors.test(path.basename(source.locator))) throw new Error('Public teaching locators must be brand-neutral');
    }
  });
  check('vault', () => readVault(path.join(root, 'vault')));
  check('fixtures', () => {
    const suite = JSON.parse(fs.readFileSync(path.join(root, 'benchmarks/golden_cases.json'), 'utf8'));
    if (suite.kind !== 'deterministic-tool-fixtures' || !Array.isArray(suite.cases) || !suite.cases.length) throw new Error('Missing or empty tool fixtures');
    const ids = new Set();
    for (const c of suite.cases) {
      if (typeof c.id !== 'string' || !c.id || ids.has(c.id) || typeof c.input !== 'string') throw new Error('Invalid or duplicate fixture');
      ids.add(c.id);
      if (!['ui', 'text'].includes(c.type)) throw new Error('Unknown fixture type: ' + c.type);
      if (!Array.isArray(c.present) || !Array.isArray(c.absent) || !c.present.length && !c.absent.length) throw new Error('Missing assertions: ' + c.id);
      for (const rule of [...c.present, ...c.absent]) if (!RULES.has(rule)) throw new Error('Unknown rule: ' + rule);
      const actual = new Set((c.type === 'ui' ? lintContent(c.input) : lintTextContent(c.input)).findings.map(f => f.rule));
      const passed = c.present.every(r => actual.has(r)) && c.absent.every(r => !actual.has(r));
      cases.push({ id: c.id, passed, actual: [...actual] });
      if (!passed) errors.push('Fixture failed: ' + c.id);
    }
  });
  check('behavioral-suite', () => {
    if (!fs.existsSync(path.join(root, 'benchmarks/forward_test_protocol.md'))) throw new Error('Missing forward-test protocol');
    const data = JSON.parse(fs.readFileSync(path.join(root, 'benchmarks/behavioral_cases.json'), 'utf8'));
    if (data.kind !== 'agent-forward-tests' || !Array.isArray(data.cases) || !data.cases.length) throw new Error('Missing behavioral tasks');
    const ids = new Set();
    for (const c of data.cases) {
      const validStrings = value => Array.isArray(value) && value.length && value.every(item => typeof item === 'string' && item.trim());
      if (typeof c.id !== 'string' || !c.id.trim() || ids.has(c.id) || typeof c.brief !== 'string' || !c.brief.trim() || !validStrings(c.check) || !validStrings(c.required_observation) || !validStrings(c.blockers)) throw new Error('Invalid behavioral task');
      ids.add(c.id);
    }
  });
  return { passed: errors.length === 0, errors, cases, colorPairs: [], presetAssets: 'NONE: design choices must be generated from the current task', behavioralEvaluation: 'NOT RUN: follow benchmarks/forward_test_protocol.md with generated artifacts and observed evidence' };
}
function run() {
  const result = evaluateSkill();
  console.log(JSON.stringify(result, null, 2));
  const testDir = path.join(ROOT, 'tests');
  const files = fs.existsSync(testDir) ? fs.readdirSync(testDir).filter(n => n.endsWith('.test.js')).sort().map(n => path.join(testDir, n)) : [];
  if (!files.length) { console.error('No executable tests'); process.exitCode = 1; return; }
  const tests = spawnSync(process.execPath, ['--test', ...files], { cwd: ROOT, stdio: 'inherit', timeout: 60000 });
  if (!result.passed || tests.status !== 0 || tests.error) process.exitCode = 1;
  console.log('Tool/knowledge checks only; no automatic aesthetic certification.');
}
if (require.main === module) run();
module.exports = { evaluateSkill };
