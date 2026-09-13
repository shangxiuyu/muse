# UI 页面拓扑与设计原型骨架库 (Page Archetypes & Structural Skeletons)

> **核心原则**：AI 默认有“居中三板斧”（居中小药丸 + 居中大粗字 + 居中双按钮 + 3个等宽矩形）的生成惰性。
> 在任何 UI 任务开始前，**必须显式选取以下 1 种页面拓扑骨架**，从物理结构上杜绝 AI 塑料味。

---

## 🏛️ 6 大非对称页面拓扑骨架 (Page Topologies)

### 1. Bento Grid 错落魔方网格 (Modern SaaS / Product Showcase)
* **适用场景**：功能聚合展示、核心能力矩阵、复杂产品特性组合。
* **结构规则**：
  - 采用 12 列或 3-4 列不规则跨度网格（`grid-column: span 2` / `span 1`）。
  - **核心卡片（Hero Card）** 占 2x2 面积，具备深色背景或高对比视觉锚点；
  - **辅助卡片（Stat / Code / Mini-tool）** 占 1x1 或 1x2，展示动态指标或微交互。
* **布局规范**：
  ```css
  .bento-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(220px, auto);
    gap: 16px;
  }
  .bento-hero { grid-column: span 2; grid-row: span 2; }
  .bento-tall { grid-column: span 1; grid-row: span 2; }
  .bento-wide { grid-column: span 2; grid-row: span 1; }
  ```

---

### 2. Split-Screen Console 左右分屏控制台 (DevTools / Terminal-Driven)
* **适用场景**：开发者工具、API 平台、极客产品、CLI 助手。
* **结构规则**：
  - **左侧（45%）**：纯净高对比排版。精密字阶、技术标签（`mono-badge`）、紧凑 CTA。
  - **右侧（55%）**：深色控制台容器（Dark Instrument Console）。包含真实运行的代码高亮、实时执行日志流、双向数据通信指示灯。

---

### 3. Dense Instrument Station 密集仪器仪表盘 (Analytics / Complex Workflow)
* **适用场景**：多 Agent 状态监控、金融数据、工作流编排（DAG）。
* **结构规则**：
  - 放弃大片无意义留白，建立紧凑的 4px/8px 模数网格。
  - 使用 1px 精细网格线分隔区域，带有微型状态脉冲灯（Status Ping）、拓扑连线（SVG Nodes）与实时 Metric 指标。

---

### 4. Interactive Timeline Rail 轨道交互流 (Relay Pipeline / History)
* **适用场景**：智能体任务接力、蒸馏流水线、演进历史。
* **结构规则**：
  - 贯穿始终的 1px 发光轴线（Rail line）。
  - 节点卡片沿轴线错落挂载，带有状态编号（`01 // DISPATCH`）与交互流转动画。

---

### 5. Swiss High-Typography Editorial 瑞士排版沉浸叙事 (Brand / Philosophy)
* **适用场景**：设计系统、品牌宣言、高端内容叙事。
* **结构规则**：
  - 极端克制的颜色（95% 黑白灰阶 + 5% 点睛色）。
  - 巨大的紧缩字间距标题（`letter-spacing: -0.04em; line-height: 1.05;`）。
  - 极精细的分割线与大量呼吸空间，通过纯粹的字阶与留白建立极高张力。

---

### 6. Interactive Floating Island 悬浮微岛 (Modern WebApp Workspace)
* **适用场景**：AI 对话工作区、文档沉浸编辑、画布操作。
* **结构规则**：
  - 底部/侧边紧凑悬浮操作坞（Floating Dock）。
  - 主内容区无缝延展，卡片具备 1px 细微光泽边框与 Spotlight 鼠标跟随光晕。

---

## 🎨 视觉风格与产品属性映射表 (Archetype Mapping)

> 权威色板与动效 Token 统一定义于 [ui_product_tool.md](toolkit/ui_product_tool.md)，本表仅负责业务场景与预设的挂载路由：

