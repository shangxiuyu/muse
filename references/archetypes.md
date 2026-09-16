# 视觉风格母体库 (Visual Aesthetic Archetypes System)

## 🌟 核心哲学：学其魂，变其骨，借其皮 (Soul, Bones & Skin)

任何原型设计系统或代码模板，**在物理上都只是一层“皮 (Skin)”**。  
如果 AI 只会把示例 HTML/CSS 机械地 1:1 复制，就等于买椟还珠，丢失了设计体系的灵魂。

```
┌────────────────────────────────────────────────────────────────────────┐
│                        【母体设计系统的三层透镜】                       │
├─────────┬──────────────────────────────────┬───────────────────────────┤
│ 1. 魂   │ 思想与精神内核 (Soul & Ethos)    │ 情绪载荷、隐喻契约、克制底线│
│ (Soul)  │ 它是绝对不变的，决定产品的气质温度│ （为什么选择这个母体？）   │
├─────────┼──────────────────────────────────┼───────────────────────────┤
│ 2. 骨   │ 排版拓扑发散矩阵 (Bones/Topology)│ 3~4 套截然不同的信息流骨架 │
│ (Bones) │ 它随业务形态自由突变、发散与杂交  │ （根据业务形态自由选骨）   │
├─────────┼──────────────────────────────────┼───────────────────────────┤
│ 3. 皮   │ 视觉手艺与组件代码 (Skin & Form) │ 色彩、字体、微边框、组件代码│
│ (Skin)  │ 它是一层随时可重构、可剪裁的外皮  │ （代码只作示范，绝非死锁） │
└─────────┴──────────────────────────────────┴───────────────────────────┘
```

> ⚡ **AI 消费母体库第一法则 (Soul-First Mutation Directive)**：  
> 1. **悟其魂**：理解母体背后的情绪隐喻（例如“文具手账流”的魂是消除严肃工具的心理压力；“黑曜石案头”的魂是沉浸心流与克制留白）。  
> 2. **变其骨**：坚决摒弃“每个母体只有一个模板”的思维定势！查阅该母体提供的 **【排版拓扑发散矩阵】**，根据具体产品形态（如看板型、模块流、三联屏、无界白板、仪表盘等）选择或杂交骨架。  
> 3. **借其皮**：借用母体的精确 Token、字阶节奏、物理质感与微交互，为具体的骨架披上有生命力的皮肤。

---


## 📚 已沉淀的视觉母体标准库 (10 大经典流派)

### 一、Web / 桌面端与品牌官网流派

| 母体名称 | 核心标杆 | 核心隐喻与气质 | 规范文件 |
| :--- | :--- | :--- | :--- |
| **Playful Stationery (复古文具手账流)** | `SayBriefly`, `Pitch`, `PostHog` | 暖米白纸张 + 常春藤墨绿 + 荧光便利贴黄 + 撕纸虚线 + 手绘涂鸦批注 | [playful_stationery.md](archetypes/playful_stationery.md) |
| **Enterprise Narrative (现代企业工装流)** | `Allwhere`, `Stripe`, `HashiCorp` | IBM Plex 工业严谨 + 青瓷水蓝与暖珊瑚橙 + 破框溢出数据卡片 (Escaped UI) + 荧光笔刷漆动效 | [enterprise_narrative.md](archetypes/enterprise_narrative.md) |
| **Soft Neo-Brutalism (温和新粗野美式工装流)** | `Textla`, `Gumroad` | 奶麦黄温润底 + 深常春藤墨绿骨架 + 偏置实心硬阴影 (Offset Shadow) + 软萌大圆角 + 电光黄 CTA | [soft_neobrutalism.md](archetypes/soft_neobrutalism.md) |
| **Writer's Atelier (作家案头与卡片工坊流)** | `Lex`, `Craft`, `iA Writer`, `Bear` | 暖燕麦棉纸底 + 纯白物理索引卡 + 昼夜黑曜石打字机 + 1px 出版物细栏线 + 琥珀光聚焦行 + 页边伴读批注卡 | [writer_atelier.md](archetypes/writer_atelier.md) |
| **Creator-Friendly (创客经济与高亲和流)** | `Buy Me a Coffee`, `Ko-fi` | 加那利金黄活力主调 + 暖燕麦柔底 + 超大纯白浮岛卡片 (32px) + 全胶囊控件 + 咖啡杯数量微交互 + 创作者错落星云 | [creator_friendly.md](archetypes/creator_friendly.md) |
| **Tech Flagship Dark (科技旗舰品牌官网流)** | `Checkly`, `Vercel`, `Nothing` | 午夜深海深蓝底 + 电光赛车蓝高光 + 浮空拟真交互操作舱 + 1px 晶体发光微边框 + 高反差纯白按键 | [tech_flagship_dark.md](archetypes/tech_flagship_dark.md) |
| **Neo-Bauhaus Pastel (新包豪斯几何与柔光弥散流)** | `Boords` | 新包豪斯几何积木插画 + 纯黑精密画框 (1.5px) + 黎明柔雾粉蓝弥散渐变 + 纯黑高反差压舱底栏 | [neo_bauhaus_pastel.md](archetypes/neo_bauhaus_pastel.md) |

