# 案例：哈苏中画幅胶片人物肖像 (Visual Prompt / 2026)

**来源**：真实摄影师工匠配方 & GitHub Midjourney/Flux 高阶摄影学提示库  
**媒介**：Midjourney v6.1 / FLUX.1 [dev]

---

## 标杆 Prompt 原文 (The Exemplar Prompts)

### FLUX.1 结构化自然语言提示词 (Natural Language)
> "A quiet documentary portrait of a 42-year-old hardware engineer in a dim workshop, captured on Hasselblad X2D 100C with an 85mm f/1.4 lens. Single soft directional side-window daylight casting gentle falloff across the face. Natural skin texture with visible pores, fine crow's feet, and realistic micro-imperfections. Wearing a dark washed-canvas apron. Neutral muted background of organized brass tools softly falling out of focus. Kodak Portra 400 subtle color grading, matte finish, rich shadow details, zero artificial glow, zero plastic smoothing."

### Midjourney v6.1 参数化提示词 (Token & Parameters)
> "Editorial documentary portrait of an experienced hardware engineer, dim workshop environment, shot on Hasselblad X2D 85mm f/1.4 lens, soft north window lighting, realistic human skin micro-texture, Kodak Portra 400 film tones, muted color palette, depth of field, natural shadows, quiet mood --ar 16:9 --style raw --v 6.1 --no plastic skin, smooth face, airbrushed, 3d render, neon glow, floating particles, oversaturated"

---

## 为什么好（反 AI 塑料生图拆解）

1. **彻底根除塑料无毛孔假脸（Skin Micro-texture）**：
   * AI 默认生图会吐出像抹了 10 层粉底的橡胶假人脸。
   * 本范例显式指定真实年龄（42岁）、真实皮肤微瑕疵（visible pores, fine crow's feet）与哑光质感（matte finish）。
2. **单一明确的物理光源（Directional Window Falloff）**：
   * AI 生图最常犯的错误是“全身都在发光，四面八方都有补光”。
   * 本案例严格锁定为“单一侧窗北向漫射光（Single soft north window daylight）”，光线遵循反平方比自然衰减。
3. **精准的光学景深与胶片感（Camera & Film Calibration）**：
   * 指定 Hasselblad 85mm 中画幅浅景深与 Kodak Portra 400 胶片调色，规避了高饱和度数码糖水味。

---

## 可复用判断

* **“生图 Prompt 的第一法则是做减法与定光源”**：删掉一切“masterpiece, 8k, ultra-detailed”等无效水词，用具体的相机型号（Hasselblad X2D）、镜头焦段（85mm）和物理光源定义画面质感。
