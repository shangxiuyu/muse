// Compatibility for completed copy delivered in chat instead of submit_artifact.
// Keep this conservative: ordinary conversation must not become a work version.
export function textArtifactFromReply(reply, prompt = '', title = '文案') {
  if (typeof reply !== 'string' || !/(?:写|创作|生成|制作|修改|润色|调整|改成|改为|换成|替换|精简|扩充)/.test(prompt)) return null;
  if (/(?:不要|不用|不必|无需|先别|暂不).{0,8}(?:写|创作|生成|制作|修改|润色|调整)/.test(prompt)) return null;
  if (/(?:怎么|如何)(?:写|创作|修改)|(?:先|只)(?:聊|讨论|分析|解释|评价)/.test(prompt)) return null;
  let text = reply.replace(/\r\n?/g, '\n').trim();
  const intro = text.match(/^(?:好的[，。！]?\s*)?(?:下面|以下|这是|这里是|给你|已为你)[^\n]*(?:文案|正文|成稿|文章|版本)[^\n]*\n+/);
  if (intro) text = text.slice(intro[0].length).trim().replace(/^(?:-{3,}|\*{3,}|_{3,})\s*\n+/, '');
  // A heading alone is not proof of delivery; only recover it for writing requests.
  // Unstructured replies require an explicit delivery introduction.
  if (!intro && !/^#{1,6}\s+\S/.test(text)) return null;
  const note = text.search(/\n\s*\n(?:#{1,6}\s+|\*\*)?(?:设计判断|创作说明|文案说明|写作说明|修改说明|调整说明)(?:\*\*)?[：:\s]/);
  const direction = note < 0 ? '从已完成的对话文案恢复。' : text.slice(note).trim().slice(0, 2000);
  if (note >= 0) text = text.slice(0, note).trim().replace(/\n+(?:-{3,}|\*{3,}|_{3,})\s*$/, '').trim();
  const fenced = text.match(/^(`{3,}|~{3,})(?:markdown|md|text)?\s*\n([\s\S]*?)\n\1\s*$/i);
  if (fenced) text = fenced[2].trim();
  if (!text || text.length > 200000 || /^#{1,6}\s+(?:问题|需要确认|创作建议|写作建议|思路|建议|说明)(?:\s|[：:]|$)/.test(text)) return null;
  // An unclosed fence can be a truncated response, never a completed artifact.
  if (/^(?:`{3,}|~{3,})/.test(text)) return null;
  const heading = text.match(/^#{1,6}\s+(.+)$/m);
  return { type: 'text', demo: false, title: (heading?.[1] || title).slice(0, 100), direction, text };
}

export function textArtifactFromMessages(project) {
  if (project?.type !== 'text' || project.versions.length) return null;
  for (let index = project.messages.length - 1; index > 0; index--) {
    const message = project.messages[index];
    const request = project.messages[index - 1];
    if (message.role !== 'assistant' || message.version != null || request.role !== 'user') continue;
    if (request.status && request.status !== 'completed') continue;
    const artifact = textArtifactFromReply(message.text, request.text, project.title);
    if (artifact) return artifact;
  }
  return null;
}
