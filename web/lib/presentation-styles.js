// Presentation-only starting points from Muse's existing surface-school library.
// The server reads the selected section from that source; layouts follow content.
export const presentationStyles = [
  { id: 'ppt_swiss_navy', name: '商务咨询', english: 'Executive Swiss Navy', section: '🏛️ 流派二：Executive Swiss Navy (麦肯锡商业咨询深蓝流)', description: '冷白与深海蓝，结论先行、证据清晰', scenes: '战略汇报 · 商业计划 · 董事会提案', colors: ['#FFFFFF', '#0A2540', '#0284C7'] },
  { id: 'ppt_editorial_linen', name: '燕麦刊物', english: 'Editorial Sand & Linen', section: '📜 流派三：Editorial Sand & Linen (燕麦画廊高奢刊物流)', description: '暖沙棉纸、宋体标题与从容留白', scenes: '品牌提案 · 设计作品 · 艺术策展', colors: ['#F5F2EB', '#1C1917', '#78716C'] },
  { id: 'ppt_tech_flagship', name: '科技发布', english: 'Tech Flagship & Precision Studio', section: '🌌 流派四：Tech Flagship & Precision Studio (科技工业旗舰产品发布流)', description: '深岩灰与电光青，让产品成为主角', scenes: '产品发布 · 技术演示 · 开发者大会', colors: ['#07080B', '#00F0FF', '#38BDF8'] },
  { id: 'ppt_workstream', name: '职场研报', english: 'Executive Workstream & Precision Swiss', section: '📊 流派五：Executive Workstream & Precision Swiss (现代精密工装职场研报流)', description: '铝白底色、精密网格与清楚的数据关系', scenes: '季度复盘 · 述职答辩 · 项目总结', colors: ['#F8FAFC', '#2563EB', '#10B981'] },
  { id: 'ppt_memphis', name: '积木波普', english: 'Neo-Memphis Toy Blocks', section: '🟡 流派一：Neo-Memphis Toy Blocks (乐高积木与波普多巴胺流)', description: '明黄撞色、硬描边与错落积木', scenes: '创意路演 · 教育分享 · 团队脑暴', colors: ['#FEF08A', '#38BDF8', '#F472B6'] },
].map(item => ({ ...item, media: 'ppt', path: 'references/toolkit/presentation/archetypes.md', preview: `./assets/presentation-styles/${item.id}.png` }));
