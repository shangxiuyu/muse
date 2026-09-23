// Explicit authoring command: invokes the configured Muse engine; never part of tests/startup.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { MuseAgent } from '../server/agent.mjs';
import { readConfig, rootDir } from '../server/config.mjs';
import { createSample } from '../web/lib/gallery.js';
import { galleryBriefs, newUiSamples, musePrompt } from './gallery-briefs.mjs';

try { process.loadEnvFile(join(rootDir, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const config = { ...readConfig(), dataDir: '/tmp/muse-gallery-authoring', timeoutMs: 900000, maxTokens: 48000, maxTurns: 80 };
if (!config.configured) throw new Error('Muse 创作引擎尚未配置。');
const output = join(rootDir, 'output/gallery-muse');
await mkdir(output, { recursive: true });
await mkdir(config.dataDir, { recursive: true });
const args = process.argv.slice(2);
const refineIndex = args.indexOf('--refine');
const revision = refineIndex >= 0 ? await readFile(args[refineIndex + 1], 'utf8') : '';
const ids = refineIndex >= 0 ? args.slice(0, refineIndex) : args;
const requested = ids.length ? galleryBriefs.filter(sample => ids.includes(sample.id)) : galleryBriefs;
if (!requested.length || ids.some(id => !galleryBriefs.some(sample => sample.id === id))) throw new Error('未知样板标识。');
const skill = await readFile(join(rootDir, 'SKILL.md'), 'utf8');
const failures = [];
let next = 0;
async function worker() {
  while (next < requested.length) {
    const sample = requested[next++];
    const directory = join(output, sample.id);
    await mkdir(directory, { recursive: true });
    let existing;
    try { existing = await readFile(join(directory, 'artifact.json'), 'utf8'); if (!revision) { console.log(`${sample.id}: 已有 Muse 成品，保留`); continue; } } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const seeded = !newUiSamples.some(item => item.id === sample.id);
    const base = existing ? { ...JSON.parse(existing), id: randomUUID() } : seeded ? { ...createSample(sample.id), id: randomUUID() } : null;
    const revisionReference = sample.type === 'image' ? 'references/visual_grammar.md' : 'references/toolkit/ui_floors.md';
    const prompt = revision ? `请作为 Muse 6.0 继续修改 selectedVersion。先 get_task_context，读取 ${revisionReference} 和 references/acceptance_protocol.md，按下述浏览器实测反馈做最小必要修改。保留原有完整内容、媒介和其他交互。必须 submit_artifact 提交完整成品，再 inspect_artifact 检查；不要只交补丁。\n\n${revision}` : musePrompt(sample, seeded);
    const toolEvents = [];
    const agent = new MuseAgent({ ...config, diagnostics: event => { toolEvents.push(event); appendFileSync(join(directory, 'tool-events.jsonl'), JSON.stringify(event) + '\n'); if (event.failed) console.log(`${sample.id}: ${event.tool} — ${event.error || '需修正'}`); } });
    await writeFile(join(directory, revision ? 'revision-brief.txt' : 'brief.txt'), prompt);
    console.log(`${sample.id}: Muse 开始设计${seeded ? '（重设计旧版）' : '（新 UI）'}`);
    let lastProgress;
    try {
      const result = await agent.run({ project: { id: randomUUID(), type: sample.type, title: sample.title, messages: [], versions: base ? [base] : [] }, input: { requestId: randomUUID(), prompt, style: '随内容判断', ...(base ? { baseVersionId: base.id } : {}) }, memories: [], signal: AbortSignal.timeout(config.timeoutMs), emit: event => { if (event.progress && event.progress !== lastProgress) { lastProgress = event.progress; console.log(`${sample.id}: ${event.progress}`); } } });
      if (!result.artifact) throw new Error('Muse 未提交作品，仅返回对话。');
      const calls = result.session.flatMap(entry => entry.message?.content || []).filter(item => item.type === 'toolCall');
      const required = ['get_task_context', 'read_muse_reference', 'submit_artifact', 'inspect_artifact'];
      for (const name of required) if (!toolEvents.some(event => event.tool === name && !event.failed)) throw new Error(`缺少成功的 Muse 流程步骤：${name}`);
      if (sample.type === 'ppt' && result.artifact.slides.length !== 6) throw new Error('演示未提供约定的6页。');
      const artifactJson = JSON.stringify(result.artifact, null, 2) + '\n';
      const provenance = { sampleId: sample.id, engine: 'Muse Studio / Pi', skillVersion: '6.0.0', skillSha256: createHash('sha256').update(skill).digest('hex'), model: result.artifact.model, generatedAt: new Date(result.artifact.created).toISOString(), artifactSha256: createHash('sha256').update(artifactJson).digest('hex'), toolSteps: toolEvents.map(({ tool, failed }) => ({ tool, success: !failed })), referencesRequested: [...new Set(calls.filter(call => call.name === 'read_muse_reference').map(call => call.arguments?.path).filter(Boolean))], verification: result.artifact.verification, message: result.message };
      if (revision && existing) {
        await writeFile(join(directory, 'reviewed-artifact.json'), artifactJson);
        await writeFile(join(directory, 'review.json'), JSON.stringify({ ...provenance, originalArtifactSha256: createHash('sha256').update(existing).digest('hex'), reviewer: 'Muse 6.0 / browser QA revision', changes: [revision.trim()] }, null, 2) + '\n');
      } else {
        await writeFile(join(directory, 'provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
        await writeFile(join(directory, 'artifact.json'), artifactJson);
      }
      console.log(`${sample.id}: Muse 成品已归档 / ${result.artifact.model} / ${artifactJson.length} 字符`);
    } catch (error) {
      failures.push(sample.id);
      await writeFile(join(directory, 'failure.txt'), String(error.message));
      console.log(`${sample.id}: 未完成 — ${error.message}`);
    }
  }
}
await Promise.all([worker(), worker()]);
console.log(JSON.stringify({ completed: requested.length - failures.length, failed: failures }));
process.exitCode = failures.length ? 1 : 0;
