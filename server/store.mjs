import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { publicProject } from './validation.mjs';

export class Store {
  constructor(directory) { this.directory = directory; this.file = join(directory, 'workspace.json'); this.queue = Promise.resolve(); }
  async load() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    try { this.data = JSON.parse(await readFile(this.file, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('工作空间数据无法读取。请保留原文件并检查备份。', { cause: error }); }
    if (!this.data) this.data = { schema: 1, id: randomUUID(), projects: [], memories: [], runs: [] };
    if (this.data.schema !== 1 || !Array.isArray(this.data.projects) || !Array.isArray(this.data.memories) || !Array.isArray(this.data.runs)) throw new Error('工作空间格式不受支持。');
    await this.update(data => {
      for (const run of data.runs) if (run.status === 'running') {
        run.status = 'interrupted'; run.error = '服务重启中断了这次创作。已完成的版本仍然保留，可以重新尝试。';
        const message = data.projects.find(p => p.id === run.projectId)?.messages.find(m => m.runId === run.id);
        if (message) message.status = 'interrupted';
      }
    });
    return this;
  }
  update(change) {
    const operation = this.queue.then(async () => {
      const next = structuredClone(this.data);
      const result = await change(next);
      const temporary = `${this.file}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(next), { mode: 0o600 });
      await rename(temporary, this.file);
      this.data = next;
      return result;
    });
    this.queue = operation.catch(() => {});
    return operation;
  }
  publicWorkspace() {
    return { id: this.data.id, projects: this.data.projects.map(publicProject).sort((a, b) => b.updated - a.updated), memories: this.data.memories, runs: this.data.runs.map(({ input, ...r }) => r) };
  }
}
