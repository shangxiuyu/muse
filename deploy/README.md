# VPS 部署

本目录为 Linux + systemd + Nginx 的个人工作空间部署模板。实际执行前检查服务器系统、Node 路径、现有网站、端口、证书和域名解析，再填写模板。尚未连接目标服务器时，这些文件不代表已上线。

## 运行方式

后端始终监听 `127.0.0.1:4173`。Nginx 提供 HTTPS 和访问密码，保留原始 Host、Origin 和 Sec-Fetch-Site，后端使用 `MUSE_PUBLIC_URL=https://你的域名` 校验访问来源。不要通过清空 Origin、放开所有 Host 或开放 4173 公网端口来绕过检查。

这是一个共享工作空间，访问密码不是多用户账号系统。拥有该密码的人可以看到和修改同一份作品、对话和品味，并使用服务器配置的模型额度。无域名时可以先通过 SSH 隧道私有访问，无需设置 `MUSE_PUBLIC_URL` 或开放公网网页端口：

```sh
ssh -N -L 4173:127.0.0.1:4173 用户名@服务器地址
```

随后访问 `http://127.0.0.1:4173`。不要在明文公网 HTTP 上使用访问密码。

## 目录和安装

- `/opt/muse/releases/<版本>/`：代码及该版本依赖，归 root 所有，服务用户只读。
- `/opt/muse/current`：指向当前版本的符号链接。
- `/etc/muse/muse.env`：模型密钥、`MUSE_PUBLIC_URL` 等设置，权限 0600，归 root 所有，由 systemd 读取。
- `/var/lib/muse/studio/`：持久作品与会话，归专用的 `muse` 用户所有。
- `/var/lib/muse/vault/`：服务器上的品味导入文件目录，不会自动读取本机电脑文件。
- `/opt/muse/browsers/`：供服务用户读取的 Playwright 浏览器。

使用 Node.js 22.19+，推荐 Node 24；先核实路径，再调整 [服务模板](muse.service) 的 ExecStart。创建专用的无登录权限 `muse` 用户。代码目录需包含 `package.json`、`package-lock.json`、`server/`、`web/`、`references/`、`SKILL.md`；不要上传本机 `node_modules/`、缓存或测试输出。在服务器代码目录安装依赖与浏览器：

```sh
npm ci --omit=dev --ignore-scripts
PLAYWRIGHT_BROWSERS_PATH=/opt/muse/browsers npx --no-install playwright install --with-deps chromium
```

浏览器安装命令需在受 Playwright 支持的 Linux 发行版上运行。安装后以 `muse` 身份测试截图，保留 Chromium 沙箱；如果系统限制用户命名空间，先查明兼容方式，不能靠关闭沙箱完成部署。

模型密钥单独通过 SSH 传输并保存到私有配置目录，不进入发行包或网页。环境文件还可指定 `PORT=4173` 和模型参数。模板固定数据目录，不把本机 `.env` 中的 macOS 路径搬到 Linux。本机历史作品可在停止写入后单独迁移；更新代码时不覆盖服务器工作空间。

## 上线和验证

1. 上传新版本，安装依赖，使用独立临时数据目录验证后端启动。
2. 安装服务模板，准备环境文件，启动服务并查询本机 `/api/status`。
3. 为真实域名配置证书和访问密码，按 [Nginx 模板](nginx.conf.template) 新增站点。保留已有站点。运行 `nginx -t` 成功后才重载。
4. 阿里云安全组和主机防火墙只需放行实际使用的 SSH、80、443 端口。证书申请前先确认域名已指向服务器；不要更改现有 SSH 规则。
5. 验证未登录访问得到 401、登录后页面和接口可用，跨站写入得到 403；验证创建与保存、流式回复、截图，以及重启后数据仍在。模型生成测试会使用实际额度。
6. 更新前保存当前代码链接、站点配置和工作空间备份；失败时恢复原版本和配置。不要直接删除新版本或覆盖备份。

服务器上的 `systemctl status muse` 和 `journalctl -u muse` 可查询运行状态；模板已设置故障自动重启。证书续期方式应随目标服务器现有证书管理方案配置，并验证续期。
