// ── Page navigation ──────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page-section').forEach(s => {
    s.classList.remove('active', 'page-section-fade');
  });
  const target = document.getElementById('section-' + name);
  if (target) target.classList.add('active', 'page-section-fade');
  document.querySelectorAll('nav .links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });
}

document.querySelectorAll('nav .links a').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); showPage(a.dataset.page); });
});
document.querySelector('nav .name').addEventListener('click', () => showPage('about'));
showPage('about');

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

function renderCaseCard(cs) {
  return `<button class="case-card" onclick="openModal('modal-${cs.id}')">
    <h3>${cs.title}</h3>
    <p>${cs.cardSummary}</p>
    <div class="tags">${cs.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <span class="arrow">↗</span>
  </button>`;
}

function renderModal(cs) {
  const body = cs.sections.map((section, i) => `
    ${i > 0 ? '<div class="modal-divider"></div>' : ''}
    <div class="modal-section">
      <h3>${section.heading}</h3>
      ${section.content.map(renderBlock).join('')}
    </div>`).join('');

  return `<div class="modal-overlay" id="modal-${cs.id}" role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${cs.emoji} ${cs.title}</div>
        <button class="modal-close" onclick="closeModal('modal-${cs.id}')" aria-label="Close">×</button>
      </div>
      <p class="modal-summary">${cs.summary}</p>
      <div class="modal-tags">${cs.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer">${cs.notionUrl
        ? `<a class="modal-notion-link" href="${cs.notionUrl}" target="_blank">View on Notion ↗</a>`
        : ''}</div>
    </div>
  </div>`;
}

fetch('content.json?v=1')
  .then(r => r.json())
  .then(data => {
    document.querySelector('.case-studies').innerHTML =
      data.caseStudies.map(renderCaseCard).join('');
    document.getElementById('modals-container').innerHTML =
      data.caseStudies.map(renderModal).join('');
  })
  .catch(err => console.error('Failed to load content.json:', err));
