function showPage(name) {
  document.querySelectorAll('.page-section').forEach(s => {
    s.classList.remove('active', 'page-section-fade');
  });
  const target = document.getElementById('section-' + name);
  if (target) {
    target.classList.add('active', 'page-section-fade');
  }
  document.querySelectorAll('nav .links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });
}

document.querySelectorAll('nav .links a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    showPage(a.dataset.page);
  });
});

document.querySelector('nav .name').addEventListener('click', () => showPage('about'));

showPage('about');

function openModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.modal-close').focus();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(overlay => {
      closeModal(overlay.id);
    });
  }
});
