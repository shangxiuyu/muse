# UI 媒介适配器与执行枢纽 (UI Adapter & Constitution Engine)

Muse 的 UI 章是媒介适配器，不是前端代码的机械搬运工。它把核心的作品契约与审美假设，通过**「用户思维 $\to$ 设计思维 $\to$ 创新思维」**的三层认知金字塔，翻译为严密的界面决策，交给执行器兑现。

---

## 1. 认知金字塔与知识加载协议 (Loading Protocol)

根据任务性质，精准加载所需的核心公理文件：

```
       ▲
      / \     【3. 创新思维 (Ceiling)】➔ [ui_innovation.md] (微创新 M1~M4 + 深度创新 D1~D4)
     /---\    
    /     \   【2. 设计思维 (Floor)】  ➔ [ui_grammar.md] (Dials 旋钮 + 空间/光影代数) + [ui_floors.md] (红线熔断)
   /-------\  
  /         \ 【1. 用户思维 (Why)】    ➔ [ui_adapter.md] (2-Pass Plan/Critique) + [ui_interaction_flow.md] (文本/心流)
 /___________\
```

| 任务类型 | 必须加载的公理文件 |
|---|---|
| **全新设计 / 重构 / 确立新风格** | **[美学文法](ui_grammar.md)**（Dials 与公理）+ **[视线心流](ui_interaction_flow.md)**（文本与退让）+ **[创新算子](ui_innovation.md)**（微创新与深度突破） |
| **写代码前 / 验收前核对** | **[负向底线](ui_floors.md)**（一票否决清单） |
| **高级交互与动效参考** | **[高级范式示范](ui_creative_arsenal.md)**（磁力悬停、弹簧物理参数、瀑布流编排、Bento 活体原型、组件 7 态） |
| **设计契约与组件级参数范例** | **[典范案例：Aether Notes 产品设计宪法](example_design_constitution.md)**（全库唯一给出组件级 px 参数与交互物理参数的落地样本，写 `DESIGN.md` 时对齐其结构严密性） |
| **已有仓库迭代或局部微调** | [项目上下文](ui_project_context.md) · [迭代协议](ui_iteration_protocol.md) |

---

## 2. 两步走推导工作流 (2-Pass Plan & Critique Protocol)

严禁在未经过两步推导前直接下笔写代码：

### Pass 1: 制定设计方案草案 (Plan)
1. **情境探针 (Mental State & Environment)**：谁在用、他此刻的生理与心理状态（身心疲惫准备入眠 vs 高压紧绷盯盘）、在什么物理环境（暗光卧室要深邃微光护眼，强光户外要高反差与 44px+ 易触靶心）；
2. **上下文存量审计**：检查项目既有的 Design Tokens、Tailwind 配置、字体族与组件库；迭代与资产边界遵循 [项目上下文](ui_project_context.md)、[迭代协议](ui_iteration_protocol.md) 与 [资产协议](ui_asset_protocol.md)；检索用户私有品味库（`~/Documents/Muse`）中的历史偏好与禁忌；
3. **母体锚定与审美综合**：必查 [视觉母体库](../archetypes.md)，从 10 大全端美学母体中锚定最贴切的风格基因（或明确跨界混血方案），并按 [UI 审美综合](ui_aesthetic_synthesis.md) 提炼 Content DNA → Distinctive Relation → Restraint Rule → Critical Slice；
4. **模式分流 (Expressive / Convention / Existing)**：表达模式（官网、Landing、产品 Hero）提炼一个签名级视觉主角；效率模式（控制台、看板、设置、表单）以熟悉与高效为最高审美；继承模式（既有项目改版）先考古后复用，严密匹配既有 Token；
5. **设定 Dials 旋钮**：锁定 `DESIGN_VARIANCE` (1-10)、`MOTION_INTENSITY` (1-10)、`VISUAL_DENSITY` (1-10)；
6. **推导 4~6 个精准 Hex 色板与字体分工**；
7. **绘制 ASCII 布局线框**：确立第 1 秒锚点与扫描动线；
8. **选择创新算子**：从 `ui_innovation.md` 中选取 1 个微创新算子（M1~M4）与 1 个深度创新范式（D1~D4）。

### Pass 2: 对抗平庸自检与香奈儿剪裁 (Critique)
1. **比对平庸 AI 特征**：检查草案是否滑向了“默认居中 Hero + 3 个等宽卡片 + 紫蓝发光”等老套路？若有雷同立即重写；
2. **香奈儿镜子原则**：主动审视并剔除一件非必要装饰，把最大锋芒留给核心创新点；
3. **交付或对齐 `DESIGN.md` 宪法**；
4. **最后落笔生成代码**。

