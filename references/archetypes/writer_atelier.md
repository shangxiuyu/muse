# 视觉母体：Writer's Atelier（作家案头与卡片工坊流）

> **标杆来源**：现代沉浸式写作工作台（如 `Lex`, `Craft`, `iA Writer`, `Bear`）  
> **核心隐喻**：暖燕麦棉纸底色 + 纯白物理索引卡片 + 昼夜黑曜石打字机 + 1px 极细出版物栏线 + 琥珀光聚焦行 + 页边空白伴读批注卡。

---

## 1. 业务场景匹配指南 (Scenario & Domain Affinity)

### 🎯 天然最佳业务场景 (Natural Fit)
* **长文创作与数字出版系统**：小说家、编剧、纪实作家工作台；大纲章节卡片化、人物卡片拖拽、叙事线重组。
* **卡片盒知识库与个人思考工坊 (Zettelkasten / PKM)**：原子笔记发酵、灵感卡片自由洗牌、读书笔记串联输出。
* **播客脚本、演说文稿与分镜脚本台**：按分钟/幕次切分卡片，灵活调整节奏，兼顾全局鸟瞰与逐字沉浸敲定。
* **深度专栏、调查特稿与学术论文草稿箱**：一手素材整理与长文定稿的无缝衔接。

### 🚀 降维打击 / 跨界创新场景 (Breakthrough Cross-overs)
* **重构枯燥的产品需求文档 (PRD & User Story Mapping)**：将冷冰冰的 Confluence 变成“用户故事卡片看板 + 沉浸技术规格写作”，AI 在页边空白处自动评审边缘用例。
* **法律案件卷宗梳理与辩护长文撰写**：证据事实、当事人陈述以卡片形式在案头上排列推演，理顺时间线后直接切入撰写万字辩词。
* **风险投资备忘录 (Investment Memo) 与深度研报**：财报数据卡与专家访谈碎片自由组合拼装，沉淀出装帧考究的决策备忘录。
* **团队愿景白皮书与战略叙事规划**：将死板的 KPI 表格变为有叙事温度的“战略卡片树”。

### 🌌 跨界启发与调校心法 (Cross-over Sparks & Adaptation)
> **美学信条：场景无界，万物皆可混血**。物理索引卡与出版级排印，在非文字创作领域同样具有强大的结构化统摄力：
* **用于多维数据报表与财务模型洞察（Financial Storytelling）**：将冰冷的几十列数据报表，提炼为 3~5 张高密度索引卡片与页边批注，让非财务背景的决策者一眼读懂数字背后的商业故事。
* **用于复杂的云基础设施拓扑与服务依赖梳理**：每个微服务对应一张装帧考究的物理卡片，页边伴读显示调用耗时与熔断阈值，创造极具文人典雅气质的架构案头。
* **用于精选电商的单品策展与工艺档案**：摒弃吵闹的弹窗倒计时，将每件手工家具或定制成衣做成详细的“工艺档案卡”，极大拉升品牌文化附加值。

---

## 2. 视觉哲学与排版骨架 (Aesthetic Philosophy & Topology)

1. **三级视界流转拓扑（Three-Tier View Hierarchy）**：
   * **层级 1：鸟瞰卡片桌（Index Card Board）**：借鉴纳博科夫卡片写作法，每个段落/灵感是一张独立物理小卡片，支持自由拖拽与洗牌。
   * **层级 2：垂直线性流（Vertical Card Stream）**：多卡片垂直对齐排列，形成大纲线性阅读流。
   * **层级 3：无干扰打字机（Distraction-Free Typewriter）**：隐藏所有面板，只留下一页纸与闪烁光标。
2. **暖燕麦纸底与黑曜石昼夜双模（Warm Greige & Obsidian Modes）**：
   * 日间采用未漂白的暖燕麦棉纸底色（`#EAE6DF`），配合纯白卡片（`#FFFFFF`）；
   * 沉浸/夜间模式一键切换为黑曜石深色（`#161618`），模拟深夜关灯的纯粹心流。
