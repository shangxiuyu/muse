# 典范案例：Aether Notes 产品设计宪法与组件工程规范 (DESIGN.md)

> **本文件为 Muse Skill 的黄金标准范例 (Gold Standard Exemplar)**。  
> 当 AI 执行 UI 全新立项或系统级重构时，交付的 `DESIGN.md` 必须具备与本文件相同的**结构严密性、Why 与 How 结合度、精准组件级工程参数 (Component Specs) 以及负向禁令约束**。

---

# Aether Notes (灵境笔记) · 产品设计宪法与工程规范 (Design Constitution)

> **版本**：1.0.0 (Master Spec)  
> **定位**：Aether Notes 全生命周期设计宪法。后续任何 AI 与工程师接手本项目时，**必须且仅需以本文档为单一真实源 (Single Source of Truth)**，严格遵循其中规定的哲学意图（Why）与工程参数（How）。

---

## 目录
1. [美学哲学与核心意图 (The Why)](#1-美学哲学与核心意图-the-why)
2. [设计 Token 字典 (Design Tokens)](#2-设计-token-字典-design-tokens)
3. [原子组件工程规范 (Component Specs - The How)](#3-原子组件工程规范-component-specs---the-how)
4. [视图与场景规范 (Views & Layouts)](#4-视图与场景规范-views--layouts)
5. [交互动效与物理法则 (Motion & Feedback)](#5-交互动效与物理法则-motion--feedback)
6. [负向禁令与反 AI 偏见 (Negative Constraints)](#6-负向禁令与反-ai-偏见-negative-constraints)

---

## 1. 美学哲学与核心意图 (The Why)

### 1.1 产品心智定位
Aether Notes 并非冷冰冰的数据录入表格，而是**“思考者的第二大脑与思绪织网工坊”**。
* **温润如纸 (Editorial Paper)**：拒绝冷酷刺眼的纯白或死黑，选用带有温润触感的羊皮纸微黄底色，营造文人雅士的沉浸书写心流；
* **晶体秩序 (Bento 2.0 Structure)**：以严谨的网格和柔和的微光边界，将碎片灵感收敛为自组织的智识晶体；
* **共生共振 (Living Thought)**：AI 在侧边作为“反思之镜”与“跨域织网者”，通过有机动效与微交互，赋予笔记以生命力。

### 1.2 空间几何原则
* **曲率连续性 (Curvature Continuity)**：凡是具有圆角的容器，必须保持四周几何边界的完整性，**严禁在圆角边缘贴附单侧平直粗色条**。
* **层级由排版与微色阶驱动，而非装饰**：区分信息层级优先依靠“字号字重、1px 微透细线、浅素底色”，而非喧宾夺主的粗暴色块。

---

## 2. 设计 Token 字典 (Design Tokens)

### 2.1 精准色彩体系 (6:3:1 Exact Hex Tokens)
| Token 角色 | 变量名 | 浅色模式 (Light) | 深色模式 (Dark) | 占比与应用边界 |
|---|---|---|---|---|
| **Canvas 底层 (60%)** | `--bg-canvas` | `#FBF9F5` (羊皮纸暖白) | `#0E1116` (深曜石墨夜) | 全局视口底色，严禁纯白 `#FFF` 或死黑 `#000` |
| **Surface 面板 (30%)** | `--bg-surface` | `#FFFFFF` (纯白骨瓷) | `#161B22` (哑光矿石) | 核心容器、编辑器卡片、侧边栏、弹窗面板 |
| **Surface 槽位** | `--bg-surface-subtle`| `#F2EFE9` (浅素灰) | `#21262D` (二级面板) | 标签、代码块、搜索底槽、AI 洞察底盒 |
| **Surface 悬浮** | `--bg-surface-hover` | `#EAE6DD` (深素灰) | `#30363D` (悬浮矿石) | 列表项、按钮 Hover 态 |
| **Accent 主强调 (10%)**| `--accent-amber` | `#D97706` (暖金琥珀) | `#F59E0B` (晨曦微橙) | 主按钮、AI 核心标记、高亮聚焦、选中状态 |
| **Accent 次级强调** | `--accent-cyan` | `#0284C7` (静水湖蓝) | `#38BDF8` (冰川透青) | 双向链接 `[[...]]`、图谱引用连线 |
| **Accent 状态绿** | `--accent-emerald` | `#059669` (松石绿) | `#34D399` (薄荷绿) | 实时保存状态、同步健康指示 |
| **Text 主正文** | `--text-primary` | `#1C1917` (温润墨黑) | `#F0F6FC` (月夜月白) | 标题、核心正文、关键度量数据 |
| **Text 次级描述** | `--text-secondary` | `#44403C` (深灰墨) | `#C9D1D9` (次级文本) | 段落说明、引用文本、卡片描述 |
| **Text 弱弱注释** | `--text-muted` | `#78716C` (纸墨温灰) | `#8B949E` (冷注释灰) | 时间戳、字数统计、快捷键徽章 |
| **Border 细线** | `--border-subtle` | `rgba(28,25,23,0.08)` | `rgba(240,246,252,0.1)` | 全局 1px 容器边框、分隔线 |
| **Border 强调线** | `--border-strong` | `rgba(28,25,23,0.16)` | `rgba(240,246,252,0.2)` | 悬浮卡片、输入框激活边框 |

### 2.2 圆角阶梯 (Radius Scale)
* `--radius-sm` (`6px`)：微型按钮、单行 Code、Badge、下拉项；
* `--radius-md` (`10px`)：标准输入框、AI Mini 卡片、列表选中高亮项；
* `--radius-lg` (`16px`)：Bento 大卡片、全局弹窗、图谱浮层；
* `--radius-full` (`9999px`)：Pill 标签、圆形图标按钮、搜索框。

### 2.3 字体与字阶 (Typography System)
* **展示与大标题 (Display & Headline)**：`'Newsreader', 'Songti SC', Georgia, serif`
  * 特性：文人雅致感，字距微收紧 `letter-spacing: -0.02em`。
* **界面与系统正文 (UI & Body)**：`'Plus Jakarta Sans', -apple-system, 'PingFang SC', sans-serif`
  * 特性：极高清晰度，行高标准 `1.6 ~ 1.85`。
* **代码与指标 (Code & Metrics)**：`'JetBrains Mono', monospace`
  * 特性：强制等宽数字 `font-variant-numeric: tabular-nums`。

---

## 3. 原子组件工程规范 (Component Specs - The How)

后续开发与维护任何组件时，**必须严格对齐以下尺寸、状态与样式规则**：

### 3.1 顶部全局搜索栏 / Command Trigger (`#searchTriggerBtn`)
* **尺寸与间距**：高度 `36px`，左右内边距 `12px`，最大宽度 `420px`；
* **外形**：`border-radius: var(--radius-md)` (10px)，`border: 1px solid var(--border-subtle)`；
* **颜色**：背景 `var(--bg-surface-subtle)`，文本 `var(--text-muted)` (0.86rem)；
* **右侧快捷键**：内嵌 `<kbd>⌘ K</kbd>`，尺寸 `font-size: 0.72rem`，背景 `var(--bg-surface)`，圆角 `4px`；
* **Hover 态**：背景平滑过渡至 `var(--bg-surface-hover)`，边框变为 `var(--border-strong)`，光标指针。

### 3.2 导航视图切换器 (`#viewSwitcher`)
* **外形**：高度 `36px`，整体包裹于 `var(--bg-surface-subtle)` 容器内，`padding: 3px`，圆角 `10px`；
* **子项按钮**：
  * 默认态：无背景，文字 `var(--text-muted)`，字体权重 `500`；
  * 激活态 (`active`)：背景切换为 `var(--bg-surface)`，文字 `var(--text-primary)`，字体权重 `600`，外带轻微投影 `var(--shadow-sm)`；
  * 过渡：`background-color, color, box-shadow 150ms cubic-bezier(0.16, 1, 0.3, 1)`（无振荡的缓出刹车曲线）。

### 3.3 Bento 2.0 卡片盒 (`.bento-card`)
* **尺寸与布局**：网格列宽 `minmax(320px, 1fr)`，间距 `20px`，卡片内边距 `24px`；
* **外形**：`border-radius: var(--radius-lg)` (16px)，背景 `var(--bg-surface)`，四周统一 `border: 1px solid var(--border-subtle)`；
* **Hover 交互**：
  * 位移：`transform: translateY(-2px)`；
  * 边框与光影：整体边框变为 `var(--accent-amber)`，外圈叠加 `0 0 0 1px var(--accent-amber)` 与微扩散漫反射阴影；
  * **严禁行为**：严禁在卡片顶部或左侧出现绝对定位的生硬色条（`::before` 粗色杠）。
* **AI 核心洞察内嵌盒 (`.bento-card-ai-distill`)**：
  * 背景 `var(--bg-surface-subtle)`，四周 `1px solid var(--border-subtle)`，圆角 `10px`，内边距 `12px 14px`；
  * 顶部采用晶体微标：`✦ AI 核心洞察` (字号 0.74rem, 颜色 `var(--accent-amber)`, 粗体 `700`)。

### 3.4 沉浸 Markdown 编辑器画布 (`.paper-canvas`)
* **最大行长限制**：正文编辑区域最大宽度严格锁定为 `max-w-[65ch]`（人眼舒适扫描区间 50–75ch 的标准档，与 [负向底线](ui_floors.md) 一致），居中留白；
* **主标题输入框 (`.editorial-title-input`)**：
  * 字体：Serif 衬线体，字号 `2.25rem` (36px)，粗体 `600`，行高 `1.25`；
  * 交互：无边框无背景，Focus 时无粗暴轮廓线，底部预留 `12px` 呼吸留白；
* **正文排版规范**：
  * 一级标题 `h1`：`1.75rem`，衬线体；
  * 二级标题 `h2`：`1.45rem`，底部带 `1px solid var(--border-subtle)` 下划线；
  * 引用块 `blockquote`：四周**全包围** `1px solid var(--border-subtle)` 细线，背景 `var(--bg-surface-subtle)` 柔和色阶，圆角 `var(--radius-md)` (10px)，左内边距 `14px`；引用出处由 `var(--accent-amber)` 的小号标注文字承担，**严禁在圆角容器上贴任何单侧粗色条**；
  * 双向链接 `.wikilink`：字重 `600`，背景色 `var(--accent-cyan-light)`，文字色 `var(--accent-cyan)`，圆角 `4px`，内边距 `1px 6px`。

### 3.5 全局命令盘 Modal (`#cmdPaletteModal`)
* **背景遮罩**：`background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(8px);`；
* **弹窗主体**：宽 `90%`，最大宽度 `580px`，居顶部 `12vh` 悬浮；
* **外形**：`border-radius: var(--radius-lg)` (16px)，`border: 1px solid var(--border-strong)`，阴影 `var(--shadow-lg)`；
* **动效**：进入时从 `translateY(-12px) scale(0.98)` 平滑过渡至正常态（耗时 `180ms`）。

---

## 4. 视图与场景规范 (Views & Layouts)

工作台支持三大平行视图，所有视图共享同一底层状态，秒级无缝切换：

```
┌────────────────────────────────────────────────────────────────────────┐
│ 顶部 App Header (高度 56px, 毛玻璃 backdrop-filter: blur(16px))        │
├──────────────┬──────────────────────────────────────────┬──────────────┤
│ 左侧智识导航 │           中间核心视窗 (Main Canvas)     │ 右侧 AI 共鸣 │
│ (宽 250px)   │                                          │ (宽 340px)   │
│              │ • 视图 1：沉浸 Markdown 编辑流 (65ch)    │              │
│ • 智识索引   │ • 视图 2：Bento 2.0 瀑布流卡片盒         │ • 快捷 4 魔法│
│ • 灵感标签池 │ • 视图 3：Canvas 全屏力导向思维星图      │ • 涌现关联卡 │
│ • 快速切换   │                                          │ • 追问对话框 │
└──────────────┴──────────────────────────────────────────┴──────────────┘
```

---

## 5. 交互动效与物理法则 (Motion & Feedback)

1. **双物理引擎与实体弹簧手感 (Spring & Fluid Physics)**：
   * **实体交互弹簧（按钮、卡片、游标、气泡、弹窗）**：统一采用带微冲过（Overshoot）阻尼的弹性曲线：
     `--motion-spring: cubic-bezier(0.34, 1.35, 0.64, 1)` 或真实弹簧参数 `type: "spring", stiffness: 140, damping: 18, mass: 0.8`；
     提供如高级精工机械般的微回弹质感（按压 `scale(0.96)`，松手弹性恢复）；
   * **流体阻尼缓出（遮罩、长背景、全局滚动）**：采用无振荡平滑刹车曲线：
     `--motion-fluid: cubic-bezier(0.16, 1, 0.3, 1)`（时长 `240ms ~ 360ms`）；
   * **卡片悬停与抬升**：Bento 卡片 hover 上浮 `-3px` 并触发漫反射阴影与 1px 晶体微光跟随；
   * **时序级联瀑布入场 (Staggered Cascade)**：列表与卡片涌现采用 `50ms` 级联延迟（`animation-delay: calc(var(--i) * 50ms)`），带微缩放（`scale(0.96) -> 1`）涌现。
2. **Web Audio 触感微音律 (Tactile Audio)**：
   * 用户打字、新建笔记、切换标签时，触发 Web Audio 纯正弦微波衰减音（`800Hz ~ 1200Hz`，衰减时长 `40ms`，音量 `0.015`），提供极致沉浸感。
3. **Canvas 力导向图谱物理法则**：
   * 焦点节点：半径 `22px`，色值 `#D97706`，外圈带 `8px` 呼吸微光圈；
   * 引用节点：半径 `14px`，色值 `#0284C7`；
   * 物理场参数：向心引力系数 `0.0005`，节点斥力距离 `180px`，斥力系数 `0.08`，弹簧连线阻尼 `0.88`。

---

## 6. 负向禁令与反 AI 偏见 (Negative Constraints)

任何后续参与本项目的代码生成器，**必须严格遵守以下一票否决项**：

| 严厉禁止的错误模式 | 正确的工程实现 |
|---|---|
| **🚫 圆角容器加单侧粗色条**（如 `border-left: 3px solid`） | **✅ 全包围 1px 细微光线 + 柔和背景色阶 + `✦` 排版徽章** |
| **🚫 纯黑 `#000000` 或刺眼纯白 `#FFFFFF` 底层** | **✅ 永远使用有温度的羊皮纸暖白 `#FBF9F5` 与深曜石 `#0E1116`** |
| **🚫 滥用紫蓝霓虹大渐变 (The Lila Ban)** | **✅ 自然物理光泽、10% 暖金琥珀点缀、漫反射柔和阴影** |
| **🚫 滥用 Emoji 充当正式 UI 图标** | **✅ 严格使用统一 2px 线宽的矢量 SVG 图标** |
| **🚫 无节制的通栏横拉正文** | **✅ 正文行长严格限制在 `max-w-[65ch]`（50–75ch 舒适区间）以内** |
| **🚫 假数据模板 (Jane Doe / 99.9%)** | **✅ 必须使用具有真实认知深度、哲学与复杂系统语境的文本** |
