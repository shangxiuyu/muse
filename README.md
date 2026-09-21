<p align="center">
  <h1 align="center">🎨 Muse · 跨媒介审美推理与品味记忆</h1>
  <p align="center">
    <strong>An aesthetic reasoning layer and taste memory for AI agents</strong>
  </p>
  <p align="center">
    告别千篇一律的 AI 塑料味 · 赋予智能体跨媒介审美推理、形式判断与专属品味演进能力
  </p>
  <p align="center">
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License"></a>
    <a href="SKILL.md"><img src="https://img.shields.io/badge/Version-v6.0.0-emerald.svg?style=flat-square" alt="Version"></a>
    <a href="references/archetypes.md"><img src="https://img.shields.io/badge/Archetypes-10%20Unified%20Styles-purple.svg?style=flat-square" alt="Archetypes"></a>
    <a href="references/cross_media.md"><img src="https://img.shields.io/badge/Coverage-UI%20%7C%20Writing%20%7C%20Deck%20%7C%20Image%20%7C%20Prompt-orange.svg?style=flat-square" alt="Media Coverage"></a>
    <a href="references/taste_memory.md"><img src="https://img.shields.io/badge/Memory-Taste%20Vault%20v2-pink.svg?style=flat-square" alt="Taste Vault"></a>
  </p>
</p>

---

## 📖 核心哲学：美是关系的艺术

大多数 AI 生成内容之所以带着强烈的**「AI 塑料感」**：满屏紫色渐变、无脑大圆角卡片堆叠、机械居中标题、公文式排比句、没有重力的漂浮光斑。原因是模型在孤立地拼凑符号。

**Muse 的第一性原理：美不是规则，而是关系的艺术。**

- **孤立元素无所谓美丑**：色彩、间距、字体、动效单独存在时没有优劣；只有当它们与具体情境、受众心智和深层内容达成恰当共振时，美才会发生。
- **判断先于生成**：在敲下第一行代码、落笔第一段文字前，先完成情境解构，确立设计契约。
- **跨端同构，自适应推断**：美学母体是**表层**语言的唯一真实源，由设计系统深层语言推导全端形态，不把移动端降级成「缩小版网页」。**注意这是表层范畴**——版式结构另按内容推导，见下文〈10 大母体库〉的边界说明。
- **最终目标是「恰当」，不是「惊艳」**。

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              MUSE 双引擎运转拓扑                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  [输入: 业务目标 / 真实内容 / 用户参考]                                        │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────┐         ┌────────────────────────────────┐  │
│  │ Engine 1: Aesthetic Reason  │ ◄───────┤ Engine 2: Taste Memory Vault   │  │
│  │ · 情境与内容 DNA 探针        │         │ · 反应解构 (Reaction)          │  │
│  │ · 10 大美学母体与自适应推断  │         │ · 私有偏好 (personal_dna)      │  │
│  │ · 底线检查与例外声明         │         │ · 个人声音 (Author Voice)      │  │
│  └──────────────┬──────────────┘         └────────────────────────────────┘  │
│                 │                                                            │
│                 ▼                                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                     五大媒介交付契约 (Contract First)                   │  │
│  │ UI: DESIGN.md │ 写作: WRITING.md │ 演说: PPT.md │ 视觉: IMAGE.md │ 规约: PROMPT.md │
│  └──────────────┬─────────────────────────────────────────────────────────┘  │
│                 │                                                            │
│                 ▼                                                            │
│  [成品交付: 拒绝平庸模版 · 具有生命张力与秩序感的高水准作品]                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🆕 6.0 改了什么

6.0 是一次**诚实性重构**，不是功能堆叠。评估 5.x 时发现的四类问题：

