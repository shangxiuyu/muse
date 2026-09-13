# Muse

> **The Autonomous Aesthetic Engine & Evolving Taste Vault for AI Agents.**  
> 专为 AI Agent 打造的跨媒介全域审美中枢与自进化品味资产库。

---

## 为什么需要 Muse？

当今天的顶级大模型（Claude、GPT-4、DeepSeek）编写代码或创作内容时，它们并不缺少技术与词汇，但极易陷入**「概率平均数的平庸陷阱」**，输出充斥着廉价感的 AI 塑料味：

* **UI 与前端**：死板居中的小药丸标签、Anthropic 陶土橙、大面积刺眼高斯模糊光晕、缺乏 8 态闭环的半成品组件；
* **文字与文案**：堆砌“赋能”、“颠覆性”、“在当今快节奏的世界中”等假大空虚词，缺乏事实与呼吸节拍；
* **演示文稿**：从左到右机械堆砌的假流程卡片，全页无重点、处处是粗体；
* **视觉与动态**：光滑无毛孔的 3D 塑料假人、无物理光源的悬浮发光，以及死寂无动效的静态交付。

**Muse 的使命不是提供千篇一律的死模板，而是作为 AI 的「审美心智中枢」与「品味资产调度器」，用认知科学、克制哲学与确定性工程标准，彻底根除 AI 塑料味。**

---

## 核心架构与工作管线

Muse 采用分层调度架构，将**底层认知心智**与**各媒介具体手段库**严格解耦：

```text
[创作指令输入]
      │
[0. 任务规模判定] ──► 宏观构建轨 (Macro Track) 或 局部微调快轨 (Micro Fast Track)
      │
[1. 读入个人资产] ──► Read vault/personal_dna.yaml 与 personal_taboos.yaml (最高优先级)
      │
[2. 场景画像诊断] ──► 依据 references/decision_matrix.md 推导受众心智、信息密度与标尺
      │
[2.5 4D 蓝图阻断] ──► 【页面级任务严禁直接吐代码】按规范输出 空间/光学/8态/动效 4 维设计蓝图
      │
[3. 跨媒介构件组合] ──► 依据 5 大手段库 (Toolkit) 严格绑定蓝图 Token 交付
      │
[4. 确定性硬门禁] ──► 运行 node scripts/lint_ui.js 自动化执行无障碍/动效/禁忌硬断言
```

---

## 六大品牌与美学 Token 预设 (涵盖多元风格)

告别单一科技冷淡风，Muse 内置 6 大经过工业级校准的 Token 矩阵（位于 `references/toolkit/ui_product_tool.md`），开箱即用：

1. **`linear-dark` (深曜石极简工匠)**：低照度暗黑、1px 细微倒角光，面向高频开发者工具与核心 SaaS；
2. **`stripe-modern` (现代空气感)**：高清晰冷白、通透呼吸感，面向金融支付与高质感 C 端产品；
3. **`apple-editorial` (人文纸质)**：暖米白底色与大字阶，面向创作者工具与高端官网；
4. **`vercel-mono` (硬核黑白几何)**：纯黑纯白、极精细网格线，面向极客 DevTools 与终端界面；
5. **`oriental-zen` (东方写意留白)**：米暖宣纸色底（`#f7f4ed`）配焦墨宿墨阶、朱砂赤点睛，留白率达 70%；
6. **`neo-brutalism` (新粗野主义 / 先锋朋克)**：纯黑粗边线（`2px solid #000`）与高反差硬投影（`4px 4px 0 #000`），面向 Web3 与潮流先锋。

---

## 五大跨媒介自适应能力

Muse 将统一的审美心智穿透至创作的各个物理载体：

| 媒介 | 专属手段库 | 核心工业标准与交付规范 |
| :--- | :--- | :--- |
| 🖥️ **前端 / UI 工程** | `references/toolkit/ui_product_tool.md`<br>`references/archetypes.md` | 内置 6 大美学 Token 矩阵；强制 **Minimal 8-State** 闭环脚手架；6 大非对称拓扑骨架；正文行长限制 `< 80ch`。 |
| ✍️ **文字 / 叙事表达** | `references/toolkit/text_narrative_tool.md` | **海明威式短句**；BLUF 结论先行模型；禁用假大空词汇；以用户心智命名；动作与反馈严格闭环（`Publish` ➔ `Published`）。 |
| 📄 **PPT / 演示文稿** | `references/toolkit/presentation_tool.md` | **一页一观点 (One Slide, One Idea)**；1.25 大三度字阶比；事实结构优先；严禁两张大图抢视线。 |
| 🎬 **动态 / 视频时序** | `references/toolkit/motion_video_tool.md` | 四轨工业分镜脚本（景别/光影/拟音/台词）；**UI 动效三档绝对时长**；弹簧贝塞尔曲线；列表错落进场时序（Stagger Delay）；强制走 GPU 合成层。 |
| 🖼️ **视觉 / 生图 Prompt** | `references/toolkit/visual_prompt_tool.md` | 单一真实物理光源与漫反射衰减；35mm/85mm 真实光学景深；剔除漂浮发光杂质。 |

