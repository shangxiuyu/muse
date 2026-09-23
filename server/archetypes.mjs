import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getArchetype } from '../web/lib/archetypes.js';
import { archetypeInput } from './validation.mjs';

// Resolve only an approved built-in ID; never accept a client-supplied file path.
export async function readSelectedArchetype(rootDir, id) {
  const reference = getArchetype(archetypeInput(id));
  if (!reference) return null;
  const source = await readFile(join(rootDir, reference.path), 'utf8');
  if (reference.media === 'text') {
    return {
      id: reference.id, name: reference.name, path: reference.path, media: 'text',
      scope: '用户为本轮文案选择的表达参考，提供语气、信息推进、句式节奏和写作边界。用户本轮的受众、事实、篇幅与明确要求优先，结构随内容调整。原创例句仅用于说明文风，不复制其中的人物、经历、产品功能或结论作为用户事实；不保存为长期品味。',
      supportingReferences: ['references/toolkit/text_narrative_tool.md', 'references/toolkit/text_quality_protocol.md'],
      specification: source,
    };
  }
  if (reference.media === 'ppt') {
    const sections = source.split(/^## /m);
    const specification = sections.find(section => section.startsWith(reference.section + '\n'));
    const cjk = sections.find(section => section.startsWith('🈶 演示端中文配对 (CJK Pairing)\n'));
    if (!specification || !cjk) throw new Error('演示参考规范缺少所选流派或中文排版规则。');
    return {
      id: reference.id, name: reference.name, path: reference.path, section: reference.section, media: 'ppt',
      scope: '用户为本轮演示选择的参考，提供色彩、材质、字体、页型意图与中文排版规则。用户本轮明确要求优先；信息结构、页数和跨页节奏按内容推导，不直接套用示例页型，不复制规范中的示例指标。创作方向用于补充，不替换所选参考；不保存为长期品味。',
      supportingReferences: ['references/toolkit/presentation_tool.md', 'references/toolkit/presentation/visual_direction.md', 'references/visual_grammar.md', 'references/foundations.md'],
      specification: `## ${specification.trim()}\n\n## ${cjk.trim()}`,
    };
  }
  return {
    id: reference.id, name: reference.name, path: reference.path,
    scope: '用户为本次创作选择的视觉母体，仅提供色彩、材质、字体等表层参考。请结合视觉语法与跨媒介基础组织内容，不直接套用规范中的示例版式；不保存为长期品味。',
    supportingReferences: ['references/visual_grammar.md', 'references/foundations.md'],
    specification: source,
  };
}
