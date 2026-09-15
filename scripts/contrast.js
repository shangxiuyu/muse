'use strict';
function luminance(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Expected six-digit opaque hex color: ' + hex);
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels.reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const l = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (l[1] + 0.05) / (l[0] + 0.05);
}
module.exports = { contrast };
