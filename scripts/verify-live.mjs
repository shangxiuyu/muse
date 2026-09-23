// Explicit, opt-in live verification. Uses the configured provider and a temporary workspace.
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readConfig, rootDir } from '../server/config.mjs';
import { createApp } from '../server/app.mjs';

try { process.loadEnvFile(join(rootDir, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const config = { ...readConfig(), diagnostics: event => console.log('工具检查:', JSON.stringify(event)) };
const selectedTypes = process.argv.slice(2);
if (!config.configured) throw new Error('请先配置模型。此检查会调用模型并产生用量。');
const directory = await mkdtemp(join(tmpdir(), 'muse-live-'));
const app = await createApp({ ...config, dataDir: directory });
await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${app.server.address().port}`;
const post = async (path, body) => {
  const response = await fetch(url + '/api' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
};
const summary = [];
try {
  for (const [type, prompt] of [
    ['text', '写一段 50 字以内的中文文案：下雨天在家读书。直接交付，不要提问。'],
    ['ui', '制作一个极简的中文读书计时器单页，米白底和深绿字，包含标题「留十分钟给一本书」、一个开始按钮、一个清零按钮和实际可运行的秒表。不要外部资源。代码控制在 200 行内，直接交付。'],
    ['ppt', '制作两页中文演示，主题「每天十分钟阅读」，第一页核心主张，第二页给出一个具体行动。不要虚构数据。两页均直接交付。'],
    ['image', '制作一幅简洁的原创 SVG 矢量插画：米白背景，一本绿色封面的书和一只橙色杯子。使用基本图形即可，直接交付，不需要图像模型。'],
  ]) {
    if (selectedTypes.length && !selectedTypes.includes(type)) continue;
    const project = await post('/projects', { type, title: '后端验证' });
    const run = await post(`/projects/${project.id}/runs`, { prompt, style: '随内容判断', requestId: randomUUID() });
    console.log(`${type}: 已开始真实模型验证`);
    const unsubscribe = app.runs.subscribe(run.id, result => { if (result.progress && result.progress !== summary.at(-1)?.progress) { /* Stream remains available to the web client. */ } });
    await app.runs.active.get(run.id)?.done; unsubscribe();
    const finished = app.runs.snapshot(run.id);
    if (finished.status !== 'completed') throw new Error(`${type}: ${finished.error}`);
    const saved = app.store.data.projects.find(p => p.id === project.id);
    if (saved.versions.length !== 1 || saved.versions[0].demo !== false) throw new Error('未产生真实作品。');
    summary.push({ type, model: saved.versions[0].model, status: finished.status, versions: saved.versions.length, verification: saved.versions[0].verification });
    console.log(`${type}: 完成，已保存真实作品`);
    if (type === 'ui') {
      const revision = await post(`/projects/${project.id}/runs`, { prompt: '只把标题改成「今天，也读十分钟」，保留布局、颜色、按钮和计时功能。', style: '随内容判断', requestId: randomUUID(), baseVersionId: saved.versions[0].id });
      await app.runs.active.get(revision.id)?.done;
      const completed = app.runs.snapshot(revision.id);
      if (completed.status !== 'completed') throw new Error(`ui revision: ${completed.error}`);
      const revised = app.store.data.projects.find(p => p.id === project.id);
      if (revised.versions.length !== 2 || revised.versions[1].parentVersionId !== revised.versions[0].id || !revised.versions[1].html.includes('今天')) throw new Error('连续修改验收失败。');
      summary.push({ type: 'ui-revision', status: 'completed', versions: 2, parentPreserved: true });
      console.log('ui revision: 连续修改与父版本关联通过');
    }
  }
  await mkdir(join(rootDir, '.test-results'), { recursive: true });
  const reportName = selectedTypes.length ? `live-backend-${selectedTypes.filter(type => ['ui', 'text', 'ppt', 'image'].includes(type)).join('-')}.json` : 'live-backend.json';
  await writeFile(join(rootDir, '.test-results', reportName), JSON.stringify({ verifiedAt: new Date().toISOString(), checks: summary }, null, 2));
} finally { await app.close(); await rm(directory, { recursive: true, force: true }); }
