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
| **高级交互与动效参考** | **[高级范式示范](ui_creative_arsenal.md)**（磁力悬停、Spring 弹簧参数、瀑布流编排） |
| **已有仓库迭代或局部微调** | [项目上下文](ui_project_context.md) · [迭代协议](ui_iteration_protocol.md) |

---

## 2. 两步走推导工作流 (2-Pass Plan & Critique Protocol)

严禁在未经过两步推导前直接下笔写代码：

### Pass 1: 制定设计方案草案 (Plan)
1. **用户思维 (Why)**：分析用户在什么情境与心理状态下使用？提取 Content DNA 与核心张力；
2. **设定 Dials 旋钮**：锁定 `DESIGN_VARIANCE` (1-10)、`MOTION_INTENSITY` (1-10)、`VISUAL_DENSITY` (1-10)；
3. **推导 4~6 个精准 Hex 色板与字体分工**；
4. **绘制 ASCII 布局线框**：确立第 1 秒锚点与扫描动线；
5. **选择创新算子**：从 `ui_innovation.md` 中选取 1 个微创新算子（M1~M4）与 1 个深度创新范式（D1~D4）。

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

## 5. 视图与布局架构 (Views & Layouts)
- 响应式网格、侧边栏宽度、核心编辑流与移动端单列覆盖（Mobile Override）。

## 6. 负向一票否决清单 (Negative Constraints)
- 严厉封杀圆角单侧粗色条、The Lila Ban 俗套紫蓝发光、死黑 `#000`、Jane Doe 伪数据与引发重排的非法动效。
```