| 问题 | 5.x 的状况 | 6.0 的做法 |
|---|---|---|
| **规则与资产互相打架** | 底线写「绝对封杀纯黑」，自己的母体却在正当使用纯黑；7/10 母体代码违反自家军规 | 底线改为**默认值 + 显式声明的例外**；违规已修，正当偏离以带理由的声明保留并公开列出 |
| **承诺的工具不存在** | 正文引用 `lint_ui.js`、`asset_library.js`、`eval_skill.js` 等 7 个脚本，一个都没有 | 真正实现 4 个脚本，并把做不到的部分写清楚；删掉做不到的承诺 |
| **资产无法自证** | 10 个母体里有 3 个引用未定义 CSS 变量（复制即失效）；公共案例指向从未发布的 `exemplars/` 文件 | 全部修复；公共案例改为自包含可核验；新增 `audit.js` 让技能能审计自己 |
| **同一仓库两份分叉** | `.agents/skills/muse` 标 5.0.0、`muse skill/` 标 5.1.0，内容与版本号相反，UI 入口指向不同文件 | 统一到 6.0.0 单一入口；重复的「全能实战手册」标注为已被取代，不再路由 |

数字上的变化：技能自审从 **253 error / 91 warning** 降到 **0 error**。

**验证方式**：不是靠通读，而是先写工具再修资产。`audit.js` 的十项检查逐条机械核对；10 个母体的合规性由 `rules.js` 判定；`lint_text.js` 用技能自己的 ❌ / ✅ 范例**双向**验证规则——既要抓得住反例（23/23），也不许误伤正例（23/23），单向验证会放过「正则与自己的文档打架」这类缺陷；最后用无头 Chrome 把 5 个母体渲染成同骨架的中文界面实际比对——母体区分度与中文排版缺陷都是在这一步才看见的。

> ⚠️ 6.0 采用**默认 + 声明**机制，是因为绝对律一定会被违反——不是被恶意绕过，而是因为真实的审美选择有时就是要用纯黑、就是要用 emoji。把规则写成绝对禁令，结果是规则失去可信度。允许偏离但要求它可见，是更诚实也更可持续的做法。

---

## 🏛️ 10 大全端同构视觉母体库

> **母体是表层系统，不是完整设计系统。** 实测统计：全库关于表层（色彩/材质/阴影/圆角/字体）与关于结构（栅格/对齐/版式/节奏）的描述之比约 **5 : 1**；「破框溢出卡片」被 6/10 个母体当招牌，「终端控制台窗口」8/10。
>
> 也就是说，**十个母体给的是十套皮肤，不是十套版式**。套上母体你得到色温、材质、圆角、阴影与字体气质；信息怎么组织，母体不负责——必须与[视觉语法](references/visual_grammar.md)、[跨媒介基础](references/foundations.md) 配对使用。母体的代码骨架是**手法示范**，不是可直接落地的页面方案。

覆盖现代数字产品、前沿科技与生活方式的 10 套美学母体。每个母体含场景指南、精确 Design Tokens、专属排版手艺与片段式代码骨架。

