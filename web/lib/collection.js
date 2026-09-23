import { icon, brandMark } from './icons.js';
import { media, escapeHtml as esc } from './data.js';
import { renderMarkdown } from './markdown.js';
import { safePreview, uiHtml, slideHtml, deckStyle } from './artifacts.js';
import { textArtifactFromMessages } from './text-artifact.js';

const latest = project => project.versions.at(-1) || textArtifactFromMessages(project);
const dateLabel = timestamp => new Date(timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });

export function collectionProjects(projects) {
  const hasText = value => typeof value === 'string' && value.trim().length > 0;
  return projects.filter(project => {
    const artifact = latest(project);
    if (!artifact || artifact.demo !== false) return false;
    if (artifact.type === 'ui') return hasText(artifact.html);
    if (artifact.type === 'text') return hasText(artifact.text);
    if (artifact.type === 'image') return hasText(artifact.imageData) || hasText(artifact.svg);
    if (artifact.type === 'ppt') return artifact.slides?.some(slide => hasText(slide.html) || hasText(slide.title));
    return false;
  });
}

export function matchingProjects(state) {
  const query = state.query.trim().toLocaleLowerCase();
  return collectionProjects(state.projects).filter(project => (state.filter === 'all' || project.type === state.filter) && project.title.toLocaleLowerCase().includes(query))
    .sort((a, b) => state.collectionSort === 'title' ? a.title.localeCompare(b.title, 'zh-CN') : state.collectionSort === 'oldest' ? a.updated - b.updated : b.updated - a.updated);
}

function projectPreview(project, artifact) {
  if (artifact.type === 'text') return `<div class="collection-copy ${artifact.text.length < 180 ? 'collection-copy-short' : ''}"><span class="copy-kicker">${esc(media[project.type].label)} / MUSE STUDIO</span><div>${renderMarkdown(artifact.text.slice(0, 2400))}</div></div>`;
  return `<div class="collection-frame"><iframe data-collection-preview="${esc(project.id)}" title="${esc(project.title)}的缩略预览" sandbox="" referrerpolicy="no-referrer" loading="lazy" tabindex="-1" aria-hidden="true"></iframe></div>`;
}

function projectCard(project) {
  const artifact = latest(project);
  const status = 'AI 创作';
  const versions = project.versions.length ? `${project.versions.length} 个版本` : '对话文案';
  return `<article class="collection-card" data-media="${project.type}">
    <button class="collection-cover" data-open="${esc(project.id)}" aria-label="打开：${esc(project.title)}">
      <div class="collection-art" aria-hidden="true" inert>${projectPreview(project, artifact)}</div>
      <span class="collection-status">${status}</span>
      <span class="collection-open">打开作品 ${icon('upRight')}</span>
    </button>
    <div class="collection-card-info"><button class="collection-title" data-open="${esc(project.id)}" title="${esc(project.title)}">${esc(project.title)}</button>
      <div class="collection-card-meta"><span class="collection-medium">${icon(project.type)} ${media[project.type].label}</span><span>${versions}</span><span class="collection-list-status">${status}</span><time datetime="${new Date(project.updated).toISOString()}">${dateLabel(project.updated)}</time></div>
    </div>
    <div class="collection-card-bottom"><div class="collection-actions"><button class="icon-button" data-rename="${esc(project.id)}" aria-label="重命名：${esc(project.title)}" title="重命名">${icon('edit')}</button><button class="icon-button" data-delete="${esc(project.id)}" aria-label="删除：${esc(project.title)}" title="删除">${icon('trash')}</button></div></div>
  </article>`;
}

export function collectionResults(state) {
  const list = matchingProjects(state);
  const hasWorks = collectionProjects(state.projects).length > 0;
  if (!list.length) return `<div class="empty-state collection-empty">${brandMark()}<h2>${hasWorks ? '还没找到这件作品' : '第一件作品，从一个想法开始。'}</h2><p>${hasWorks ? '试试其他关键词，或切换创作类型。' : '完成的网页、演示、文案和图片，会收在这里。'}</p><button class="primary-button" data-action="${hasWorks ? 'clear-search' : 'new'}">${hasWorks ? '查看全部作品' : '开始第一件作品'} ${icon('right')}</button></div>`;
  return `<div class="collection-grid" data-layout="${state.collectionLayout}">${list.map(projectCard).join('')}</div>`;
}

