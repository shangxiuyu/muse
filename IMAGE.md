# IMAGE.md 图像资产与生图 Prompt 契约

> **AI 专注指南**：本文件为当前项目中**所有图片资产的统一契约与生图账本**。遵循 Muse “通用底座保下限 + 5 大高频场景拔上限” 工业级架构，锁定情境意象后，再行输出结构化生图 API 提示词。

---

## 一、 情境、渠道与受众探针 (Context & Medium)

- **项目/文案来源**：深度专栏文章《大模型时代的个人工作流演进》
- **核心投放渠道**：微信公众号深度头条（首图 2.35:1 + 正文插图 16:9）与社交推文
- **目标受众画像**：资深开发者、独立创作者、注重效率与审美的知识工作者
- **全局视觉基调**：冷峻极简主义 + 晨光漫反射温润质感（冷钛灰与琥珀晨光）
- **通用审美底座审计 (Universal Floor Guardrails)**：
  - [x] **物理承载与重力**：所有客体真实落地，带环境光遮蔽阴影，严禁无理由悬浮；
  - [x] **单一物理主光源**：采用 3800K 晨光侧光与北窗冷光，阴影高光严格自洽；
  - [x] **真实物理微质感**：未涂布棉纸纤维纹理、拉丝钛金属刀痕、真折射磨砂玻璃；
  - [x] **全局 Anti-Slop 拦截**：封杀浮尘光斑（Floaties Ban）、封杀赛博紫蓝（Cyber-Purple Ban）、封杀油腻塑料面。

---

## 二、 逐张图片资产账本 (Image Asset Ledger)

| ID | 命中特化场景 | 版位与职责 | 对应文案段落与意象 | 构图画幅与留白 | 物理光影与材质 |
|---|---|---|---|---|---|
| **IMG-01** | 场景 1: Editorial | 公众号头条封面 | 第 1 节：从狂热走向理性的工具重构 | `2.35:1` / 左侧 50% 呼吸留白 | 晨光斜射，黑胡桃木桌上的精密黄铜圆规与手工纸 |
| **IMG-02** | 场景 3: Product | 核心架构插图 | 第 2 节：知识资产的拓扑与沉淀 | `16:9` / 居中微距景深 | 85mm f/5.6，未涂布活版压印卡片错落堆叠与柔光 |
| **IMG-03** | 场景 4: Cinematic | 尾声认知升华 | 尾声：人与 AI 的真实共振与主体性 | `16:9` / 黄金分割广角 | 35mm f/2.8，晨雾弥漫的极简清水混凝土走廊与单点晨光 |
| **IMG-04** | 场景 5: Flat Vector | 品牌工具徽标 | 品牌资产：极简现代数字工具标 | `1:1` / 纯 2D 矢量 | 纯平面负空间，瑞士几何构成，封杀 3D 样机与杂质 |

---

## 三、 结构化生图 API 提示词清单 (Production Prompts)

### 🖼️ IMG-01: [封面] 从狂热走向理性的工具重构
- **特化场景**：场景 1（Editorial & Metaphor）
- **版位与职责**：微信公众号头条封面，2 秒内抓住专业读者，为标题文字预留左侧负空间。
- **视觉意象**：晨光倾泻在一张整洁但有使用痕迹的手工木桌上，一支精密黄铜圆规静置于带有纤维纹理的厚棉纸旁，象征“重拾精准与内在秩序”。
- **Flux / DALL-E 3 自然语言 Prompt**：
  > `An editorial still-life photograph captured on a 50mm lens at f/3.5, wide 2.35:1 aspect ratio. In the right third of the frame, an authentic vintage brass drafting compass rests beside an open notebook made of thick, uncoated raw cotton paper with visible fiber imperfections. Gentle morning sunlight streams from the right window, casting long, soft-edged shadows across a rich dark walnut wooden desk with subtle tactile grain. The left half of the composition is a clean, tranquil negative space of soft ambient shadow and warm wooden surface, perfectly reserved for typography overlay. Natural organic textures, authentic documentary lighting, quiet contemplative atmosphere, no digital noise, no glowing particles.`
- **Midjourney v6 参数化 Prompt**：
  > `Minimalist editorial still-life, vintage brass compass on raw textured cotton paper notebook, dark walnut desk, soft morning side lighting, long realistic shadows, clean negative space on left half, captured on Hasselblad 907X, 50mm lens, authentic tactile materials, quiet focus, editorial aesthetic --ar 21:9 --style raw --v 6.1 --s 160 --c 5`
