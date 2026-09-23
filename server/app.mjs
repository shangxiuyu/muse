import { createServer } from 'node:http';
import { readFile, realpath, mkdir } from 'node:fs/promises';
import { extname, join, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from './store.mjs';
import { MuseAgent } from './agent.mjs';
import { Runs } from './runs.mjs';
import { publicConfig } from './config.mjs';
import lockfile from 'proper-lockfile';
import { configureNetwork } from './network.mjs';
import { readSelectedArchetype } from './archetypes.mjs';
import { readSelectedImageStyle } from './image-styles.mjs';
import { MEMORY_FILES, parseMemoryFiles, readLocalMemoryFiles, importMemories } from './memory-import.mjs';
import { AppError, importProject, isId, mediaType, memoryInput, publicProject, runInput, string } from './validation.mjs';

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const json = (response, value, status = 200) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(value)); };
async function body(request, limit = 150000) {
  if (!request.headers['content-type']?.startsWith('application/json')) throw new AppError('请求必须使用 JSON。', 415);
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > limit) throw new AppError('请求内容过大。', 413); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AppError('请求 JSON 格式不正确。'); }
}

export async function createApp(config, options = {}) {
  configureNetwork();
  await mkdir(config.dataDir, { recursive: true, mode: 0o700 });
  let release;
  try { release = await lockfile.lock(config.dataDir, { lockfilePath: join(config.dataDir, '.workspace.lock'), retries: 0, stale: 30000 }); }
  catch { throw new Error('此工作空间已由另一个 Muse 服务使用。请关闭旧服务后再启动。'); }
  let store;
  try { store = await new Store(config.dataDir).load(); } catch (error) { await release(); throw error; }
  const runs = new Runs(store, options.agent || new MuseAgent(config), config);
  const webRoot = await realpath(join(config.rootDir, 'web'));
  const publicUrl = config.publicUrl ? new URL(config.publicUrl) : null;
  const server = createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Frame-Options', 'SAMEORIGIN');
    try {
      const host = (request.headers.host || '').toLowerCase();
      const publicRequest = publicUrl && host === publicUrl.host;
      if (!publicRequest && !/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) throw new AppError('此工作空间不接受这个访问地址。', 403);
      // The authenticated reverse proxy preserves Host and Origin. Never trust
      // client-supplied forwarded headers to expand the site's allowlist.
      const origin = publicRequest ? publicUrl.origin : `http://${host}`;
      const url = new URL(request.url, origin);
      const path = decodeURIComponent(url.pathname);
      const method = request.method;
      // A link from another site can navigate to the public app shell. Keep API
      // reads, mutations, subresources and embedded documents same-origin only.
      const landingNavigation = ['GET', 'HEAD'].includes(method)
        && (path === '/' || path === '/index.html' || path === '/studio' || path === '/studio.html')
        && request.headers['sec-fetch-mode'] === 'navigate'
        && request.headers['sec-fetch-dest'] === 'document';
      if (!landingNavigation && ((request.headers.origin && request.headers.origin !== origin) || request.headers['sec-fetch-site'] === 'cross-site')) throw new AppError('不允许跨站访问工作空间。', 403);
      if (path === '/api/status' && method === 'GET') return json(response, publicConfig(config));
      if (path === '/api/workspace' && method === 'GET') return json(response, store.publicWorkspace());
      if (path === '/api/export/references' && method === 'GET') {
        // These readers resolve built-in IDs only; no client-supplied file paths.
        const references = await Promise.all([
          readSelectedArchetype(config.rootDir, url.searchParams.get('archetypeId')),
          readSelectedImageStyle(config.rootDir, url.searchParams.get('imageStyleId')),
        ]);
        return json(response, { references: references.filter(Boolean).map(({ id, name, specification }) => ({ id, name, specification })) });
      }
      if (path === '/api/memories/location' && method === 'GET') return json(response, { path: config.vaultDir, configured: config.vaultConfigured, files: MEMORY_FILES });
      if (path === '/api/memories/preview' && method === 'POST') {
        const input = await body(request, 4000000);
        if (!input || !['local', 'files'].includes(input.source)) throw new AppError('请选择本机品味库或上传文件。');
        const files = input.source === 'local' ? await readLocalMemoryFiles(config.vaultDir) : input.files;
        return json(response, parseMemoryFiles(files));
      }
      if (path === '/api/memories/import' && method === 'POST') {
        const input = await body(request, 2500000);
        return json(response, await store.update(data => importMemories(data, input)));
      }
      if (path === '/api/import' && method === 'POST') {
        const input = await body(request, 32000000);
        if (!Array.isArray(input.projects) || !Array.isArray(input.memories) || input.projects.length > 30 || input.memories.length > 50) throw new AppError('备份超出工作空间容量。');
        const projects = input.projects.map(importProject), memories = input.memories.map(memoryInput);
        await store.update(data => {
          if (data.imported) return;
          const additions = projects.filter(p => !data.projects.some(existing => existing.id === p.id));
          if (data.projects.length + additions.length > 30 || data.memories.length + memories.length > 50) throw new AppError('服务器作品容量不足，请先整理后再迁移。');
          data.projects.push(...additions); data.memories.push(...memories); data.imported = true;
        });
        return json(response, store.publicWorkspace());
      }
      if (path === '/api/projects' && method === 'POST') {
        const input = await body(request, 1500000);
        const project = input.sample ? importProject(input.sample) : { id: randomUUID(), type: mediaType(input.type), title: string(input.title, '作品名称', 100), updated: Date.now(), messages: [], versions: [] };
        // A newly submitted sample can never inject private session state or claim AI provenance.
        if (input.sample) for (const version of project.versions) version.demo = true;
        await store.update(data => {
          if (data.projects.length >= 30) throw new AppError('工作空间最多保存 30 件作品，请先整理。');
          if (data.projects.some(p => p.id === project.id)) throw new AppError('作品已存在。', 409);
          data.projects.unshift(project);
        });
        return json(response, publicProject(project), 201);
      }
      if (path === '/api/memories' && method === 'POST') {
        const memory = memoryInput(await body(request));
        await store.update(data => {
          if (data.memories.length >= 50) throw new AppError('最多保存 50 条偏好，请先整理。');
          if (data.runs.some(r => r.status === 'running')) throw new AppError('请等待当前创作完成后再修改品味。', 409);
          data.memories.unshift(memory);
          for (const project of data.projects) delete project._session;
        });
        return json(response, memory, 201);
      }
      const parts = path.split('/').filter(Boolean);
      if (parts[0] === 'api' && parts[1] === 'memories' && isId(parts[2]) && parts.length === 3 && method === 'DELETE') {
        await store.update(data => {
          if (data.runs.some(r => r.status === 'running')) throw new AppError('请等待当前创作完成后再修改品味。', 409);
          data.memories = data.memories.filter(m => m.id !== parts[2]);
          for (const project of data.projects) delete project._session;
        });
        return json(response, { deleted: true });
      }
      if (parts[0] === 'api' && parts[1] === 'projects' && isId(parts[2])) {
        const id = parts[2], project = store.data.projects.find(p => p.id === id);
        if (!project) throw new AppError('作品不存在。', 404);
        if (parts.length === 3 && method === 'GET') return json(response, publicProject(project));
        if (parts.length === 3 && method === 'PATCH') {
          const title = string((await body(request)).title, '作品名称', 100);
          await store.update(data => { const p = data.projects.find(p => p.id === id); p.title = title; p.updated = Date.now(); });
          return json(response, publicProject(store.data.projects.find(p => p.id === id)));
        }
        if (parts.length === 3 && method === 'DELETE') {
          await store.update(data => {
            if (data.runs.some(r => r.projectId === id && r.status === 'running')) throw new AppError('请先停止这份作品的创作。', 409);
            data.projects = data.projects.filter(p => p.id !== id); data.runs = data.runs.filter(r => r.projectId !== id);
          });
          return json(response, { deleted: true });
        }
        if (parts.length === 4 && parts[3] === 'runs' && method === 'POST') return json(response, await runs.start(id, runInput(await body(request))), 202);
      }
      if (parts[0] === 'api' && parts[1] === 'runs' && isId(parts[2])) {
        const id = parts[2];
        if (parts.length === 3 && method === 'GET') return json(response, runs.snapshot(id));
        if (parts[3] === 'cancel' && parts.length === 4 && method === 'POST') { await body(request); return json(response, await runs.cancel(id)); }
        if (parts[3] === 'events' && parts.length === 4 && method === 'GET') {
          runs.snapshot(id);
          response.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
          response.flushHeaders();
          let closed = false;
          const unsubscribe = runs.subscribe(id, snapshot => {
            if (closed) return;
            if (response.writableLength > 1000000) { response.destroy(); return; }
            response.write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);
            if (snapshot.status !== 'running') response.end();
          });
          const heartbeat = setInterval(() => { if (!closed) response.write(': keepalive\n\n'); }, 15000);
          response.on('close', () => { closed = true; clearInterval(heartbeat); unsubscribe(); });
          return;
        }
      }
      if (path.startsWith('/api/')) throw new AppError('接口不存在。', 404);
      if (!['GET', 'HEAD'].includes(method)) throw new AppError('不支持的请求方式。', 405);
      if (path === '/' || path === '/index.html') {
        const file = join(webRoot, 'site/index.html');
        const content = await readFile(file);
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        return response.end(method === 'HEAD' ? undefined : content);
      }
      if (path === '/studio' || path === '/studio/' || path === '/studio.html') {
        const file = join(webRoot, 'studio.html');
        const content = await readFile(file);
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        return response.end(method === 'HEAD' ? undefined : content);
      }
      let relative = path.slice(1);
      if (relative.split('/').some(p => p.startsWith('.')) || !mime[extname(relative)]) throw new AppError('文件不存在。', 404);
      let file;
      try {
        file = await realpath(join(webRoot, relative));
      } catch {
        try { file = await realpath(join(webRoot, 'site', relative)); }
        catch { throw new AppError('文件不存在。', 404); }
      }
      if (!file.startsWith(webRoot + sep)) throw new AppError('文件不存在。', 404);
      const content = await readFile(file);
      response.setHeader('Content-Type', mime[extname(file)]);
      response.end(method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (response.headersSent) { response.end(); return; }
      json(response, { error: error instanceof AppError ? error.message : '服务暂时无法完成请求，请重试。' }, error instanceof AppError ? error.status : 500);
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  return { server, store, runs, async close() { await runs.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await release(); } };
}
