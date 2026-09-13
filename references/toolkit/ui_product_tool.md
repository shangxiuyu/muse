# UI 与产品界面手段库 (UI & Product Craftsmanship Toolkit)

> 本手段库提炼自顶级品牌规范（Linear / Stripe / Vercel / Apple / Raycast）与 Anti-Slop 工业级最佳实践。
> 严禁生成未经调优的粗糙原型，所有 UI 必须满足以下 **工业级工艺标准 (Craftsmanship Standard)**。
>
> 🏛️ **流程前置要求**：
> 1. 先由 [ui_blueprint_protocol.md](ui_blueprint_protocol.md) 执行 **Phase 0 用户画像推导** 与 **Phase 1 四维设计蓝图**；
> 2. 由 [archetypes.md](../archetypes.md) 选取 1 种页面拓扑骨架（遵守 `vault/topology_log.yaml` 轮换纪律），从物理结构上杜绝居中三板斧与单调卡片堆叠。

---

## 📐 1. 顶级品牌 4 大 Design Token 矩阵 (Brand Archetype Presets)

根据业务场景（decision_matrix）与用户画像，直接挂载或派生以下工业级 Token 矩阵：

### 预设 A：`linear-dark` (深曜石极简工匠 · 开发者/SaaS 标杆，源自 Laith0003/ux-skill 逆向数据)
```css
:root[data-theme="linear-dark"] {
  /* 真实 Linear 画布为极端纯黑 #010102 */
  --bg-canvas: #010102;
  /* 4 阶表面灰度天梯：依靠灰度梯差与边框表达空间，零脏阴影 */
  --bg-surface-1: #0f1011;
  --bg-surface-2: #141516;
  --bg-surface-3: #18191a;
  --bg-surface-4: #191a1b;
  
  --border-hairline: #23252a;
  --border-subtle: #18191b;
  --border-highlight: rgba(255, 255, 255, 0.14);
  
  --text-primary: #ffffff;
  --text-secondary: #8a8f98;
  --text-tertiary: #62666d;
  
  /* 单一高饱和重点色 (Electric Indigo)，严禁第二彩色杂音 */
  --accent: #5e6ad2;
  --accent-surface: rgba(94, 106, 210, 0.12);
  --accent-hover: #6872e5;

  /* 严禁扩散大阴影，只保留极简 1px 或零阴影 */
  --shadow-micro: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-card: 0 0 0 1px var(--border-hairline);
  --shadow-inner-bevel: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);

  /* Linear 负字距标尺 (Display Negative Tracking) */
  --tracking-display: -0.035em; /* 对应大标题 56-80px */
  --tracking-heading: -0.025em; /* 对应小标题 24-40px */
  --tracking-body: -0.005em;    /* 正文 */
}
```

### 预设 B：`stripe-modern` (现代空气感 · 支付/金融/C端标杆，源自 Laith0003/ux-skill 逆向数据)
```css
:root[data-theme="stripe-modern"] {
  /* 真实 Stripe 画布为带微蓝冷意的纯净底色 #f6f9fc，绝非纯白 */
  --bg-canvas: #f6f9fc;
  --bg-surface: #ffffff;
  --bg-subtle: #e3e8ee;
  
  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-highlight: rgba(255, 255, 255, 0.9);

  /* 文本为深邃藏青墨色 #0d253d，绝非刺眼死黑 #000 */
  --text-primary: #0d253d;
  --text-secondary: #425466;
  --text-tertiary: #8898aa;

  /* Stripe 标志性电光靛蓝 */
  --accent: #533afd;
  --accent-surface: #f4f3ff;
  --accent-hover: #432cd9;

  --shadow-micro: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-card: 0 2px 4px rgba(0, 0, 0, 0.04), 0 12px 24px -6px rgba(0, 0, 0, 0.06);
  --shadow-inner-bevel: inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
}
```

### 预设 C：`apple-editorial` (人文纸质大字 · 创作者/官网/阅读)
```css
:root[data-theme="apple-editorial"] {
  --bg-canvas: #fbf9f6;
  --bg-surface: #ffffff;
  --bg-subtle: #f4f0eb;
  --border-subtle: rgba(25, 22, 21, 0.07);
  --border-highlight: rgba(255, 255, 255, 0.8);

  --text-primary: #191615;
  --text-secondary: #5c534e;
  --text-tertiary: #8c827a;

  --accent: #b87c4c;
  --accent-surface: rgba(184, 124, 76, 0.1);

  --shadow-micro: 0 1px 2px rgba(25, 22, 21, 0.04);
  --shadow-card: 0 1px 3px rgba(25, 22, 21, 0.05), 0 8px 24px -4px rgba(25, 22, 21, 0.06);
  --shadow-inner-bevel: inset 0 1px 0 0 var(--border-highlight);
}
```

