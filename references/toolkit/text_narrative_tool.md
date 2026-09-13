# 文字表达与去 AI 味叙事手段库 (Text Narrative & Anti-Slop Tool)

> 本手段库严格对标 GitHub 顶级开源反 AI 写作项目：
> - [jalaalrd/anti-ai-slop-writing](https://github.com/jalaalrd/anti-ai-slop-writing)
> - [harshaneel/humanize](https://github.com/harshaneel/humanize)（学术界检测文献衍生的 9 大人类化杠杆）
> - [lguz/humanize-writing-skill](https://github.com/lguz/humanize-writing-skill)（三遍消杀法）
> 
> 严禁生成带有统计学 AI 标记、假大空修辞与八股排比的廉价文本。

---

## 🚫 1. 统计学高频 AI 违禁标记库 (The Anti-Slop Lexicon)

基于大语言模型困惑度（Perplexity）与词频检测文献，以下词汇在人类自然写作中频率极低，但在模型生成中呈现病态聚集。**在任何文本生成中一票否决**：

### 英文 50+ 统计学标记词 (Hard Banned in English)
* **动作动词**：`delve`, `embark`, `harness`, `elevate`, `unlock`, `foster`, `bolster`, `champion`, `resonate`, `navigate` (比喻用法)
* **修饰形容词**：`pivotal`, `intricate`, `vibrant`, `seamless`, `multifaceted`, `bespoke`, `transformative`, `paramount`, `quintessential`, `unparalleled`
* **名词与意象**：`tapestry`, `beacon`, `cornerstone`, `symphony`, `testament to`, `landscape` (比喻用法), `realm`, `synergy`, `game-changer`
* **副词与口头禅**：`seamlessly`, `undeniably`, `furthermore`, `moreover`, `consequently`, `crucially`

### 中文公关与 AI 塑料套话 (Hard Banned in Chinese)
* **假大空宏大动词**：`赋能`, `颠覆`, `重塑`, `引领`, `打造`, `深耕`, `打通`, `下沉`, `对齐` (无实体对齐时)
* **互联网八股黑话**：`底层逻辑`, `顶层设计`, `抓手`, `闭环`, `矩阵`, `维度` (无物理量度时), `生态`, `痛点`, `底座`
* **陈词滥调与假深沉**：`画卷`, `双刃剑`, `不可否认`, `毋庸置疑`, `深远影响`, `令人叹为观止`, `深入探讨`, `在当今快节奏的世界中`

---

## 🛠️ 2. 三遍消杀工作流 (The 3-Pass Editing System)

对齐 `lguz/humanize-writing-skill` 的工程化重构工序：

```text
[Pass 1: Kill AI Vocabulary]   --> 物理剔除上述黑名单中的每一个统计学标记词
             │
[Pass 2: Break AI Structures]  --> 摧毁排比三段论、假过渡句、等长节拍与首尾对称
             │
[Pass 3: Add Human Texture]    --> 注入真实感官细节、主观断言、承认窘迫与瑕疵
```

### Pass 1: 词汇清扫
- 只要出现“`深入探讨`”，立刻改成“拆解”或直接陈述要点；
- 只要出现“`不可否认`”，直接删掉，从事实开句；
- 只要出现“全面提升了效率”，必须改成具体的物理耗时数字（如“从 45 秒压至 120 毫秒”）。

### Pass 2: 结构破壁 (Breaking Structural Tells)
1. **严禁三连排比 (Strictly Forbid the Rule of Three)**：
   - 典型 AI 句式：“提供更高效、更稳定、更安全的体验。”
   - 人类解法：打破对称，只说最核心的一个属性，或用因果连词拆解。
2. **消灭假过渡句 (Kill Synthetic Transitions)**：
   - 严禁：“此外……”、“不仅如此……”、“值得注意的是……”、“总而言之……”；
   - 人类解法：直接起新段落陈述下一个事实。事实之间依靠因果和时间自然流动，不需要胶水词。
3. **破除节拍匀称 (Enforce Burstiness & Variance)**：
   - 典型 AI 病症：连续 5 句话，每句都是 18-24 字，音律像节拍器一样死板；
   - 人类解法：长短句强对冲。3 个字的短断句，紧跟 40 字交代复杂因果的长句，再跟一个疑问句或单字反问。
4. **终结首尾呼应与升华 (No Symmetrical Conclusions)**：
   - AI 习惯在末尾写一段“让我们携手迈向美好未来”的空洞大团圆总结；
   - 人类解法：说完最后一个事实或物理操作，**文章立即停下**。不留总结句。

### Pass 3: 注入人材质感 (The 9 Humanization Levers)
对齐 `harshaneel/humanize` 的学术杠杆：
1. **Sensory Anchoring (感官锚定)**：用具体物体、气味、反光、按键声音或屏幕像素锚定真实物理世界。
2. **Friction & Doubts (摩擦力与承认笨拙)**：真实人类会记录真实踩坑——“凌晨 3 点内存打爆了”、“解法其实很土”。对瑕疵的坦诚是最高级的信任。
3. **Personal Stance (鲜明主观立场)**：敢于表达偏好与排斥，拒绝“既有优点又有缺点”的中庸废话。
4. **Active Verbs (主谓宾主动动词)**：用实体作主语，严禁用“被……”、“进行了……”。

---

## 📐 3. 三大实战文体规约

### 规约 A：工程发布与更新日志 (Linear / Basecamp 风格)
- **核心形态**：冷峻、事实驱动、主谓宾完整；
- **排版铁律**：零公关废话，开门见山列变更点，列完即停；
- **范例**：见 `exemplars/text/hemingway_changelog_update.md`。

### 规约 B：深度技术随笔与商业决策 (BLUF 结论前置)
- **核心形态**：第一句话给出结论与核心量化指标，后续段落给出不对称直接事实论据；
- **结语句**：永远落在物理层面的动作（如“修改配置，重启进程”），绝不展望未来；
- **范例**：见 `exemplars/text/anti_slop_factual_narrative.md`。

### 规约 C：高精密系统架构说明
- **核心形态**：定义对象本质、明确声明不支持什么（强硬边界）、用数据表格承载参数；
- **修辞限制**：零形容词，只保留名词、动词与数值。
