# UI 成品打磨与工程工艺规范

工艺是审美关系的物理兑现。美是关系的艺术，拙劣的工程代码会直接击碎原本设想的秩序与心流。
本规范包含三部分：**Anti-Slop 十四条工程军规与运行时性能守卫**、**组件 7 态契约** 与 **Pre-flight 真实观察审计流程**。

---

## ⛔ 一、Anti-Slop 十四条工程军规（施工红线）

任何交付的代码必须无条件通过这十四项防劣化检查：

### 1. 严禁 Emoji 充当 UI 符号（Anti-Emoji Policy）
- **致命反模式**：在按钮、卡片、标题中随意塞入 `🚀`、`🔥`、`🌱`、`✨`、`🎉` 等儿童玩具感 Emoji。
- **强制标准**：必须使用高精度矢量图标库（如 `@phosphor-icons/react`、`@radix-ui/react-icons`、`lucide-react`）或内联 SVG，统一描边与视重。

### 2. 严禁廉价 AI 紫蓝霓虹光晕（The Lila Ban）
- **致命反模式**：全黑背景配合大面积高饱和紫色/青色渐变发光按钮（AI Slop 典型特征）。
- **强制标准**：以低饱和中性底（Slate / Zinc / Charcoal）为骨架，主强调色只允许作为单点聚焦，饱和度控制在 80% 以内。

### 3. 严禁机械无脑居中排版（Anti-Center Bias）
- **致命反模式**：所有页面首屏机械式“标题居中 + 副标题居中 + 居中双按钮”。
- **强制标准**：依据业务流向优先采用 50/50 动态分屏、非对称留白或杂志流左对齐。

### 4. 严禁在动效中操作重排属性与散落泛滥（GPU Motion Invariant & Anti-Spam）
- **致命反模式**：对 `width`、`height`、`top`、`left`、`margin` 做动画（引发剧烈重排 Reflow 与卡顿）；给所有区块无脑套用淡入上浮（fade-and-slide-up），或给所有卡片机械堆砌悬停缩放（典型的廉价 AI Slop）。
- **强制标准**：
  1. 动画位移、缩放与渐变**必须且只能走 `transform`（`translate`, `scale`）和 `opacity`**（GPU 合成层处理）；
  2. 奉行 **“把大胆花在一个地方”**（Spend your boldness in one place），全页聚焦单一编排时刻（The Single Orchestrated Moment），其余界面静默专注；
  3. 微交互时长收敛在 `120ms ~ 200ms`，转场收敛在 `200ms ~ 280ms`，采用现代物理弹簧阻尼曲线（参考 [时间与运动规范](motion_tool.md)）；
  4. 严禁缺少 `@media (prefers-reduced-motion: reduce)` 降级保护。

### 5. 严禁移除键盘焦点环（Focus Ring Preserved）
- **致命反模式**：写 `outline: none` 或 `outline-transparent`，导致键盘导航用户完全失明。
- **强制标准**：所有可交互元素必须保留或定制高反差的 `:focus-visible` 焦点环（2px~4px），且确保弹窗或吸顶条不遮挡焦点（Focus not obscured）。

### 6. 严禁用 Placeholder 充当唯一的 Label
- **致命反模式**：表单输入框只有占位符，没有独立文字标签。输入内容后上下文立刻丢失。
- **强制标准**：必须包含带 `for="..."` 属性绑定的显式 `<label>`，占位符仅作为辅助输入示例。

### 7. 严禁灰底灰字低对比度（WCAG AA 4.5:1）
- **致命反模式**：在深灰底上写浅灰细字装“高级极简”，导致正常视力用户也无法轻松辨识。
- **强制标准**：正文与背景对比度必须无条件达到 **WCAG AA 4.5:1**（大标题至少 3:1）。

### 8. 严禁同一视窗并列多个 Primary 按钮
- **致命反模式**：同一卡片或首屏并列放置两个大实心强调色按钮，引发用户认知瘫痪。
- **强制标准**：核心主操作唯一（Primary），次级操作降级为 Secondary、Outline 或 Ghost；破坏性危险操作必须用 Destructive 并配合二次确认。

### 9. 严禁手绘虚假浏览器与系统 Chrome（Re-drawn Chrome Forbidden）
- **致命反模式**：手动在网页中绘制包含红黄绿三个小圆点的 fake browser 窗口或 fake terminal 装饰壳来假冒“高级感”。
- **强制标准**：使用真实产品截图（外包 `1px` 极细边框），或直接让内容自立，严禁手写儿童画般的 fake chrome。

### 10. 严禁大标题滥用斜体强调（No Italic Headers）
- **致命反模式**：在大标题中给某个单词使用斜体（如 `Built to <em>think</em>`）或全斜体 Display 大字（典型的 AI 油腻套路）。
- **强制标准**：大标题一律保持 Roman 正常字形，强调只能靠字重（Weight）或对比色表达；斜体仅允许在长篇正文行内作为极克制的语义强调。

### 11. 严禁无脑横排 3 等分卡片（No 3-Column Equal Cards）
- **致命反模式**：无论什么产品，第二屏必定是“3 张并列等大卡片”（AI 最偷懒的默认网格）。
- **强制标准**：采用 2 列错位 Zig-Zag、7:3 黄金分割非对称网格、列表裸排、或横向视口展卷。

