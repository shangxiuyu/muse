import { deckHtml, deckStyle, slideHtml, uiHtml } from './artifacts.js';
import { escapeHtml as esc } from './data.js';
import { getArchetype } from './archetypes.js';
import { getImageStyle } from './image-styles.js';
import { zipFiles } from './zip.js';

const json = value => JSON.stringify(value, null, 2) + '\n';
const pick = (value, keys) => Object.fromEntries(keys.filter(key => value[key] !== undefined).map(key => [key, value[key]]));
export const exportName = title => String(title || '').replace(/[^\p{L}\p{N}_ -]/gu, '').trim().slice(0, 60) || 'Muse-作品';

// Always use the displayed version's reference, never the composer's latest choice.
export function exportReferenceIds(artifact) {
  return {
    archetypeId: getArchetype(artifact.archetypeId === undefined ? artifact.reference?.id : artifact.archetypeId)?.id || null,
    imageStyleId: getImageStyle(artifact.imageStyleId === undefined ? artifact.styleReference?.id : artifact.imageStyleId)?.id || null,
  };
}

export function imageFile(imageData) {
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(imageData);
  if (!match) throw new Error('图片源文件格式不受支持。');
  return { extension: match[1] === 'jpeg' ? 'jpg' : match[1], mime: `image/${match[1]}`, data: Uint8Array.from(atob(match[2]), char => char.charCodeAt(0)) };
}

function sourceArtifact(a) {
  const fields = { ui: ['html', 'css', 'js'], ppt: ['slides'], text: ['text'], image: ['svg', 'imageData'] }[a.type];
  if (!fields) throw new Error('暂不支持这种作品的源文件导出。');
  const result = pick(a, ['id', 'type', 'title', 'direction', 'demo', 'parentVersionId', ...fields]);
  Object.assign(result, exportReferenceIds(a));
  if (a.type === 'ppt') result.slides = a.slides.map(slide => pick(slide, ['title', 'body', 'note', 'kicker', 'color', 'html']));
  return result;
}

