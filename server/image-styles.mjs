import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getImageStyle } from '../web/lib/image-styles.js';
import { imageStyleInput } from './validation.mjs';

// Client IDs are whitelisted; never resolve a client-supplied path.
export async function readSelectedImageStyle(rootDir, id) {
  const style = getImageStyle(imageStyleInput(id));
  if (!style) return null;
  return {
    id: style.id, name: style.name, path: style.path,
    scope: '用户为本轮图片选择的画法。根据规范中的视觉特征、可调参数、提示词片段和验收观察创作；画廊示例只展示画法，不要求复用示例主题、文案或构图。用户当轮明确要求优先，创作方向用于补充可调参数。不保存为长期品味。',
    supportingReferences: ['references/image_styles.md', 'references/toolkit/image_visual_tool.md'],
    specification: await readFile(join(rootDir, style.path), 'utf8'),
  };
}