### 预设 D：`vercel-mono` (硬核黑白几何 · 极客/DevTools)
```css
:root[data-theme="vercel-mono"] {
  --bg-canvas: #000000;
  --bg-surface: #0a0a0a;
  --bg-subtle: #171717;
  --border-subtle: #333333;
  --border-highlight: #555555;

  --text-primary: #ededed;
  --text-secondary: #888888;
  --text-tertiary: #555555;

  --accent: #ffffff;
  --accent-surface: rgba(255, 255, 255, 0.1);

  --shadow-micro: none;
  --shadow-card: 0 0 0 1px var(--border-subtle);
  --shadow-inner-bevel: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
}
```

### 预设 E：`oriental-zen` (东方写意留白 · 文化/艺术/茶道/人文出版)
```css
:root[data-theme="oriental-zen"] {
  --bg-canvas: #f7f4ed; /* 米暖生宣纸色 */
  --bg-surface: #ffffff;
  --bg-subtle: #eeeae1;
  --border-subtle: rgba(28, 26, 23, 0.07);
  --border-highlight: rgba(255, 255, 255, 0.95);

  --text-primary: #1c1a17; /* 焦墨黑 */
  --text-secondary: #5c5750; /* 宿墨深灰 */
  --text-tertiary: #9e978d; /* 飞白浅灰 */

  --accent: #c25e40; /* 朱砂赤印 */
  --accent-surface: rgba(194, 94, 64, 0.08);

  --shadow-micro: 0 1px 2px rgba(28, 26, 23, 0.03);
  --shadow-card: 0 2px 8px -2px rgba(28, 26, 23, 0.04), 0 12px 24px -6px rgba(28, 26, 23, 0.05);
  --shadow-inner-bevel: inset 0 1px 0 0 var(--border-highlight);
}
```

### 预设 F：`neo-brutalism` (新粗野主义 / 先锋朋克 · Web3/潮流厂牌/极客先锋)
```css
:root[data-theme="neo-brutalism"] {
  --bg-canvas: #fef08a; /* 波普高亮黄或纯白 #ffffff */
  --bg-surface: #ffffff;
  --bg-subtle: #f4f4f5;
  --border-subtle: #000000;
  --border-highlight: transparent;

  --text-primary: #000000;
  --text-secondary: #27272a;
  --text-tertiary: #52525b;

  --accent: #ff4b4b; /* 撞色高饱和红 */
  --accent-surface: #000000;

  --shadow-micro: 2px 2px 0px #000000;
  --shadow-card: 4px 4px 0px #000000; /* 硬边缘无模糊阴影 */
  --shadow-elevated: 6px 6px 0px #000000;
  --shadow-inner-bevel: none;
}
```

---

## 💎 2. 核心质感与微工艺规范 (Micro-Craftsmanship)

### (1) 物理光影与内发光配方
* **1px 顶光内描边 (Top Inset Highlight)**：科技与纸质容器顶部必须带 `inset 0 1px 0 0 var(--border-highlight)`，模拟物理单侧光反光（粗野主义除外）。
* **分层微阴影 (Layered Micro-Shadows)**：杜绝单层粗黑死投影，主流模式必须采用 2~3 层环境漫反射叠加。
* **圆角纪律**：默认 4px-8px 微圆角（对齐 `tight_subtle` 偏好），粗野主义优先直角（0px）或强硬大圆角配 2px 黑边。
* **阅读行长限制 (< 80ch)**：正文行宽严格约束在 `max-width: 65ch ~ 80ch` 之间，留足视线回行余量，禁止无边际满宽文字。
* **CSS 选择器权重避坑 (Specificity Discipline)**：严禁标签类选择器（如 `.section`）与元素类选择器（如 `.cta`）在 `padding/margin` 上产生隐式冲突覆盖。

