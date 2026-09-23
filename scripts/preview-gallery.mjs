import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rootDir } from '../server/config.mjs';
import { uiHtml, deckHtml, deckStyle, slideHtml, safePreview } from '../web/lib/artifacts.js';
import { renderMarkdown } from '../web/lib/markdown.js';

const directory = join(rootDir, 'output/gallery-muse');
const requested = process.argv.slice(2);
for (const id of requested.length ? requested : await readdir(directory)) {
  const folder = join(directory, id);
  let artifact;
  try {
    let raw;
    try { raw = await readFile(join(folder, 'reviewed-artifact.json'), 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; raw = await readFile(join(folder, 'artifact.json'), 'utf8'); }
    artifact = JSON.parse(raw);
  } catch (error) { if (['ENOENT', 'ENOTDIR'].includes(error.code)) continue; throw error; }
  let html;
  if (artifact.type === 'ui') html = uiHtml(artifact);
  if (artifact.type === 'ppt') {
    html = deckHtml(artifact);
    for (const [i, slide] of artifact.slides.entries()) await writeFile(join(folder, `slide-${i + 1}.html`), safePreview(`<style>${deckStyle}</style>${slideHtml(slide, i, artifact.slides.length)}`));
  }
  if (artifact.type === 'image') html = `<style>html,body{margin:0;width:100%;height:100%;background:#ece8dd}svg{display:block;width:100%;height:100%;object-fit:contain}</style>${artifact.svg}`;
  if (artifact.type === 'text') html = `<meta charset="utf-8"><style>body{margin:0;background:#faf7ef;color:#3f4437;font:16px/1.9 "Avenir Next","PingFang SC",sans-serif}article{max-width:720px;margin:60px auto;padding:0 28px}h1,h2{font-family:"Songti SC",serif;line-height:1.5}h1{font-size:40px}h2{font-size:26px;margin-top:48px}blockquote{margin:24px 0;color:#6d6b60}hr{border:0;border-top:1px solid #d7d0c1;margin:40px 0}</style><article>${renderMarkdown(artifact.text)}</article>`;
  await writeFile(join(folder, 'index.html'), artifact.type === 'ppt' ? html : safePreview(html));
  console.log(`${id}: ${folder}/index.html`);
}
