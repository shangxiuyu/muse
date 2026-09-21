# 视觉母体：Enterprise Narrative（现代企业叙事与矢量工装风）

> **标杆来源**：`Allwhere` (allwhere.co), `Stripe` (stripe.com), `HashiCorp` (hashicorp.com)  
> **核心隐喻**：工业工程严谨性 + 概念矢量叙事插画 + 溢出式微缩真实数据卡片（Escaped UI） + 荧光笔刷漆动效。

---

## 1. 业务场景匹配指南 (Scenario & Domain Affinity)

### 🎯 天然最佳业务场景 (Natural Fit)
* **现代 B2B 企服与全球供应链**：IT 设备资产管理、企业级采购与物流、跨境合规与结算。
* **人力薪酬与团队基础设施**：全球员工 Onboarding、薪酬福利分发、混合办公设备追踪。
* **开发者云平台与微服务网关**：API 计费中枢、数据管道监控、多云资产管理。
* **安全审计与合规平台**：SOC2/GDPR 自动化审计、权限管控中心。

### 🚀 降维打击 / 跨界创新场景 (Breakthrough Cross-overs)
* **传统极其沉闷的 ERP / OA 审批流**：用清爽的青瓷蓝、IBM Plex 工装字体与破框微缩卡片，把传统枯燥的后台变成极具科技感与愉悦感的现代工装平台。
* **企业级数据看板与 ROI 计算器**：用自下而上刷漆的荧光笔动效和多层柔和物理阴影，把原本死板的数字报表变成动态增长故事。

### 🌌 跨界启发与调校心法 (Cross-over Sparks & Adaptation)
> **美学信条：场景无界，万物皆可混血**。现代工装的严谨与破框数据卡，在非典型领域能碰撞出意外的高级感：
* **用于个人作品集或独立创作者简历**：将个人职业经历、开源贡献或设计项目做成“破框溢出的项目看板”，展现出极高水准的工程交付专业度与条理性。
* **用于游戏或虚拟世界的数据仪表盘**：将游戏经济系统、公会领地资源以工业工装风格呈现，带来如科幻电影中企业巨头（Megacorporation）控制台般的代入感。
* **用于生活习惯与健康管理**：将身体数据、营养摄入与睡眠周期做成清晰的 ROI 增长叙事卡片，满足理科生对自我量化（Quantified Self）的极致追求。

---

## 2. 视觉哲学与排版骨架 (Aesthetic Philosophy & Topology)

1. **工业理性与温和亲和力的平衡（Precision Meets Warmth）**：底色保持纯净与冷白纸感，文字排版使用严谨方正的工程字体 `IBM Plex Sans`，大写按键充满专业度；同时搭配趣味概念矢量插画消除企服的距离感。
2. **破框溢出式排版（Escaped UI Overlays）**：**绝对禁止让所有图文死板地装在规矩方盒内**。主概念插画的边缘必须**悬浮并溢出（Offset/Escaped）**真实的微缩数据卡片（如订单明细切片、工时节省气泡、ROI 柱状图），制造 2.5D 层次感。
3. **低饱和主冷色 + 点睛暖珊瑚橙（Cyan & Coral Accents）**：以低饱和的青瓷冰川蓝（`#8FC8CF`）作为主基调，用极高对比度的暖珊瑚橙（`#F27058`）或苔藓绿（`#53853C`）作为操作与状态反馈。
4. **自下而上刷漆动效（Highlighter Sweep Motion）**：链接或重要标题悬浮时，底部的色块像荧光笔刷漆一样自下而上展开（`transform: scaleY(0.12) -> scaleY(1)` + `transform-origin: bottom`，**绝不驱动 `height`**），充满现代设计巧思。

---

## 3. 字体与排印体系 (Typography Tokens)

```html
<!-- 引入 Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
```

| 角色 | 推荐字体 | 中文配对 (CJK) | 字重/样式 | 尺寸与行距 | 用途与排印规约 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **大标题 (H1/H2)** | `IBM Plex Sans` | `Noto Sans SC` | 600 / 700 | `36px ~ 64px` (line-height: 1.15) | 严谨工程感，字偶距自然，采用 `text-wrap: balance` |
| **正文 (Body)** | `IBM Plex Sans` | `Noto Sans SC` | 400 | `16px ~ 18px` (line-height: 1.55) | 极致清晰的抗锯齿与易读性，石墨灰颜色；青瓷水蓝与珊瑚橙在中文小字上对比度衰减更快，标签务必成对给足墨色 |
| **大写行动按键 (CTA)** | `IBM Plex Sans` | `Noto Sans SC` | 600 / 700 | `14px ~ 15px` (letter-spacing: `0.05em`) | 全大写如 `GET A DEMO`，配合圆角矩形；中文按钮不套用大写，改用加宽字距承载同等的工装力道 |
| **数据与指标 (Data)** | `IBM Plex Mono` | `Noto Sans SC` | 600 | `14px ~ 28px` | 采购订单号、工时统计、金额指标（等宽只留给拉丁数字，中文标签走无衬线） |

