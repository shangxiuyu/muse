# UI 高级交互与组件范式示范 (Advanced Paradigms & Arsenal)

> **定位**：本文件是基于 `ui_grammar.md`（美学公理）、`ui_interaction_flow.md`（视线心流）与 `ui_innovation.md`（创新算子）的高级交互范式示范库。
> **原则**：以下组件与交互代码仅作为公理落地的**实现示范（Reference Implementation）**。AI 在生成具体界面时，必须根据当前业务情境动态演算，严禁无脑机械抄袭。

---

## 1. 结构与容器范式 (Container & Grid Paradigms)

### 1.1 Bento 2.0 异步信息网格 (Bento Grid)
* **适用情境**：多维度数据概览、产品功能矩阵展示、灵感卡片盒。
* **公理支撑**：严格遵循 45:55 呼吸比、单光源漫反射阴影、Liquid Glass 折射与 3 层视觉深度。
```html
<!-- Bento 2.0 黄金结构范式 -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-6">
  <!-- 大卡片：跨 2 列，焦点指标 -->
  <div class="md:col-span-2 rounded-2xl p-6 bg-[#12151B] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-200 hover:border-white/[0.15]">
    <div class="flex items-center justify-between mb-4">
      <span class="text-xs uppercase tracking-wider text-slate-400 font-mono">Core Indicator</span>
      <span class="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">✦ Live</span>
    </div>
    <h3 class="text-xl font-medium text-slate-100 mb-2 font-sans">沉浸式思维星图</h3>
    <p class="text-sm text-slate-400 leading-relaxed max-w-[65ch]">动态力导向布局，实时演算节点关联与灵感涌现。</p>
  </div>
  <!-- 小卡片：跨 1 列，快捷统计 -->
  <div class="rounded-2xl p-6 bg-[#12151B] border border-white/[0.08] flex flex-col justify-between">
    <span class="text-xs uppercase tracking-wider text-slate-400 font-mono">Weekly Flow</span>
    <div class="text-3xl font-semibold text-slate-100 my-4 font-mono">2,840 <span class="text-xs font-normal text-slate-400">words</span></div>
    <div class="text-xs text-emerald-400 flex items-center gap-1 font-mono">↑ 18.4% 较上周提升</div>
  </div>
</div>
```

### 1.2 无曲率断裂 Callout 徽章 (The Anti-Broken-Strip Callout)
* **适用情境**：系统提示、AI 灵感涌现、重要提醒。
* **公理支撑**：一票否决单侧粗色条（`border-left: 3px`），使用 1px 全包围微透细线 + 排版晶体标。
```html
<div class="rounded-xl p-4 bg-amber-500/[0.04] border border-amber-500/20 flex items-start gap-3">
  <span class="text-amber-500 text-sm mt-0.5 select-none">✦</span>
  <div class="text-sm text-slate-300 leading-relaxed">
    <strong class="text-amber-400 font-medium">Muse 灵感关联：</strong>
    当前节点与《审美推理方法》中的“关系美学”存在强拓扑同构，建议建立双向引用。
  </div>
</div>
```

### 1.3 Bento 2.0 五大活体卡片原型 (Living Card Archetypes)
卡片不是静态容器，而是有生命周期的活体。按任务取用其一，不必全上：
1. *The Intelligent List*：基于 `layoutId` 的任务自排序列表，模拟 AI 实时重排；
2. *The Command Input*：多步打字机 Prompts 轮播，带呼吸光标与 Shimmer 流光；
3. *The Live Status*：呼吸微光指示点 + 带 Overshoot 的微通知浮层；
4. *The Wide Data Stream*：无缝滚动的指标走马灯（`x: ["0%", "-100%"]`）；
5. *The Contextual Focus*：文档阅读交替平滑高亮 + Float-in 浮动微工具栏。

> **取用纪律**：一屏内最多一种活体原型，其余卡片保持安静。活体是焦点，不是背景；五种同时上台等于没有活体。

### 1.4 组件完整 7 态契约 (The 7-State Contract)
每个核心组件必须交代清楚七态，缺一态即为未完成：
`Default` ➔ `Hover` ➔ `Active`（`scale(0.98)` / `-translate-y-[1px]`）➔ `Focus-visible`（高反差外环，严禁 `outline: none`）➔ `Loading`（骨架屏，严禁通用的旋转小菊花）➔ `Disabled`（`opacity: 0.45`）➔ `Empty / Error`（空状态即行动邀请，错误即自愈指引）。

---

## 2. 动效与触感物理规范 (Sensory & Physics)

> **编排纪律（The Single Orchestrated Moment）**：全页只聚焦**一个**编排视觉焦点；常规微动效 `<200ms`，不做无意义的长入场；无条件支持 `@media (prefers-reduced-motion: reduce)` 的静态降级，降级后信息层级必须依然完整。

### 2.1 Framer Motion 弹簧物理标准配置
```javascript
// 黄金 Spring 弹簧物理参数 (无线性加速、平滑刹车回弹)
export const springTransition = {
  type: "spring",
  stiffness: 100, // 刚度
  damping: 20,    // 阻尼：消除廉价震荡，赋予稳重手感
  mass: 1
};

// 交互微反馈弹簧 (微悬浮/微按压)
export const microSpring = { 
  type: "spring", 
  stiffness: 400, 
  damping: 30 
};
```

### 2.2 磁力微悬停与光标跟随 (Magnetic Hover - Zero State Re-render)
```javascript
import { motion, useMotionValue, useTransform } from "framer-motion";

export function MagneticButton({ children, onClick }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // 磁力吸附距离限制在 6px 以内
    x.set((event.clientX - centerX) * 0.15);
    y.set((event.clientY - centerY) * 0.15);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileTap={{ scale: 0.98, y: 1 }}
      onClick={onClick}
      className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-medium hover:bg-amber-500/20"
    >
      {children}
    </motion.button>
  );
}
```

### 2.3 瀑布流级联入场编排 (Staggered Cascade Orchestration)
```javascript
// 容器 Stagger Variants
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // 级联延迟 80ms
      delayChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  }
};
```

### 2.4 字符解码转场 (Text Scramble Decoder)
* **适用情境**：标题切换、加载完成的第一帧、口令校验成功。**克制使用**：一页最多一次。
```javascript
// 精密字符瞬时解码：逐位锁定，其余位随机刷新
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
export function scrambleTo(el, target, steps = 12) {
  let frame = 0;
  const timer = setInterval(() => {
    const locked = Math.floor((frame / steps) * target.length);
    el.textContent = target
      .split("")
      .map((ch, i) => (i < locked ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
      .join("");
    if (++frame > steps) {
      clearInterval(timer);
      el.textContent = target;
    }
  }, 28);
  return () => clearInterval(timer);
}
```

### 2.5 形变胶囊 (Morphing Pill / Dynamic Island)
* **适用情境**：状态通知、工具条在紧凑态与展开态之间切换（对应 `ui_innovation.md` 的算子 M2）。
* **公理支撑**：一个元素在两种形态间用 `layoutId` 平滑形变，而非两个组件互相替换——形态连续，视线才不中断。
```jsx
// 同一 layoutId 驱动形态变化；弹簧参数复用 2.1 的 springTransition
<motion.div layoutId="status-pill" transition={springTransition} className="rounded-full px-4 py-2">
  {expanded ? <FullStatusBlock /> : <CompactStatusDot />}
</motion.div>
```

### 2.6 Web Audio 触感微音律合成器 (Tactile Audio Engine)
```javascript
class TactileAudio {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  playTick(freq = 900, duration = 0.035, vol = 0.015) {
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // 优雅静音降级
    }
  }
}
```
