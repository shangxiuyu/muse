import { spawn, spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const candidates = [process.env.MUSE_NODE_BIN, process.execPath, resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'), '/opt/homebrew/opt/node/bin/node'].filter(Boolean);
const compatible = path => {
  const version = spawnSync(path, ['--version'], { encoding: 'utf8' }).stdout?.trim().match(/^v(\d+)\.(\d+)/);
  return version && (Number(version[1]) > 22 || Number(version[1]) === 22 && Number(version[2]) >= 19);
};
const node = candidates.find(compatible);
if (!node) { console.error('Muse 后端需要 Node.js 22.19+。请升级 Node，或设置 MUSE_NODE_BIN 指向兼容版本。'); process.exit(1); }
const command = process.argv[2] === 'test' ? ['--test', ...process.argv.slice(3)] : [resolve(root, 'server/index.mjs')];
const child = spawn(node, command, { cwd: root, stdio: 'inherit', env: process.env });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', () => { console.error('无法启动 Muse 运行环境。'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
