// Año actual en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Menú hamburguesa
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  nav.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-list a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
  });
});

// FUNCIÓN PARA ABRIR EL MODAL CON LA DESCRIPCIÓN COMPLETA
function abrirModal(titulo, descripcion, imagen) {
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-descripcion').innerHTML = descripcion;
  
  // Asignar el mensaje dinámico a WhatsApp
  const textoWA = encodeURIComponent(`Hola Nany, me gustaría consultar por el servicio: ${titulo}`);
  document.getElementById('modal-btn-wa').href = `https://wa.me/56941123318?text=${textoWA}`;
  
  document.getElementById('modal-servicio').style.display = 'flex';
}

// FUNCIÓN PARA CERRAR EL MODAL
function cerrarModal() {
  document.getElementById('modal-servicio').style.display = 'none';
}

// CERRAR SI SE HACE CLIC FUERA DEL CUADRO
window.onclick = function(event) {
  const modal = document.getElementById('modal-servicio');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