---

## 4. 色彩与阴影系统 (Color & Shadow Tokens)

```css
:root {
  /* 基础底色与文字 */
  --bg-canvas: #FFFFFF;              /* 纯净清爽冷白底色 */
  --bg-surface-soft: #F6F8F9;        /* 柔和灰色工装底槽 */
  --ink-primary: #131414;            /* 纯净深黑主文字 */
  --ink-secondary: #647076;          /* 中性岩石灰次级文字 */
  --ink-muted: #9BA4A8;              /* 说明文字 */

  /* 核心强调色 */
  --accent-cyan: #8FC8CF;            /* 低饱和青瓷水蓝 (主品牌色/主装饰) */
  --accent-coral: #F27058;           /* 暖珊瑚橙 (高光 / 刷漆动效) */
  --accent-moss: #53853C;            /* 苔藓深绿 (成功状态 / 资源标签) */

  /* 边框与三层物理衰减阴影 (Triple Tier Soft Shadows) */
  --border-subtle: #E2E6E8;
  --shadow-escaped-card: 0px 2px 4px rgba(19, 20, 20, 0.08), 
                         0px 6px 16px rgba(19, 20, 20, 0.06), 
                         0px 12px 32px rgba(19, 20, 20, 0.04);
}
```

---

## 5. 专属排版手艺与组件代码 (Craft & Code Snippets)

### 1. 破框溢出式卡片容器 (Escaped Floating UI Card)
```html
<div style="position: relative; max-width: 900px; margin: 40px auto; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
  <!-- 左侧：文字描述 -->
  <div>
    <h3 style="font-family: 'IBM Plex Sans', 'Noto Sans SC', sans-serif; font-size: 32px; font-weight: 600; color: var(--ink-primary); line-height: 1.2;">
      Retrievals & Global Storage
    </h3>
    <p style="font-family: 'IBM Plex Sans', 'Noto Sans SC', sans-serif; font-size: 18px; color: var(--ink-secondary); line-height: 1.6; margin: 16px 0 24px;">
      Offboard employees and easily recover devices anywhere with tracked return kits and secure wipes.
    </p>
    <a href="#" style="
      display: inline-block;
      border: 1.5px solid var(--ink-primary);
      padding: 10px 20px;
      border-radius: 6px;
      font-family: 'IBM Plex Sans', 'Noto Sans SC', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--ink-primary);
      text-decoration: none;
    ">Learn More</a>
  </div>

  <!-- 右侧：主图 + 溢出破框真实数据卡片 -->
  <div style="position: relative;">
    <!-- 主图背景容器 -->
    <div style="background: var(--bg-surface-soft); border-radius: 12px; padding: 24px; border: 1px solid var(--border-subtle);">
      <div style="aspect-ratio: 4/3; background: #E9ECEF; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--ink-secondary); font-family: 'IBM Plex Sans', 'Noto Sans SC', sans-serif;">
        [ 概念矢量插画区域 ]
      </div>
    </div>

    <!-- 破框溢出浮层 1: 真实数据气泡 (Offset Bottom Left) -->
    <div style="
      position: absolute;
      bottom: -20px;
      left: -24px;
      background: var(--bg-canvas);
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: var(--shadow-escaped-card);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      gap: 16px;
    ">
      <div>
        <div style="font-family: 'IBM Plex Sans', 'Noto Sans SC', sans-serif; font-size: 12px; color: var(--ink-secondary);">This month you saved:</div>
        <div style="font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace; font-size: 24px; font-weight: 700; color: var(--ink-primary);">34.5h</div>
      </div>
      <div style="width: 10px; height: 32px; background: var(--accent-cyan); border-radius: 2px;"></div>
    </div>
  </div>
</div>
```

### 2. 荧光笔自下而上刷漆链接 (Highlighter Sweep Link)
```html
<style>
  .highlighter-link {
    position: relative;
    text-decoration: none;
    color: var(--ink-primary);
    font-family: 'IBM Plex Sans', 'Noto Sans SC', sans-serif;
    font-weight: 600;
    font-size: 20px;
    display: inline-block;
    z-index: 1;
  }
  .highlighter-link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-color: var(--accent-coral);
    z-index: -1;
    /* 刷漆只驱动 transform：scaleY 自底向上展开，避免 height 触发的逐帧 reflow */
    transform: scaleY(0.12);
    transform-origin: bottom center;
    will-change: transform;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .highlighter-link:hover::after {
    transform: scaleY(1);
  }
</style>

<a href="#" class="highlighter-link">
  Automated Device Lifecycle Management →
</a>
```

