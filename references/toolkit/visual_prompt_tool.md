# 视觉生图与物理光学 Prompt 手段库 (Visual Prompt & Optics Tool)

> 本手段库汲取自 GitHub 顶级开源生图与摄影光学提示词生态：
> - [CaylaLuo/awesome-midjourney-prompts](https://github.com/CaylaLuo/awesome-midjourney-prompts)
> - [ai-boost/awesome-prompts](https://github.com/ai-boost/awesome-prompts)
> 融合阿莱（Arri）、哈苏（Hasselblad）、徕卡（Leica）物理光学与柯达真实胶片色彩科学。
> 彻底告别劣质 AI 塑料感，输出具备真实光学景深与电影级构图的指令。

---

## 🚫 1. 废黜画质废词黑名单 (Dead Tokens Blacklist)

在生成任何生图提示词时，**严禁使用以下被模型严重污染的毒药词汇**（它们只会引发蜡像假人与刺眼伪 3D 高光）：
* ❌ `masterpiece, 8k resolution, photorealistic, hyperrealistic, ultra-detailed`
* ❌ `octane render, unreal engine 5, trending on artstation, vray`
* ❌ 空洞美化副词：`extremely beautiful, breathtaking, stunning, gorgeous`

**黄金铁律**：用**物理光学、摄影机传感器型号、真实镜头焦段、物理光源方向与胶片乳剂**，替代所有主观形容词！

---

## 📐 2. 电影工业级五层光学公式 (The 5-Tier Optical Formula)

```text
[1. 主体与具象动作 (Subject & Direct Action)]
+ [2. 摄影机机身与镜头焦段 (Camera Body & Lens Optics)]
+ [3. 物理布光与阴影工程 (Physical Lighting & Directional Falloff)]
+ [4. 胶片乳剂与色彩科学 (Film Stock & Color Grading)]
+ [5. 构图宽高比与去脂参数 (Framing & Anti-AI Engine Flags)]
```

---

## 🎥 3. 专业工业光学与色彩词典

### (1) 摄影机传感器与镜头 (Sensors & Optics)
* **中画幅肖像微质感**：`Hasselblad X2D 100C, 85mm f/1.4 prime lens, creamy shallow depth of field, natural optical bokeh`
* **电影宽银幕质感**：`Arri Alexa 65, 35mm anamorphic prime lens, 2.39:1 widescreen aspect ratio, subtle horizontal lens flare, barrel distortion`
* **街头人文纪实**：`Leica M10-R, Summicron 35mm f/2 lens, candid eye-level documentary perspective`
* **工业仪器宏观特写**：`100mm macro lens, tactile brushed-metal micro-scratches, edge focus falloff`

### (2) 经典胶片乳剂 (Authentic Film Stocks)
* **温润人像微质感**：`Kodak Portra 400 film stock, organic film grain, natural skin pores, gentle highlight roll-off`
* **夜景高光卤化**：`Cinestill 800T tungsten-balanced film, distinctive red halation around neon highlights, moody cool shadows`
* **冷峻银盐黑白**：`Kodak Tri-X 400 black and white film, deep rich dynamic range, silver-gelatin darkroom aesthetic`
* **北欧冷冽调色**：`desaturated Nordic color grading, muted moss green and slate charcoal palette`

### (3) 物理真实布光 (Directional Lighting)
* **单侧窗北向漫射光**：`Single soft north window daylight from 45 degrees, gentle inverse-square falloff across the subject`
* **伦勃朗戏剧光影**：`Rembrandt lighting with subtle triangle highlight on the cheek, heavy negative fill, deep shadows`
* **无光晕轮廓勾勒**：`subtle razor-sharp rim lighting separating subject from dark backdrop, zero artificial bloom`

---

## ⚙️ 4. 现代双引擎分流协议

### 协议 A：Midjourney v6+ 参数流
* **必须附带 `--style raw`**：强制抑制 Midjourney 内置的过度美化磨皮算法；
* **必须附带显式 `--no` 排除指令**：`--no plastic skin, smooth face, airbrushed, 3d render, neon glow, floating particles, oversaturated`；
* **宽高比控制**：人物肖像 `--ar 4:5` 或 `--ar 3:4`；电影场景 `--ar 16:9` 或 `--ar 2.39:1`。

### 协议 B：FLUX.1 英语自然语言因果流
* **严禁标签堆砌**（禁止 `girl, coffee, 35mm, portrait`）；
* **必须使用连贯长句阐述光线物理交互**：
  > "A quiet documentary medium portrait of a 42-year-old female architect in a dim studio. Shot on Hasselblad X2D with 85mm f/1.4 lens. Single directional overcast daylight entering from a high side window, casting soft shadow falloff across concrete drafting tables. Natural skin micro-texture with visible pores, matte finish. Kodak Portra 400 color tones, muted palette, zero plastic shine."
