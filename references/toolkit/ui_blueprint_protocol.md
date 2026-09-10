# UI 四维设计系统蓝图协议 (UI 4D Design Blueprint Protocol)

> **强行阻断铁律（适用宏观构建轨 Macro Track）**：
> 在执行任何从零建页、新模块开发或全组件系统重构等页面级 UI/前端编码任务前，**严禁直接输出业务代码**！
> AI 必须先根据用户画像与场景推导，输出一份标准化的 **《4 维设计系统蓝图 (Design System Blueprint)》**，并在随后的代码中严格绑定该蓝图定义的 Token。
>
> ⚡ **微调快轨豁免 (Micro Fast Track Exemption)**：
> 若任务仅为**局部微调、单一组件微调、样式修复、文案替换或单态补充**，**豁免输出 4D 蓝图报告**！只需执行 Pre-flight 确认既有 Token，遵循 `personal_taboos.yaml` 与门禁红线，直接输出高质感精准代码。

---

## 🎯 Phase 0: 用户画像与心流推导 (User & Context Grounding)

输出 UI 前，必须先完成以下 3 项用户心智与场景推导：

1. **目标用户角色 (Target Persona)**：
   - 谁在用？（例如：高频运维工程师 / 初次体验的小白用户 / 严谨的财务决策者 / 深度创作的文字工作者）
   - 技术熟练度与使用环境（暗光多屏 / 移动碎片 / 白天会议室）。
2. **核心任务与心理预期 (Jobs To Be Done & Mental State)**：
   - 核心任务心流（如：5 秒内定位告警节点并一键回滚）。
   - 核心心理预期（如：极度需要掌控感与严谨度，拒绝花哨动效打扰）。
3. **设计策略数学化 (Mathematical Parameters)**：
   - **信息密度 (Density)**：`Compact (紧凑工具)` | `Comfortable (标准 SaaS)` | `Spacious (品牌展示)`
   - **排版字阶比 (Modular Scale)**：`1.125 (紧凑工程)` | `1.25 (标准大三度)` | `1.333 (强烈反差)`
   - **交互响应速度 (Response Budget)**：`120ms (即时)` | `220ms (平滑)` | `420ms (沉浸)`

---

## 📐 Phase 1: 4 维设计系统蓝图输出规范 (The 4D Spec)

推导完成后，必须按以下 4 个维度输出格式化蓝图：

### 维度 1：空间与整体布局体系 (Spatial Layout Architecture)
- **拓扑骨架选型**：明确引用 `references/archetypes.md` 中的具体骨架（如 `Bento Grid` / `Split-Screen Console` 等）。
- **栅格与标尺**：列数（如 12 列非对称）、基准网格（4px/8px）、最大容器宽度（如 `1280px` / `100vw` 满宽工作台）。
- **ASCII 骨架线稿**：绘制简洁的界面分区图，标明各区域信息权重与滚动行为。
- **香奈儿减法确认**：明确标明本次设计的 **唯一核心记忆点 (Singular Focus)** 是什么，其余区域全部退后。

### 维度 2：颜色与光学材质体系 (Color & Optical Materials)
- **主题预设基准**：选定 `linear-dark` / `stripe-modern` / `apple-editorial` / `vercel-mono` 或自定义。
- **语义色阶 (HSL Tokens)**：
  - `bg-base` / `bg-surface` / `border-subtle`（带色相染心灰）
  - `text-primary` / `text-secondary` / `text-tertiary`
  - `accent` / `accent-surface`
- **光影材质公式**：
  - 顶光内描边：`box-shadow: inset 0 1px 0 0 rgba(...)`
  - 多层环境漫反射阴影公式。

### 维度 3：组件原子、文案与状态规范 (Component & Copywriting Spec)
- **核心组件清单**：列出本次页面所需的关键原子（如 Action Button / Search Input / Bento Card / Data Row）。
- **文案与动作闭环定义**：
  - 以用户心智命名（如“通知设置”而非“Webhook 配置”）；
  - 主动动词与 Toast 闭环（`[发布] ➔ [已发布]`，禁止生硬的“提交”与“操作成功”）；
  - 空状态（Empty）设计为带插画与 CTA 的行动邀请；错误状态（Error）直陈原因并带一键修复。
- **8 态边界覆盖清单**：明确 `default` / `hover` / `active` / `focus-visible` / `loading` / `disabled` / `error` / `empty` 的呈现方式。

### 维度 4：动效物理与时序体系 (Motion Physics & Timeline)
- **贝塞尔曲线 Token**：`--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`。
- **物理反馈**：点击微缩比例（如 `active:scale-[0.985]`）、面板展开位移与透明度变化。
- **动效克制**：严禁在每一个卡片上乱加无意义的漂浮动效，只对关键用户动作做即时物理反馈。

---

## 🚫 隐秘 AI 模版套路黑名单 (Hidden AI Tells Blacklist)

在输出蓝图与代码时，严格禁止以下 5 大隐蔽套路：
1. ❌ **禁止无脑套用 Anthropic 官方陶土橙**（米白底 `#F4F1EA` + 陶土橙 `#D97757`），除非用户显式要求。
2. ❌ **禁止在所有标题上方无脑添加全大写追踪 Eyebrow 标签**（如 `OVERVIEW` / `FEATURES`）。
3. ❌ **禁止在元信息中无脑滥用居中点**（`A · B · C`）与破折号（`WORD — fragment`）。
4. ❌ **禁止在所有按钮/链接文案后面强制加箭头**（如 `Explore →`）。
5. ❌ **禁止将所有内容切割成一模一样的 SaaS 等宽等高小圆角卡片堆叠**。

---

## 🚀 落地绑定守则
蓝图确认后生成的代码中：
1. **必须在 `:root` 或 Tailwind Config 中显式声明上述 Token**；
2. **严禁在组件内手写未定义的随机色值与魔法数字**；
3. **完成编码后强制对照 `SKILL.md §4` 与 8 态检查表执行 Anti-Slop 门禁自检**。