3. **1px 极细出版栏线替代厚重阴影（1px Editorial Hairline Grid）**：
   * 坚决摒弃浓重的大阴影与花哨渐变，区域分割完全靠 `1px solid rgba(0,0,0,0.08)` 优雅划分，像高级精装书的版心栏线。
4. **打字机段落聚光灯（Typewriter Focus Lighting）**：
   * 正在输入的当前段落保持 100% 对比度与琥珀黄高光，非当前段落自动弱化至 30% 透明度，帮助写作者视线死锁在当前字句。
5. **页边伴读批注卡（Margin Notes over Big Chatbots）**：
   * 严禁在屏幕底部塞入喧宾夺主的巨型 AI 聊天框；AI 建议以贴边批注卡的形式挂靠在文稿右侧外边缘，像老编辑在稿纸旁留下的便签。

---

## 3. 字体与排印体系 (Typography Tokens)

```html
<!-- 引入 Google Fonts 推荐排印组合 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

> ⚠️ **中文衬线在 14px 以下会糊**：宋体只留给 15px 以上的长文与标题，13px 及以下的批注、时间戳一律改走 `PingFang SC` 无衬线。

| 角色 | 推荐字体 | 中文配对 (CJK) | 字重/样式 | 尺寸与行距 | 用途与排印规约 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **界面与大纲标题 (UI Headings)** | `Plus Jakarta Sans` | `PingFang SC` | 600 / 700 | `20px ~ 36px` (line-height: 1.2) | 干净利落现代无衬线，字距微紧 `-0.02em`（中文标题不加负字距，改回零） |
| **正文长文阅读 (Body / Editor)**| `Newsreader` / `Lora` | `Songti SC` / `Noto Serif SC` | 400 (Book) | `18px ~ 21px` (line-height: 1.75) | 极度舒适的高级社论衬线体，段间距宽松；中文衬线走宋体，字号不得低于 15px |
| **打字机当前聚焦行 (Focus Line)** | `Newsreader` | `Songti SC` / `Noto Serif SC` | 500 / Italic | `20px ~ 22px` (line-height: 1.8) | 高对比度，微琥珀黄底衬高亮（中文不用斜体，靠底色与字重承载聚焦） |
| **伴读批注与微文案 (Margin Note)** | `Plus Jakarta Sans` | `PingFang SC` | 500 | `13px ~ 14px` (line-height: 1.4) | 用于右边距 AI 润色建议、字数统计、便签；中文衬线在此尺寸会糊，一律无衬线 |
| **时间戳与字数元数据 (Mono)** | `JetBrains Mono` | `PingFang SC` | 400 | `12px ~ 13px` | 沉静的打字机统计标签（如 1,420 words），等宽只留给拉丁数字 |

---

## 4. 色彩系统 (Color Tokens)

```css
:root {
  /* 【日间模式】暖燕麦与棉纸 (Day Atelier) */
  --bg-atelier: #EAE6DF;            /* 暖燕麦全屏纸底 */
  --bg-card: #FFFFFF;               /* 纯白卡片底 */
  --bg-card-muted: #F4F1EA;         /* 次级卡片或凹槽底 */
  
  --ink-primary: #1F1E1C;           /* 炭墨黑主字 */
  --ink-secondary: #5C5851;         /* 铅灰次级文字 */
  --ink-muted: #948F85;             /* 极淡线索灰 */
  
  --line-hairline: 1px solid rgba(0, 0, 0, 0.08); /* 出版物极细栏线 */
  --line-focus: 1px solid #1F1E1C;   /* 选中卡片实线 */
  
  --accent-amber: #E08A3C;          /* 琥珀暖橙（高亮聚光灯、当前光标、重点标签） */
  --accent-amber-subtle: #FDF3E7;   /* 琥珀淡底 */

  /* 【夜间/沉浸模式】黑曜石打字机 (Night Obsidian Focus) */
  --bg-obsidian: #161618;           /* 黑曜石深色背景 */
  --bg-obsidian-card: #202023;      /* 暗色卡片底 */
  --ink-obsidian-main: #ECEBE8;      /* 暖象牙白文字 */
  --ink-obsidian-muted: #6B6A66;     /* 暗黑次要文字（非聚焦段落弱化至 30%） */
  --line-obsidian: 1px solid rgba(255, 255, 255, 0.08);

  /* 基础圆角规范 (Restrained Corners) */
  --radius-card: 8px;               /* 像裁切得当的纸质卡片，杜绝大泡泡圆角 */
  --radius-tag: 4px;
}
```

---

## 5. 专属排版手艺与组件代码 (Craft & Code Snippets)

### 1. 鸟瞰索引卡片网格槽 (Index Card Grid Tile)
```html
<div class="atelier-card" style="
  background: var(--bg-card);
  border: var(--line-hairline);
  border-radius: var(--radius-card);
  padding: 24px;
  width: 320px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s ease, transform 0.2s ease;
  position: relative;
