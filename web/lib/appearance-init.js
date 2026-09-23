// Apply before styles paint, including when browser storage is unavailable.
(() => {
  let preference = 'system';
  try { preference = localStorage.getItem('muse-color-mode') || 'system'; } catch { /* Use system appearance. */ }
  if (!['light', 'dark', 'system'].includes(preference)) preference = 'system';
  const mode = preference === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
  document.documentElement.dataset.appearance = preference;
  document.documentElement.dataset.colorMode = mode;
  document.querySelector('meta[name="theme-color"]').content = mode === 'dark' ? '#1d1c19' : '#faf9f6';
})();
