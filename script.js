// ── Particle background ───────────────────────────────────────────
(function () {
  const canvas = document.getElementById('bg-particles');
  const ctx = canvas.getContext('2d');
  let W, H, dots;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeDots() {
    dots = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96,165,250,0.7)';
      ctx.fill();
    });
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(147,197,253,${0.6 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  makeDots();
  draw();
  window.addEventListener('resize', () => { resize(); makeDots(); });
})();

// ── Page navigation (scrollable) ─────────────────────────────────
document.querySelectorAll('nav .links a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById('section-' + a.dataset.page);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
document.querySelector('nav .name').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Highlight active nav link based on scroll position
const sections = ['about', 'work', 'experience', 'skills', 'resume'];
function updateActiveNav() {
  const scrollY = window.scrollY + 80;
  let current = sections[0];
  sections.forEach(id => {
    const el = document.getElementById('section-' + id);
    if (el && el.offsetTop <= scrollY) current = id;
  });
  document.querySelectorAll('nav .links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === current);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// ── Footer date ──────────────────────────────────────────────────
const d = new Date();
document.getElementById('footer-date').textContent =
  d.toLocaleString('default', { month: 'long' }) + ' ' + d.getFullYear();

// ── Accordion (experience / education / awards) ──────────────────
function toggleCard(card) { card.classList.toggle('open'); }

// ── Photo lightbox ───────────────────────────────────────────────
function openPhoto() {
  document.getElementById('photo-lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePhoto() {
  document.getElementById('photo-lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Modals ───────────────────────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.modal-close').focus();
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Use event delegation so dynamically-rendered modals are covered
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePhoto();
    document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
  }
});

// ── Content rendering ─────────────────────────────────────────────
function renderBlock(block) {
  switch (block.type) {
    case 'p':
      return `<p>${block.text}</p>`;
    case 'ul':
      return `<ul>${block.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    case 'blockquote':
      return `<blockquote>${block.text}</blockquote>`;
    case 'table':
      return `<div class="modal-table-wrap"><table class="modal-table">
        <thead><tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${block.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    default:
      return '';
  }
}

const CARD_COVERS = {
  browser:    { type: 'image', src: 'focusvault-banner.png', imgStyle: 'object-fit:cover;' },
  spotify:    { type: 'color', bg: '#121212', src: 'spotify-logo.png', imgStyle: 'object-fit:contain;padding:40px;' },
  goodreads:  { type: 'color', bg: '#3B1F0E', src: 'goodreads-logo.svg', imgStyle: 'object-fit:contain;padding:44px;' },
  notion:     { type: 'color', bg: '#191919', src: 'notion-logo.png',  imgStyle: 'object-fit:contain;padding:44px;' },
};

function renderCaseCard(cs) {
  const cover = CARD_COVERS[cs.id] || { type: 'color', bg: '#1e3a8a' };
  const coverStyle = cover.bg ? `background:${cover.bg};background-size:cover;` : '';
  const imgTag = cover.src
    ? `<img src="${cover.src}" alt="${cs.title}" style="position:absolute;inset:0;width:100%;height:100%;${cover.imgStyle}">`
    : '';
  return `<button class="case-card" onclick="openModal('modal-${cs.id}')">
    <div class="case-card-cover" style="${coverStyle}">
      ${imgTag}
      <div class="case-card-cover-overlay"></div>
    </div>
    <div class="case-card-body">
      <h3>${cs.title}</h3>
      <p>${cs.cardSummary}</p>
      <div class="tags">${cs.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <span class="arrow">↗</span>
    </div>
  </button>`;
}

function renderModal(cs) {
  const body = cs.sections.map((section, i) => `
    ${i > 0 ? '<div class="modal-divider"></div>' : ''}
    <div class="modal-section">
      <h3>${section.heading}</h3>
      ${section.content.map(renderBlock).join('')}
    </div>`).join('');

  const embed = cs.embedUrl ? `
    <div class="modal-divider"></div>
    <div class="modal-section">
      <h3>Full Presentation</h3>
      <div class="modal-embed-wrap">
        <iframe src="${cs.embedUrl}" frameborder="0" allowfullscreen class="modal-embed"></iframe>
      </div>
    </div>` : '';

  return `<div class="modal-overlay" id="modal-${cs.id}" role="dialog" aria-modal="true">
    <div class="modal${cs.embedUrl ? ' modal--wide' : ''}">
      <div class="modal-header">
        <div class="modal-title">${cs.emoji} ${cs.title}</div>
        <button class="modal-close" onclick="closeModal('modal-${cs.id}')" aria-label="Close">×</button>
      </div>
      <p class="modal-summary">${cs.summary}</p>
      <div class="modal-tags">${cs.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="modal-body">${body}${embed}</div>
      <div class="modal-footer">${cs.notionUrl
        ? `<a class="modal-notion-link" href="${cs.notionUrl}" target="_blank">View on Notion ↗</a>`
        : ''}</div>
    </div>
  </div>`;
}

fetch('content.json?v=5')
  .then(r => r.json())
  .then(data => {
    document.querySelector('.case-studies').innerHTML =
      data.caseStudies.map(renderCaseCard).join('');
    document.getElementById('modals-container').innerHTML =
      data.caseStudies.map(renderModal).join('');
  })
  .catch(err => console.error('Failed to load content.json:', err));