| 业务领域 | 推荐页面骨架 | 挂载 Brand Token 预设 (ui_product_tool) | 动效强度档位 (motion_video_tool) |
| :--- | :--- | :--- | :--- |
| **开发者工具 / CLI** | Split-Screen Console | `linear-dark` (深曜石工匠) 或 `vercel-mono` | Snap 极快档 (120ms) |
| **多智能体协作 / SaaS** | Bento Grid + 悬浮微岛 | `stripe-modern` (现代空气感) | Smooth 平滑档 (220ms) |
| **知识资产 / 个人系统** | Timeline Rail + Bento | `apple-editorial` (人文纸质) | Smooth 平滑档 (220ms) |
| **文化艺术 / 人文茶道 / 东方出版** | Swiss High-Typography 或 Timeline Rail | `oriental-zen` (东方写意留白) | Deep 沉浸档 (420ms) |
| **Web3 / 潮流厂牌 / 先锋极客** | Bento Grid (硬边直角) | `neo-brutalism` (新粗野硬阴影) | Snap 机械硬弹 (100ms) |
| **设计系统 / 审美工具** | Swiss High-Typography | `stripe-modern` 或 `apple-editorial` | Smooth 平滑档 (220ms) |

---

# 美学风格参考 (Archetypes)

用于在特定场景下统一跨媒介风格。

---

## 1. 极简克制 (Minimalism)
* **核心**：剔除冗余修饰，留白即是信息。
* ✍️ **文字**：短句陈述，零形容词，直击事实。
* 🖼️ **图像**：大面积负空间，单一主体，微弱冷暖对比。
* 🎬 **动态**：固定机位，长镜头，环境原声，低频剪辑。
* 🖥️ **界面**：单色底色，大间距留白，精细字阶。

---

## 2. 东方侘寂 (Wabi-Sabi)
* **核心**：自然残缺与岁月质感，内敛有余味。
* ✍️ **文字**：凝练克制，留有余白，静水流深。
* 🖼️ **图像**：胶片颗粒，自然漫射光，低饱和大地色，粗糙纹理。
* 🎬 **动态**：慢速推进，自然声，无痕淡入淡出。
* 🖥️ **界面**：不对称平衡，暖灰/米白，温润圆角，流式排版。

---

## 3. 冷峻电影 (Cinematic Noir)
* **核心**：强光影对比，硬朗写实，情绪暗涌。
* ✍️ **文字**：白描手法，强镜头感，拒绝抒情。
* 🖼️ **图像**：宽银幕比例（2.39:1），侧逆光，暗部层次丰富。
* 🎬 **动态**：缓慢推移（Dolly-in），冷暖色调对冲，低频音效。
* 🖥️ **界面**：低照度暗调，精密光影层次，高焦点对比。

---

## 4. 人文杂志 (Editorial)
* **核心**：典雅考究，讲究图文律动与思辨性。
* ✍️ **文字**：遣词精准，逻辑严密，富有音律感。
* 🖼️ **图像**：纪实抓拍，真实情绪，人文纪实感。
* 🎬 **动态**：手持微晃纪实感，从容的人文旁白。
* 🖥️ **界面**：衬线与无衬线混排，考究字距与画册版式。

---

## 5. 工业功能 (Bauhaus)
* **核心**：形式服从功能，几何秩序与高精度。
* ✍️ **文字**：结构化陈述，定义精确，无模糊词。
* 🖼️ **图像**：硬朗几何线条，严谨布光，真实金属与磨砂材质。
* 🎬 **动态**：精准卡点，机械节拍，利落硬切。
* 🖥️ **界面**：强网格系统，高信息密度，精密仪表盘质感。

---

## 6. 赛博诗意 (Cyber Poetics)
* **核心**：高精度科技感与技术哲思。
* ✍️ **文字**：精准技术术语与哲学隐喻交织。
* 🖼️ **图像**：深黑背景，微米级纹理，极细冷光点缀。
* 🎬 **动态**：微距推轨，声画共振，低频电子质感。
* 🖥️ **界面**：深黑底色，微光刻度线，极窄边框。