export function collectionPage(state, footer) {
  const works = collectionProjects(state.projects);
  const counts = Object.fromEntries(Object.keys(media).map(type => [type, works.filter(project => project.type === type).length]));
  return `<main id="main" class="content collection-page">
    <header class="page-heading collection-heading"><div><div class="eyebrow">YOUR CREATIVE COLLECTION</div><h1>我的作品<span class="collection-heading-dot">.</span></h1><p>想法在这里落笔，好作品慢慢成形。</p></div><button class="primary-button collection-new" data-action="new">${icon('plus')} 新建作品</button></header>
    <div class="collection-toolbar"><div class="filters collection-filters" role="group" aria-label="筛选作品">${[['all', '全部作品', works.length], ...Object.entries(media).map(([type, item]) => [type, item.label, counts[type]])].map(([type, label, count]) => `<button class="filter ${state.filter === type ? 'active' : ''}" data-filter="${type}" aria-pressed="${state.filter === type}">${label}<span>${count}</span></button>`).join('')}</div>
      <div class="collection-utilities"><div class="collection-view-tools"><label class="collection-sort">${icon('sort')}<span class="sr-only">作品排序</span><select id="collection-sort">${[['recent', '最近编辑'], ['oldest', '最早编辑'], ['title', '作品名称']].map(([value, label]) => `<option value="${value}" ${state.collectionSort === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><div class="collection-layout" role="group" aria-label="作品视图"><button class="icon-button ${state.collectionLayout === 'grid' ? 'active' : ''}" data-collection-layout="grid" aria-label="卡片视图" aria-pressed="${state.collectionLayout === 'grid'}" title="卡片视图">${icon('grid')}</button><button class="icon-button ${state.collectionLayout === 'list' ? 'active' : ''}" data-collection-layout="list" aria-label="列表视图" aria-pressed="${state.collectionLayout === 'list'}" title="列表视图">${icon('list')}</button></div></div>
      <label class="search-box collection-search" for="project-search">${icon('search')}<span class="sr-only">搜索作品</span><input id="project-search" type="search" placeholder="搜索作品…" value="${esc(state.query)}" autocomplete="off"></label></div></div>
    <div id="project-results">${collectionResults(state)}</div>${footer}</main>`;
}

export function mountCollectionPreviews(projects) {
  document.querySelectorAll('[data-collection-preview]').forEach(frame => {
    const project = projects.find(item => item.id === frame.dataset.collectionPreview);
    const artifact = project && latest(project);
    if (!artifact) return;
    // Static, opaque previews cannot execute generated scripts or access the workspace.
    let html = '';
    if (artifact.type === 'ui') html = uiHtml({ ...artifact, js: '' });
    if (artifact.type === 'ppt' && artifact.slides?.length) {
      const first = artifact.slides[0];
      // Custom pages already own their layout. The deck wrapper would create a
      // second .slide and leak its height, padding and typography into the page.
      html = first.html || `<style>${deckStyle}</style>${slideHtml(first, 0, artifact.slides.length)}`;
      html += '<style>html,body{margin:0!important;width:100%;height:100%;overflow:hidden!important}</style>';
    }
    if (artifact.type === 'image') html = `<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}img,svg{display:block;width:100%;height:100%;object-fit:contain}</style>${artifact.imageData ? `<img alt="" src="${esc(artifact.imageData)}">` : artifact.svg || ''}`;
    const template = document.createElement('template');
    // Preserve document-level classes while parsing in an inert template.
    template.innerHTML = html.replace(/<(\/?)(html|head|body)(?=[\s>])/gi, '<$1muse-preview-$2');
    template.content.querySelectorAll('script, iframe, object, embed, meta[http-equiv="refresh" i]').forEach(element => element.remove());
    template.content.querySelectorAll('*').forEach(element => {
      for (const attribute of [...element.attributes]) {
        if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
      }
    });
    frame.srcdoc = safePreview(template.innerHTML.replace(/<(\/?)muse-preview-(html|head|body)(?=[\s>])/gi, '<$1$2'));
  });
}