| 美学母体 | 核心隐喻与视觉基因 | 适用场景与行业标杆 |
| :--- | :--- | :--- |
| **Playful Stationery**<br>*(复古文具手账流)* | 暖米白棉纸 + 常春藤墨绿 + 荧光便利贴黄 + 撕纸虚线与手绘批注 | 知识管理、创意工具、生活记录<br>*标杆: SayBriefly, Pitch, PostHog* |
| **Enterprise Narrative**<br>*(现代企业工装流)* | 工业严谨 + 青瓷水蓝与暖珊瑚橙 + 破框溢出数据卡 + 刷漆动效 | 开发者平台、企业级 SaaS、基建产品<br>*标杆: Allwhere, Stripe, HashiCorp* |
| **Soft Neo-Brutalism**<br>*(温和新粗野美式工装)* | 奶麦黄温润底 + 深常春藤墨绿骨架 + 偏置实心硬阴影 + 软萌圆角 | 独立创作者、D2C 品牌、年轻化社区<br>*标杆: Textla, Gumroad* |
| **Writer's Atelier**<br>*(作家案头与卡片工坊)* | 暖燕麦纸感 + 纯白物理索引卡 + 昼夜打字机 + 1px 出版细线 + 边注卡 | 深度阅读、长文写作、知识卡片库<br>*标杆: Lex, Craft, iA Writer, Bear* |
| **Creator-Friendly**<br>*(创客经济高亲和流)* | 加那利金黄活力 + 暖燕麦柔底 + 超大浮岛卡片 + 全胶囊控件 | 创作者赞助、粉丝社群、众筹展示<br>*标杆: Buy Me a Coffee, Ko-fi* |
| **Tech Flagship Dark**<br>*(科技旗舰品牌官网)* | 午夜深海深蓝底 + 电光赛车蓝高光 + 浮空拟真操作舱 + 1px 晶体发光微边框 | 极客工具、AI 原生产品、云原生旗舰<br>*标杆: Checkly, Vercel, Nothing* |
| **Neo-Bauhaus Pastel**<br>*(新包豪斯几何与弥散)* | 几何积木画框 + 柔雾粉蓝弥散 / 象牙米底 + 2.5D 等轴测流程图 | 创意工作室、设计协同、创新架构<br>*标杆: Boords, Switchboard* |
| **Neo-Brutalist Engineering**<br>*(新粗野工程蓝图与极客工坊)* | 坐标纸网格底盘 + 炭墨 2px 实心硬线 + 全大写等宽技术排版 + 实体按键位移 | 数据库、DevOps 平台、极客工坊<br>*标杆: MotherDuck, Railway, DuckDB* |
| **Institutional DeFi Dark**<br>*(暗夜机构级金融与流动性)* | 深海蓝黑底盘 + 同心圆轨道光轨 + 电光青绿高流动性指示 + 亚克力微光悬浮 | 机构级资管、DeFi 协议、算法交易<br>*标杆: Idle Finance, Aave, Morpho* |
| **Wireframe Architect Grid**<br>*(线框架构师与赛博工坊)* | 3D 等轴测立方体 + 电光粉/天蓝透视网格地板 + 纯黑白瑞士排印 | 设计系统构建、低代码平台、白板工具<br>*标杆: Relume, Figma, Builder.io* |

> [!TIP]
> 跨端自适应推断协议与完整推导矩阵见[视觉母体库](references/archetypes.md)。**母体是起点不是终点**：它的价值在于提供一套被验证过的关系，而不是让你换色交差。若一个任务用了母体却说不清它支持了什么内容关系，按[案例式审美训练](references/case_based_training.md)的五层阅读重新推导。

---

## ⚡ 四大媒介与契约体系

**落笔先立契。** 交付形态严格分流：

### 1. 💻 UI / UX 界面与交互前端
- **契约先行**：先交付 `DESIGN.md`，锁定任务、假设、系统、结构、对象、运动与验收。
- **物理形态**：强制模块解耦 —— `index.html`（纯净语义骨架）+ `index.css`（Tokens 与样式）+ `app.js`（业务与交互）。**单文件形态只留给演示文稿。**
- **入口**：[UI 适配器](references/toolkit/ui_adapter.md) · [美学文法](references/toolkit/ui_grammar.md) · [视线心流](references/toolkit/ui_interaction_flow.md) · [创新算子](references/toolkit/ui_innovation.md) · [组件范式示范](references/toolkit/ui_creative_arsenal.md) · [负向底线](references/toolkit/ui_floors.md)

### 2. ✍️ 文本：先立判断，再去味
- **契约先行**：先输出 `WRITING.md`——受众心智、**核心判断**、叙事动线、文风基调、事实账本。**核心判断必须是一句能被反驳的话**；没有人会反对它，它就是话题不是判断，作品会正确而空洞。
- **内容层验收**：〈可反驳测试〉查空洞；〈删题测试〉查判断有没有进入结构——把核心判断那一句删掉，中段若仍各自成立，说明它只是被贴了两次。
- **两种体裁，两套判据**：散文（给人读）走四大深层架构 + 24 种微创去油；**规约型文本**（系统提示词 / agent 指令 / SOP）走 [PROMPT.md](PROMPT.md) 契约，验收标准是**行为可检验**——每条规则都要能构造出「这样做就违规」的反例场景，构造不出的判为空洞。
- **24 种微创去油手术**：粉碎 AI 腔调，`lint_text.js` 逐条核对。规约文件用 `<!-- muse:genre spec -->` 自述体裁，检查器即切换到规约口径。
- **入口**：[文本内容实战手册](references/toolkit/text_narrative_tool.md) · [文本质量复核](references/toolkit/text_quality_protocol.md) · [作者声音画像](references/personal_assets/author_voice_profile.md) · [PROMPT.md 范例](PROMPT.md)

