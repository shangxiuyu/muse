const focusToggle = document.querySelector('.focus-toggle');
function toggleFocus() {
  const enabled = document.body.classList.toggle('is-focused');
  focusToggle.setAttribute('aria-pressed', String(enabled));
  focusToggle.querySelector('span').textContent = enabled ? '退出专注' : '专注模式';
}
focusToggle.addEventListener('click', toggleFocus);
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  if (event.key.toLowerCase() === 'f') {
    event.preventDefault();
    toggleFocus();
  } else if (event.key === 'Escape' && document.body.classList.contains('is-focused')) {
    toggleFocus();
    focusToggle.focus();
  }
});
document.querySelectorAll('[data-section]').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('[data-section]').forEach(item => {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
    });
    link.classList.add('active');
    link.setAttribute('aria-current', 'location');
    document.getElementById(link.dataset.section).focus({ preventScroll: true });
  });
});