function decodeAttribute(value) {
  return value.replace(/&(?:quot|apos|amp|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
    const named = { '&quot;': '"', '&apos;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>' };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const hex = entity[2].toLowerCase() === 'x';
    const code = parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
}

// A static inventory, not a CSS interpreter: retain exact source and provenance.
// Inline declarations stay attached to their elements in the original HTML/SVG.
export function designSystemFor(a) {
  const styles = [], declarations = [];
  const add = (source, css, inline = false) => {
    (inline ? declarations : styles).push({ source, css });
  };
  const html = (source, content) => {
    for (const [index, match] of [...content.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].entries()) add(`${source} · style ${index + 1}`, match[1]);
    for (const [index, match] of [...content.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].entries()) add(`${source} · inline ${index + 1}`, decodeAttribute(match[1] ?? match[2]), true);
    for (const match of content.matchAll(/\b(fill|stroke|stop-color|font-family|font-size)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) add(source, `${match[1]}:${decodeAttribute(match[2] ?? match[3])}`, true);
  };
  if (a.type === 'ui') { if (a.css) add('source/styles.css', a.css); html('source/index.html', a.html || ''); }
  if (a.type === 'ppt') {
    add('Muse Web Deck · 基础样式', deckStyle);
    a.slides.forEach((slide, i) => html(`source/slides/${String(i + 1).padStart(2, '0')}.html`, slideHtml(slide, i, a.slides.length)));
  }
  if (a.svg) html('image.svg', a.svg);
  const tokens = { variables: [], colors: [], typography: [], spacing: [], borders: [], shadows: [] };
  for (const { source, css } of [...styles, ...declarations]) {
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of clean.matchAll(/(?:^|[;{])\s*(--[\w-]+|[a-z][a-z-]*)\s*:\s*([^;{}]+)/gi)) {
      const [, property, raw] = match, value = raw.trim();
      const group = property.startsWith('--') ? 'variables' : /^(?:font(?:-.+)?|line-height|letter-spacing|text-transform)$/i.test(property) ? 'typography' : /^(?:(?:margin|padding)(?:-.+)?|(?:row-|column-)?gap)$/i.test(property) ? 'spacing' : /^border(?:-.+)?$/i.test(property) ? 'borders' : /shadow$/i.test(property) ? 'shadows' : null;
      if (group) tokens[group].push({ property, value, source });
      const colors = value.match(/#[\da-f]{8}\b|#[\da-f]{6}\b|#[\da-f]{4}\b|#[\da-f]{3}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)/gi) || [];
      if (!colors.length && /^(?:color|background-color|fill|stroke|stop-color)$/i.test(property)) colors.push(value);
      for (const color of colors) {
        let entry = tokens.colors.find(item => item.value === color);
        if (!entry) tokens.colors.push(entry = { value: color, sources: [] });
        if (!entry.sources.includes(source)) entry.sources.push(source);
      }
    }
  }
  return { styles, declarations, tokens };
}

export function buildSourceFiles(artifact, { projectTitle = artifact.title, version = null, references = [] } = {}) {
  const a = sourceArtifact(artifact), files = {};
  files['source/artifact.json'] = json(a);
  let entry;
  if (a.type === 'ui') {
    entry = 'index.html'; files[entry] = uiHtml(a);
    files['source/index.html'] = a.html;
    files['source/styles.css'] = a.css || '';
    files['source/script.js'] = a.js || '';
  } else if (a.type === 'ppt') {
    entry = 'index.html'; files[entry] = deckHtml(a);
    files['source/slides.json'] = json(a.slides);
    a.slides.forEach((slide, i) => {
      files[`source/slides/${String(i + 1).padStart(2, '0')}.html`] = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(slide.title)}</title><style>${deckStyle}</style></head><body>${slideHtml(slide, i, a.slides.length)}</body></html>`;
    });
    files['speaker-notes.md'] = a.slides.map((slide, i) => `## ${i + 1}. ${slide.title}\n\n${slide.note || '（无讲者备注）'}`).join('\n\n') + '\n';
  } else if (a.type === 'text') { entry = 'content.md'; files[entry] = a.text; }
  else if (a.imageData) {
    const image = imageFile(a.imageData); entry = `image.${image.extension}`; files[entry] = image.data;
    if (a.svg) files['source/image.svg'] = a.svg;
  } else { entry = 'image.svg'; files[entry] = a.svg; }

  const design = designSystemFor(a);
  files['design-system/styles.css'] = design.styles.map(({ source, css }) => `/* ${source} */\n${css}`).join('\n\n') || '/* 此作品没有独立 CSS 样式。 */\n';
  files['design-system/inline-styles.json'] = json(design.declarations);
  files['design-system/tokens.json'] = json({ format: 'muse-design-inventory-v1', description: '从当前版本静态提取的样式值与来源；未推测语义命名，不包含外部样式表或计算后的样式。', ...design.tokens });
  const selected = exportReferenceIds(a);
  const specs = [selected.archetypeId, selected.imageStyleId].filter(Boolean).map(id => {
    const reference = references.find(item => item.id === id);
    if (!reference?.specification) throw new Error('关联设计规范未能读取，请确认 Muse 服务已启动后重试。');
    files[`design-system/references/${id}.md`] = reference.specification;
    return { id, name: reference.name, file: `design-system/references/${id}.md` };
  });
  files['design-system/README.md'] = `# 设计系统\n\n作品：${a.title}\n\n${a.direction || '未记录创作说明。'}\n\n## 当前作品的实际样式\n\n- styles.css：保留样式块及其来源，包含演示的基础样式。各页面样式可能重名，复用时按来源选择，不要整体叠加。\n- inline-styles.json：HTML / SVG 中的行内样式与来源；完整元素结构保留在源文件中。\n- tokens.json：颜色、字体、间距、边框、阴影及已有 CSS 变量的静态清单。值直接来自当前版本，未生成作品中不存在的设计变量。\n\n${a.type === 'text' ? '文案没有独立的视觉设计系统，正文与内容结构见 content.md。\n\n' : a.imageData ? '位图没有图层、字体或矢量设计变量；导出的是已保存的原始图片，不会虚构可编辑图层。\n\n' : ''}## 关联设计规范\n\n${specs.length ? specs.map(s => `- [${s.name}](references/${s.id}.md)`).join('\n') + '\n\n这些文件是当前版本关联的风格参考；从本机规范库读取，属于参考规范，实际实现以当前作品源码为准。' : '当前版本未关联内置设计规范；以上样式从作品源码中整理。'}\n`;
  files['README.md'] = `# ${projectTitle || a.title} · 源文件包\n\n${version ? `导出版本：${version}\n\n` : ''}打开 ${entry} 查看作品${a.type === 'ppt' ? '；演示支持方向键翻页与全屏' : ''}。\n\n- source/artifact.json：当前作品的原始内容与版本信息。\n${a.type === 'ui' ? '- source/：分别保存原始 HTML、CSS 和 JavaScript。index.html 为组装后的可直接打开版本；修改 source 后需重新组装，或直接编辑根目录 index.html。\n' : a.type === 'ppt' ? '- source/slides.json：逐页内容、原始 HTML 和讲者备注。source/slides/：可单独打开与编辑的页面。speaker-notes.md：完整讲者备注。index.html 为导出时的演示快照，单页修改不会自动同步到它。\n' : ''}- design-system/：实际样式、设计变量清单、创作方向与关联设计规范。\n- manifest.json：版本信息和文件列表。\n\n源文件保留原始内容与内嵌资源。外部链接、字体或图片仍保留其引用，离线可用性取决于原作品；未另行下载远程资源。\n`;
  files['manifest.json'] = json({ format: 'muse-source-package-v1', title: projectTitle || a.title, type: a.type, version, artifactId: a.id || null, entry, references: specs, files: [...Object.keys(files), 'manifest.json'] });
  return files;
}

export function createSourceArchive(artifact, options) {
  return zipFiles(buildSourceFiles(artifact, options));
}
