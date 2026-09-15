# Muse · 审美推理与品味记忆

Muse 是面向 UI/UX、文章、演示与图像的跨媒介审美系统。
**核心哲学：美是关系的艺术。** 它由两个引擎组成：`Aesthetic Reasoning` 让 AI 能观察形式关系、提出并实现审美假设；`Taste Memory` 让人的经验、共鸣、收藏与反馈进入创作。Muse 不让 AI 冒充美的裁判，而让它成为懂关系、知进退的审美合作者。

## 5.0.0：美是关系的艺术与 UI/UX 工业级重构

- **确立全局最高哲学：美是关系的艺术**。六大元原则统领全媒介（UI/UX、文章、演示、图像）：美不是规则是关系（孤立元素无美丑）、判断先于生成、四层时空网络、生成即关系的构建、审美可学不可简化、最终目标是恰当（关系审计，去除非必要自恋装饰）。
- **UI/UX 体系脱水重构（道 · 法 · 体 · 术 · 器）**：彻底打破原本繁复冗余的八股文与形式化空转，构建从顶层哲学到生产级代码交付的现代工业级防线。
- **模式分流与量化杠杆（法）**：确立 Expressive（表达型）、Convention（效率型）、Existing（继承型）三模式分流；引入 `VARIANCE`、`MOTION`、`DENSITY` 审美三旋钮；确立 Master + Overrides 持久化范式与增量热恢复（Warm Resume）。
- **六大维度工程化深化（体）**：
  - 排版布局：反默认居中（Anti-Center）、CSS Grid 骨架、负字距收紧（Negative Tracking）、CLS 防跳跃预留。
  - 颜色体系：从具体客体推导 4–6 色具名调色板、双轨制 6:3:1 面积黄金律（Light Bento 2.0 现代浅色纸感与扩散微投影 / Dark Precision 精密微暗面板）、拒斥暗夜偷懒偏置与紫蓝霓虹（Lila Ban）、全局单色温一致性。
  - 字体设计：拒绝默认 Inter，角色化配对（Geist / Satoshi / Outfit / JetBrains Mono），严格 `max-w-[65ch]` 行长与行高阶梯。
  - 文案设计：直击结果动宾短语，消除虚伪 AI 抒情，显式 Label 绑定。
  - 动画动效：单点编排克制法则（拒绝散落淡入与卡片 Hover Spam），GPU 性能铁律（只准走 transform / opacity，严禁对 width/height 做动画），Bento 2.0 五大活体原型与物理弹簧阻尼，prefers-reduced-motion 强制一票否决降级。
  - 组件规范：完整的 7 态契约，44px 移动端触控靶心，防套娃（No Card-in-Card），移动端 `min-h-[100dvh]` 视口防崩。
- **Anti-Slop 十大工程军规（术）**：冷酷建立施工红线（全面禁用 Emoji、严禁 Lila 紫蓝发光大渐变、警惕暗夜偷懒偏置、严禁破坏键盘焦点环、严禁 Placeholder 充当唯一 Label、严禁灰底灰字低对比、严禁同视窗多个 Primary 按钮等）。
- **标准交付契约（器）**：**写代码前先立契约**。项目根目录输出/维护自包含、人类可读且供 Agent 无损复用的工业级 `DESIGN.md`（包含 ASCII 文本线框图、六大维度像素级不变量、圆角阶梯、组件 7 态矩阵与动效物理参数，严禁未锁定契约前盲目编写业务代码）。

入口：[UI/UX 方法论](references/toolkit/ui_product_tool.md)、[视觉设计判断](references/toolkit/ui_visual.md)、[成品打磨与工艺](references/toolkit/ui_craft.md)、[审美推理方法](references/aesthetic_intelligence.md)。

## 4.9.0：让 Muse 回到审美导演

- 将演示定义为观众在时间中连续经历的感知相遇，区分 speaker-led、reader-led 与 hybrid，不再把文档切页或模板填充当作演示设计。
- 新增 editable native、template adaptation、visual scene、web presentation 与 review-only 路线，按编辑性、保真度、观看条件和交付责任选择执行器。
- 建立整套运动与十一类页面职责；先记录进入／离开页面的状态、主张、证据、讲者意图和视觉职责，再决定具体版式。
- 新增 Presentation DNA：从真实参考中观察并测量构图、密度、图文比例、章节节奏、字体与来源，但不把参考、获批作品或测量值自动升级为个人偏好。
- 新增可重建 presentation spec、执行器交接和演示验收闭环，要求对账、回读、文件验证、实际渲染、整套缩览、目标尺寸复看和修正复验。
- 新增五类演示前向案例，覆盖讲述／阅读分化、参考品味边界、可编辑数据、模板保真和视觉型 keynote 路由。

