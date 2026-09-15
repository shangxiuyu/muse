const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { lintTarget, lintContent } = require('../scripts/lint_ui');
const { lintTextContent } = require('../scripts/lint_text');
const { contrast } = require('../scripts/contrast');
test('supported source files receive coverage; external symlinks are not followed', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-scan-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'button.JS'), '<button>Save</button>');
  fs.writeFileSync(path.join(dir, 'style.scss'), '.blob {filter:blur(100px)}');
  fs.symlinkSync(dir, path.join(dir, 'cycle'), 'dir');
  const r = lintTarget(dir); assert.equal(r.filesCount, 2); assert.equal(r.totalWarnings, 2);
  assert.equal(r.coverage, 'heuristic-only'); assert.equal(r.totalErrors, 0);
});
test('unrelated CSS does not suppress a component review cue', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-focus-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'button.html'), '<button>Save</button>');
  fs.writeFileSync(path.join(dir, 'unused.css'), '.unused:focus-visible{outline:none}');
  const r = lintTarget(dir);
  assert.ok(r.results.find(x => x.file.endsWith('button.html')).findings.some(x => x.rule === 'ui.focus-review'));
});
test('zero covered files is an explicit non-success CLI result', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-empty-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of ['lint_ui.js', 'lint_text.js']) {
    const r = spawnSync(process.execPath, [path.resolve(__dirname, '../scripts', name), dir], { encoding: 'utf8' });
    assert.equal(r.status, 2); assert.equal(JSON.parse(r.stdout).coverage, 'none');
  }
});
test('stylistic choices are not violations and cues are not certified accessibility', () => {
  const r = lintContent('<h1 style="text-align:center;background:yellow;color:magenta">Poster</h1>');
  assert.deepEqual(r.errors, []); assert.deepEqual(r.findings, []);
  assert.deepEqual(lintTextContent('此外，这个安全吊带叫 harness。').findings, []);
  assert.equal(lintContent('<button aria-disabled="true">Save</button>').findings.some(x => x.rule === 'ui.state-behavior'), true);
});
test('tiny pixel text is a review cue rather than an automatic error', () => {
  const r = lintContent('.source { font-size: 8px } .caption { font-size: 11px } .body { font-size: 15px }');
  assert.deepEqual(r.errors, []);
  assert.equal(r.findings.filter(x => x.rule === 'ui.small-text-review').length, 1);
  assert.match(r.findings.find(x => x.rule === 'ui.small-text-review').message, /8, 11px/);
});
test('fenced counterexamples are not prose and a real vague phrase remains reviewable', () => {
  assert.deepEqual(lintTextContent('~~~txt\n全方位引领\n~~~').findings, []);
  assert.ok(lintTextContent('全方位引领未来。').findings.some(x => x.rule === 'text.vague-phrase'));
});
test('text cues detect pattern clusters without treating one rhetorical move as an error', () => {
  const singleContrast = lintTextContent('这不是随机试验，而是一项观察性研究。结果只能说明相关性。');
  assert.equal(singleContrast.findings.some(x => x.rule === 'text.formulaic-contrast'), false);
  const repeatedContrast = lintTextContent('这不是速度问题，而是信任问题。真正的产品从来不是工具，而是伙伴。');
  assert.equal(repeatedContrast.findings.some(x => x.rule === 'text.formulaic-contrast'), true);
  assert.deepEqual(repeatedContrast.errors, []);
});
test('text cues identify assistant residue and mechanical cadence as review prompts', () => {
  const residue = lintTextContent('希望这能帮助你。如有需要，我可以继续补充。');
  assert.equal(residue.findings.some(x => x.rule === 'text.chat-residue'), true);
  const repeated = lintTextContent('我们检查了样本。我们保留了限定。我们删除了空话。');
  assert.equal(repeated.findings.some(x => x.rule === 'text.repeated-opener'), true);
  const uniform = lintTextContent('团队今天完成第一轮测试。用户明天开始第二轮试用。项目后天进入第三轮复核。报告月底提交最终版结论。');
  assert.equal(uniform.findings.some(x => x.rule === 'text.uniform-rhythm'), true);
});
test('contrast calculation known endpoints and invalid inputs', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#ffffff', '#ffffff'), 1);
  assert.throws(() => contrast('transparent', '#000000'));
});
