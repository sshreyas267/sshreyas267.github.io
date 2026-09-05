/* ==========================================================================
   Shreyas Subramanian — Product Portfolio
   Vanilla JS. Responsibilities, in order:
     1. Progressive-enhancement flag + footer date
     2. Photo lightbox
     3. Scroll reveal (IntersectionObserver)
     4. Active nav state
     5. Projects: render cards from content.json + hash-routed detail view
   ========================================================================== */

(function () {
  'use strict';

  // 1. Flag JS availability (CSS uses .js to gate reveal animations) + footer date
  document.documentElement.classList.add('js');

  var now = new Date();
  var footerDate = document.getElementById('footer-date');
  if (footerDate) {
    footerDate.textContent = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear();
  }

  // 2. Photo lightbox
  var lightbox = document.getElementById('photo-lightbox');
  var photoOpen = document.getElementById('photo-open');

  function openPhoto() {
    if (!lightbox) return;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closePhoto() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  if (photoOpen) photoOpen.addEventListener('click', openPhoto);
  if (lightbox) lightbox.addEventListener('click', closePhoto);

  // 3. Scroll reveal
  var reveal = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            reveal.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    : null;

  function observeReveals(root) {
    var nodes = (root || document).querySelectorAll('.reveal:not(.is-visible)');
    nodes.forEach(function (el) {
      if (reveal) reveal.observe(el);
      else el.classList.add('is-visible');
    });
  }
  observeReveals();

  // 4. Active nav state
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var sectionIds = navLinks.map(function (a) { return a.getAttribute('href').slice(1); });
  var headerH = 64;

  function updateNav() {
    var y = window.scrollY + headerH + 40;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
    var current = sectionIds[0];

    if (atBottom) {
      current = sectionIds[sectionIds.length - 1];
    } else {
      sectionIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id;
      });
    }
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  // 5. Projects
  var CARD_COVERS = {
    browser:    { bg: '#0a0a1a', src: 'focusvault-icon.svg',  imgStyle: 'object-fit:contain;padding:28px;' },
    spotify:    { bg: '#121212', src: 'spotify-logo.png',     imgStyle: 'object-fit:contain;padding:40px;' },
    goodreads:  { bg: '#3B1F0E', src: 'goodreads-logo.svg',   imgStyle: 'object-fit:contain;padding:44px;' },
    notion:     { bg: '#191919', src: 'notion-logo.png',      imgStyle: 'object-fit:contain;padding:44px;' },
    roadstatus: { bg: '#12100f', src: 'googlemaps-logo.svg',  imgStyle: 'object-fit:contain;padding:48px;' }
  };

  var grid = document.getElementById('project-grid');
  var detail = document.getElementById('project-detail');
  var caseStudies = [];

  function renderBlock(block) {
    switch (block.type) {
      case 'p':
        return '<p>' + block.text + '</p>';
      case 'ul':
        return '<ul>' + block.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
      case 'blockquote':
        return '<blockquote>' + block.text + '</blockquote>';
      case 'table':
        return '<div class="table-wrap"><table class="detail-table">' +
          '<thead><tr>' + block.headers.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + block.rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table></div>';
      default:
        return '';
    }
  }

  function renderTags(tags) {
    return '<ul class="tags">' + tags.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
  }

  function renderCard(cs) {
    var cover = CARD_COVERS[cs.id] || { bg: '#1B1A17' };
    var img = cover.src
      ? '<img src="' + cover.src + '" alt="" style="' + (cover.imgStyle || '') + '" loading="lazy">'
      : '';
    return '' +
      '<button class="project-card reveal" type="button" data-project="' + cs.id + '">' +
        '<div class="project-cover" style="background:' + cover.bg + '">' + img + '</div>' +
        '<div class="project-body">' +
          '<h3 class="project-title"><span>' + cs.title + '</span><span class="arrow" aria-hidden="true">↗</span></h3>' +
          '<p class="project-summary">' + cs.cardSummary + '</p>' +
          renderTags(cs.tags) +
        '</div>' +
      '</button>';
  }

  function renderDetail(cs) {
    var sections = cs.sections.map(function (section) {
      return '<h4 class="case-label">' + section.heading + '</h4>' +
        section.content.map(renderBlock).join('');
    }).join('');

    var embed = cs.embedUrl
      ? '<h4 class="case-label">Full Presentation</h4>' +
        '<div class="embed-frame"><iframe src="' + cs.embedUrl + '" allowfullscreen loading="lazy" title="' + cs.title + ' presentation"></iframe></div>'
      : '';

    var links = '';
    if (cs.notionUrl) links += '<a class="text-link" href="' + cs.notionUrl + '" target="_blank" rel="noopener">View on Notion ↗</a>';
    if (cs.chromeUrl) links += '<a class="text-link" href="' + cs.chromeUrl + '" target="_blank" rel="noopener">View on Chrome Web Store ↗</a>';

    return '' +
      '<div class="detail-side">' +
        '<button class="back" type="button" data-back>← All projects</button>' +
        '<h3 class="detail-title">' + cs.title + '</h3>' +
        '<p class="detail-summary">' + cs.summary + '</p>' +
        renderTags(cs.tags) +
        (links ? '<div class="detail-links">' + links + '</div>' : '') +
      '</div>' +
      '<div class="detail-body">' + sections + embed + '</div>';
  }

  function scrollToWork() {
    var work = document.getElementById('work');
    if (!work) return;
    var top = work.getBoundingClientRect().top + window.scrollY - (headerH + 8);
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function showGrid() {
    if (!detail || !grid) return;
    detail.hidden = true;
    detail.innerHTML = '';
    grid.hidden = false;
  }

  function showProject(id) {
    var cs = caseStudies.find(function (c) { return c.id === id; });
    if (!cs || !detail || !grid) { showGrid(); return; }

    grid.hidden = true;
    detail.innerHTML = renderDetail(cs);
    detail.hidden = false;
    scrollToWork();

    var back = detail.querySelector('[data-back]');
    if (back) back.focus({ preventScroll: true });
  }

  function route() {
    var match = location.hash.match(/^#project\/([\w-]+)$/);
    if (match) {
      showProject(match[1]);
    } else if (detail && !detail.hidden) {
      showGrid();
      if (location.hash === '#work') scrollToWork();
    }
    updateNav();
  }

  if (grid) {
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('[data-project]');
      if (card) location.hash = 'project/' + card.getAttribute('data-project');
    });
  }
  if (detail) {
    detail.addEventListener('click', function (e) {
      if (e.target.closest('[data-back]')) location.hash = 'work';
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lightbox && !lightbox.hidden) { closePhoto(); return; }
    if (detail && !detail.hidden) location.hash = 'work';
  });

  window.addEventListener('hashchange', route);

  fetch('content.json?v=10')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      caseStudies = data.caseStudies || [];
      if (grid) {
        grid.innerHTML = caseStudies.map(renderCard).join('');
        observeReveals(grid);
      }
      route();
    })
    .catch(function (err) { console.error('Failed to load content.json:', err); });

})();
