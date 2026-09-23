import { icon } from './icons.js';
import { escapeHtml as esc } from './data.js';

const repository = 'https://github.com/shangxiuyu/muse';
const agents = [
  { id: 'codex', name: 'Codex' },
  { id: 'claude-code', name: 'Claude Code' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'antigravity', name: 'Antigravity' },
  { id: 'windsurf', name: 'Windsurf' },
  { id: 'other', name: '其他 AI' },
];
let selectedAgent = agents[0];

function installCommand() {
  // Keep the CLI interactive so the user can choose their actual tool.
  if (selectedAgent.id === 'other') return `npx --yes skills add ${repository} --skill muse --global`;
  return `npx --yes skills add ${repository} --skill muse --agent ${selectedAgent.id} --global --yes`;
}

function installScope() {
  return selectedAgent.id === 'other' ? '全局安装 · 运行时选择工具' : '全局安装 · 所有项目可用';
}

function installRequirements() {
  return selectedAgent.id === 'other'
    ? '电脑需已安装 Node.js 和 Git。运行后按提示选择工具；如果列表中没有你的工具，可让 AI 帮你确认安装方式。'
    : '电脑需已安装 Node.js 和 Git。复制后，粘贴到终端并运行。';
}

function installPrompt(command) {
  if (selectedAgent.id === 'other') {
    return `请帮我将 Muse skill 安装到当前使用的 AI 工具。来源：${repository}。请先确认当前工具是否支持 Skill，以及它的安装目录或导入方式；不要猜测工具名称或安装到其他工具的目录。如果已有 Muse，请保留本地修改与品味记忆，不要直接覆盖。\n\n如果当前工具受 Skills CLI 支持，先检查 Node.js 和 Git，再参考以下交互式命令，按提示选择正确的目标工具：\n\n${command}\n\n如果工具不在列表中，请按该工具的官方 Skill 导入方式处理。如果不支持 Skill 安装，请明确说明，并指导我如何将 Muse 规范作为参考使用，不要声称已经安装。最后检查结果并告诉我下一步；需要我选择工具、补充依赖或授予权限时，请说明。`;
  }
  return `请帮我把 Muse skill 安装到 ${selectedAgent.name}，供所有项目使用。来源：${repository}。请先检查 Node.js 和 Git 是否可用；如果已有 Muse，请先检查现有安装，保留本地修改与品味记忆，不要直接覆盖。确认可以安装后运行以下命令，并检查安装结果：\n\n${command}\n\n最后告诉我如何在新对话中使用 Muse。如果缺少依赖或需要权限，请说明下一步。`;
}

// Older browsers and HTTP deployments may not expose the Clipboard API.
async function copyText(text, field) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (!field.isConnected) return false;
    field.parentElement.hidden = false;
    field.value = text;
    field.focus();
    field.select();
    try { return document.execCommand('copy'); }
    catch { return false; }
  }
}

export function openSkillInstall({ dialog, showDialog }) {
  showDialog('安装 Muse Skill', `
    <div class="skill-install-intro"><span class="skill-install-symbol">${icon('download')}</span><div><h3>把 Muse 带到你熟悉的工具里。</h3><p>用 Muse 创作网页、文案、演示和图片。</p></div></div>
    <fieldset class="skill-agent-picker"><legend>选择你的 AI 工具</legend><div class="skill-agent-options">${agents.map(agent => `<label class="skill-agent-option"><input type="radio" name="skill-agent" value="${agent.id}" ${agent.id === selectedAgent.id ? 'checked' : ''}><span>${esc(agent.name)}</span></label>`).join('')}</div></fieldset>
    <div class="skill-install-instructions">
      <div class="skill-command-label"><label for="skill-install-command">在终端中运行</label><span data-skill-scope>${installScope()}</span></div>
      <textarea id="skill-install-command" class="skill-install-command" rows="3" readonly spellcheck="false" aria-describedby="skill-install-requirements">${esc(installCommand())}</textarea>
      <p id="skill-install-requirements" class="skill-install-note">${installRequirements()}</p>
      <div class="skill-install-actions"><button type="button" class="primary-button" data-skill-copy="command">${icon('copy')}<span>复制安装命令</span></button><button type="button" class="text-button" data-skill-copy="prompt">让 AI 帮你安装 ${icon('upRight')}</button></div>
      <div class="skill-install-feedback" role="status" aria-live="polite" aria-atomic="true"></div>
      <div class="skill-install-manual" hidden><label for="skill-install-manual">请手动复制以下内容</label><textarea id="skill-install-manual" rows="5" readonly spellcheck="false"></textarea></div>
    </div>
    <div class="skill-install-next"><span>${icon('check')}</span><div><strong>安装后，开启一段新对话</strong><p>试着说：「请使用 Muse，帮我做一个个人主页。」</p></div></div>
    <a class="skill-source-link" href="${repository}" target="_blank" rel="noopener noreferrer">查看 Muse 开源项目 ${icon('upRight')}</a>
  `, '', 'skill-install-dialog');

  const panel = dialog.querySelector('.dialog-body');
  const commandField = panel.querySelector('#skill-install-command');
  const status = panel.querySelector('.skill-install-feedback');
  const manual = panel.querySelector('.skill-install-manual');
  const manualField = manual.querySelector('textarea');
  const buttons = [...panel.querySelectorAll('[data-skill-copy]')];

  panel.addEventListener('change', event => {
    if (event.target.name !== 'skill-agent') return;
    selectedAgent = agents.find(agent => agent.id === event.target.value) || agents[0];
    commandField.value = installCommand();
    panel.querySelector('[data-skill-scope]').textContent = installScope();
    panel.querySelector('#skill-install-requirements').textContent = installRequirements();
    status.textContent = '';
    status.classList.remove('copy-error');
    manual.hidden = true;
  });

  panel.addEventListener('click', async event => {
    const button = event.target.closest('[data-skill-copy]');
    if (!button || button.disabled) return;
    const command = commandField.value;
    const forAI = button.dataset.skillCopy === 'prompt';
    const text = forAI ? installPrompt(command) : command;
    status.textContent = '正在复制…';
    status.classList.remove('copy-error');
    buttons.forEach(item => { item.disabled = true; });

    // Keep the fallback inside the modal, where focus and text selection work.
    manualField.value = text;
    const copied = await copyText(text, manualField);
    buttons.forEach(item => { item.disabled = false; });
    if (!panel.isConnected || !dialog.open || commandField.value !== command) {
      manual.hidden = true;
      return;
    }
    manual.hidden = copied;
    status.classList.toggle('copy-error', !copied);
    if (!copied) status.textContent = '浏览器未允许自动复制，请选中下方内容手动复制。';
    else if (forAI) status.textContent = selectedAgent.id === 'other'
      ? '安装请求已复制，粘贴到你使用的 AI 工具中，先确认是否支持。'
      : `安装请求已复制，粘贴到 ${selectedAgent.name} 的对话中即可。`;
    else status.textContent = selectedAgent.id === 'other'
      ? '命令已复制，粘贴到终端运行，再按提示选择你的 AI 工具。'
      : '命令已复制，粘贴到终端运行后才会安装。';
    if (copied) button.focus({ preventScroll: true });
    else { manualField.focus(); manualField.select(); }
  });
}
