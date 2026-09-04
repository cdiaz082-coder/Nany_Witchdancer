/* =========================================================
   MENÚ MÓVIL
   ========================================================= */

const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');

if (hamburger && nav) {

  hamburger.addEventListener('click', () => {

    nav.classList.toggle('open');

    hamburger.setAttribute(
      'aria-expanded',
      nav.classList.contains('open')
    );

  });

}


/* Cerrar menú al seleccionar una opción */

document.querySelectorAll('.nav-list a').forEach(link => {

  link.addEventListener('click', () => {

    if (nav) {
      nav.classList.remove('open');
    }

  });

});


/* =========================================================
   MODAL DE SERVICIOS
   ========================================================= */

const modal = document.getElementById('modal-servicio');
const modalTitle = document.getElementById('modal-titulo');
const modalDescription = document.getElementById('modal-descripcion');
const modalImage = document.getElementById('modal-imagen');
const modalWhatsApp = document.getElementById('modal-btn-wa');


/* =========================================================
   ABRIR MODAL
   ========================================================= */

window.abrirModal = function(titulo, descripcion, imagen) {

  if (!modal) return;


  /* Título */

  if (modalTitle) {
    modalTitle.textContent = titulo;
  }


  /* Descripción */

  if (modalDescription) {
    modalDescription.innerHTML = descripcion;
  }


  /* Imagen */

  if (modalImage) {

    if (imagen && imagen.trim() !== '') {

      modalImage.src = imagen;
      modalImage.alt = titulo;
      modalImage.style.display = 'block';

    } else {

      modalImage.removeAttribute('src');
      modalImage.alt = '';
      modalImage.style.display = 'none';

    }

  }


  /* WhatsApp */

  if (modalWhatsApp) {

    const mensaje =
      'Hola Nany, me gustaría obtener más información sobre: ' +
      titulo;

    modalWhatsApp.href =
      'https://wa.me/56941123318?text=' +
      encodeURIComponent(mensaje);

  }


  /* Mostrar modal */

  modal.classList.add('open');

  document.body.style.overflow = 'hidden';

};


/* =========================================================
   CERRAR MODAL
   ========================================================= */

window.cerrarModal = function() {

  if (!modal) return;

  modal.classList.remove('open');

  document.body.style.overflow = '';

};


/* =========================================================
   CERRAR HACIENDO CLICK FUERA
   ========================================================= */

if (modal) {

  modal.addEventListener('click', event => {

    if (event.target === modal) {
      cerrarModal();
    }

  });

}


/* =========================================================
   CERRAR CON ESC
   ========================================================= */

document.addEventListener('keydown', event => {

  if (
    event.key === 'Escape' &&
    modal &&
    modal.classList.contains('open')
  ) {

    cerrarModal();

  }

});


/* =========================================================
   AÑO AUTOMÁTICO
   ========================================================= */

const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}
