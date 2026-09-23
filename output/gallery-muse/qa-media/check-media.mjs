import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { deckStyle, slideHtml, safePreview } from '../../../web/lib/artifacts.js';
import { renderMarkdown } from '../../../web/lib/markdown.js';

const root = resolve('output/gallery-muse');
const reviewed = process.argv.includes('--reviewed');
const requested = process.argv.slice(2).filter(arg => arg !== '--reviewed');
const out = join(root, 'qa-media', ...(reviewed ? ['reviewed'] : []));
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const results = [];
try {
  for (const id of requested.length ? requested : ['less', 'field', 'coffee', 'letter', 'still', 'rhythm']) {
    let raw;
    try { raw = await readFile(join(root, id, reviewed ? 'reviewed-artifact.json' : 'artifact.json'), 'utf8'); } catch { results.push({ id, status: 'not-ready' }); continue; }
    const artifact = JSON.parse(raw);
    const result = { id, artifactId: artifact.id, sha256: createHash('sha256').update(raw).digest('hex'), type: artifact.type, title: artifact.title, pages: [] };
    const sizes = artifact.type === 'ppt' ? [[1200, 675], [360, 203]] : artifact.type === 'image' ? [[1440, 900], [360, 225]] : [[1200, 900], [360, 800]];
    for (const [width, height] of sizes) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const items = artifact.type === 'ppt' ? artifact.slides : [artifact];
      for (const [index, item] of items.entries()) {
        let html;
        if (artifact.type === 'ppt') html = safePreview(`<style>${deckStyle}</style>${slideHtml(item, index, items.length)}`);
        if (artifact.type === 'image') html = safePreview(`<style>html,body{margin:0;width:100%;height:100%;background:#ece8dd}svg{display:block;width:100%;height:100%;object-fit:contain}</style>${item.svg}`);
        if (artifact.type === 'text') html = safePreview(`<style>body{margin:0;background:#faf7ef;color:#3f4437;font:16px/1.9 "Avenir Next","PingFang SC",sans-serif}article{max-width:720px;margin:60px auto;padding:0 28px}h1,h2{font-family:"Songti SC",serif;line-height:1.5}h1{font-size:40px}h2{font-size:26px;margin-top:48px}blockquote{margin:24px 0;color:#6d6b60}hr{border:0;border-top:1px solid #d7d0c1;margin:40px 0}</style><article>${renderMarkdown(item.text)}</article>`);
        await page.setContent(html, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        const name = `${id}-${index + 1}-${width}x${height}`;
        await page.screenshot({ path: join(out, `${name}.png`), fullPage: artifact.type === 'text' });
        const metrics = await page.evaluate(() => {
          const all = [...document.querySelectorAll('body *')];
          const textNodes = all.filter(el => [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()));
          const text = textNodes.map(el => {
            const r = el.getBoundingClientRect(); const c = getComputedStyle(el);
            return { tag: el.tagName, class: el.className?.baseVal ?? el.className, text: el.textContent.trim().slice(0, 130), x: r.x, y: r.y, width: r.width, height: r.height, fontSize: parseFloat(c.fontSize), color: c.color, background: c.backgroundColor, overflowX: c.overflowX, overflowY: c.overflowY };
          }).filter(e => e.width && e.height && !['STYLE', 'SCRIPT'].includes(e.tag));
          return { viewport: {width:innerWidth, height:innerHeight}, document: {width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}, text, outsideViewport: text.filter(r => r.x < -1 || r.y < -1 || r.x+r.width > innerWidth+1 || r.y+r.height > innerHeight+1), smallText: text.filter(r => r.fontSize < 10), emptyImages: [...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src) };
        });
        result.pages.push({ name, index: index + 1, width, height, screenshot: `${name}.png`, errors: [...errors], ...metrics });
      }
      await page.close();
    }
    results.push(result);
  }
  await writeFile(join(out, 'metrics.json'), JSON.stringify(results, null, 2));
  for (const width of [1200,360]) {
    const shots = results.filter(r=>r.type==='ppt').flatMap(r=>r.pages.filter(p=>p.width===width));
    if(!shots.length) continue;
    const cards = await Promise.all(shots.map(async p=>`<figure><img src="data:image/png;base64,${(await readFile(join(out,p.screenshot))).toString('base64')}"><figcaption>${p.name}</figcaption></figure>`));
    const page=await browser.newPage({viewport:{width:1260,height:800},deviceScaleFactor:1});
    await page.setContent(`<style>body{margin:20px;background:#c8c6bd;display:grid;grid-template-columns:repeat(2,1fr);gap:16px;font:14px sans-serif}figure{margin:0}img{width:100%;display:block}figcaption{padding:6px}</style>${cards.join('')}`);
    await page.screenshot({path:join(out,`deck-contact-${width}.png`),fullPage:true});
    await page.close();
  }
  console.log(JSON.stringify(results.map(r=>({id:r.id,type:r.type,status:r.status,pages:r.pages?.map(p=>({name:p.name,document:p.document,outside:p.outsideViewport.length,small:p.smallText.length,errors:p.errors}))})),null,2));
} finally { await browser.close(); }
