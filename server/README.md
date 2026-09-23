# Muse Studio 后端

个人创作工作空间，使用 Pi SDK 0.86.1。默认仅监听 `127.0.0.1`。现有网页通过同源 API 管理作品、对话、品味和生成任务。

## 启动

需要 Node.js 22.19+，推荐 Node 24。安装依赖后运行：

```sh
npm ci --ignore-scripts
npm run dev
```

打开 http://127.0.0.1:4173。启动脚本先检查当前 Node，再检查 `MUSE_NODE_BIN` 和本机已安装的兼容运行环境；不会自动下载或修改系统 Node。`npm run preview` 只启动旧静态服务，不能生成或保存新作品。

将根目录 `.env.example` 复制为 `.env`，填写本机 DeepSeek 密钥即可：

```dotenv
DEEPSEEK_API_KEY=your-deepseek-key
```

内置按媒介选模型：界面、图片（SVG）、演示使用 `deepseek-v4-flash`，文案使用 `deepseek-v4-pro`，地址为 `https://api.deepseek.com`。按 [DeepSeek 官方更新日志](https://api-docs.deepseek.com/zh-cn/updates/)，V4 Flash 原版已下线，旧标识现转接 V4.1 Flash；V4 Pro 继续提供服务。可用 `MUSE_FLASH_MODEL`、`MUSE_TEXT_MODEL` 分别覆盖两条路线；`MUSE_MODEL` 可统一覆盖。作品记录实际请求的模型标识。

使用 Pi 自带的 DeepSeek 协议适配，明确关闭默认思考模式，避免工具调用回放缺少思考字段导致接口错误。Flash 可接收预览截图；Pro 路线仅发送文字。`MUSE_VISION=false` 可关闭截图作为模型输入；此时浏览器仍可渲染，但不能宣称模型已经看图验收。

更换服务时，显式设置 `MUSE_API`、`MUSE_BASE_URL`、`MUSE_MODEL`、`MUSE_API_KEY`。兼容协议为 `openai-completions`、`openai-responses`、`anthropic-messages`；模型必须支持工具调用。只有显式选择其他服务时才读取相应的 Anthropic / OpenAI 环境密钥，终端里已有的公司模型不会覆盖默认 DeepSeek。`MUSE_AUTH_TYPE=bearer` 适用于 Bearer 鉴权。密钥不进入网页、作品或 Pi 会话文件；修改配置后重启服务。

## 创作与工具

执行规则位于 [Agent 提示词](prompt.md)。普通问候、讨论和澄清可以只回复消息，保存对话但不创建作品版本；真正创作、修改或讨论当前作品时，调用 `get_task_context` 获取用户实际选择的父版本、参考母体和适用的已确认偏好，按需读取本仓库 Muse 规范。只启用这些自定义工具，不加载系统或项目里的其他 Pi 扩展，不向模型开放 shell 或任意文件读取。

| 工具 | 行为 |
| --- | --- |
| get_task_context | 读取当前任务的媒介、参考、所选版本、品味和对话 |
| read_muse_reference | 只读 `references/` 内的 Markdown，核对真实路径防止越界 |
| submit_artifact | 校验并暂存完整作品，完成后才写入正式版本 |
| inspect_artifact | 文案格式检查，或隔离浏览器截图；演示只查看第一页 |
| ask_clarification | 缺少必要信息时返回具体问题，不伪造作品 |
| generate_image | 配置图像模型后启用，支持新图及已保存图片的编辑 |

网页 HTML、CSS、JavaScript 分别保存，预览和导出时组装；演示为 HTML Web Deck，可逐页自定义 HTML 与讲者备注；文案为 Markdown；图片默认支持模型生成的 SVG。选中旧版本后继续修改，会记录 `parentVersionId`，旧版保留。

需要像素图片时，设置 `MUSE_IMAGE_BASE_URL`、`MUSE_IMAGE_MODEL`、`MUSE_IMAGE_API_KEY`。服务需兼容 OpenAI images generations/edits 协议，并返回 `b64_json` 图片。图像服务未配置时会明确显示 SVG 能力，不把模板或提示词当作图片。不同图像服务的参数兼容性需使用实际服务验证。

截图使用本机 Chrome 或 Playwright Chromium；可设置 `MUSE_BROWSER_EXECUTABLE`，也可执行 `npx playwright install chromium`。浏览器禁用外部网络访问，作品运行在不含同源权限的 iframe 中。截图检查不等于交互测试，`verification` 分别记录格式、渲染和交互状态。

## 保存与恢复

数据默认位于 `.muse/studio/workspace.json`，可通过 `MUSE_DATA_DIR` 改到独立的私有目录。使用临时文件加原子重命名写入；文件权限为 0600。损坏的数据会阻止启动，不会静默覆盖。备份这个目录即可保留作品与 Pi 会话；网页的工作空间导出仅包含用户可见内容，不包含内部会话。

每个工作空间最多 30 件作品、每件 20 个版本、50 条品味；同时运行两件作品，同一作品只允许一个生成任务。每次请求有幂等标识，避免网络重试导致重复生成。任务默认最多 24 轮、5 分钟，给规范读取、提交和修正预留空间；可用 `.env.example` 中的参数调整。

刷新、关闭网页或事件流断线不会中断后台任务。重连获取最新任务快照；SSE 不可用时回退轮询。取消和失败保留用户需求，不提交残缺作品。服务重启将未完成任务标为可重试的中断，已经提交的版本和会话保留。这里只恢复已完成回合，不承诺恢复进程崩溃时的半次模型调用。

第一次连接会迁移同源浏览器中的旧作品与品味，保留旧浏览器数据；迁移是原子的且只执行一次，不会在刷新时复活已删除作品。品味增删会清除旧 Pi 上下文，下一次从作品和公开对话重建，防止已删除偏好继续随历史工具结果发送。创作进行中暂不允许修改品味。

Muse skill 偏好导入遵循 `MUSE_VAULT_DIR` → `~/Documents/Muse` 的定位顺序，与工作空间存储目录 `MUSE_DATA_DIR` 分开。`GET /api/memories/location` 只返回定位信息；用户点击本机导入后，`POST /api/memories/preview` 才读取两个固定 YAML 文件，或解析用户上传的 YAML / JSON 内容。不会扫描其他目录、接受任意文件路径、读取收藏资产或调用模型。预览仅返回 confirmed 偏好和用户边界，保留 scope / because / exceptions；不完整或超过 4,000 字的条目提示跳过。文件限 256 KB，最多 10 个、500 条源记录，YAML 不允许别名或自定义标签。`POST /api/memories/import` 将选中的偏好去重后原子写入，仍受 50 条容量和创作中禁止变更的限制，同时清除旧会话上下文。解析失败、超额或保存失败均不产生部分导入，也不修改 skill 原文件。

## 边界与验证

这是个人工作空间，不包含多用户账号、数据隔离或付费系统。服务默认只接受本机 Host；远程部署可设置 `MUSE_PUBLIC_URL` 为完整站点地址，并在后端前配置带认证的 HTTPS 反向代理。后端仍只监听本机地址，代理必须保留 Host 和 Origin，不信任客户端提供的转发头。部署模板和验证步骤见 [VPS 部署](../deploy/README.md)。它不执行生成代码中的服务器命令，也不会自动安装依赖。

```sh
npm test                 # 仓库自审 + 后端回归；不调用付费模型
npm run test:backend     # 存储、取消、恢复、迁移、隔离、真实 Pi SDK + 本机模拟接口
node scripts/verify-live.mjs # 可选：调用已配置模型，产生真实用量
```

测试覆盖故障后保留输入、取消不落残缺版本、旧版修改、服务重启、SSE 重连、删除品味清理上下文、密钥不暴露，以及禁用默认高权限工具。真实模型检查使用临时工作空间，报告存入 `.test-results/live-backend.json`，不污染用户作品。
