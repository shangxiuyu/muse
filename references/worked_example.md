# 完整管线走查示例 (Worked Example)

本文件演示一次混合媒介任务如何完整走完 4 步管线。**不确定规则如何落地时，以本文件的行为模式为准。**

---

## 任务输入

> 用户："帮我做一个我们 SaaS 产品（API 监控工具）的落地页，要上线用的。"

这是一个**混合媒介任务**：落地页 = 文案 + UI + 配图的生图 Prompt。

---

## 第 1 步：读入个人资产

Read `vault/personal_dna.yaml` → 提取硬约束：
- 语气：冷峻、克制、事实驱动；单句 ≤25 字
- 左对齐非对称网格；1px 细线零脏阴影；4-8px 微圆角；纯净单色底

Read `vault/personal_taboos.yaml` → 提取红线：
- 禁大面积模糊光晕（>20% 视口或透明度 >0.1）；禁居中三板斧；组件必须 8 态闭环；禁假数据

---

## 第 2 步：场景与意图诊断

按 `references/decision_matrix.md` 三步探针：

```text
[Who]   潜在企业客户的工程负责人 —— 对数据敏感，对营销话术免疫
[Goal]  说服决策（留下邮箱试用）—— 功能目标 > 情绪目标
[Where] 桌面浏览器为主，移动端兼容
```

→ 不命中 A-D 任一完整场景，走**兜底推导**：
- 受众注意力稀缺 → 首屏单焦点、字阶对比强
- 功能目标重 → 网格与数据占比大，装饰归零
- 类近场景 C 的冷峻 + 场景 A 的数据呈现 → 色板用中性灰阶而非暖米白

---

## 第 2.5 步：发散与评判（非平凡任务，强制执行）

生成 3 个**调性互斥**的方向，各一句话陈述概念：

| 方向 | 概念 | 评判 |
|---|---|---|
| ① 瑞士网格冷峻 | "监控即数据——首屏直接是一张真实延迟曲线图" | 受众是工程负责人，真实数据 > 任何营销图 ✅ |
| ② 编辑画册温润 | "把稳定性讲成匠心故事" | 调性错位：受众对叙事免疫 ❌ |
| ③ 宣言大字情绪 | "一句巨型标语占满首屏" | 情绪目标过重，功能受众无感 ❌ |

→ 选定方向 ①。**注意：三个方向的差异在概念层，不是配色层。**

---

## 第 3 步：具象手段组合（执行顺序：文字 → 生图 → UI）

### 3a. 文案（Read `toolkit/text_narrative_tool.md`，用模型 A BLUF）

去油算法执行示例：

❌ 改前（典型 AI 塑料味）：
> "在当今快节奏的数字化转型浪潮中，我们颠覆性地赋能企业实现全方位 API 稳定性引领。"

✅ 改后（事实驱动，句长 ≤25 字）：
> "API 宕机，你第一个知道。平均告警延迟 800ms。"

→ 命中 `forbidden_words` 两条（"在当今快节奏的世界中"、"颠覆性/赋能/全方位引领"），直接拦截。

### 3b. 配图 Prompt（Read `toolkit/visual_prompt_tool.md`，5 段式）

```text
[Subject]  A minimal dark dashboard showing API latency graphs on a monitor
[Optics]   35mm lens, slight side angle, shallow depth of field
[Lighting] single cool key light from screen glow, low-key, sharp shadow falloff
[Texture]  brushed aluminum desk surface, matte screen finish
[Negative] --no plastic look, oversaturated, bloom glare, colorful ambient glow
```

→ 负向词命中禁忌"大面积彩色光晕"，已在 prompt 层主动抑制。

### 3c. UI 组装（Read `toolkit/ui_product_tool.md` 与 `references/archetypes.md`）

- 页面拓扑：选取 `archetypes.md` 的 **Split-Screen Console（左右分屏控制台）** 骨架（左侧冷峻指标与价值主张，右侧真实实时日志与延迟流控制台）
- Hero 区：左对齐大标题 + 右下行动按钮（非对称动态平衡），**拒绝居中三板斧**
- 卡片：1px `rgba(0,0,0,0.12)` 边界 + `border-radius: 8px` + 微弥散阴影（blur 24px / 0.06，在允许边界内）
- Spotlight 光标光晕：**跳过**——用户未明确偏好互动光效，默认关闭
- CTA 按钮：8 态全部显式实现（default/hover/active/focus-visible/disabled/loading/error/empty 中后两者以表单校验态体现）
- 动效：`150ms cubic-bezier(0.16, 1, 0.3, 1)`（查 `toolkit/motion_video_tool.md` §1）

---

## 第 4 步：Linter 门禁逐项判定

| 门禁 | 判定 | 依据 |
|---|---|---|
| **[0] Concept** | ✅ Pass | 概念一句话："监控即数据——首屏即真实延迟曲线"。非"简洁美观的监控页"式执行描述 |
| [1] Hierarchy | ✅ Pass | 核心焦点唯一：首屏左对齐标题 "API 宕机，你第一个知道。" |
| [2] Restraint | ✅ Pass | 装饰扫描：无渐变光球、无装饰线条；每个元素可说出存在理由 |
| [3] Truth | ⚠️ 返工一次 → Pass | 初稿写了 "5000+ 团队信赖"（用户未提供该数据）→ 删除，改为只呈现真实产品截图 |
| [4] Completeness | ✅ Pass | 边界清单：表单空/错/加载/提交成功四态已覆盖；移动端断点已定义 |

**Truth 项是本案唯一返工点**——编造背书数据是禁忌库明令禁止项，门禁拦截生效。

---

## 第 4.5 步：破规则声明（本案触发一次）

按概念"监控即数据"，首屏真实曲线图需要**满宽出血**——违反 mindset 默认的留白率下限。
- 破例声明："首屏图表满宽出血，因为概念要求首屏即产品本身。"
- 论证引用概念 ✅ → 允许。此破格不涉及禁忌库任一条目 ✅。

---

## 第 5 步（触发时）：资产捕获

用户看后说："以后深色模式下别用纯黑 #000，用 #121316。"

→ 查重 `personal_dna.yaml`：palette_and_materials 无深色模式条目 → 新增：

```yaml
palette_and_materials:
  dark_mode_base: "#121316, never pure #000"
```

→ 回复中确认：`[已将偏好同步至审美资产库]`

---

## 反例：哪些行为违反本管线

- ❌ 一次性 Read 全部 5 个 toolkit（违反渐进加载纪律）
- ❌ 落地页任务跳过诊断直接套场景 B 的发布会模板（未做 Who/Goal/Where 探针）
- ❌ 跳过第 2.5 步直接产出单一方案，或三个"方向"只差配色（伪发散）
- ❌ 门禁只写"已自检通过"而不逐项列出判定依据（门禁必须留下可检查的判定记录）
- ❌ 破格留白率却不做破例声明（破规则协议：无论证的破格 = Fail）
