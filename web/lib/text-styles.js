// Original writing samples. These references guide voice and structure, not facts.
export const textStyles = [
  {
    id: 'text_clear', name: '清晰说明', description: '把事情讲明白，让读者知道下一步',
    scenes: '产品介绍 · 使用指南 · 功能公告', rhythm: '结论 → 解释 → 下一步',
    sample: '读完一本书，想法可以留在同一个地方。\n\n新建一条读书笔记，写下书名和你想记住的那句话。以后想找时，搜书名就能回到这页。',
  },
  {
    id: 'text_companion', name: '温和同行', description: '像认真聊天，有体谅，也有具体建议',
    scenes: '个人分享 · 社群沟通 · 陪伴内容', rhythm: '处境 → 理解 → 小建议',
    sample: '读完书却说不出感想，也没关系。\n\n先留下让你停了一下的那句话，写写当时想到了谁。读书笔记可以从这里开始，不必急着写成一篇文章。',
  },
  {
    id: 'text_editorial', name: '鲜明观点', description: '亮出判断，用细节和理由支撑',
    scenes: '观点文章 · 行业评论 · 深度专栏', rhythm: '判断 → 依据 → 边界',
    sample: '读书笔记如果只剩摘抄，很难看见你自己的想法。\n\n试着在引文后补一句：我为什么赞同，或者哪里不信？哪怕只写两行，也给下次重读留下了一个可以继续追问的地方。',
  },
  {
    id: 'text_story', name: '故事叙述', description: '从一个具体瞬间展开，在画面中收束',
    scenes: '品牌故事 · 人物片段 · 生活随笔', rhythm: '场景 → 变化 → 余韵',
    sample: '合上书时，窗外的雨还没停。她把快凉的茶挪开，在笔记里敲下一句：“这段话让我想起外婆。”\n\n光标闪了一会儿。原本只想记个页码，最后写满了半页。',
  },
  {
    id: 'text_social', name: '轻快分享', description: '自然口语，短段落，分享一个小发现',
    scenes: '社交动态 · 小红书 · 生活推荐', rhythm: '发现 → 细节 → 轻互动',
    sample: '给读书笔记减了个负：每次只记一句话，再加一句自己的想法。\n\n不用补摘要，也不用追求整齐。翻回去看，那些随手写的两行，倒是最容易让我想起当时在想什么。你会怎么记？',
  },
  {
    id: 'text_product', name: '产品推介', description: '说清使用收益，给出一个行动入口',
    scenes: '产品发布 · 落地页 · 活动推广', rhythm: '需求 → 解法 → 行动',
    sample: '想找回书里的那句话，不用再翻几百页。\n\n把摘录和自己的想法存在一起，下次按书名搜索，就能接着往下写。\n\n现在，记下你的第一条读书笔记。',
  },
  {
    id: 'text_minimal', name: '极简短句', description: '只留一个意思，短而有记忆点',
    scenes: '海报标题 · 品牌短句 · 推送文案', rhythm: '一个重点 → 一句落点',
    sample: '书合上了，想法留下来。\n\n记下此刻想记住的那一句。',
  },
  {
    id: 'text_briefing', name: '专业汇报', description: '结论在前，交代依据、风险和动作',
    scenes: '工作汇报 · 项目周报 · 决策备忘', rhythm: '结论 → 依据与风险 → 动作',
    sample: '建议先完成读书笔记的记录与搜索，再扩展分享功能。\n\n这次先解决两个问题：想法能否及时记下，已有笔记能否找回。分享需求仍待验证，下一轮访谈再确认使用场景。',
  },
].map(item => ({ ...item, media: 'text', path: `references/text_styles/${item.id}.md` }));
