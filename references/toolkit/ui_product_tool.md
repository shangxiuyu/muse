# UI／UX · 场景美学与前端全能实战手册

用于网站、Web App、SaaS 控制台、数字产品界面和高保真原型开发。
**核心哲学：美是关系的艺术。** UI 让深层业务秩序与人机关系在时空中可见、可理解、可操作；美不是孤立元素的装饰，而是色彩、空间、动效、组件与用户在具体情境中达成的“恰当”共振。

> **AI 专注指南（Single Source of Truth）**：本手册为 UI/UX 任务的**自包含全能作战指南**。处理 UI 设计与前端代码生成时，阅读本篇即可获得完整的色彩搭配法则、排版系统、活体原型、交互兵器库、性能铁律与交付契约，无需频繁跳转查阅子文件。

---

## 🏛️ 顶层架构：探（情境解构）· 法（分流与旋钮）· 契（设计契约）· 技（体术兵器）· 行（性能与验收）

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 【探 · 情境解构】意图解构与心理探针 + 存量审计 + 视觉母体流派锚定        │
├────────────────────────────────────────────────────────────────────────┤
│ 2. 【法 · 参数分流】模式三选一 (Expressive/Convention/Existing) + 审美三旋钮 │
├────────────────────────────────────────────────────────────────────────┤
│ 3. 【契 · 交付守卫】DESIGN.md 标准工程契约（写代码前必先立契）+ 6 轴打分    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. 【技 · 体术融合】四大实战构件（规范 + 兵器库 + Anti-Slop 红线合一）：    │
│    ① 色彩与材质：客体提纯专属色板、和谐搭配、去 AI 廉价色、真折射毛玻璃    │
│    ② 空间与排版：负字距精密系统、非对称布局、行宽限制、封杀 3 等分卡片     │
│    ③ 活体与交互：物理弹簧阻尼、Bento 5 大活体原型、Creative Arsenal 兵器库 │
│    ④ 组件与数据：有机真实数据、Anti-Card Overuse、完整 7 态契约、44px 靶心 │
├────────────────────────────────────────────────────────────────────────┤
│ 5. 【行 · 工程验收】React/CSS 运行时性能守卫 + 移动端折叠 + 真实相遇复盘    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 一、探与法：意图解构、情境探针与参数分流

### 0. 核心前置：意图解构与情境探针 (Probe & Context)
> **“用户要的不是一个界面，而是一个具体情境下的优雅解决方案。”**

AI 接收到一句话或粗颗粒度需求后，严禁直接生成代码，必须先在认知层面展开探测：

1. **情境与心理状态探针（Mental State & Environment）**：
   - **谁在用？** 他的生理与心理状态是什么？（如：冥想用户在身心疲惫、准备入眠时使用，需要极简、微光、无压力、无刺眼高饱和；量化操盘手在高压紧绷中操作，需要极高辨识度与零误触）。
   - **在什么物理环境下用？**（暗光卧室需要深邃微光的暗调护眼；强光户外需要高反差与 44px+ 易触靶心）。
2. **上下文存量审计与生命周期（Context Audit & Lifecycle）**：
   - 检查项目当前是否有既定的 Design Tokens、Tailwind 配置、字体族或组件库；生命周期上下文遵循 [项目上下文](ui_project_context.md) 识别系统现状与指纹。
   - 迭代模式严格遵循 [UI 迭代协议](ui_iteration_protocol.md)（区分 direct_edit / replace / branch），资产边界遵循 [UI 资产协议](ui_asset_protocol.md)。
   - 检索用户的私有品味库（`~/Documents/Muse`），调取历史偏好或禁忌。
3. **视觉风格母体锚定与审美综合（Archetype Alignment & Synthesis）**：
   - 从业务事实提炼 **Content DNA**，推导 **Distinctive Relation**，设立 **Restraint Rule**，并以 **Critical Slice** 验收核心切片。
   - 强制查阅 [视觉母体库](../archetypes.md)，从 10 大全端美学母体中锚定最贴切的风格基因（如：极客工坊锁定 `neo_brutalist_engineering`，线框协同系统锁定 `wireframe_architect_grid`，暗夜机构级 DeFi 锁定 `institutional_defi_dark`，科技旗舰锁定 `tech_flagship_dark`，作家案头锁定 `writer_atelier`，复古文具锁定 `playful_stationery`）。端适配遵循母体库中的《跨端推断协议》，严禁机械割裂端形态。

