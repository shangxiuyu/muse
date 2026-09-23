import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { uiHtml, safePreview } from '../../../web/lib/artifacts.js';

const directory = new URL('./', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const results = [];
try {
  for (const id of ['slow', 'form']) {
    let artifact;
    try { artifact = JSON.parse(await readFile(new URL(`../${id}/reviewed-artifact.json`, import.meta.url))); }
    catch { artifact = JSON.parse(await readFile(new URL(`../${id}/artifact.json`, import.meta.url))); }
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.route('**/*', route => route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.setContent('<iframe sandbox="allow-scripts" style="position:fixed;inset:0;border:0;width:100vw;height:100vh"></iframe>');
      await page.locator('iframe').evaluate((el, html) => { el.srcdoc = html; }, safePreview(uiHtml(artifact)));
      const frame = page.frameLocator('iframe');
      await frame.locator('h1').waitFor();
      await frame.locator('body').evaluate(() => new Promise(resolve => { if (document.readyState === 'complete') resolve(); else addEventListener('load', resolve, { once: true }); }));
      await page.screenshot({ path: new URL(`${id}-${width}.png`, directory).pathname });
      const layout = await frame.locator('body').evaluate(body => ({ scrollWidth: body.scrollWidth, width: innerWidth, title: document.querySelector('h1').textContent, buttons: [...document.querySelectorAll('button')].map(el => ({ text: el.textContent.trim(), id: el.id, cls: el.className })), inputs: [...document.querySelectorAll('input,select,textarea')].map(el => ({ id:el.id,type:el.type })) }));
      const checks = {};
      if (id === 'form') {
        checks.scripts = await frame.locator('body').evaluate(() => [...document.scripts].map(s => ({src:s.src, length:s.textContent.length})));
        await frame.locator('[role="tab"][data-cat="brand"]').click();
        checks.selected = await frame.locator('[role="tab"][data-cat="brand"]').getAttribute('aria-selected');
        checks.brandProjects = await frame.locator('#grid .card:visible').count();
        await frame.locator('.svc-btn').first().click();
        checks.serviceExpanded = await frame.locator('#svc-1').isVisible();
        await frame.locator('#enquiry-submit').click();
        checks.emptyFormErrors = await frame.locator('[aria-invalid="true"]').count();
        await frame.locator('#f-name').fill('示例主理人');
        await frame.locator('#f-mail').fill('sample@example.com');
        await frame.locator('#f-type').selectOption({ label: '品牌策略与识别' });
        await frame.locator('#f-msg').fill('这是用于验证概念样板的合作背景。');
        await frame.locator('#enquiry-submit').click();
        checks.formStatus = await frame.locator('#form-status').innerText();
      } else {
        await frame.locator('button[data-moment="noon"]').click();
        await page.waitForTimeout(250);
        checks.noonSelected = await frame.locator('button[data-moment="noon"]').getAttribute('aria-pressed');
        checks.noonText = await frame.locator('#moment-readout').innerText();
        const disclosure = frame.locator('button[aria-expanded]').first();
        if (await disclosure.count()) {
          await disclosure.click();
          checks.disclosureExpanded = await disclosure.getAttribute('aria-expanded');
        }
        await frame.locator('[data-filter="winter"]').click();
        checks.winterEntries = await frame.locator('.entry:visible').count();
        checks.winterEmpty = await frame.locator('#almanac-empty').isVisible();
        await frame.locator('#signup-submit').click();
        checks.emailInvalid = await frame.locator('#email').getAttribute('aria-invalid');
        await frame.locator('#email').fill('sample@example.com');
        await frame.locator('#email').press('Enter');
        await frame.locator('#signup-done').waitFor({ state: 'visible' });
        checks.emailSuccess = await frame.locator('#signup-done').innerText();
        await frame.locator('#signup-reset').click();
        checks.reset = await frame.locator('#email').isVisible();
      }
      results.push({ id, width, layout, checks, errors });
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(new URL('websites.json', directory), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
