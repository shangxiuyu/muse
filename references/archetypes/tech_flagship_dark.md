# 视觉母体：Tech Flagship Dark（科技旗舰品牌官网流）

> **标杆来源**：`Checkly` (checklyhq.com), `Vercel` (vercel.com), `Nothing` 科技硬件官网  
> **核心隐喻**：午夜深海冷深蓝背景 + 电光赛车蓝视觉锚点 + 浮空拟真交互操作舱 + 1px 晶体发光微边框 + 高反差纯白聚光按钮。

---

## 1. 业务场景匹配指南 (Scenario & Domain Affinity)

### 🎯 天然最佳业务场景 (Natural Fit)
* **科技品牌旗舰产品官网**：智能硬件、AI 设备、下一代个人计算终端、高端消费电子外设（如客制化键盘、音频声卡硬件）。
* **现代专业级 SaaS 与技术产品主站**：高客单价企业级软件、云端协同工作台、性能监控与分析平台。
* **硬核技术团队与创新实验室官网**：AI 研究实验室、前沿科技产品首发（Product Launch）官方网站。
* **高段位极客工程师与技术专家个人品牌站**：打造具有黑客级工业精密感的个人主页。

### 🚀 降维打击 / 跨界创新场景 (Breakthrough Cross-overs)
* **高端智能汽车座舱与自动驾驶系统展示**：将传统的车企宣传页，做成充满未来感与极度安全可控的交互座舱控制台。
* **企业级安全防御与加密隐私服务官网**：摆脱传统沉闷的纯文字资质介绍，用午夜深蓝与实时运行监控台建立军工级的信任背书。
* **高端金融量化与算法交易系统发布页**：向机构客户直观展示毫秒级延迟与高可靠架构。

### 🌌 跨界启发与调校心法 (Cross-over Sparks & Adaptation)
> **美学信条：场景无界，万物皆可混血**。旗舰科技暗调与拟真操作舱，跨界到非科技领域往往能制造降维级的视觉冲击：
* **用于高端生活美学或珠宝腕表品牌发布**：深海午夜底与聚光灯微高光，比惨白画册更能烘托机械腕表机芯或珍稀矿石的切割光芒。
* **用于严肃医疗器械或生物制药研发发布**：拟真操作舱与微边框晶体，能够极大强化精准手术导航系统的微米级控制感与信赖感。
* **用于精酿啤酒、特调咖啡或烘焙工坊官网**：将烘焙曲线、温度参数与萃取时间以旗舰科技座舱呈现，瞬间把传统作坊升华为“分子美食实验室”。

---

## 2. 视觉哲学与排版骨架 (Aesthetic Philosophy & Topology)

1. **聚光灯效应（The Spotlight Effect）**：
   * 页面大底采用深邃沉静的**午夜冷深蓝黑（`#061220` ~ `#0B1929`）**，而非死沉压抑的纯黑；
   * 背景中带有极其微弱的深蓝色径向环境光晕（Radial Ambient Glow），像服务器机房与太空舱，把视线注意力像聚光灯一样聚焦在中央产品上。
2. **“Show, Don't Tell”（用真实交互说话，拒绝假宣传）**：
   * 首屏右侧**坚决不放假大空的抽象商业插画**；
   * 直接放置一个浮空的 **macOS 拟真交互操作舱（Live Product Console）**，里面动态演示产品真实的运行逻辑、代码或交互界面，5 秒内让用户看懂产品怎么用。
3. **电光赛车蓝与高反差纯白按键（Electric Racer Blue & High-Contrast CTA）**：
   * 大标题核心动词采用明亮耀眼的**电光蓝（`#0075FF`）**作为视觉锚点；
   * 主转化按钮反常规采用**高反差纯白底色（`#FFFFFF`）配纯黑字**，在深蓝大底上形成压倒性的点击引力。
4. **1px 晶体发光微边框（Subtle Glow Border）**：
   * 容器圆角克制在 `10px ~ 14px`，卡片外沿包裹一层半透明微光边框（`1px solid rgba(255,255,255,0.12)`），在深色背景中呈现出如悬浮发光晶体般的高级质感。
5. **两端羽化的无缝横向流动动脉（Infinite Marquee & Telemetry Stream）**：
   * 在首屏下方承接技术背书、客户徽标或实时遥测指标，拒绝呆板静止的静态死格，采用类似工业精密流水线或全球遥测信号般的恒速向左流动循环；
   * 必须在容器两端施加**深蓝渐变羽化遮罩（`mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent)`）**，使条目如同从午夜深蓝的虚空中静谧滑出、隐入，营造沉浸无界的空间纵深感；
   * 必须支持悬停挂起（`animation-play-state: paused`），保障用户可读性与可控心流。

