import { resolve } from 'node:path';
import { readConfig, rootDir } from './server/config.mjs';
import { createApp } from './server/app.mjs';

try {
  process.loadEnvFile(resolve(rootDir, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') console.error('loadEnvFile error:', error);
}
const config = readConfig();
console.log(`[Muse] Booting on ${config.host}:${config.port}, DeepSeek configured: ${config.configured}`);

try {
  const app = await createApp(config);
  app.server.listen(config.port, config.host, () => {
    console.log(`[Muse] Server successfully running at http://${config.host}:${config.port}`);
  });
  app.server.on('error', async error => {
    console.error('[Muse] Server socket error:', error);
    await app.close();
    process.exit(1);
  });
} catch (err) {
  console.error('[Muse] Fatal startup error:', err);
  process.exit(1);
}
