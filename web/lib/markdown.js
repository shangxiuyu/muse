import { escapeHtml as esc } from './data.js';

// A deliberately small Markdown subset. Raw HTML is always text, including while
// a streamed tag or code fence is incomplete; no generated HTML is executed.
function inline(source, depth = 0) {
  if (depth > 4) return esc(source);
  const pattern = /`([^`\n]+)`|\*\*([^\n]+?)\*\*|__([^\n]+?)__|\*([^*\n]+)\*|\[([^\]\n]+)\]\(([^\s)]+)\)/g;
  let html = '', position = 0;
  for (const match of source.matchAll(pattern)) {
    html += esc(source.slice(position, match.index));
    if (match[1] !== undefined) html += `<code>${esc(match[1])}</code>`;
    else if (match[2] !== undefined || match[3] !== undefined) html += `<strong>${inline(match[2] ?? match[3], depth + 1)}</strong>`;
    else if (match[4] !== undefined) html += `<em>${inline(match[4], depth + 1)}</em>`;
    else if (/^https?:\/\//i.test(match[6])) html += `<a href="${esc(match[6])}" target="_blank" rel="noopener noreferrer">${esc(match[5])}</a>`;
    else html += esc(match[0]);
    position = match.index + match[0].length;
  }
  return html + esc(source.slice(position));
}

function tableCells(line) {
  const source = line.trim();
  const cells = [];
  let cell = '', slashes = 0, hasDivider = false;
  for (const char of source) {
    if (char === '|' && slashes % 2 === 0) {
      cells.push(cell.trim()); cell = ''; hasDivider = true;
    } else if (char === '|') {
      cell = cell.slice(0, -1) + '|';
    } else cell += char;
    slashes = char === '\\' ? slashes + 1 : 0;
  }
  if (!hasDivider) return null;
  cells.push(cell.trim());
  if (source.startsWith('|')) cells.shift();
  if (source.endsWith('|') && cells.at(-1) === '') cells.pop();
  return cells;
}

function tableHtml(headers, delimiters, rows) {
  const alignment = delimiters.map(cell => cell.endsWith(':') ? (cell.startsWith(':') ? 'center' : 'right') : 'left');
  const rowHtml = (cells, tag) => `<tr>${headers.map((_, index) => `<${tag}${tag === 'th' ? ' scope="col"' : ''} class="table-align-${alignment[index]}">${inline(cells[index] ?? '')}</${tag}>`).join('')}</tr>`;
  return `<div class="markdown-table" tabindex="0" role="region" aria-label="表格"><table><thead>${rowHtml(headers, 'th')}</thead><tbody>${rows.map(cells => rowHtml(cells, 'td')).join('')}</tbody></table></div>`;
}

export function renderMarkdown(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [], list = [], listTag, listStart = 1, quote = [], fence, code = [];
  const flushParagraph = () => { if (paragraph.length) blocks.push(`<p>${paragraph.map(line => inline(line)).join('<br>')}</p>`); paragraph = []; };
  const flushList = () => { if (list.length) blocks.push(`<${listTag}${listTag === 'ol' ? ` start="${listStart}"` : ''}>${list.map(line => `<li>${inline(line)}</li>`).join('')}</${listTag}>`); list = []; };
  const flushQuote = () => { if (quote.length) blocks.push(`<blockquote>${quote.map(line => inline(line)).join('<br>')}</blockquote>`); quote = []; };
  const flush = () => { flushParagraph(); flushList(); flushQuote(); };
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (fence) {
      if (new RegExp(`^\\s{0,3}${fence[0]}{${fence.length},}\\s*$`).test(line)) {
        blocks.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); fence = undefined; code = [];
      } else code.push(line);
      continue;
    }
    const opening = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (opening) { flush(); fence = opening[1]; continue; }
    if (!line.trim()) { flush(); continue; }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
    if (heading) { flush(); const level = heading[1].length; blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
    if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flush(); blocks.push('<hr>'); continue; }
    const item = line.match(/^\s*(?:([-+*])|([0-9]{1,6})[.)])\s+(.+)$/);
    if (item) {
      flushParagraph(); flushQuote();
      const tag = item[1] ? 'ul' : 'ol';
      if (listTag !== tag) flushList();
      if (!list.length) listStart = Number(item[2] || 1);
      listTag = tag; list.push(item[3]); continue;
    }
    const quoted = line.match(/^\s{0,3}>\s?(.*)$/);
    if (quoted) { flushParagraph(); flushList(); quote.push(quoted[1]); continue; }
    const delimiters = tableCells(lines[index + 1] ?? '');
    if (delimiters?.length && delimiters.every(cell => /^:?-{3,}:?$/.test(cell))) {
      const headers = tableCells(line);
      if (headers?.length === delimiters.length) {
        flush();
        index++;
        const rows = [];
        while (index + 1 < lines.length) {
          const next = lines[index + 1];
          // A new Markdown block ends the table, even if it contains a pipe.
          if (/^\s{0,3}(?:#{1,6}\s|>|`{3,}|~{3,}|[-+*]\s|\d{1,6}[.)]\s)/.test(next)) break;
          const cells = tableCells(next);
          if (!cells) break;
          rows.push(cells); index++;
        }
        blocks.push(tableHtml(headers, delimiters, rows));
        continue;
      }
    }
    flushList(); flushQuote(); paragraph.push(line);
  }
  flush();
  if (fence) blocks.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
  return blocks.join('');
}
