# Muse (缪斯) 官方品牌旗舰主站 · 产品设计宪法与工程规范 (Design Constitution)

> **版本**：1.0.0 (Master Spec - Tech Flagship Dark)  
> **定位**：Muse 品牌官方主站的单一真实源 (Single Source of Truth)。严格落实 `tech_flagship_dark.md` 视觉母体与《美是关系的艺术》核心哲学。

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
- **`DESIGN_VARIANCE` = 6 (精密工业与不对称张力)**：结构严谨，但在 Bento 网格与拟真操作舱中融入不对称视觉张力。
- **`MOTION_INTENSITY` = 5 (微动效与晶体光泽)**：纯白按钮微上浮（-2px）、拟真光标呼吸跳动、卡片微光边框流转。
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

## 4. 负向一票否决清单 (Negative Constraints)

1. 🚫 **严禁纯黑死底（`#000000`）**：背景必须是深邃有纵深的午夜冷深蓝（`#061220`），并带有深蓝环境光晕。
2. 🚫 **严禁使用虚假抽象的大插画**：品牌产品官网的核心是建立技术权威，首屏必须让用户看清真实交互操作舱。
3. 🚫 **严禁泡泡糖大圆角**：容器圆角统一在 `8px ~ 14px`，按键圆角在 `6px ~ 8px`，保持工业硬件精密感。
4. 🚫 **严禁五彩斑斓霓虹色**：全站主色仅为电光赛车蓝（`#0075FF`），状态指示色严格限定为翡翠绿/红，禁止未经推导的渐变拼贴。
