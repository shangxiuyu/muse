import { api } from './api.js';
import { icon } from './icons.js';
import { media, escapeHtml as esc } from './data.js';
import { copyText } from './clipboard.js';

let ui, location, locationRequest;
const defaultPath = '~/Documents/Muse';
const pathLabel = () => location?.path || defaultPath;
export function setupMemoryImport(options) { ui = options; }

export async function loadMemoryLocation() {
  if (!ui.isConnected()) return;
  if (!location && !locationRequest) locationRequest = api('/memories/location').then(value => { location = value; }).catch(() => {}).finally(() => { locationRequest = null; });
  if (locationRequest) await locationRequest;
  document.querySelectorAll('[data-copy-vault] code').forEach(el => { el.textContent = pathLabel(); });
}

document.addEventListener('click', async event => {
  if (!event.target.closest('[data-copy-vault]')) return;
  try { await copyText(pathLabel()); ui.toast('品味路径已复制。'); }
  catch { ui.toast('无法自动复制，请选中显示的路径复制。'); }
});

export function openMemoryImport() {
  if (!ui.isConnected()) { ui.toast('请先连接工作空间，再导入品味。'); return; }
  ui.showDialog('带上你的 Muse 品味', `<div class="memory-import-dialog-content">
    <p>从 Muse 的个人品味文件中读取已确认偏好。核对内容与适用作品后，勾选保存到当前工作空间。</p>
    <div class="memory-import-source"><button type="button" class="secondary-button" data-read-local-memory>${icon('folder')}从本机 Muse 读取</button><button class="memory-vault-path" data-copy-vault title="复制 Muse 个人品味路径"><code>${esc(pathLabel())}</code>${icon('copy')}</button><small>personal_dna.yaml · personal_taboos.yaml</small></div>
    <div class="memory-file-drop" tabindex="0" role="button" aria-label="选择或拖入品味文件">${icon('upload')}<span>选择文件，或拖到这里<small>支持 YAML / JSON，单个文件不超过 256 KB</small></span></div>
    <input type="file" class="memory-file-input" accept=".yaml,.yml,.json" multiple hidden>
    <p class="memory-import-status" role="status" aria-live="polite"></p>
    <div class="memory-import-preview"></div>
    <p class="form-note">只导入选中的偏好，自动跳过重复内容。原文件保持不变，导入后也可以随时删除。</p>
  </div>`, '<button class="secondary-button" data-action="close-dialog">取消</button><button class="primary-button" data-save-import disabled>保存选中偏好</button>', 'memory-import-dialog');
  const container = ui.dialog.querySelector('.memory-import-dialog-content');
  const fileInput = container.querySelector('input');
  const localButton = container.querySelector('[data-read-local-memory]');
  const drop = container.querySelector('.memory-file-drop');
  const status = container.querySelector('.memory-import-status');
  const preview = container.querySelector('.memory-import-preview');
  const save = ui.dialog.querySelector('[data-save-import]');
  let memories = [], pending = false, revision = 0;
  const active = () => ui.dialog.open && ui.dialog.contains(container) && !ui.dialog.classList.contains('is-closing');
  const selected = () => [...preview.querySelectorAll('input:checked')];
  function updateSelection() {
    const count = selected().length;
    save.disabled = pending || !count;
    save.textContent = pending ? '正在保存…' : `保存选中偏好${count ? `（${count}）` : ''}`;
  }
  async function readSelection(files) {
    const id = ++revision;
    preview.innerHTML = ''; memories = []; updateSelection();
    status.classList.remove('is-error');
    status.textContent = files ? '正在读取文件…' : '正在读取本机 Muse 品味…';
    try {
      let body = { source: 'local' };
      if (files) {
        if (!files.length) { status.textContent = '请选择品味文件。'; return; }
        if (files.length > 10) throw new Error('一次最多选择 10 个文件。');
        if (files.some(file => !/\.(ya?ml|json)$/i.test(file.name))) throw new Error('请选择 YAML 或 JSON 文件。');
        if (files.some(file => file.size > 256 * 1024)) throw new Error('每个品味文件不能超过 256 KB。');
        body = { source: 'files', files: await Promise.all(files.map(async file => ({ name: file.name, text: await file.text() }))) };
      }
      if (!active() || id !== revision) return;
      const result = await api('/memories/preview', { method: 'POST', body });
      if (!active() || id !== revision) return;
      memories = result.memories;
      status.textContent = [memories.length ? `找到 ${memories.length} 条已确认偏好，请核对适用作品。` : '没有找到可导入的已确认偏好。', ...result.notices].join(' ');
      preview.innerHTML = memories.map((memory, index) => `<article class="memory-import-entry">
        <label class="memory-import-check"><input type="checkbox" value="${index}" checked><span>${esc(memory.file)}<small>${esc(memory.kind)}</small></span></label>
        <p>${esc(memory.text)}</p>
        <label class="memory-import-scope">用于<select aria-label="第 ${index + 1} 条偏好的适用作品"><option value="all">所有创作</option>${Object.entries(media).map(([key, value]) => `<option value="${key}" ${memory.type === key ? 'selected' : ''}>${value.label}</option>`).join('')}</select></label>
      </article>`).join('');
      updateSelection();
    } catch (error) {
      if (!active() || id !== revision) return;
      status.classList.add('is-error'); status.textContent = error.message;
    }
  }
  localButton.addEventListener('click', () => { if (!pending) void readSelection(); });
  fileInput.addEventListener('change', () => { const files = [...fileInput.files]; fileInput.value = ''; if (files.length) void readSelection(files); });
  drop.addEventListener('click', () => { if (!pending) fileInput.click(); });
  drop.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); if (!pending) fileInput.click(); } });
  drop.addEventListener('dragover', event => { event.preventDefault(); if (!pending) drop.classList.add('is-dragging'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-dragging'));
  drop.addEventListener('drop', event => { event.preventDefault(); drop.classList.remove('is-dragging'); if (!pending) void readSelection([...event.dataTransfer.files]); });
  preview.addEventListener('change', updateSelection);
  save.addEventListener('click', async () => {
    if (pending || !selected().length) return;
    const items = selected().map(input => ({ text: memories[Number(input.value)].text, type: input.closest('article').querySelector('select').value }));
    pending = true; localButton.disabled = true; updateSelection();
    preview.querySelectorAll('input, select').forEach(el => { el.disabled = true; });
    drop.setAttribute('aria-disabled', 'true');
    try {
      const result = await api('/memories/import', { method: 'POST', body: { memories: items } });
      if (active()) ui.closeDialog();
      ui.onImported(result.memories);
      ui.toast(result.imported ? `已导入 ${result.imported} 条偏好${result.duplicates ? `，跳过 ${result.duplicates} 条重复内容` : ''}。` : '这些偏好已在工作空间中，无需重复导入。');
    } catch (error) {
      if (active()) { status.classList.add('is-error'); status.textContent = error.message; }
    } finally {
      pending = false; localButton.disabled = false;
      preview.querySelectorAll('input, select').forEach(el => { el.disabled = false; });
      drop.removeAttribute('aria-disabled'); updateSelection();
    }
  });
  void loadMemoryLocation();
  status.textContent = '读取本机偏好，或选择 personal_dna.yaml、personal_taboos.yaml、Muse 工作空间备份。';
}
