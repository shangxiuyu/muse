/**
 * MUSE Aesthetic Engine · Official Client Interactive Engine (app.js)
 * Implements:
 * 1. Global Multi-Archetype Live Theme Switcher (Tech Flagship, Bauhaus, Writer, Brutalist)
 * 2. 4-Media Aesthetic Compass
 * 3. Masterpiece Portfolio Filtering & Lightbox
 * 4. LocalStorage Preference Persistence
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initAestheticCompass();
  initGalleryFilters();
  initLightboxModal();
  initCopyActions();
  initScrollReveal();
  initCardSpotlight();
  initAnimatedCounters();
  initMobileNavigation();
  initStudioLinks();
});

/* navigator.clipboard 仅在安全上下文可用，IP 直连的 HTTP 部署会拿到 undefined。 */
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } finally { area.remove(); }
    copied ? resolve() : reject(new Error('浏览器未允许复制。'));
  });
}

/* ==========================================================================
   1. Multi-Archetype Live Theme Switcher (Full 10 Archetypes)
   ========================================================================== */
function initThemeSwitcher() {
  const savedTheme = localStorage.getItem('muse_archetype_theme') || 'tech-flagship';
  const dropdownWrap = document.getElementById('theme-dropdown-wrap');
  const menuBtn = document.getElementById('theme-menu-btn');
  const currentNameEl = document.getElementById('current-theme-name');
  const currentDotEl = document.getElementById('current-theme-dot');

  const themeMeta = {
    'tech-flagship': { 
      name: 'Tech Flagship Dark', 
      dot: '#0075FF', 
      title: '01. Tech Flagship Dark (科技旗舰品牌官网流)',
      topo: '50/50 科技控制台分屏 · 晶体拟态与脉冲激光光轨 (Precision Console)' 
    },
    'neo-bauhaus': { 
      name: 'Neo-Bauhaus Pastel', 
      dot: '#BAE6FD', 
      title: '02. Neo-Bauhaus Pastel (新包豪斯几何柔光流)',
      topo: '不对称包豪斯画廊拼图 · 象牙米纸与大圆角柔雾 (Bento 2.0 Gallery)' 
    },
    'writer-atelier': { 
      name: "Writer's Atelier", 
      dot: '#D97706', 
      title: "03. Writer's Atelier (作家案头卡片工坊流)",
      topo: '单栏古典书卷居中沉浸流 · 65ch 黄金阅读律动与伴读旁注 (Literary Sanctuary)' 
    },
    'neo-brutalist': { 
      name: 'Neo-Brutalist', 
      dot: '#FEE75C', 
      title: '04. Neo-Brutalist Engineering (新粗野工程蓝图流)',
      topo: '高密毫米工程坐标纸 · 全等宽排版与 4px 实体按压硬下陷 (Tactile Hard Plunge)' 
    },
    'institutional-defi': { 
      name: 'Institutional DeFi', 
      dot: '#00F5D4', 
      title: '05. Institutional DeFi Dark (暗夜机构金融光轨流)',
      topo: '暗夜天体同心圆轨道 · 机构级亚克力深海微光悬浮 (Liquidity Orbit)' 
    },
    'soft-neobrutalism': { 
      name: 'Soft Neo-Brutalism', 
      dot: '#14351A', 
      title: '06. Soft Neo-Brutalism (温和新粗野复古工装流)',
      topo: '美式复古工装杂货店 · 奶麦黄底与软萌实心偏置阴影 (American Vintage Workwear)' 
    },
    'creator-friendly': { 
      name: 'Creator-Friendly', 
      dot: '#FFDD00', 
      title: '07. Creator-Friendly (创客经济高亲和流)',
      topo: '32px 超大亲和浮岛与欢快胶囊 · 加那利金黄高反差 (Creator Island)' 
    },
    'playful-stationery': { 
      name: 'Playful Stationery', 
      dot: '#173300', 
      title: '08. Playful Stationery (趣味文具复古手账流)',
      topo: '错落倾斜手账便利贴大白板 · 撕纸虚线与物理图章盖印 (-1.5° Tilt & Stamps)' 
    },
    'enterprise-narrative': { 
      name: 'Enterprise Narrative', 
      dot: '#8FC8CF', 
      title: '09. Enterprise Narrative (现代企业叙事工装流)',
      topo: '现代企业工业严谨矢量叙事 · 破框 Escaped UI 与冷灰青瓷 (Enterprise Architecture)' 
    },
    'wireframe-architect': { 
      name: 'Wireframe Architect', 
      dot: '#FA00FF', 
      title: '10. Wireframe Architect (线框架构师赛博工坊流)',
      topo: '瑞士国际排印网格 · 3D 透视标尺与电光洋红雷达扫描线 (Wireframe Viewport)' 
    }
  };

  // Toggle Dropdown Menu
  if (menuBtn && dropdownWrap) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownWrap.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!dropdownWrap.contains(e.target)) {
        dropdownWrap.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Apply theme function
  function applyTheme(theme, showNotice = false) {
    const meta = themeMeta[theme] || themeMeta['tech-flagship'];
    
    // Add layout transition flash
    document.body.classList.add('theme-morphing');
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('muse_archetype_theme', theme);

    // Update Header Pill indicator
    if (currentNameEl) currentNameEl.textContent = meta.name;
    if (currentDotEl) currentDotEl.style.backgroundColor = meta.dot;

    // Update Hero Topology Badge
    const topoEl = document.getElementById('topo-mode-name');
    if (topoEl) {
      topoEl.textContent = meta.topo;
      topoEl.classList.remove('pulse-update');
      void topoEl.offsetWidth; // trigger reflow
      topoEl.classList.add('pulse-update');
    }

    // Sync button active states across entire page (dropdown, matrix cards, dock)
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      if (btn.getAttribute('data-set-theme') === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Close dropdown on selection
    if (dropdownWrap) {
      dropdownWrap.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }

    setTimeout(() => {
      document.body.classList.remove('theme-morphing');
    }, 350);

    if (showNotice && window.showToast) {
      window.showToast(`已切换母体风格：${meta.title}`);
    }
  }

  // Bind click on all theme-setting elements (dropdown items, matrix buttons, etc.)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-set-theme]');
    if (btn) {
      e.preventDefault();
      const targetTheme = btn.getAttribute('data-set-theme');
      applyTheme(targetTheme, true);
    }
  });

  // Initial load
  applyTheme(savedTheme, false);
}