- **Negative Prompt (通用负向排除词)**：
  > `plastic surface, oversaturated colors, glowing magical particles, floating dust specks, cyber neon, artificial glow, 3d render look, blurry text, watermark`

---

### 🖼️ IMG-02: [插图] 知识资产的拓扑与沉淀
- **特化场景**：场景 3（Product & Studio Still Life）
- **版位与职责**：正文第 2 节插图，配合“知识沉淀”叙事，提供极具物理触感的证据锚点。
- **视觉意象**：多张带有微小活字压痕的极简卡片，以物理重力自然错落重叠在哑光混凝土展台上。
- **Flux / DALL-E 3 Prompt**：
  > `Commercial studio product photography of several minimalist off-white heavy cardstock notes overlapping on a matte concrete pedestal, 16:9 aspect ratio. Captured on an 85mm macro lens at f/5.6. Diffused double softbox lighting revealing tactile letterpress debossing marks and authentic paper fiber grain. Shallow depth of field with sharp focus on the front card edge, gentle natural falloff in background. Pure neutral color palette with warm gray and ivory tones, crisp commercial clarity, zero dust.`
- **Midjourney v6 Prompt**：
  > `Macro shot of heavy off-white letterpress cards overlapping on smooth matte stone, tactile paper texture, soft diffuse studio softbox lighting, shallow depth of field, architectural elegance, minimalist composition, neutral tones --ar 16:9 --style raw --v 6.1 --s 140`
- **Negative Prompt**：
  > `glossy plastic, neon lights, floating glowing objects, cartoonish, low resolution`

---

### 🖼️ IMG-03: [插图] 人与 AI 的真实共振与主体性
- **特化场景**：场景 4（Cinematic & Documentary）
- **版位与职责**：尾声升华插图，赋予读者开阔的思维余韵与清醒从容感。
- **视觉意象**：现代极简清水混凝土长廊尽头，一束纯净的晨光洒在地面上，远处开阔无垠的天际线。
- **Flux / DALL-E 3 Prompt**：
  > `An authentic architectural documentary photograph taken with a 35mm lens, 16:9 aspect ratio. Looking down a minimalist raw concrete corridor towards an open doorway. Early morning natural golden light floods the entrance, creating a sharp angle of light across the polished concrete floor. In the distance beyond the doorway, a calm open skyline shrouded in soft mist. Balanced composition, high dynamic range, authentic concrete seams and formwork holes, peaceful and expansive mood, no artificial lens flare.`
- **Midjourney v6 Prompt**：
  > `Minimalist raw concrete hallway leading to an open light-filled doorway, morning golden hour light beam on concrete floor, distant misty skyline, architectural photography by Tadao Ando style, Leica SL2, 35mm lens --ar 16:9 --style raw --v 6.1 --s 180`
- **Negative Prompt**：
  > `surreal floating islands, magical glitter, neon glow, oversharpened, plastic walls`

---

### 🖼️ IMG-04: [品牌] 现代数字工具流 Logo
- **特化场景**：场景 5（Pure Flat Vector & Graphic）
- **版位与职责**：品牌产品图标，用于 App Icon、Favicon 与 IDE 插件标。
- **视觉意象**：纯 2D 极简几何负空间构成的 `M` 字母切片，瑞士现代主义风格。
- **Flux / DALL-E 3 Prompt**：
  > `A pure flat 2D vector logo icon for 'Muse' software tool in the clean aesthetic of Linear and Swiss modernist design. Centered on a solid dark graphite background (#0A0C10). An ultra-minimalist, razor-sharp geometric glyph forming an abstract 'M' through clever negative space and balanced solid monochrome shapes. Designed by Paul Rand and Dieter Rams. Pure flat graphic design, crisp vector silhouette, mathematical symmetry, high contrast. Constraints: strictly 2D flat vector only, no 3D shading, no bevels, no metallic reflections, no realistic textures, no photorealistic mockups, no gradient clutter.`
- **Midjourney v6 Prompt**：
  > `Pure flat 2D vector logo icon, abstract M glyph, Swiss modernist design by Paul Rand, dark solid background, sharp vector silhouette, negative space, high contrast, clean minimalist branding --ar 1:1 --style raw --v 6.1 --s 100 --no 3d, bevel, metallic, realistic, mockup, gradient`
- **Negative Prompt**：
  > `3d render, bevels, realistic reflections, photorealistic mockup, metallic textures, complex gradients, messy details, shadows, glossy surface`
