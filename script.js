const nav=document.getElementById('nav');
const hamburger=document.getElementById('hamburger');
hamburger?.addEventListener('click',()=>{nav.classList.toggle('open'); hamburger.setAttribute('aria-expanded',nav.classList.contains('open'));});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const filter=btn.dataset.filter;
  document.querySelectorAll('.category').forEach(cat=>{
    cat.classList.toggle('is-hidden',filter!=='all' && cat.dataset.category!==filter);
  });
}));

const modal=document.getElementById('modal-servicio');
const modalTitle=document.getElementById('modal-titulo');
const modalDescription=document.getElementById('modal-descripcion');
const modalImage=document.getElementById('modal-imagen');
const modalWhatsApp=document.getElementById('modal-btn-wa');

window.abrirModal=function(titulo,descripcion,imagen){
  modalTitle.textContent=titulo;
  modalDescription.innerHTML=descripcion;

  if (imagen && imagen.trim() !== '') {
    modalImage.src = imagen;
    modalImage.alt = titulo;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }

  modalImage.onerror = () => {
    modalImage.style.display = 'none';
  };

  modalWhatsApp.href='https://wa.me/56941123318?text='+encodeURIComponent('Hola Nany, me gustaría obtener más información sobre: '+titulo);
  modal.classList.add('open');
  document.body.style.overflow='hidden';
};

window.cerrarModal=function(){
  modal.classList.remove('open');
  document.body.style.overflow='';
};

modal?.addEventListener('click',e=>{if(e.target===modal) cerrarModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open')) cerrarModal();});
document.getElementById('year').textContent=new Date().getFullYear();
