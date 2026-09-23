import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const hash = raw => createHash('sha256').update(raw).digest('hex');
for (const id of ['slow', 'form']) {
  const folder = new URL(`../${id}/`, import.meta.url);
  const original = await readFile(new URL('artifact.json', folder), 'utf8');
  const artifact = JSON.parse(original);
  artifact.html = artifact.html.replace(/<link\b[^>]*href=["'](?:\.\/)?styles?\.css["'][^>]*>/gi, '').replace(/<script\b[^>]*src=["'](?:\.\/)?app\.js["'][^>]*>\s*<\/script>/gi, '');
  artifact.css += '\n/* Keep filtered and collapsed content hidden when component display rules apply. */\n[hidden] { display: none !important; }\n';
  const changes = ['移除已由 css/js 字段提供的本地资源占位引用，保持预览与单文件导出自包含。', '显式保留 hidden 语义，避免组件 display 规则让筛选结果与折叠内容仍然可见。'];
  if (id === 'form') {
    artifact.html = artifact.html.replace('type="submit">发出合作意向', 'type="button" id="enquiry-submit">整理合作意向').replace('这是概念样板表单，提交不会真的发出邮件。', '仅在本页整理意向，不会发送邮件。');
    artifact.js = artifact.js.replace("form.addEventListener('submit', function (e)", "document.getElementById('enquiry-submit').addEventListener('click', function (e)")
      .replace("'已收到（概念样板，不会真的发出）：'", "'已在本页整理合作意向：'")
      .replace('form.name.value.trim()', "form.elements.namedItem('name').value.trim()")
      .replace("'，我们会在两个工作日内回复 ' + form.mail.value.trim() + '。'", "' / ' + form.elements.namedItem('mail').value.trim() + '。未发送邮件。'");
    artifact.js += "\ndocument.getElementById('enquiry').addEventListener('keydown', function(e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); document.getElementById('enquiry-submit').click(); } });\n";
    changes.push('合作表单改用本地按钮事件及输入框 Enter 操作，兼容产品隔离预览；修复 name 字段与表单原生属性冲突；完成反馈明确未发送，不承诺真实回复。');
  } else {
    artifact.html = artifact.html.replace('type="submit" id="signup-submit"', 'type="button" id="signup-submit"').replace('下一封季候信会在换季那一周寄出。这个示意页面不会真的发送邮件。', '这是本页的订阅演示，未保存邮箱，也不会发送邮件。');
    artifact.js = artifact.js.replace("form.addEventListener('submit', function (event)", "submit.addEventListener('click', function (event)");
    artifact.js += "\ndocument.getElementById('email').addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('signup-submit').click(); } });\n";
    changes.push('订阅演示改用本地按钮事件与 Enter，兼容隔离预览；完成反馈明确不会保存或发送邮件。');
  }
  const raw = JSON.stringify(artifact, null, 2) + '\n';
  await writeFile(new URL('reviewed-artifact.json', folder), raw);
  await writeFile(new URL('review.json', folder), JSON.stringify({ originalArtifactSha256: hash(original), artifactSha256: hash(raw), changes, reviewer: 'Codex / independent QA' }, null, 2) + '\n');
  console.log(`${id}: 已记录独立验收修订`);
}