/* ==========================================================================
   2. The Aesthetic Compass (4-Media Switcher: UI / Text / Deck / Photo)
   ========================================================================== */
function initAestheticCompass() {
  const tabs = document.querySelectorAll('.compass-tab');
  const panes = document.querySelectorAll('.media-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const media = tab.getAttribute('data-media');

      // Update tab active state
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Switch active pane
      panes.forEach(pane => {
        pane.classList.remove('active');
      });
      const activePane = document.getElementById(`pane-${media}`);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. Masterpiece Gallery Filtering
   ========================================================================== */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      workCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            if (btn.getAttribute('data-filter') !== 'all' && card.getAttribute('data-category') !== filterValue) {
              card.style.display = 'none';
            }
          }, 180);
        }
      });
    });
  });
}

/* ==========================================================================
   4. Immersive Lightbox Modal
   ========================================================================== */
function initLightboxModal() {
  const lightbox = document.getElementById('lightbox');
  const backdrop = document.getElementById('lightbox-backdrop');
  const closeBtn = document.getElementById('lightbox-close');
  const modalImg = document.getElementById('lightbox-img');
  const modalTitle = document.getElementById('modal-title');
  const modalArchetype = document.getElementById('modal-archetype');
  const modalType = document.getElementById('modal-type');
  const modalDna = document.getElementById('modal-dna');
  const modalFileInfo = document.getElementById('modal-file-info');
  const zoomToggle = document.getElementById('lightbox-zoom-toggle');
  const imagePane = document.querySelector('.lightbox-image-pane');

  const workCards = document.querySelectorAll('.work-card');

  workCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img');
      const title = card.getAttribute('data-title');
      const archetype = card.getAttribute('data-archetype');
      const dna = card.getAttribute('data-dna');
      const typeText = card.querySelector('.badge-type')?.textContent || 'UI 媒介';

      modalImg.src = imgSrc;
      modalImg.alt = title;
      modalTitle.textContent = title;
      modalArchetype.textContent = archetype;
      modalType.textContent = typeText;
      modalDna.textContent = dna;
      modalFileInfo.textContent = `Asset: ${imgSrc} · 本地真机渲染作品`;

      imagePane.classList.remove('zoom-100');

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeModal();
    }
  });

  zoomToggle.addEventListener('click', () => {
    imagePane.classList.toggle('zoom-100');
  });
}

/* ==========================================================================
   5. CLI Quick Command Copy & Feedback
   ========================================================================== */