### 1. 业务模式三选一
- **Expressive 表达模式**（官网、品牌 Landing Page、产品 Hero）：提炼一个签名级视觉主角（Signature Element），建立不可替代的第一印象。
- **Convention 效率模式**（控制台、数据看板、设置、表单）：熟悉与高效就是最高审美，专注层级、密度、间距与键盘无障碍。
- **Existing 继承模式**（既有项目改版、新增功能模块）：“先考古，后复用”，严密匹配既有 Token 与组件体系。

### 2. 审美调节三旋钮（工程级离散阶梯）
结合情境探针与母体规范，标定 3 个核心离散数值（1-10）：
- **`DESIGN_VARIANCE` (1-10)**：`1~3` 经典居中/对称网格 ➔ `4~7` 50/50分屏/负边距重叠/多比例混排 ➔ `8~10` 非对称分数网格/巨幅留白（**移动端 `<768px` 强制单列回退**）。
- **`MOTION_INTENSITY` (1-10)**：`1~3` 静态 CSS 状态 ➔ `4~7` 现代贝塞尔微动效（`<200ms`） ➔ `8~10` 物理弹簧阻尼/常驻活体微交互/全局单点编排。
- **`VISUAL_DENSITY` (1-10)**：`1~3` Art Gallery 展陈大留白 ➔ `4~7` Daily App 标准应用 ➔ `8~10` Cockpit 紧凑无卡片（1px 细线分隔/等宽数字）。

---

## 二、技 · 体术融合四大实战构件

### 🎨 1. 色彩与材质系统（和谐配色、客体提纯与去 AI 廉价色）

色彩是用户的第一感知界面。建立产品专属、和谐悦目、有温度的色彩系统是设计的灵魂。

- **从真实客体（Subject Matter）推导专属调色板**：
  - 严禁凭空盲猜色彩。必须从产品的情境客体中提炼（如健康代谢提取自植物鼠尾草与晨光、知识工具提取自手工纸张与温和墨水、精密工程提取自冷钛与冷轧钢）。
  - **6:3:1 面积黄金律配比**：
    - `Canvas (60%)`：底层基底（主画布中性色）；
    - `Surfaces (30%)`：一二级面板、卡片与容器衬底；
    - `Accent (10%)`：核心主强调色（饱和度严格控制在 80% 以内，单点用于核心 Primary 操作与焦点）；
    - `Borders & Text`：单像素边界细线与 3 阶文字层次（Primary / Secondary / Muted）。
- **坚决剔除“AI 廉价味”色彩（Anti-AI Color Tropes）**：
  - **严禁纯黑死黑（No Pure Black `#000000`）**：深色场景使用深岩灰、钛矿黑（如 `#090B0E` / `#0F1115`）；
  - **严禁紫蓝/紫红霓虹大渐变（The Lila Ban）**：封杀全黑底配紫蓝发光按钮与浮夸 outer glow；
  - **严禁冷暖灰混用**：同一项目中全局色温必须严格统一，不可忽冷忽暖；
  - **严禁高饱和刺眼大色块**：辅助与强调色需融入中性底色，保持克制与高级感。
- **材质质感与明暗适配**：
  - **真折射毛玻璃（Liquid Glass Refraction）**：超越普通 `backdrop-blur`，添加 1px 半透内边框（`border-white/10`）与顶部微透内高光阴影（`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`）；
  - **浅色画廊范式（Bento 2.0 Light）**：精致浅底（`#f9fafb` / `#FBFBFA`）+ 纯白面板 + 扩散漫反射轻投影（`box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05)`），标题外置于下方；
  - **深色微暗范式（Precision Dark）**：微暗半透面板（`rgba(255,255,255,0.035)`）+ 单像素微透细线边框（`1px solid rgba(255,255,255,0.08)`）。

---

### 📐 2. 空间与排版系统

