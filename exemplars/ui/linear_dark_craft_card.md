# 标杆案例：Linear 官方设计语言完整逆向解析 (UI / Linear.app)

**来源**：GitHub [Laith0003/ux-skill](https://github.com/Laith0003/ux-skill) (`references/brands/linear.app.md` & `data/brands/linear.app.json`)  
**状态**：真实工程逆向采集（非 AI 虚构）  
**核心哲学**：A near-black product-focused canvas built around `#010102` (全库最深暗黑底色)，以轻灰文本（`#f7f8f8`）为主，单一薰衣草蓝（`#5e6ad2`）作为全站唯一的彩色高光。

---

## 1. 真实 Design Tokens 矩阵 (Ground Truth)

### 色板阶梯 (Surface Ladder)
Linear 的核心精髓是：**完全不靠脏阴影，纯靠 4 阶表面阶梯（Surface Ladder）建立纵深**：
```css
:root {
  /* Canvas: 全库最深底色，纯黑带微弱蓝冷调 */
  --linear-canvas: #010102;
  
  /* 4 阶抬升表面 (Surface Ladder) */
  --linear-surface-1: #0f1011; /* 特性卡片、截图面板底色 */
  --linear-surface-2: #141516; /* 高亮卡片、Hover 悬浮态 */
  --linear-surface-3: #18191a; /* 嵌套子菜单、行辅助背景 */
  --linear-surface-4: #191a1b; /* 最高浮起层级 */

  /* 1px 细发丝边框 (Hairline) */
  --linear-hairline: #23252a;          /* 常规卡片 1px 边框 */
  --linear-hairline-strong: #34343a;   /* 输入框聚焦与高亮边框 */
  --linear-hairline-tertiary: #3e3e44; /* 嵌套分隔线 */

  /* 文字阶梯 (Ink) */
  --linear-ink: #f7f8f8;          /* 标题与主要正文 */
  --linear-ink-muted: #d0d6e0;    /* 次级说明 */
  --linear-ink-subtle: #8a8f98;   /* 辅助元数据 */
  --linear-ink-tertiary: #62666d; /* 禁用与底层标签 */

  /* 单一彩色品牌点睛 (Single Chromatic Accent) - 严禁乱加第二种颜色 */
  --linear-primary: #5e6ad2;       /* 标志性薰衣草蓝 (CTA、焦点环、品牌标) */
  --linear-primary-hover: #828fff; /* Hover 提亮态 */
  --linear-primary-focus: #5e69d1; /* 按下与聚焦态 */
  --linear-semantic-success: #27a644; /* 唯一的语义绿，仅用于状态小圆点 */
}
```

### 排版负字距阶梯 (Negative Letter-Spacing Scaling)
AI 默认不会调节字距，而 Linear 极度工匠感的秘密在于：**字号越大，字距收得越紧**：
* `display-xl (80px)`: `letter-spacing: -3.0px; line-height: 1.05;`
* `display-lg (56px)`: `letter-spacing: -1.8px; line-height: 1.10;`
* `display-md (40px)`: `letter-spacing: -1.0px; line-height: 1.15;`
* `headline (28px)`: `letter-spacing: -0.6px; line-height: 1.20;`
* `card-title (22px)`: `letter-spacing: -0.4px; line-height: 1.25;`
* `body (16px)`: `letter-spacing: -0.05px; line-height: 1.50;`
* `mono (13px)`: `font-family: 'Linear Mono', monospace; letter-spacing: 0;`

### 圆角黄金律
* 卡片一律使用 **12px 圆角（`rounded-lg`）配合 1px 发丝边框**；
* 截屏大面板使用 **16px 圆角（`rounded-xl`）**；
* 按钮使用 **8px 圆角（`rounded-md`）**；
* 只有切换 Tab 使用胶囊圆角（`rounded-full`），卡片绝不使用大圆角。

---

## 2. 真实生产级组件源码 (Production Code)

### (1) Linear 标准特性卡片 (`feature-card`)
```html
<div class="relative flex flex-col justify-between p-6 rounded-[12px] bg-[#0f1011] border border-[#23252a] hover:border-[#34343a] hover:bg-[#141516] transition-all duration-150 ease-out group">
  <!-- 顶部微阶差标题与元标签 -->
  <div class="flex items-center justify-between gap-2 mb-6">
    <span class="text-[13px] font-mono text-[#8a8f98] tracking-normal">Cycles</span>
    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono text-[#f7f8f8] bg-[#141516] border border-[#23252a]">
      <span class="w-1.5 h-1.5 rounded-full bg-[#27a644]"></span>
      Current
    </span>
  </div>

  <h4 class="text-[22px] font-medium text-[#f7f8f8] tracking-[-0.4px] leading-[1.25] mb-2">
    Focus on what matters now
  </h4>
  <p class="text-[14px] text-[#8a8f98] leading-[1.5] mb-8">
    Cycles track work across teams over 1–4 week periods, helping you balance velocity and focus.
  </p>

  <!-- 8 态闭环微交互操作按钮 -->
  <button 
    type="button" 
    class="w-full inline-flex items-center justify-center h-8 px-3.5 rounded-[8px] text-[13px] font-medium text-[#f7f8f8] bg-[#141516] border border-[#23252a] hover:bg-[#18191a] hover:border-[#34343a] active:bg-[#191a1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010102] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-120"
  >
    Configure Cycle
  </button>
</div>
```

### (2) Linear 标志性主操作按钮 (`button-primary`)
```html
<button 
  type="button" 
  class="inline-flex items-center justify-center h-9 px-4 rounded-[8px] text-[14px] font-medium text-white bg-[#5e6ad2] hover:bg-[#828fff] active:bg-[#5e69d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010102] transition-colors duration-120 select-none cursor-pointer"
>
  Sign up for Linear
</button>
```

---

## 3. GitHub 逆向团队提炼的 Anti-Patterns (避坑指南)

1. ❌ **严禁做浅色版（Don't ship a light-mode marketing page）**：
   * Linear 的整套软件美学基石就是 `#010102` 极致黑曜石，浅色会直接破坏其软件工匠的冷峻感。
2. ❌ **严禁将薰衣草蓝作为大面积背景色（Don't use lavender as a section background or card fill）**：
   * 薰衣草蓝只能作为单点高光（CTA 按钮、Logo、焦点环），一旦变成大面积色块，立刻沦为俗套 SaaS。
3. ❌ **严禁引入第二种彩色高光（No second chromatic accent）**：
   * 严禁红橙黄绿青蓝紫乱撞，全站除了唯一的 `#5e6ad2`，其余所有元素全部退回到 Slate/Monochrome 中性灰阶。
4. ❌ **严禁使用大面积阴影（No Heavy Dropshadows）**：
   * 严禁 `box-shadow: 0 20px 50px ...`，靠 `#010102 ➔ #0f1011 ➔ #141516` 表面抬升讲层级。
