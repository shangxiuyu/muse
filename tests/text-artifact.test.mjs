import test from 'node:test';
import assert from 'node:assert/strict';
import { textArtifactFromReply, textArtifactFromMessages } from '../web/lib/text-artifact.js';
import { renderMarkdown } from '../web/lib/markdown.js';

const prompt = '为一家咖啡店写一个营销文案';
const body = '# 给自己留三分钟\n\n出门前，喝一杯温度刚好的咖啡。\n\n## 今天的选择\n\n- **提前点单**，到店取走。\n- 坐下来，慢慢喝。';
const reply = `下面是这家咖啡店的营销文案。\n\n---\n\n${body}\n\n---\n\n**设计判断**：用日常场景展开。\n\n需要的话，可以继续调整。`;

test('recover delivered copy without its chat introduction or design commentary', () => {
  const artifact = textArtifactFromReply(reply, prompt);
  assert.equal(artifact.text, body);
  assert.equal(artifact.title, '给自己留三分钟');
  assert.match(artifact.direction, /设计判断/);
  assert.equal(artifact.demo, false);
  assert.match(renderMarkdown(artifact.text), /<h1>给自己留三分钟<\/h1>/);
  assert.match(renderMarkdown(artifact.text), /<strong>提前点单<\/strong>/);
});

test('short copy, full Markdown and code-fenced copy keep their actual content', () => {
  assert.equal(textArtifactFromReply(body, prompt).text, body);
  assert.equal(textArtifactFromReply('下面是文案：\n\n咖啡刚好，等你路过。', prompt).text, '咖啡刚好，等你路过。');
  assert.equal(textArtifactFromReply(`以下是正文：\n\n\`\`\`markdown\n${body}\n\`\`\``, prompt).text, body);
  const withDivider = '# 文案\n\n第一段。\n\n---\n\n第二段。';
  assert.equal(textArtifactFromReply(withDivider, prompt).text, withDivider, 'body dividers are not chat boundaries');
});

test('greetings, clarification, discussion and incomplete output do not become copy', () => {
  for (const [answer, request] of [
    ['你好！可以先聊聊你的想法。', prompt],
    ['请问咖啡店叫什么名字？', prompt],
    ['# 需要确认\n\n请提供店名。', prompt],
    ['# 写作建议\n\n从场景入手。', prompt],
    [body, '你好'], [body, '不要写文案，先聊一聊'], [body, '文案怎么写？'],
    [body, '只分析文案，不用修改'],
    ['下面是文案：\n\n```markdown\n# 未写完', prompt],
  ]) assert.equal(textArtifactFromReply(answer, request), null);
});

test('old conversations recover the latest delivered copy while preserving real versions', () => {
  const project = { type: 'text', title: '咖啡店', versions: [], messages: [
    { role: 'user', text: prompt, status: 'completed' }, { role: 'assistant', text: reply },
    { role: 'user', text: '谢谢', status: 'completed' }, { role: 'assistant', text: '不客气。' },
  ] };
  const before = structuredClone(project);
  assert.equal(textArtifactFromMessages(project).text, body);
  assert.deepEqual(project, before, 'preview compatibility must not mutate saved conversations');
  assert.equal(textArtifactFromMessages({ ...project, type: 'ui' }), null);
  assert.equal(textArtifactFromMessages({ ...project, versions: [{ text: '正式版本' }] }), null);
  for (const status of ['cancelled', 'failed', 'running', 'interrupted']) {
    const messages = [{ role: 'user', text: prompt, status }, { role: 'assistant', text: reply }];
    assert.equal(textArtifactFromMessages({ ...project, messages }), null);
  }
  assert.equal(textArtifactFromMessages(), null);
});

test('recovered content uses the existing safe Markdown renderer', () => {
  const artifact = textArtifactFromReply('# 文案\n\n<img src=x onerror=alert(1)>', prompt);
  assert.equal(renderMarkdown(artifact.text).includes('<img'), false);
});