">
  <!-- 卡片头部：序号与标签 -->
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <span style="font-family: 'JetBrains Mono', 'PingFang SC', monospace; font-size: 12px; color: var(--ink-muted); font-weight: 500;">
      CARD 03 · SCENE 1
    </span>
    <span style="
      background: var(--accent-amber-subtle);
      color: var(--accent-amber);
      font-family: 'Plus Jakarta Sans', 'PingFang SC', sans-serif;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-tag);
    ">Drafting</span>
  </div>

  <!-- 卡片标题 -->
  <h4 style="
    font-family: 'Plus Jakarta Sans', 'PingFang SC', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--ink-primary);
    margin: 0;
    line-height: 1.3;
  ">
    The First Encounter at the Station
  </h4>

  <!-- 摘要正文 -->
  <p style="
    font-family: 'Newsreader', 'Songti SC', 'Noto Serif SC', serif;
    font-size: 15px;
    color: var(--ink-secondary);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  ">
    Steam drifted across the rain-slicked platform. Arthur checked his watch twice, wondering if the delayed express would bring the courier, or something far less welcome...
  </p>

  <!-- 底部元数据：字数 -->
  <div style="
    border-top: var(--line-hairline);
    padding-top: 10px;
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', 'PingFang SC', monospace;
    font-size: 12px;
    color: var(--ink-muted);
  ">
    <span>480 words</span>
    <span>Updated 12m ago</span>
  </div>
</div>
```

### 2. 打字机段落聚光灯组件 (Typewriter Paragraph Highlighting)
```html
<div style="
  background: var(--bg-obsidian);
  color: var(--ink-obsidian-main);
  padding: 60px 48px;
  border-radius: 12px;
  max-width: 720px;
  margin: 0 auto;
">
  <!-- 上文：非聚焦状态，降低透明度 -->
  <p style="
    font-family: 'Newsreader', 'Songti SC', 'Noto Serif SC', serif;
    font-size: 20px;
    line-height: 1.75;
    color: var(--ink-obsidian-muted);
    opacity: 0.35;
    transition: opacity 0.3s ease;
    margin-bottom: 24px;
  ">
    He placed the worn leather satchel upon the oak table, its brass buckles scratched by years of hurried travels. The ink had long faded on the address label.
  </p>

  <!-- 当前编辑段落：100% 对比度 + 琥珀全包围细线（替代曲率冲突的左侧色条）+ 排版符号 ✦ -->
  <p style="
    font-family: 'Newsreader', 'Songti SC', 'Noto Serif SC', serif;
    font-size: 20px;
    line-height: 1.75;
    color: var(--ink-obsidian-main);
    background: rgba(224, 138, 60, 0.08);
    padding: 12px 16px;
    border: 1px solid rgba(224, 138, 60, 0.32);
    border-radius: 6px;
    margin: 0 0 24px 0;
    position: relative;
  ">
    <span style="color: var(--accent-amber); font-size: 13px; margin-right: 8px; vertical-align: 1px;">✦</span>There was no return address, only a single wax seal bearing the insignia of the winter archives<span style="
      display: inline-block;
      width: 2px;
      height: 1.2em;
      background: var(--accent-amber);
      vertical-align: text-bottom;
      animation: typewriter-blink 1s infinite;
      margin-left: 2px;
    "></span>
  </p>

  <!-- 下文：未写区域弱化 -->
  <p style="
    font-family: 'Newsreader', 'Songti SC', 'Noto Serif SC', serif;
    font-size: 20px;
    line-height: 1.75;
    color: var(--ink-obsidian-muted);
    opacity: 0.35;
    margin: 0;
  ">
    Every instinct urged him to leave it unopened until daylight. But curiosity is a persistent visitor in an empty house.
  </p>
