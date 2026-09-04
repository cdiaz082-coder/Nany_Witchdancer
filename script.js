const nav=document.getElementById('nav');
const hamburger=document.getElementById('hamburger');

if(hamburger&&nav){
  hamburger.addEventListener('click',()=>{
    nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded',nav.classList.contains('open'));
  });
}
document.querySelectorAll('.nav a').forEach(link=>{
  link.addEventListener('click',()=>{if(nav)nav.classList.remove('open');});
});

const modal=document.getElementById('modal-servicio');
const modalTitle=document.getElementById('modal-titulo');
const modalDescription=document.getElementById('modal-descripcion');
const modalImage=document.getElementById('modal-imagen');
const modalWhatsApp=document.getElementById('modal-btn-wa');

window.abrirModal=function(titulo,descripcion,imagen){
  if(!modal)return;
  if(modalTitle)modalTitle.textContent=titulo;
  if(modalDescription)modalDescription.textContent=descripcion;

  if(modalImage){
    modalImage.style.display='block';
    modalImage.src=imagen||'';
    modalImage.alt=titulo||'';
    modalImage.onerror=function(){this.style.display='none';};
  }

  if(modalWhatsApp){
    modalWhatsApp.href='https://wa.me/56941123318?text='+encodeURIComponent(
      'Hola Nany, me gustaría obtener más información sobre: '+titulo
    );
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
};

window.cerrarModal=function(){
  if(!modal)return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
};

if(modal){
  modal.addEventListener('click',event=>{
    if(event.target===modal)cerrarModal();
  });
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&modal&&modal.classList.contains('open'))cerrarModal();
});

const year=document.getElementById('year');
if(year)year.textContent=new Date().getFullYear();

/* CONTENIDO EXCLUSIVO / CARRUSEL DE STICKERS */
(function () {
  const track = document.getElementById('sticker-carousel-track');
  if (!track) return;
  const slides = Array.from(track.querySelectorAll('.sticker-slide'));
  if (slides.length < 2) return;
  let index = 0;
  let timer;
  function getStep() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }
  function moveCarousel() {
    index = (index + 1) % slides.length;
    track.style.transform = `translate3d(-${index * getStep()}px,0,0)`;
  }
  function startCarousel() { clearInterval(timer); timer = setInterval(moveCarousel, 3200); }
  window.addEventListener('resize', () => { index=0; track.style.transform='translate3d(0,0,0)'; startCarousel(); });
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', e => e.preventDefault());
    img.addEventListener('dragstart', e => e.preventDefault());
  });
  startCarousel();
})();
