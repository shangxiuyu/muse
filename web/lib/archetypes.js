import { presentationStyles } from './presentation-styles.js';
import { textStyles } from './text-styles.js';

// Curated summaries of the ten entries in references/archetypes.md.
// IDs match the specification filenames; these are surface references, not layouts.
export const archetypes = [
  { id: 'playful_stationery', name: '复古文具手账', english: 'Playful Stationery', description: '米白纸张、墨绿字迹与便利贴黄', scenes: '手账 · 灵感协作 · 日常工具', colors: ['#FCFAF5', '#173300', '#FFEB5B'] },
  { id: 'enterprise_narrative', name: '现代企业工装', english: 'Enterprise Narrative', description: '青瓷水蓝、珊瑚橙与清晰工业线条', scenes: '企业服务 · 团队协作 · 品牌叙事', colors: ['#F6F8F9', '#8FC8CF', '#F27058'] },
  { id: 'soft_neobrutalism', name: '温和新粗野', english: 'Soft Neo-Brutalism', description: '奶麦黄底、墨绿骨架与偏置硬阴影', scenes: '会员运营 · 趣味生产力 · 创客产品', colors: ['#F4F6DF', '#14351A', '#FFE500'] },
  { id: 'writer_atelier', name: '作家案头', english: "Writer’s Atelier", description: '燕麦棉纸、细栏线与琥珀色聚焦', scenes: '写作 · 知识管理 · 个人博客', colors: ['#EAE6DF', '#1F1E1C', '#E08A3C'] },
  { id: 'creator_friendly', name: '创客亲和', english: 'Creator-Friendly', description: '明亮金黄、柔和燕麦与圆润控件', scenes: '创作者主页 · 打赏订阅 · 独立小店', colors: ['#EFECE6', '#FFDD00', '#E15B36'] },
  { id: 'tech_flagship_dark', name: '科技旗舰暗色', english: 'Tech Flagship Dark', description: '深海蓝底、电光蓝与晶体微光边框', scenes: 'AI 产品 · 科技硬件 · 品牌官网', colors: ['#061220', '#0075FF', '#38BDF8'] },
  { id: 'neo_bauhaus_pastel', name: '新包豪斯柔彩', english: 'Neo-Bauhaus Pastel', description: '柔雾粉蓝、几何积木与精密画框', scenes: '创意工作室 · 影视分镜 · 设计系统', colors: ['#FDFCF8', '#FBCFE8', '#BAE6FD'] },
  { id: 'neo_brutalist_engineering', name: '新粗野工程', english: 'Neo-Brutalist Engineering', description: '坐标纸、炭墨硬线与等宽技术排版', scenes: '开发者工具 · 云控制台 · 极客社区', colors: ['#F4EFEA', '#383838', '#ECE6DF'] },
  { id: 'institutional_defi_dark', name: '暗夜金融', english: 'Institutional DeFi Dark', description: '午夜蓝黑、青绿光轨与轨道细线', scenes: '金融科技 · 数据看板 · 数字资产', colors: ['#060F27', '#00F5D4', '#2BA5FF'] },
  { id: 'wireframe_architect_grid', name: '线框架构工坊', english: 'Wireframe Architect & Cyber-Pastel Grid', description: '几何线框、透视网格与电光洋红', scenes: '智能建站 · 低代码 · 协同设计', colors: ['#F8FAFC', '#FA00FF', '#00D2FF'] },
].map((item, index) => ({
  ...item,
  path: `references/archetypes/${item.id}.md`,
  preview: `./assets/archetypes/${item.id}.png`,
  example: [
    { name: 'SayBriefly', url: 'https://saybriefly.com/' },
    { name: 'allwhere', url: 'https://www.allwhere.co/' },
    { name: 'Textla', url: 'https://www.textla.com/' },
    { name: '作家案头', url: './examples/writer-atelier.html', kind: 'muse' },
    { name: 'Buy Me a Coffee', url: 'https://buymeacoffee.com/' },
    { name: 'Checkly', url: 'https://www.checklyhq.com/' },
    { name: 'Boords', url: 'https://boords.com/' },
    { name: 'MotherDuck', url: 'https://motherduck.com/' },
    { name: 'Idle Finance', url: 'https://idle.finance/' },
    { name: 'Relume', url: 'https://www.relume.ai/' },
  ][index],
}));

export const getArchetype = id => archetypes.find(item => item.id === id) || presentationStyles.find(item => item.id === id) || textStyles.find(item => item.id === id) || null;
export const getArchetypesForMedia = type => ({ ui: archetypes, ppt: presentationStyles, text: textStyles }[type] || []);

// Historical visual references remain readable, but must not become a new writing choice.
export function getActiveArchetype(id, type) {
  const reference = getArchetype(id);
  if (!reference || type === 'image') return null;
  if (type === 'text') return reference.media === 'text' ? reference : null;
  return !reference.media || reference.media === type ? reference : null;
}