</div>

<style>
@keyframes typewriter-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
```

### 3. 页边伴读批注卡 (Margin AI Note)
```html
<div style="position: relative; max-width: 800px; margin: 40px auto;">
  <!-- 主文稿内容 -->
  <div style="max-width: 540px; font-family: 'Newsreader', 'Songti SC', 'Noto Serif SC', serif; font-size: 19px; line-height: 1.7; color: var(--ink-primary);">
    <p>
      The core hypothesis behind our spatial search model is that users rarely remember exact keywords; they remember spatial relationships and temporal anchors.
    </p>
  </div>

  <!-- 伴读批注卡：挂靠在正文右边距；琥珀全包围微透细线 + 柔和琥珀色阶 + ✦ 排版符号 -->
  <aside style="
    position: absolute;
    top: 0;
    right: 0;
    width: 220px;
    background: var(--accent-amber-subtle);
    border: 1px solid rgba(224, 138, 60, 0.32);
    border-radius: var(--radius-card);
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  ">
    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
      <span style="color: var(--accent-amber); font-size: 12px; line-height: 1;">✦</span>
      <span style="font-family: 'Plus Jakarta Sans', 'PingFang SC', sans-serif; font-size: 11px; font-weight: 700; color: var(--ink-secondary); text-transform: uppercase;">
        AI SUGGESTION
      </span>
    </div>
    <p style="
      font-family: 'Plus Jakarta Sans', 'PingFang SC', sans-serif;
      font-size: 13px;
      line-height: 1.45;
      color: var(--ink-primary);
      margin: 0 0 10px 0;
    ">
      Consider mentioning Miller's Law (7±2 chunks) here to substantiate your claim about spatial working memory limits.
    </p>
    <div style="display: flex; gap: 8px;">
      <button style="
        background: var(--ink-primary);
        color: #fff;
        border: none;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      ">Apply</button>
      <button style="
        background: transparent;
        color: var(--ink-muted);
        border: none;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
      ">Dismiss</button>
    </div>
  </aside>
</div>
```

---

## 6. 交互与动效参数 (Motion & Micro-interactions)

```css
/* 渐进式隐匿控件：悬停才优雅显露 */
.atelier-card .card-actions {
  opacity: 0;
  transform: translateY(2px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.atelier-card:hover .card-actions {
  opacity: 1;
  transform: translateY(0);
}

/* 卡片轻微抓取拖拽感 */
.atelier-card:hover {
  border-color: rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}
```

---

## 7. 核心反模式红线 (Forbidden Patterns)

* 🚫 **严禁使用刺眼弥散大阴影**：卡片以平面贴合纸面为主，严禁类似 `0 20px 40px rgba(0,0,0,0.15)` 的大阴影。
* 🚫 **严禁底部浮动大聊天框**：AI 必须以“页边空白批注卡（Margin Notes）”形式安静存在，不得遮挡正文。
* 🚫 **严禁常驻巨幅黑色/彩色重型工具条**：写作区工具条平时必须隐匿，只在光标划选文字时弹出轻量悬浮微工具条（Floating Bubble Menu）。
* 🚫 **严禁高饱和糖果杂色**：全站中性灰阶，只允许一抹极度克制的琥珀暖橙（`#E08A3C`）作为行聚焦和操作焦点。