---

## 3. DESIGN.md · 产品设计宪法规范标准

全新项目或系统级重构任务**必须先在项目根目录交付或更新 `DESIGN.md`**。它必须完整覆盖以下六大核心模块：

```markdown
# [产品名称] · 产品设计宪法与工程规范 (Design Constitution)

## 1. 用户思维与心流意图 (User Context & Why)
- **业务场景 ➔ 设计场景映射**：用户处于什么情绪与操作阻碍中？
- **视线重力场**：第 1 秒全局唯一锚点与第 3 秒阅读动线。
- **文本哲学 (Writing in Design)**：用户视角功能命名、空状态行动邀请与自愈型错误指引。

## 2. 设计思维与公理演算 (Design Thinking & The Calculus)
- **Dials 旋钮设定**：`VARIANCE` (1-10) / `MOTION` (1-10) / `DENSITY` (1-10)。
- **模度空间代数**：$4\text{px}/8\text{px}$ 模度网格、45:55 呼吸比、$\le 3$ 层视觉深度限制。
- **物理光影与材质**：单一自然顶光向量、Liquid Glass 真实折射、漫反射衰减。
- **60-30-10 色彩能量分配**：Canvas (60%)、Surface (30%)、Accent (10%) 精确 Hex 值与色温锚定。
- **排版节律方程**：非 Inter 高级字体选型、字号行高反比法则、正文 `max-w-[65ch]` 限制。

## 3. 创新思维与算子落地 (Innovation Thinking & Recombination)
- **微创新算子落地 (Micro-Delight)**：所选的 M1~M4 算子（如 Web Audio 触感微音律参数、磁力微悬停或状态平滑流变）。
- **深度创新范式落地 (Deep Breakthrough)**：所选的 D1~D4 范式（如 1D 线性流 $\rightleftharpoons$ 2D Bento $\rightleftharpoons$ 3D 思维星图无缝升维折叠机制）。

## 4. 原子组件工程规范 (Component Specs - The How)
- **容器与 Bento 卡片**：四周 1px 全包围微透线、Hover 态物理微抬升、禁止单侧割裂色条。
- **内嵌 Callout / 灵感徽章**：全包围微透线 + 柔和背景色阶 + ✦ 晶体排版符号。
- **Command Palette & 输入框**：Focus 光晕、快捷键 Badge、键盘导航规范。
- **组件 7 态契约**：核心组件必须交代 `Default ➔ Hover ➔ Active ➔ Focus-visible ➔ Loading ➔ Disabled ➔ Empty/Error` 七态；`Focus-visible` 用高反差外环，禁止 `outline: none`；移动端靶心 `≥ 44×44px`。
- **参数范例**：组件级尺寸、圆角阶梯与交互物理参数可直接对齐 [典范案例](example_design_constitution.md)。

## 5. 视图与布局架构 (Views & Layouts)
- 响应式网格、侧边栏宽度、核心编辑流与移动端单列覆盖（Mobile Override）。

## 6. 负向一票否决清单 (Negative Constraints)
- 严厉封杀圆角单侧粗色条、The Lila Ban 俗套紫蓝发光、死黑 `#000`、Jane Doe 伪数据与引发重排的非法动效。
```

---

## 4. 沿革与归档 (Lineage)

本适配器的知识底座已按 6.0 的分治原则拆入四份可独立加载的公理文件。两份被取代的前身文件（`ui_product_tool.md` 与 `visual_prompt_tool.md`）已在 6.0 删除，内容去向如下：

| 已删除的前身 | 内容去向 |
|---|---|
| UI／UX 场景美学与前端全能实战手册 | 旋钮与公理 ➔ [美学文法](ui_grammar.md)；红线与性能 ➔ [负向底线](ui_floors.md)；活体原型与兵器库 ➔ [高级范式示范](ui_creative_arsenal.md)；创新算子 ➔ [创新算子](ui_innovation.md)；契约字段与认知流程 ➔ 本文件的第 2、3 节 |
| 图像：主题、构图与表现语言 | 构思与媒介判定 ➔ [图像手册](image_visual_tool.md) 的「零、构思与媒介判定」 |

两个文件均可从 5.x 备份恢复。替代 `DESIGN.md` 契约请以本文件第 3 节为准；组件级参数范例见 [典范案例](example_design_constitution.md)。
