/* Modal y navegación de servicios, extraídos del comportamiento actual. */
const nav=document.getElementById('nav');
const hamburger=document.getElementById('hamburger');

if(hamburger&&nav){
  hamburger.addEventListener('click',()=>{
    nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded',nav.classList.contains('open'));
    hamburger.setAttribute('aria-label',nav.classList.contains('open')?'Cerrar menú':'Abrir menú');
  });
}
document.querySelectorAll('.nav a').forEach(link=>{
  link.addEventListener('click',()=>{if(nav)nav.classList.remove('open'); if(hamburger){hamburger.setAttribute('aria-expanded','false');hamburger.setAttribute('aria-label','Abrir menú');}});
});

const modal=document.getElementById('modal-servicio');
const modalTitle=document.getElementById('modal-titulo');
const modalDescription=document.getElementById('modal-descripcion');
const modalImage=document.getElementById('modal-imagen');
const modalWhatsApp=document.getElementById('modal-btn-wa');
let modalTrigger=null;
let previousOverflow='';
document.querySelectorAll('.card .btn-ver-mas').forEach(button=>{
  button.setAttribute('aria-label','Ver más: '+button.closest('.card').querySelector('h4').textContent);
});
document.querySelectorAll('.card').forEach(card=>card.addEventListener('click',event=>{
  modalTrigger=event.target.closest('button') || card.querySelector('button');
}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && nav && nav.classList.contains('open')){
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    hamburger.setAttribute('aria-label','Abrir menú');
    hamburger.focus();
  }
  if(event.key!=='Tab'||!modal||!modal.classList.contains('open')) return;
  const controls=Array.from(modal.querySelectorAll('button,a[href]')).filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls[controls.length-1];
  if(event.shiftKey && (document.activeElement===first || !modal.contains(document.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey && (document.activeElement===last || !modal.contains(document.activeElement))){event.preventDefault();first.focus();}
});

window.abrirModal=function(titulo,descripcion,imagen){
  if(!modal)return;
  if(modalTitle)modalTitle.textContent=titulo;
  if(modalDescription)modalDescription.textContent=descripcion;

  if(modalImage){
    modalImage.style.display='block';
    if(imagen)modalImage.src=imagen;
    else {modalImage.removeAttribute('src');modalImage.style.display='none';}
    modalImage.alt=titulo||'';
    modalImage.onerror=function(){this.style.display='none';};
  }

  if(modalWhatsApp){
    modalWhatsApp.href='https://wa.me/56941123318?text='+encodeURIComponent(
      'Hola Nany, me gustaría obtener más información sobre: '+titulo
    );
  }

  previousOverflow=document.body.style.overflow;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  modal.querySelector('.modal-content').scrollTop=0;
  modal.querySelector('.close-modal').focus();
};

window.cerrarModal=function(){
  if(!modal)return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow=previousOverflow;
  if(modalTrigger)modalTrigger.focus();
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


// Las tarjetas también pueden abrirse desde teclado.
document.querySelectorAll('.services .card').forEach(card=>{card.tabIndex=0;card.setAttribute('role','button');card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click();}});});
