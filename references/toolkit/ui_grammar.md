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
* **1-3 (静默克制 · 文本与数据密集型)**：零自动动画，仅保留核心按钮与链接的 `:hover` 态与 `:active` 机械按压微反馈（`scale(0.97)`）；
* **4-6 (弹性物理 · 现代应用与工作台默认推荐)**：确立**实体交互弹簧回弹基线**——按钮、卡片、游标使用带微冲过的弹簧曲线 `--motion-spring: cubic-bezier(0.34, 1.35, 0.64, 1)`（或真实物理 `stiffness: 140, damping: 18`），按压下沉 `translateY(1px) scale(0.96)`，卡片悬停抬升 `-3px` 并扩散柔和阴影，列表加载使用级联延迟（`animation-delay: calc(var(--i) * 50ms)`）；大面积背景与遮罩采用流体刹车曲线 `--motion-fluid: cubic-bezier(0.16, 1, 0.3, 1)`；
* **7-8 (高级编排与活体 · 旗舰产品与品牌官网)**：在 4-6 基础上开启光标磁力微悬停（$\le 6\text{px}$ 引力）、1px 边缘动态高光微流光（Border Shimmer）、活体呼吸状态灯与 Tab 游标流体拉伸回弹（Sliding Pill）、关键操作附带 M1 触感微音律；
* **9-10 (电影感沉浸 · 艺术展厅与概念展)**：全屏滚动视差拓扑、维度升降折叠（1D 线性 $\rightleftharpoons$ 2D Bento $\rightleftharpoons$ 3D 星图）无缝升维过渡，Canvas 力导向粒子场联动。

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

### 3.4 明暗两套基底范式 (Light Gallery & Precision Dark)
* **浅色画廊范式 (Bento 2.0 Light)**：精致浅底（`#F9FAFB` / `#FBFBFA`）+ 纯白面板 + 扩散漫反射轻投影（`box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05)`），标题外置于卡片下方，让排版而非容器承担层级；
* **深色微暗范式 (Precision Dark)**：微暗半透面板（`rgba(255, 255, 255, 0.035)`）+ 单像素微透细线边框（`1px solid rgba(255, 255, 255, 0.08)`），靠**色阶**分层而非发光分层。

---

## 4. 色彩能量守恒与色温公理 (Chromatic Balance)

### 4.1 60 - 30 - 10 能量分配方程
* **60% 基底中性色 (Canvas)**：温润羊皮纸 `#FBF9F5` 或深曜石 `#0E1116`，严禁死黑 `#000` 与刺眼死白 `#FFF`；
* **30% 结构辅助色 (Surfaces / Borders)**：低饱和中性灰（Saturation $\le 15\%$）；
* **10% 焦点强调色 (Accent)**：单一高饱和色彩点睛（如琥珀金 `#F59E0B`、翡翠绿 `#10B981`），严禁铺满大底色。

### 4.2 客体检出色板 (Subject Matter Derivation)
* **严禁凭空盲猜色彩**。色板必须从产品的情境客体中提炼：健康代谢取自植物鼠尾草与晨光，知识工具取自手工纸张与温和墨水，精密工程取自冷钛与冷轧钢；
* 强调色饱和度严格控制在 $80\%$ 以内，单点用于 Primary 操作与焦点，严禁铺满大底色。

### 4.3 色温全局锚定
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

### 5.3 负字距精密系统 (Negative Tracking)
* **Display 大标题（40–80px）**：字距收紧至 `-0.03em ~ -0.05em`（`-1.5px ~ -3px`），行高紧凑 `1.05 ~ 1.15`；**严禁大标题使用斜体（No Italic Headers）**；
* **Headline 章节标题（24–32px）**：字距微收 `-0.01em ~ -0.02em`；
* **Body 正文**：字距归零，行长严格限制 `max-w-[65ch]`，行高 `1.5 ~ 1.65`。

### 5.4 角色化字体配对 (Role-Based Pairing)
* **现代科技／极客**：`Geist` / `Satoshi` + `JetBrains Mono`；
* **人文叙事／生活**：`Outfit` / `Cabinet Grotesk` + `Newsreader` 或高质感衬线；
* **严谨金融／数据**：`Plus Jakarta Sans` + 等宽数字（`font-variant-numeric: tabular-nums`）。
* 配对原则：**一个角色只由一种字体承担**，不为丰富而引入第三族。

### 5.5 布局反模式清扫 (Anti-Pattern Sweep)
* **封杀横排 3 等分卡片**：改用 2 列错位 Zig-Zag、7:3 黄金分割网格或裸排数据列表（一票否决项见 [负向底线](ui_floors.md)）；
* **反默认居中**：优先采用左对齐杂志流或 50/50 动态分屏；
* **CSS Grid over Flex-Math**：宏观结构使用 CSS Grid；异步容器显式声明 `aspect-ratio`，杜绝 CLS 跳跃。