演示模块不再重复教授 PPT 制作知识。它只负责发现内容、形成竞争视觉方向、选择有代价的表达，并在渲染后淘汰正确但无聊的安全答案；文件制作与格式验证交给专业演示执行器。

入口：[演示方法](references/toolkit/presentation_tool.md)、[视觉方向](references/toolkit/presentation/visual_direction.md)、[相遇与淘汰](references/toolkit/presentation/encounter_and_rejection.md)。

## 4.7.0：让 UI 方向可以安全延续与比较

- 新增 UI 目标路由：区分已有界面、新目标和空白项目，不为不存在的页面制造基线，也不为局部修改重做整个产品。
- 新增执行器无关的设计状态：保存 baseline、active direction、branches、versions、上下文清单和验收证据；跨会话恢复先校验状态与来源，再按需增量读取。
- 新增 direct edit／replace／branch 决策：结果可精确描述时直接修改，当前方向需要审美判断时精修，只有用户明确需要替代方向时才创建分支。
- 新增 UI 资产协议：区分临时参考、品牌身份、最终内容和演示占位；真实 Logo 可用时禁止无依据替代，并要求成品中实际可见。
- 新增五类前向行为案例，覆盖局部直接修改、选定方向精修、显式分支比较、上下文增量刷新与品牌 Logo 保留。

入口：[UI／UX 方法论](references/toolkit/ui_product_tool.md)、[项目上下文](references/toolkit/ui_project_context.md)、[迭代协议](references/toolkit/ui_iteration_protocol.md)、[资产协议](references/toolkit/ui_asset_protocol.md)。

## 4.6.0：把审美训练转成可执行视觉语法

- 新增完整视觉语法：把第一眼主角、阅读路径、潜在网格、受控破格、层级、留白与密度、字体、色彩面积、材质与构图组织成一套判断顺序。
- 保留明确可操作公式：6:3:1 色彩面积、网格七步法、社交封面的三类公式，以及标题行数、字数、色数和移动端阅读的起点约束。
- 新增摄影方法：曝光三角、十六类构图、九种光位、六类摄影关系、作者策略、色彩后期和成组复看。
- 将国际主义、酸性、拼贴、新丑、新中式、复古未来和材质模拟改写为“结构—情绪—用途—失效方式”，避免只识别表面。
- 扩充案例式系统推理：从可亲近符号、功能显形、低音量可信度、媒介行为、隐性价值、角色再编码、空间事件、身体姿态、信息控制、传记符号和仪式叙事提取可迁移关系。
- 强化停止条件：静需要细节与材料支撑，乱需要隐藏秩序；作品在主角、路径、张力与意义都成立时停止堆叠或删减。

入口：[视觉语法](references/visual_grammar.md)、[摄影](references/toolkit/photography_tool.md)、[案例式审美训练](references/case_based_training.md)。

## 4.5.0：从风格识别走向案例式系统推理

- 新增案例式审美训练：按表面、机制、系统、关系、情境五层阅读品牌、设计师、作品与流行风格。
- 引入去标签、换表面、换情境和系统一致性四个反事实测试，阻止把风格名、色板或装饰元素当成原因。
- 将产品逻辑、品牌分层、媒介策略和用户关系纳入参考提取；商业结果只作情境线索，不直接证明视觉因果。
- 明确跨媒介迁移保留职责与关系，当前形式必须根据任务重新生成，不建立品牌仿制包。
- 新增前向行为案例，检验 Agent 能否从流行风格参考中提取系统关系而非表面复刻。

入口：[案例式审美训练](references/case_based_training.md)、[审美推理方法](references/aesthetic_intelligence.md)、[参考提取](references/extraction.md)。

## 4.4.0：从记录感受走向可追溯学习

