# 视觉与生图 Prompt 手段库 (Visual Prompt & Optics Tool)

> 本手段库汲取自专业电影摄影机光学系统、真实胶片色彩科学与顶级 AI 生图引擎（Midjourney v6+ / FLUX.1）工程实践。
> 彻底告别劣质 AI 塑料感，输出具备真实物理光学与大师级构图的视觉指令。

---

## 🚫 1. 废黜画质废词黑名单 (Dead Prompt Tokens)

在生成任何生图提示词时，**严禁使用以下过时的垃圾词汇**（它们在现代模型中只会引发伪 3D 塑料感与死板高光）：
* ❌ `masterpiece, 8k resolution, photorealistic, hyperrealistic`
* ❌ `octane render, unreal engine 5, trending on artstation, vray`
* ❌ 空洞美化形容词：`extremely beautiful, breathtaking, stunning, gorgeous`

**黄金法则**：用**物理光学、摄影机机身、真实胶片型号与布光方向**，替代所有主观形容词！

---

## 📐 2. 电影工业级 5 层 Prompt 公式 (Physics-First Formula)

```text
[1. 主体与具象动作 (Subject & Precise Action)]
+ [2. 摄影机机身与镜头光学 (Camera Body & Lens Optics)]
+ [3. 电影布光与色彩科学 (Cinematic Lighting & Film Stock)]
+ [4. 环境物理微材质 (Physical Texture & Atmosphere)]
+ [5. 构图宽高比与引擎参数 (Framing & Engine Flags)]
```

---

## 🎥 3. 专业摄影光学与材质词典

### (1) 摄影机与镜头光学 (Camera & Optics)
* **中画幅肖像质感**：`Hasselblad 500C, Zeiss Planar 80mm f/2.8 lens, creamy depth of field`
* **电影感宽银幕**：`Arri Alexa Mini, 35mm anamorphic prime lens, 2.39:1 aspect ratio, subtle barrel distortion, horizontal lens flare`
* **纪实扫街视界**：`Leica M10-R, Summicron 35mm f/2 lens, natural documentary framing`
* **特写微观质感**：`100mm macro lens, macro details, tactile surface texture, visible micro-scratches`

### (2) 真实胶片与色彩科学 (Film Stock & Palette)
* **电影胶片质感**：`Kodak Vision3 500T 5219 film stock, subtle chemical halation around highlights, organic 35mm film grain`
* **自然人文人像**：`Kodak Portra 400, soft natural skin tones with visible pores, warm highlight roll-off`
* **极简银盐黑白**：`Kodak Tri-X 400 black and white film, deep rich blacks, high contrast silver-gelatin print aesthetic`
* **克制冷色调**：`desaturated Nordic color grading, muted earth tones, slate blue and charcoal palette`

### (3) 物理布光与阴影工程 (Cinematic Lighting)
* **戏剧性深阴影**：`Chiaroscuro, Rembrandt lighting, single directional key light from 45 degrees, heavy negative fill`
* **高级柔光**：`large diffused softbox through silk scrim, north window diffused overcast daylight`
* **轮廓与剪影**：`subtle rim lighting defining the silhouette, volumetric atmospheric dust particles catch the light`

---

## ⚙️ 4. 现代生图引擎语法分流协议

### (1) Midjourney v6+ 语法
* 侧重视觉参数控制与风格绑定：
  `[Core Prompt with camera & lighting] --ar 16:9 --style raw --v 6.1 --s 200`
* 严禁在 prompt 里使用“负向形容词”，改用 `--no plastic skin, shiny CGI, blur blob`。

### (2) FLUX.1 语法
* 侧重**自然的英语长句语法**与严密的物理因果描述，严禁单一逗号堆砌标签：
  * 错误：`girl, coffee, 35mm, film grain, morning light`
  * 正确：`A quiet medium shot of a woman in an oversized wool trench coat looking out of a rain-streaked cafe window. Shot on 35mm Leica M6 with Kodak Portra 400. Soft morning diffused light through wet glass, rich natural skin texture, deep shadow falloff.`
