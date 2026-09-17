# 视觉母体：Playful Stationery（趣味文具与复古手账流）

> **标杆来源**：`SayBriefly` (saybriefly.com), `Pitch` (pitch.com), `PostHog` (posthog.com)  
> **核心隐喻**：高级米白手账纸 + 深墨绿钢笔书写 + 荧光便利贴 + 针孔撕纸虚线 + 真实手绘涂鸦批注。

---

## 1. 业务场景匹配指南 (Scenario & Domain Affinity)

### 🎯 天然最佳业务场景 (Natural Fit)
* **自由职业 / 独立工作室协同**：合同条款确认、交付物追踪、日程管理、项目范围防扯皮。
* **个人灵感与知识库**：创意笔记、思维便签、草稿箱、灵感画板、读书手账。
* **轻量级任务看板与 Checklist**：打卡清单、敏捷便签墙、轻量 CRM、头脑风暴看板。
* **独立开发者作品集与小工具**：计算器、个人简历、创意小工具、开源产品展示。

### 🚀 降维打击 / 跨界创新场景 (Breakthrough Cross-overs)
* **传统枯燥的会议纪要（如 SayBriefly）**：将冰冷的 AI 转录文字变成带有荧光笔圈选和手绘便签的“会议手账”，瞬间破除机器冰冷感。
* **个人记账与预算规划**：做成一本带有票据撕角、印章徽章和真实手写批注的实体账本。
* **团队 Onboarding / 入职指引**：做成一本充满手绘插画、便签提示与亲切说明的新人手账。

### 🌌 跨界启发与调校心法 (Cross-over Sparks & Adaptation)
> **美学信条：场景无界，万物皆可混血**。复古手账纸感能瞬间瓦解机械冰冷感，释放独特的亲密与温暖：
* **用于硬核金融量化或大宗分析**：将枯燥冰冷的数据流转变成一本“投资大师的私人复盘笔记”，票据撕角与印章徽章反而能赋予投资复盘罕见的温度与反思深度。
* **用于开发者 API 控制台或技术文档**：打破惨白的黑客界面，用荧光便利贴与手绘图解指引调用步骤，大幅降低开发者的认知疲劳。
* **用于法律文书与严肃公文协作**：保留常春藤墨绿与纸张底色，收敛涂鸦线条，营造如同传统英国大律师公事包里的古雅装订质感。

---

## 2. 视觉哲学与排版骨架 (Aesthetic Philosophy & Topology)

1. **去纯白与冷光（Anti-Cold White）**：界面底色为温暖的米白纸张色（`#FCFAF5`），文字采用深邃常春藤墨绿（`#173300`），如同墨水渗入纸张。
2. **去死板实线，拥抱针孔撕纸（Dashed Perforation Grid）**：区域分割禁止使用死板的 `1px solid #ddd`，全面采用 `1.5px~2px dashed` 虚线，模拟文具的撕纸线与装订缝线。
3. **荧光笔高亮与便签层级（Highlighter & Sticky Notes）**：核心数字、重点 CTA 按钮采用高饱和度柠檬黄（`#FFEB5B`），辅助标签使用低饱和马卡龙文具贴纸色（薄荷、薰衣草、浅蜜桃）。
4. **手绘旁白与情绪打破（Handwritten Annotations）**：在排版严肃的段落旁，偶尔插入真实手写字体的弯曲箭头、手绘圈选与旁白吐槽，打破机械对齐感。

---

## 3. 字体与排印体系 (Typography Tokens)

