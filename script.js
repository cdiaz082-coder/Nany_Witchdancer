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

/* NANY-MAGIC-PORTAL-V2 */
(function(){

  const portalButton = document.getElementById('open-stickers-portal');
  const transition = document.getElementById('magic-transition');

  /* --------------------------------------------------------
     VARITA + ESTELA
  -------------------------------------------------------- */
  if(window.matchMedia && window.matchMedia('(pointer:fine)').matches){

    const cursor = document.createElement('div');
    cursor.id = 'magic-cursor';
    cursor.innerHTML = '<span class="wand">🪄</span>';
    document.body.appendChild(cursor);

    let lastX = 0;
    let lastY = 0;
    let lastTrail = 0;

    window.addEventListener('pointermove', function(event){
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';

      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      const now = performance.now();

      if(distance > 14 && now - lastTrail > 55){
        const spark = document.createElement('span');
        spark.className = 'magic-cursor-trail';
        spark.style.left = (event.clientX - 2) + 'px';
        spark.style.top = (event.clientY - 2) + 'px';
        document.body.appendChild(spark);
        setTimeout(function(){ spark.remove(); }, 850);
        lastX = event.clientX;
        lastY = event.clientY;
        lastTrail = now;
      }
    }, { passive:true });
  }

  /* --------------------------------------------------------
     SONIDO MAGICO
  -------------------------------------------------------- */
  function magicSound(){
    try{
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if(!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const master = ctx.createGain();

      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.16, now + 0.025);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
      master.connect(ctx.destination);

      const notes = [660, 880, 1174.66, 1568];

      notes.forEach(function(freq, index){
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index === 0 ? 'sine' : 'triangle';
        const start = now + index * 0.045;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + 0.8);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.08 + index * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(now + 1.05);
      });

      setTimeout(function(){ ctx.close().catch(function(){}); }, 1300);
    }catch(error){
      console.warn('No fue posible reproducir el sonido magico.', error);
    }
  }

  /* --------------------------------------------------------
     ENTRADA AL MUNDO DE STICKERS
  -------------------------------------------------------- */
  if(portalButton && transition){
    portalButton.addEventListener('click', function(){
      if(transition.classList.contains('active')) return;

      magicSound();
      transition.classList.add('active');
      transition.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      setTimeout(function(){
        window.location.href = 'stickers.html';
      }, 1450);
    });
  }

})();
/* /NANY-MAGIC-PORTAL-V2 */