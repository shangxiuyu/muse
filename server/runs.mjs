import { randomUUID } from 'node:crypto';
import { AppError, publicProject, archetypeInput } from './validation.mjs';
import { getArchetype } from '../web/lib/archetypes.js';
import { getImageStyle } from '../web/lib/image-styles.js';

const terminal = status => status !== 'running';
export class Runs {
  constructor(store, agent, config) { this.store = store; this.agent = agent; this.config = config; this.active = new Map(); this.listeners = new Map(); }
  snapshot(id) {
    const run = this.store.data.runs.find(r => r.id === id);
    if (!run) throw new AppError('这次创作不存在。', 404);
    const { input, ...safe } = run;
    return { ...safe, ...this.active.get(id)?.progress };
  }
  publish(id) { for (const listener of this.listeners.get(id) || []) listener(this.snapshot(id)); }
  subscribe(id, listener) {
    const listeners = this.listeners.get(id) || new Set();
    listeners.add(listener); this.listeners.set(id, listeners);
    listener(this.snapshot(id));
    return () => { listeners.delete(listener); if (!listeners.size) this.listeners.delete(id); };
  }
  async start(projectId, input) {
    if (!this.config.configured) throw new AppError('请先在服务端 .env 中配置模型和密钥。', 503);
    let created = false;
    const run = await this.store.update(data => {
      const project = data.projects.find(p => p.id === projectId);
      if (!project) throw new AppError('作品不存在。', 404);
      archetypeInput(input.archetypeId, project.type);
      if (input.imageStyleId && project.type !== 'image') throw new AppError('图片风格只能用于图片创作。');
      const previous = data.runs.find(r => r.projectId === projectId && r.input.requestId === input.requestId);
      if (previous) {
        if (JSON.stringify(previous.input) !== JSON.stringify(input)) throw new AppError('请求标识已被另一条想法使用。', 409);
        return previous;
      }
      if (data.runs.some(r => r.projectId === projectId && !terminal(r.status))) throw new AppError('这份作品正在创作中，请等待完成或先停止。', 409);
      if (data.runs.filter(r => !terminal(r.status)).length >= 2) throw new AppError('当前有两件作品正在创作，请稍后再试。', 429);
      if (project.versions.length >= 20) throw new AppError('这件作品已有 20 个版本，请新建创作。');
      if (input.baseVersionId && !project.versions.some(v => v.id === input.baseVersionId)) throw new AppError('选中的作品版本不存在，请刷新后再试。', 409);
      const run = { id: randomUUID(), projectId, requestId: input.requestId, input, status: 'running', progress: '理解创作需求', text: '', created: Date.now() };
      project.archetypeId = input.archetypeId || null;
      project.imageStyleId = input.imageStyleId || null;
      project.messages.push({ role: 'user', text: input.prompt, runId: run.id, status: 'running', archetypeId: project.archetypeId, imageStyleId: project.imageStyleId, style: input.style, ...(input.attachment ? { attachment: input.attachment.name, reference: input.attachment.text } : {}) });
      project.updated = Date.now();
      data.runs.push(run);
      while (data.runs.length > 200) {
        const index = data.runs.findIndex(r => terminal(r.status));
        if (index < 0) break;
        data.runs.splice(index, 1);
      }
      created = true;
      return run;
    });
    if (created) {
      const controller = new AbortController();
      const task = { controller, progress: { text: '', progress: run.progress }, committing: false };
      this.active.set(run.id, task);
      task.done = this.execute(run, task);
    }
    return this.snapshot(run.id);
  }
  async execute(run, task) {
    const timer = setTimeout(() => task.controller.abort(new Error('timeout')), this.config.timeoutMs);
    timer.unref?.();
    try {
      const project = structuredClone(this.store.data.projects.find(p => p.id === run.projectId));
      const result = await this.agent.run({ project, input: run.input, memories: structuredClone(this.store.data.memories), signal: task.controller.signal,
        emit: event => {
          if (event.replaceText) task.progress.text = '';
          if (event.textDelta) task.progress.text = (task.progress.text + event.textDelta).slice(0, 200000);
          if (event.progress) task.progress.progress = event.progress;
          if (event.textDelta && !event.replaceText) {
            // Flush short bursts together; the first chunk and tool status stay immediate.
            task.flushTimer ||= setTimeout(() => { task.flushTimer = undefined; this.publish(run.id); }, 40);
          } else { clearTimeout(task.flushTimer); task.flushTimer = undefined; this.publish(run.id); }
        },
      });
      task.controller.signal.throwIfAborted();
      await this.store.update(data => {
        task.controller.signal.throwIfAborted();
        task.committing = true;
        const project = data.projects.find(p => p.id === run.projectId);
        if (!project) throw new AppError('作品已被删除。', 404);
        const version = result.artifact ? project.versions.length : undefined;
        if (result.artifact) {
          const reference = getArchetype(run.input.archetypeId);
          result.artifact.archetypeId = reference?.id || null;
          if (reference) result.artifact.reference = { id: reference.id, name: reference.name, path: reference.path, ...(reference.section ? { section: reference.section } : {}) };
          const imageStyle = getImageStyle(run.input.imageStyleId);
          result.artifact.imageStyleId = imageStyle?.id || null;
          if (imageStyle) result.artifact.styleReference = { id: imageStyle.id, name: imageStyle.name, path: imageStyle.path };
          project.versions.push(result.artifact);
        }
        project.messages.push({ role: 'assistant', text: result.message, ...(version === undefined ? {} : { version }), runId: run.id });
        project.messages.find(m => m.role === 'user' && m.runId === run.id).status = 'completed';
        project._session = result.session;
        project.updated = Date.now();
        if (project.versions.length === 1 && result.artifact) project.title = result.artifact.title;
        Object.assign(data.runs.find(r => r.id === run.id), { status: 'completed', outcome: result.artifact ? 'artifact' : 'message', progress: result.artifact ? '创作完成' : '回复完成', text: '', finished: Date.now() });
      });
    } catch (error) {
      const aborted = task.controller.signal.aborted;
      const timeout = aborted && task.controller.signal.reason?.message === 'timeout';
      const status = aborted && !timeout ? 'cancelled' : 'failed';
      const message = timeout ? '这次创作超时了。已有版本已保留，可以缩小需求后重试。' : aborted ? '已停止创作，已有版本已保留。' : error instanceof AppError ? error.message : '创作未能完成。已有内容已保留，请重试或检查服务配置。';
      try {
        await this.store.update(data => {
          const record = data.runs.find(r => r.id === run.id);
          if (record) Object.assign(record, { status, error: message, progress: '', text: '', finished: Date.now() });
          const userMessage = data.projects.find(p => p.id === run.projectId)?.messages.find(m => m.runId === run.id && m.role === 'user');
          if (userMessage) userMessage.status = status;
        });
      } catch { task.progress = { status: 'failed', error: '作品无法写入磁盘，请检查存储空间。', text: '', progress: '' }; }
    } finally {
      clearTimeout(timer);
      clearTimeout(task.flushTimer);
      if (this.store.data.runs.find(r => r.id === run.id)?.status !== 'running') this.active.delete(run.id);
      this.publish(run.id);
    }
  }
  async cancel(id) {
    const snapshot = this.snapshot(id);
    const task = this.active.get(id);
    if (task && !task.committing && !terminal(snapshot.status)) task.controller.abort(new Error('cancelled'));
    if (task) await task.done;
    return this.snapshot(id);
  }
  async close() {
    for (const task of this.active.values()) if (!task.committing) task.controller.abort(new Error('shutdown'));
    await Promise.allSettled([...this.active.values()].map(t => t.done));
  }
}
