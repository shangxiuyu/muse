# 演示文稿与幻灯片手段库 (Presentation & Pitch Deck Tool)

> 本手段库汲取自 GitHub 顶级开源 Marp 与演示文稿生态：
> - [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit) `marp-slide` skill
> - [robonuggets/marp-slides](https://github.com/robonuggets/marp-slides) (22 个生产级精选 Deck)
> - [codebytes/marp-slides-template](https://github.com/codebytes/marp-slides-template)
> 结合瑞士国际平面设计网格与 YC/红杉 5 幕说服叙事弧线。
> 严禁生成千篇一律的流水账汇报与死板“上标题+三列图标卡片”的劣质模板。

---

## 🚫 1. 幻灯片三大硬性禁忌 (Presentation Anti-Slop)

1. ❌ **严禁死分类名词标题 (No Category Nouns)**：
   - 绝不能写“市场分析”、“痛点介绍”、“技术架构”、“总结”。
   - 铁律：标题必须是**带论断的行动断言句 (Action Title)**！
   - 正例：“现有轮询架构在弱网环境下首包往返超过 1.8 秒，且不可恢复”。
2. ❌ **严禁万年三等分图标卡片 (Kill the 3-Card Icon Grid)**：
   - 禁止给每一段文字无脑配一个火箭 🚀、灯泡 💡 或拼图。真实高信息密度幻灯片依靠清晰的数据层次，不靠装饰图标。
3. ❌ **严禁单页多焦点 (One Slide, One Idea)**：
   - 3 秒原则：观众扫一眼，3 秒内必须看懂主张。一页幻灯片超过 4 行文字，直接拆页。

---

## 🎯 2. 顶尖说服叙事弧线 (The 5-Act Pitch Arc)

整套 Deck 必须具备完整的认知推进链条，实现**独立可读性**：

```text
[1. 现实痛点 (The Hook)]       --> 揭示不可调和的业务现实与高昂代价 (Action Title)
        │
[2. 现状破产 (The Complication)] --> 证明现有工具或传统方案为何在当下彻底失效
        │
[3. 范式转移 (Paradigm Shift)]  --> 提出全新视角的破局思路与产品本质解法
        │
[4. 铁证数据 (Hard Proof)]      --> 用指标与硬核数据证明新方案已产生不对称收益
        │
[5. 决断行动 (The Ask / Call)]  --> 明确告知下一阶段资源需求与实施路线图
```

---

## 📐 3. 三大高阶瑞士排版模版 (Swiss Architectural Templates)

### 模版 1：宣言焦点型 (`<!-- _class: lead -->`)
- **适用**：封面、章节转折、终极论断。
- **排版参数**：留白率 ≥ 60%，左对齐（`align-items: flex-start`），主标题 64px，字重 500。

### 模版 2：非对称对冲型 (`<!-- _class: columns -->`)
- **适用**：新旧架构对比、传统方案与当前方案对冲。
- **排版参数**：7:3 或 6:4 比例分割，旧方案低对比灰度后退，新方案高对比度前进。

### 模版 3：超大等宽指标型 (`<!-- _class: stat -->`)
- **适用**：关键性能指标、财务数字、延迟倍率。
- **排版参数**：数字使用等宽字体（`tabular-nums`），字号 72px~96px，单位缩小 50% 基线对齐，下方仅配一行硬核因果事实。

---

## 💻 4. 生产级 Marp CSS 工程脚手架 (Marp Direct Source)

当用户需要输出幻灯片时，直接输出可直接渲染的 Marp Markdown：

```markdown
---
marp: true
theme: default
paginate: true
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

section {
  background-color: #ffffff;
  color: #1a1a1a;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 300;
  line-height: 1.6;
  font-size: 24px;
  padding: 72px 96px;
}

h1 {
  font-size: 52px;
  line-height: 1.2;
  font-weight: 500;
  color: #0d0d0d;
  letter-spacing: -0.025em;
  margin-bottom: 24px;
}

h2 {
  font-size: 36px;
  line-height: 1.3;
  font-weight: 500;
  color: #0d0d0d;
  letter-spacing: -0.015em;
  margin-bottom: 40px;
}

ul {
  padding-left: 24px;
}

li {
  margin-bottom: 18px;
  color: #333333;
}

.lead {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
.lead h1 { font-size: 64px; font-weight: 600; margin-bottom: 16px; }
.lead p { font-size: 24px; color: #555555; font-weight: 300; margin: 0; }

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}

.stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-number {
  font-size: 96px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #0d0d0d;
  line-height: 1.0;
  margin-bottom: 12px;
}
.stat-label {
  font-size: 22px;
  color: #666666;
  line-height: 1.5;
}

footer {
  font-size: 13px;
  color: #888888;
  position: absolute;
  left: 96px;
  bottom: 36px;
}
</style>

<!-- _class: lead -->

# Eden Local-First Network
本地优先的多智能体协同工程骨干网络。

<footer>2026 技术架构评审</footer>

---

<!-- _class: stat -->

<div class="stat">
  <div class="stat-number">18ms</div>
  <div class="stat-label">首包端到端响应延迟（相比旧云端中心调度的 1.8 秒提速 100 倍）</div>
</div>

<footer>性能跃迁</footer>

---

## 为什么抛弃云端中心调度

- **网络往返耗时不可控**：多轮 Agent 跨洋通信平均往返超过 1.8 秒。
- **分布式锁脏写**：网络抖动导致租约误回收。
- **源码离开宿主机构成合规风险**。

<footer>架构动机</footer>
```
