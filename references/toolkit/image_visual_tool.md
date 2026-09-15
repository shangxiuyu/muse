# 图像生成与视觉提示词全能实战手册 (Visual Prompt & Image Generation Toolkit)

用于文章配图、社交媒体视觉、公众号/小红书封面、产品概念渲染、PPT 视觉证据、品牌主视觉（Key Visual）以及 AI 生图 API 提示词（Prompt）工程。
**核心哲学：美是关系的艺术。** 图像不是孤立的无脑生成或死板直译，而是**文案内容、媒介渠道、受众心智与真实物理质感在时空中达成的“恰当”共振**。

> **AI 专注指南（Single Source of Truth）**：本手册为 Muse 图像与生图任务的**自包含全能作战指南**。本系统采用 **“通用底座保下限 + 5 大高频场景拔上限”** 的双层工业级架构。生图前必须先从文案与情境推导真实渠道与受众，并在项目根目录交付统一管理全部图片资产的 `IMAGE.md` 契约后，再行组装调用生图 API。

---

## 🏛️ 双层工业级架构：底座保下限 · 场景拔上限

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 【第一层 · 通用审美底座 (保下限)】无论生成任何内容，强制执行 4 步物理与审美审计，彻底消灭 AI 塑料垃圾 │
│  ① 物理承载与重力接地 ➔ ② 单一物理主光源闭环 ➔ ③ 真实表面微观质感 ➔ ④ 全局 Anti-Slop 拦截网   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 【第二层 · 5 大高频场景特化 (拔上限)】针对 90% 核心工作流，定制大师级提示词配方与审美模型：            │
│  1. 深度文章与专栏配图 (Editorial)   ➔ 隐喻转化引擎 + 30%~50% 构图排版负空间预留              │
│  2. 社交媒体与封面首图 (Social/Hero) ➔ 视觉重心前置 + 2 秒抓住眼球的高张力明暗反差             │
│  3. 产品静物与工业切片 (Product)     ➔ CleanShot 级柔光箱漫射 + CNC 微倒角与真实物理材质       │
│  4. 电影叙事与人文纪实 (Cinematic)   ➔ 35mm/50mm 黄金焦段 + Kodak 胶片颗粒 + 未摆拍自然抓拍   │
│  5. 极简品牌图形与平面 (Flat Vector) ➔ 绝对 2D 纯平面 + 负空间几何 + 严格封杀 3D/样机/渐变杂质 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 【第三层 · 多模型分流装配】自然语言长句流 (Flux / DALL-E) vs 结构化参数流 (Midjourney / SDXL)          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 【第四层 · 单项目统一契约】根目录 IMAGE.md 集中管理全部图片资产账本，杜绝碎片化文件                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 一、 第一层：通用审美底座（保下限机制）

无论面对什么未知、随机的生图请求，提示词在组装时必须强制通过以下 **4 道物理与审美防线**，确保输出质量永远在线：

### 1. 物理承载与重力接地（Grounding & Gravity）
- **封杀悬浮物**：严禁物体在没有逻辑理由的情况下悬浮空中。必须明确物体的承载介质（如 `resting on a raw dark walnut desk`, `placed on a brushed titanium base`）。
- **接触面阴影**：强制声明接触面环境光遮蔽（AO）阴影，使客体真实“坐”在空间中。

### 2. 单一物理主光源与光线闭环（Lighting Logic）
- **确定光源物理来源**：严禁使用全方向死白光或无源发光。强制确定一个主光源：
  - *晨曦/落日漫射光*（3200K~4000K 温润暖光）；
  - *北窗天然漫射天光*（5500K~6500K 中性冷光，最适合科技与静物）；
  - *45度经典侧光/伦勃朗光*（制造雕塑感与深邃阴影）。
- **光线逻辑一致**：高光点、受光面、投影方向必须严格几何自洽。

### 3. 真实表面微观质感（Tactile Micro-Textures）
- **打破光滑塑料感**：AI 默认会输出反光油腻的塑料表面。提示词中必须显式声明真实物理缺陷：
  - 人物皮肤：`natural skin texture, visible micro-pores, authentic imperfect skin tone`；
  - 纸张印刷：`uncoated heavy raw cotton paper, subtle letterpress indentation, tactile fiber grain`；
  - 金属材质：`cold matte anodized aluminum, subtle brushed titanium finish, fine CNC toolmarks`；
  - 玻璃光学：`optical frosted liquid glass, physical light caustics and refractions`。

