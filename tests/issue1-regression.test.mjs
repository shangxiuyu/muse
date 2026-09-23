import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { lintCode, collectCssVars, lintMarkdown, extractCssVarUsages } from '../scripts/rules.js';
import { scanText } from '../scripts/lint_text.js';

const root = process.cwd();

function cli(file, args) {
  const r = spawnSync(process.execPath, [join(root, 'scripts', file), ...args], { encoding: 'utf8' });
  if (r.error) throw r.error;
  return { exit: r.status, text: r.stdout + r.stderr };
}

let serial = 0;
function put(tmp, vault, entries) {
  const file = join(tmp, `bundle-${++serial}.json`);
  writeFileSync(file, JSON.stringify({ entries }));
  return cli('asset_library.js', ['put', '--vault', vault, '--file', file]);
}

test('Issue 1: CSS variable resolution with @import and fallback', (t) => {
  const tmp = mkdtempSync(join(tmpdir(), 'muse-test-css-'));
  try {
    const cssDir = join(tmp, 'css');
    mkdirSync(cssDir);
    writeFileSync(join(cssDir, 'tokens.css'), ':root { --brand-accent: #246354; }');
    writeFileSync(join(cssDir, 'site.css'), '@import "./tokens.css";\nbutton { color: var(--brand-accent); }');

    const css = cli('lint_ui.js', [cssDir]);
    assert.equal(css.exit, 0, 'lint_ui.js should succeed with imported tokens');
    assert.equal(css.text.includes('[undefined-css-var]'), false, 'Should not report undefined-css-var');

    const fallbackCode = '.label { color: var(--optional-accent, #246354); }';
    const usages = extractCssVarUsages(fallbackCode);
    assert.equal(usages.length, 1);
    assert.equal(usages[0].hasFallback, true);
    assert.equal(usages[0].fallback, '#246354');

    const findings = lintCode(fallbackCode, 1, { definedVars: collectCssVars(fallbackCode) });
    const undefinedFindings = findings.filter((x) => x.rule === 'undefined-css-var');
    assert.equal(undefinedFindings.length, 0, 'Variables with fallback should not be reported as undefined');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('Issue 2: fake-data rule is non-waivable and cannot be downgraded by declaration', () => {
  const fake = '```html\n<p>Jane Doe: 99.99%</p>\n```';
  const severityBefore = lintMarkdown(fake).filter((x) => x.rule === 'fake-data').map((x) => x.severity);
  assert.deepEqual(severityBefore, ['error']);

  const withWaiver = '<!-- muse:allow fake-data: 只是风格选择 -->\n' + fake;
  const severityAfter = lintMarkdown(withWaiver).filter((x) => x.rule === 'fake-data').map((x) => x.severity);
  assert.deepEqual(severityAfter, ['error'], 'fake-data must remain error even when declared');
});

test('Issue 3: Taste Vault allows referencing valid historical revisions in evidence', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'muse-test-vault-'));
  try {
    const example = JSON.parse(readFileSync(join(root, 'references/example_asset_bundle.json'), 'utf8')).entries;
    const historyVault = join(tmp, 'history-vault');

    const initPut = put(tmp, historyVault, example);
    assert.equal(initPut.exit, 0, 'Initial bundle put should succeed');

    const reference = structuredClone(example[0]);
    reference.expected_revision = 1;
    reference.data.title += ' (updated)';
    const updateRef = put(tmp, historyVault, [reference]);
    assert.equal(updateRef.exit, 0, 'Updating reference to revision 2 should succeed');

    const old = cli('asset_library.js', ['show', '--vault', historyVault, '--id', reference.id, '--revision', '1']);
    assert.equal(old.exit, 0, 'Historical revision 1 should be readable');

    const system = structuredClone(example[1]);
    system.expected_revision = 1;
    system.data.title += ' (edited, same historical evidence)';
    const updateSys = put(tmp, historyVault, [system]);
    assert.equal(updateSys.exit, 0, 'Updating system pointing to historical revision 1 evidence should succeed');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('Issue 4: application.system_id pointing to non-system asset is rejected', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'muse-test-kind-'));
  try {
    const example = JSON.parse(readFileSync(join(root, 'references/example_asset_bundle.json'), 'utf8')).entries;
    const typeVault = join(tmp, 'type-vault');

    const initRef = put(tmp, typeVault, [example[0]]);
    assert.equal(initRef.exit, 0);

    const application = {
      id: 'wrong-kind-application',
      kind: 'application',
      expected_revision: 0,
      data: {
        title: 'Application pointing to a reference instead of a system',
        tags: [],
        status: 'active',
        system_id: example[0].id,
        system_revision: 1,
        artifact: join(tmp, 'demo.md'),
        context: 'test',
        adaptations: [],
        outcome: 'unverified',
        feedback_source: 'none',
      },
    };

    const res = put(tmp, typeVault, [application]);
    assert.notEqual(res.exit, 0, 'Putting application with system_id pointing to reference should fail');
    assert.match(res.text, /不是 system|类型/);

    const saved = JSON.parse(readFileSync(join(typeVault, 'aesthetic_assets.json'), 'utf8'));
    assert.equal(saved.entries.some((x) => x.id === application.id), false, 'Invalid application should not be saved');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('Issue 5: ordinary prose with common words like "拒绝" does not skip text scan', () => {
  const prose = '在当今快速发展的时代，赋能企业至关重要。';
  const before = scanText(prose).map((x) => x.pattern);
  assert.deepEqual(before, [8, 11]);

  const after = scanText('拒绝等待。' + prose).map((x) => x.pattern);
  assert.deepEqual(after, [8, 11], 'Text scan must not be bypassed when ordinary prose contains "拒绝等待。"');
});
