import { imageStyles, getImageStyle } from './image-styles.js';
import { escapeHtml as esc } from './data.js';
import { icon } from './icons.js';

const picker = document.createElement('div');
picker.id = 'image-style-picker';
picker.className = 'image-style-picker';
picker.setAttribute('popover', 'manual');
picker.setAttribute('aria-label', '图片风格与预览');
document.body.append(picker);
let trigger, selectStyle, previewId;
const isOpen = () => picker.matches(':popover-open');

function preview(id) {
  if (previewId === id) return;
  previewId = id;
  const style = getImageStyle(id);
  picker.querySelectorAll('[data-image-style]').forEach(option => option.classList.toggle('previewing', option.dataset.imageStyle === id));
  const pane = picker.querySelector('.image-style-preview-card');
  pane.dataset.previewStyle = style?.id || '';
  pane.innerHTML = style
    ? `<img src="${style.preview}" alt="${esc(style.name)}风格示例：让想法开花" width="960" height="640"><div><strong>${esc(style.name)}</strong><p>${esc(style.description)}</p><small>AI 风格示例 · 点击选项使用</small></div>`
    : `<div class="image-style-auto-preview">${icon('image')}<strong>随内容判断</strong><p>让 Muse 根据这次的画面与内容选择画法。</p></div>`;
}

function position() {
  if (!isOpen()) return;
  if (!trigger?.isConnected) { closeImageStylePicker(); return; }
  const rect = trigger.getBoundingClientRect();
  const viewport = window.visualViewport;
  const x = viewport?.offsetLeft || 0, y = viewport?.offsetTop || 0;
  const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
  const edge = 8, gap = 6;
  if (rect.bottom < y || rect.top > y + height) { closeImageStylePicker(); return; }
  const above = Math.max(0, rect.top - y - edge - gap);
  const below = Math.max(0, y + height - edge - rect.bottom - gap);
  const openAbove = above >= 360 || above > below;
  const available = Math.max(80, openAbove ? above : below);
  const stacked = width < 660;
  picker.classList.toggle('stacked', stacked);
  picker.classList.toggle('short', available < 300);
  const menuWidth = stacked ? Math.min(300, width - edge * 2) : 248;
  const totalWidth = stacked ? menuWidth : 602;
  const previewLeft = !stacked && rect.left + totalWidth > x + width - edge && rect.right - totalWidth >= x + edge;
  picker.classList.toggle('preview-left', previewLeft);
  picker.style.width = `${totalWidth}px`;
  picker.style.setProperty('--picker-height', `${Math.min(stacked ? 440 : 360, available)}px`);
  const left = previewLeft ? rect.right - totalWidth : rect.left;
  picker.style.left = `${Math.max(x + edge, Math.min(left, x + width - edge - totalWidth))}px`;
  const actualHeight = picker.getBoundingClientRect().height;
  picker.style.top = `${openAbove ? rect.top - gap - actualHeight : rect.bottom + gap}px`;
}

export function closeImageStylePicker(restoreFocus = false) {
  if (!isOpen()) return;
  picker.hidePopover();
  trigger?.setAttribute('aria-expanded', 'false');
  if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
}

export function openImageStylePicker(options) {
  if (isOpen() && trigger === options.trigger) { closeImageStylePicker(true); return; }
  closeImageStylePicker();
  trigger = options.trigger;
  selectStyle = options.onSelect;
  previewId = undefined;
  picker.innerHTML = `<div class="image-style-menu"><p class="image-style-menu-heading">图片风格 <span>15 种</span></p><div class="image-style-options" role="menu" aria-label="选择图片风格"><button type="button" class="image-style-option" role="menuitemradio" aria-checked="${!options.selectedId}" tabindex="-1" data-image-style="">${icon('sliders')}<span>随内容判断</span>${!options.selectedId ? icon('check') : ''}</button>${imageStyles.map(style => `<button type="button" class="image-style-option" role="menuitemradio" aria-checked="${options.selectedId === style.id}" tabindex="-1" data-image-style="${style.id}"><img src="${style.preview}" alt="" width="36" height="24" loading="lazy"><span>${esc(style.name)}</span>${options.selectedId === style.id ? icon('check') : ''}</button>`).join('')}</div><p class="image-style-menu-hint">移到选项看大图，点击选用</p></div><aside class="image-style-preview-card" aria-label="风格大图预览"></aside>`;
  picker.showPopover();
  trigger.setAttribute('aria-expanded', 'true');
  const initial = options.selectedId || imageStyles[0].id;
  preview(initial);
  position();
  const option = picker.querySelector(`[data-image-style="${initial}"]`);
  option.focus({ preventScroll: true });
  option.scrollIntoView({ block: 'nearest' });
}

picker.addEventListener('pointerover', event => {
  const option = event.target.closest('[data-image-style]');
  if (option && event.pointerType !== 'touch') preview(option.dataset.imageStyle);
});
picker.addEventListener('focusin', event => {
  const option = event.target.closest('[data-image-style]');
  if (option) preview(option.dataset.imageStyle);
});
picker.addEventListener('click', event => {
  const option = event.target.closest('[data-image-style]');
  if (!option) return;
  const id = getImageStyle(option.dataset.imageStyle)?.id || null;
  closeImageStylePicker();
  selectStyle(id);
});
picker.addEventListener('keydown', event => {
  const options = [...picker.querySelectorAll('[data-image-style]')];
  const index = options.indexOf(document.activeElement);
  const target = { ArrowDown: (index + 1) % options.length, ArrowUp: (index - 1 + options.length) % options.length, Home: 0, End: options.length - 1 }[event.key];
  if (target !== undefined) { event.preventDefault(); options[target].focus({ preventScroll: true }); options[target].scrollIntoView({ block: 'nearest' }); }
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeImageStylePicker(true); }
  if (event.key === 'Tab') closeImageStylePicker(true);
});
document.addEventListener('pointerdown', event => {
  if (!picker.contains(event.target) && !event.target.closest('[aria-controls="image-style-picker"]')) closeImageStylePicker();
});
document.addEventListener('focusin', event => {
  if (!picker.contains(event.target) && event.target !== trigger) closeImageStylePicker();
});
window.addEventListener('resize', position);
window.addEventListener('scroll', event => { if (!picker.contains(event.target)) position(); }, true);
window.addEventListener('blur', () => closeImageStylePicker());
window.visualViewport?.addEventListener('resize', position);
window.visualViewport?.addEventListener('scroll', position);
