# 案例：Stripe 风格现代空气感数据卡 (UI / 2026)

**来源**：Stripe Dashboard & GitHub [Laith0003/ux-skill](https://github.com/Laith0003/ux-skill)  
**形态**：高清晰纯白天候数据组件 (Light Theme)

---

## 标杆组件源码 (The Exemplar Code)

```html
<div class="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 hover:border-slate-300 transition-colors duration-150">
  
  <div class="flex items-center justify-between pb-4 border-b border-slate-100">
    <div>
      <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">Net Revenue</span>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-2xl font-semibold text-slate-900 font-sans tracking-tight tabular-nums">$148,290.00</span>
        <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+12.4%</span>
      </div>
    </div>
    
    <button 
      type="button" 
      class="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all duration-120"
    >
      Download CSV
    </button>
  </div>

  <div class="pt-4 flex items-center justify-between text-xs text-slate-500">
    <span>Settled directly to SVB •••• 4092</span>
    <span class="text-slate-400 font-mono">Updated 4m ago</span>
  </div>
</div>
```

---

## 为什么好

1. **绝对没有死黑阴影与大模糊**：
   * 采用极其通透轻巧的微阴影 `shadow-[0_1px_3px_rgba(0,0,0,0.04)]`，透明度只有 4%，干净如同纸张。
2. **微阶差的字体颜色标尺**：
   * `slate-900`（大数值）➔ `slate-600`（按钮）➔ `slate-500`（辅助文字）➔ `slate-400`（元数据标签），层次分明。
3. **8 态与微边框边界**：
   * 浅灰色细微描边 `border-slate-200/80`，交互按钮配齐 `:focus-visible` 焦点环。

---

## 可复用判断

* **“浅色模式的高级感来自灰阶的纯净度”**：不使用带蓝紫杂色的灰，选用温和冷冽的 Slate 色系，搭配 1px 细线划分空间。
