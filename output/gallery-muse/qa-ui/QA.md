# Muse 网页标准案例独立 QA

观察环境：Chrome 153.0.8010.50，Playwright，1440×900 与 390×900。最终验收使用与产品一致的 `iframe sandbox="allow-scripts"`，等待文档 `load` / `readyState=complete` 后操作。全部使用虚构样板数据；未读取个人品味库或个人浏览器资料。

## 结果

四套案例完成 38 项主要路径检查，最终均通过；两种宽度均无页面横向溢出、无运行时脚本错误，所有 `hidden` 元素最终计算样式均为 `display:none`。这仅是下列观察范围的可用性结果，不代表完整无障碍认证或用户审美认可。

| 案例 | 实际完成的路径 | 最终桌面截图 | 最终手机截图 |
|---|---|---|---|
| 拾页 reading | 搜索命中/无结果恢复、状态筛选/选书、札记保存及跨书保留、超长错误/恢复、计时开始/暂停/重置、札记导航 | [首屏](reading/1440-reviewed-first.png) | [首屏](reading/390-reviewed-first.png)、[计时](reading/390-timer.png)、[札记](reading/390-reviewed-end.png) |
| 物候 objects | 类别筛选、规格展开/收起、加购、数量增减与总价联动、移除/空袋、Esc 关闭 | [首屏](objects/1440-reviewed-first.png) | [首屏](objects/390-reviewed-first.png)、[购物袋](objects/390-bag.png) |
| 栖迟 retreat | 房型按钮与方向键、图景与房型信息联动、到访准备展开/收起、空日期/非法日期错误与恢复、生成意向、复制或明确降级、清空 | [首屏](retreat/1440-reviewed-first.png) | [首屏](retreat/390-reviewed-first.png)、[房型](retreat/390-room.png)、[意向](retreat/390-intent.png) |
| 场间 festival | 日期/类别双筛选、无结果恢复、介绍展开/收起、加入/移除观展单、载入冲突示例、清空 | [首屏](festival/1440-reviewed-first.png) | [首屏](festival/390-reviewed-first.png)、[冲突提醒](festival/390-conflict.png) |

## 发现并修复的阻断问题

- reading：手机抽屉继承桌面 `top:84px`，收起仍遮住札记保存按钮；重置移动定位、移除手机抽屉内重复且裁切的装饰书封。正文和作者信息保留。
- reading：侧栏札记按钮无行为；实现正文/札记导航，移除未实现的书摘入口。
- reading / retreat：产品沙箱不允许原生表单提交，保存札记与生成行程按钮改为普通按钮 click；日期输入保留 Enter 操作。
- objects：购物袋已加入商品仍显示空袋提示，因 `display:flex` 覆盖 `hidden`；补显式隐藏规则。
- retreat：对 SVG `g` 设置 `.hidden` 属性未改变显示状态；改用真实 `hidden` 属性并增加隐藏样式，使谷侧/林侧图景真正切换。
- reading / objects / retreat：补 `[hidden]` 的显式样式，防止控件和反馈状态被 flex/grid 布局覆盖。

objects 最终验收基于另一路 Muse 生成的首屏修订，保留该修订来源与说明，再追加本次空袋修复。四套最终 HTML 均未发现 `styles.css` / `style.css` / `app.js` 外链占位引用。

原始 `artifact.json` 和 `provenance.json` 未由本次 QA 修改。reading、objects、retreat 的修订保存为各目录 `reviewed-artifact.json`，原始/修订精确 SHA-256 及变化写在 `review.json`。festival 未发现需修改的阻断问题，继续使用原始产物。最终截图绑定的指纹见 [final-capture.json](final-capture.json)。

## 视觉观察与边界

审美假设的形式证据：拾页的纸面阅读区与深色工作台形成任务焦点；物候的器物侧视/口沿图与尺寸信息构成商品目录关系；栖迟的宽景与窄屏分段保留同一旅宿叙事；场间的序号、场次行与冲突红线形成排程语言。四套并排在表层、结构与情绪上可区分，未把换色当成唯一差异。

伦理完整：页面均可见概念/虚构性质，意向/购物袋/观展单未执行真实提交、支付或报名。手机页尾披露实际检查可读。

个人共鸣：无用户实际反应，本次不作推断。未验证：200% 文字缩放、真实手机手势/键盘、完整屏幕阅读器路径、系统剪贴板实际写入、长时间计时准确度。11–11.5px 辅助标签已复看，不承担唯一主要动作；reading 装饰书封的 9.5px 小字在正文标题区有等价概念说明。

机器观察记录：[最终路径检查](interactions.json)，[objects 新首屏复测](objects-interactions.json)，[原始首次路径检查](original-interactions.json)。原始路径记录里的 retreat 到访准备/示例恢复失败经复核是检查脚本假定错误（首项初始已展开、示例按钮生成后正常隐藏），并非产品缺陷；最终检查已按真实状态路径纠正。