### 3. 📊 演示文稿与现场演说
- **契约先行**：先确立 `PPT.md`，锁定主讲场景探针与「屏人二重奏」账本（投影幕只放证据与情绪，台词在演讲者嘴里）。
- **Theme Rhythm 呼吸节律**：明暗冷暖交替（Light Setup 铺垫 → Dark Focus 顿悟点题 → Split Proof 深度论证）。
- **单文件 Web Deck**：原生可全屏、带快捷键与动效。
- **入口**：[演示与演说实战手册](references/toolkit/presentation_tool.md) · [演示视觉方向](references/toolkit/presentation/visual_direction.md) · [演示表层流派](references/toolkit/presentation/archetypes.md)（**表层系统，不给版式**，须与[视觉语法](references/visual_grammar.md)配对） · [相遇与淘汰](references/toolkit/presentation/encounter_and_rejection.md)

### 4. 🎨 概念视觉生图与艺术指导
- **契约先行**：`IMAGE.md` 集中管理全部图片资产，建立逐图意象账本与留白安全区。
- **物理真实法则**：拒绝无理由漂浮，必须具备落地重力、单一物理主光源（色温自洽）、真实微质感。
- **结构化 Prompt**：输出「主体 + 构图画幅 + 物理光照 + 胶片材质 + 负向排除」全量提示词。
- **入口**：[图像生成实战手册](references/toolkit/image_visual_tool.md) · [专业摄影与布光](references/toolkit/photography_tool.md) · [视觉语法](references/visual_grammar.md)

---

## 🚫 底线与例外

底线的作用是挡住**无意的** AI 塑料味，不是禁止有意的形式选择。完整清单见[负向底线](references/toolkit/ui_floors.md)。

```
                    AI 塑料味                       MUSE 的替代做法
   ┌──────────────────────────────────────────┬──────────────────────────────────────────┐
   │ 🟣 大面积饱和紫色渐变发光                 │ 🎨 从真实客体推导 4–6 色具名温润调色板      │
   │ 📦 无脑大圆角把内容包成 Card 堆叠          │ 📐 负空间呼吸、1px 物理细线、无框非对称排版 │
   │ 🔲 默认机械居中、字间距松散平庸            │ 🔠 负字距收紧、左对齐力场、明确入口         │
   │ 🤖 机械排比句、无信息量的公文抒情          │ ✍️ 具象名词驱动、动宾直击痛点、短句给断言   │
   │ 📄 幻灯片把整段话搬上屏幕让人读            │ 🎯 屏人二重奏：单页单焦点、巨幅关键指标     │
   │ 🪄 视觉图逻辑漂浮光斑与油腻塑料质感        │ 💡 单一真实主光源、微观纤维漫反射真实质感   │
   └──────────────────────────────────────────┴──────────────────────────────────────────┘
```

**偏离底线的两种正当做法**：改掉，或者**声明**。当纯黑、emoji、非模度数值确实是该作品的形式语言时，在文件顶部留下带理由的可见声明：

```
<!-- muse:allow pure-black: 瑞士黑白排印以纯黑为骨架色，这是本母体的形式语言 -->
```

声明会由 `lint_ui.js` 与 `audit.js` 原样列出。**偏离被允许，但不被隐藏** —— 这是它和「无视规则」的唯一区别。事实真实性、来源、无障碍底线（对比度、焦点环、触控靶区）**不可声明**。

---

## 🚀 极速上手

### 安装

**Antigravity IDE**：把 `muse/` 放进工作区 `.agents/skills/muse/`，或全局 `~/.gemini/antigravity-ide/builtin/skills/`。
**Claude Code**：`git clone <repo> ~/.claude/skills/muse`（注意项目级是 `.claude/skills/`，不是 `.agents/skills/`）。
**Cursor / Windsurf**：在 `.cursorrules` 中写「遵循 Muse 审美规范（参考 skills/muse/SKILL.md）。开发前必须先输出 DESIGN.md / WRITING.md 契约。」

