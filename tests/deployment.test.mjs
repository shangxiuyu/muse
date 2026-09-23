import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readConfig } from '../server/config.mjs';
import { createApp } from '../server/app.mjs';

test('deployment origin is explicit and cannot include credentials or a subpath', () => {
  assert.equal(readConfig({}).publicUrl, '');
  const config = readConfig({ MUSE_PUBLIC_URL: 'https://Muse.example.com/' });
  assert.equal(config.publicUrl, 'https://muse.example.com');
  assert.equal(config.host, '127.0.0.1');
  assert.equal(readConfig({ MUSE_PUBLIC_URL: 'http://127.0.0.1:8080' }).publicUrl, 'http://127.0.0.1:8080');
  for (const value of ['muse.example.com', 'file:///tmp/muse', 'https://user:secret@muse.example.com', 'https://muse.example.com/app', 'https://muse.example.com/?token=secret', 'https://muse.example.com/#fragment']) {
    assert.throws(() => readConfig({ MUSE_PUBLIC_URL: value }), /MUSE_PUBLIC_URL/);
  }
});

test('proxy requests preserve same-origin protection and ignore forwarded host spoofing', async t => {
  const dataDir = await mkdtemp(join(tmpdir(), 'muse-deployment-'));
  const config = { ...readConfig({ MUSE_PUBLIC_URL: 'https://muse.example.com' }), dataDir };
  const app = await createApp(config);
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await app.close(); await rm(dataDir, { recursive: true, force: true }); });
  const port = app.server.address().port;
  const send = (headers, method = 'GET', path = '/api/workspace', body) => new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, headers }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.end(body);
  });
  const sameOrigin = { Host: 'muse.example.com', Origin: 'https://muse.example.com', 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'same-origin' };
  const externalLink = { Host: 'muse.example.com', 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };
  for (const path of ['/', '/?from=gallery', '/index.html']) {
    const landing = await send(externalLink, 'GET', path);
    assert.equal(landing.status, 200, `external link can open ${path}`);
    assert.match(landing.body, /<html\b/i);
    assert.equal((await send(externalLink, 'HEAD', path)).status, 200);
  }
  // Entering the public app shell never grants cross-site access to stored data.
  for (const path of ['/api/workspace', '/api/status', '/api/memories/location', '/api/export/references', '/app.js']) {
    assert.equal((await send(externalLink, 'GET', path)).status, 403, path);
  }
  for (const headers of [
    { ...externalLink, 'Sec-Fetch-Dest': 'iframe' },
    { ...externalLink, 'Sec-Fetch-Mode': 'cors', 'Sec-Fetch-Dest': 'empty' },
    { Host: 'muse.example.com', 'Sec-Fetch-Site': 'cross-site' },
    { ...externalLink, Host: 'attacker.example' },
    { Host: 'muse.example.com', Origin: 'https://attacker.example' },
  ]) assert.equal((await send(headers, 'GET', '/')).status, 403);
  assert.equal((await send(externalLink, 'POST', '/', '{}')).status, 403);
  assert.equal((await send({ Host: 'muse.example.com' }, 'GET', '/')).status, 200);
  assert.equal((await send({ Host: `127.0.0.1:${port}` }, 'GET', '/api/status')).status, 200);
  assert.equal((await send(sameOrigin, 'POST', '/api/projects', JSON.stringify({ type: 'text', title: '部署检查' }))).status, 201);
  for (const headers of [
    { ...sameOrigin, Origin: 'https://attacker.example' },
    { ...sameOrigin, Origin: 'http://muse.example.com' },
    { ...sameOrigin, Origin: 'null' },
    { ...sameOrigin, Host: 'attacker.example', 'X-Forwarded-Host': 'muse.example.com' },
    { ...sameOrigin, 'Sec-Fetch-Site': 'cross-site' },
    { Host: `127.0.0.1:${port}`, Origin: 'https://muse.example.com', 'X-Forwarded-Host': 'muse.example.com', 'X-Forwarded-Proto': 'https' },
  ]) {
    assert.equal((await send(headers, 'POST', '/api/projects', JSON.stringify({ type: 'text', title: '不应写入' }))).status, 403);
  }
  assert.equal(JSON.parse((await send(sameOrigin)).body).projects.length, 1);
});
