import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../web/lib/markdown.js';

test('streamed Markdown renders headings, lists, emphasis and unfinished code fences', () => {
  assert.match(renderMarkdown('# 标题\n\n你好，**世界**。\n\n- 第一项\n- 第二项'), /<h1>标题<\/h1><p>你好，<strong>世界<\/strong>。<\/p><ul><li>第一项<\/li><li>第二项<\/li><\/ul>/);
  assert.match(renderMarkdown('3. 第三步\n4. 第四步'), /<ol start="3">/);
  assert.match(renderMarkdown('> 引用\n\n`代码`'), /<blockquote>引用<\/blockquote><p><code>代码<\/code><\/p>/);
  assert.equal(renderMarkdown('```js\nconst a = "<div>";'), '<pre><code>const a = &quot;&lt;div&gt;&quot;;</code></pre>');
  assert.match(renderMarkdown('```js\nconst a = 1;\n```\n\n完成'), /<\/code><\/pre><p>完成<\/p>$/);
});

test('every prefix of an untrusted stream remains inert text', () => {
  const source = '<img src=x onerror=alert(1)>\n<script>alert(1)</script>\n\n[点我](javascript:alert)\n\n```html\n</code><script>alert(1)</script>\n```';
  for (let i = 0; i <= source.length; i++) {
    const html = renderMarkdown(source.slice(0, i));
    assert.doesNotMatch(html, /<(?:img|script|iframe)|href="javascript:/i);
  }
  assert.match(renderMarkdown('[文档](https://example.com)'), /rel="noopener noreferrer"/);
});

const pageTable = `| 页 | 结构职责 | 版式 |
|---|---|---|
| 封面 | 留下印象 | 单主角大字，装饰块只在右侧与下缘 |
| 01 定位 | 讲差异化 | 三张错落积木卡（非等宽，各自带旋转与位移） |
| 02 证据 | 给硬证据 | 左侧白色大数字硬框 + 右侧三条数据条，尺度反差最大 |
| 03 行动 | 收束 | 居中对称、唯一一页，与前两页的非对称形成对照 |`;

test('the reported page plan renders a three-column table between other blocks', () => {
  const html = renderMarkdown(`这版的四页结构：\n\n${pageTable}\n\n下一步。`);
  assert.equal((html.match(/<th /g) || []).length, 3);
  assert.equal((html.match(/<td /g) || []).length, 12);
  assert.equal((html.match(/<tr>/g) || []).length, 5);
  assert.match(html, /<p>这版的四页结构：<\/p><div class="markdown-table"/);
  assert.match(html, /<\/table><\/div><p>下一步。<\/p>$/);
  assert.ok(html.includes('三张错落积木卡（非等宽，各自带旋转与位移）'));
  assert.doesNotMatch(html, /\|---|\| 封面/);
});

test('tables support optional outer pipes, alignment, inline formatting and escaped pipes', () => {
  const html = renderMarkdown('名称 | 示例 | 数量\n:--- | :---: | ---:\n**重点** | `a\\|b` | 3\n[文档](https://example.com) | 左\\|右 | 4');
  assert.match(html, /<th scope="col" class="table-align-left">名称<\/th>/);
  assert.match(html, /<td class="table-align-center"><code>a\|b<\/code><\/td>/);
  assert.match(html, /<td class="table-align-left"><strong>重点<\/strong><\/td>/);
  assert.match(html, /<td class="table-align-right">3<\/td>/);
  assert.ok(html.includes('>左|右</td>'));
  assert.match(html, /rel="noopener noreferrer"/);
});

test('incomplete table rows are padded and extra cells do not add columns', () => {
  const html = renderMarkdown('| A | B |\n| --- | --- |\n| one |\n| two | three | extra |');
  assert.match(html, /<td class="table-align-left">one<\/td><td class="table-align-left"><\/td>/);
  assert.equal((html.match(/<td /g) || []).length, 4);
  assert.doesNotMatch(html, /extra/);
});

test('ordinary pipes, invalid delimiters and code fences stay outside tables', () => {
  for (const source of ['左 | 右\n普通文字', '| A | B |\n| --- |', '| A | B |\n| -- | --- |', '| A | B |\n\n| --- | --- |', `\`\`\`md\n${pageTable}\n\`\`\``]) {
    assert.doesNotMatch(renderMarkdown(source), /<table>/);
  }
  for (const next of ['# 标题 | 文本', '- 项目 | 文本', '> 引用 | 文本', '```js\na | b\n```']) {
    const html = renderMarkdown(`${pageTable}\n${next}`);
    assert.equal((html.match(/<td /g) || []).length, 12);
    assert.match(html, /<\/table><\/div><(?:h1|ul|blockquote|pre)>/);
  }
});

test('table streams remain safe and become tables once the delimiter is complete', () => {
  const source = '| A | B |\n| --- | --- |\n| <img src=x onerror=alert(1)> | [点我](javascript:alert) |\n| `</code><script>alert(1)</script>` | 完成 |';
  const headerEnd = source.indexOf('\n| <img');
  for (let i = 0; i <= source.length; i++) {
    const html = renderMarkdown(source.slice(0, i));
    assert.doesNotMatch(html, /<(?:img|script|iframe)|href="javascript:/i);
    if (i >= headerEnd) {
      assert.match(html, /<table><thead>/);
      assert.match(html, /<\/tbody><\/table><\/div>$/);
    }
  }
  assert.match(renderMarkdown(source), /&lt;img/);
});
