import { escapeHtml as esc } from './data.js';

export function slideHtml(slide, index = 0, total = 4) {
  if (slide.html) return `<section class="slide custom-slide" style="width:100%;min-height:100vh;position:relative;padding:0;display:block">${slide.html}</section>`;
  const bg = /^#[0-9a-f]{6}$/i.test(slide.color) ? slide.color : '#f1ece2';
  const n = parseInt(bg.slice(1), 16);
  const dark = ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 140;
  return `<section class="slide" style="background:${bg};color:${dark ? '#f3f0e6' : '#28382c'}"><div class="kicker">${esc(slide.kicker || 'MUSE PRESENTATION')}</div><h1>${esc(slide.title)}</h1><p>${esc(slide.body || '')}</p><footer><span>MUSE / CREATIVE STUDIO</span><span>${String(index + 1).padStart(2, '0')} — ${String(total).padStart(2, '0')}</span></footer></section>`;
}
export const deckStyle = `*{box-sizing:border-box}body{margin:0;background:#e8e7e0;font-family:Arial,"PingFang SC",sans-serif}.slide{aspect-ratio:16/9;width:100%;padding:6% 7%;display:flex;flex-direction:column;overflow:hidden}.kicker{font-size:clamp(10px,1.4vw,18px);letter-spacing:.15em}h1{font-size:clamp(26px,5.4vw,76px);line-height:1.22;white-space:pre-line;font-weight:500;margin:5% 0 3%;font-family:Georgia,"Songti SC",serif}p{font-size:clamp(12px,1.8vw,24px);line-height:1.7;white-space:pre-line;margin:0}footer{display:flex;justify-content:space-between;margin-top:auto;font-size:clamp(9px,1vw,14px);padding-top:4%}@media print{.slide{break-after:page;height:100dvh}nav{display:none!important}}`;
export function deckHtml(artifact) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(artifact.title)}</title><style>${deckStyle}html{scroll-snap-type:y mandatory}.slide{min-height:100dvh;scroll-snap-align:start}nav{position:fixed;right:16px;bottom:16px;display:flex;gap:8px}button{padding:12px;border:1px solid #aaa;border-radius:6px;cursor:pointer;background:#faf9f6;color:#28382c}</style></head><body>${artifact.slides.map((slide, i) => slide.html ? `<section class="slide" style="padding:0;display:block;height:100dvh"><iframe title="演示第 ${i + 1} 页" sandbox="" referrerpolicy="no-referrer" style="border:0;width:100%;height:100%" srcdoc="${esc(safePreview(`<style>${deckStyle}</style>${slideHtml(slide, i, artifact.slides.length)}`))}"></iframe></section>` : slideHtml(slide, i, artifact.slides.length)).join('')}<nav><button onclick="step(-1)" aria-label="上一页">←</button><button onclick="step(1)" aria-label="下一页">→</button><button onclick="document.documentElement.requestFullscreen?.()">全屏</button></nav><script>function step(d){const s=[...document.querySelectorAll('.slide')];const i=Math.round(scrollY/innerHeight);s[Math.max(0,Math.min(s.length-1,i+d))].scrollIntoView()}addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown',' '].includes(e.key)){e.preventDefault();step(1)}if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();step(-1)}});<\/script></body></html>`;
}

export function safePreview(html) {
  // An opaque sandbox plus CSP keeps generated code away from workspace data and network.
  const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'";
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"></head><body>${html}</body></html>`;
}

export function uiHtml(artifact) {
  const styles = artifact.css ? `<style>${artifact.css.replace(/<\/style/gi, '<\\/style')}</style>` : '';
  const scripts = artifact.js ? `<script>${artifact.js.replace(/<\/script/gi, '<\\/script')}</script>` : '';
  const source = artifact.html || '';
  // Model output may be a semantic fragment. Export it as a complete UTF-8 page.
  const html = /<html[\s>]/i.test(source) ? source : `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(artifact.title || 'Muse 作品')}</title></head><body>${source}</body></html>`;
  const styled = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${styles}</head>`) : styles + html;
  return /<\/body>/i.test(styled) ? styled.replace(/<\/body>/i, `${scripts}</body>`) : styled + scripts;
}
