# 时间与运动规范（Motion & Animation System）

运动承担反馈、空间连续性、注意力或情绪。动效不是为了“看起来很炫”而堆砌的装饰，而是**审美关系的物理兑现与信息任务的向导**。

---

## 一、核心哲学与克制法则（The Restraint Principles）

### 1. 把大胆花在一个地方（Spend your boldness in one place）
- **反 AI 模板化（Anti-AI Slop Motion）**：严禁无脑为每个区块套用“淡入上浮（fade-and-slide-up）”，严禁给所有卡片机械叠加悬停缩放（hover transition spam）。这会造成视觉噪声膨胀与廉价感。
- **单点编排时刻（The Single Orchestrated Moment）**：整页视觉能量收敛于**一个精心编排的中心时刻**（如 Hero 开屏揭示、核心数据流演进、或核心产品形态展开）。其余界面保持静默克制。

### 2. 行为响应驱动（Action-Driven Continuity）
- **回答用户动作**：动效必须解答用户的操作行为（打开、展开、拖拽、确认），清晰展示“界面中究竟什么状态被改变了”。
- **高频操作零入场**：后台管理、高密度数据表格、静态阅读界面严禁在翻页或加载时反复播放长入场动画。
- **随时可被用户打断（Interruptibility）**：动效绝不能阻塞交互主路径，连续操作必须支持立即打断与重定向，绝不让用户等待动画结束。
- **内容默认可见（Content First）**：正文与关键数据默认处于可见态，动效只作为渐进增强（Progressive Enhancement）。严禁因动画未触发或脚本失败导致正文永久隐藏。

---

## 二、物理弹簧动力学与参数系统（Spring Physics & Tokens）

贝塞尔缓动只是一条曲线插值，不等于真实的物理世界。现代高级交互推崇具有**实体分量感（Weight & Resistance）**的弹簧动力学体系。

### 1. 物理阻尼与缓动规范对照表

| 动效阶梯 | 适用场景 | CSS 缓动 Token / 推荐值 | Framer Motion 物理配置 | 目标质感 |
| :--- | :--- | :--- | :--- | :--- |
| **微交互反馈** | 按钮悬停、按下（Active）、选择高亮 | `--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)`（120~180ms） | `{ type: "spring", stiffness: 400, damping: 28 }` | 迅捷贴手，毫无粘滞与拖泥带水 |
| **空间形态转换** | 抽屉拉出、折叠展开、模态弹窗 | `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`（200~280ms） | `{ type: "spring", stiffness: 100, damping: 20 }` | 沉稳自然，末端带有平滑吸附减速 |
| **显眼状态通知** | Toast 弹出、徽标通知、角标上浮 | `--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)`（250~350ms） | `{ type: "spring", stiffness: 300, damping: 15 }` | 微妙的过冲弹性（Overshoot），精准抓眼 |
| **环境呼吸/后台** | 状态指示灯、网格流光、波纹光晕 | `ease-in-out`（2.5s ~ 4s 循环） | `{ repeat: Infinity, duration: 3, ease: "easeInOut" }` | 低调宁静，绝不抢占视觉焦点 |

---

## 三、Bento 2.0 五大核心动效原型（The 5 Motion Archetypes）

在构建高阶展示页、功能卡片或 Bento Grid 时，使用以下标准动效原型来传达“活体界面（Alive UI）”质感，严禁空洞的通用轮播：

### 1. 智能重排列表（The Intelligent List）
- **意图**：模拟 AI 动态排序或实时任务分派。
- **表现**：列表项依据权重或事件触发平滑位置互换（使用 `layoutId` 或 FLIP 机制），配合高度自适应动画与 1px 细微微光闪烁，交代前后因果。

### 2. 指令打字机与流光解析（The Command Input）
- **意图**：展示 AI 交互、终端命令或全局检索。
- **表现**：多步打字机自动键入（Typewriter），尾随平滑闪烁光标；处理状态时卡片边框或底部进度条伴随微妙的流光移动（Shimmer，100% 宽度扫过），结束后平稳淡出。

### 3. 活体状态与过冲通知（The Live Status）
- **意图**：展示系统运行状况、实时调度或健康度。
- **表现**：低饱和核心圆点带有微微扩张的呼吸光晕环（`pulse-ring`，2.5s）；动态事件触发时，角标以 `scale(0.8 -> 1.05 -> 1.0)` 的过冲阻尼弹出，停留数秒后向右上平滑收拢消失。

