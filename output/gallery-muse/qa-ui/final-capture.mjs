import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const report={environment:{browser:`Chrome ${await browser.version()}`,sandbox:'allow-scripts',sizes:['1440×900','390×900']},samples:{}};
for(const name of ['reading','objects','retreat','festival']) {
 const artifactPath=await fs.access(`${dir}/../${name}/reviewed-artifact.json`).then(()=>`${dir}/../${name}/reviewed-artifact.json`,()=>`${dir}/../${name}/artifact.json`);
 const raw=await fs.readFile(artifactPath);
 report.samples[name]={artifactPath,sha256:createHash('sha256').update(raw).digest('hex'),widths:{}};
 for(const width of [1440,390]){
  const outer=await browser.newPage({viewport:{width,height:900}});
  await outer.setContent('<style>html,body{margin:0;height:100%;overflow:hidden}iframe{display:block;width:100%;height:100%;border:0}</style><iframe sandbox="allow-scripts"></iframe>');
  await outer.locator('iframe').evaluate((frame,markup)=>frame.srcdoc=markup,await fs.readFile(`${dir}/${name}/index.html`,'utf8'));
  await outer.waitForTimeout(200);
  const frame=outer.frames().find(f=>f!==outer.mainFrame());
  await frame.waitForLoadState('load');
  await frame.waitForFunction(()=>document.readyState==='complete');
  await outer.screenshot({path:`${dir}/${name}/${width}-reviewed-first.png`});
  const initial=await frame.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,hiddenVisible:[...document.querySelectorAll('[hidden]')].filter(el=>getComputedStyle(el).display!=='none').map(el=>el.id||el.className)}));
  await frame.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  await outer.waitForTimeout(300);
  await outer.screenshot({path:`${dir}/${name}/${width}-reviewed-end.png`});
  report.samples[name].widths[width]=initial;
  await outer.close();
 }
}
await browser.close();
await fs.writeFile(`${dir}/final-capture.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