### 12. 严禁虚构虚假指标与假背书（No Fabricated Metrics / Jane Doe）
- **致命反模式**：自动生成 `+47% 转化率提升`、`50,000+ 信任用户`、`99.99%`、`John Doe`、`Acme Corp` 等虚假陈词滥调。
- **强制标准**：没有真实数据时使用破折号 `—` 或标明待确认占位；数据展示采用有机杂乱数据（如 `47.2%`）。

### 13. 移动端全屏容器严禁使用 `h-screen`
- **致命反模式**：使用 `h-screen` 导致 iOS Safari 底部地址栏动态弹出/收起时页面剧烈跳跃崩塌。
- **强制标准**：必须且无条件使用现代化视口单位 **`min-h-[100dvh]`**。

### 14. 移动端严禁非预期的全局横向滚动（No H-Scroll）
- **致命反模式**：因固定像素容器（如 `w-[800px]`）导致移动端出现全局横向晃动。
- **强制标准**：使用 CSS Grid 自适应列；禁止固定像素宽容器；移动端必须且只能保持垂直流向。

### 15. React / Next.js / GPU 运行时性能守卫（Performance Guardrails）
- **依赖前置验证（Dependency Verification）**：在 import 任何第三方库（`framer-motion`, `@phosphor-icons/react`, `lucide-react`）前，必须先检查 `package.json`。若未安装，必须明确在代码前输出安装命令，严禁预设依赖已安装。
- **动效叶子节点隔离**：所有常驻循环微动效（Bento 活体卡片）必须封装在极小的叶子节点 Client Component 中（`'use client'`）并使用 `React.memo`，严禁触发父级布局组件的重新渲染（Re-render）。
- **光标动画脱离渲染树**：连续鼠标追踪（Magnetic / Spotlight）强制使用 Framer Motion 的 `useMotionValue` 与 `useTransform`，**严禁使用 React `useState` 记录 mousemove**（防止移动端掉帧崩溃）。
- **GPU 噪点层开销隔离**：Noise/Grain 滤镜必须严格挂载在 `fixed inset-0 z-50 pointer-events-none` 独立固定层，严禁作用在滚动容器上。

---

## 🔍 二、组件的 7 态契约与解剖规范

每一个核心交互组件（Button, Input, Card, Modal, Select）必须在代码中交代清楚 7 种状态：
1. **Default**（默认）：清晰的角色语义与物理边框；
2. **Hover**（悬停）：微妙的微动效反馈（微升、微亮，150ms 阻尼）；
3. **Focus-visible**（键盘聚焦）：高反差外环；
4. **Active**（按下/选中）：轻微下压或收缩反馈（`scale(0.98)`）；
5. **Disabled**（禁用）：降低不透明度（`opacity: 0.45`），禁止指针事件（`cursor: not-allowed`）；
6. **Loading**（加载中）：骨架屏（Skeletal Loader）或按钮文字切换为 Loading，阻止重复点击（严禁通用转圈 Spinner）；
7. **Empty / Error**（空态与错误）：输入框红色警示线伴随行内错误文案，空列表提供引导性占位。

**Anti-Card Overuse 军规**：当信息密度高时，**严禁无脑卡片嵌套卡片（No Card-in-Card）**。二级信息使用底色块、单像素分割线（`border-t` / `divide-y`）或负空间承载，不要套娃式堆叠卡片阴影。

---

## ⚖️ 三、Pre-emit 交付前 6 轴自省打分机制

在向用户提交最终页面代码前，必须在代码顶部输出自评注释，在以下 6 个轴向进行 1~5 分评分。**任何一项 < 3 分必须触发自动修正重构**：

```css
/* Muse · Pre-emit Self-Critique:
 * [P] Philosophy (关系契合): 5/5
 * [H] Hierarchy (层级骨力): 4/5
 * [E] Execution (代码工艺): 5/5
 * [S] Specificity (具体真实): 5/5
 * [R] Restraint (克制不自恋): 5/5
 * [V] Variety (拒绝模板化): 4/5
 */
```

---

## 👁️ 四、真实页面观察与关系审计流程

代码写完后，必须在真实尺寸与渲染下执行四步观察：

1. **缩览审视**：第一视觉落点是否对应业务主角？操作页是否被无意义大标题吞没？每个区块是否都均摊了相同重量？
2. **正常尺寸阅读**：中文排版断句、混排行宽（`max-w-[65ch]`）、负字距紧凑度。必要数据是否轻松可读？
3. **真实交互走查**：走通主要路径与错误恢复，下拉、弹窗、表单聚焦与关闭是否顺畅。
4. **窄屏与无障碍复查**：移动端触控靶心是否达到 `44×44px` 碰撞盒，相邻交互间距是否大于 `8px`；动效在 `@media (prefers-reduced-motion: reduce)` 下是否平稳降级为静态。

检查关键形式是否能指回 Content DNA，Distinctive Relation（如有）是否自然融入，Restraint Rule 是否守住主次。主要路径通畅、无 Anti-Slop 违规、表达恰当后即刻停止无休止的换皮。依照 [成品验收](../acceptance_protocol.md) 交付真实可信证据。