### 4. 全局通用 Anti-Slop 拦截铁网（全局负向约束）
所有生成的通用 Negative Prompt 中必须常驻以下违禁词库：
> `Negative Prompt: plastic skin, oversaturated neon, glowing particles, floating dust specks, magical glitter, fairy dust, 3d glossy render, artificial outer glow, lens flare overuse, messy gradient clutter, deformed anatomy, uncanny valley, watermark, lowres artifact`

---

## 二、 第二层：5 大高频场景特化（拔上限机制）

针对日常内容创作与产品研发中最高频的 5 大场景，直接调用专属的大师级配方：

---

### 🏛️ 场景 1：深度文章与专栏叙事配图（Editorial & Metaphor）

* **核心目标**：辅助深度阅读，将文案核心观点转化为高级隐喻，同时为文字排版预留呼吸空间。
* **致命误区**：字面直译（讲“增长”画向上的箭头，讲“管理”画握手）。
* **上限特化方法**：
  1. **隐喻客体转化**：寻找承载张力的自然/古典静物客体（如用孤立在雪原的灯塔隐喻破局，用微距多米诺骨牌隐喻连锁反应）；
  2. **负空间排版预留**：显式声明 `30% to 50% clean negative space on the left/top for typography overlay`；
  3. **克制色彩**：中性灰底色 + 局部单点温润提色。
* **工业级 Prompt 模板（Flux / DALL-E 3）**：
  > `An editorial still-life photograph captured on a 50mm lens at f/2.8, [16:9 / 2.35:1] aspect ratio. In the right third of the frame, [具体的隐喻客体，如：an antique brass navigational compass resting beside an open raw paper journal]. Soft natural morning diffused light entering from the side, casting gentle long shadows. The left half of the composition is a tranquil, uncluttered negative space of soft ambient shadow and warm textured surface, reserved for typography. Quiet contemplative mood, muted organic color palette, visible fiber textures, authentic Hasselblad medium format quality, no digital noise, no glowing particles.`

---

### ⚡ 场景 2：社交媒体与视觉首图（Hero & Social Hook）

* **核心目标**：在小红书、推文、Banner 等快速下滑的信息流中，2 秒内抓住受众注意力。
* **致命误区**：平铺直叙、元素散乱、缺乏视觉第一焦点。
* **上限特化方法**：
  1. **3:4 / 9:16 垂直画幅**，视觉重心前置（前 1/3 黄金分割位置）；
  2. **高张力明暗切片（Chiaroscuro）**：单侧强光切入，大面积暗调衬托主体高光；
  3. **情绪张力与微观细节**：强动词与瞬间定格。
* **工业级 Prompt 模板（Flux / DALL-E 3）**：
  > `A striking cinematic editorial photograph, vertical 3:4 aspect ratio. A bold and dynamic close-up of [具有视觉张力的主体与瞬间动作]. Dramatic directional key lighting with deep cinematic shadows, creating high visual contrast and an immediate focal anchor. Rich tactile textures, sharp subject separation from a beautifully muted background. Authentic color grading inspired by contemporary editorial magazines, vivid yet restrained color accents, crisp details, high visual impact, zero clutter.`

---

### 📐 场景 3：产品静物与工业切片（Product & Studio Still Life）

* **核心目标**：展现硬件产品、SaaS 概念实体、包装或周边设计的高端触觉质感。
* **致命误区**：塑料感强、光线乱七八糟像廉价淘宝图。
* **上限特化方法**：
  1. **CleanShot 级双柔光箱漫射布光**（消除一切刺眼反光）；
  2. **微距视角（85mm / 100mm Macro）** + 强调装配微缝隙与 CNC 精密切削倒角；
  3. **纯净基底与几何展台**（哑光石膏台或深色阳极氧化铝板）。
* **工业级 Prompt 模板（Flux / Midjourney）**：
  > `Commercial studio product photography of [精密产品或实体硬件], placed on a minimalist matte concrete pedestal. Captured on an 85mm macro lens at f/5.6. Professional diffused double softbox studio lighting, showcasing razor-sharp 1px edge bevels, authentic brushed titanium finish, and subtle matte surface reflections. Clean, solid neutral background (#0F1117 / #F4F5F7). Precise industrial design aesthetic, tangible tactile materials, crisp commercial clarity, no dust, no fake 3D bloom.`

