# 时间、运动与感知物理学 (Time, Motion & Sensory Physics)

界面不是死板的纸板剪影，而是具有物理质量、刚度与弹性的有机实体。运动承担状态解释、空间连续性与触感反馈。**动效的最高境界是“既有呼之欲出的物理生命力，又绝不喧宾夺主阻碍任务”**。实现提示见 [UI 范式示范](ui_creative_arsenal.md)。

---

## 1. 核心动力学公理：告别单调平缓，引入真实弹簧物理

许多界面动效显得“弱小、死板”的根源，是过度使用了无回弹的线性或单一平缓刹车曲线。Muse 确立**双物理引擎法则**：

1. **实体弹簧引擎 (True Spring Engine · 实体交互默认值)**：
   * 凡是按钮、卡片、游标、气泡、弹窗与抽屉等**具有实体隐喻的物件**，必须具备带阻尼的弹性张力（Overshoot 微冲过回弹）：
     $$\text{Spring Transition}: \{\text{stiffness}: 120 \sim 180, \text{damping}: 16 \sim 22, \text{mass}: 0.8 \sim 1.0\}$$
   * 在纯 CSS 环境中，映射为带有微冲过的三次贝塞尔曲线：
     `--motion-spring: cubic-bezier(0.34, 1.35, 0.64, 1);`（轻快弹性）
     `--motion-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.2);`（微果冻质感）
2. **流体阻尼引擎 (Fluid Damping Engine · 背景与遮罩默认值)**：
   * 背景遮罩、页面全局滚动、深浅主题切换等大面积非实体，使用平滑刹车的缓出曲线：
     `--motion-fluid: cubic-bezier(0.16, 1, 0.3, 1);`（无振荡刹车）

---

## 2. 三层动效空间韵律 (Three Spatial Tiers)

动效按作用域分为三层，严禁混层乱动：

### 2.1 微观层：触感反馈与物理微按压 (Micro-Feedback · $\le 180\text{ms}$)
* **按压机械感**：按钮 `:active` 态必须有物理下沉（`translateY(1px) scale(0.96)`），松开时伴随弹簧迅速回弹到位，提供清晰的机械触觉确认。
* **光标引力与动态高光 (Magnetic & Border Shimmer)**：鼠标靠近核心行动按钮或 Bento 卡片时，元素产生 $\le 6\text{px}$ 的微弱磁力吸附跟随；1px 边缘高光随着光标移动折射出柔和的漫反射微光。
* **触感微音律联觉 (Tactile Audio Synthesis)**：在关键动作（发送、切换 Tab、保存成功）时，调用浏览器 Web Audio 合成超低音量、短促克制的纯正弦波衰减音（$800\text{Hz}\sim 1100\text{Hz}$，时长 $\le 40\text{ms}$，音量 $\le 0.01$），像高端相机快门般瞬间确立高级硬件质感。

### 2.2 中观层：状态流变与活体卡片 (State Morphing · $200\text{ms} \sim 320\text{ms}$)
* **状态自适应形变 (Layout Morphing)**：杜绝突兀的内容替换。点击“保存”或“生成”时，按钮宽度与形状平滑拉伸变形为加载胶囊或状态条，而非粗暴刷新。
* **游标滑块流体跟随 (Sliding Pill Indicator)**：视图切换器、导航选项卡的选中态背景滑块（`.motion-selection`），在选项间移动时带有轻微的水平拉伸与回弹，形成如水滴般的流体张力。
* **活体呼吸微状态**：核心指标卡片、系统状态点带有微弱的呼吸发光（周期 $2\text{s} \sim 3\text{s}$），赋予系统“正在运转”的有机生命力。

### 2.3 宏观层：级联时序编排 (Orchestration & Cascade · $320\text{ms} \sim 480\text{ms}$)
* **视线瀑布流级联入场 (Staggered Cascade)**：列表项、Bento 卡片、对话消息入场时，严禁整页生硬刷出，而是按 $50\text{ms} \sim 80\text{ms}$ 级联递延展开：
  `animation-delay: calc(var(--index) * 60ms);`
  起始帧带微缩放与微位移（`scale(0.96) translateY(14px)`），借由弹簧曲线涌现入场。
* **全页焦点唯一律**：一屏之内最多**一个**主要活体编排点，其余界面保持安静克制，避免视觉疲劳。

---

## 3. 工程底线与性能护栏 (Engineering Guardrails)

无论动效多么生动，工程性能与可用性底线绝对不可退让：

1. **只驱动合成器图层**：所有动画过渡**必须且只能作用于 `transform` 与 `opacity`**；绝对禁止过渡 `top`、`left`、`width`、`height`、`margin`、`padding` 等引发重排（Reflow）的几何属性。
2. **拒绝盲目全量过渡**：明确声明参与过渡的属性（如 `transition: transform 200ms var(--motion-spring), opacity 200ms ease;`），**严禁使用 `transition: all`**。
3. **渲染热路径隔离**：光标追踪、磁力悬停与粒子必须通过原生 Direct DOM 或独立图层处理，严禁塞入 React 等框架的核心渲染循环（如 `useState`）中引发每秒 60 次的全树重绘。
4. **无条件支持减弱动态 (Reduced Motion)**：
   必须声明 `@media (prefers-reduced-motion: reduce)`：
   * 所有位移与缩放直接停留在最终位置；
   * 移除交错延迟与循环旋转；
   * Web Audio 微音与光晕跟随自动静默；
   * 保证在零动效下所有功能和信息结构完整可用。
5. **连续操作可打断**：高频交互（键盘连击、快速翻页、多次点击）必须立即打断旧动画并响应最新动作，绝不能强迫用户等待动效播完。

---

## 4. 交付与验收 (Critique & Acceptance)

必须在真实浏览器运行环境下观察动效从“触发 ➔ 展开 ➔ 回弹 ➔ 静止”的全生命周期：
* 是否具备扎实的物理质感与弹性反馈？
* 是否产生任何掉帧或几何重排（Reflow）？
* 在快速连续操作下是否能够被即时打断且手感清脆？
* 在开启系统减弱动态偏好时是否优雅降级？