- **负字距精密系统（Negative Tracking）**：
  - Display 大标题（40px~80px）：字距收紧至 `-0.03em ~ -0.05em`（`-1.5px ~ -3px`），行高紧凑 `1.05 ~ 1.15`；**严禁大标题使用斜体（No Italic Headers）**；
  - Headline 章节标题（24px~32px）：字距微收 `-0.01em ~ -0.02em`；
  - Body 正文：字距归零，行长严格限制 **`max-w-[65ch]`**，行高 `1.5 ~ 1.65`。
- **角色化字体配对**：
  - 现代科技/极客：`Geist` / `Satoshi` + `JetBrains Mono`；
  - 人文叙事/生活：`Outfit` / `Cabinet Grotesk` + `Newsreader` / 高质感 Serif；
  - 严谨金融/数据：`Plus Jakarta Sans` + 等宽数字（`font-variant-numeric: tabular-nums`）；
  - **铁律**：控制台与数据仪表盘**严禁使用 Serif 衬线体**。
- **布局反模式清扫**：
  - **封杀横排 3 等分卡片（NO 3-Column Equal Cards）**：采用 2 列错位 Zig-Zag、7:3 黄金分割网格或裸排数据列表；
  - **反默认居中（Anti-Center Bias）**：优先采用左对齐杂志流或 50/50 动态分屏；
  - **CSS Grid over Flex-Math**：宏观结构使用 CSS Grid，异步容器显式声明 `aspect-ratio` 杜绝 CLS 跳跃。

---

### ⚡ 3. 活体动效与高阶兵器库

- **物理弹簧阻尼与单一编排**：
  - 拒绝机械线性动画，采用弹簧阻尼（`type: "spring", stiffness: 100, damping: 20` 或 `cubic-bezier(0.16, 1, 0.3, 1)`）；
  - 全页聚焦**单一编排视觉焦点（The Single Orchestrated Moment）**，常规微动效 `<200ms`；无条件支持 `@media (prefers-reduced-motion: reduce)` 静态降级。
- **Bento 2.0 五大活体卡片原型（5-Card Archetypes）**：
  1. *The Intelligent List*：基于 `layoutId` 的任务自排序列表，模拟 AI 实时重排；
  2. *The Command Input*：多步打字机 Prompts 轮播，带呼吸光标与 Shimmer 流光；
  3. *The Live Status*：呼吸微光指示点 + 带 Overshoot 弹簧阻尼的微通知浮层；
  4. *The Wide Data Stream*：无缝滚动的指标轮播走马灯（`x: ["0%", "-100%"]`）；
  5. *The Contextual Focus*：文档阅读交替平滑高亮 + Float-in 浮动微工具栏。
- **The Creative Arsenal 高阶交互兵器库**：
  - *Spotlight Border Card*：光标追踪径向聚光边框（Mouse-tracking radial highlight）；
  - *Magnetic Physics Button*：光标接近时的物理弹簧微吸附按钮；
  - *Dynamic Island / Morphing Pill*：利用 `layoutId` 平滑形变的胶囊通知/工具条；
  - *Kinetic Stagger Cascade*：`animation-delay: calc(var(--i) * 60ms)` 瀑布流入场；
  - *Text Scramble Decoder*：精密字符瞬时解码转场。

---

### 🧩 4. 组件规范与真实数据

- **Anti-Card Overuse 军规**：信息密集时**严禁卡片套卡片（No Card-in-Card）**，使用单像素分割线（`border-t` / `divide-y`）或负空间逻辑分组。
- **组件完整 7 态契约**：每一个核心组件交代清楚：`Default` ➔ `Hover` ➔ `Active`（`scale(0.98)` / `-translate-y-[1px]`）➔ `Focus-visible`（高反差外环，严禁 `outline:none`）➔ `Loading`（骨架屏，严禁通用旋转小菊花）➔ `Disabled`（`opacity: 0.45`）➔ `Empty / Error`。
- **消灭 Jane Doe 虚假数据**：严禁出现 `John Doe`、`Acme Corp`、`99.99%`、`1234567`；采用真实、有机杂乱的数据（如 `47.2%`、`+1 (312) 847-1928`、`$1,248.50`）。
- **工程与无障碍底线**：
  - 严禁 Emoji 充当 UI 图标（必须使用 Phosphor / Radix / Lucide 矢量图标，统一描边）；
  - 严禁同一视窗并列多个 Primary 按钮；
  - 表单输入框必须包含带 `for="..."` 属性绑定的显式 `<label>`；
  - 移动端触控靶心强制保证 `>= 44×44px`，全屏容器使用 **`min-h-[100dvh]`**（严禁 `h-screen`）。

