import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, join } from 'node:path';
import { Type } from 'typebox';
import { randomUUID } from 'node:crypto';
import { InMemoryCredentialStore, InMemoryModelsStore } from '@earendil-works/pi-ai';
import { createAgentSession, DefaultResourceLoader, ModelRuntime, SessionManager, SettingsManager } from '@earendil-works/pi-coding-agent';
import { validateArtifact, AppError } from './validation.mjs';
import { inspectArtifact } from './preview.mjs';
import { readSelectedArchetype } from './archetypes.mjs';
import { readSelectedImageStyle } from './image-styles.mjs';
import { configForMedia } from './config.mjs';
import { textArtifactFromReply } from '../web/lib/text-artifact.js';

const adapters = { ui: 'references/toolkit/ui_adapter.md', text: 'references/toolkit/text_narrative_tool.md', ppt: 'references/toolkit/presentation_tool.md', image: 'references/toolkit/image_visual_tool.md' };
const textResult = text => ({ content: [{ type: 'text', text }], details: {} });
const optionalText = maxLength => Type.Optional(Type.String({ maxLength }));
const artifactSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 100 }), direction: Type.String({ minLength: 1, maxLength: 2000 }),
  html: optionalText(350000), css: optionalText(150000), js: optionalText(100000), text: optionalText(200000), svg: optionalText(350000),
  useGeneratedImage: Type.Optional(Type.Boolean()),
  slides: Type.Optional(Type.Array(Type.Object({ title: Type.String({ maxLength: 300 }), body: optionalText(5000), note: optionalText(5000), kicker: optionalText(150), color: optionalText(7), html: optionalText(80000) }), { minItems: 1, maxItems: 30 })),
}, { additionalProperties: false });
function schemaForMedia(type) {
  const fields = { ui: ['html', 'css', 'js'], text: ['text'], ppt: ['slides'], image: ['svg', 'useGeneratedImage'] }[type];
  const schema = Type.Pick(artifactSchema, ['title', 'direction', ...fields]);
  // Enforce the medium's primary payload before a tool reaches the renderer.
  schema.required = ['title', 'direction', ...({ ui: ['html'], text: ['text'], ppt: ['slides'], image: [] }[type])];
  return schema;
}