```html
<!-- 引入 Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;800&family=Inter:wght@400;500;600&family=Reenie+Beanie&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

| 角色 | 推荐字体 | 字重/样式 | 尺寸与行距 | 用途与排印规约 |
| :--- | :--- | :--- | :--- | :--- |
| **大标题 (Display)** | `Bricolage Grotesque` | 700 / 800 | `36px ~ 72px` (line-height: 1.1) | 饱满、有张力、带复古怪诞性格，负字距 `-0.02em` |
| **正文 (Body)** | `Inter` / `Source Sans 3` | 400 / 500 | `16px ~ 20px` (line-height: 1.6) | 保证大段阅读清晰度，颜色使用深墨绿而非纯黑 |
| **手绘批注 (Handwriting)** | `Reenie Beanie` | 400 (Italic feel) | `22px ~ 32px` | 配合手绘箭头做边栏批注、旁白、圈注 |
| **票据/元数据 (Mono)** | `Roboto Mono` | 400 / 700 | `13px ~ 15px` | 用于价格标签、对比表格、时间戳、胶囊徽章 |

---

## 4. 色彩系统 (Color Tokens)

```css
:root {
  /* 基础底色与墨水 */
  --bg-canvas: #FCFAF5;             /* 温暖米白手账纸 */
  --bg-canvas-subtle: #F4EFE6;      /* 稍深的便签底色 / 表格底槽 */
  --ink-primary: #173300;           /* 常春藤墨绿主文字 (Primary Text) */
  --ink-secondary: #3D5A2B;         /* 浅墨绿次要文字 (Secondary Text) */
  --ink-muted: #6B7C5E;             /* 铅笔灰说明文字 (Muted Text) */

  /* 核心高亮与印章点缀 */
  --highlight-yellow: #FFEB5B;      /* 荧光笔便利贴黄 (主 CTA / 重点底衬) */
  --stamp-orange: #DD6C3E;          /* 印章暖橙 (警示 / 强调虚线) */

  /* 针孔装订线 */
  --border-dashed: #B6B6B6;         /* 撕纸灰色虚线 */
  --border-dashed-green: #173300;   /* 墨绿针孔虚线 */

  /* 分类便签贴纸色 (Post-it Category Pills) */
  --pill-mint: #A8E5E5;             /* 薄荷青便签 */
  --pill-lavender: #A5B3F1;         /* 薰衣草紫便签 */
  --pill-lilac: #F6D0FF;            /* 浅丁香便签 */
  --pill-peach: #FFD6A5;            /* 蜜桃橘便签 */
}
```

---

## 5. 专属排版手艺与组件代码 (Craft & Code Snippets)

### 1. 针孔虚线网格导航栏 (Dashed Navigation Dock)
```html
<nav style="
  background: var(--bg-canvas);
  border: 2px dashed var(--border-dashed);
  border-radius: 12px;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
">
  <div style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 800; color: var(--ink-primary);">
    SayBriefly<span style="color: var(--stamp-orange);">.</span>
  </div>
  <div style="display: flex; gap: 16px; align-items: center;">
    <a href="#" style="font-family: 'Roboto Mono', monospace; font-size: 14px; color: var(--ink-primary); text-decoration: none;">Product</a>
    <a href="#" style="
      background: var(--ink-primary);
      color: var(--highlight-yellow);
      font-family: 'Roboto Mono', monospace;
      font-weight: 700;
      font-size: 14px;
      padding: 8px 18px;
      border-radius: 6px;
      text-decoration: none;
    ">Download App</a>
  </div>
</nav>
```

### 2. 荧光笔底衬大标题与手写箭头批注 (Highlighter Headline & Annotation)
```html
<div style="position: relative; text-align: center; max-width: 800px; margin: 40px auto;">
  <h1 style="
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 56px;
    font-weight: 800;
    color: var(--ink-primary);
    line-height: 1.1;
  ">
    Deliver what was agreed. <br>
    And stop <span style="background: var(--highlight-yellow); padding: 0 8px; border-radius: 4px;">scope creep</span>.
  </h1>

  <!-- 手写涂鸦批注 -->
  <div style="
    position: absolute;
    top: 10px;
    right: -40px;
    transform: rotate(6deg);
    font-family: 'Reenie Beanie', cursive;
    font-size: 28px;
    color: var(--stamp-orange);
    display: flex;
    align-items: center;
    gap: 4px;
  ">
    <span>← no free revisions!</span>
  </div>
</div>
```

### 3. 便签贴纸药丸与针孔表格 (Post-it Pills & Perforation Table)
```html
<div style="
  background: var(--bg-canvas);
  border-top: 1.5px dashed var(--ink-primary);
  border-bottom: 1.5px dashed var(--ink-primary);
  padding: 24px 0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  align-items: center;
">
  <div>
    <span style="
      background: var(--pill-mint);
      color: var(--ink-primary);
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
    ">FEATURE</span>
    <h4 style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 600; color: var(--ink-primary); margin: 8px 0 0 0;">
      Slack & Figma Scope Monitoring
    </h4>
  </div>
  <div style="font-family: 'Roboto Mono', monospace; font-size: 15px; color: var(--ink-muted);">Automatic Detection</div>
  <div>
    <span style="
      background: var(--highlight-yellow);
      color: var(--ink-primary);
      font-family: 'Roboto Mono', monospace;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
    ">Protected $3k/yr</span>
  </div>
</div>
```
