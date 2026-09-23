import { icon, brandMark } from './lib/icons.js';
import { media, samples, starters, escapeHtml as esc } from './lib/data.js';
import { getArchetype, getArchetypesForMedia, getActiveArchetype } from './lib/archetypes.js';
import { getImageStyle } from './lib/image-styles.js';
import { openImageStylePicker, closeImageStylePicker } from './lib/image-style-picker.js';
import { slideHtml, deckStyle, deckHtml, safePreview, uiHtml } from './lib/artifacts.js';
import { sampleCard, createSample, sampleProjectKey } from './lib/gallery.js';
import { api, watchRun } from './lib/api.js';
import { setupMemoryImport, openMemoryImport } from './lib/memory-import.js';
import { renderMarkdown } from './lib/markdown.js';
import { textArtifactFromMessages } from './lib/text-artifact.js';
import { createSourceArchive, exportName, exportReferenceIds, imageFile } from './lib/source-export.js';
import { collectionPage, collectionProjects, collectionResults, mountCollectionPreviews } from './lib/collection.js';
import { appearanceSettings, setAppearance, syncAppearance } from './lib/appearance.js';
import { openSkillInstall } from './lib/skill-install.js';
import { animateView, animatePreview, selectionRect, moveSelection, captureRail, animateRail, openSurface, closeSurface, buttonReady } from './lib/motion.js';
import { copyText } from './lib/clipboard.js';

// crypto.randomUUID 仅在安全上下文可用，IP 直连的 HTTP 部署会拿到 undefined；getRandomValues 无此限制。
function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return [...b].map((x, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + x.toString(16).padStart(2, '0')).join('');
}

const root = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const referencePicker = document.querySelector('#reference-picker');
let referenceTrigger, referencePreviewId;
const STORAGE = 'muse-studio-v1';
const MUSE_WEBSITE = '/';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch { /* Corrupt state is ignored without clearing the user's stored data. */ }
// Old comparison URLs now open the selected, single design.
const cleanUrl = new URL(location.href);
if (cleanUrl.searchParams.has('style')) { cleanUrl.searchParams.delete('style'); history.replaceState(null, '', cleanUrl); }
try { localStorage.removeItem('muse-studio-appearance'); } catch { /* Storage is optional. */ }
const state = {
  page: 'home', type: 'ui', draft: '', style: '随内容判断',
  projects: Array.isArray(saved.projects) ? saved.projects.filter(p => p && typeof p.id === 'string' && media[p.type] && Array.isArray(p.messages) && Array.isArray(p.versions)).slice(0, 30) : [],
  memories: Array.isArray(saved.memories) ? saved.memories.filter(m => m && typeof m.text === 'string' && (media[m.type] || m.type === 'all')) : [],
  currentId: null, version: -1, slide: 0, preview: 'render', filter: 'all', query: '',
  collectionLayout: 'grid', collectionSort: 'recent',
  archetypeId: null, referenceDrafts: {}, imageStyleId: null, sidebarOpen: false, sidebarExpanded: false, mobileTab: 'chat', busy: false, error: '', persisted: true,
};
try {
  const layout = localStorage.getItem('muse-collection-layout');
  if (layout === 'grid' || layout === 'list') state.collectionLayout = layout;
} catch { /* The collection remains usable without browser storage. */ }
let generation, toastTimer, dialogReturnFocus, exportSelection, exporting = false;
Object.assign(state, { backend: false, connecting: true, connection: { configured: false }, progress: '', streamText: '', runs: [] });
let lastView, dialogEpoch = 0;
let memoryDraft = { type: 'all', text: '' }, memorySaving = false;
setupMemoryImport({ dialog, showDialog, closeDialog, isConnected: () => state.backend, onImported: memories => {
  state.memories = memories; persist(); render();
  dialogReturnFocus = document.querySelector('[data-action="import-memory"]');
}, toast });
const mobileViewport = matchMedia('(max-width: 760px)');
const current = () => state.projects.find(p => p.id === state.currentId);
const artifact = () => {
  const project = current();
  return project?.versions[state.version < 0 ? project.versions.length - 1 : state.version] || textArtifactFromMessages(project);
};

function persist() {
  state.projects.sort((a, b) => b.updated - a.updated);
  try { localStorage.setItem('muse-studio-view', JSON.stringify({ currentId: state.currentId, page: state.page })); }
  catch { /* Server storage remains authoritative if browser storage is unavailable. */ }
}

