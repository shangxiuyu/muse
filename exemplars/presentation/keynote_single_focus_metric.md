# 案例：乔布斯式单一焦点数据幻灯片 (Keynote / 2026)

**来源**：Apple Keynote 经典发布会版面 & Dieter Rams 极简设计准则  
**形态**：数据页 / 融资 Deck 关键里程碑 / 发布会高潮幻灯片

---

## 标杆版面排布 (Visual Layout)

```text
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                     18ms                                         │
│                                                                  │
│            Local P99 IPC Roundtrip Latency                       │
│                                                                  │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Marp 代码实现

```markdown
---
marp: true
theme: default
---

<style>
section.hero-metric {
  background: #000000;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-family: system-ui, -apple-system, sans-serif;
}

.hero-metric .number {
  font-size: 140px;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 24px;
}

.hero-metric .label {
  font-size: 24px;
  font-weight: 400;
  color: #888888;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>

<!-- _class: hero-metric -->

<div class="number">18ms</div>
<div class="label">Local P99 IPC Roundtrip Latency</div>
```

---

## 为什么好

1. **绝对克制单一焦点（Chanel's Restraint）**：
   * 全页只留一个数字，一个标签。AI 最常犯的错误是在一个数字周围放 4 个小卡片和 8 条箭头，导致视线四分五裂。
2. **纯粹的纯黑与高对比微反差**：
   * 纯黑底色（`#000000`）搭配极致白（`#ffffff`），标签使用微调灰（`#888888`），不引入任何彩色光晕。

---

## 可复用判断

* **“当数字足够震撼时，任何装饰都是对其力量的削弱”**：关键业务指标不需要任何图表修饰，大字号本身就是最高的视觉尊严。
