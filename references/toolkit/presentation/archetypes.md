# Muse 演示端表层流派与页型范式 (Presentation Surface Schools)

<!-- muse:allow text-8: 「因果闭环链路 (Causal Chain Flow)」是演示页型的术语名，指痛点 → 机制 → 结果首尾相接的论证链 -->

## ⚠️ 先读：这是**表层系统**，不是演示模板菜单

**6.0 后补的边界，用来纠正一种误用。** 本库曾被当成「选一个流派就能出整套 PPT」的选型表，于是它和它所服务的[演示与演说实战手册](../presentation_tool.md)直接打架——手册第一节拒绝「只有风格 A 或风格 B」的套壳思维，第七节的〈安全答案测试〉又把「三等分卡片 + 胶囊标签」直接判为淘汰。

结论：**本库给的是表层，不是版式。** 选定流派后你得到色温、材质、字体气质与几个可复用的页型范式；**信息怎么组织、为什么这样组织，本库不负责。**

| 本库负责（表层 / 范式） | 必须另行推导（结构） |
|---|---|
| 色彩语义、底色与面积分配 | 栅格与栏数、潜在骨架 |
| 边框、阴影、圆角、材质 | 第一眼主角与阅读路径 |
| 字体音律与字号阶梯 | 首屏结构、区块节奏与疏密 |
| 页型**范式**（下面每个流派列的"标准页型"） | 这一页**具体**怎么排（非等宽、错位、压舱、裸排） |

- **版式方法**见[视觉语法](../../visual_grammar.md)与[跨媒介基础](../../foundations.md)；方向推导见[演示视觉方向](visual_direction.md)；信息组织先过[作品契约](../../artifact_contract.md)。
- **与主母体库的关系（跨端同构）**：[10 个全端母体](../../archetypes.md)是**表层语言的单一真理源**，[跨端推断协议](../../archetypes.md)明确「母体通过一套 Design Tokens 完整推导出全端适配体系」。演示是一个端，因此**优先复用主母体的表层**。本库的 5 个流派是演示端的高频补充起点——当主母体覆盖不到某类舞台语境，或需要一条更快的演示起点时使用，**不构成第二套真理源**。
- **"标准页型"是范式，不是模板**：流派二写「三列 KPI 仪表盘」、流派三写「三律展开页」，描述的是「这类信息可以这样组织」的一种可能，**不是让你照抄三列**。照抄即命中手册的〈安全答案测试〉。范式只用来理解意图，排布仍按内容推导，且受[负向底线](../ui_floors.md)约束（横排等宽三等分是被封杀的）。

---

## 目录索引

