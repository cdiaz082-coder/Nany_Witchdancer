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
(function(){
  const track=document.getElementById('sticker-carousel-track');
  if(!track) return;
  const original=Array.from(track.children);
  if(original.length<2) return;

  const firstGroup=document.createElement('div');
  const secondGroup=document.createElement('div');
  firstGroup.className='sticker-group';
  secondGroup.className='sticker-group';

  original.forEach(slide=>firstGroup.appendChild(slide));
  original.forEach(slide=>secondGroup.appendChild(slide.cloneNode(true)));
  track.appendChild(firstGroup);
  track.appendChild(secondGroup);

  track.querySelectorAll('img').forEach(img=>{
    img.addEventListener('contextmenu',e=>e.preventDefault());
    img.addEventListener('dragstart',e=>e.preventDefault());
  });
})();