### 常用 Prompt 示例

- **立项全新 UI**
  > “我想做一款注重安静心流的 Markdown 笔记应用，请调用 Muse，锚定最契合的美学母体，先输出一份 `DESIGN.md` 设计契约。”
- **深度写作与去 AI 味**
  > “帮我写一篇《大模型时代的个人开发者出路》的随笔，先在 `WRITING.md` 中拆解受众心智与侦探式架构，并彻底去除 AI 腔调。”
- **高端演说 Deck**
  > “我们要向投资人汇报新产品，请用‘屏人二重奏’法则和 Theme Rhythm 节奏，交付一份单文件 HTML 演示文稿。”
- **提取个人审美品味**
  > “分析这个网站，提取它的深层美学系统和适用边界，收录到我的 Taste Vault。”

---

## 🛠️ 工具脚本

要求 Node.js 20+，**无第三方依赖**，不需要 `npm install`。

```bash
node scripts/audit.js                    # 技能资产自审（链接/承诺/版本/路由/规则自合规/公共证据）
node scripts/audit.js --rules            # 只看规则自合规
node scripts/lint_ui.js <文件或目录>      # 对一个项目的界面执行底线检查
node scripts/lint_text.js <文件或目录>    # 对照 24 种反 AI 腔病灶报告可定位现象
node scripts/lint_text.js --selftest     # 用技能自己的 ❌ / ✅ 范例双向验证规则（漏报与误伤都查）
node scripts/lint_text.js --stdin < draft.md
node scripts/asset_library.js location   # 品味库位置与状态
node scripts/asset_library.js init --vault <dir>
node scripts/asset_library.js list  --vault <dir> [--kind system --medium text]
node scripts/asset_library.js show  --vault <dir> --id <id> [--revision N]
node scripts/asset_library.js put   --vault <dir> --file <bundle.json>
```

```bash
npm test        # 等价于 node scripts/audit.js
```

**边界（重要）**：这些都是**提示性**检查。通过不等于作品美、可用或无障碍合规；失败也不自动等于作品不好。`audit.js` 只检查技能资产的结构一致性，不评价技能内容好不好；`lint_text.js` 只报告可定位现象，不打那 50 分。**验收责任始终在使用者，不在脚本。**

### 品味库（Taste Vault）

品味库位于技能目录**之外**，升级 Muse 不覆盖它。位置依次为 `--vault <dir>`、`MUSE_VAULT_DIR`、默认 `~/Documents/Muse`。只读查询不存在的库返回空结果，**不因读取而创建**；`init` 必须显式给出 `--vault`，避免在未授权位置建库。

- 偏好写在 `personal_dna.yaml` / `personal_taboos.yaml`，是人机都易读的纯文本，直接编辑即可。
- reference / reaction / system / application 四类资产由 `asset_library.js put` 写入，脚本校验**结构与引用关系**，原子替换并保留 `.bak`。

---

## 📁 仓库结构