function initCopyActions() {
  const installCmd = 'git clone https://github.com/shangxiuyu/muse.git .agents/skills/muse';
  const copyButtons = [
    document.getElementById('nav-copy-btn'),
    document.getElementById('hero-copy-pill'),
    document.getElementById('bottom-copy-btn')
  ].filter(Boolean);

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  window.showToast = function(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  };

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await copyToClipboard(installCmd);
        window.showToast(`已复制命令：${installCmd}`);
        const textSpan = btn.querySelector('.btn-text');
        if (textSpan) {
          const origText = textSpan.textContent;
          textSpan.textContent = '已复制 ✓';
          btn.classList.add('copied');
          setTimeout(() => {
            textSpan.textContent = origText;
            btn.classList.remove('copied');
          }, 1600);
        }
      } catch (err) {
        window.showToast(`请手动复制：${installCmd}`);
      }
    });
  });
}

/* ==========================================================================
   6. Modern Cinematic Scroll Reveal Engine (滚动渐入与错落揭示)
   ========================================================================== */
function initScrollReveal() {
  // Select all candidate section elements for scroll reveals
  const revealSelectors = [
    '.section-header',
    '.engine-card',
    '.workbench-item',
    '.work-card',
    '.anti-slop-card',
    '.archetypes-marquee-section',
    '.archetypes-matrix-section',
    '.bottom-cta-section'
  ];

  const elements = document.querySelectorAll(revealSelectors.join(', '));
  if (!elements.length) return;

  // Assign stagger delay per section groups
  const sectionContainers = document.querySelectorAll('section, .bento-workbenches, .works-grid, .engines-grid');
  sectionContainers.forEach(container => {
    const children = container.querySelectorAll('.engine-card, .workbench-item, .work-card, .anti-slop-card');
    children.forEach((child, index) => {
      // 0.08s stagger step
      child.style.transitionDelay = `${(index % 4) * 0.09}s`;
    });
  });

  // Setup IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Once revealed, unobserve to free resources
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(el => {
    el.classList.add('reveal-on-scroll');
    revealObserver.observe(el);
  });
}

/* ==========================================================================
   7. Interactive Card Spotlight (Linear / Vercel 级光标追随微光)
   ========================================================================== */
function initCardSpotlight() {
  const spotlightCards = document.querySelectorAll(
    '.engine-card, .workbench-item, .work-card, .compass-card, .marquee-item-card, .anti-slop-card, .matrix-archetype-card'
  );

  spotlightCards.forEach(card => {
    card.classList.add('spotlight-card');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      // Smoothly hide spotlight
      card.style.setProperty('--spotlight-opacity', '0');
    });

    card.addEventListener('mouseenter', () => {
      card.style.setProperty('--spotlight-opacity', '1');
    });
  });
}

/* ==========================================================================
   8. Dynamic Counter Animation (数值滚动跳动)
   ========================================================================== */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.escaped-metric .metric-val');
  if (!counterElements.length) return;

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();
        // Check for format like "+340%"
        const match = text.match(/([+-\s]*)(\d+)(.*)/);
        if (match) {
          const prefix = match[1] || '';
          const targetNum = parseInt(match[2], 10);
          const suffix = match[3] || '';
          
          let current = 0;
          const duration = 1200; // 1.2s
          const startTime = performance.now();

          function updateCounter(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * targetNum);
            el.textContent = `${prefix}${currentVal}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = `${prefix}${targetNum}${suffix}`;
            }
          }

          requestAnimationFrame(updateCounter);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => counterObserver.observe(el));
}

/* ==========================================================================
   9. Mobile Navigation Drawer & Smooth Scrolling Engine
   ========================================================================== */
function initMobileNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const closeBtn = document.getElementById('mobile-nav-close');
  const navLinks = document.querySelectorAll('.mobile-nav-link');
  const drawerCopyBtn = document.getElementById('drawer-copy-btn');

  if (!menuBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-nav-open');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-nav-open');
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Smooth scroll and close drawer on mobile link click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          closeDrawer();
          setTimeout(() => {
            const headerHeight = document.getElementById('header')?.offsetHeight || 56;
            const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
            window.scrollTo({
              top: targetPos,
              behavior: 'smooth'
            });
          }, 240);
        }
      }
    });
  });

  // Drawer Copy Button
  if (drawerCopyBtn) {
    drawerCopyBtn.addEventListener('click', () => {
      const cmd = 'agy install-skill muse';
      copyToClipboard(cmd).then(() => {
        if (window.showToast) {
          window.showToast('已复制安装指令：' + cmd);
        }
        closeDrawer();
      }).catch(() => {
        if (window.showToast) {
          window.showToast('指令复制失败，请手动选择复制');
        }
      });
    });
  }
}


/* ==========================================================================
   Studio Integration (官网与工作台动态适配)
   ========================================================================== */
function initStudioLinks() {
  const navBtn = document.getElementById("nav-studio-btn");
  if (navBtn) navBtn.href = "/studio";
  
  const heroBtn = document.getElementById("hero-studio-cta");
  if (heroBtn) heroBtn.href = "/studio";
}