---

### 🎬 场景 4：电影叙事与人文纪实（Cinematic & Documentary）

* **核心目标**：真实感人、具备呼吸感的人物抓拍与生活场景，传达品牌温度与故事。
* **致命误区**：磨皮过度的 AI 网红脸、僵硬摆拍、眼神空洞。
* **上限特化方法**：
  1. **真实人文焦段**：`35mm or 50mm Prime Lens`，自然人眼透视；
  2. **抓拍瞬间（Candid Moment）**：人物处于真实工作/思考/交谈的非摆拍状态；
  3. **胶片色彩科学**：`Kodak Portra 400` 或 `Leica M11 真实自然色温`，真实毛孔与细微表情纹理。
* **工业级 Prompt 模板（Flux / DALL-E 3）**：
  > `An authentic documentary portrait photograph captured on a 35mm lens at f/2.0. [真实情境中的人物与动作，如：A thoughtful software architect sketching system diagrams on a glass wall in a dimly lit studio]. Candid, unposed moment with genuine focus. Natural ambient window light softly illuminating the face, revealing realistic skin texture with visible micro-pores and fine details. Warm muted Kodak Portra 400 color tones, cinematic depth of field, authentic environmental atmosphere, no artificial smoothing, no plastic look.`

---

### 🎨 场景 5：极简品牌图形与平面（Pure Flat Vector & Graphic）

* **核心目标**：App Icon、Logo 标识、现代数字工具流品牌图形（Linear / Raycast / Vercel 风格）。
* **致命误区**：AI 自作聪明加入 3D 倒角、金属拉丝、复杂渐变和样机（Mockup）阴影。
* **上限特化方法（GitHub 工业级硬隔离法则）**：
  1. **绝对 2D 纯平面**：强制 `pure flat 2D vector graphic, solid monochrome fill`；
  2. **负空间几何构图**：基于包豪斯与瑞士现代主义（Paul Rand / Dieter Rams 风格）；
  3. **极严负向排斥**：彻底封杀 `no 3D, no bevel, no metallic texture, no photorealistic mockup, no gradient clutter`。
* **工业级 Prompt 模板（Midjourney / Flux）**：
  > `A pure flat 2D vector logo icon for [品牌/概念名称] in the clean aesthetic of Linear and Swiss modernist design. Centered on a solid [pure dark #0A0C10 / clean white #FFFFFF] background. An ultra-minimalist, razor-sharp geometric glyph forming an abstract [核心几何符号/字母] through clever negative space and balanced solid shapes. Designed by Paul Rand. Pure flat graphic design, crisp vector silhouette, mathematical symmetry, high contrast. Constraints: strictly 2D flat vector only, no 3D shading, no bevels, no metallic reflections, no realistic textures, no photorealistic mockups, no gradient clutter.`

---

## 三、 第三层：多模型语法装配引擎（Model-Agnostic Topologies）

不同生图模型底层理解机制不同，必须在输出时进行语法分流装配：

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 自然语言长句流 (Flux 1.1 Pro / DALL-E 3)                            │
│    语法特征：排斥逗号碎词堆砌，使用连贯、富有文学质感与空间方位的完整英文长句。│
│    结构：[媒介与焦段] + [主体与动作] + [空间与负空间] + [光源色温] + [微观质感] │
├────────────────────────────────────────────────────────────────────────┤
│ 2. 结构化权重流 (Midjourney v6 / SDXL)                                 │
│    语法特征：核心概念锚词 + 摄影参数 + 大师风格 + 强制系统后缀参数。           │
│    结构：[Core Subject], [Scene & Space], [Light], [Camera/Film], [Style]     │
│          --ar [比例] --style raw --v 6.1 --s [100~200] --c [0~10]      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 四、 第四层：单项目统一交付契约（`IMAGE.md`）

在一个项目中（无论是单篇文章、一套 PPT 还是一个 Web App），**所有的图片资产统筹在同一个根目录的 `IMAGE.md` 契约文件中进行管理**，严禁碎片化建文件。

### `IMAGE.md` 标准工程规范模板：