---

## 三、规 · React / Next.js / GPU 运行时性能守卫

1. **依赖前置验证（Dependency Verification）**：import 任何第三方库（`framer-motion`, `@phosphor-icons/react`）前**必须检查 `package.json`**，未安装时必须在代码前显式给出安装命令。
2. **动效叶子节点隔离**：常驻活体动效必须封装在极小的叶子节点 Client Component 中（`'use client'`）并使用 `React.memo`，**严禁触发父级布局组件的 Reflow / Re-render**。
3. **光标动画脱离渲染树**：连续鼠标追踪（Magnetic / Spotlight）**强制使用 `useMotionValue` 与 `useTransform`，严禁使用 React `useState` 记录坐标**。
4. **GPU 噪点层隔离**：Grain/Noise 滤镜必须严格挂载在 `fixed inset-0 z-50 pointer-events-none` 独立固定层，严禁放在滚动容器上。

---

## 四、器 · 交付契约与 Pre-emit 自省

> **铁律：写代码前先立契约**。全新设计或重构任务，**必须首先查阅 [视觉母体库](../archetypes.md)（含 10 大全端美学母体及跨端推断协议）**，依据业务赛道与受众心流锚定最匹配的设计母体（或明确跨界混血方案），再在项目根目录交付或增量更新自包含且工程级详尽的 `DESIGN.md`：

```markdown
# [Project Name] · Design System & Execution Contract

## 1. Context & Baseline Knobs
- **Subject Matter**: 业务客体与核心情绪
- **Aesthetic Archetype**: [锚定的母体流派，如 Ambient Wellness Flow / Tech Flagship Dark / ...] (详见 references/archetypes.md)
- **Mode Balance**: Expressive (X%) / Convention (Y%)
- **Baseline Knobs**: VARIANCE: [1-10] | MOTION: [1-10] | DENSITY: [1-10]

## 2. Color System & Material (6:3:1)
- **Palette**: Canvas (60%) `#...` | Surfaces (30%) `#...` | Accent (10%) `#...` | Text 3-Tier `#...` (优先继承所选 Archetype 的黄金色号)
- **Material Specs**: Border hairline, Glass refraction, or Diffusion shadow parameters

## 3. Layout & ASCII Wireframe
- **ASCII Wireframe**: (宏观栅格、签名主角位置、流动排版)
- **Responsive Breakpoints**: Desktop (Grid) ➔ Tablet ➔ Mobile (Single Column)

## 4. Component 7-State Matrix & Archetypes
- **7 States Table**: Default | Hover | Active | Focus | Loading (Skeleton) | Disabled | Error
- **Active Bento Archetypes / Creative Arsenal**: (如 The Intelligent List + Spotlight Border + 所选母体特权微手艺)

## 5. Motion Physics & Performance Rules
- **Spring Parameters**: stiffness: 100, damping: 20
- **Reduced Motion & Isolation**: Client Component leaf isolation verified

## 6. Pre-emit Self-Critique Score
/* [P] Philosophy: 5/5 | [H] Hierarchy: 5/5 | [E] Execution: 5/5 | [S] Specificity: 5/5 | [R] Restraint: 5/5 | [V] Variety: 5/5 */
```

### Pre-emit 6 轴自省打分（代码顶部必备）
```css
/* Muse · Pre-emit Self-Critique:
 * [P] Philosophy (关系契合): 5/5
 * [H] Hierarchy (层级骨力): 5/5
 * [E] Execution (代码工艺): 5/5
 * [S] Specificity (具体真实): 5/5
 * [R] Restraint (克制不自恋): 5/5
 * [V] Variety (拒绝模板化): 5/5
 */
```
任何一项 < 3 分必须触发自动修正重构。
