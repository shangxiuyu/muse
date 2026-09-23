import { access } from 'node:fs/promises';
import { chromium } from 'playwright';
import { safePreview, deckStyle, slideHtml, uiHtml } from '../web/lib/artifacts.js';

export async function inspectArtifact(artifact, config, signal) {
  if (artifact.type === 'text') return { content: [{ type: 'text', text: `已检查非空 Markdown，长度 ${artifact.text.length} 字符。请对照需求核对事实、语气与完整性。` }], details: {} };
  let executablePath = config.browserExecutable;
  if (!executablePath && process.platform === 'darwin') {
    const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    try { await access(chrome); executablePath = chrome; } catch { /* Use Playwright's installed Chromium. */ }
  }
  let browser;
  try {
    signal?.throwIfAborted();
    browser = await chromium.launch({ executablePath, headless: true, chromiumSandbox: true, timeout: 15000 });
    const abort = () => { void browser.close(); };
    signal?.addEventListener('abort', abort, { once: true });
    try {
      const viewport = { width: 1280, height: artifact.type === 'ppt' ? 720 : 850 };
      const context = await browser.newContext({ viewport, serviceWorkers: 'block', acceptDownloads: false });
      await context.route('**/*', route => route.abort());
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const html = artifact.type === 'ui' ? uiHtml(artifact) : artifact.type === 'ppt' ? `<style>${deckStyle}</style>${slideHtml(artifact.slides[0], 0, artifact.slides.length)}` : artifact.imageData ? `<img style="max-width:100%;max-height:100vh" src="${artifact.imageData}">` : artifact.svg;
      await page.setContent(`<html><body style="margin:0"><iframe sandbox="${artifact.type === 'ui' ? 'allow-scripts' : ''}" style="border:0;width:100vw;height:100vh"></iframe></body></html>`);
      await page.locator('iframe').evaluate((el, source) => { el.srcdoc = source; }, safePreview(html));
      await page.waitForTimeout(300);
      signal?.throwIfAborted();
      const screenshot = await page.screenshot({ timeout: 10000 });
      return { content: [{ type: 'text', text: !config.vision ? '作品已在隔离浏览器中渲染。当前模型不接收截图，因此视觉与交互仍未验证。' : artifact.type === 'ppt' ? '这是第一页的实际截图。其余页面未逐页观察，请不要声称已完成全篇视觉验收。' : '这是隔离浏览器中的实际截图。请检查布局、内容完整性和明显溢出；截图不代表交互已测试。' }, ...(config.vision ? [{ type: 'image', data: screenshot.toString('base64'), mimeType: 'image/png' }] : [])], details: { rendered: true, viewport: `${viewport.width}×${viewport.height}`, vision: config.vision } };
    } finally { signal?.removeEventListener('abort', abort); }
  } catch (error) {
    signal?.throwIfAborted();
    return { content: [{ type: 'text', text: '浏览器预览检查不可用。只完成了格式检查，交付时请说明视觉和交互尚未验证。' }], details: { rendered: false } };
  } finally { await browser?.close().catch(() => {}); }
}
