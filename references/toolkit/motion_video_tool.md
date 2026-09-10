# 动态与视频节奏手段库 (Motion & Video Craftsmanship Tool)

> 本手段库汲取自专业电影导演视界（分镜蒙太奇、运镜语法）与工业级 UI 交互动效标准。
> 严禁生成只有口播文案的假视频脚本，严禁生成生硬卡顿或漫长炫技的 UI 动效。

---

## 🎬 1. 影视级四轨分镜脚本协议 (The 4-Track Storyboard)

当构思视频脚本、宣传片或分镜故事时，必须输出严格的**四轨工业分镜表**，严禁只输出一段口播词：

| 镜号 (Time) | 景别与运镜 (Shot & Camera) | 画面具体动作与光影 (Visual & Lighting) | 环境音与拟音 (Foley / SFX) | 台词与画外音 (VO / Dialogue) |
| :--- | :--- | :--- | :--- | :--- |
| **01** (0-3s) | 宏观远景 (Extreme WS)<br>缓慢向前推 (Slow Dolly-in) | 黎明前空旷的数据机房，服务器机柜整齐排列，冰蓝冷光在地面反光。 | 沉闷低频蜂鸣，极弱的风扇气流声。 | *(静默 2 秒，视听沉淀)*<br>“在所有人睡去的时候……” |
| **02** (3-6s) | 微观特写 (Macro CU)<br>固定机位 (Static) | 一只修长、骨节分明的手指，极轻地悬停在物理机械键盘的确认键上。 | 机械轴清脆的触底喀哒声 (Key Click)。 | “系统的命运只悬于一瞬。” |

---

## 👁️ 2. 电影导演视听对冲法则 (Audio-Visual Counterpoint)

* **拒绝“字面复读机”**：
  * ❌ 劣质表达：画外音说“他正在喝咖啡”，画面就傻傻地拍一个人端起咖啡杯。
  * ✅ 导演对冲：画外音讨论“千亿资金的暗流涌动”时，画面给到咖啡杯水面上微弱震颤的波纹（用微观意象折射宏观动荡）。
* **剪辑节奏的呼吸感**：
  * **沉淀思考镜 (3~5s)**：给环境音留足空间，允许视线停留与情绪发酵，严禁无脑快速抽帧。
  * **冲突硬切 (0.8~1.5s)**：在观点对抗或高潮时刻，使用无过渡的硬切（Hard Cut），音画精准卡点。
* **运镜禁忌**：严禁滥用廉价的无意义镜头快速晃动（Shake）与抽拉（Crash Zoom），多用稳健的推拉摇移（Dolly / Pan / Track）。

---

## 🖥️ 3. 生产级 UI 动效工程纪律 (UI Motion Discipline)

> **性能铁律**：动效只允许操作 `transform` 与 `opacity`（GPU 合成层属性）。
> 禁止对 `width` / `height` / `top` / `left` / `margin` / `box-shadow` / `filter` 做过渡动画，避免触发重排重绘。

### (1) 三档绝对时长与贝塞尔曲线
```css
:root {
  /* 权威三档时长 */
  --duration-snap: 120ms;   /* 微 Micro：点击反馈、hover、开关切换 */
  --duration-smooth: 220ms; /* 短 Short：卡片微浮起、面板折叠、tooltip 浮现 */
  --duration-deep: 420ms;   /* 长 Long：整页过渡、大模态框展开 */

  /* 物理缓动 Token (严禁使用系统默认 ease / linear) */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);  /* 默认轻盈减速，用于微交互与卡片 */
  --ease-settle: cubic-bezier(0.32, 0.72, 0, 1); /* 沉稳过冲，用于模态框与抽屉 */
  --ease-exit:   cubic-bezier(0.4, 0, 1, 1);     /* 离场加速，用于元素退出 */
}
```

### (2) 列表进场时序 (Stagger Delay)
禁止在 JS 中写定时器链，统一采用 CSS 变量与计算延时（单项递增 30ms~40ms，总量 ≤ 250ms）：
```css
.reveal-item {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity var(--duration-smooth) var(--ease-spring),
              transform var(--duration-smooth) var(--ease-spring);
  transition-delay: calc(var(--i, 0) * 35ms);
}
.reveal-item.is-in {
  opacity: 1;
  transform: none;
}
```

### (3) 无障碍强制兜底
所有动效必须显式包裹减弱动效查询，确保键盘与特殊用户的体验舒适：
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
