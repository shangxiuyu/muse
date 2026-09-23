import { Script } from 'node:vm';
import { randomUUID } from 'node:crypto';
import { getArchetype } from '../web/lib/archetypes.js';
import { getImageStyle } from '../web/lib/image-styles.js';

export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const types = ['ui', 'ppt', 'text', 'image'];
export const isId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
export function archetypeInput(value, type, { allowLegacyText = false } = {}) {
  if (value == null) return null;
  const reference = getArchetype(value);
  if (!reference) throw new AppError('请选择 Muse 内置的创作参考。');
  if (type && reference.media && reference.media !== type) throw new AppError(reference.media === 'text' ? '文案参考只能用于文案创作。' : '演示参考只能用于 PPT 创作。');
  if (type === 'text' && !reference.media && !allowLegacyText) throw new AppError('请为文案选择文案参考，或移除原来的视觉参考。');
  return reference.id;
}
export function string(value, name, max, allowEmpty = false) {
  if (typeof value !== 'string' || value.length > max || (!allowEmpty && !value.trim())) throw new AppError(`${name}格式不正确或长度超出限制。`);
  return value;
}
export function imageStyleInput(value) {
  if (value == null) return null;
  const style = getImageStyle(value);
  if (!style) throw new AppError('请选择 Muse 内置的图片风格。');
  return style.id;
}
export function mediaType(value) {
  if (!types.includes(value)) throw new AppError('不支持的创作类型。');
  return value;
}
export function memoryInput(input) {
  if (!input || ![...types, 'all'].includes(input.type)) throw new AppError('请选择偏好的适用范围。');
  return { id: randomUUID(), type: input.type, text: string(input.text, '品味偏好', 4000).trim(), created: Date.now() };
}
export function runInput(input) {
  if (!input || !isId(input.requestId)) throw new AppError('生成请求缺少有效标识。');
  const result = { requestId: input.requestId, prompt: string(input.prompt, '创作想法', 6000), style: string(input.style || '随内容判断', '创作方向', 100) };
  if (input.attachment) result.attachment = { name: string(input.attachment.name, '附件名', 200), text: string(input.attachment.text, '参考文本', 51200, true) };
  if (input.archetypeId != null) result.archetypeId = archetypeInput(input.archetypeId);
  if (input.imageStyleId != null) result.imageStyleId = imageStyleInput(input.imageStyleId);
  if (input.baseVersionId != null) { if (!isId(input.baseVersionId)) throw new AppError('版本标识无效。'); result.baseVersionId = input.baseVersionId; }
  return result;
}

export function validateArtifact(input, type) {
  if (!input || typeof input !== 'object') throw new AppError('没有收到可交付作品。');
  const a = { id: randomUUID(), type: mediaType(type), demo: false, title: string(input.title, '作品标题', 100), direction: string(input.direction, '创作说明', 2000) };
  if (type === 'ui') {
    a.html = string(input.html, '网页 HTML', 350000);
    a.css = string(input.css || '', '网页 CSS', 150000, true);
    a.js = string(input.js || '', '网页脚本', 100000, true);
    if (a.js) { try { new Script(a.js); } catch { throw new AppError('网页脚本存在语法错误，请修正后重新提交。'); } }
    if (!/<[a-z][\s\S]*>/i.test(a.html)) throw new AppError('网页需要有效的 HTML 内容。');
  } else if (type === 'text') a.text = string(input.text, '文案', 200000);
  else if (type === 'ppt') {
    if (!Array.isArray(input.slides) || input.slides.length < 1 || input.slides.length > 30) throw new AppError('演示需要 1–30 页幻灯片。');
    a.slides = input.slides.map(s => ({ title: string(s.title, '幻灯片标题', 300), body: string(s.body || '', '幻灯片正文', 5000, true), note: string(s.note || '', '讲者备注', 5000, true), kicker: string(s.kicker || '', '页眉', 150, true), color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : '#f1ece2', ...(s.html ? { html: string(s.html, '幻灯片 HTML', 80000) } : {}) }));
  } else {
    if (input.imageData) {
      if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(input.imageData) || input.imageData.length > 14000000) throw new AppError('图片格式或大小不符合要求。');
      a.imageData = input.imageData;
    } else {
      a.svg = string(input.svg, 'SVG 插画', 350000);
      if (!/^\s*<svg[\s>]/i.test(a.svg) || !/<\/svg>\s*$/i.test(a.svg)) throw new AppError('请提交完整 SVG 插画。');
    }
  }
  return a;
}

export function publicProject(project) {
  const { _session, ...result } = project;
  return result;
}

export function importProject(input) {
  if (!input || !isId(input.id) || !Array.isArray(input.versions) || !Array.isArray(input.messages)) throw new AppError('旧作品格式不正确。');
  const type = mediaType(input.type);
  const importedReference = value => archetypeInput(value, type, { allowLegacyText: true });
  const imageStyle = value => {
    const id = imageStyleInput(value);
    if (id && type !== 'image') throw new AppError('图片风格只能用于图片创作。');
    return id;
  };
  const versions = input.versions.slice(0, 20).map(v => {
    const imageStyleId = imageStyle(v.imageStyleId);
    const style = getImageStyle(imageStyleId);
    return { ...validateArtifact(v, type), demo: v.demo !== false, archetypeId: importedReference(v.archetypeId), imageStyleId,
      ...(style ? { styleReference: { id: style.id, name: style.name, path: style.path } } : {}) };
  });
  const messages = input.messages.slice(-100).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', text: string(m.text, '旧对话', 20000, true), archetypeId: importedReference(m.archetypeId), imageStyleId: imageStyle(m.imageStyleId), ...(Number.isInteger(m.version) && versions[m.version] ? { version: m.version } : {}), ...(m.reference ? { reference: string(m.reference, '参考文本', 51200), attachment: string(m.attachment || '参考文本', '附件名', 200) } : {}) }));
  return { id: input.id, type, title: string(input.title, '作品标题', 100), updated: Number(input.updated) || Date.now(), archetypeId: importedReference(input.archetypeId), imageStyleId: imageStyle(input.imageStyleId), versions, messages, ...(input.sampleId ? { sampleId: string(input.sampleId, '示例标识', 100) } : {}) };
}
