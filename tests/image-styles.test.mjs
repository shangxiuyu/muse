import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const styleDir = join(root, 'references/image_styles');
const expected = [
  'sketch-notes', 'minimal-line', 'flat-vector', 'blueprint', 'editorial',
  'study-notes', 'watercolor', 'screen-print', 'chalkboard', 'ink-brush',
  'manga', 'pixel-art', 'paper-cutout', 'claymation', 'retro-pop-grid',
].sort();

test('style catalog resolves exactly 15 distinct bundled cards', async () => {
  const catalog = await readFile(join(root, 'references/image_styles.md'), 'utf8');
  const links = [...catalog.matchAll(/\]\(image_styles\/([a-z-]+)\.md\)/g)].map(m => m[1]);
  assert.deepEqual([...links].sort(), expected);
  assert.equal(new Set(links).size, links.length);
  assert.deepEqual((await readdir(styleDir)).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)).sort(), expected);
  for (const id of links) {
    const card = await readFile(join(styleDir, `${id}.md`), 'utf8');
    assert.ok(card.includes('`' + id + '`'), `missing ID: ${id}`);
    for (const section of ['视觉特征', '可调参数', '提示词片段', '验收观察', '来路']) {
      assert.ok(card.includes(`## ${section}`), `${id}: missing ${section}`);
    }
    assert.match(card, /BaoYu `baoyu-[a-z-]+` 1\.\d+\.\d+/);
    assert.doesNotMatch(card, /不适用|禁用场景|不推荐场景|^#+\s*(?:Avoid|Don't)/mi);
    assert.doesNotMatch(card, /\/Users\/|\.agents\/skills\/|\.codex\/skills\//);
  }
});

test('normal entrypoint and image workflow link the catalog', async () => {
  const skill = await readFile(join(root, 'SKILL.md'), 'utf8');
  const workflow = await readFile(join(root, 'references/toolkit/image_visual_tool.md'), 'utf8');
  assert.ok(skill.includes('](references/image_styles.md)'));
  assert.ok(workflow.includes('](../image_styles.md)'));
});

test('full library audit has no broken links or unreachable style cards', () => {
  const result = spawnSync(process.execPath, ['scripts/audit.js', '--json'], { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 10000 });
  assert.equal(result.error, undefined);
  const report = JSON.parse(result.stdout);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(report.findings.filter(f => ['link', 'routing'].includes(f.kind) && f.file.includes('image_style')), []);
});

async function auditFixture(t, files) {
  const fixture = await mkdtemp(join(tmpdir(), 'muse-style-audit-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await mkdir(join(fixture, 'scripts'));
  for (const file of ['audit.js', 'rules.js', 'lint_text.js']) {
    await copyFile(join(root, 'scripts', file), join(fixture, 'scripts', file));
  }
  await writeFile(join(fixture, 'package.json'), '{"type":"module"}');
  for (const [file, content] of Object.entries(files)) {
    await mkdir(dirname(join(fixture, file)), { recursive: true });
    await writeFile(join(fixture, file), content);
  }
  const result = spawnSync(process.execPath, ['scripts/audit.js', '--json'], { cwd: fixture, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 10000 });
  assert.equal(result.error, undefined);
  return { result, report: JSON.parse(result.stdout) };
}

test('audit follows nested local references and terminates on reachable cycles', async t => {
  const { report } = await auditFixture(t, {
    'SKILL.md': '[入口](references/catalog.md)',
    'references/catalog.md': '[卡片](cards/one.md)',
    'references/cards/one.md': '[返回](../catalog.md)',
  });
  assert.deepEqual(report.findings.filter(f => f.kind === 'routing'), []);
});

test('audit still identifies disconnected cycles and genuine orphan files', async t => {
  const { report } = await auditFixture(t, {
    'SKILL.md': '[入口](references/catalog.md)',
    'references/catalog.md': '# 目录',
    'references/hidden-a.md': '[另一页](hidden-b.md)',
    'references/hidden-b.md': '[返回](hidden-a.md)',
    'references/orphan.md': '# 孤立资源',
  });
  const routing = report.findings.filter(f => f.kind === 'routing');
  assert.equal(routing.filter(f => f.severity === 'warning').length, 2);
  assert.ok(routing.some(f => f.file === 'references/orphan.md' && f.severity === 'error'));
});

test('external links do not make a local resource reachable', async t => {
  const { report } = await auditFixture(t, {
    'SKILL.md': '[入口](references/catalog.md)',
    'references/catalog.md': '[远程](https://example.com/references/private.md)',
    'README.md': '[本地资源](references/private.md)',
    'references/private.md': '# 仅 README 引用',
  });
  assert.ok(report.findings.some(f => f.kind === 'routing' && f.file === 'references/private.md' && f.severity === 'warning'));
});

test('large JSON audit output is fully flushed through a pipe', async t => {
  const { result, report } = await auditFixture(t, {
    'SKILL.md': '[大量诊断](references/many.md)',
    'references/many.md': '# 检查输出\n' + '赋能\n'.repeat(800),
  });
  assert.ok(Buffer.byteLength(result.stdout) > 65536);
  assert.equal(result.status, 1);
  assert.ok(report.findings.some(f => f.kind === 'prose' && f.severity === 'error'));
});
