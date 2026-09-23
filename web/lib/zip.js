// A small, dependency-free ZIP writer (STORE, UTF-8 names). Works offline and
// keeps already-compressed images intact. ZIP64 is deliberately unsupported.
const encoder = new TextEncoder();
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = (n >>> 1) ^ ((n & 1) ? 0xedb88320 : 0);
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255];
  return (crc ^ 0xffffffff) >>> 0;
}

export function zipFiles(files) {
  const entries = Object.entries(files);
  if (!entries.length || entries.length > 65535) throw new Error('导出文件数量超出限制。');
  const parts = [], directory = [];
  let offset = 0, directorySize = 0;
  for (const [path, content] of entries) {
    if (path.startsWith('/') || /[\\\x00-\x1f:]/.test(path) || path.split('/').some(part => !part || part === '..' || part === '.')) throw new Error('导出文件名无效。');
    const name = encoder.encode(path);
    const data = typeof content === 'string' ? encoder.encode(content) : content;
    if (!(data instanceof Uint8Array) || name.length > 65535 || offset + data.length + name.length + 30 > 0xffffffff) throw new Error('导出文件大小超出限制。');
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length), l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true);
    l.setUint16(6, 0x0800, true); l.setUint16(12, 0x21, true); // UTF-8; 1980-01-01
    l.setUint32(14, crc, true); l.setUint32(18, data.length, true); l.setUint32(22, data.length, true);
    l.setUint16(26, name.length, true); local.set(name, 30);
    parts.push(local, data);
    const central = new Uint8Array(46 + name.length), c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, offset, true); central.set(name, 46);
    directory.push(central); directorySize += central.length;
    offset += local.length + data.length;
  }
  if (offset + directorySize > 0xffffffff) throw new Error('导出文件大小超出限制。');
  const end = new Uint8Array(22), e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true);
  e.setUint32(12, directorySize, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...directory, end], { type: 'application/zip' });
}