- system 原则可直接引用具体 `reaction@revision`，打通“真实反应 → 可迁移推断”的正式证据链，同时兼容旧 reference evidence。
- reaction 新写入记录 `occurred_at`；不知道就保存 unknown，不拿入库时间冒充发生时间。
- 矛盾改为指向另一条 reaction 版本的结构化关系，保留 conflicts／qualifies／contextualizes 及解释，不再依赖无法校验的字符串。
- 个人资产库新写入采用 `schema_version=2`；schema 1 与 4.3 过渡数据继续可读，并在下一次真实写入时透明升级。升级后不承诺旧 reader 可降级读取。
- 提取工作流统一为 reference／观察 → reaction → AI 推断 → candidate／system，原始反应不再被 candidate 替代。
- UI 将强制 Signature Move 改为可为 none 的 Distinctive Relation，允许辨识度来自密度、对齐和反馈品质，也允许成熟模式就是正确答案。
- 新增隔离前向测试协议；自动测试继续明确区分结构校验与真实 Agent 行为。

入口：[用户品味记忆](references/taste_memory.md)、[写入格式](references/asset_schema.md)、[前向测试协议](benchmarks/forward_test_protocol.md)、[UI 审美综合](references/toolkit/ui_aesthetic_synthesis.md)。

## 4.3.0：让真实反应先于品味结论

- 将 `reaction` 升级为 Taste Memory 的一等个人资产，与 reference、system、preference、application 明确分层。
- 保存反应对象、媒介与处境、用户原话、喜欢／排斥／复杂感受、强度、感受效果、解释来源、适用范围和矛盾；原因可以保持 unknown。
- reaction 可以链接个人库中某版 reference／application，也可以指向稳定 artifact；链接完整性、历史版本和批量原子写入均受校验。
- 新增按 reaction 的媒介与 valence 字面筛选；公共知识目录明确禁止个人 reaction。
- reaction 的 active 不等于 candidate 或 confirmed preference；AI 推断原因不能覆盖用户原话，单次反应不会静默升级为长期偏好。
- 4.3 当时沿用 `schema_version=1`；4.4 已用显式 schema 2 收束这一过渡状态，旧私人库仍无需单独迁移。

