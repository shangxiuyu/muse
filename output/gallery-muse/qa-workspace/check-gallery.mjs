import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createApp } from '../../../server/app.mjs';
import { readConfig } from '../../../server/config.mjs';
import { samples } from '../../../web/lib/data.js';

const dataDir = await mkdtemp(join(tmpdir(), 'muse-gallery-e2e-'));
const app = await createApp({ ...readConfig({}), dataDir, vaultDir: join(dataDir, 'empty-vault') });
await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${app.server.address().port}`;
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const report = { samples: [], downloads: [], errors: [], dataDir };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, acceptDownloads: true });
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(origin);
  await page.locator('.connection-dot.offline').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  await page.locator('.nav-item[data-page="gallery"]').click();
  assert.equal(await page.locator('[data-sample]').count(), 12);
  for (const type of ['ui', 'ppt', 'text', 'image']) {
    await page.locator(`[data-filter="${type}"]`).click();
    assert.equal(await page.locator('[data-sample]').count(), type === 'ui' ? 6 : 2);
  }
  await page.locator('[data-filter="all"]').click();
  await page.locator('.curated-cover').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  await page.screenshot({ path: new URL('gallery-desktop.png', import.meta.url).pathname, fullPage: true });
  for (const sample of samples) {
    await page.locator(`[data-sample="${sample.id}"]`).click();
    await page.locator('.preview-status').waitFor();
    const projects = app.store.publicWorkspace().projects;
    const project = projects.find(p => p.sampleId?.startsWith(`muse6:${sample.id}:`));
    assert.ok(project, `${sample.id}: saved in workspace`);
    assert.equal(project.versions.length, 1);
    assert.equal(project.versions[0].demo, true);
    assert.ok(await page.locator('#prompt').isVisible(), `${sample.id}: continuation composer available`);
    report.samples.push({ id: sample.id, projectId: project.id, version: 1 });
    if (['reading', 'less', 'coffee', 'still'].includes(sample.id)) {
      await page.locator('[data-action="download"]').click();
      const promise = page.waitForEvent('download');
      await page.locator('[data-action="download-source"]').click();
      const download = await promise;
      await download.saveAs(join(dataDir, `${sample.id}.zip`));
      report.downloads.push({ id: sample.id, name: download.suggestedFilename() });
      await page.locator('#dialog').waitFor({ state: 'hidden' });
    }
    await page.locator('.nav-item[data-page="gallery"]').click();
  }
  await page.locator('[data-sample="reading"]').click();
  assert.equal(app.store.publicWorkspace().projects.length, 12, 'reopening reuses existing sample copy');
  await page.reload();
  await page.locator('.preview-status').waitFor();
  assert.equal(app.store.publicWorkspace().projects.length, 12);
  await page.locator('.nav-item[data-page="gallery"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-filter="ui"]').click();
  assert.equal(await page.locator('[data-sample]').count(), 6);
  report.mobile = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(report.mobile.scrollWidth <= report.mobile.width);
  await page.screenshot({ path: new URL('gallery-mobile.png', import.meta.url).pathname, fullPage: true });
  await page.locator('[data-sample="reading"]').click();
  await page.locator('.preview-status').waitFor();
  await page.screenshot({ path: new URL('workspace-mobile.png', import.meta.url).pathname });
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await app.close();
  await writeFile(new URL('gallery.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));
