# 案例：Marp 瑞士极简排版幻灯片源码 (Presentation / 2026)

**来源**：GitHub [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit) `marp-slide` minimal template  
**形态**：Marp Markdown 可直接渲染演示文稿

---

## 标杆幻灯片完整源码 (Marp Source Code)

```markdown
---
marp: true
theme: default
paginate: true
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

section {
  background-color: #ffffff;
  color: #2c2c2c;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 300;
  line-height: 1.6;
  font-size: 26px;
  padding: 80px 100px;
}

h1 {
  font-size: 56px;
  line-height: 1.2;
  font-weight: 400;
  color: #111111;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}

h2 {
  font-size: 38px;
  line-height: 1.3;
  font-weight: 400;
  color: #111111;
  margin-bottom: 48px;
  letter-spacing: -0.01em;
}

ul {
  padding-left: 24px;
}

li {
  margin-bottom: 20px;
  color: #444444;
  line-height: 1.6;
}

.lead {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}

.lead h1 {
  font-size: 64px;
  font-weight: 500;
  margin-bottom: 16px;
}

.lead p {
  font-size: 24px;
  color: #666666;
  font-weight: 300;
  margin: 0;
}

footer {
  font-size: 13px;
  color: #aaaaaa;
  position: absolute;
  left: 100px;
  bottom: 40px;
}
</style>

<!-- _class: lead -->

# Eden Engine
本地优先的多智能体协同骨干网络。

<footer>2026 技术架构评审</footer>

---

## 为什么抛弃云端中心调度

- **网络延迟不可控**：多轮 Agent 跨洋通信平均往返超过 1.8 秒。
- **状态容易裂脑**：网络抖动时分布式锁的租约回收引发脏写。
- **隐私与代码主权**：核心业务源码离开宿主机即构成数据合规风险。

<footer>1. 架构动机</footer>

---

## 本地 SQLite 统一总线

- 所有 Agent 会话、便签与任务队列持久化在单一本地 `.db`。
- 利用 WAL 模式实现高并发读，UI 渲染零感知锁等待。
- 全量操作可被秒级导出为纯文本审计日志。

<footer>2. 存储选型</footer>
```

---

## 为什么好（反 AI 幻灯片套路拆解）

1. **左对齐与呼吸留白（Swiss International Style）**：
   * AI 永远喜欢把封面死板居中，再加几个花里胡哨的装饰图标。
   * 本案例严格左对齐（`align-items: flex-start`），保留了 60% 的纯白宣纸感留白。
2. **字重轻度微阶差（300 与 400 的对比）**：
   * 标题不加粗（`font-weight: 400`），正文轻盈（`font-weight: 300`），完全依靠 56px 与 26px 的绝对字阶比例拉开层级。
3. **严格遵守 One Slide, One Idea**：
   * 每一页只说一件事，只放 3 个事实要点，字字有落点。

---

## 可复用判断

* **“幻灯片不是提词器，是注意力的聚光灯”**：如果一页幻灯片超过 4 行文字，立刻拆成两页。
* **“白底黑字的高级感来自间距，而不是渐变和色块”**：靠 `padding: 80px 100px` 和行高建立威严。