入口：[用户品味记忆](references/taste_memory.md)、[reaction 写入格式](references/asset_schema.md#reactiondata)、[资产库协议](references/asset_library.md)、[个人品味记录](references/memory_protocol.md)。

## 4.2.0：从内容 DNA 到自身形式

- 将 UI/UX 定义为“把人与系统的关系组织成可理解、可操作、可感受的时空体验”，串起情境、体验模型、审美综合、视觉与交互、制作、相遇和学习。
- 新增 `UI Aesthetic Synthesis`：从主角、处境、核心关系、内在张力、时间／密度、可信依据与不可替代特征提取 Content DNA。
- 用 Core Tension、Structural Hypothesis、Signature Move、Restraint Rule 和 Critical Slice 把审美方向变成可实施、可质疑、可验证的选择。
- 反同质化从换色检查扩展到归因测试、反事实替换、表层／结构／情绪三层比较和近期作品比较。
- 明确允许多种成立的美，不把极简、克制或“高级感”设为默认答案；工具界面可以因成熟模式和高效关系而保持安静。
- 新增三类 UI 前向评测，检查同内容在不同情境中的结构变化、同约束下不同内容的自身形式，以及高频工具对无意义个性的克制。

入口：[UI／UX 方法论](references/toolkit/ui_product_tool.md)、[UI 审美综合](references/toolkit/ui_aesthetic_synthesis.md)、[视觉判断](references/toolkit/ui_visual.md)、[交互与恢复](references/toolkit/ui_interaction.md)、[成品验收](references/acceptance_protocol.md)。

## 4.1.0：从“定义美”到“美如何发生”

- 核心哲学改为：美发生在作品、感知者与具体情境的相遇中，是秩序显现与超出秩序的生命力同时存在。
- `Aesthetic Intelligence` 更名为 `Aesthetic Reasoning`；AI 可以观察、推理、创作和验证形式，不能替人完成感受或宣告最终的美。
- 将审美力量、设计适切、伦理完整和个人共鸣拆开判断，避免用“美”掩盖不可用、误导或人与人之间的差异。
- 原五项标准改为审美观察维度，不再作为美的定义、总分或公式。
- Taste Memory 新增审美反应语义，保留用户原话、情境、感受、解释来源与 unknown；“说不清为什么喜欢”也是有效资料。
- 工作闭环调整为观察 → 定位 → 假设 → 组织 → 制作 → 相遇 → 学习。

入口：[审美推理方法](references/aesthetic_intelligence.md)、[用户品味记忆](references/taste_memory.md)、[成品验收](references/acceptance_protocol.md)。

## 4.0.0：审美智能与品味记忆

这一版把“两部分架构”从存储边界提升为完整产品心智：

- 用“适切、秩序、张力、共鸣、完成度”解释什么是美，避免把极简、渐变、大圆角或某种流行风格当成审美本身。
- 建立“感知 → 理解 → 立意 → 组织 → 落实 → 再感知”的 AI 审美循环，覆盖创作和评审。
- 将跨媒介共同问题统一为焦点、顺序、对比、连续与真实检验，再由 UI、文字、演示和图像适配器落实。
- 将个人资产组织成“灵感与样本 → 品味信号 → 审美系统 → 应用经验”，明确用户喜欢的对象、原因、范围、证据和置信状态。
- 个人品味学习形成“收藏 → 拆解 → 推断 → 确认 → 调用 → 复盘”闭环；收藏、AI 推断和真实应用都不会静默升级为长期偏好。
- 保留既有证据、版本、原子写入、作者声音和验收机制，但让技术结构退到品味学习心智之后。

入口：[审美智能方法](references/aesthetic_intelligence.md)、[用户品味记忆](references/taste_memory.md)、[个人资产库](references/asset_library.md)。

## 3.4.1：两部分架构与个人作者声音

Muse 明确分为两部分：AI 基础审美方法论与审美能力，以及位于 skill 外部的用户个人审美资产库。基础层不包含用户人格；作者声音画像只存于个人库，并以 `system_type: author_voice` 与普通审美系统区分。

- 一次性作者样本只服务当前任务，不自动创建个人画像。
- 用户明确要求学习、保存或后续调用时，才将样本 reference 与 author_voice system 写入个人库。
- 声音画像记录有证据的场景化选择，不自动等于 confirmed preference。
- 公共目录禁止 author_voice；旧 system 没有 system_type 时兼容为 aesthetic。

入口：[AI 文本基础审美](references/toolkit/text_narrative_tool.md)、[个人作者声音画像](references/personal_assets/author_voice_profile.md)、[个人资产库](references/asset_library.md)。

## 3.4.0：文本审美与作者声音

文本模块从“事实保真润色”扩展为完整的情境化写作系统：先区分生成、改写、检测、提取和个性化，再从文本工作、读者、内容账本、体裁关系、声音依据和验收条件形成契约。

- 写作从内容关系和段落推进开始，再处理声音、句法、节奏、词语和格式；不从禁词表开始。
- 去 AI 味只评估可定位的模板化现象，不判断作者身份，不承诺通过检测器。
- 个性化写作读取当前样本或个人库声音画像中的读者关系、判断姿态、句法节奏、具体度、标点与棱角；只迁移有证据的关系，不模仿口头禅。
- 具体表达仍受内容账本约束；素材不足时保留未知、占位或证据问题，不补造功能、数字、经历和结果。
- 文本复核覆盖内容保真、文档架构、段落负载、句法节奏、语言修辞与作者声音，并加入误伤控制：已经成立的长句、排比、专业词和破折号可以保留。
- 新增 4 个文字案例与 5 个行为任务，覆盖作者声音、证据约束、体裁差异、具体结尾、检测不改写和已成立文本少改。

入口：[文本流程](references/toolkit/text_narrative_tool.md)、[个人作者声音画像](references/personal_assets/author_voice_profile.md)、[质量复核](references/toolkit/text_quality_protocol.md)。

## 3.3.2：去预设与真实成品复核

公共层提供方法、领域知识和教学案例；个人层保存用户参考、提取的系统、使用结果和确认偏好。公共层用于训练判断，不提供可复制的页面模板、品牌仿制包、推荐色板或字体套餐。新安装无需个人积累即可设计。

- UI 按页面职责区分说服、操作、阅读和探索，同一产品可采用不同结构并保持品牌连续。
- 从内容和路径作出布局、密度、字体角色、颜色面积、图像与细节选择，形成简短且可执行的设计简报。
- 交互覆盖查找、输入、反馈、恢复和上下文保持；按任务选择状态，不套八态清单。
- 成品先观察整体，再试排真内容、操作和检查窄屏；根据具体问题迭代，有停止条件。
- 不再强制每件新作比较固定数量的方向，也不要求每个工具页创造视觉噱头。
- 公共教学系统可以只读查询，但只返回条件化原则与证据；颜色、字体和构图必须从当前内容、情境与品牌产生。用户库格式和原有个人查询保持兼容。
- UI 教学文件采用任务名称，不用品牌或流行风格命名；完整新作复核实际浏览器暴露的控件，并检查与近期作品是否重复同一构图语法。

入口：[UI／UX 流程](references/toolkit/ui_product_tool.md)、[视觉判断](references/toolkit/ui_visual.md)、[交互与恢复](references/toolkit/ui_interaction.md)、[成品打磨](references/toolkit/ui_craft.md)、[公共知识与个人资产](references/asset_library.md)。设计方法的研究来源见 [来源与取舍](references/toolkit/ui_product_tool.md#研究来源)。

## 3.2 的执行器架构

Muse 将审美决策与媒介实现分层。Muse Core 负责作品类型、内容账本、表达概念和个人偏好；领域适配器只加载当前媒介需要的能力；项目设计系统、`frontend-design`、图像模型或演示工具负责各自工艺；Judge 根据实际成品验收。

`frontend-design` 只进入 UI 适配器，不影响文字、图像和演示分支。Muse 不复制执行器的完整教程，也不把某个执行器的固定风格变成跨媒介审美。专门执行器缺失时，用宿主已有能力落实设计；只有缺少实际制作工具时才说明无法交付的部分。

## 3.0 的作品闭环

作品契约与内容账本 → 情境化表达决策 → 适合的执行器 → 实际成品 → 阻断项验收 → 独立复核。

- 先分清产品界面、营销网站、编辑阅读等作品类型，再决定布局和表达。
- 名称、数字、来源、功能、地点和判断按 provided／verified／derived／placeholder-demo／unknown 对账，避免为了完整感补造内容。
- 新 UI 可调用已有设计系统或专门前端设计 skill 落地；Muse 保留任务、事实、概念和验收责任，不复制一套固定视觉风格。
- 标题用真实文字和主要断点试排；响应式检查内容与披露连续，而非只看几何溢出。
- 动效需要实际播放并观察开始、中间和结束；代码属性不能代替感知证据。
- 未标记虚构、任务中断、语义丢失和虚假验证声明作为阻断项，不被平均分或视觉完成度抵消。

## 2.1 的资产流程

网站／图片／文章 → 实际观察与证据 → 有适用条件的审美系统 → 私有资产库 → 按任务调用 → 作品与反馈 → 修订系统或明确个人偏好。

- reference、system、preference 分层；收藏不等于喜爱，系统可用不等于长期偏好。
- 保留观察与推断的区别、来源覆盖和未知项；支持局部系统，避免伪造完整品牌规范。
- 保存和修订有校验、去重、证据版本、历史、备份和原子写入；支持查询与归档。
- 默认私有位置 ~/Documents/Muse，可由 --vault 或 MUSE_VAULT_DIR 覆盖；第一次保存时才初始化。旧版 2.0 偏好无需迁移，新增资产文件按需创建。
- 提取由宿主 Agent 和已有读取工具完成；脚本负责可靠存储及字面筛选，不冒充多模态模型或语义搜索。

## 2.0 的基础能力

- 用构图、排版、色彩、空间、图像、时间和一致性建立基础判断。
- 将风格禁令改为有目的、条件、例外、代价和验证方法的规则。
- 16 组原创教学对照，展示同一手法何时成立、何时失效；不伪称品牌官方资料或用户认可。
- 从内容关系产生概念，跨媒介保持意义和识别线索，分别适配阅读与观看条件。
- 复盘按观察、影响、原因、最小修改、复看组织，允许保留成立的设计。
- 外置偏好存储，候选与确认分离，正确序列化、去重、备份、锁与原子写入。
- 明确区分工具检查和审美评估；取消未实现的学习率、自动升级和模拟日志学习。

## 安装与使用

将完整 muse 文件夹放入宿主支持的 skills 目录。不同宿主的发现路径以其配置为准。主指令可独立阅读；使用脚本前，在 muse 目录执行：

    npm ci --ignore-scripts
    npm test

要求 Node.js 20+。依赖 YAML 解析器的版本与完整性固定在 package-lock.json；不需要 MCP 服务或网络推理 API。首次安装依赖需要访问 npm，此后本地脚本不访问网络。

示例请求：

- 用 muse 提取这个网站的审美系统，带证据和适用场景，收进我的审美资产库。
- 从我的库中找适合这份研究报告的表达方式，说明选用和调整的部分。
- 用 muse 优化这张页面，保留现有品牌与静态要求，说明最值得改的两处。
- 用 muse 评审这份报告，保留研究限定，检查层级与独立可读性。
- 用 muse 让展览海报、文章和短片共享同一个表达概念，各自适配媒介。

主入口：[SKILL.md](SKILL.md)。

## 内容导航

| 内容 | 入口 |
|---|---|
| AI 审美推理 | [aesthetic_intelligence](references/aesthetic_intelligence.md) |
| 跨媒介基础 | [foundations](references/foundations.md) |
| 案例式审美训练 | [case_based_training](references/case_based_training.md) |
| 视觉语法 | [visual_grammar](references/visual_grammar.md) |
| 摄影与写实图像 | [photography_tool](references/toolkit/photography_tool.md) |
| 用户品味记忆 | [taste_memory](references/taste_memory.md) |
| 情境与概念 | [decision_matrix](references/decision_matrix.md) |
| 作品契约与内容账本 | [artifact_contract](references/artifact_contract.md) |
| 文本创作与改写 | [text_narrative_tool](references/toolkit/text_narrative_tool.md) |
| 个人作者声音画像 | [author_voice_profile](references/personal_assets/author_voice_profile.md) |
| 文本质量复核 | [text_quality_protocol](references/toolkit/text_quality_protocol.md) |
| UI／UX 方法论 | [ui_product_tool](references/toolkit/ui_product_tool.md) |
| UI 审美综合 | [ui_aesthetic_synthesis](references/toolkit/ui_aesthetic_synthesis.md) |
| 成品验收与阻断项 | [acceptance_protocol](references/acceptance_protocol.md) |
| 创作执行架构 | [execution_architecture](references/execution_architecture.md) |
| 复盘 | [critique](references/critique.md) |
| 跨媒介 | [cross_media](references/cross_media.md) |
| 案例对照 | [exemplars](exemplars/README.md) |
| 参考提取 | [extraction](references/extraction.md) |
| 个人资产库 | [asset_library](references/asset_library.md) |
| 写入格式 | [asset_schema](references/asset_schema.md) |
| 个人偏好 | [memory_protocol](references/memory_protocol.md) |
| 验证分层 | [benchmarks](benchmarks/README.md) |

## 提示性检查

    node scripts/lint_ui.js <file-or-directory>
    node scripts/lint_text.js <file-or-directory>

返回覆盖数、提示规则和说明；0 表示检查执行完毕，1 表示运行失败，2 表示没有覆盖文件。提示不会因为居中、鲜色、长句或静态直接阻断。检查器依赖文本线索，不理解完整 CSS 级联、DOM、运行时行为或事实真伪；0 个提示也不代表美感或无障碍通过。

npm test 执行资产与链接校验、具体工具样例、颜色对比和自动化测试。行为任务需要实际产物和独立观察，脚本会明确标记未执行，不把教学样例算成审美成功率。

## 私有偏好与迁移

仓库 vault/ 是空模板，不携带作者个人偏好。首次明确需要记忆时选择技能目录外的私有位置：

    node scripts/slow_update.js --type init --vault <private-dir>

位置依次使用 --vault、MUSE_VAULT_DIR、默认 ~/Documents/Muse；已选择的自定义目录应在后续调用中持续传入。候选不自动确认；用户明确长期偏好才使用 --confirmed。例外和适用场景随记录保存，不将反馈直接改写为技能指令。详见 [偏好协议](references/memory_protocol.md)。

旧版升级：先保留旧安装中的 vault/，迁移到新的私有目录，再替换技能文件：

    node scripts/migrate_vault.js <old-vault> --output <new-private-dir>

原目录保持不变。旧偏好完整保留在 legacy_import，默认为候选；需要结合来源和当前用户意图确认。未知版本、异常 YAML 或已存在目标会阻断。备份与新文件全部校验后才发布目标目录。

    node scripts/muse_sleep.js --log <explicit-jsonl>

只提取待复核位置，不自动读取宿主日志，不自动写偏好。无日志不生成模拟数据，--apply 已移除。解析范围有限，不承诺兼容所有宿主格式。

资产记录命令与版本操作见 [资产库协议](references/asset_library.md)。提取并收藏已获授权时直接保存；临时分析不自动长期收藏。归档保留历史与备份，不代表彻底删除。

## 能力边界

Muse 不包含图像模型、代码运行时或完整应用测试环境。具体产出由宿主的工具完成。审美效果应通过同任务比较、真实渲染、操作和用户反馈验证，不能根据规则数量或测试通过率推断质量提升。

MIT License，保留原作者署名，见 [LICENSE](LICENSE)。