```markdown
# IMAGE.md 图像资产与生图 Prompt 契约

## 一、 情境、渠道与受众探针 (Context & Medium)
- **项目/文案来源**：[关联的 WRITING.md / PPT.md / 文章主题]
- **核心投放渠道**：[微信公众号 / 小红书 / 16:9 Web Deck / 官网 Hero / 社交推文]
- **目标受众画像**：[行业专家 / 决策高管 / 大众年轻用户 / 极客群体]
- **全局视觉基调**：[例如：冷峻极简纪实 / 温暖胶片叙事 / 精密工科实证 / 极简包豪斯 3D]
- **反 AI 塑料感硬规则 (Restraint Rules)**：
  - [x] 通用 4 步物理审计：承载接地 + 单一光源 + 表面微质感 + Anti-Slop 拦截；
  - [x] 构图预留排版负空间（Negative Space），严禁主体与文字打架；
  - [x] 矢量与图形任务强制执行 Pure 2D Flat 约束，封杀 3D 样机与杂质。

---

## 二、 逐张图片资产账本 (Image Asset Ledger)

| ID | 命中特化场景 | 版位与职责 | 对应文案段落与意象 | 构图画幅与留白 | 物理光影与材质 |
|---|---|---|---|---|---|
| **IMG-01** | 场景 1: Editorial | 封面首图 / Hero | 第 1 章：初创破局与行业暗流 | `2.35:1` / 左侧 50% 留白 | 晨光穿透薄雾，湿漉柏油路面与冷金属反光 |
| **IMG-02** | 场景 3: Product | 核心技术切片 | 第 3 章：系统底层拓扑优化 | `16:9` / 居中微距 | 85mm f/5.6，精密服务器光纤阵列冷白漫反射 |
| **IMG-03** | 场景 5: Flat Vector | 品牌产品标识 | 品牌资产：极简现代工具标 | `1:1` / 居中纯平面 | 纯 2D 矢量，瑞士几何负空间，冷钛黑底色 |

---

## 三、 结构化生图 API 提示词清单 (Production Prompts)

### 🖼️ IMG-01: [封面] 初创破局与行业暗流
- **职责与场景**：命中场景 1（Editorial），作为公众号头条首图，预留左侧负空间。
- **视觉意象**：湿漉的清晨城市高空天际线，一束破晓阳光穿透厚重云层照射在一座冷峻的现代钢结构建筑边缘。
- **Flux / DALL-E 3 Prompt**：
  > `An editorial wide-angle photograph taken on a 35mm lens, 2.35:1 aspect ratio. In the right half of the frame, the sharp corner of a raw concrete and steel skyscraper extends into the sky. A single sharp ray of early morning sunlight pierces through overcast clouds, illuminating wet metallic surfaces. The left half is a clean atmospheric gradient of deep cold gray and soft warm haze, reserved as negative space for typography. Natural architecture, authentic textures, no digital blur, no floating specks.`
- **Midjourney v6 Prompt**：
  > `Minimalist raw concrete skyscraper corner cutting through misty morning sky, clean negative space on left half, wet architectural steel textures, realistic morning sun ray, captured on Leica M11, 35mm f/4, editorial architectural photography --ar 21:9 --style raw --v 6.1 --s 160`
- **Negative Prompt**：
  > `plastic texture, oversaturated neon, glowing particles, floating dust, 3d render look, artificial bloom, text, watermark`

---

### 🖼️ IMG-02: [插图] 系统底层拓扑优化
（依次递推罗列项目中所有图片……）
```

---

## 五、 交付前终极审美自省（The 6-Axis Audit）

在将提示词提交给生图 API 前，执行终极自省：
1. **底座合格否**：有无悬浮物？光源是否单一闭环？微观质感有无物理缺陷？
2. **场景命中否**：是否准确命中了 5 大场景之一并注入了专属特化关键词？
3. **意象高级否**：是否脱离了文字直译，提供了耐人寻味的客观载体？
4. **留白有效否**：如需叠加文案，负空间是否干净纯粹？
5. **去 AI 味彻底否**：是否已坚决拦截浮尘光斑、假脸塑料皮、无脑紫蓝与 3D 样机杂质？
6. **语法适配否**：是否对 Flux 使用了自然长句，对 Midjourney 使用了参数化后缀？