```
.
├── SKILL.md                          # 智能体核心引导入口（路由与底线的唯一真理源）
├── README.md                         # 本文件
├── DESIGN.md / WRITING.md / PROMPT.md / IMAGE.md # 四份交付契约标准范例
├── scripts/                          # 4 个零依赖脚本
│   ├── audit.js                      # 技能自审
│   ├── rules.js                      # 规则引擎（底线 + 例外声明）
│   ├── lint_ui.js  lint_text.js      # 项目提示性检查
│   └── asset_library.js              # 品味库读写
├── vault/                            # 空模板（.gitignore 忽略，不代表任何用户品味）
└── references/
    ├── archetypes.md                 # 10 大母体速查与跨端推断协议
    ├── archetypes/                   # 10 个母体的独立详解与代码骨架
    ├── aesthetic_intelligence.md     # 审美推理方法与四种判断
    ├── foundations.md                # 跨媒介基础：构图/排版/色彩/图像/运动
    ├── decision_matrix.md            # 从情境到表达概念
    ├── case_based_training.md        # 案例式审美训练与四个反事实测试
    ├── visual_grammar.md             # 视觉语法与版式
    ├── artifact_contract.md          # 作品契约与内容账本
    ├── execution_architecture.md     # 四层职责与执行器选择
    ├── acceptance_protocol.md        # 成品验收与阻断项
    ├── critique.md                   # 审美复盘
    ├── cross_media.md                # 跨媒介转换
    ├── worked_example.md             # 跨媒介走查示例
    ├── taste_memory.md               # 品味记忆模型
    ├── memory_protocol.md            # 偏好写入协议
    ├── asset_library.md              # 资产库协议与位置
    ├── asset_schema.md               # 资产写入格式
    ├── extraction.md                 # 参考提取流程
    ├── public_cases.json             # 8 组公共教学案例（自包含可核验）
    ├── example_asset_bundle.json     # 可运行的教学 bundle
    ├── personal_assets/              # 作者声音画像
    └── toolkit/                      # 媒介工具
        ├── ui_adapter.md             # UI 入口：路由、2-Pass、DESIGN.md 字段
        ├── ui_grammar.md             # 美学文法与 Dials
        ├── ui_interaction_flow.md    # 视线心流与交互
        ├── ui_innovation.md          # 微创新与深度创新算子
        ├── ui_creative_arsenal.md    # 组件范式与动效参数
        ├── ui_floors.md              # 负向底线
        ├── ui_aesthetic_synthesis.md # Content DNA 提炼
        ├── ui_project_context.md     # 项目上下文
        ├── ui_iteration_protocol.md  # 迭代协议
        ├── ui_asset_protocol.md      # 资产协议
        ├── example_design_constitution.md  # 组件级参数范例
        ├── text_narrative_tool.md    # 文本实战手册
        ├── text_quality_protocol.md  # 24 种去油手术与评分卡
        ├── presentation_tool.md      # 演示实战手册
        ├── presentation/             # 演示视觉方向／母体／相遇与淘汰
        ├── image_visual_tool.md      # 图像实战手册
        ├── photography_tool.md       # 摄影与布光
        └── motion_tool.md            # 时间与运动
```

> 5.x 的 `ui_product_tool.md` 是 `ui_grammar` + `ui_floors` + `ui_creative_arsenal` + `ui_innovation` 的合订本，已被 6.0 取代并删除。
> 5.x 文档提到的 `benchmarks/`、`exemplars/`、`slow_update.js`、`migrate_vault.js`、`muse_sleep.js`、`eval_skill.js` 从未随技能发布，6.0 已删除这些承诺。
> 上述删除内容均可从 5.x 备份恢复。

---

## 📜 版本档案

<details>
<summary><strong>展开查看 6.0.0 ~ 4.0.0 完整演进记录</strong></summary>

