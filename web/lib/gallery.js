import { samples, media, escapeHtml as esc } from './data.js';
import { safePreview, deckStyle, slideHtml, uiHtml } from './artifacts.js';
import { museSamples } from './samples/muse-generated.js';

// A new Muse revision gets its own copy; previously opened samples and edits survive.
export const sampleProjectKey = id => {
  const source = museSamples[id];
  if (!source) throw new Error('这份样板暂时不可用，请选择其他作品。');
  return `muse6:${id}:${source.provenance.artifactSha256.slice(0, 12)}`;
};

export function createSample(id) {
  const sample = samples.find(item => item.id === id);
  const source = museSamples[id];
  if (!sample || !source || source.artifact.type !== sample.type) throw new Error('这份样板暂时不可用，请选择其他作品。');
  // Copies retain the actual creative direction and independent nested content.
  return structuredClone({ ...source.artifact, demo: true, prompt: sample.prompt,
    sampleProvenance: { sampleId: sample.id, ...source.provenance } });
}

function writingCover(artifact, id) {
  const coffee = id === 'coffee';
  const heading = artifact.text.match(/^#\s+(.+)$/m)?.[1] || artifact.title;
  const section = artifact.text.match(/^##\s+(.+)\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/m);
  const excerpt = (section?.[2] || artifact.text).split(/\n\s*\n/)
    .map(value => value.trim()).filter(value => value && !/^(?:#|>|---|〔|\[)/.test(value)).slice(0, 2);
  const plain = value => value.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  const title = esc(plain(heading)).replace(/[，,]/, '$&<br>');
  return `<style>*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden}body{padding:60px 74px;background:${coffee ? '#eee6d8' : '#ece9db'};color:${coffee ? '#594333' : '#424c65'};font-family:"Avenir Next","PingFang SC",sans-serif}.writing-top{display:flex;justify-content:space-between;border-bottom:1px solid;padding-bottom:24px;font-size:14px;letter-spacing:2px}.writing-title{font:64px/1.5 "Songti SC",serif;font-weight:400;margin:42px 0 24px;max-width:900px}.writing-excerpt{font-size:20px;line-height:1.9;max-width:900px}.writing-excerpt p{margin:0 0 12px;white-space:pre-line}.writing-bottom{position:absolute;bottom:40px;left:74px;right:74px;border-top:1px solid;padding-top:20px;font-size:14px;display:flex;justify-content:space-between}.writing-mark{width:64px;height:6px;background:currentColor;margin-bottom:28px}</style><div class="writing-top"><span>MUSE / WORDS</span><span>原创概念文案</span></div><h1 class="writing-title">${title}</h1><div class="writing-mark"></div><div class="writing-excerpt">${excerpt.map(value => `<p>${esc(plain(value))}</p>`).join('')}</div><div class="writing-bottom"><span>${esc(section?.[1] || '正文节选')}</span><span>正文节选 / 可继续创作</span></div>`;
}

const withoutScripts = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
const coverCache = new Map();
export function sampleCover(id) {
  if (coverCache.has(id)) return coverCache.get(id);
  const artifact = createSample(id);
  let html;
  // Use the same module assembly as opened artifacts, without executable code
  // or stylesheet requests. The actual CSS is already present in the artifact.
  if (artifact.type === 'ui') html = uiHtml({ ...artifact, js: '', html: withoutScripts(artifact.html)
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["']?stylesheet\b)[^>]*>/gi, '') });
  if (artifact.type === 'ppt') html = `<style>${deckStyle}</style>${slideHtml(artifact.slides[0], 0, artifact.slides.length)}`;
  if (artifact.type === 'text') html = writingCover(artifact, id);
  if (artifact.type === 'image') html = `<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{display:block;width:100%;height:100%;object-fit:contain}</style>${artifact.svg}`;
  const cover = safePreview(withoutScripts(html)).replace("script-src 'unsafe-inline'", "script-src 'none'");
  coverCache.set(id, cover);
  return cover;
}

// Gallery cards use pre-rendered local images; retained for older app entrypoints.
export function mountGalleryPreviews() {}

export function sampleCard(sample) {
  const revision = museSamples[sample.id].provenance.artifactSha256.slice(0, 12);
  return `<button class="sample-card curated-card" data-sample="${esc(sample.id)}" aria-label="打开${esc(sample.title)}的${media[sample.type].label}样板">
    <div class="sample-thumb curated-thumb"><img class="curated-cover" src="/assets/gallery/${esc(sample.id)}.png?v=${revision}" width="1200" height="750" loading="lazy" decoding="async" alt=""><span class="curated-label">Muse 设计</span><span class="curated-open" aria-hidden="true">打开样板 ↗</span></div>
    <div class="sample-meta"><h3>${esc(sample.title)}</h3><span class="type-badge">${media[sample.type].label}</span></div><p class="sample-desc">${esc(sample.subtitle)}</p><div class="sample-detail"><span>${esc(sample.detail)}</span><span>${esc(sample.tag)}</span></div></button>`;
}