---

## 3. 字体与排印体系 (Typography Tokens)

```html
<!-- 引入 Google Fonts 推荐排印组合 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

> ⚠️ **纯白中文在深底上过曝**：大段中文正文降到哑光灰 `--text-slate`，纯白只留给主标题与高反差按钮。

| 角色 | 推荐字体 | 中文配对 (CJK) | 字重/样式 | 尺寸与行距 | 用途与排印规约 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **主标题 (Brand Display)** | `Plus Jakarta Sans` / `Inter` | `PingFang SC` / `Noto Sans SC` | 800 (Extra Bold) | `52px ~ 72px` (line-height: 1.05) | 极具工业张力与分量感，紧缩字距 `-0.03em`（负字距只作用于拉丁，中文标题改回零或正字距） |
| **电光蓝高亮词 (Accent Word)**| 同 Display 字体 | `PingFang SC` / `Noto Sans SC` | 800 | 同标题尺寸 | 应用电光赛车蓝（`#0075FF`），形成第一视觉焦点 |
| **副标题与说明 (Body)** | `Inter` | `PingFang SC` / `Noto Sans SC` | 400 / 500 | `17px ~ 20px` (line-height: 1.6) | 银白哑光文字（`#94A3B8`），不刺眼、保证高级阅读感；大段中文同样降到此哑光灰，不用纯白 |
| **控制台/代码/参数 (Mono)** | `JetBrains Mono` | `PingFang SC` / `Noto Sans SC` | 500 / 700 | `13px ~ 15px` | 拟真窗口代码、状态参数、延迟指标（如 98ms），等宽只留给拉丁与数字 |
| **状态药丸与指示标签** | `JetBrains Mono` / `Inter` | `PingFang SC` / `Noto Sans SC` | 600 | `11px ~ 12px` | 运行状态点、版本号、全球节点标签 |

---

## 4. 色彩系统 (Color Tokens)

```css
:root {
  /* 基础午夜深蓝环境 (Midnight Deep Canvas) */
  --bg-abyss: #061220;              /* 最底层深海黑 */
  --bg-surface: #0B1929;            /* 浮层卡片/控制台深蓝黑底 */
  --bg-surface-subtle: #0F2338;     /* 悬停微高亮底 */

  /* 品牌能量与发光高亮 (Brand Glow Accents) */
  --brand-electric-blue: #0075FF;   /* 电光赛车蓝（主高光词、核心光晕） */
  --brand-blue-glow: rgba(0, 117, 255, 0.25);
  --accent-cyan: #38BDF8;           /* 辅助科技青 */
  --status-emerald: #20DF66;        /* 正常运行状态绿 (200 OK / Active) */
  --status-ruby: #EF4444;           /* 告警红色 */

  /* 墨水与字阶 (Text & Inks) */
  --text-white: #FFFFFF;            /* 纯白主标题与高反差按钮 */
  --text-slate: #94A3B8;            /* 银灰次要文案 */
  --text-dim: #64748B;              /* 弱化辅助文字 */

  /* 发光晶体边框 (Glow Borders) */
  --border-subtle: 1px solid rgba(255, 255, 255, 0.1);
  --border-focus: 1px solid rgba(0, 117, 255, 0.5);

  /* 圆角与阴影规范 (Radii & Shadows) */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --shadow-console: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 117, 255, 0.15);
}
```

---

## 5. 专属排版手艺与组件代码 (Craft & Code Snippets)

