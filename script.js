// ================================
// MENÚ DE NAVEGACIÓN
// ================================

const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
    hamburger.setAttribute(
      'aria-expanded',
      nav.classList.contains('open')
    );
  });
}

document.querySelectorAll('.nav a').forEach(a => {
  a.addEventListener('click', () => {
    nav.classList.remove('open');
  });
});


// ================================
// FILTROS DE SERVICIOS
// ================================

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {

    document
      .querySelectorAll('.filter-btn')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    const filter = btn.dataset.filter;

    document.querySelectorAll('.category').forEach(cat => {
      cat.classList.toggle(
        'is-hidden',
        filter !== 'all' && cat.dataset.category !== filter
      );
    });

  });
});


// ================================
// MODAL DE SERVICIOS
// ================================

const modal = document.getElementById('modal-servicio');
const modalTitle = document.getElementById('modal-titulo');
const modalDescription = document.getElementById('modal-descripcion');
const modalWhatsApp = document.getElementById('modal-btn-wa');


// Abrir modal
window.abrirModal = function(titulo, descripcion, imagen) {

  if (!modal) return;

  // Título
  if (modalTitle) {
    modalTitle.textContent = titulo;
  }

  // Descripción
  if (modalDescription) {
    modalDescription.innerHTML = descripcion;
  }

  // WhatsApp
  if (modalWhatsApp) {
    modalWhatsApp.href =
      'https://wa.me/56941123318?text=' +
      encodeURIComponent(
        'Hola Nany, me gustaría obtener más información sobre: ' + titulo
      );
  }

  // Mostrar modal
  modal.classList.add('open');

  // Bloquear desplazamiento de la página
  document.body.style.overflow = 'hidden';
};


// Cerrar modal
window.cerrarModal = function() {

  if (!modal) return;

  modal.classList.remove('open');

  // Recuperar desplazamiento
  document.body.style.overflow = '';
};


// Cerrar al hacer clic fuera del cuadro
if (modal) {
  modal.addEventListener('click', event => {

    if (event.target === modal) {
      cerrarModal();
    }

  });
}


// Cerrar con tecla ESC
document.addEventListener('keydown', event => {

  if (
    event.key === 'Escape' &&
    modal &&
    modal.classList.contains('open')
  ) {
    cerrarModal();
  }

});


// ================================
// AÑO DEL FOOTER
// ================================

const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}