### 6.0.0：诚实性重构 —— 让规则可被遵守，让承诺可被执行
- **底线从「绝对封杀」改为「默认 + 显式声明的例外」**。声明需带理由、本文件内生效、由工具公开列出。修好了「规则禁止纯黑，自己的母体却在用纯黑」这类自我矛盾。
- **真正实现 4 个零依赖脚本**：`audit.js`（技能自审：链接/承诺/版本/路由/规则自合规/中文基线/母体边界/公共证据/散文自合规）、`lint_ui.js`、`lint_text.js`（23/23 条规则双向通过用技能自己范例做的自检）、`asset_library.js`（品味库 location/init/list/show/put，校验结构与引用、原子写入、版本历史）。
- **修复 10 个母体的自违反**：补齐未定义 CSS 变量、emoji 图标改单色矢量 SVG、`100vh`→`100dvh`、`transition: height` 改 transform、假数据替换、圆角容器贴单侧色条改全包围细线。
- **公共案例改为自包含可核验**：原先 8 条 locator 指向从未发布的 `exemplars/` 文件，等于宣称取不到的证据；现锚定到条目自身，并由 `audit.js` 校验可解析性。
- **补上中文排版基线**：渲染实测发现 10 个母体的字体栈里没有任何中文字体，把等宽母体套到中文界面会把字距撑碎（「每次上线后的 15 分钟里」→「每 次 上 线 后 的 …」）。推理层一直警告过 CJK 陷阱，但原则没进入母体层，而 Agent 加载的正是母体层。现已在母体库首页补〈中文排版基线〉并落实到各母体字体栈，`audit.js` 新增检查防回归。
- **母体降级为「表层系统」**：2×2 拆分实验（同骨架换 tokens vs 同 tokens 换骨架）显示，母体造成的差异集中在色温、材质、圆角、阴影、字体气质；信息组织层面的差异量级大得多，而那部分母体不管。全库表层:结构描述 ≈ **5 : 1**。已在母体库首页、SKILL.md 路由与 README 明确边界：**母体定表层，版式必须另由 [视觉语法](references/visual_grammar.md) 与[跨媒介基础](references/foundations.md) 推导**，母体代码骨架是手法示范而非页面方案。
- **修掉三处母体自己的违规版式**：`institutional_defi_dark`（收益金库三等分 → 7:3 黄金分割 + 最高收益卡压舱跨行）、`soft_neobrutalism`（三指标等宽 → 硬线裸排列表 + 首项压舱）、`neo_bauhaus_pastel`（写着「三阶递进」却实现为等宽三等分，且块内只有一张卡 → 改为 `auto-fit` 包装 + 递进靠错位下沉）。`rules.js` 新增 `three-equal-columns` 规则防回归。
- **去重与去孤岛**：`ui_product_tool.md`（15.7KB 合订本）的独有内容折叠进四个子文件后标注退役、不再路由；三个孤儿文件接入路由。
  诚实说明：toolkit 活跃面从 159.5KB 变成 155.3KB（**-2.6%**），不是大幅缩水——去重移出的字节，被同期补齐的缺失章节与代码修复抵掉了。**这一版的目标是准确，不是变短。**
- **退役与删除**：`ui_product_tool.md`、`visual_prompt_tool.md`、`mindset.md` 三个文件在内容折叠完成后删除（可从 5.x 备份恢复），指向它们的链接已同步清理，不留失效引用。
- **自审结果从 253 error / 91 warning 降到 0 error。**

### 5.1.0：UI 回到媒介适配器与精细化分治
- UI 默认只读[适配器](references/toolkit/ui_adapter.md)：路由、顺序、契约字段。
- `DESIGN.md` 锁任务、假设、系统、结构、对象、运动与验收。

### 5.0.0：美是关系的艺术与 UI/UX 工业级重构
- 确立全局最高哲学：**美是关系的艺术**，六大元原则统领全媒介。
- 六大维度工程化：排版反默认居中、从具体客体推导具名调色板、角色化字体配对、GPU 动效铁律。
- 标准交付契约：写代码前先立契约。

### 4.9.0：让 Muse 回到审美导演
- 把演示定义为观众在时间中连续经历的感知相遇，区分 speaker-led、reader-led 与 hybrid。

### 4.7.0：让 UI 方向可以安全延续与比较
- 新增 UI 目标路由：区分已有界面、新目标和空白项目；新增 direct edit／replace／branch 决策。

### 4.5.0～4.6.0：从风格识别到案例式系统推理
- 案例式审美训练：按表面、机制、系统、关系、情境五层阅读，配四个反事实测试。
- 视觉语法与摄影方法：第一眼主角、阅读路径、潜在网格、受控破格。

### 4.3.0～4.4.0：让真实反应先于品味结论
- `reaction` 升级为品味记忆的一等个人资产；AI 推断不能覆盖用户原话，单次反应不静默升级为长期偏好。
- 打通「真实反应 → 可迁移推断」的正式证据链。

### 4.1.0～4.2.0：从「定义美」到「美如何发生」
- 核心哲学：美发生在作品、感知者与具体情境的相遇中。
- 新增 Content DNA 提取；反同质化从换色检查扩展到归因测试与反事实替换。

### 4.0.0：审美智能与品味记忆双引擎确立
- 用「适切、秩序、张力、共鸣、完成度」解释审美；建立跨媒介共同问题体系与个人品味学习循环。

</details>

---

## ⚖️ License

[MIT License](LICENSE)。保留原作者署名，欢迎社区贡献。
