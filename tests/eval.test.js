const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { evaluateSkill } = require('../scripts/eval_skill');
const root = path.resolve(__dirname, '..');
function copy(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-eval-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(root, dir, { recursive: true, filter: p => !['.git', 'node_modules'].includes(path.basename(p)) });
  return dir;
}
test('current knowledge and tools execute fixtures without claiming behavioral evaluation', () => {
  const r = evaluateSkill(root);
  assert.equal(r.passed, true, JSON.stringify(r.errors));
  assert.ok(r.cases.length > 0 && r.cases.every(c => c.passed));
  assert.deepEqual(r.colorPairs, []);
  assert.match(r.presetAssets, /NONE/);
  assert.match(r.behavioralEvaluation, /NOT RUN/);
});
test('missing, empty and unknown benchmarks fail closed', t => {
  const dir = copy(t); const file = path.join(dir, 'benchmarks/golden_cases.json');
  fs.unlinkSync(file); assert.equal(evaluateSkill(dir).passed, false);
  fs.writeFileSync(file, JSON.stringify({kind:'deterministic-tool-fixtures',cases:[]}));
  assert.equal(evaluateSkill(dir).passed, false);
  fs.writeFileSync(file, JSON.stringify({kind:'deterministic-tool-fixtures',cases:[{id:'x',type:'ui',input:'',present:['made-up'],absent:[]}]}));
  assert.equal(evaluateSkill(dir).passed, false);
});
test('package and benchmark versions stay aligned with skill metadata', t => {
  const dir = copy(t); const file = path.join(dir, 'benchmarks/behavioral_cases.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.version = '0.0.0';
  fs.writeFileSync(file, JSON.stringify(data));
  const r = evaluateSkill(dir);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.includes('Version metadata is inconsistent')));
});
test('changing expected cue to a wrong condition actually fails evaluation', t => {
  const dir = copy(t); const file = path.join(dir, 'benchmarks/golden_cases.json');
  fs.writeFileSync(file, JSON.stringify({kind:'deterministic-tool-fixtures',cases:[{id:'must-fail',type:'ui',input:'<button>Save</button>',present:[],absent:['ui.focus-review']}]}));
  const r = evaluateSkill(dir); assert.equal(r.passed, false); assert.equal(r.cases[0].passed, false);
});
test('invalid behavioral criteria cannot pass asset validation', t => {
  const dir = copy(t); const file = path.join(dir, 'benchmarks/behavioral_cases.json');
  for (const check of [[null], [''], [42]]) {
    fs.writeFileSync(file, JSON.stringify({ kind: 'agent-forward-tests', cases: [{ id: 'invalid', brief: 'example', check, required_observation: ['render'], blockers: ['invented fact'] }] }));
    assert.equal(evaluateSkill(dir).passed, false);
  }
});
test('behavioral tasks require observation evidence and blocker definitions', t => {
  const dir = copy(t); const file = path.join(dir, 'benchmarks/behavioral_cases.json');
  const base = { kind: 'agent-forward-tests', cases: [{ id: 'x', brief: 'example', check: ['task fit'], required_observation: ['render'], blockers: ['invented fact'] }] };
  for (const missing of ['required_observation', 'blockers']) {
    const data = structuredClone(base); delete data.cases[0][missing];
    fs.writeFileSync(file, JSON.stringify(data));
    assert.equal(evaluateSkill(dir).passed, false);
  }
});
test('frontend provider stays behind the UI adapter boundary', t => {
  const dir = copy(t);
  fs.appendFileSync(path.join(dir, 'references/toolkit/text_narrative_tool.md'), '\nUse frontend-design here.\n');
  let r = evaluateSkill(dir);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.includes('leaked outside')));
  fs.writeFileSync(path.join(dir, 'references/toolkit/frontend_craft.md'), '# copied implementation encyclopedia\n');
  r = evaluateSkill(dir);
  assert.ok(r.errors.some(e => e.includes('must not be embedded')));
});
test('UI project lifecycle requires context, iteration and asset protocols', t => {
  const dir = copy(t);
  fs.rmSync(path.join(dir, 'references/toolkit/ui_iteration_protocol.md'));
  let r = evaluateSkill(dir);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.startsWith('references:') || e.startsWith('ui-project-lifecycle:')));

  const dir2 = copy(t);
  const file = path.join(dir2, 'references/toolkit/ui_asset_protocol.md');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('Logo 不变量', '标志规则'));
  r = evaluateSkill(dir2);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.includes('missing boundary')));
});
test('presentation method keeps visual direction and rejection connected', t => {
  const dir = copy(t);
  fs.rmSync(path.join(dir, 'references/toolkit/presentation/visual_direction.md'));
  let r = evaluateSkill(dir);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.startsWith('references:') || e.startsWith('presentation-method:')));

  const dir2 = copy(t);
  const file = path.join(dir2, 'references/toolkit/presentation/encounter_and_rejection.md');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('生命张力测试', '视觉检查'));
  r = evaluateSkill(dir2);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.includes('missing: 生命张力测试')));
});
test('public UI knowledge remains text-only, brand-neutral and free of preset assets', t => {
  const dir = copy(t);
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'assets/page-template.html'), '<main>template</main>');
  let r = evaluateSkill(dir);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.includes('reusable output assets')));

  fs.rmSync(path.join(dir, 'assets'), { recursive: true });
  fs.renameSync(path.join(dir, 'exemplars/ui/task_hierarchy.md'), path.join(dir, 'exemplars/ui/linear-dashboard.md'));
  r = evaluateSkill(dir);
  assert.equal(r.passed, false);
  assert.ok(r.errors.some(e => e.includes('brands or trend styles')));
});
test('malformed vault and broken reference each block', t => {
  const dir = copy(t);
  fs.writeFileSync(path.join(dir, 'vault/personal_dna.yaml'), 'not: [');
  fs.appendFileSync(path.join(dir, 'SKILL.md'), '\n[missing](references/does-not-exist.md)\n');
  const r = evaluateSkill(dir);
  assert.equal(r.passed, false); assert.ok(r.errors.some(e => e.startsWith('vault:')));
  assert.ok(r.errors.some(e => e.startsWith('references:')));
});
