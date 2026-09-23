# Muse (缪斯) 官方品牌旗舰主站 · 产品设计宪法与工程规范 (Design Constitution)

> **版本**：2.0.0 (Master Spec - Tech Flagship Dark)
> **定位**：Muse 品牌官方主站的单一真实源 (Single Source of Truth)。严格落实 `tech_flagship_dark.md` 视觉母体与《美是关系的艺术》核心哲学。
> **底线的性质**：下方〈负向一票否决清单〉是**默认值**，不是绝对禁令。确实属于本作品形式语言的偏离，按 `SKILL.md` 的〈底线与例外〉加带理由的 `<!-- muse:allow ... -->` 声明。事实真实性、来源与无障碍底线不可声明。

<!-- muse:allow pure-white-text: 深底场景把主标题与高反差按键文字推到纯白 #FFFFFF，是本母体「晶体高光」的形式语言；正文仍用 #94A3B8 级别的哑光灰，不用纯白铺量 -->


---

## 目录
1. [用户思维与心流意图 (User Context & Why)](#1-用户思维与心流意图-user-context--why)
2. [设计思维与公理演算 (Design Thinking & The Calculus)](#2-设计思维与公理演算-design-thinking--the-calculus)
3. [创新思维与算子落地 (Innovation Thinking & Recombination)](#3-创新思维与算子落地-innovation-thinking--recombination)
4. [原子组件工程规范 (Component Specs - The How)](#4-原子组件工程规范-component-specs---the-how)
5. [视图与场景规范 (Views & Layouts)](#5-视图与场景规范-views--layouts)
6. [交互动效与物理法则 (Motion & Feedback)](#6-交互动效与物理法则-motion--feedback)
7. [负向一票否决清单 (Negative Constraints)](#7-负向一票否决清单-negative-constraints)

---

## 1. 用户思维与心流意图 (User Context & Why)

### 1.1 业务场景 ➔ 设计场景映射
- **核心痛点**：用户（工程师、产品经理、独立开发者与设计师）看腻了 AI 生成千篇一律的“居中标题 + 紫色渐变 + 3 张白卡片 + 虚假插画”的塑料垃圾界面。他们来到 Muse 官网，需要立即看到硬核、严谨、具有工程师物理可控感的技术权威。
- **“Show, Don't Tell”**：首屏坚决不放假大空的 3D 悬浮球或抽象插画，而是直接放置一个浮空的 **macOS 拟真交互操作舱（Live Product Console）**，让用户在 5 秒内亲自操作并目睹“AI 塑料味”如何被精密算法与关系审计即时粉碎。

### 1.2 视线重力场与阅读动线
- **第 1 秒黄金锚点**：大标题中的电光赛车蓝高亮词 `<span class="accent-electric">active aesthetic layer</span>` 与右侧拟真操作舱的翡翠绿运行状态灯 `● 99.8% TASTE FIDELITY`。
- **第 3 秒动线延展**：视线自然落至高反差纯白按钮【立即接入 / Start with Skill】，随后向下滑动探索【硬核指标背书条】与【美是关系的艺术·多层矩阵】。

---

## 2. 设计思维与公理演算 (Design Thinking & The Calculus)

### 2.1 三大设计控制旋钮 (The 3 Dials Engine)
- **`MOTION_INTENSITY` = 7 (高级物理编排 & 晶体生命力)**：确立实体交互弹簧回弹基线（`--motion-spring: cubic-bezier(0.34, 1.35, 0.64, 1)`），纯白按键机械微按压（`scale(0.96)`）与弹性恢复、Bento 卡片悬停物理抬升（`-3px`）并扩散漫反射微光、拟真光标呼吸跳动、Tab 游标流体拉伸回弹（Sliding Pill）与时序级联瀑布入场（Stagger 50ms）。
- **`VISUAL_DENSITY` = 7 (高密度信息与等宽参数)**：硬件控制台质感，关键指标使用等宽数字，边距严格按照 8px 模度系统。

### 2.2 色彩体系 (60-30-10 Exact Hex Tokens)
| 角色 | Token 变量名 | 颜色值 (Hex) | 用途说明 |
|---|---|---|---|
| **Canvas 底层 (60%)** | `--bg-abyss` | `#061220` | 午夜深海冷黑，带有微弱深蓝径向环境光晕 |
| **Surface 基础 (30%)** | `--bg-surface` | `#0B1929` | 浮空操作舱、Bento 卡片、导航条深蓝底色 |
| **Surface 悬浮态** | `--bg-surface-elevated` | `#0F2338` | 悬停卡片高亮、下拉浮层、代码区背景 |
| **Accent 主能量 (10%)** | `--brand-electric-blue` | `#0075FF` | 电光赛车蓝：核心高光词、操作提示、发光阴影 |
| **Accent 辅助青** | `--accent-cyan` | `#38BDF8` | 状态标签、代码关键字、渐变辅助 |
| **Status 运行绿** | `--status-emerald` | `#20DF66` | 正常运行状态绿（200 OK / Active） |
| **Text 纯白聚光** | `--text-white` | `#FFFFFF` | 主标题、高反差按键文字、核心高光 |
| **Text 哑光银灰** | `--text-slate` | `#94A3B8` | 副标题、正文说明、界面标签 |
| **Text 暗灰弱化** | `--text-dim` | `#64748B` | 代码注释、次要时间戳、边框底色 |
| **Border 晶体微光** | `--border-subtle` | `rgba(255, 255, 255, 0.1)` | 1px 晶体全包围边框 |
| **Border 聚焦蓝** | `--border-focus` | `rgba(0, 117, 255, 0.45)` | 悬停与激活态微光边框 |

### 2.3 排版与字体体系 (Typography System)
- **展示与主标题 (Display)**：`'Plus Jakarta Sans'`, sans-serif (800 Extra Bold, `letter-spacing: -0.03em`)
- **正文与界面 (Body & UI)**：`'Inter'`, sans-serif (400 Regular / 500 Medium / 600 Semi-Bold)
- **终端/代码/参数 (Mono)**：`'JetBrains Mono'`, monospace (500 Medium / 700 Bold)

---

## 3. 创新思维与算子落地 (Innovation Thinking & Recombination)

- **微创新算子 M1 (多模式拟真操作舱)**：右侧操作舱不仅展示代码，还支持实时 Tab 切换：
  1. `Audit (审美审计)`：实时扫描界面，自动指出“塑料味”并输出关系修正结果；
  2. `Archetypes (母体引擎)`：实时切换 6 大母体规范预览；
  3. `Taste Memory (品味记忆)`：展示本地 Vault 偏好提取与作者声音画像。
- **深度创新范式 D2 (关系维度四层展开矩阵)**：在官网核心章节直观解构《美是关系的艺术》——微观（元素↔元素）、中观（区块↔区块）、宏观（页面↔页面）、终极（界面↔用户），用户可实时交互探针观察层级约束。

---

## 4. 负向一票否决清单 (Negative Constraints & Anti-Slop Master Invariants)
> **这份清单是默认值，不是绝对禁令。** 它的作用是挡住无意的 AI 塑料味。当某项偏离确实是本作品的形式语言时，加带理由的 `<!-- muse:allow ... -->` 声明即可保留；无声明就是违规。事实真实性、来源、无障碍底线（对比度、焦点环、触控靶区）不可声明。
> 交付前用 `node scripts/lint_ui.js <项目目录>` 核对，它会列出触犯项与已声明的例外。

### 4.1 形式与反 AI 偏见红线 (Anti-AI Tells & Aesthetics)
1. 🚫 **绝对封杀 Emoji 充当 UI 功能图标**：Emoji 在不同操作系统（iOS/Android/Windows）跨端渲染不可控，彩色杂乱，严重破坏专业工具严肃感与排版秩序。**必须统一使用单色描边 (1.5px~2px stroke) 的专业矢量 SVG 图标（如 Lucide / Phosphor / Radix）**。
2. 🚫 **底色不用死黑 `#000000` 与死白 `#FFFFFF`**：缺少现实物理光影的温润感，大面积铺底会引发视觉疲劳。深色场景用深岩灰、钛矿黑（如 `#090B0E` / `#0F1115`），浅色场景用羊皮纸暖白（`#FBF9F5`）。
   *本条约束的是**底色**。深底上的纯白文字（`--text-white`）是「晶体高光」的手法，属于本宪法已声明的例外；但正文不得用纯白铺量，仍走 `--text-slate` 级别的哑光灰。*
3. 🚫 **绝对封杀紫蓝/紫红霓虹发光大渐变 (The Lila Ban)**：严禁全黑底配紫蓝发光按钮与浮夸 outer glow 冒充“未来科技感”。
4. 🚫 **绝对封杀圆角割裂色条**：严禁在圆角容器（`border-radius > 0`）上贴左侧直边色条（`border-left: 3px solid`），导致曲率几何冲突与模板拼贴感。必须采用全包围 1px 微透细线 + 柔和背景色阶 + 精致排版符号（如 `✦`）。
5. 🚫 **绝对封杀泡泡糖大圆角**：保持工业硬件精密感，容器圆角严格控制在 `8px ~ 14px`，按键圆角在 `6px ~ 8px`。
6. 🚫 **绝对封杀非模度任意尺寸**（如 `13px`、`17px`、`27px`）：打破空间比例节奏。间距与排版必须严格遵循 $N \times 4\text{px}$ 或 $N \times 8\text{px}$ 模度阶梯。
7. 🚫 **绝对封杀冷暖灰混用与高饱和刺眼大色块**：严格遵循 6:3:1 面积黄金律，同一页面色温必须绝对统一；强调色面积严格控制在 $<10\%$，主色饱和度 $<80\%$。

### 4.2 布局与排版反模式红线 (Layout & Typography Anti-Patterns)
8. 🚫 **绝对封杀高密度卡片套卡片 (Anti-Card Overuse)**：当信息密集时，卡片套卡片会吞噬呼吸空间。必须使用 1px 细分隔线（`divide-y` / `border-t`）或纯负空间逻辑分层。
9. 🚫 **绝对封杀横排 3 等分呆板卡片 (NO 3-Column Equal Cards)**：严禁机械三等分并列卡片，必须采用 2 列错位 Zig-Zag、7:3 黄金分割网格或 Bento 2.0 活体错位结构。
10. 🚫 **绝对封杀千篇一律的默认居中大标题 (Anti-Center Bias)**：当 `DESIGN_VARIANCE > 4` 时，优先采用左对齐杂志流或 50/50 动态分屏，赋予页面张力。
11. 🚫 **绝对封杀大标题斜体与控制台衬线体 (Typography Anti-Slop)**：Display 大标题采用负字距精密系统（`-0.03em ~ -0.05em`），严禁斜体；控制台与数据仪表盘严禁使用 Serif 衬线体。
12. 🚫 **绝对封杀全屏无节制横拉长文本**：正文行长必须严格限制在 `50–75ch`（`max-w-[65ch]`），避免视线折返疲劳。

### 4.3 组件与工程交付物红线 (Component & Delivery Physical Contract)
13. 🚫 **绝对封杀 UI 产品的单文件大混排**：UI/Web 产品交付必须严格实现物理文件解耦（`index.html` 纯净语义骨架 + `index.css` 独立设计系统 + `app.js` 逻辑引擎），严禁包含超过 30 行内联 style/script（单文件交付形态仅严格保留给演示文稿 Deck）。
14. 🚫 **绝对封杀同一视窗并列多个 Primary 按钮**：每个视口内只能有一个主操作锚点，次要操作必须降级为 Secondary、Ghost 或微文本按钮。
15. 🚫 **绝对封杀缺失显式 `<label>` 的表单输入框**：所有表单输入框必须包含带 `for="..."` 属性绑定的显式 `<label>`，严禁仅靠 placeholder 充当标签。
16. 🚫 **绝对封杀破坏键盘焦点环**：严禁无任何替代方案的 `outline: none`，必须保证高反差键盘 Focus-visible 状态。
17. 🚫 **绝对封杀移动端 `< 44×44px` 触控靶心与 `h-screen`**：移动端触控靶区必须 $\ge 44\sim 48\text{px}$；全屏视口必须使用 `min-h-[100dvh]`，严禁使用导致地址栏遮挡的 `h-screen`。
18. 🚫 **绝对封杀无 7 态契约的裸奔组件**：核心组件必须交代清楚 `Default ➔ Hover ➔ Active ➔ Focus-visible ➔ Loading ➔ Disabled ➔ Error` 完整生命周期。

### 4.4 真实数据与性能热路径红线 (Real Data & Performance Guardrails)
19. 🚫 **绝对封杀可预测的 AI 假数据 (The "Jane Doe" Ban)**：严禁出现 `John Doe`、`Jane Doe`、`Acme Corp`、`99.99%`、`1234567`，必须使用有机、真实且具有技术深度的业务数据（如 `47.2%`、`$1,248.50`）。
20. 🚫 **绝对封杀引发 Reflow 的几何动画与 GPU 噪点污染**：动画与过渡必须且只能驱动 `transform` 与 `opacity`，严禁驱动 `top/left/width/height`；连续光标追踪严禁使用 React `useState` 触发重绘；Grain/Noise 纹理必须独立挂载在 `fixed inset-0 pointer-events-none` 固定层，严禁放在滚动容器上。
