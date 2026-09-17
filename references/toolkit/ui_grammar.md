# UI 美学文法与生成公理 (Aesthetic Grammar & Axioms)

本文件是 Muse UI 系统的**底层计算公理库**。它融合了 `taste-skill` 的物理感知参数与生成式设计代数。AI 在进行任何界面设计时，必须依据本公理进行动态推导，严禁脱离情境机械套用死板代码。

---

## 1. 三大设计控制旋钮 (The 3 Dials Engine)

在推导任何页面前，必须根据业务场景首先锁定三个全局标量（1-10）：

### 1.1 DESIGN_VARIANCE（结构偏离度 · 1 至 10）
* **1-3 (规整对称)**：严格 12 列对称网格，等距 Padding，适合严谨财务、企业后台；
* **4-7 (有机错落)**：允许 `margin-top: -2rem` 重叠浮层、多样化图片宽高比（4:3 与 16:9 并置）、左对齐标题配合右侧数据；
* **8-10 (激进非对称)**：Bento 瀑布流、分数比例栅格（如 `2fr 1fr 1fr`）、留白不对称布局；
* **📱 移动端强制覆写 (Mobile Override)**：当级别 $\ge 4$ 时，在屏幕宽度 $< 768\text{px}$ 的视口下，**必须强制降级为单列纵向流（`w-full`, `px-4`, `py-8`）**，严禁产生横向滚动溢出。

### 1.2 MOTION_INTENSITY（动效烈度 · 1 至 10）
* **1-3 (静默克制)**：零自动动画，仅保留 CSS `:hover` 与 `:active` 态微反馈；
* **4-7 (流体物理)**：全量统一 Spring 弹簧过渡 `cubic-bezier(0.16, 1, 0.3, 1)`，加载时使用级联延迟（`animation-delay: calc(var(--i) * 80ms)`）；
* **8-10 (高级编排)**：滚动触发揭示、连续微物理悬停、Canvas 粒子联动。

### 1.3 VISUAL_DENSITY（视觉密度 · 1 至 10）
* **1-3 (艺术画廊模式)**：巨幅呼吸留白，Section 间距 $\ge 80\text{px}$，极度通透；
* **4-7 (日常应用模式)**：标准 $16\text{px} \sim 24\text{px}$ 卡片 Padding，清晰层级；
* **8-10 (极客驾驶舱模式)**：极小 Padding，**严禁卡片嵌套**，改用 1px 细线（`divide-y`）分割；**所有数字指标强制使用等宽字体（`font-mono`）**。

---

## 2. 空间与模度代数 (Spatial Algebra)

### 2.1 模度基线公理 (The Modular Grid)
* 所有尺寸、Padding、Margin 必须严格满足 $N \times 4\text{px}$ 或 $N \times 8\text{px}$ 模度阶梯：
  $$\text{Space} \in \{4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128\}\text{px}$$
* 严禁出现 `13px`、`17px`、`27px` 等破坏视觉节奏的随意尺寸。

### 2.2 黄金呼吸比 (The 45:55 Breathing Ratio)
* 任何卡片或信息块内，**留白面积与实际内容像素面积的比例必须维持在 40:60 至 50:50 之间**。
* 单个信息单元内的视觉深度限制在 $\le 3$ 级（主指标、辅助正文、元标签）。

---

## 3. 光学与物理真实材质 (Sensory Physics)

### 3.1 单一虚拟光源定律 (Single Light-Source Conservation)
* 整页所有阴影与倒角高光方向，必须严格锁定在同一个光源向量（标准自然顶光 $90^\circ$ 或 $135^\circ$）。

### 3.2 真实毛玻璃折射 (Liquid Glass Refraction)
超越单纯的 `backdrop-blur`，必须配合 1px 内边框与微内高光，模拟真实的边缘折射：
```css
/* Liquid Glass 真实毛玻璃标准范式 */
.liquid-glass {
  background: rgba(18, 21, 27, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
              0 20px 40px -15px rgba(0, 0, 0, 0.3);
}
```

### 3.3 漫反射衰减方程 (Diffuse Shadow Decay)
* 阴影物理扩散满足 $\text{Blur} \ge 2 \times Y_{\text{offset}}$，深色底 Alpha $\le 0.4$，浅色底 Alpha $\le 0.06$。

---

## 4. 色彩能量守恒与色温公理 (Chromatic Balance)

### 4.1 60 - 30 - 10 能量分配方程
* **60% 基底中性色 (Canvas)**：温润羊皮纸 `#FBF9F5` 或深曜石 `#0E1116`，严禁死黑 `#000` 与刺眼死白 `#FFF`；
* **30% 结构辅助色 (Surfaces / Borders)**：低饱和中性灰（Saturation $\le 15\%$）；
* **10% 焦点强调色 (Accent)**：单一高饱和色彩点睛（如琥珀金 `#F59E0B`、翡翠绿 `#10B981`），严禁铺满大底色。

### 4.2 色温全局锚定
同一项目全局色温必须严格统一（全栈暖灰调或全栈冷岩调），严禁混用忽冷忽暖的色调。

---

## 5. 排版节律与字体选型 (Typographic Rhythm)

### 5.1 字体选型抗平庸公理 (Typography Anti-Slop)
* **高级感与前沿工具**：严禁默认滥用 Inter 字体；优先采用 `Geist`、`Outfit`、`Cabinet Grotesk` 或 `Satoshi`；
* **后台与控制台硬性禁令**：SaaS 仪表盘与数据监控页**严禁使用 Serif 衬线字体**；
* **数字指标**：数据、时间、监控数值必须使用专业等宽字体（`JetBrains Mono` / `Geist Mono`）。

### 5.2 字号与行高反比法则 (Inverse Line-Height Ratio)
$$\text{LineHeight}(\text{FontSize}) = 
\begin{cases} 
1.1 \sim 1.25 & \text{当 } \text{FontSize} \ge 32\text{px (大标题)} \\
1.3 \sim 1.4 & \text{当 } 20\text{px} \le \text{FontSize} < 32\text{px (副标题)} \\
1.5 \sim 1.6 & \text{当 } 13\text{px} \le \text{FontSize} < 20\text{px (正文，max-w-[65ch])} 
\end{cases}$$