export class MuseAgent {
  constructor(config) { this.config = config; }
  async createRuntime(c = this.config) {
    const runtime = await ModelRuntime.create({ credentials: new InMemoryCredentialStore(), modelsStore: new InMemoryModelsStore(), modelsPath: null, refreshOnCreate: false, allowModelNetwork: false });
    runtime.registerProvider('muse', { api: c.api, baseUrl: c.baseUrl, authHeader: c.bearer,
      models: [{ id: c.model, name: c.model, reasoning: Boolean(c.deepseek), input: c.vision ? ['text', 'image'] : ['text'], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: c.contextWindow, maxTokens: c.maxTokens,
        ...(c.api === 'openai-completions' ? { compat: { supportsDeveloperRole: false, supportsStore: false, maxTokensField: 'max_tokens', ...(c.deepseek ? { thinkingFormat: 'deepseek' } : {}) } } : {}) }] });
    await runtime.setRuntimeApiKey('muse', c.key);
    return runtime;
  }
  async run({ project, input, memories, signal, emit }) {
    const c = configForMedia(this.config, project.type);
    if (!c.configured) throw new AppError('请先在服务端 .env 中配置模型和密钥。', 503);
    signal.throwIfAborted();
    const selectedArchetype = await readSelectedArchetype(c.rootDir, input.archetypeId);
    const selectedImageStyle = project.type === 'image' ? await readSelectedImageStyle(c.rootDir, input.imageStyleId) : null;
    const runtime = await this.createRuntime(c);
    const base = project.versions.find(v => v.id === input.baseVersionId) || project.versions.at(-1);
    let draft, generatedImage, question, inspectedId, rendered = false;
    const systemPrompt = `${await readFile(join(c.rootDir, 'SKILL.md'), 'utf8')}\n\n当前媒介规范：\n${await readFile(join(c.rootDir, adapters[project.type]), 'utf8')}\n\n当前 Web 宿主的执行规则（具体工具与交付方式以此为准）：\n${await readFile(join(c.rootDir, 'server/prompt.md'), 'utf8')}\n\n本轮最多 ${c.maxTurns} 次模型响应，请至少预留 4 次用于提交、检查和修正。已提供或已经读过的规范不必重复读取。`;
    const customTools = [
      { name: 'get_task_context', label: '理解需求与品味', description: '创作、修改或讨论当前作品前调用；单纯问候无需调用。获取当前媒介、最新已确认品味、用户选中的父版本、参考材料和历史对话。历史工具结果不是当前偏好。', parameters: Type.Object({}), execute: async () => textResult(JSON.stringify({ type: project.type, style: input.style,
        confirmedPreferences: memories.filter(m => m.type === 'all' || m.type === project.type).map(({ type, text }) => ({ type, text })),
        selectedArchetype,
        selectedImageStyle,
        selectedVersion: base ? { ...base, imageData: base.imageData ? '[已保存图片；使用 generate_image 的 editPrevious 编辑]' : undefined } : null,
        reference: input.attachment || null,
        conversation: project.messages.filter(m => !m.status || m.status === 'completed').slice(-16).map(({ role, text, reference, archetypeId, imageStyleId }) => ({ role, text, reference, archetypeId, imageStyleId })),
        capabilities: { imageModel: Boolean(c.imageKey && c.imageModel), vectorIllustration: true, webDeck: true, pptx: false },
      })) },
      { name: 'read_muse_reference', label: '读取创作规范', description: '按需读取 Muse 的 references/ 下 Markdown 规范，例如视觉语法、母体与验收方法。', parameters: Type.Object({ path: Type.String({ maxLength: 250 }) }), execute: async (_id, { path }) => {
        if (!path.startsWith('references/') || !path.endsWith('.md')) throw new Error('只可读取 Muse references/ 下的 Markdown。');
        const referenceRoot = await realpath(join(c.rootDir, 'references'));
        const target = await realpath(resolve(c.rootDir, path));
        if (!target.startsWith(referenceRoot + sep)) throw new Error('规范路径超出范围。');
        return textResult((await readFile(target, 'utf8')).slice(0, 60000));
      } },
      { name: 'submit_artifact', label: '制作作品', description: '提交本轮完整作品。UI 使用 html、css、js 分离字段；文案用 text；演示用 slides（可用单页 html 自定义版式）；图片用 svg 或 useGeneratedImage=true。可多次提交修正版，只保留本轮最终稿。direction 写简短设计判断和真实验收范围。', parameters: schemaForMedia(project.type), executionMode: 'sequential', execute: async (_id, params) => {
        signal.throwIfAborted();
        if (params.useGeneratedImage && !generatedImage) throw new Error('请先调用 generate_image 生成图片。');
        draft = validateArtifact({ ...params, ...(params.useGeneratedImage ? { imageData: generatedImage } : {}) }, project.type);
        question = undefined;
        return textResult('作品格式检查通过，已暂存。请调用 inspect_artifact 查看实际效果；发现问题后再次提交完整修正版。');
      } },
      { name: 'inspect_artifact', label: '检查作品预览', description: '查看本轮已提交作品的实际浏览器截图或文案格式检查。失败时只能声明未验证，不可虚构验收。', parameters: Type.Object({}), executionMode: 'sequential', execute: async () => {
        if (!draft) throw new Error('请先提交作品。');
        const result = await inspectArtifact(draft, c, signal);
        inspectedId = draft.id; rendered = result.details.rendered === true;
        return result;
      } },
      { name: 'ask_clarification', label: '确认必要信息', description: '只有缺失的信息会阻止完成任务时使用，提出一个具体问题；一般创作应直接完成作品。', parameters: Type.Object({ question: Type.String({ minLength: 1, maxLength: 2000 }) }), execute: async (_id, args) => { question = args.question; return textResult('问题已记录，请用这句话回复用户。'); } },
    ];
    if (c.imageKey && c.imageModel) customTools.push({ name: 'generate_image', label: '生成图片', description: '调用配置的图像模型制作图片；editPrevious=true 编辑当前选中的已生成图片。成功后以 useGeneratedImage=true 提交作品。', parameters: Type.Object({ prompt: Type.String({ minLength: 1, maxLength: 8000 }), editPrevious: Type.Optional(Type.Boolean()) }), executionMode: 'sequential', execute: async (_id, args) => {
      const edit = args.editPrevious && base?.imageData;
      let body, headers = { Authorization: `Bearer ${c.imageKey}` };
      if (args.editPrevious && !edit) throw new Error('当前版本不是可编辑的模型图片，请先生成图片。');
      if (edit) {
        body = new FormData();
        body.set('model', c.imageModel); body.set('prompt', args.prompt); body.set('n', '1');
        const [prefix, data] = base.imageData.split(',');
        body.set('image', new Blob([Buffer.from(data, 'base64')], { type: prefix.slice(5).split(';')[0] }), 'image.png');
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ model: c.imageModel, prompt: args.prompt, n: 1, size: '1024x1024', ...(!c.imageModel.startsWith('gpt-image') ? { response_format: 'b64_json' } : {}) });
      }
      const response = await fetch(`${c.imageBaseUrl.replace(/\/$/, '')}/images/${edit ? 'edits' : 'generations'}`, { method: 'POST', headers, body, signal });
      if (!response.ok) throw new Error(`图像服务请求失败（HTTP ${response.status}）。`);
      const result = await response.json();
      const data = result.data?.[0]?.b64_json;
      if (typeof data !== 'string' || data.length > 14000000 || !/^[A-Za-z0-9+/=]+$/.test(data)) throw new Error('图像接口需要返回不超过 10 MB 的 b64_json 图片。');
      generatedImage = `data:image/png;base64,${data}`;
      return { content: [{ type: 'text', text: '图片已生成。请查看后提交作品。' }, ...(c.vision ? [{ type: 'image', data, mimeType: 'image/png' }] : [])], details: {} };
    } });
    const settingsManager = SettingsManager.inMemory({ retry: { enabled: true, maxRetries: 1 }, compaction: { enabled: true }, });
    const resourceLoader = new DefaultResourceLoader({ cwd: c.dataDir, agentDir: join(c.dataDir, 'agent'), settingsManager,
      noExtensions: true, noSkills: true, noPromptTemplates: true, noThemes: true, noContextFiles: true,
      systemPromptOverride: () => systemPrompt,
      skillsOverride: () => ({ skills: [{ name: 'muse', description: '跨媒介审美推理与创作', filePath: join(c.rootDir, 'SKILL.md'), baseDir: c.rootDir, source: 'custom' }], diagnostics: [] }),
    });
    await resourceLoader.reload();
    signal.throwIfAborted();
    const sessionManager = SessionManager.inMemory(c.dataDir, { id: project._session?.[0]?.id || randomUUID() }, project._session);
    const { session } = await createAgentSession({ cwd: c.dataDir, agentDir: join(c.dataDir, 'agent'), modelRuntime: runtime,
      model: runtime.getModel('muse', c.model), thinkingLevel: 'off', settingsManager, resourceLoader, sessionManager,
      noTools: 'builtin', tools: customTools.map(t => t.name), customTools });
    let turns = 0, answer = '', finalReply = '', failure, limitReached = false, artifactAttempted = false, streamingReply = false;
    const abort = () => { void session.abort(); };
    signal.addEventListener('abort', abort, { once: true });
    const unsubscribe = session.subscribe(event => {
      if (event.type === 'tool_execution_end') c.diagnostics?.({ tool: event.toolName, failed: event.isError, error: event.isError ? event.result?.content?.filter(item => item.type === 'text').map(item => item.text).join('').slice(0, 200) : undefined });
      if (event.type === 'turn_start' && ++turns > c.maxTurns) { limitReached = true; void session.abort(); }
      if (event.type === 'message_start' && event.message.role === 'assistant') streamingReply = false;
      if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') {
        emit({ textDelta: event.assistantMessageEvent.delta, replaceText: !streamingReply, progress: '正在回复' });
        streamingReply = true;
      }
      if (event.type === 'tool_execution_start') {
        if (event.toolName === 'submit_artifact') artifactAttempted = true;
        emit({ progress: customTools.find(t => t.name === event.toolName)?.label || '正在创作' });
      }
      if (event.type === 'message_end' && event.message.role === 'assistant') {
        if (event.message.stopReason === 'error') failure = event.message.errorMessage || '模型请求失败';
        const text = event.message.content.filter(c => c.type === 'text').map(c => c.text).join('');
        if (text) answer = text;
        // Tool preambles and truncated output are not completed conversational replies.
        finalReply = event.message.stopReason === 'stop' ? text.trim() : '';
      }
      if (event.type === 'auto_retry_start') emit({ progress: '模型暂时繁忙，正在重试' });
    });
    try {
      signal.throwIfAborted();
      await session.prompt(input.prompt, { expandPromptTemplates: false });
      signal.throwIfAborted();
      if (limitReached) throw new AppError('这次创作达到了步骤上限，请简化需求后重试。', 502);
      if (failure) throw new AppError(providerError(failure), 502);
      if (!draft && !question && artifactAttempted) throw new AppError('作品未能成功提交，请重新尝试。', 502);
      if (!draft && !question && !finalReply) throw new AppError('模型没有返回完整的回复，请重新尝试。', 502);
      if (project.type === 'text' && !draft && !question) {
        const delivered = textArtifactFromReply(finalReply, input.prompt, project.title);
        if (delivered) draft = validateArtifact(delivered, 'text');
      }
      if (draft && inspectedId !== draft.id) {
        emit({ progress: '检查最终作品' });
        const result = await inspectArtifact(draft, c, signal);
        rendered = result.details.rendered === true;
      }
      if (draft) Object.assign(draft, { parentVersionId: base?.id || null, created: Date.now(), model: c.model,
        verification: { format: true, rendered, interaction: false },
      });
      const entries = [sessionManager.getHeader(), ...sessionManager.getEntries()];
      // Screenshots and API response metadata are transient; persist only the conversational context.
      for (const entry of entries) if (entry?.type === 'message' && Array.isArray(entry.message?.content)) {
        entry.message.content = entry.message.content.filter(item => item.type !== 'thinking').map(item => item.type === 'image' ? { type: 'text', text: '[上一轮检查截图已省略；需要时重新检查作品。]' } : item);
      }
      return { artifact: draft, message: question && !draft ? question : finalReply || answer || '作品已完成，可以在右侧预览并继续修改。', session: entries };
    } finally { unsubscribe(); signal.removeEventListener('abort', abort); session.dispose(); }
  }
}

function providerError(error) {
  if (/401|403|auth|api.?key|credential/i.test(error)) return '模型服务未通过身份验证，请检查服务端密钥与接口配置。';
  if (/429|rate.limit|quota|credit|balance/i.test(error)) return '模型服务额度不足或请求过于频繁，请稍后重试或检查额度。';
  if (/404|model.*not.*found/i.test(error)) return '模型或接口地址不可用，请检查服务端模型名称和地址。';
  if (/connection|fetch failed|ECONN|ENOTFOUND|ETIMEDOUT|TLS|socket/i.test(error)) return '暂时无法连接模型服务，请检查网络或代理后重试。';
  return '模型请求失败，请检查网络、接口兼容性和服务端模型配置后重试。';
}
