import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const dir=path.dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const reports=[];
for(const name of (process.argv.length>2?process.argv.slice(2):['reading','objects','retreat','festival'])) for(const width of [1440,390]){
 const outerPage=await browser.newPage({viewport:{width,height:900}});
 const markup=await fs.readFile(`${dir}/${name}/index.html`,'utf8');
 await outerPage.setContent('<style>html,body{margin:0;height:100%;overflow:hidden}iframe{display:block;width:100%;height:100%;border:0}</style><iframe sandbox="allow-scripts"></iframe>');
 await outerPage.locator('iframe').evaluate((el,markup)=>el.srcdoc=markup,markup);
 await outerPage.waitForTimeout(200);
 const page=outerPage.frames().find(f=>f!==outerPage.mainFrame());
 await page.waitForLoadState('load');
 await page.waitForFunction(()=>document.readyState==='complete');
 outerPage.setDefaultTimeout(5000);
 const r={name,width,checks:[],errors:[]}; reports.push(r);
 outerPage.on('pageerror',e=>r.errors.push(e.message));

 const check=async(label,fn)=>{try{await fn();r.checks.push({label,pass:true});}catch(e){r.checks.push({label,pass:false,error:e.message});}};
 const text=sel=>page.locator(sel).textContent();
 const save=async state=>{await page.waitForTimeout(600);return outerPage.screenshot({path:`${dir}/${name}/${width}-${state}.png`,fullPage:false})};
 const openShelf=async()=>{if(width===390) await page.locator('#railOpen').click();};
 if(name==='reading'){
  await check('搜索命中与空状态恢复',async()=>{await openShelf();await page.locator('#shelfSearch').fill('雨');assert.equal(await page.locator('.book').count(),1);await page.locator('#shelfSearch').fill('无此书');assert.equal(await page.locator('#shelfEmpty').isVisible(),true);await page.locator('[data-reset="query"]').click();assert.equal(await page.locator('.book').count(),4);});
  await check('阅读状态筛选与选书',async()=>{await page.locator('[data-filter="done"]').click();assert.equal(await page.locator('.book').count(),1);await page.locator('.book').click();assert.equal(await text('#bookTitle'),'纸与它的时代');});
  await check('札记保存并跨书保留',async()=>{await page.locator('#noteInput').fill('一次本地验收札记');await page.locator('#noteSave').click();assert.match(await text('#noteHint'),/已保存/);await openShelf();await page.locator('[data-filter="all"]').click();await page.locator('.book[data-id="slow-testimony"]').click();await openShelf();await page.locator('.book[data-id="paper-and-its-age"]').click();assert.equal(await page.locator('#noteInput').inputValue(),'一次本地验收札记');});
  await check('超长札记错误与修复',async()=>{await page.locator('#noteInput').fill('字'.repeat(2001));await page.locator('#noteSave').click();assert.equal(await page.locator('#noteError').isVisible(),true);await page.locator('#noteInput').fill('简短札记');await page.locator('#noteSave').click();assert.equal(await page.locator('#noteError').isVisible(),false);});
  await check('开始暂停重置计时',async()=>{if(width===390)await page.locator('#dockToggle').click();await page.locator('#timerToggle').click();await page.waitForTimeout(1200);await page.locator('#timerToggle').click();assert.notEqual(await text('#timerValue'),'00:00');await save('timer');await page.locator('#timerReset').click();assert.equal(await text('#timerValue'),'00:00');if(width===390)await outerPage.keyboard.press('Escape');});
  await check('侧栏札记导航执行',async()=>{await openShelf();await page.getByRole('button',{name:'阅读札记',exact:true}).click();assert.equal(await page.locator('#noteInput').evaluate(el=>document.activeElement===el),true);});
 }
 if(name==='objects'){
  await check('类别筛选',async()=>{await page.locator('.chip[data-filter="textile"]').click();assert.equal(await page.locator('#grid .card').count(),1);await page.locator('.chip[data-filter="all"]').click();assert.equal(await page.locator('#grid .card').count(),6);});
  await check('规格展开收起',async()=>{await page.locator('.specbtn').first().click();assert.equal(await page.locator('.specbtn').first().getAttribute('aria-expanded'),'true');await save('spec');await page.locator('.specbtn').first().click();assert.equal(await page.locator('.specbtn').first().getAttribute('aria-expanded'),'false');});
  await check('加入购物袋、数量与总价',async()=>{await page.locator('#grid .btn--primary').first().click();assert.equal(await text('#bagCount'),'1');await page.locator('#bagBtn').click();assert.equal(await page.locator('#bagEmpty').isVisible(),false);const first=await text('#bagTotal');await page.getByRole('button',{name:/增加「/}).first().click();assert.equal(await text('#bagCount'),'2');assert.equal(Number((await text('#bagTotal')).replace('¥','')),Number(first.replace('¥',''))*2);await save('bag');await page.getByRole('button',{name:/减少「/}).first().click();assert.equal(await text('#bagCount'),'1');await page.getByRole('button',{name:'从袋中移除'}).first().click();assert.equal(await page.locator('#bagEmpty').isVisible(),true);await outerPage.keyboard.press('Escape');assert.equal(await page.locator('#bagPanel').isVisible(),false);});
 }
 if(name==='retreat'){
  await check('房型切换与键盘返回',async()=>{await page.locator('#tab-song').click();assert.equal(await page.locator('#pickSong').isChecked(),true);assert.equal(await page.locator('#panel-song').isVisible(),true);assert.match(await text('#figCap'),/听松/);assert.equal(await page.locator('#viewSong').isVisible(),true);assert.equal(await page.locator('#viewYun').isVisible(),false);await save('room');await page.locator('#tab-song').press('ArrowLeft');assert.equal(await page.locator('#tab-yun').getAttribute('aria-selected'),'true');});
  await check('准备信息原位展开',async()=>{const a=page.locator('details').nth(1);await a.locator('summary').click();assert.equal(await a.getAttribute('open'),'');await a.locator('summary').click();assert.equal(await a.getAttribute('open'),null);});
  await check('空日期错误与示例恢复',async()=>{await page.locator('#outDate').fill('');await page.getByRole('button',{name:'生成行程意向'}).click();assert.equal(await page.locator('#formError').isVisible(),true);await page.locator('#fillDemo').click();assert.equal(await page.locator('#outFilled').isVisible(),true);assert.match(await text('#outNote'),/没有提交到任何服务器/);assert.equal(await page.locator('#formError').isVisible(),false);});
  await check('非法日期阻止生成并恢复',async()=>{const start=await page.locator('#inDate').inputValue();await page.locator('#outDate').fill(start);await page.getByRole('button',{name:'生成行程意向'}).click();assert.equal(await page.locator('#formError').isVisible(),true);await page.locator('#resetBtn').click();await page.waitForTimeout(100);await page.locator('#fillDemo').click();await page.locator('#planNote').fill('安静阅读');await page.getByRole('button',{name:'生成行程意向'}).click();assert.match(await text('#outList'),/安静阅读/);await save('intent');});
  await check('复制可用或有可理解的降级反馈',async()=>{await page.locator('#copyBtn').click();await page.waitForTimeout(200);assert.match(await text('#copyStatus'),/已复制|请手动选中/);});
  await check('清空表单恢复',async()=>{await page.locator('#resetBtn').click();await page.waitForTimeout(100);assert.equal(await page.locator('#outEmpty').isVisible(),true);});
 }
 if(name==='festival'){
  await check('日期类别筛选与空状态恢复',async()=>{await page.locator('[data-kind="day"][data-val="3"]').click();assert.equal(await page.locator('#rows .row').count(),1);await page.locator('[data-kind="cat"][data-val="talk"]').click();assert.equal(await page.locator('#empty').isVisible(),true);await page.locator('#emptyReset').click();assert.equal(await page.locator('#rows .row').count(),6);});
  await check('介绍展开收起',async()=>{await page.locator('[data-act="toggle"][data-id="s1"]').click();assert.equal(await page.locator('[data-act="toggle"][data-id="s1"]').getAttribute('aria-expanded'),'true');await save('details');await page.locator('[data-act="toggle"][data-id="s1"]').click();assert.equal(await page.locator('[data-act="toggle"][data-id="s1"]').getAttribute('aria-expanded'),'false');});
  await check('加入观展单与移除',async()=>{await page.locator('[data-act="cart"][data-id="s1"]').click();assert.equal(await text('#cartCount'),'1');await page.locator('[data-act="rm"][data-id="s1"]').click();assert.equal(await text('#cartCount'),'0');});
  await check('示例冲突提醒与清空',async()=>{await page.locator('#loadSample').click();assert.equal(await text('#cartCount'),'3');assert.equal(await page.locator('#conflictBox').isVisible(),true);assert.equal(await text('#conflictN'),'1');await save('conflict');await page.locator('#clearCart').click();assert.equal(await page.locator('#cartEmpty').isVisible(),true);});
 }
 r.finalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 await outerPage.close();
}
await fs.writeFile(`${dir}/${process.argv.length>2?process.argv.slice(2).join("-")+"-":""}interactions.json`,JSON.stringify(reports,null,2));
await browser.close();
console.log(JSON.stringify(reports.map(r=>({...r,checks:r.checks.map(c=>({...c,error:c.error?.slice(0,350)}))})),null,2));