---

## 6. 交互与动效参数 (Motion & Micro-interactions)

> **动效律条：工业理性不等于僵死。** 全站只驱动 `transform` 与 `opacity`，任何几何属性（`height` / `width` / `top` / `margin`）一律交给静态布局，动效阶段不许碰。

```css
/* 1. 破框溢出数据卡：浮起 + 阴影衰减加深（位移而非 top） */
.escaped-data-card {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.escaped-data-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-escaped-card), 0 18px 44px rgba(19, 20, 20, 0.10);
}

/* 2. ROI 柱状图生长：scaleY 自底向上，逐列 60ms 错峰 */
@keyframes roi-bar-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
.roi-bar {
  transform-origin: bottom center;
  animation: roi-bar-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.roi-bar:nth-child(2) { animation-delay: 60ms; }
.roi-bar:nth-child(3) { animation-delay: 120ms; }
.roi-bar:nth-child(4) { animation-delay: 180ms; }

/* 3. 大写 CTA 按钮：箭头前移 4px，按钮本体不动（保持工业件的稳） */
.btn-cta-uppercase .cta-arrow {
  display: inline-block;
  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}
.btn-cta-uppercase:hover .cta-arrow {
  transform: translateX(4px);
}

/* 4. 大写 CTA 按钮按压：位移归零而非缩放，模拟工装件的硬触底 */
.btn-cta-uppercase:active {
  transform: translateY(1px);
  transition: transform 0.08s ease-out;
}

/* 5. 数据指标滚动到位后的高亮脉冲（只用 opacity，不闪 layout） */
@keyframes metric-flash {
  0%   { opacity: 1; }
  45%  { opacity: 0.55; }
  100% { opacity: 1; }
}
.metric-fresh {
  animation: metric-flash 0.9s ease-out 1;
}

/* 6. 无障碍兜底：尊重系统减弱动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .escaped-data-card,
  .btn-cta-uppercase .cta-arrow {
    transition: none;
  }
  .roi-bar,
  .metric-fresh {
    animation: none;
  }
}
```

| 场景 | 时长 | 缓动 | 驱动属性 |
| :--- | :--- | :--- | :--- |
| 刷漆链接 hover | `400ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `transform: scaleY()` |
| 破框卡片悬浮 | `280ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `transform` + `box-shadow` |
| ROI 柱状图生长 | `600ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `transform: scaleY()` |
| CTA 箭头位移 | `180ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | `transform: translateX()` |
| CTA 按压触底 | `80ms` | `ease-out` | `transform: translateY()` |

---

## 7. 核心反模式红线 (Forbidden Patterns)

* 🚫 **严禁死黑与灰泥潭底盘**：底色必须是冷白纸感（`--bg-canvas: #FFFFFF` / `--bg-surface-soft: #F6F8F9`），正文墨色锁定石墨黑 `--ink-primary: #131414`，严禁用 `#000000` 死黑作底盘或大面积文字。
* 🚫 **严禁把图文全部塞进规矩方盒**：每一屏至少保留一处破框溢出的真实数据切片（宽 `140px ~ 260px`、内边距 `16px 20px`、圆角 `8px`），并挂上 `--shadow-escaped-card` 三层衰减阴影，丢失破框就等于丢失本母体的 2.5D 叙事。
* 🚫 **严禁用几何属性驱动动效**：刷漆、柱状生长只许驱动 `transform` 与 `opacity`（如 `scaleY(0.12) → scaleY(1)`），严禁 `transition: height` / `width` / `top`，否则每帧触发 reflow。
* 🚫 **严禁圆角与阴影走软糯路线**：卡片圆角锁定 `8px ~ 12px`、按钮 `6px`；阴影必须是三层低透明度漫反射（单层不超过 `rgba(19, 20, 20, 0.08)`），严禁混入 `6px 6px 0 #131414` 这类新粗野硬阴影。
* 🚫 **严禁高饱和彩虹色与第四强调色**：主装饰只允许青瓷蓝 `--accent-cyan`，动手色只允许珊瑚橙 `--accent-coral`，成功态只允许苔藓绿 `--accent-moss`；状态色必须成对出现（色块 + 文本标签），严禁只靠颜色传意。
* 🚫 **严禁通用假数据与占位符**：所有指标必须落到有机的真实量级（如 `34.5h`、`1,248 台设备`、`98.6% 回收率`），严禁 `99.99%`、`Lorem ipsum`、`Acme Corp` 这类一眼假的填充物。