### 1. 科技品牌聚光灯 Hero（Spotlight Hero Section）
```html
<section style="
  background: radial-gradient(circle at 75% 30%, var(--brand-blue-glow) 0%, transparent 60%), var(--bg-abyss);
  padding: 80px 48px;
  min-height: 580px;
  display: flex;
  align-items: center;
  max-width: 1240px;
  margin: 0 auto;
  gap: 48px;
">
  <!-- 左侧：品牌价值叙事 -->
  <div style="flex: 1; max-width: 560px;">
    <h1 style="
      font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Noto Sans SC', sans-serif;
      font-size: 58px;
      font-weight: 800;
      line-height: 1.05;
      color: var(--text-white);
      letter-spacing: -0.03em;
      margin-bottom: 24px;
    ">
      The <span style="color: var(--brand-electric-blue);">active</span> reliability layer for modern tech.
    </h1>
    <p style="
      font-family: 'Inter', 'PingFang SC', 'Noto Sans SC', sans-serif;
      font-size: 18px;
      line-height: 1.6;
      color: var(--text-slate);
      margin-bottom: 36px;
    ">
      Continuous automated verification built for high-stakes teams. Monitor, alert, and resolve at silicon-level precision.
    </p>

    <!-- 按钮与命令行快粘组 -->
    <div style="display: flex; flex-direction: column; gap: 18px;">
      <div style="display: flex; gap: 16px; align-items: center;">
        <a href="#" class="btn-flagship-primary" style="
          background: var(--text-white);
          color: var(--bg-abyss);
          font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Noto Sans SC', sans-serif;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 28px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          display: inline-block;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        ">Start for free</a>

        <a href="#" style="
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-white);
          font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Noto Sans SC', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 14px 24px;
          border-radius: var(--radius-sm);
          border: var(--border-subtle);
          text-decoration: none;
        ">Book a demo</a>
      </div>

      <!-- 快捷命令快粘胶囊 -->
      <div style="
        background: rgba(0, 0, 0, 0.4);
        border: var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 10px 16px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        width: fit-content;
        font-family: 'JetBrains Mono', 'PingFang SC', 'Noto Sans SC', monospace;
        font-size: 13px;
        color: var(--text-slate);
      ">
        <span style="color: var(--brand-electric-blue);">$</span>
        <span style="color: var(--text-white);">npx checkly init</span>
        <!-- 复制按钮：单色描边矢量图标，随字色走，跨端渲染一致 -->
        <span style="cursor: pointer; opacity: 0.6; margin-left: 8px; display: inline-flex; align-items: center;" aria-label="复制命令">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="2"></rect>
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"></path>
          </svg>
        </span>
      </div>
    </div>
  </div>

  <!-- 右侧：浮空拟真交互操作台 -->
  <div style="flex: 1; position: relative;">
    <div class="interactive-console" style="
      background: var(--bg-surface);
      border: var(--border-subtle);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-console);
      overflow: hidden;
    ">
      <!-- 窗口标题栏与交通灯 -->
      <div style="
        background: rgba(0, 0, 0, 0.3);
        border-bottom: var(--border-subtle);
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="width: 11px; height: 11px; border-radius: 50%; background: #FF5F56;"></span>
          <span style="width: 11px; height: 11px; border-radius: 50%; background: #FFBD2E;"></span>
          <span style="width: 11px; height: 11px; border-radius: 50%; background: #27C93F;"></span>
          <span style="font-family: 'JetBrains Mono', 'PingFang SC', 'Noto Sans SC', monospace; font-size: 12px; color: var(--text-dim); margin-left: 12px;">
            checkout.check.ts
          </span>
        </div>
        <span style="
          background: rgba(32, 223, 102, 0.1);
          color: var(--status-emerald);
          font-family: 'JetBrains Mono', 'PingFang SC', 'Noto Sans SC', monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(32, 223, 102, 0.3);
        ">● 99.982% UPTIME · 30D</span>
      </div>

      <!-- 终端代码内容区 -->
      <pre style="
        padding: 20px 24px;
        margin: 0;
        font-family: 'JetBrains Mono', 'PingFang SC', 'Noto Sans SC', monospace;
        font-size: 13px;
        line-height: 1.7;
        color: #E2E8F0;
        overflow-x: auto;
      "><code><span style="color: #64748B;">// Real-time active verification</span>
<span style="color: var(--brand-electric-blue);">import</span> { PlaywrightCheck } <span style="color: var(--brand-electric-blue);">from</span> <span style="color: #FCD34D;">'checkly/constructs'</span>

<span style="color: var(--brand-electric-blue);">new</span> <span style="color: #67E8F9;">PlaywrightCheck</span>(<span style="color: #FCD34D;">'checkout-flow'</span>, {
  name: <span style="color: #FCD34D;">'Global Checkout Spec'</span>,
  frequency: <span style="color: #A78BFA;">Frequency.EVERY_1M</span>,
  locations: [<span style="color: #FCD34D;">'us-east-1'</span>, <span style="color: #FCD34D;">'eu-west-1'</span>, <span style="color: #FCD34D;">'ap-northeast-1'</span>],
})</code></pre>

      <!-- 底部实时状态条 -->
      <div style="
        background: rgba(0, 0, 0, 0.2);
        border-top: var(--border-subtle);
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        font-family: 'JetBrains Mono', 'PingFang SC', 'Noto Sans SC', monospace;
        font-size: 12px;
        color: var(--text-slate);
      ">
        <span>Region: us-east-1 <strong style="color: var(--status-emerald);">124ms</strong></span>
        <span>Status: <strong>Active · Deployed</strong></span>
      </div>
    </div>
  </div>
</section>
```