---

## 确定性工程验证工具 (Deterministic Tooling)

告别大模型“口头承诺遵守”，Muse 提供原生的确定性 CLI 工具集：

### 1. 物理级硬 Linter (`scripts/lint_ui.js` & `scripts/lint_text.js`)
零依赖原生 Node.js 脚本。在 Agent 交付代码前自动运行，执行物理硬断言：
```bash
# UI 与交互门禁：断言 :focus-visible 键盘焦点环、Reduced-motion 无障碍兜底、拦截失控光晕与脏阴影
node scripts/lint_ui.js <path-to-file-or-dir>

# 文字叙事门禁：断言中英文假大空禁词、长句断句节奏与模板化 Eyebrow
node scripts/lint_text.js <path-to-file-or-dir>
```

### 2. 黄金基准回归评测与进化 (`scripts/eval_skill.js` & `scripts/slow_update.js`)
```bash
# 验证 benchmarks/golden_cases.json 黄金测试集无退化
node scripts/eval_skill.js

# 被毙反馈带阻尼更新
node scripts/slow_update.js --type rejection --artifact "..." --because "..." --principle "..."
```

### 3. 资产 Schema 自动迁移 (`scripts/migrate_vault.js`)
当 Muse 底层规约升级时，使用者可一键无损升级个人资产库：
```bash
node scripts/migrate_vault.js
```
自动备份旧文件为 `.bak`，安全向后兼容迁移字段。

---

## 自进化品味资产库 (The Evolving Vault)

不同于传统单次 Prompt，Muse 具备**永久记忆与反思进化能力**：

```text
vault/
├── personal_dna.yaml     # 你的专属正向审美偏好（字重、色板、圆角、行长、动效习惯）
├── personal_taboos.yaml  # 拥有最高优先级的一票否决负面禁忌红线
└── topology_log.yaml     # 拓扑使用历史日志（强制轮换页面骨架，防 AI 套熟模板）
```

* **被毙案例自动捕获 (§5.2)**：每当你在对话中否定一次产出（如 *“这里大面积光晕太俗了”* 或 *“为什么没有动效”*），Muse 自动提取原则追加至 `rejected_cases`，并在累计出现 2 次后自动升级为永久 DNA 条目。
* **外部标杆逆向萃取 (`exemplars/`)**：你可以随时扔给它一个你喜欢的网址、截图或代码片段，Muse 会逆向提炼其 CSS Design Tokens 与设计决策，归档为可调用的标杆范例。

---

## 快速上手与挂载

Muse 符合跨平台 Agent Skill 规范，可无缝运行在 **Antigravity**、**Claude Code**、**Cursor**、**Codex** 等任何支持 Skill / MCP 协议的环境中。

### 1. 安装与导入

进入你的项目工作区或全局 Agent 配置目录（例如 `.agents/skills/`）：

```bash
# 克隆至本地 skills 目录
git clone https://github.com/shangxiuyu/muse.git .agents/skills/muse
```

### 2. 唤醒与使用

在与 AI Agent 的对话中，直接通过语义或 Skill 机制调度：

```text
"用 muse 帮我重构我们产品的官网首页，要求具备极高工匠质感与细腻动效"
"参考 muse 的文字叙事标准，帮我把这份融资 Deck 的文案精简为海明威短句"
"运行 muse 的 linter 扫描当前项目，检查是否有 8 态缺失和 AI 塑料套路"
```

---

## 7 大底层品味心智 (Cognitive Axioms)

1. **微阶差原则 (Micro-Hierarchy)**：能用微小字重落差（400 vs 500）和 1px 细线讲清层级的，绝不动用暴力放大加粗与大红大绿。
2. **非对称动态平衡 (Asymmetrical Balance)**：对称是死寂的秩序，非对称平衡是活着的呼吸。
3. **语义与材质诚实 (Honesty)**：文案直陈事实，材质遵循物理规律，拒绝假大空与伪光效。
4. **留白的呼吸率 (Breathing Cadence)**：保留 50%~70% 干净底色；空白不是未完成，空白是最高尊严的表达。
5. **格式塔完形感知 (Gestalt Organization)**：接近性与连续性，让结构在 0.5 秒内被大脑本能理解。
6. **香奈儿克制与单一焦点 (Chanel's Restraint)**：大胆只花在一个地方，全页只保留唯一核心记忆点；出门前摘掉一件配饰。
7. **文案即功能与闭环路标 (Signposting)**：以用户心智命名，动作与反馈严格闭环，错误是指引而非情绪，空态是一次行动的邀请。

---

## 开源协议

本项目依据 [MIT License](LICENSE) 协议开源。
