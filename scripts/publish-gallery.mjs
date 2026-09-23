// Package only completed, traceable Muse runs into the built-in gallery.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { rootDir } from '../server/config.mjs';
import { validateArtifact } from '../server/validation.mjs';
import { galleryBriefs } from './gallery-briefs.mjs';

const output = join(rootDir, 'output/gallery-muse');
const catalog = {};
for (const sample of galleryBriefs) {
  const folder = join(output, sample.id);
  const originalRaw = await readFile(join(folder, 'artifact.json'), 'utf8');
  const provenance = JSON.parse(await readFile(join(folder, 'provenance.json'), 'utf8'));
  const originalArtifactSha256 = createHash('sha256').update(originalRaw).digest('hex');
  if (provenance.engine !== 'Muse Studio / Pi' || provenance.skillVersion !== '6.0.0' || provenance.artifactSha256 !== originalArtifactSha256) throw new Error(`${sample.id}: Muse 来源或成品校验失败`);
  for (const tool of ['get_task_context', 'read_muse_reference', 'submit_artifact', 'inspect_artifact']) if (!provenance.toolSteps.some(step => step.tool === tool && step.success)) throw new Error(`${sample.id}: 缺少 ${tool}`);
  let raw = originalRaw, review;
  try { review = JSON.parse(await readFile(join(folder, 'review.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (review) {
    raw = await readFile(join(folder, 'reviewed-artifact.json'), 'utf8');
    if (review.originalArtifactSha256 !== originalArtifactSha256 || review.artifactSha256 !== createHash('sha256').update(raw).digest('hex') || !Array.isArray(review.changes) || !review.changes.length) throw new Error(`${sample.id}: 验收修订记录与成品不一致`);
  }
  const artifact = JSON.parse(raw);
  validateArtifact(artifact, sample.type);
  if (artifact.type !== sample.type) throw new Error(`${sample.id}: 媒介不匹配`);
  const source = [artifact.html, artifact.css, artifact.js, artifact.svg, ...artifact.slides?.map(slide => slide.html) || []].filter(Boolean).join('\n');
  if (/(?:src|href)\s*=\s*["']https?:|@import|url\(\s*["']?https?:/i.test(source)) throw new Error(`${sample.id}: 含外部资源依赖`);
  catalog[sample.id] = { artifact, provenance: { engine: provenance.engine, skillVersion: provenance.skillVersion, model: provenance.model, generatedAt: provenance.generatedAt, artifactSha256: createHash('sha256').update(raw).digest('hex'), originalArtifactSha256, referencesRequested: provenance.referencesRequested, toolSteps: provenance.toolSteps, ...(review ? { review } : {}) } };
  const contractName = { ui: 'DESIGN', ppt: 'PPT', text: 'WRITING', image: 'IMAGE' }[sample.type];
  await writeFile(join(folder, `${contractName}.md`), `# ${sample.title}\n\n由项目 Muse 6.0 创作引擎实际生成，模型标识：${provenance.model}。\n\n## 作品契约与设计判断\n\n${artifact.direction}\n\n## 需求与证据\n\n- 原始需求：brief.txt\n- Muse 原始成品：artifact.json\n- 引擎、规范、工具调用与成品校验：provenance.json\n- 生成时间：${provenance.generatedAt}\n\nMuse 运行自检：格式 ${artifact.verification?.format ? '完成' : '未验证'}；渲染 ${artifact.verification?.rendered ? '完成' : '未验证'}；交互 ${artifact.verification?.interaction ? '完成' : '未验证'}。最终浏览器复核另见总目录验收记录。\n`);
}
const target = join(rootDir, 'web/lib/samples/muse-generated.js');
await mkdir(join(rootDir, 'web/lib/samples'), { recursive: true });
await writeFile(target, `// Generated from verified Muse Studio runs by scripts/publish-gallery.mjs.\n// Original artifacts and provenance: output/gallery-muse/<id>/. Do not hand-edit.\nexport const museSamples = ${JSON.stringify(catalog, null, 2)};\n`);
console.log(`已打包 ${Object.keys(catalog).length} 套 Muse 原创成品。`);
