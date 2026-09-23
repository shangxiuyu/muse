import { resolve } from 'node:path';
import { readConfig, rootDir } from './config.mjs';
import { createApp } from './app.mjs';

try { process.loadEnvFile(resolve(rootDir, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const config = readConfig();
const app = await createApp(config);
app.server.listen(config.port, config.host, () => {
  console.log(`Muse Studio: http://${config.host}:${config.port}`);
  console.log(config.configured ? 'Pi 创作引擎已配置。' : '请在 .env 中配置模型和密钥；作品与示例仍可使用。');
});
app.server.on('error', async error => { console.error(error.code === 'EADDRINUSE' ? `端口 ${config.port} 已被占用，请关闭旧预览服务或设置 PORT。` : '无法启动 Muse 服务。'); await app.close(); process.exitCode = 1; });
let closing = false;
for (const name of ['SIGINT', 'SIGTERM']) process.on(name, async () => { if (closing) return; closing = true; await app.close(); process.exit(0); });
