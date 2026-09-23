import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSourceFiles, createSourceArchive, designSystemFor, exportName, exportReferenceIds, imageFile } from '../web/lib/source-export.js';
import { zipFiles } from '../web/lib/zip.js';
import { readSelectedArchetype } from '../server/archetypes.mjs';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('../', import.meta.url));

test('fragment UI exports as a complete UTF-8 page with its styles and interactions', () => {
  const files = buildSourceFiles({ type: 'ui', title: '拾页', html: '<main>把时间还给阅读</main>', css: 'main{color:#123}', js: 'document.body.dataset.ready="yes"' });
  assert.match(files['index.html'], /<meta charset="utf-8">/i);
  assert.match(files['index.html'], /name="viewport"/);
  assert.match(files['index.html'], /<title>拾页<\/title>/);
  assert.match(files['index.html'], /<style>main\{color:#123\}<\/style>/);
  assert.match(files['index.html'], /<main>把时间还给阅读<\/main>/);
  assert.match(files['index.html'], /<script>document.body.dataset.ready="yes"<\/script>/);
  assert.equal(files['source/index.html'], '<main>把时间还给阅读</main>');
});

const webpage = { id: 'v1', type: 'ui', title: '一块咖啡', direction: '明亮的几何图形',
  html: '<!doctype html><html><head><style>.card{border:2px solid #333;box-shadow:4px 4px #000}</style></head><body><h1 style="font-family:&quot;Songti SC&quot;,serif;padding:2rem;color:#FEF08A">一块</h1></body></html>',
  css: ':root{--brand:#FEF08A}body{background:var(--brand);gap:24px;font-size:18px}', js: 'document.body.dataset.ready = "yes";',
};

test('UI package preserves exact source, runnable output, real styles and version metadata', () => {
  const a = { ...webpage, _session: ['SECRET'], messages: ['PRIVATE'], reference: { path: '../../.env' } };
  const before = structuredClone(a);
  const files = buildSourceFiles(a, { projectTitle: '咖啡品牌', version: 2 });
  assert.equal(files['source/index.html'], webpage.html);
  assert.equal(files['source/styles.css'], webpage.css);
  assert.equal(files['source/script.js'], webpage.js);
  assert.ok(files['index.html'].includes(webpage.css));
  assert.ok(files['index.html'].includes(webpage.js));
  assert.ok(files['design-system/styles.css'].includes('.card{border:2px solid #333'));
  const tokens = JSON.parse(files['design-system/tokens.json']);
  assert.ok(tokens.colors.some(item => item.value === '#FEF08A'));
  assert.deepEqual(tokens.variables[0], { property: '--brand', value: '#FEF08A', source: 'source/styles.css' });
  assert.ok(tokens.typography.some(item => item.value === '"Songti SC",serif'));
  assert.ok(tokens.spacing.some(item => item.value === '2rem'));
  assert.ok(tokens.borders.some(item => item.value === '2px solid #333'));
  assert.ok(tokens.shadows.some(item => item.value === '4px 4px #000'));
  const manifest = JSON.parse(files['manifest.json']);
  assert.equal(manifest.title, '咖啡品牌');
  assert.equal(manifest.version, 2);
  assert.equal(manifest.artifactId, 'v1');
  assert.deepEqual(manifest.files.sort(), Object.keys(files).sort());
  assert.doesNotMatch(JSON.stringify(files), /SECRET|PRIVATE|\.env|_session/);
  assert.deepEqual(a, before);
});

test('PPT package includes every slide, custom markup, speaker notes and only its selected design reference', async () => {
  const reference = await readSelectedArchetype(rootDir, 'ppt_memphis');
  const a = { id: 'old-version', type: 'ppt', title: '咖啡品牌', direction: '大胆撞色', archetypeId: 'ppt_memphis',
    slides: [
      { title: '封面 <Coffee>', html: '<style>.title{color:#ffed00}</style><div style="background:#FEF08A;font-family:Arial">咖啡</div>', note: '介绍品牌。', secret: 'PRIVATE' },
      { title: '第二页', body: '正文', color: '#38BDF8', note: '留出停顿。' },
    ],
  };
  const files = buildSourceFiles(a, { version: 1, references: [reference] });
  assert.ok(files['index.html'].includes('step(1)'));
  assert.ok(files['source/slides/01.html'].includes(a.slides[0].html));
  assert.match(files['source/slides/01.html'], /<title>封面 &lt;Coffee&gt;<\/title>/);
  assert.ok(files['source/slides/02.html'].includes('正文'));
  assert.equal(JSON.parse(files['source/slides.json'])[0].html, a.slides[0].html);
  assert.match(files['speaker-notes.md'], /介绍品牌。[\s\S]*留出停顿。/);
  assert.match(files['design-system/references/ppt_memphis.md'], /精确 Design Tokens/);
  assert.doesNotMatch(files['design-system/references/ppt_memphis.md'], /## 🏛️ 流派二/);
  assert.doesNotMatch(JSON.stringify(files), /PRIVATE/);
  assert.ok(JSON.parse(files['design-system/tokens.json']).colors.some(item => item.value === '#38BDF8'));
  assert.equal(JSON.parse(files['manifest.json']).version, 1);
});

test('reference resolution respects cleared choices and never falls back to a newer project choice', () => {
  assert.equal(exportReferenceIds({ archetypeId: null, reference: { id: 'ppt_memphis' } }).archetypeId, null);
  assert.equal(exportReferenceIds({ reference: { id: 'ppt_memphis' } }).archetypeId, 'ppt_memphis');
  assert.equal(exportReferenceIds({ imageStyleId: 'watercolor' }).imageStyleId, 'watercolor');
  assert.equal(exportReferenceIds({ archetypeId: '../../.env', reference: { id: 'ppt_memphis' } }).archetypeId, null);
  assert.throws(() => buildSourceFiles({ ...webpage, archetypeId: 'writer_atelier' }), /设计规范未能读取/);
  assert.throws(() => buildSourceFiles({ ...webpage, archetypeId: 'writer_atelier' }, { references: [{ id: 'ppt_memphis', specification: 'Wrong reference' }] }), /设计规范未能读取/);
});

test('Markdown and SVG remain editable, with no fabricated visual tokens for plain text', () => {
  const text = '# 原文\n\n保持每个字符。\n';
  const files = buildSourceFiles({ type: 'text', title: '文案', direction: '', text });
  assert.equal(files['content.md'], text);
  assert.deepEqual(JSON.parse(files['design-system/tokens.json']).colors, []);
  assert.match(files['design-system/README.md'], /没有独立的视觉设计系统/);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#abcdef"/><text font-size="24">原图</text></svg>';
  const vector = buildSourceFiles({ type: 'image', title: '图片', direction: '简洁', svg });
  assert.equal(vector['image.svg'], svg);
  assert.ok(JSON.parse(vector['design-system/tokens.json']).colors.some(item => item.value === '#abcdef'));
});

test('raster exports keep original PNG, JPEG and WebP bytes and extensions', () => {
  for (const [type, ext] of [['png', 'png'], ['jpeg', 'jpg'], ['webp', 'webp']]) {
    const bytes = Uint8Array.of(0, 1, 255, 128, 13, 10);
    const data = `data:image/${type};base64,${Buffer.from(bytes).toString('base64')}`;
    const result = imageFile(data);
    assert.equal(result.extension, ext);
    assert.deepEqual(result.data, bytes);
    const files = buildSourceFiles({ type: 'image', title: '原图', direction: '测试', imageData: data });
    assert.deepEqual(files[`image.${ext}`], bytes);
    assert.match(files['design-system/README.md'], /不会虚构可编辑图层/);
  }
  assert.throws(() => imageFile('https://example.com/image.png'), /格式不受支持/);
});

test('image source package includes the selected style recipe', () => {
  const files = buildSourceFiles({ type: 'image', title: '水彩', imageStyleId: 'watercolor', svg: '<svg></svg>' }, {
    references: [{ id: 'watercolor', name: '水彩插画', specification: '# 原始水彩设计规范\n' }],
  });
  assert.equal(files['design-system/references/watercolor.md'], '# 原始水彩设计规范\n');
  assert.match(files['design-system/README.md'], /水彩插画/);
});

test('ZIP preserves UTF-8 paths, binary payloads, standard CRC and a complete central directory', async () => {
  const zip = zipFiles({ '中文/源文件.txt': '123456789', 'image.png': Uint8Array.of(0, 255, 128) });
  assert.equal(zip.type, 'application/zip');
  const bytes = Buffer.from(await zip.arrayBuffer());
  assert.equal(bytes.readUInt32LE(0), 0x04034b50);
  assert.equal(bytes.readUInt16LE(6), 0x0800);
  assert.equal(bytes.readUInt32LE(14), 0xcbf43926); // Published CRC-32 check vector.
  const nameLength = bytes.readUInt16LE(26);
  assert.equal(bytes.subarray(30, 30 + nameLength).toString(), '中文/源文件.txt');
  const end = bytes.subarray(-22), directoryOffset = end.readUInt32LE(16);
  assert.equal(end.readUInt32LE(0), 0x06054b50);
  assert.equal(end.readUInt16LE(10), 2);
  assert.equal(bytes.readUInt32LE(directoryOffset), 0x02014b50);
  assert.equal(directoryOffset + end.readUInt32LE(12), bytes.length - 22);
  const next = 30 + nameLength + 9;
  const binaryStart = next + 30 + bytes.readUInt16LE(next + 26);
  assert.deepEqual([...bytes.subarray(binaryStart, binaryStart + 3)], [0, 255, 128]);
  for (const path of ['../secret', '/absolute', 'C:/path', 'folder/../secret', 'a\\b', './file']) assert.throws(() => zipFiles({ [path]: 'x' }), /文件名无效/);
});

test('archive filenames are safe and complete packages can be built without a service', async () => {
  assert.equal(exportName('../一块/咖啡:*?'), '一块咖啡');
  assert.equal(exportName('...'), 'Muse-作品');
  const archive = createSourceArchive(webpage);
  assert.ok(archive.size > webpage.html.length);
  assert.equal(archive.type, 'application/zip');
  assert.equal(designSystemFor({ type: 'ui', html: '<div style="font-family:&#34;中文&#34;">内容</div>' }).tokens.typography[0].value, '"中文"');
});
