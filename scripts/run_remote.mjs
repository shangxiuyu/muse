import { execSync } from 'node:child_process';

const cmd = process.argv.slice(2).join(' ');
try {
  const out = execSync(`ssh -o BatchMode=yes -T aliyun-partner ${JSON.stringify(cmd)}`, {
    encoding: 'utf8',
    timeout: 15000,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  process.stdout.write(out);
} catch (error) {
  if (error.stdout) process.stdout.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  console.error('[EXEC_ERROR]', error.message);
  process.exit(1);
}