### 二、原生移动端专属流派 (Mobile App Native)

| 母体名称 | 核心标杆 | 核心隐喻与移动端特权手势 | 规范文件 |
| :--- | :--- | :--- | :--- |
| **Native Serene Productivity (原生极简静室与呼吸清单流)** | `Things 3`, `Bear`, `Apple Notes` | 纯白棉纸静室 + Things 蓝 (`#4F97FF`) + Today 金星 (`#FFD60A`) + Magic-Plus 磁吸插入 + 弹簧圆圈勾选 + 0.5px 内嵌分组 | [native_serene_productivity.md](archetypes/native_serene_productivity.md) |
| **Tactile Pocket Device (掌上触觉仪表盘与暗黑掌机流)** | `Flighty`, `Cash App`, `Opal`, `Whoop` | OLED 纯黑底盘 + 雷达荧光绿 (`#00E676`) 呼吸晶体管 + 大触控数字键盘 + 防误触推滑确认轨道 (Swipe to Confirm) + 多段吸附底抽屉 | [tactile_pocket_device.md](archetypes/tactile_pocket_device.md) |
| **Ambient Wellness Flow (情绪呼吸与有机心流体)** | `How We Feel`, `Calm`, `Endel`, `Headspace` | 活体环境生物光画布 + 慢速漂移极光光球 (Aurora Glow) + 极软超椭圆 (Squircle 28px) + 情绪气泡触控弹性选块 + 悬浮毛玻璃胶囊底坞 | [ambient_wellness_flow.md](archetypes/ambient_wellness_flow.md) |

---

## 🎯 业务场景快速选型对照表

* **自由职业、创意笔记、打卡清单、灵感协同** 👉 优先选用 [`playful_stationery.md`](archetypes/playful_stationery.md)
* **B2B 企服、供应链物流、团队资产协同、管理后台现代重构** 👉 优先选用 [`enterprise_narrative.md`](archetypes/enterprise_narrative.md)
* **客户触达平台 (SMS/Email)、创作者支付结算、会员运营、趣味生产力工具** 👉 优先选用 [`soft_neobrutalism.md`](archetypes/soft_neobrutalism.md)
* **长文深度创作、卡片盒知识库 (PKM)、PRD/规格书重构、卷宗/研报撰写** 👉 优先选用 [`writer_atelier.md`](archetypes/writer_atelier.md)
* **个人赞助/打赏主页、粉丝会员订阅、数字小店、同事感谢墙 (Kudos)、轻量公益** 👉 优先选用 [`creator_friendly.md`](archetypes/creator_friendly.md)
* **科技品牌产品官网、智能硬件/AI设备首发、现代专业级 SaaS 主站、极客工程师品牌站** 👉 优先选用 [`tech_flagship_dark.md`](archetypes/tech_flagship_dark.md)
* **影视分镜与动画预演、多媒体协同、设计系统资产库、创意 Agency 官网、交付验收画册** 👉 优先选用 [`neo_bauhaus_pastel.md`](archetypes/neo_bauhaus_pastel.md)
* **移动端极简待办清单、个人 GTD、无干扰随手记、就医康复打卡、随行打包助手** 👉 优先选用 [`native_serene_productivity.md`](archetypes/native_serene_productivity.md)
* **航旅出行实时追踪、移动金融/闪速转账、智能硬件遥控、运维 P0 应急滑轨确认、高负荷训练体征** 👉 优先选用 [`tactile_pocket_device.md`](archetypes/tactile_pocket_device.md)
* **心理情绪觉察、冥想正念训练、助眠白噪音、慢节奏香氛美学、治愈系虚拟陪伴** 👉 优先选用 [`ambient_wellness_flow.md`](archetypes/ambient_wellness_flow.md)
