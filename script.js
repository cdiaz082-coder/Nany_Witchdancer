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

// Botón de contacto (placeholder)
document.getElementById('contact-btn').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Próximamente: aquí se abrirá el formulario o el enlace de contacto de Nany.');
});