import { icon } from './icons.js';
import { transitionTheme, play, selectionRect, moveSelection } from './motion.js';

const storageKey = 'muse-color-mode';
const systemMode = matchMedia('(prefers-color-scheme: dark)');
const preferences = ['light', 'dark', 'system'];
const preference = () => document.documentElement.dataset.appearance || 'system';
const resolvedMode = () => preference() === 'system' ? (systemMode.matches ? 'dark' : 'light') : preference();

export function appearanceToggle() {
  return '<button class="icon-button appearance-toggle" data-action="toggle-appearance" aria-label="切换深色模式"></button>';
}

export function appearanceSettings() {
  return `<section class="appearance-setting" aria-labelledby="appearance-label"><h3 id="appearance-label">界面外观</h3><div class="appearance-options" role="group" aria-label="选择界面外观">${[['light', 'sun', '浅色'], ['dark', 'moon', '深色'], ['system', 'monitor', '跟随系统']].map(([value, glyph, label]) => `<button class="appearance-option" data-appearance="${value}" aria-pressed="${preference() === value}">${icon(glyph)}${label}</button>`).join('')}</div><p>可手动切换，或随系统自动调整。</p></section>`;
}

// Change only appearance; leave live form values, focus, previews and chat untouched.
export function syncAppearance() {
  const mode = resolvedMode();
  document.documentElement.dataset.colorMode = mode;
  document.querySelector('meta[name="theme-color"]').content = mode === 'dark' ? '#1d1c19' : '#faf9f6';
  document.querySelectorAll('[data-appearance]').forEach(button => {
    if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.appearance === preference()));
  });
  const label = mode === 'dark' ? '切换浅色模式' : '切换深色模式';
  document.querySelectorAll('.appearance-toggle').forEach(button => {
    button.innerHTML = icon(mode === 'dark' ? 'sun' : 'moon');
    button.setAttribute('aria-label', label);
    button.title = label;
  });
}

export function setAppearance(value) {
  if (!preferences.includes(value)) return;
  const previous = selectionRect('.appearance-option[aria-pressed="true"]');
  document.documentElement.dataset.appearance = value;
  try { localStorage.setItem(storageKey, value); } catch { /* The selection still applies for this visit. */ }
  transitionTheme(() => {
    syncAppearance();
    moveSelection(previous, document.querySelector('.appearance-option[aria-pressed="true"]'));
    play(document.querySelector('.appearance-toggle .icon'), [{ opacity: .3, transform: 'rotate(-60deg) scale(.7)' }, { opacity: 1, transform: 'rotate(0) scale(1)' }], { duration: 340 });
  });
}

export function toggleAppearance() { setAppearance(resolvedMode() === 'dark' ? 'light' : 'dark'); }
systemMode.addEventListener('change', () => { if (preference() === 'system') syncAppearance(); });
window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  document.documentElement.dataset.appearance = preferences.includes(event.newValue) ? event.newValue : 'system';
  syncAppearance();
});
