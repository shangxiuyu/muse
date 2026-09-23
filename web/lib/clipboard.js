// navigator.clipboard 仅在安全上下文可用，IP 直连的 HTTP 部署会拿到 undefined。
export async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-1000px';
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } finally { area.remove(); }
  if (!copied) throw new Error('浏览器未允许复制。');
}
