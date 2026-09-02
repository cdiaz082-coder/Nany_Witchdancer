const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');

// MENÚ MÓVIL
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
    hamburger.setAttribute(
      'aria-expanded',
      nav.classList.contains('open')
    );
  });
}

// Cerrar menú al seleccionar una opción
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (nav) {
      nav.classList.remove('open');
    }
  });
});

// FILTROS DE SERVICIOS
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    const filter = button.dataset.filter;

    document.querySelectorAll('.category').forEach(category => {
      category.classList.toggle(
        'is-hidden',
        filter !== 'all' &&
        category.dataset.category !== filter
      );
    });
  });
});

// MODAL DE SERVICIOS
const modal = document.getElementById('modal-servicio');
const modalTitle = document.getElementById('modal-titulo');
const modalDescription = document.getElementById('modal-descripcion');
const modalImage = document.getElementById('modal-imagen');
const modalWhatsApp = document.getElementById('modal-btn-wa');

// ABRIR MODAL
window.abrirModal = function(titulo, descripcion, imagen) {

  if (!modal) return;

  if (modalTitle) {
    modalTitle.textContent = titulo;
  }

  if (modalDescription) {
    modalDescription.innerHTML = descripcion;
  }

  // Cargar imagen correspondiente al servicio
  if (modalImage) {

    if (imagen) {
      modalImage.src = imagen;
      modalImage.alt = titulo;
      modalImage.style.display = 'block';
    } else {
      modalImage.removeAttribute('src');
      modalImage.alt = '';
      modalImage.style.display = 'none';
    }

    // Si una imagen no carga, ocultarla sin romper el modal
    modalImage.onerror = function() {
      this.style.display = 'none';
    };
  }

  // WhatsApp personalizado según el servicio
  if (modalWhatsApp) {
    modalWhatsApp.href =
      'https://wa.me/56941123318?text=' +
      encodeURIComponent(
        'Hola Nany, me gustaría obtener más información sobre: ' +
        titulo
      );
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

// CERRAR MODAL
window.cerrarModal = function() {

  if (!modal) return;

  modal.classList.remove('open');
  document.body.style.overflow = '';
};

// Cerrar haciendo clic fuera del cuadro
if (modal) {
  modal.addEventListener('click', event => {

    if (event.target === modal) {
      cerrarModal();
    }

  });
}

// Cerrar con la tecla ESC
document.addEventListener('keydown', event => {

  if (
    event.key === 'Escape' &&
    modal &&
    modal.classList.contains('open')
  ) {
    cerrarModal();
  }

});

// AÑO AUTOMÁTICO DEL FOOTER
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}