1. [🟡 流派一：Neo-Memphis Toy Blocks (乐高积木与波普多巴胺流)](#-流派一neo-memphis-toy-blocks-乐高积木与波普多巴胺流)
2. [🏛️ 流派二：Executive Swiss Navy (麦肯锡商业咨询深蓝流)](#️-流派二executive-swiss-navy-麦肯锡商业咨询深蓝流)
3. [📜 流派三：Editorial Sand & Linen (燕麦画廊高奢刊物流)](#-流派三editorial-sand--linen-燕麦画廊高奢刊物流)
4. [🌌 流派四：Tech Flagship & Precision Studio (科技工业旗舰产品发布流)](#-流派四tech-flagship--precision-studio-科技工业旗舰产品发布流)
5. [📊 流派五：Executive Workstream & Precision Swiss (现代精密工装职场研报流)](#-流派五executive-workstream--precision-swiss-现代精密工装职场研报流)
6. [🈶 演示端中文配对 (CJK Pairing)](#-演示端中文配对-cjk-pairing)
7. [🎯 表层倾向速查（不是选型表）](#-表层倾向速查不是选型表)

---

## 🟡 流派一：Neo-Memphis Toy Blocks (乐高积木与波普多巴胺流)

### 1. 审美隐喻与气质
* **视觉标杆**：GitHub 开源 `slidevjs/themes (bricks)`、Figma Config 玩味舞台、乐高创意工坊。
* **情绪与气质**：活力四射、多巴胺爆发、童趣高亲和力、打破严肃与冰冷。
* **核心排版手艺**：
  * **玩具积木拼接**：卡片带有明显的 3px 实心纯黑硬描边与 5px 纯黑偏置阴影（Offset Shadow）。
  * **微倾斜胶带与徽章**：关键标签微倾斜（-2° ~ 1.5°），模拟贴纸与实物玩具。
  * **高对比色块撞色**：高饱和明黄为底，配合天空蓝、樱花粉、薄荷绿三色卡片并列。

> **本流派的纯黑用法（表层偏离已声明）**：3px 描边与 5px 偏置阴影用纯黑，是积木玩具的形式语言——硬描边换任何深灰都会失去塑料玩具的实心感。纯黑**只作线、边框与影子，从不作页面底盘**；底盘始终是高饱和明黄。按 SKILL.md 的〈底线与例外〉，此偏离在此显式声明。

<!-- muse:allow pure-black: Neo-Memphis 玩具积木流以 3px 纯黑硬描边与 5px 纯黑偏置阴影为形式语言——硬描边改深灰会失去塑料玩具的实心感；纯黑只作线与影，不作底盘（底盘为高饱和明黄 #fef08a） -->

### 2. 精确 Design Tokens
```css
/* Bricks & Neo-Memphis Tokens */
--bg-bricks: #fef08a; /* 亮柠檬暖黄 */
--bg-dot-pattern: #eab308; /* 网格点纹理 */
--border-black: 3px solid #000000;
--shadow-hard: 5px 5px 0px #000000;
--card-blue: #38bdf8;
--card-pink: #f472b6;
--card-green: #4ade80;
--font-headline: 'Fredoka', 'Comic Neue', cursive, sans-serif; /* 仅拉丁：中文标题无手写对应字体 */
--font-body: 'Plus Jakarta Sans', 'PingFang SC', sans-serif;
```

### 3. 标准页型与结构模式（范式，非模板）
* **Cover (立意封面)**：大字粗体描边标题（`-webkit-text-stroke: 1.5px #000` + `text-shadow: 4px 4px 0px #38bdf8`），上方贴红色圆形胶囊药丸徽章。
* **Cards Row (积木并列)**：蓝、粉、绿积木卡片错落排列（**错落，不是等宽三等分**），每张卡片带大号物理图标与粗黑边框。
* **Data Impact (数据突破)**：左侧大号纯白硬框展示大字成就（如 `10/10`），右侧配放大气泡名言。

### 4. 最佳应用场景
* 黑客松（Hackathon）项目路演、产品创意脑暴、设计冲刺（Design Sprint）复盘、新员工文化欢迎会、教育与青年创意提案。

---

## 🏛️ 流派二：Executive Swiss Navy (麦肯锡商业咨询深蓝流)

### 1. 审美隐喻与气质
* **视觉标杆**：`awesome-marp-template (Consulting)`、McKinsey Global Institute 研报、高盛投资白皮书。
* **情绪与气质**：绝对理性、严密逻辑、权威可信、纯粹商战力量。
* **核心排版手艺**：
  * **瑞士国际主义网格 (Swiss Grid)**：顶部 2px 极细深海蓝基线贯穿，左侧页码与分类清晰明确。
  * **行动导向标题 (Action Titles)**：标题必须是一句完整的商业论断，而非抽象名词。
  * **数据卡片压舱**：主数据卡采用深海蓝底（`#0A2540`）反衬纯白与电光天蓝，次级卡片采用冷白底与浅灰边线。

### 2. 精确 Design Tokens
```css
/* Executive Swiss Navy Tokens */
--bg-exec: #ffffff; /* 纯净商务冷白 */
--color-navy: #0a2540; /* 麦肯锡经典深海蓝 */
--color-accent-blue: #0284c7; /* 关键指标亮天蓝 */
--color-lead-text: #2563eb;
--border-subtle: 1px solid #e2e8f0;
--border-navy: 2px solid #0a2540;
--font-sans: 'Plus Jakarta Sans', 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
```

### 3. 标准页型与结构模式（范式，非模板）
* **Executive Summary (高管综述页)**：顶部清晰标明时间与密级（CONFIDENTIAL），正中央行动大标题（36pt），配以严密的商业归因长句与来源标注。
* **Metrics Drivers (财务与运营核心指标)**：主指标暗蓝高亮卡压舱，对照卡退为浅灰，含明确的大数字单位与同比/环比分析。**主次必须不等宽**——三等分会让主指标失去压舱作用。
* **Governance / RACI Matrix (治理与责任矩阵)**：三阶段里程碑横向流水线，带有明确的部门职责与交付物界定。

### 4. 最佳应用场景
* 向 CEO / 董事会高管述职、战略并购与重组提案、B 轮及以上商业计划书（Pitch Deck）、企业年度战略研报。

---

## 📜 流派三：Editorial Sand & Linen (燕麦画廊高奢刊物流)

### 1. 审美隐喻与气质
* **视觉标杆**：`slidev-theme-seriph`、`reveal.js-theme-beige`、《Kinfolk》画册、Aesop 品牌发布文稿。
* **情绪与气质**：深沉温润、诗意节奏、从容典雅、去工业化。
* **核心排版手艺**：
  * **温润棉纸底盘**：使用 `#F5F2EB` 暖沙米白色作为底色，彻底消除电子屏幕的刺眼感与冷光疲劳。
  * **古典衬线与斜体韵律**：大字采用优雅的 Newsreader 或 Lora 衬线体，穿插斜体（Italic）营造文学随笔感。
  * **60% 奢侈留白**：文字极度精炼克制，页面大面积留白，宛如美术馆白墙上的单幅摄影。

### 2. 精确 Design Tokens
```css
/* Editorial Sand & Linen Tokens */
--bg-sand: #f5f2eb; /* 暖燕麦棉纸底色 */
--color-ink: #1c1917; /* 炭墨黑正文字 */
--color-muted-stone: #78716c; /* 石板灰辅色 */
--border-hairline: 1px solid rgba(38, 36, 34, 0.15);
--font-serif: 'Newsreader', 'Lora', 'Songti SC', 'Noto Serif SC', serif;
--font-meta: 'Inter', 'PingFang SC', sans-serif;
```

### 3. 标准页型与结构模式（范式，非模板）
* **Manifesto Cover (立意宣言页)**：顶部精致的书眉刊号（Folio），中间大幅名言金句，左侧配单线边注，右侧配短小凝练的阐述。
* **The Three Tenets (三律展开页)**：带斜体编号（01. / 02. / 03.）的展开式纯文字排版，字体大小对比剧烈。**这里的"三"是修辞不是栅格**——用编号与尺度差建立层级，不要落成三等宽列。
* **Epilogue (沉思结语页)**：全幅留白中居中一行哲思句子，下方小号全大写 Inter 字体签名，给观众留出沉思的余韵。

### 4. 最佳应用场景
* 高端奢品与生活方式品牌发布、建筑与室内设计提案、艺术策展前言、哲学/文学类学术报告、设计系统美学宣讲。

---

## 🌌 流派四：Tech Flagship & Precision Studio (科技工业旗舰产品发布流)

### 1. 审美隐喻与气质
* **视觉标杆**：`Linear` 新版本发布、`Raycast`、`Apple Keynote` 硬件/软件特别活动。
* **情绪与气质**：精密工业感、极致纯粹、压迫感十足的视觉重音、产品即主角。
* **核心排版手艺**：
  * **深岩灰底盘与环境光晕**：`#07080B` 深岩灰底盘（**不是死黑**，保留一丝可辨认的层次），后方衬托微弱电光青多段弥散光（Ambient Mesh Glow），让产品自然浮现。
  * **拟真交互操作舱 (Interactive Product Cockpit)**：0.5px 发丝晶体微边框、呼吸状态指示灯（`● ACTIVE CLUSTER`）、`9.2ms` 巨幅关键指标与等宽代码校验反馈。
  * **非对称 Bento Grid**：核心特性大面积压舱，次级特性小格并列，极大的层级落差消除视觉疲劳。

### 2. 精确 Design Tokens
```css
/* Tech Flagship Tokens */
--bg-flagship: radial-gradient(circle at 75% 20%, #171c2f 0%, #07080b 65%);
--color-cyan-glow: #00f0ff;
--color-blue-accent: #38bdf8;
--border-crystal: 1px solid rgba(255, 255, 255, 0.12);
--shadow-cockpit: 0 20px 50px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15);
--font-sans: 'Geist', 'Inter', 'PingFang SC', -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'Noto Sans Mono', monospace; /* 等宽只承载拉丁指标与代码，中文标签走 --font-sans */
```

### 3. 标准页型与结构模式（范式，非模板）
* **Hero Launch (产品核心立意)**：大字 50pt+ 标题，下方紧贴拟真产品操作舱与实时神经延迟指标。
* **Bento Grid (便当盒特性拆解)**：`1.3fr + 1fr + 1fr` 非对称排布，主格子展示跨媒介同步率，次格子展示确定性守卫与演说提词协议。
* **Head-to-Head Spec (性能代际对比)**：传统模板 3.5 天 vs 旗舰流 12 分钟的鲜明对比，用事实数据定调。

### 4. 最佳应用场景
* SaaS 产品发布会、技术突破性 Demo 演示、面向客户的高价值产品推介、开发者生态大会 Keynote。

---

## 📊 流派五：Executive Workstream & Precision Swiss (现代精密工装职场研报流)

### 1. 审美隐喻与气质
* **视觉标杆**：`Stripe Press` 出版物、`HashiCorp` 财报与架构白皮书、互联网大厂 P8/P9 高阶述职与晋升答辩。
* **情绪与气质**：严谨扎实、因果清晰、尊重事实、无可辩驳的数据说服力。
* **核心排版手艺**：
  * **冷轧铝白底盘与建筑经纬线**：`#F8FAFC` 搭配 1px 建筑微网格，彻底消除纯白底的频闪眩光。
  * **真实 SVG 平滑趋势曲线 (Sparklines)**：在指标卡内直接渲染历史趋势曲线与高光峰值点（如交付周期降至 1.8 天），直观呈现动能与拐点。
  * **因果闭环链路 (Causal Chain Flow)**：从"痛点穿透 ➔ 机制重塑 ➔ 商业结果"，串联成完整的论证流水线。
  * **组织责任矩阵 (RACI Roadmap)**：分月份明确战役里程碑与确权交付物。

### 2. 精确 Design Tokens
```css
/* Executive Workstream Tokens */
--bg-workstream: #f8fafc;
--border-grid-line: rgba(0, 0, 0, 0.03);
--color-action-navy: #0f172a;
--color-blue-primary: #2563eb;
--color-emerald-success: #10b981;
--border-subtle: 1px solid #e2e8f0;
--font-sans: 'IBM Plex Sans', 'Noto Sans SC', -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'Noto Sans Mono', monospace; /* 等宽只承载拉丁数字与代码 */
```

### 3. 标准页型与结构模式（范式，非模板）
* **Executive QBR (季度高管综述页)**：状态芯片标明达成率，带平滑 SVG 趋势曲线的 KPI 卡片直击痛点与战果。**主战果卡加宽压舱，对照卡收窄**，而不是三张等宽。
* **Causal Chain (业务因果闭环页)**：痛点 ➔ 机制 ➔ 结果的三阶段链路，让领导对背后的因果关系一清二楚。链路可用箭头或流向承载，**不必是三列卡片**。
* **Strategic Roadmap (战役与责任矩阵)**：清晰的季度关键战役卡片，责任到人、节点明确。

### 4. 最佳应用场景
* 部门季度业务复盘（QBR）、晋升/述职答辩、业务线年度总结、跨部门重大专项复盘、向高层争取项目预算。

---

## 🈶 演示端中文配对 (CJK Pairing)

> **为什么演示端也要这一层**：6.0 给 10 个母体补[中文排版基线](../../archetypes.md)时漏了演示分支——本库原来 7 个字体栈里没有任何中文字体。中文演示是默认场景，字体栈没有 CJK 就会让浏览器 fallback 决定字形，中文标题与正文的节奏会全线失守。**每个流派落地前，先按本节补 CJK 字体栈。**

### 三条硬规则（与主基线一致）

1. **中文字体必须显式写进字体栈**，拉丁在前、CJK 在后。
2. **负字距只作用于拉丁**。[演示手册](../presentation_tool.md)要求的 `-0.03em ~ -0.05em` Display 标题字距，**用在中文标题上会挤压字形**；中文大标题改用零或正字距。
3. **`text-transform: uppercase` 对中文无效**。本库流派三的「大写字距签名」与流派四/五的等宽大写标签，中文改由加宽字距、加粗或方括号承载。

### 与各流派的 CJK 配对

| 流派 | 拉丁字体（流派原生） | 建议 CJK 配对 | 中文要特别注意 |
| :--- | :--- | :--- | :--- |
| 一 · 乐高积木多巴胺 | Fredoka / Comic Neue / Plus Jakarta Sans | 正文 → `PingFang SC`；**标题无配对** | 手写圆体没有中文对应字体，中文封面别指望 Fredoka 的玩味；改用超大字号 + 描边 + 倾斜来承载同一意图 |
| 二 · 麦肯锡商务深蓝 | Plus Jakarta Sans / Inter | `Noto Sans SC` | 行动导向标题是长句，中文长句在 36pt 下容易换行失控，收敛到 28–32pt 并缩短论断 |
| 三 · 燕麦画廊高奢刊物 | Newsreader / Lora（衬线） | 衬线 → `Songti SC` / `Noto Serif SC`；元信息 → `PingFang SC` | 中文衬线在小字上会糊，宋体只留给 18px 以上的金句；微文案（书眉、签名）走黑体 |
| 四 · 科技旗舰发布 | Geist / Geist Mono | `PingFang SC`；等宽处 → `Noto Sans Mono` | 等宽中文是最容易翻车的组合——`9.2ms` 这类指标用等宽拉丁，中文标签换回无衬线 |
| 五 · 精密工装职场研报 | IBM Plex Sans / Geist Mono | `Noto Sans SC`；等宽处 → `Noto Sans Mono` | 中文正文在 `#F8FAFC` 微网格底上对比度衰减更快，正文降到 `#334155` 一级；等宽只留给拉丁数字 |

### 验收时必看

按[成品验收](../../acceptance_protocol.md)检查中文：**真实中文段落**（不是 Lorem Ipsum 或英文占位）、长短标题、中英混排、数字与标点、200% 文字缩放、投影尺寸下的可读性。**只看英文样例就宣布演示排版通过，是无效验收。**

---

## 🎯 表层倾向速查（不是选型表）

> **这张表只解决「表层从哪起步」，不解决「这套演示长什么样」。** 它决定色温、材质与字体气质；版式、页数与叙事节奏仍必须按[演示视觉方向](visual_direction.md)的三组竞争假设推导，并由用户在真实 HTML 样张上选定。
>
> **用法**：用下表锁定表层 → 按[演示手册](../presentation_tool.md)的六维流程推导 3 组方向 → 出前 2 张真实样张 → 用户确认 → 扩展整套。**跳过推导直接用表，等于把手册的〈安全答案测试〉抄了一遍。**

| 用户诉求关键词 | 表层倾向（色 / 材 / 字） | 为什么是这个表层 |
| :--- | :--- | :--- |
| "头脑风暴"、"好玩一点"、"打破沉闷"、"黑客松"、"轻松有趣"、"团队分享" | **🟡 流派一 · 乐高积木多巴胺** | 高饱和撞色 + 硬描边积木，用玩具的物理感解除会议的正式压力 |
| "董事会汇报"、"融资计划书"、"商业分析"、"严肃战略"、"老板要看" | **🏛️ 流派二 · 麦肯锡商务深蓝** | 冷白 + 深海蓝 + 极细基线，用咨询研报的克制建立权威 |
| "品牌理念"、"设计提案"、"策展介绍"、"高级感"、"生活方式"、"不要大红大绿" | **📜 流派三 · 燕麦画廊高奢刊物** | 暖沙棉纸 + 衬线 + 大留白，用画廊白墙的呼吸感承载理念 |
| "产品发布"、"新功能宣传"、"SaaS 客户演示"、"像苹果发布会那样震撼"、"科技感" | **🌌 流派四 · 科技旗舰发布** | 深岩灰 + 环境光晕 + 晶体边框，让产品本身成为唯一光源 |
| "职场汇报"、"周报/月报"、"季度业务复盘 (QBR)"、"述职答辩"、"晋升 PPT"、"项目复盘" | **📊 流派五 · 精密工装职场研报** | 冷轧铝白 + 微网格 + 真实趋势曲线，用工程文档的扎实感支撑数据说服力 |

**这 5 个流派覆盖不到时**：回到[10 个全端母体](../../archetypes.md)选一个表层，按[跨端推断协议](../../archetypes.md)把它投影到演示端——那是更正统的路径，本库只是高频起点。
