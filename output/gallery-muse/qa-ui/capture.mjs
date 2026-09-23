import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { browser: await browser.version(), created: new Date().toISOString(), samples: {} };
for (const name of ['reading', 'objects', 'retreat', 'festival']) {
  report.samples[name] = {};
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(`file://${dir}/${name}/index.html`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${dir}/${name}/${width}-full.png`, fullPage: true });
    await page.screenshot({ path: `${dir}/${name}/${width}-first.png` });
    const snapshot = await page.locator('body').ariaSnapshot();
    await fs.writeFile(`${dir}/${name}/${width}-snapshot.txt`, snapshot);
    const metrics = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      smallText: [...document.querySelectorAll('body *')].filter(el => {
        const style = getComputedStyle(el), rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()) && parseFloat(style.fontSize) < 12;
      }).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0,120), fontSize: getComputedStyle(el).fontSize })),
      overflow: [...document.querySelectorAll('body *')].filter(el => {const r=el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).visibility !== 'hidden';}).slice(0,30).map(el => ({tag:el.tagName,class:el.className,text:el.textContent.trim().slice(0,80)})),
      controls: [...document.querySelectorAll('button,input,select,textarea,details')].map(el => ({tag:el.tagName,id:el.id,text:el.textContent.trim().slice(0,100),type:el.type,attrs:[...el.attributes].filter(a => a.name.startsWith('data-')).map(a => [a.name,a.value])}))
    }));
    report.samples[name][width] = { ...metrics, errors };
    await page.close();
  }
}
await fs.writeFile(`${dir}/capture.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.samples).map(([name,widths]) => [name,Object.fromEntries(Object.entries(widths).map(([width,r])=>[width,{scrollWidth:r.scrollWidth,smallText:r.smallText.length,errors:r.errors}]))])), null, 2));
