import { open, realpath } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { parseDocument } from 'yaml';
import { AppError, memoryInput } from './validation.mjs';

export const MEMORY_FILES = ['personal_dna.yaml', 'personal_taboos.yaml'];
export const MAX_MEMORY_FILE_BYTES = 256 * 1024;
const MAX_RECORDS = 500;
const mediumTypes = { web: 'ui', ui: 'ui', slides: 'ppt', ppt: 'ppt', text: 'text', image: 'image', all: 'all' };
const clean = value => typeof value === 'string' ? value.trim() : '';
const sameMemory = memory => `${memory.type}\0${memory.text.trim().replace(/\s+/g, ' ')}`;

export function parseMemoryFiles(files) {
  if (!Array.isArray(files) || !files.length || files.length > 10) throw new AppError('请选择 1–10 个 YAML 或 JSON 品味文件。');
  const memories = [], notices = [];
  let skipped = 0, records = 0;
  for (const file of files) {
    if (!file || !clean(file.name) || file.name.length > 200 || !/\.(ya?ml|json)$/i.test(file.name)) throw new AppError('请选择 YAML 或 JSON 品味文件。');
    if (typeof file.text !== 'string' || Buffer.byteLength(file.text) > MAX_MEMORY_FILE_BYTES) throw new AppError('每个品味文件不能超过 256 KB。', 413);
    let document;
    try {
      if (/\.json$/i.test(file.name)) document = JSON.parse(file.text.replace(/^\uFEFF/, ''));
      else {
        const parsed = parseDocument(file.text, { schema: 'core', uniqueKeys: true });
        if (parsed.errors.length || parsed.warnings.length) throw new Error('Invalid YAML');
        document = parsed.toJS({ maxAliasCount: 0 });
      }
    } catch { throw new AppError(`「${file.name}」格式无法读取，请检查 YAML / JSON 内容。原文件未修改。`); }
    if (!document || typeof document !== 'object' || Array.isArray(document)) throw new AppError(`「${file.name}」需要包含 preferences、taboos 或 memories 列表。`);
    const groups = ['preferences', 'taboos', 'memories'].filter(key => Object.hasOwn(document, key));
    if (!groups.length) throw new AppError(`「${file.name}」没有可识别的偏好列表。请选择 personal_dna.yaml、personal_taboos.yaml 或 Muse 工作空间备份。`);
    for (const group of groups) {
      if (!Array.isArray(document[group])) throw new AppError(`「${file.name}」的 ${group} 必须是列表。`);
      records += document[group].length;
      if (records > MAX_RECORDS) throw new AppError('一次最多预览 500 条记录，请分批导入。');
      for (const entry of document[group]) {
        // Imported content is data. Candidates, reactions and public examples never become confirmed preferences.
        if (!entry || typeof entry !== 'object' || (group !== 'memories' && entry.status !== 'confirmed') || (group === 'memories' && entry.status != null && entry.status !== 'confirmed')) { skipped++; continue; }
        const principle = clean(group === 'memories' ? entry.text : entry.principle);
        const scope = clean(entry.scope);
        const exceptions = typeof entry.exceptions === 'string' ? clean(entry.exceptions) : Array.isArray(entry.exceptions) && entry.exceptions.every(e => typeof e === 'string') ? entry.exceptions.map(clean).filter(Boolean).join('；') : '';
        if (!principle || (group !== 'memories' && !scope) || (entry.exceptions != null && typeof entry.exceptions !== 'string' && !Array.isArray(entry.exceptions)) || (Array.isArray(entry.exceptions) && entry.exceptions.some(e => typeof e !== 'string'))) { skipped++; continue; }
        const text = [group === 'taboos' ? `个人边界：${principle}` : principle, scope && `适用场景：${scope}`, clean(entry.because) && `原因：${clean(entry.because)}`, exceptions && `例外：${exceptions}`].filter(Boolean).join('\n');
        const medium = entry.type || entry.medium || (Array.isArray(entry.media) && entry.media.length === 1 ? entry.media[0] : null);
        const type = mediumTypes[medium] || mediumTypes[scope.toLowerCase()] || 'all';
        if (text.length > 4000 || (group === 'memories' && !mediumTypes[entry.type])) { skipped++; continue; }
        memories.push({ type, text, file: file.name, kind: group === 'taboos' ? '个人边界' : '品味偏好' });
      }
    }
  }
  if (skipped) notices.push(`已跳过 ${skipped} 条未确认、信息不完整或超过 4,000 字的记录。`);
  const unique = [...new Map(memories.map(m => [sameMemory(m), m])).values()];
  if (unique.length < memories.length) notices.push(`已合并 ${memories.length - unique.length} 条重复偏好。`);
  return { memories: unique, notices };
}

export async function readLocalMemoryFiles(vaultDir) {
  let root;
  try { root = await realpath(vaultDir); }
  catch (error) {
    if (error.code === 'ENOENT') throw new AppError('还没有找到本机 Muse 品味库。可以选择文件导入，或核对显示的路径。', 404);
    throw new AppError('无法访问本机 Muse 品味库，请选择文件导入。');
  }
  const files = [];
  for (const name of MEMORY_FILES) {
    let handle;
    try {
      const path = await realpath(join(root, name));
      if (!path.startsWith(root + sep)) throw new AppError('品味文件指向目录之外，请直接选择该文件导入。');
      handle = await open(path, 'r');
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > MAX_MEMORY_FILE_BYTES) throw new AppError(`「${name}」必须是 256 KB 以内的普通文件。`);
      const buffer = Buffer.alloc(MAX_MEMORY_FILE_BYTES + 1);
      let size = 0;
      while (size < buffer.length) {
        const { bytesRead } = await handle.read(buffer, size, buffer.length - size, null);
        if (!bytesRead) break;
        size += bytesRead;
      }
      if (size > MAX_MEMORY_FILE_BYTES) throw new AppError(`「${name}」超过 256 KB。`, 413);
      files.push({ name, text: buffer.subarray(0, size).toString('utf8') });
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      if (error instanceof AppError) throw error;
      throw new AppError(`无法读取「${name}」，请选择文件导入。`);
    } finally { await handle?.close(); }
  }
  if (!files.length) throw new AppError('此目录中没有 personal_dna.yaml 或 personal_taboos.yaml。可以选择其他位置的文件导入。', 404);
  return files;
}

export function importMemories(data, input) {
  if (!Array.isArray(input?.memories) || !input.memories.length || input.memories.length > MAX_RECORDS) throw new AppError('请选择要导入的偏好。');
  if (data.runs.some(run => run.status === 'running')) throw new AppError('请等待当前创作完成后再修改品味。', 409);
  const known = new Set(data.memories.map(sameMemory));
  const additions = [];
  for (const item of input.memories) {
    const memory = memoryInput(item);
    const key = sameMemory(memory);
    if (known.has(key)) continue;
    known.add(key); additions.push(memory);
  }
  if (data.memories.length + additions.length > 50) throw new AppError(`空间还可保存 ${Math.max(0, 50 - data.memories.length)} 条偏好，请减少勾选或整理已有品味。`);
  data.memories.unshift(...additions);
  if (additions.length) for (const project of data.projects) delete project._session;
  return { imported: additions.length, duplicates: input.memories.length - additions.length, memories: data.memories };
}