### 4. 无缝数据流（The Wide Data Stream）
- **意图**：连续流转的指标、客户证言或技术特征展示。
- **表现**：水平方向的无缝无限滚动轮播（利用 `transform: translateX(0% to -50%)`），匀速、轻柔且恒定；鼠标悬停时平滑减速停滞，移开后恢复流动。

### 5. 聚焦交错与浮动感知（The Contextual Focus）
- **意图**：深度阅读模式、代码高亮或重点文档标注文案。
- **表现**：文字区块进行逐段交错微光高亮（Stagger Highlight），紧随其后一个悬浮控制条（Floating Action Bar）以 `translateY(12px -> 0)` 与 `opacity` 柔和浮起并吸附就位。

---

## 四、高阶微交互与手势模式库（Pattern Catalog）

实现高品质交互组件时，严格遵循以下基于 GPU 加速的模式实现：

* **磁力吸附按钮（Magnetic Button）**：
  光标接近核心 CTA（如 Primary 按钮）时，按钮在 `±8px` 范围内跟随光标产生轻度引力吸引，光标移出后通过弹簧曲线（Spring）迅速回弹归位。
* **光斑跟踪描边卡片（Spotlight Border Card）**：
  卡片背景保持纯净，边框通过 CSS 渐变遮罩 `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ...)` 仅在光标附近产生微弱高亮，营造实体质感。
* **3D 视差微倾斜（Parallax Tilt Card）**：
  鼠标在卡片上方滑动时，通过 `transform: perspective(1000px) rotateX(...) rotateY(...)` 产生不超过 `4deg` 的细腻微倾斜，严禁幅度过大导致正文变形失真。
* **按钮无缝变形弹窗（Morphing Modal）**：
  触发按钮通过共享边界过渡为全屏/半屏对话框，退出时准确收缩回原始按钮坐标，并把键盘焦点完璧归赵。

---

## 五、工程物理红线与性能隔离（GPU Motion Invariant）

拙劣的工程实现会瞬间摧毁任何优秀的动效设计：

1. **绝对禁止触发重排（Zero-Reflow Guarantee）**：
   - 动画位移、缩放与渐变**必须且只能走 `transform`（`translate`, `scale`）和 `opacity`**。
   - 严禁对 `width`, `height`, `top`, `left`, `margin`, `padding` 进行过渡与 keyframe 动画。
2. **显式声明属性（Avoid `transition: all`）**：
   - 明确声明具体变化的属性（如 `transition: transform 0.2s var(--ease-spring), opacity 0.2s ease`），便于精确追踪渲染开销。
3. **独立组件与渲染隔离（Micro-Component Isolation）**：
   - 任何永续循环动画（如呼吸灯、跑马灯、无限轮播）必须严格封装隔离在微型纯渲染子组件或独立 GPU 图层（`will-change: transform`）中，**严禁触发外层业务容器的重新渲染（Re-render）**。

---

## 六、无障碍与强制降级矩阵（Reduced Motion Matrix）

Muse 对无障碍降级实施**一票否决权**。任何动画代码必须无条件声明 `@media (prefers-reduced-motion: reduce)`：

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 降级策略对照表
| 正常动效 | 减弱动效（Reduced Motion）模式下的表现 |
| :--- | :--- |
| **位移与展开**（Slide, Float, Tilt） | 立即出现在最终位置，保留瞬时纯透明度（Opacity）过渡或直接呈现 |
| **永续循环**（Pulse, Shimmer, Carousel） | 完全停止动态，以静态高精度矢量或单色稳定状态展现 |
| **交错延迟**（Stagger Delay） | 移除所有延迟时差，全部元素一次性同步就绪 |
| **加载状态**（Spinner, Progress） | 保持最简洁的文本提示（如“正在加载...”）或静态进度条，避免眩晕 |

---

## 七、真实验收与防虚构协议（Observation Protocol）

1. **动效体验成立的三要素**：必须在真实运行环境中，完整观察到动效的**开始状态、中间插值状态、结束终止状态**。
2. **代码不等于体验**：
   - 浏览器 computed style 仅证明属性被解析，不证明视觉体验成立；
   - 静态截图仅证明单帧正确，无法证明插值过程是否丢帧卡顿；
   - 必须通过实际交互操作，确认动画不抢占焦点、不遮挡内容、可被打断、且在 60~120FPS 下流畅运行。