### 2. 两端羽化无缝流动跑马灯/遥测流（Infinite Telemetry & Marquee Stream）

> **手艺核心**：首屏下方的动态动脉。采用双组镜像内容（Track A + Track B）平移实现 `-50%` 无缝循环位移，并施加 `mask-image` 边缘渐变羽化遮罩，杜绝突兀硬切。

```html
<!-- 无限流动跑马灯容器（带两端深蓝遮罩羽化） -->
<div class="marquee-wrapper" style="
  width: 100%;
  overflow: hidden;
  background: rgba(11, 25, 41, 0.5);
  border-top: var(--border-subtle);
  border-bottom: var(--border-subtle);
  padding: 18px 0;
  position: relative;
  /* 核心手艺：两端渐变羽化，左右各 15% 渐隐 */
  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
">
  <!-- 滚动轨道：双倍重复确保无缝循环 -->
  <div class="marquee-track" style="
    display: flex;
    width: max-content;
    gap: 24px;
    animation: marquee-stream 28s linear infinite;
  ">
    <!-- 轨道第一组 (Item Group A) -->
    <div class="marquee-group" style="display: flex; gap: 24px; align-items: center;">
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">us-east-1 (N. Virginia)</span>
        <strong class="metric-val">18ms</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">eu-central-1 (Frankfurt)</span>
        <strong class="metric-val">24ms</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">ap-northeast-1 (Tokyo)</span>
        <strong class="metric-val">42ms</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">Active Checks / sec</span>
        <strong class="metric-val">148,290</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">Telemetry Uptime</span>
        <strong class="metric-val">99.998%</strong>
      </div>
    </div>

    <!-- 轨道第二组镜像 (Item Group B, 与 A 完全相同实现无缝重合) -->
    <div class="marquee-group" style="display: flex; gap: 24px; align-items: center;" aria-hidden="true">
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">us-east-1 (N. Virginia)</span>
        <strong class="metric-val">18ms</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">eu-central-1 (Frankfurt)</span>
        <strong class="metric-val">24ms</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">ap-northeast-1 (Tokyo)</span>
        <strong class="metric-val">42ms</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">Active Checks / sec</span>
        <strong class="metric-val">148,290</strong>
      </div>
      <div class="stream-pill">
        <span class="pulse-dot"></span>
        <span class="mono-label">Telemetry Uptime</span>
        <strong class="metric-val">99.998%</strong>
      </div>
    </div>
  </div>
</div>
```

---

## 6. 交互与动效参数 (Motion & Micro-interactions)

```css
/* 高反差纯白按钮 Hover 微上浮 */
.btn-flagship-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.25);
}

/* 拟真控制台悬浮光晕律动 */
.interactive-console {
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
              box-shadow 0.3s ease;
}

.interactive-console:hover {
  transform: translateY(-4px);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.7),
              0 0 60px rgba(0, 117, 255, 0.25);
}

/* 终端光标闪烁动效 */
@keyframes console-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.console-cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--brand-electric-blue);
  animation: console-cursor 1s step-end infinite;
}

/* 无限流动横向跑马灯 (Infinite Telemetry Marquee) */
@keyframes marquee-stream {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
  animation: marquee-stream 28s linear infinite;
}

/* 鼠标悬停时平稳挂起暂停 */
.marquee-wrapper:hover .marquee-track {
  animation-play-state: paused;
}
```

---

## 7. 核心反模式红线 (Forbidden Patterns)

* 🚫 **严禁死黑全屏（#000000）**：背景必须是沉静有纵深感的午夜深海深蓝黑（`#061220`），并带有深蓝环境光晕，否则界面会显得呆板廉价。
* 🚫 **严禁使用虚假抽象的大插画**：品牌产品官网的核心是建立技术权威，首屏必须让用户看清真实操作界面、参数或终端。
* 🚫 **严禁生硬穿模截断的跑马灯**：凡是带有横向滚动的条目或跑马灯，**必须在容器两端施加渐变羽化遮罩（`mask-image`）**，严禁卡片在浏览器边缘生硬直角穿模或突兀消失。
* 🚫 **严禁失控的彩虹霓虹色**：全站严格控制色彩层级，以午夜深蓝为底，唯一主爆发色为电光蓝（`#0075FF`），状态指示色严格限定为翡翠绿/红，禁止五彩斑斓。
* 🚫 **严禁大圆角泡泡糖**：所有卡片和按钮圆角控制在 `6px ~ 14px`，保持工业硬件般的严肃与精密。