### (2) 统一物理动效参数 (Spring Motion Tuning)
```css
:root {
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-snap: 120ms;   /* 点击、微交互 */
  --duration-smooth: 220ms; /* 浮现、折叠、卡片过渡 */
  --duration-deep: 420ms;   /* 页面入场、大模态框 */
}
```

---

## 🧩 3. 生产级组件状态机与防崩规范 (Robust Components)

### (1) 交互组件 8 态闭环检查表
所有可交互组件（Button / Input / Tab / Card）**必须显式提供以下 8 种状态样式**：

| # | 状态 | 规范与代码实现 |
|---|---|---|
| 1 | `default` | 包含 1px 顶光内描边与微阴影，稳健高雅 |
| 2 | `hover` | `transform: translateY(-1px);` + 阴影扩展 + 边框高亮 |
| 3 | `active` | 瞬时物理微缩：`transform: scale(0.98) translateY(0.5px);` |
| 4 | `focus-visible` | 必须带键盘导航轮廓：`outline: 2px solid var(--accent); outline-offset: 2px;` |
| 5 | `disabled` | `opacity: 0.4; cursor: not-allowed; pointer-events: none;` |
| 6 | `loading` | 骨架屏扫光波或微型 Spinner，文本保持占位不抖动 |
| 7 | `error` | 语义红描边 + 错误提示气泡/行内文本 |
| 8 | `empty` | 空数据占位，包含引导性图标 + 说明文案 + 行动邀请 CTA |

#### 8 态工业级极简脚手架 (Minimal 8-State Code Spec)
为避免代码冗长导致输出被截断，在生成组件时可严格套用以下紧凑模式：

```css
/* 1. default: 顶光内描边 + 物理微阴影 + 字体微阶 */
.c-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08), var(--shadow-micro);
  transition: all var(--duration-snap) var(--ease-spring);
  cursor: pointer;
  user-select: none;
}
/* 2. hover & 3. active */
.c-btn:hover:not(:disabled) { border-color: var(--border-highlight); transform: translateY(-1px); }
.c-btn:active:not(:disabled) { transform: scale(0.98) translateY(0.5px); }
/* 4. focus-visible */
.c-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* 5. disabled */
.c-btn:disabled, .c-btn[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
/* 6. loading */
.c-btn[data-loading="true"] { pointer-events: none; color: transparent !important; }
.c-btn[data-loading="true"]::after {
  content: ""; position: absolute; width: 14px; height: 14px;
  border: 2px solid var(--text-secondary); border-top-color: transparent; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
/* 7. error */
.c-btn[data-state="error"], .c-input[data-state="error"] { border-color: #ef4444 !important; }
/* 8. empty (容器状态示范) */
.c-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; text-align: center; border: 1px dashed var(--border-subtle); border-radius: 8px;
}
```

### (2) 防御性工程代码片段 (Defensive CSS)

#### ① 文本溢出截断 (Text Truncation)
```css
.truncate-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

#### ② 骨架屏扫描光波 (Shimmer Wave Effect)
```css
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-subtle) 0%,
    var(--bg-surface) 50%,
    var(--bg-subtle) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite var(--ease-spring);
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 🌟 6. The Wow Layer 记忆锚点法则 (Ceiling Doctrine)

> **汲取自 GitHub `Laith0003/ux-skill/references/foundations/wow.md`**：
> "Clean and responsive is the floor. It prevents failure; it does not produce love. The wow layer is the ceiling."
> 仅仅把功能做对、对齐网格，只能算 60 分及格。真正令人惊艳的顶级产品必须具备 2-3 个精心编排的记忆锚点：

1. **One Dominant Entrance Moment (首屏震撼入场焦点)**：
   - 拒绝平铺直叙：首屏必须有一个强烈的视觉张力点（如压倒性的悬殊字号、负字距紧绷排印、极高反差的实时物理数据态）。
2. **One Recurring Motion Signature (全站一致的微动效签名)**：
   - 全站所有按钮、弹窗、抽屉必须共享同一个弹簧物理阻尼（如 `cubic-bezier(0.16, 1, 0.3, 1)`），形成如同物理机械按键一般的肌肉记忆。
3. **One Mid-Page Interactive Delight (中段意外惊喜)**：
   - 在用户滚动或探索至页面中段时，提供一个超出预期的交互反馈（例如拖拽数字实时计算、悬停磁吸、极度细腻的微阴影顺应光标位移）。