function replaceProject(project) {
  const index = state.projects.findIndex(p => p.id === project.id);
  if (index < 0) state.projects.unshift(project); else state.projects[index] = project;
}
const versionLabel = a => a?.demo === false ? (a.type === 'image' && !a.imageData ? 'AI 矢量插画' : 'AI 创作') : '内置样板';
const connectionLabel = () => state.connecting ? '连接工作空间' : !state.backend ? '服务未连接' : state.connection.configured ? 'Pi 引擎已配置' : '待配置模型';
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
}
function navigate(page) {
  state.page = page;
  state.sidebarOpen = false;
  if (page === 'workspace') state.sidebarExpanded = false;
  state.filter = 'all';
  state.query = '';
  render();
  window.scrollTo(0, 0);
}
async function newProject() {
  if (!await stopGeneration(false)) return;
  state.currentId = null;
  state.draft = '';
  state.archetypeId = null;
  state.referenceDrafts = {};
  state.imageStyleId = null;
  state.error = '';
  state.style = '随内容判断';
  navigate('home');
  persist();
  document.querySelector('#prompt')?.focus();
}
function officialSiteLink(label = 'Muse 官网') {
  return `<a class="official-site-link" href="${MUSE_WEBSITE}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}（在新标签页打开）">${esc(label)}${icon('upRight')}</a>`;
}
function footer() {
  return `<footer class="site-footer"><span>${brandMark()} 由 Muse 审美引擎启发，让表达更有自己的样子。</span><div class="footer-links"><button data-action="about">美是关系的艺术</button>${officialSiteLink()}</div></footer>`;
}
function sidebar() {
  const works = collectionProjects(state.projects);
  return `<button class="sidebar-scrim ${state.sidebarOpen ? 'open' : ''}" data-action="menu" aria-label="关闭导航" tabindex="-1" aria-hidden="${!state.sidebarOpen}"></button>
    <aside id="main-navigation" class="sidebar ${state.sidebarOpen ? 'open' : ''}" aria-label="主导航">
      <button class="brand" data-action="new" aria-label="Muse 首页">${brandMark()}<span class="wordmark">muse</span></button>
      <div class="brand-caption">有想法，也有好表达。</div>
      <button class="new-button" data-action="new" aria-label="开始新创作" aria-keyshortcuts="Meta+K Control+K" title="开始新创作">${icon('plus')}<span class="new-label">开始新创作</span><kbd class="shortcut" aria-hidden="true">⌘ K</kbd></button>
      <nav class="nav-list">${[
        ['home', 'home', '创作空间'], ['projects', 'grid', '我的作品'], ['gallery', 'gallery', '灵感画廊'], ['memory', 'heart', '品味记忆'],
      ].map(([page, glyph, label]) => `<button class="nav-item ${(state.page === page || (page === 'home' && state.page === 'workspace')) ? 'active' : ''}" data-page="${page}" title="${label}" aria-label="${label}" ${state.page === page || (page === 'home' && state.page === 'workspace') ? 'aria-current="page"' : ''}>${icon(glyph)}<span class="nav-label">${label}</span>${page === 'projects' && works.length ? `<span class="nav-count">${works.length}</span>` : ''}</button>`).join('')}
        <a class="nav-item nav-official-site" href="${MUSE_WEBSITE}" target="_blank" rel="noopener noreferrer" title="访问 Muse 官网（新窗口打开）" aria-label="访问 Muse 官网">${icon('book')}<span class="nav-label">Muse 官网</span></a>
      </nav>
      <div class="sidebar-label"><span>最近创作</span>${icon('clock')}</div>
      <div class="history-list">${works.length ? works.slice(0, 5).map(p => `<button class="history-item" data-open="${esc(p.id)}">${icon(p.type)}<span>${esc(p.title)}</span></button>`).join('') : '<p class="history-empty">完成第一件作品，<br>就能在这里找到它。</p>'}</div>
      <div class="sidebar-bottom">
        ${state.page === 'workspace' ? `<button class="sidebar-toggle" data-action="toggle-sidebar" aria-label="${state.sidebarExpanded ? '收起导航' : '展开导航'}" title="${state.sidebarExpanded ? '收起导航' : '展开导航'}" aria-expanded="${state.sidebarExpanded}" aria-controls="main-navigation">${icon(state.sidebarExpanded ? 'panelClose' : 'panelOpen')}<span>收起导航</span></button>` : ''}
        <div class="profile"><div class="avatar">M</div><div class="profile-text"><strong>我的创作空间</strong><span>${connectionLabel()}</span></div><button class="icon-button" data-action="settings" aria-label="工作空间设置" title="工作空间设置" aria-haspopup="dialog" aria-controls="dialog">${icon('sliders')}</button></div>
      </div>
    </aside>`;
}
function heroArt() {
  return `<div class="hero-art" aria-hidden="true"><div class="paper one"><span>Aa</span></div><div class="paper two">${brandMark()}</div><div class="paper three"><i></i></div><div class="paper four"><div class="mini-window"><i></i><b></b></div></div></div>`;
}
function tabs() {
  return `<div class="media-tabs" role="group" aria-label="创作类型">${Object.entries(media).map(([type, item]) => `<button class="media-tab ${state.type === type ? 'active' : ''}" data-type="${type}" aria-pressed="${state.type === type}">${icon(type)}${item.label}</button>`).join('')}</div>`;
}
function skillInstallEntry() {
  return `<button type="button" class="skill-install-entry" data-action="install-skill" aria-label="安装 Muse Skill" aria-describedby="skill-entry-description" aria-haspopup="dialog" aria-controls="dialog"><span class="skill-entry-art" aria-hidden="true">${brandMark()}</span><span class="skill-entry-copy"><strong>安装 Muse Skill</strong><small id="skill-entry-description">把好品味，带到你的 AI 工具</small></span><span class="skill-entry-arrow" aria-hidden="true">${icon('right')}</span></button>`;
}
function composer(compact = false) {
  const placeholder = compact ? '继续聊聊，你想调整哪里？' : media[state.type].placeholder;
  const memories = state.memories.filter(m => m.type === 'all' || m.type === state.type).length;
  return `<form id="composer-form" class="composer" aria-label="创作对话">
      <label class="sr-only" for="prompt">${compact ? '修改想法' : '描述你的创作想法'}</label>
      <textarea id="prompt" name="prompt" maxlength="6000" rows="3" placeholder="${placeholder}" ${state.busy ? 'disabled' : ''}>${esc(state.draft)}</textarea>
      <div class="composer-toolbar"><div id="composer-reference" class="composer-tools">${referenceControl()}</div><div class="send-group"><span class="enter-hint">Enter 发送</span><button class="send-button" type="${state.busy ? 'button' : 'submit'}" ${state.busy ? 'data-action="stop"' : ''} aria-label="${state.busy ? '停止生成' : '发送创作想法'}" ${!state.busy && !state.draft.trim() ? 'disabled' : ''}>${icon(state.busy ? 'stop' : 'arrow')}</button></div></div>
    </form>`;
}
function referenceControl() {
  return referenceChip() || `<button type="button" class="text-button" data-action="choose-reference" aria-haspopup="menu" aria-expanded="false" aria-controls="${state.type === 'image' ? 'image-style-picker' : 'reference-picker'}" ${state.busy ? 'disabled' : ''}>${icon(state.type === 'image' ? 'image' : 'plus')}${state.type === 'image' ? '图片风格' : '添加参考'}</button>`;
}
function referenceChip() {
  if (state.type === 'image') {
    const style = getImageStyle(state.imageStyleId);
    if (!style) return '';
    return `<div class="reference-chip"><button type="button" class="reference-chip-name" data-action="choose-reference" aria-label="更换图片风格：${esc(style.name)}" aria-haspopup="menu" aria-expanded="false" aria-controls="image-style-picker" ${state.busy ? 'disabled' : ''}><img class="image-style-thumb" src="${style.preview}" alt="" width="48" height="32"><span>图片风格 · ${esc(style.name)}</span>${icon('down')}</button><button type="button" class="reference-remove" data-action="remove-reference" aria-label="移除图片风格，随内容判断" ${state.busy ? 'disabled' : ''}>${icon('close')}</button></div>`;
  }
  const reference = getArchetype(state.archetypeId);
  if (!reference) return '';
  const label = referenceLabel(reference);
  return `<div class="reference-chip"><button type="button" class="reference-chip-name" data-action="choose-reference" aria-label="更换${label}：${esc(reference.name)}" aria-haspopup="menu" aria-expanded="false" aria-controls="reference-picker" ${state.busy ? 'disabled' : ''}>${palette(reference)}<span>${label} · ${esc(reference.name)}</span>${icon('down')}</button><button type="button" class="reference-remove" data-action="remove-reference" aria-label="移除${label}" ${state.busy ? 'disabled' : ''}>${icon('close')}</button></div>`;
}
function palette(reference) {
  if (reference.media === 'text') return `<span class="text-reference-mark" aria-hidden="true">${icon('text')}</span>`;
  return `<span class="archetype-palette" aria-hidden="true">${reference.colors.map(color => `<i style="background:${color}"></i>`).join('')}</span>`;
}
function referenceLabel(reference) {
  return reference.media === 'text' ? '文案参考' : reference.media === 'ppt' ? '演示参考' : '参考母体';
}
function referenceOption(item) {
  const selected = state.archetypeId === item.id;
  return `<button type="button" class="reference-option" role="menuitemradio" aria-checked="${selected}" tabindex="-1" data-archetype="${item.id}">${palette(item)}<span>${esc(item.name)}${item.media === 'text' ? `<small>${esc(item.scenes)}</small>` : ''}</span>${selected ? icon('check') : ''}</button>`;
}
function previewReference(id) {
  const pane = referencePicker.querySelector('.reference-preview');
  const item = getArchetype(id);
  if (!pane || !item || (!item.preview && item.media !== 'text') || referencePreviewId === id) return;
  referencePreviewId = id;
  referencePicker.querySelectorAll('[data-archetype]').forEach(option => option.classList.toggle('previewing', option.dataset.archetype === id));
  pane.dataset.previewStyle = id;
  if (item.media === 'text') {
    pane.innerHTML = `<div class="text-reference-preview" aria-live="polite" aria-atomic="true"><div class="text-reference-heading"><strong>${esc(item.name)}</strong><small>Muse 原创例句</small></div><p class="text-reference-description">${esc(item.description)}</p><blockquote>${item.sample.split(/\n\n/).map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}</blockquote><p class="text-reference-rhythm">${esc(item.rhythm)}</p><small class="text-reference-note">以读书笔记为例，仅展示写法</small></div><button type="button" class="reference-preview-select" data-use-reference="${item.id}">选用此文风 ${icon('arrow')}</button>`;
    return;
  }
  const isUI = state.type === 'ui';
  const source = isUI ? (item.example.kind === 'muse' ? 'Muse 页面示例' : `网站参考 · ${esc(item.example.name)}`) : 'Muse 原创样张';
  pane.innerHTML = `<img src="${item.preview}" alt="${esc(item.name)}${isUI ? '风格示例' : '演示样张'}：${esc(item.description)}" width="1280" height="${isUI ? 900 : 720}"><span class="reference-preview-error" hidden>示例图片暂时无法加载</span><div class="reference-preview-meta" aria-live="polite" aria-atomic="true"><div><strong>${esc(item.name)}</strong><small>${source}</small></div><p id="reference-preview-caption">${esc(item.description)}</p></div>${isUI ? `<button type="button" class="reference-preview-select" data-use-reference="${item.id}">选用此风格 ${icon('arrow')}</button>` : ''}`;
  pane.querySelector('img').addEventListener('error', event => {
    if (!pane.contains(event.target)) return;
    event.target.hidden = true;
    pane.querySelector('.reference-preview-error').hidden = false;
  }, { once: true });
}
function positionReferencePicker() {
  if (!referencePicker.matches(':popover-open') || !referenceTrigger?.isConnected) return;
  const rect = referenceTrigger.getBoundingClientRect();
  const viewport = window.visualViewport;
  const edge = 8, gap = 6;
  const leftEdge = (viewport?.offsetLeft || 0) + edge;
  const topEdge = (viewport?.offsetTop || 0) + edge;
  const rightEdge = leftEdge + (viewport?.width || window.innerWidth) - edge * 2;
  const bottomEdge = topEdge + (viewport?.height || window.innerHeight) - edge * 2;
  if (rect.bottom < topEdge || rect.top > bottomEdge) { closeReferencePicker(); return; }
  const above = Math.max(0, rect.top - topEdge - gap);
  const below = Math.max(0, bottomEdge - rect.bottom - gap);
  const hasPreview = referencePicker.classList.contains('has-preview');
  const stacked = hasPreview && rightEdge - leftEdge < 660;
  const desiredHeight = stacked ? 480 : ['ui', 'text'].includes(state.type) ? 376 : 320;
  const openAbove = above >= desiredHeight || above > below;
  // A short mobile viewport (including an open keyboard) needs room for both
  // the preview confirmation and at least one scrollable option.
  const useViewport = stacked && ['ui', 'text'].includes(state.type) && Math.max(above, below) < 280;
  const availableHeight = Math.min(desiredHeight, useViewport ? bottomEdge - topEdge : openAbove ? above : below);
  const totalWidth = hasPreview ? (stacked ? Math.min(352, rightEdge - leftEdge) : 660) : 248;
  const previewLeft = hasPreview && !stacked && rect.left + totalWidth > rightEdge && rect.right - totalWidth >= leftEdge;
  referencePicker.classList.toggle('stacked', stacked);
  referencePicker.dataset.confirm = String(['ui', 'text'].includes(state.type) && (stacked || matchMedia('(hover: none)').matches));
  referencePicker.classList.toggle('preview-left', previewLeft);
  referencePicker.classList.toggle('open-above', openAbove);
  referencePicker.classList.toggle('short', availableHeight < 180);
  referencePicker.style.width = `${totalWidth}px`;
  referencePicker.style.setProperty('--reference-height', `${availableHeight}px`);
  referencePicker.style.maxHeight = `${availableHeight}px`;
  referencePicker.style.maxWidth = `${rightEdge - leftEdge}px`;
  const { width, height } = referencePicker.getBoundingClientRect();
  referencePicker.style.left = `${Math.max(leftEdge, Math.min(previewLeft ? rect.right - width : rect.left, rightEdge - width))}px`;
  const top = openAbove ? rect.top - gap - height : rect.bottom + gap;
  referencePicker.style.top = `${Math.max(topEdge, Math.min(top, bottomEdge - height))}px`;
}
function closeReferencePicker(restoreFocus = false) {
  if (!referencePicker.matches(':popover-open')) return;
  referencePicker.hidePopover();
  referenceTrigger?.setAttribute('aria-expanded', 'false');
  if (restoreFocus && referenceTrigger?.isConnected) referenceTrigger.focus({ preventScroll: true });
}
function chooseReference(trigger) {
  if (state.busy) return;
  if (state.type === 'image') { closeReferencePicker(); return chooseImageStyle(trigger); }
  if (referencePicker.matches(':popover-open') && referenceTrigger === trigger) { closeReferencePicker(true); return; }
  closeReferencePicker();
  referenceTrigger = trigger;
  referencePreviewId = null;
  const hasPreview = ['ppt', 'ui', 'text'].includes(state.type);
  referencePicker.classList.toggle('has-preview', hasPreview);
  referencePicker.classList.toggle('ui-preview', state.type === 'ui');
  referencePicker.classList.toggle('text-preview', state.type === 'text');
  referencePicker.setAttribute('role', hasPreview ? 'group' : 'menu');
  const mediaLabel = state.type === 'text' ? '文案' : state.type === 'ppt' ? '演示' : 'UI';
  referencePicker.setAttribute('aria-label', `${mediaLabel}参考与预览`);
  const options = getArchetypesForMedia(state.type).map(referenceOption).join('');
  referencePicker.innerHTML = hasPreview ? `<div class="reference-menu" role="menu" aria-label="选择${mediaLabel}参考">${options}</div><aside class="reference-preview" aria-label="${state.type === 'text' ? '文案例句预览' : '风格预览'}"></aside>` : options;
  if (state.type === 'ppt') getArchetypesForMedia(state.type).forEach(item => { const image = new Image(); image.src = item.preview; });
  referencePicker.showPopover();
  trigger.setAttribute('aria-expanded', 'true');
  const selected = referencePicker.querySelector('[aria-checked="true"]') || referencePicker.querySelector('button');
  previewReference(selected.dataset.archetype);
  positionReferencePicker();
  selected.focus({ preventScroll: true });
  selected.scrollIntoView({ block: 'nearest' });
}
function setReference(id) {
  if (state.busy) return;
  state.archetypeId = getArchetypesForMedia(state.type).find(item => item.id === id)?.id || null;
  // Replace the toolbar control, preserving the draft, caret and live artifact iframe.
  const container = document.querySelector('#composer-reference');
  if (container) container.innerHTML = referenceControl();
}
function messageReference(message) {
  const style = getImageStyle(message.imageStyleId);
  if (style) return `<div class="attached-file"><img class="image-style-thumb" src="${style.preview}" alt="" width="48" height="32"><span>图片风格 · ${esc(style.name)}</span></div>`;
  const reference = getArchetype(message.archetypeId);
  if (reference) return `<div class="attached-file">${palette(reference)}<span>${referenceLabel(reference)} · ${esc(reference.name)}</span></div>`;
  // Keep historical file references readable without offering new uploads.
  return message.attachment ? `<div class="attached-file">${icon('book')}<span>${esc(message.attachment)}</span></div>` : '';
}
function chooseImageStyle(trigger) {
  if (state.busy) return;
  openImageStylePicker({ trigger, selectedId: state.imageStyleId, onSelect: id => {
    setImageStyle(id);
    document.querySelector('#prompt')?.focus({ preventScroll: true });
  } });
}
function setImageStyle(id) {
  if (state.busy) return;
  state.imageStyleId = getImageStyle(id)?.id || null;
  // Preserve unsent input, caret and the existing artifact preview.
  const container = document.querySelector('#composer-reference');
  if (container) container.innerHTML = referenceControl();
}
function home() {
  return `<main id="main" class="content home-content"><section class="hero"><div><div class="eyebrow">${brandMark()} YOUR IDEAS, BEAUTIFULLY MADE.</div><h1>好想法，值得<span class="thought">好作品。</span></h1><p>和 Muse 聊一聊，让灵感成为看得见的作品。</p></div>${heroArt()}</section>
    <div class="composer-heading">${tabs()}${skillInstallEntry()}</div>${composer()}
    <div class="starters"><span>试着从这里开始</span>${starters[state.type].map((s, i) => `<button class="starter" data-starter="${i}">${s}${icon('upRight')}</button>`).join('')}</div>
    <section class="gallery-section"><div class="section-head"><div><h2>灵感，也许就在这里</h2><p>从一份喜欢的作品出发，找到自己的表达。</p></div><button data-page="gallery">探索 ${samples.length} 套精选样板 ${icon('right')}</button></div><div class="gallery-grid">${samples.filter(s => s.featured).map(sampleCard).join('')}</div></section>${footer()}</main>`;
}
function filters() {
  return `<div class="filters" role="group" aria-label="筛选作品"><button class="filter ${state.filter === 'all' ? 'active' : ''}" data-filter="all" aria-pressed="${state.filter === 'all'}">全部作品<span class="gallery-filter-count">${samples.length}</span></button>${Object.entries(media).map(([key, m]) => `<button class="filter ${state.filter === key ? 'active' : ''}" data-filter="${key}" aria-pressed="${state.filter === key}">${m.label}<span class="gallery-filter-count">${samples.filter(s => s.type === key).length}</span></button>`).join('')}</div>`;
}
function gallery() {
  return `<main id="main" class="content gallery-full"><div class="page-heading"><div><div class="eyebrow">THE MUSE COLLECTION / 精选样板</div><h1>让一个想法，打开另一个。</h1></div></div>${filters()}<div class="gallery-grid">${samples.filter(s => state.filter === 'all' || s.type === state.filter).map(sampleCard).join('')}</div>${footer()}</main>`;
}
function refreshCollection() {
  document.querySelector('#project-results').innerHTML = collectionResults(state);
  mountCollectionPreviews(state.projects);
}
function projects() {
  return collectionPage(state, footer());
}
function memory() {
  const count = state.memories.length;
  return `<main id="main" class="content memory-page">
    <header class="page-heading memory-heading">
      <div><div class="eyebrow">A TASTE THAT IS YOURS</div><h1>品味记忆</h1><p>好品味，有你的痕迹。记住偏爱，也留住创作的自由。</p></div>
      <div class="memory-actions"><button class="secondary-button" data-action="import-memory" aria-haspopup="dialog" aria-controls="dialog">${icon('upload')}导入品味</button><button class="primary-button" data-action="add-memory" aria-haspopup="dialog" aria-controls="dialog">${icon('plus')}添加偏好</button></div>
    </header>
    <section class="memory-library ${count ? '' : 'is-empty'}" aria-label="已保存的品味">
      ${count ? `<div class="memory-library-heading"><h2>我的偏好 <span>${count}</span></h2><p>每一条，都是你亲自确认的。</p></div>
        <div class="memory-list">${state.memories.map((m, index) => `<article class="memory-note" aria-label="第 ${index + 1} 条偏好">
          <div class="memory-note-meta"><span class="memory-scope">${icon(m.type === 'all' ? 'heart' : m.type)}${m.type === 'all' ? '所有创作' : media[m.type].label}</span><button class="icon-button" data-remove-memory="${esc(m.id)}" aria-label="删除第 ${index + 1} 条偏好" title="删除偏好">${icon('trash')}</button></div>
          <p>${esc(m.text)}</p>
        </article>`).join('')}</div>
        <p class="memory-library-note">只在适用的创作中记起。你当下的想法，始终优先。</p>` : `<div class="memory-empty">
          ${brandMark()}<h2>懂你的偏爱，<br>也尊重每次的新想法。</h2>
          <div class="memory-empty-copy"><p>喜欢一张海报，不代表你喜欢它所有的颜色。<br class="memory-desktop-break">一次尝试，也不应该变成永远的规则。</p><p>所以，Muse 只在你主动保存后记住偏好，并保留它适用的场景。<br class="memory-desktop-break">你当下的想法，始终优先。</p></div>
          <p class="memory-empty-note">品味保存在工作空间中。创作时仅将当前媒介适用的已确认偏好发送给模型。</p>
        </div>`}
    </section>${footer()}</main>`;
}
function openMemoryEditor() {
  if (memorySaving) { toast('这份偏好正在保存。'); return; }
  showDialog('记下一点偏爱', `<form id="memory-form" class="memory-editor-form">
    <p class="memory-editor-intro">不用给自己贴风格标签，说说你在什么情境下喜欢什么。</p>
    <div class="field"><label for="memory-scope">这个偏好，用在什么作品里？</label><select id="memory-scope"><option value="all">所有创作</option>${Object.entries(media).map(([key, m]) => `<option value="${key}" ${memoryDraft.type === key ? 'selected' : ''}>${m.label}</option>`).join('')}</select></div>
    <div class="field"><label for="memory-text">以后创作时，请记住…</label><textarea id="memory-text" maxlength="500" required aria-describedby="memory-help" placeholder="比如：写品牌文案时，用具体的生活细节，少用形容词，像跟朋友聊天。">${esc(memoryDraft.text)}</textarea><small id="memory-help">只保存你明确写下的偏好，随时可以删除。</small></div>
    <p class="memory-editor-status" role="status" aria-live="polite"></p>
  </form>`, '<button class="secondary-button" data-action="close-dialog">取消</button><button type="submit" form="memory-form" class="primary-button">保存偏好</button>', 'memory-editor-dialog');
  const form = dialog.querySelector('#memory-form');
  const input = form.querySelector('#memory-text'), scope = form.querySelector('#memory-scope');
  const status = form.querySelector('.memory-editor-status');
  const save = dialog.querySelector('[type="submit"]');
  const epoch = dialogEpoch;
  const captureDraft = () => { memoryDraft = { type: scope.value, text: input.value }; };
  form.addEventListener('input', captureDraft);
  form.addEventListener('change', captureDraft);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (memorySaving) return;
    captureDraft();
    const text = input.value.trim(), type = scope.value;
    if (!text) { status.textContent = '写下一点你希望 Muse 记住的偏好。'; input.focus(); return; }
    if (state.memories.length >= 50) { status.textContent = '最多保存 50 条偏好，请先整理已有内容。'; return; }
    if (!state.backend) { status.textContent = '请先连接工作空间，再保存偏好。'; return; }
    memorySaving = true; save.disabled = true; input.disabled = true; scope.disabled = true;
    save.textContent = '正在保存…'; form.setAttribute('aria-busy', 'true'); status.textContent = '';
    try {
      state.memories.unshift(await api('/memories', { method: 'POST', body: { type, text } }));
      memoryDraft = { type: 'all', text: '' };
      persist(); render();
      if (dialogEpoch === epoch) {
        dialogReturnFocus = document.querySelector('[data-action="add-memory"]');
        closeDialog();
      }
      toast('这份偏好已保存，随时可以修改主意。');
    } catch (error) {
      if (dialogEpoch === epoch) status.textContent = error.message;
      else toast(error.message);
    } finally {
      memorySaving = false; save.disabled = false; input.disabled = false; scope.disabled = false;
      save.textContent = '保存偏好'; form.removeAttribute('aria-busy');
    }
  });
  input.focus({ preventScroll: true });
}
function messages() {
  const p = current();
  return p.messages.map(m => m.role === 'user' ? `<div class="message user">${esc(m.text)}${messageReference(m)}</div>` : `<div class="message assistant"><div class="message-label">${brandMark()} Muse <span>· 创作伙伴</span></div><div class="message-content">${renderMarkdown(m.text)}</div>${m.version != null && p.versions[m.version] ? `<details class="direction-note"><summary>关于这份作品</summary><div class="message-content">${renderMarkdown(p.versions[m.version].direction)}</div></details><button class="artifact-message" data-version="${m.version}">${icon(p.type)}<span>${esc(p.versions[m.version].title)}<small>${media[p.type].label} · 版本 ${m.version + 1} · ${versionLabel(p.versions[m.version])}</small></span>${icon('upRight')}</button>` : ''}</div>`).join('') + (state.busy && state.currentId === p.id ? `<div class="message assistant is-streaming" aria-busy="true"><div class="message-label">${brandMark()} Muse <span>· 创作伙伴</span></div><div class="message-content agent-stream" aria-live="off">${renderMarkdown(state.streamText)}</div><div class="agent-status" role="status"><span class="agent-progress">${esc(state.progress)}</span><span class="loading-dots" aria-hidden="true"><i></i><i></i><i></i></span></div></div>` : '');
}
function workspace() {
  if (!current()) return home();
  return `<main id="main"><div class="mobile-work-tabs"><button data-mobile-tab="chat" class="${state.mobileTab === 'chat' ? 'active' : ''}">对话创作</button><button data-mobile-tab="preview" class="${state.mobileTab === 'preview' ? 'active' : ''}">作品预览 ${current().versions.length ? '· ' + current().versions.length : ''}</button></div><div class="workspace" data-mobile="${state.mobileTab}"><section class="chat-panel" aria-label="与 Muse 对话"><div class="chat-header">${brandMark()}<div><strong>${media[current().type].label} 创作</strong><span>把想法慢慢聊成作品</span></div></div><div class="chat-messages" role="log" aria-label="创作记录">${messages()}</div>${state.error ? `<div class="error-note" role="alert">${esc(state.error)} <button data-action="retry">重新尝试</button></div>` : ''}<div class="chat-compose">${composer(true)}</div></section><section class="preview-panel" aria-label="作品预览">${previewPanel()}</section></div></main>`;
}
function previewPanel() {
  const a = artifact();
  const source = a ? sourceFor(a) : '';
  return `<div class="preview-toolbar"><div class="preview-tabs"><button class="preview-tab ${state.preview === 'render' ? 'active' : ''}" data-preview="render" aria-pressed="${state.preview === 'render'}">${icon('eye')}预览</button><button class="preview-tab ${state.preview === 'source' ? 'active' : ''}" data-preview="source" aria-pressed="${state.preview === 'source'}">${icon('code')}${a?.type === 'text' ? '原文' : '源内容'}</button></div><div class="preview-actions">${current().versions.length > 1 ? `<label class="sr-only" for="version-picker">作品版本</label><select id="version-picker" class="version-select">${current().versions.map((_, i) => `<option value="${i}" ${i === (state.version < 0 ? current().versions.length - 1 : state.version) ? 'selected' : ''}>版本 ${i + 1}</option>`).join('')}</select>` : ''}<button class="icon-button" data-action="copy" aria-label="复制作品源内容" ${!a ? 'disabled' : ''}>${icon('copy')}</button><button class="secondary-button" data-action="download" aria-haspopup="dialog" aria-controls="dialog" ${!a ? 'disabled' : ''}>${icon('download')}导出</button></div></div><div class="preview-content">${!a ? `<div class="preview-empty">${brandMark()}<h2>作品，在这里发生。</h2><p>${state.busy ? 'Muse 正在制作你的作品，完成后会出现在这里。' : '从左侧开始对话，让第一份想法拥有形状。'}</p>${state.busy ? '<div class="generation-paper" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}</div>` : state.preview === 'source' ? `<pre tabindex="0">${esc(source)}</pre>` : previewArtifact(a)}</div><div class="preview-status"><span>${icon('check')}${state.backend ? '已保存在工作空间' : '浏览器中的旧作品'}</span><span>${a ? media[a.type].label + ' · ' + versionLabel(a) : '等待第一份作品'}</span></div>`;
}
function previewArtifact(a) {
  if (a.type === 'ui') return '<iframe id="artifact-frame" title="网页 UI 作品预览" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>';
  if (a.type === 'ppt') return `<iframe id="artifact-frame" class="slide-frame" title="演示第 ${state.slide + 1} 页" sandbox="" referrerpolicy="no-referrer"></iframe><div class="slide-nav"><button class="icon-button" data-action="prev-slide" aria-label="上一页" ${state.slide === 0 ? 'disabled' : ''}>${icon('chevron', 'rotate-back')}</button><span>${state.slide + 1} / ${a.slides.length}</span><button class="icon-button" data-action="next-slide" aria-label="下一页" ${state.slide === a.slides.length - 1 ? 'disabled' : ''}>${icon('chevron')}</button></div><div class="speaker-note"><strong>讲者备注</strong>${esc(a.slides[state.slide].note || '留一点时间，让听众看见这一页的重点。')}</div>`;
  if (a.type === 'text') return `<article class="writing-preview">${renderMarkdown(a.text)}</article>`;
  return '<iframe id="artifact-frame" class="image-preview svg-frame" title="图片作品预览" sandbox="" referrerpolicy="no-referrer"></iframe>';
}
function sourceFor(a) {
  if (a.type === 'ui') return uiHtml(a);
  if (a.type === 'ppt') return deckHtml(a);
  if (a.type === 'text') return a.text;
  return a.imageData || a.svg;
}
function sizeImagePreview(frame, a) {
  const setRatio = (width, height) => {
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      frame.style.setProperty('--image-aspect-ratio', width / height);
    }
  };
  if (a.imageData) {
    const image = new Image();
    image.onload = () => setRatio(image.naturalWidth, image.naturalHeight);
    image.src = a.imageData;
    return;
  }
  const svg = new DOMParser().parseFromString(a.svg || '', 'text/html').querySelector('svg');
  if (!svg) return;
  const viewBox = svg.viewBox.baseVal;
  if (viewBox.width > 0 && viewBox.height > 0) setRatio(viewBox.width, viewBox.height);
  else {
    // Absolute SVG dimensions also work when the source has no viewBox.
    const width = svg.width.baseVal, height = svg.height.baseVal;
    if (width.unitType !== 2 && height.unitType !== 2) setRatio(width.value, height.value);
  }
}
function mountPreview() {
  const frame = document.querySelector('#artifact-frame');
  const a = artifact();
  if (!frame || !a) return;
  if (a.type === 'ui') frame.srcdoc = safePreview(uiHtml(a));
  if (a.type === 'ppt') frame.srcdoc = safePreview(`<style>${deckStyle}</style>${slideHtml(a.slides[state.slide], state.slide, a.slides.length)}`);
  if (a.type === 'image') {
    sizeImagePreview(frame, a);
    frame.srcdoc = safePreview(`<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}body>svg,body>img{display:block;width:100%;height:100%;object-fit:contain}</style>${a.imageData ? `<img alt="${esc(a.title)}" src="${esc(a.imageData)}">` : a.svg}`);
  }
}
function render(options = {}) {
  closeImageStylePicker();
  const previousLog = document.querySelector('.chat-messages');
  const chatScroll = options.preserveChatScroll && previousLog ? { top: previousLog.scrollTop, follow: followsReply(previousLog) } : null;
  closeReferencePicker();
  const before = lastView ? { ...lastView, mediaRect: selectionRect('.media-tab.active'), filterRect: selectionRect('.filter.active') } : null;
  root.innerHTML = `<div class="shell ${state.page === 'workspace' && !state.sidebarExpanded ? 'sidebar-collapsed' : ''}">${sidebar()}<div class="main-shell ${state.page === 'workspace' ? 'workspace-shell' : ''}"><button class="icon-button mobile-menu" data-action="menu" aria-label="打开导航" aria-expanded="${state.sidebarOpen}" aria-controls="main-navigation">${icon('menu')}</button>${({ home, gallery, projects, memory, workspace }[state.page] || home)()}</div></div>`;
  syncDrawerAccessibility();
  syncAppearance();
  mountPreview();
  if (state.page === 'projects') mountCollectionPreviews(state.projects);
  const log = document.querySelector('.chat-messages');
  if (log && chatScroll) log.scrollTo({ top: chatScroll.follow ? log.scrollHeight : chatScroll.top, behavior: 'instant' });
  else if (log && options.scroll !== false) log.scrollTo({ top: log.scrollHeight, behavior: 'instant' });
  lastView = { page: state.page, id: state.currentId, type: state.type, filter: state.filter, messages: current()?.messages.length || 0, versions: current()?.versions.length || 0, busy: state.busy, mobileTab: state.mobileTab };
  animateView(before, lastView);
}
function refreshPreview(direction = 0) {
  const previous = selectionRect('.preview-tab.active');
  const panel = document.querySelector('.preview-panel');
  if (panel) { panel.innerHTML = previewPanel(); mountPreview(); animatePreview(direction); moveSelection(previous, document.querySelector('.preview-tab.active')); }
}
function toggleSidebar() {
  const before = captureRail();
  state.sidebarExpanded = !state.sidebarExpanded;
  // Preserve the live composer, preview frame, selection and scroll position.
  document.querySelector('.shell').classList.toggle('sidebar-collapsed', !state.sidebarExpanded);
  const button = document.querySelector('.sidebar-toggle');
  const label = state.sidebarExpanded ? '收起导航' : '展开导航';
  button.setAttribute('aria-expanded', String(state.sidebarExpanded));
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = `${icon(state.sidebarExpanded ? 'panelClose' : 'panelOpen')}<span>收起导航</span>`;
  animateRail(before, state.sidebarExpanded);
}
function syncDrawerAccessibility() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.inert = mobileViewport.matches && !state.sidebarOpen;
}
function toggleMobileMenu(open = !state.sidebarOpen) {
  state.sidebarOpen = open;
  document.querySelector('.sidebar')?.classList.toggle('open', open);
  const scrim = document.querySelector('.sidebar-scrim');
  scrim?.classList.toggle('open', open);
  scrim?.setAttribute('aria-hidden', String(!open));
  document.querySelector('.mobile-menu')?.setAttribute('aria-expanded', String(open));
  syncDrawerAccessibility();
  document.querySelector(open ? '.sidebar .brand' : '.mobile-menu')?.focus({ preventScroll: true });
}
mobileViewport.addEventListener('change', () => {
  if (!mobileViewport.matches) {
    state.sidebarOpen = false;
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-scrim')?.classList.remove('open');
    document.querySelector('.sidebar-scrim')?.setAttribute('aria-hidden', 'true');
    document.querySelector('.mobile-menu')?.setAttribute('aria-expanded', 'false');
  }
  syncDrawerAccessibility();
});
async function openProject(id) {
  if (state.busy && !await stopGeneration(false)) return;
  const p = state.projects.find(p => p.id === id);
  if (!p) return;
  state.currentId = id;
  state.type = p.type;
  state.version = -1;
  state.slide = 0;
  state.draft = '';
  state.archetypeId = getActiveArchetype(p.archetypeId, p.type)?.id || null;
  state.imageStyleId = getImageStyle(p.imageStyleId)?.id || null;
  state.error = '';
  state.mobileTab = p.versions.length ? 'preview' : 'chat';
  state.preview = 'render';
  navigate('workspace');
  persist();
  const running = state.runs.find(r => r.projectId === id && r.status === 'running');
  if (running) resumeRun(running);
}
async function openSample(id) {
  const sample = samples.find(s => s.id === id);
  if (!sample) return;
  if (!await stopGeneration(false)) return;
  const existing = state.projects.find(p => p.sampleId === sampleProjectKey(id));
  if (existing) return openProject(existing.id);
  if (state.projects.length >= 30) { toast('本地最多保存 30 个作品。请先导出并删除不再需要的作品。'); return; }
  const a = createSample(id);
  let p = { id: uuid(), sampleId: sampleProjectKey(id), type: sample.type, title: sample.title, updated: Date.now(), messages: [{ role: 'user', text: sample.prompt }, { role: 'assistant', text: `已打开「${sample.title}」，包含${sample.detail}。你可以直接预览与导出，也可以告诉我想替换的品牌、内容或风格，在这份样板上继续创作。`, version: 0 }], versions: [a] };
  if (!state.backend) { toast('请先启动 Muse 后端再保存示例。'); return; }
  p = await api('/projects', { method: 'POST', body: { sample: p } });
  state.projects.unshift(p);
  persist();
  openProject(p.id);
}
async function submitPrompt() {
  const prompt = state.draft.trim();
  if (!prompt || state.busy) return;
  if (!state.backend || !state.connection.configured) { toast(state.backend ? '请先在工作空间设置中查看模型配置说明。' : '请先启动 Muse 后端。'); settings(); return; }
  const token = { input: { prompt, style: state.style, archetypeId: state.type === 'image' ? null : state.archetypeId, imageStyleId: state.type === 'image' ? state.imageStyleId : null, attachment: state.attachment, baseVersionId: state.page === 'workspace' ? artifact()?.id : undefined, requestId: uuid() } };
  generation = token;
  state.busy = true;
  state.error = '';
  state.progress = '准备创作';
  state.streamText = '';
  try {
    let p = current();
    if (!p || state.page !== 'workspace') {
      p = await api('/projects', { method: 'POST', body: { type: state.type, title: prompt.slice(0, 22) } });
      replaceProject(p);
      if (token.cancelled) return;
      state.currentId = p.id;
      state.sidebarExpanded = false;
    }
    token.projectId = p.id;
    state.page = 'workspace';
    state.mobileTab = 'chat';
    state.draft = '';
    state.attachment = null;
    persist(); render();
    const run = await api(`/projects/${p.id}/runs`, { method: 'POST', body: token.input });
    token.runId = run.id;
    if (token.cancelled) { await api(`/runs/${run.id}/cancel`, { method: 'POST', body: {} }); return; }
    replaceProject(await api(`/projects/${p.id}`));
    state.runs = [...state.runs.filter(r => r.id !== run.id), run];
    render();
    connectRun(token);
  } catch (error) {
    if (generation !== token || token.cancelled) return;
    // A lost POST response must not hide a task that the server already accepted.
    if (token.projectId) {
      try {
        const workspace = await api('/workspace');
        const running = workspace.runs.find(r => r.projectId === token.projectId && r.requestId === token.input.requestId);
        if (running) { state.projects = workspace.projects; token.runId = running.id; connectRun(token); render(); return; }
      } catch { /* Preserve the input for a retry when connectivity returns. */ }
    }
    state.busy = false; generation = null;
    state.error = error.message;
    state.draft = prompt;
    state.attachment = token.input.attachment;
    state.archetypeId = token.input.archetypeId;
    state.imageStyleId = token.input.imageStyleId;
    render(); toast(error.message);
  }
}
function connectRun(token) {
  token.unwatch = watchRun(token.runId, snapshot => receiveRun(token, snapshot), () => {
    if (generation !== token) return;
    state.progress = '连接中断，正在恢复创作进度…';
    refreshProgress();
  });
}
function resumeRun(run) {
  const token = { projectId: run.projectId, runId: run.id };
  generation = token; state.busy = true; state.progress = run.progress; state.streamText = run.text || '';
  render(); connectRun(token);
}
let streamFrame;
const followsReply = log => log.scrollHeight - log.scrollTop - log.clientHeight < 80;
function refreshProgress() {
  if (streamFrame) return;
  streamFrame = requestAnimationFrame(() => {
    streamFrame = undefined;
    if (!state.busy) return;
    const log = document.querySelector('.chat-messages');
    const follow = log && followsReply(log);
    const progress = document.querySelector('.agent-progress');
    const text = document.querySelector('.agent-stream');
    if (progress) progress.textContent = state.progress;
    if (text && text.dataset.source !== state.streamText) {
      text.innerHTML = renderMarkdown(state.streamText);
      text.dataset.source = state.streamText;
    }
    if (follow) log.scrollTo({ top: log.scrollHeight, behavior: 'instant' });
  });
}
async function receiveRun(token, snapshot) {
  if (generation !== token || token.cancelled) return;
  state.progress = snapshot.progress || '正在创作';
  state.streamText = snapshot.text || '';
  if (snapshot.status === 'running') { refreshProgress(); return; }
  const project = await api(`/projects/${token.projectId}`);
  if (generation !== token || token.cancelled) return;
  replaceProject(project);
  state.runs = [...state.runs.filter(r => r.id !== snapshot.id), snapshot];
  state.busy = false; generation = null;
  state.error = ['failed', 'interrupted'].includes(snapshot.status) ? snapshot.error : '';
  if (snapshot.status !== 'completed') {
    const last = [...project.messages].reverse().find(m => m.role === 'user' && m.runId === snapshot.id);
    state.draft = last?.text || token.input?.prompt || '';
    state.attachment = last?.reference ? { name: last.attachment, text: last.reference } : null;
    state.archetypeId = getActiveArchetype(last ? last.archetypeId : token.input?.archetypeId, state.type)?.id || null;
    state.imageStyleId = getImageStyle(last ? last.imageStyleId : token.input?.imageStyleId)?.id || null;
  } else if (snapshot.outcome !== 'message') { state.version = -1; state.slide = 0; state.preview = 'render'; }
  persist(); render({ preserveChatScroll: true });
  if (snapshot.status === 'completed' && snapshot.outcome !== 'message' && window.innerWidth <= 760) toast('创作已完成，点击「作品预览」查看。');
}
async function stopGeneration(showToast = true) {
  const token = generation;
  if (!token || !state.busy) return true;
  if (token.runId) {
    try {
      const result = await api(`/runs/${token.runId}/cancel`, { method: 'POST', body: {} });
      if (result.status === 'completed') { await receiveRun(token, result); return true; }
    } catch (error) { toast('停止请求未送达，任务可能仍在运行。请恢复连接后重试。'); return false; }
  }
  token.cancelled = true; token.unwatch?.();
  const last = [...(current()?.messages || [])].reverse().find(m => m.role === 'user');
  state.draft = token.input?.prompt || last?.text || '';
  state.attachment = token.input?.attachment || (last?.reference ? { name: last.attachment, text: last.reference } : null);
  state.archetypeId = getActiveArchetype(token.input ? token.input.archetypeId : last?.archetypeId, state.type)?.id || null;
  state.imageStyleId = getImageStyle(token.input ? token.input.imageStyleId : last?.imageStyleId)?.id || null;
  state.busy = false; generation = null;
  state.runs = state.runs.filter(r => r.id !== token.runId);
  if (showToast) { render(); toast('已请求停止，想法已放回输入框。'); }
  return true;
}
async function bootstrap() {
  try {
    const [connection, workspace] = await Promise.all([api('/status'), api('/workspace')]);
    state.connection = connection;
    let remote = workspace;
    const legacy = state.projects.length || state.memories.length;
    let migrated = false;
    try { migrated = localStorage.getItem(`muse-migrated-${workspace.id}`) === 'true'; } catch { /* Migration is also idempotent on the server. */ }
    if (legacy && !migrated) {
      remote = await api('/import', { method: 'POST', body: { projects: state.projects, memories: state.memories } });
      try { localStorage.setItem(`muse-migrated-${workspace.id}`, 'true'); } catch { /* Optional browser marker. */ }
    }
    state.backend = true; state.projects = remote.projects; state.memories = remote.memories; state.runs = remote.runs;
    let view;
    try { view = JSON.parse(localStorage.getItem('muse-studio-view') || 'null'); } catch { /* Ignore malformed view state. */ }
    if (view?.page === 'workspace' && state.projects.some(p => p.id === view.currentId)) {
      state.currentId = view.currentId; state.type = current().type; state.page = 'workspace';
      state.imageStyleId = getImageStyle(current().imageStyleId)?.id || null;
    }
    state.connecting = false; render();
    const running = state.runs.find(r => r.projectId === state.currentId && r.status === 'running');
    if (running) resumeRun(running);
    else if (state.currentId) {
      const latest = state.runs.filter(r => r.projectId === state.currentId).at(-1);
      if (latest && ['failed', 'interrupted'].includes(latest.status)) { state.error = latest.error; render(); }
    }
  } catch (error) {
    state.connecting = false; state.backend = false; state.error = error.message; render();
    toast('未能连接工作空间，原有浏览器数据仍然保留。');
  }
}
function showDialog(title, body, actions = '', className = '') {
  closeImageStylePicker();
  closeReferencePicker();
  dialogEpoch++;
  dialog.className = className;
  dialog.removeAttribute('aria-describedby');
  if (!dialog.open) dialogReturnFocus = document.activeElement;
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close-dialog" aria-label="关闭弹窗">${icon('close')}</button></div><div class="dialog-body">${body}</div>${actions ? `<div class="dialog-footer">${actions}</div>` : ''}`;
  syncAppearance();
  dialog.showModal();
  dialog.scrollTop = 0;
  dialog.querySelector('.dialog-heading button')?.focus({ preventScroll: true });
  openSurface(dialog);
}
function closeDialog() {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  const epoch = ++dialogEpoch;
  closeSurface(dialog, () => {
    if (epoch !== dialogEpoch) return;
    dialog.close();
    if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus({ preventScroll: true });
  });
}
function settings() {
  showDialog('工作空间设置', `${appearanceSettings()}<div class="connection-row"><strong>创作引擎</strong><span>Muse 6.0 · Pi</span></div><div class="connection-row"><strong>作品存储</strong><span>${state.backend ? '本机工作空间' : '服务未连接'} · ${collectionProjects(state.projects).length} 件作品</span></div><div class="connection-row"><strong>模型连接</strong><span>${esc(connectionLabel())}</span></div>${state.connection.model ? `<div class="connection-row"><strong>界面 · 图片 · 演示</strong><span>${esc(state.connection.model)}</span></div><div class="connection-row"><strong>文案模型</strong><span>${esc(state.connection.textModel || state.connection.model)}</span></div>` : ''}<div class="connection-notice">${state.connection.configured ? '提交后，当前需求、对话、参考和适用的品味会发送给已配置的模型。密钥只保存在服务端。' : '请在项目的 .env 中填写 DEEPSEEK_API_KEY，然后重启服务。默认使用 DeepSeek Flash 创作，文案使用 Pro。'}</div>${state.connection.modelNote ? `<p>${esc(state.connection.modelNote)}</p>` : ''}<p>作品与会话保存在本机工作空间，刷新后可以继续。演示导出为 HTML；${state.connection.imageGeneration ? '图片已配置图像模型。' : '图片当前支持 AI 制作的 SVG 矢量插画。'}</p><button class="settings-about" data-action="about-settings">${brandMark()}<span>认识 Muse</span>${icon('upRight')}</button>`, '<button class="secondary-button" data-action="backup">导出工作空间备份</button><button class="primary-button" data-action="close-dialog">继续创作</button>');
}
function about(fromSettings = false) {
  showDialog('美是关系的艺术。', `${brandMark()}<p>Muse 是你的 AI 创作伙伴。从一句模糊的想法出发，陪你找到恰当的表达，再把它变成可以带走的作品。</p><h3>先理解，再创作</h3><p>理解作品的目的、受众和情境，安排内容与形式的关系。网页、演示、文案和图片，各有自己的表达方式。</p><h3>记住你的偏爱，保留你的自由</h3><p>你主动保存的品味，为下一次创作提供线索。每一次新的想法，仍然可以有新的答案。</p><p class="form-note">由 Muse 6.0 创作规范与 Pi Agent 驱动。新作品由已配置的模型生成，灵感画廊内置由 Muse 实际设计的概念样板。</p>${officialSiteLink('访问 Muse 官网')}`, `${fromSettings ? '<button class="secondary-button" data-action="settings">返回设置</button>' : ''}<button class="primary-button" data-action="close-dialog">带着想法，开始吧</button>`);
}
function downloadFile(text, name, mime) {
  const url = URL.createObjectURL(text instanceof Blob ? text : new Blob([text], { type: mime }));
  const link = document.createElement('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function downloadArtifact() {
  if (exporting) { toast('源文件包正在整理，请稍候。'); return; }
  const a = artifact();
  if (!a) return;
  const project = current();
  const index = project.versions.indexOf(a);
  exportSelection = { artifact: structuredClone(a), projectTitle: project.title, version: index < 0 ? null : index + 1 };
  const details = {
    ui: '网页 HTML、CSS、JavaScript 和可直接打开的网页',
    ppt: '完整演示、逐页 HTML、原始内容和讲者备注',
    text: 'Markdown 正文和原始内容',
    image: '已保存的原始图片或 SVG 矢量源文件',
  }[a.type];
  const designDetails = a.type === 'text' ? '创作方向和关联参考' : a.imageData ? '关联风格规范和创作说明' : '设计样式、颜色与字体清单';
  showDialog('导出作品', `<p class="export-summary"><strong>${esc(project.title)}</strong>${index < 0 ? '' : `<span>版本 ${index + 1}</span>`}</p><div class="export-package"><div class="export-package-heading">${icon('code')}<h3>源文件包</h3><span class="type-badge">ZIP</span></div><p>把作品和设计系统一起保存到本地，方便继续编辑与复用。</p><ul><li>${details}</li><li>${designDetails}</li><li>关联设计规范和使用说明</li></ul></div><p class="form-note">导出当前查看的版本。解压后即可查看源文件。</p><p class="form-note export-status" role="status" aria-live="polite"></p>`, '<button class="secondary-button" data-action="download-single">仅下载作品文件</button><button class="primary-button" data-action="download-source">' + icon('download') + '下载源文件包</button>', 'export-dialog');
}
function downloadSingleArtifact() {
  const a = exportSelection?.artifact;
  if (!a) return;
  const ext = { ui: 'html', ppt: 'html', text: 'md', image: 'svg' }[a.type];
  const mime = { ui: 'text/html', ppt: 'text/html', text: 'text/markdown', image: 'image/svg+xml' }[a.type];
  const name = exportName(a.title);
  if (a.imageData) {
    const image = imageFile(a.imageData);
    downloadFile(image.data, `${name}.${image.extension}`, image.mime); toast('图片已导出。'); closeDialog(); return;
  }
  downloadFile(sourceFor(a), `${name}.${ext}`, `${mime};charset=utf-8`);
  toast(a.type === 'ppt' ? '已导出 HTML 幻灯片，用浏览器打开即可演示。' : '作品已导出。');
  closeDialog();
}
async function downloadSourcePackage() {
  if (!exportSelection || exporting) return;
  const selection = exportSelection, epoch = dialogEpoch;
  const button = dialog.querySelector('[data-action="download-source"]');
  const status = dialog.querySelector('.export-status');
  exporting = true;
  button.disabled = true; button.setAttribute('aria-busy', 'true');
  status.textContent = '正在整理源文件与设计规范…';
  try {
    const ids = exportReferenceIds(selection.artifact);
    const query = new URLSearchParams(Object.entries(ids).filter(([, id]) => id));
    const references = query.size ? (await api(`/export/references?${query}`)).references : [];
    const archive = createSourceArchive(selection.artifact, { ...selection, references });
    downloadFile(archive, `${exportName(selection.projectTitle)}${selection.version ? `-v${selection.version}` : ''}-源文件.zip`, 'application/zip');
    toast('源文件包已下载，包含作品源码与设计系统。');
    if (dialogEpoch === epoch) closeDialog();
  } catch (error) {
    const message = `导出未完成：${error.message}`;
    if (dialogEpoch === epoch) status.textContent = message;
    toast(message);
  } finally {
    exporting = false;
    button.disabled = false; button.removeAttribute('aria-busy');
  }
}
root.addEventListener('submit', async e => {
  e.preventDefault();
  if (e.target.id === 'composer-form') submitPrompt();

});
root.addEventListener('input', e => {
  if (e.target.id === 'prompt') {
    state.draft = e.target.value;
    const button = document.querySelector('.send-button');
    if (button && !state.busy) {
      const wasDisabled = button.disabled;
      button.disabled = !state.draft.trim();
      if (wasDisabled && !button.disabled) buttonReady(button);
    }
  }
  if (e.target.id === 'project-search') {
    state.query = e.target.value;
    refreshCollection();
  }
});
root.addEventListener('keydown', e => {
  const referenceButton = e.target.closest('[data-action="choose-reference"]');
  if (referenceButton && !referenceButton.disabled && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault();
    chooseReference(referenceButton);
    if (e.key === 'ArrowUp' && state.type !== 'image') {
      const last = [...referencePicker.querySelectorAll('.reference-option')].at(-1);
      last?.focus({ preventScroll: true });
      last?.scrollIntoView({ block: 'nearest' });
    }
  }
  if (e.target.id === 'prompt' && e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); submitPrompt(); }
});
root.addEventListener('change', e => {
  if (e.target.id === 'collection-sort') { state.collectionSort = e.target.value; refreshCollection(); }
  if (e.target.id === 'version-picker') { state.version = Number(e.target.value); state.slide = 0; refreshPreview(); }
});
async function handleClick(e) {
  const button = e.target.closest('button');
  if (!button || button.disabled) return;
  const d = button.dataset;
  if (d.archetype && referencePicker.dataset.confirm === 'true' && e.detail > 0) {
    previewReference(d.archetype);
    return;
  }
  const referenceId = d.archetype || d.useReference;
  if (referenceId && getArchetype(referenceId)) {
    closeReferencePicker();
    setReference(referenceId);
    document.querySelector('#prompt')?.focus({ preventScroll: true });
    return;
  }
  if (d.appearance) { setAppearance(d.appearance); return; }
  if (d.page) { if (state.busy && !await stopGeneration(false)) return; navigate(d.page); persist(); }
  if (d.type && state.type !== d.type) {
    state.referenceDrafts[state.type] = state.archetypeId;
    state.archetypeId = getActiveArchetype(state.referenceDrafts[d.type], d.type)?.id || null;
    state.type = d.type;
    render();
    document.querySelector(`.media-tab[data-type="${d.type}"]`)?.focus({ preventScroll: true });
  }
  if (d.starter !== undefined) { state.draft = starters[state.type][Number(d.starter)]; render(); document.querySelector('#prompt')?.focus(); }
  if (d.sample) await openSample(d.sample);
  if (d.open) await openProject(d.open);
  if (d.filter && state.filter !== d.filter) { state.filter = d.filter; render(); document.querySelector(`.filter[data-filter="${d.filter}"]`)?.focus({ preventScroll: true }); }
  if (d.preview && state.preview !== d.preview) { state.preview = d.preview; refreshPreview(); document.querySelector(`.preview-tab[data-preview="${d.preview}"]`)?.focus({ preventScroll: true }); }
  if (d.collectionLayout && ['grid', 'list'].includes(d.collectionLayout)) {
    state.collectionLayout = d.collectionLayout;
    try { localStorage.setItem('muse-collection-layout', d.collectionLayout); } catch { /* Optional preference. */ }
    document.querySelector('.collection-grid')?.setAttribute('data-layout', d.collectionLayout);
    document.querySelectorAll('[data-collection-layout]').forEach(item => {
      const active = item.dataset.collectionLayout === d.collectionLayout;
      item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));
    });
  }
  if (d.mobileTab) { state.mobileTab = d.mobileTab; render(); }
  if (d.version !== undefined) { state.version = Number(d.version); state.slide = 0; state.preview = 'render'; state.mobileTab = 'preview'; render({ scroll: false }); }
  if (d.rename) {
    const p = state.projects.find(p => p.id === d.rename);
    showDialog('给作品一个新名字', `<form id="rename-form"><div class="field"><label for="project-name">作品名称</label><input id="project-name" value="${esc(p.title)}" maxlength="60" required><input type="hidden" id="rename-id" value="${esc(p.id)}"></div><button class="primary-button" type="submit">保存名称</button></form>`);
    dialog.querySelector('#project-name').select();
  }
  if (d.delete) {
    const p = state.projects.find(p => p.id === d.delete);
    showDialog('删除这件作品？', `<p>「${esc(p.title)}」和它的所有版本会从工作空间移除。需要保留的话，请先打开作品并导出。</p>`, `<button class="secondary-button" data-action="close-dialog">保留作品</button><button class="primary-button" data-confirm-delete="${esc(p.id)}">删除作品</button>`);
  }
  if (d.confirmDelete) { await api(`/projects/${d.confirmDelete}`, { method: 'DELETE' }); state.projects = state.projects.filter(p => p.id !== d.confirmDelete); persist(); closeDialog(); render(); toast('作品已删除。'); }
  if (d.removeMemory) {
    const index = state.memories.findIndex(m => m.id === d.removeMemory);
    button.disabled = true;
    try {
      await api(`/memories/${encodeURIComponent(d.removeMemory)}`, { method: 'DELETE' });
      state.memories = state.memories.filter(m => m.id !== d.removeMemory);
      persist(); render();
      const remaining = document.querySelectorAll('[data-remove-memory]');
      (remaining[Math.min(index, remaining.length - 1)] || document.querySelector('[data-action="add-memory"]'))?.focus({ preventScroll: true });
      toast('偏好已删除。');
    } finally { button.disabled = false; }
  }
  const actions = {
    new: newProject,
    menu: () => toggleMobileMenu(),
    about, settings,
    'install-skill': () => openSkillInstall({ dialog, showDialog }),
    'import-memory': () => openMemoryImport(),
    'add-memory': openMemoryEditor,
    'about-settings': () => about(true),
    'toggle-sidebar': toggleSidebar,
    'choose-reference': () => chooseReference(button),
    'remove-reference': () => { if (state.type === 'image') setImageStyle(null); else setReference(null); document.querySelector('[data-action="choose-reference"]')?.focus({ preventScroll: true }); },

    stop: () => stopGeneration(),
    retry: () => { const last = [...(current()?.messages || [])].reverse().find(m => m.role === 'user'); if (last) { state.draft = last.text; state.archetypeId = getActiveArchetype(last.archetypeId, state.type)?.id || null; state.imageStyleId = getImageStyle(last.imageStyleId)?.id || null; state.style = last.style || state.style; state.attachment = last.reference ? { name: last.attachment, text: last.reference } : null; } return submitPrompt(); },
    'clear-search': () => { state.filter = 'all'; state.query = ''; render(); },
    'close-dialog': closeDialog,
    download: downloadArtifact,
    'download-single': downloadSingleArtifact,
    'download-source': downloadSourcePackage,
    backup: () => { downloadFile(JSON.stringify({ format: 'muse-studio-backup-v1', projects: state.projects, memories: state.memories }, null, 2), 'Muse-工作空间备份.json', 'application/json'); toast('工作空间备份已导出。'); },
    copy: async () => { if (!artifact()) return; try { await copyText(sourceFor(artifact())); toast('作品内容已复制。'); } catch { toast('浏览器未允许复制，可在源内容中选中复制，或直接导出。'); } },
    'prev-slide': () => { if (state.slide > 0) state.slide--; refreshPreview(-1); },
    'next-slide': () => { if (state.slide < artifact().slides.length - 1) state.slide++; refreshPreview(1); },
  };
  if (d.action && actions[d.action]) await actions[d.action]();
}
root.addEventListener('click', e => { void handleClick(e).catch(error => toast(error.message)); });
referencePicker.addEventListener('click', e => { void handleClick(e).catch(error => toast(error.message)); });
referencePicker.addEventListener('pointerover', e => {
  const option = e.target.closest('[data-archetype]');
  if (option && e.pointerType !== 'touch') previewReference(option.dataset.archetype);
});
referencePicker.addEventListener('focusin', e => {
  const option = e.target.closest('[data-archetype]');
  if (option) previewReference(option.dataset.archetype);
});
referencePicker.addEventListener('keydown', e => {
  const options = [...referencePicker.querySelectorAll('.reference-option')];
  const index = options.indexOf(document.activeElement);
  const target = { ArrowDown: (index + 1) % options.length, ArrowUp: (index - 1 + options.length) % options.length, Home: 0, End: options.length - 1 }[e.key];
  if (target !== undefined) { e.preventDefault(); options[target].focus({ preventScroll: true }); options[target].scrollIntoView({ block: 'nearest' }); }
});
document.addEventListener('pointerdown', e => {
  if (!referencePicker.contains(e.target) && !e.target.closest('[data-action="choose-reference"]')) closeReferencePicker();
});
document.addEventListener('focusin', e => {
  if (!referencePicker.contains(e.target) && e.target !== referenceTrigger) closeReferencePicker();
});
window.addEventListener('resize', positionReferencePicker);
window.addEventListener('blur', () => closeReferencePicker());
window.addEventListener('scroll', e => { if (!referencePicker.contains(e.target)) positionReferencePicker(); }, true);
window.visualViewport?.addEventListener('resize', positionReferencePicker);
window.visualViewport?.addEventListener('scroll', positionReferencePicker);
dialog.addEventListener('click', e => { void handleClick(e).catch(error => toast(error.message)); });
dialog.addEventListener('cancel', e => { if (e.target !== dialog) return; e.preventDefault(); closeDialog(); });
dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) closeDialog(); } });
dialog.addEventListener('submit', async e => {
  if (e.target.id !== 'rename-form') return;
  e.preventDefault();
  const title = dialog.querySelector('#project-name').value.trim();
  if (!title) return;
  const p = state.projects.find(p => p.id === dialog.querySelector('#rename-id').value);
  if (p) { try { replaceProject(await api(`/projects/${p.id}`, { method: 'PATCH', body: { title } })); persist(); } catch (error) { toast(error.message); return; } }
  closeDialog(); render(); toast('作品名称已保存。');
});
document.addEventListener('keydown', e => {
  if (referencePicker.matches(':popover-open') && (e.key === 'Escape' || e.key === 'Tab')) {
    if (e.key === 'Tab' && referencePicker.dataset.confirm === 'true') {
      const confirm = referencePicker.querySelector('.reference-preview-select');
      if (!e.shiftKey && document.activeElement.matches('.reference-option')) { e.preventDefault(); confirm.focus(); return; }
      if (e.shiftKey && document.activeElement === confirm) { e.preventDefault(); referencePicker.querySelector('.previewing').focus(); return; }
    }
    if (e.key === 'Escape') e.preventDefault();
    closeReferencePicker(true);
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (dialog.open) closeDialog(); newProject(); }
  if (e.key === 'Escape' && state.sidebarOpen && !dialog.open) toggleMobileMenu(false);
  if (e.key === 'Tab' && state.sidebarOpen && !dialog.open && window.innerWidth <= 760) {
    const focusable = [...document.querySelectorAll('.sidebar button')].filter(button => button.getClientRects().length && !button.disabled);
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.addEventListener('beforeunload', () => generation?.unwatch?.());
render();
void bootstrap();
