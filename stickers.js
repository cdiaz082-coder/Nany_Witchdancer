(function(){
  const hero=document.querySelector('.sticker-hero');
  const character=document.getElementById('parallax-character');
  if(hero&&character&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    hero.addEventListener('pointermove',function(e){
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      character.style.transform=`translate3d(${x*12}px,${y*7}px,0)`;
    });
    hero.addEventListener('pointerleave',function(){character.style.transform='translate3d(0,0,0)';});
  }
  document.querySelectorAll('.category-pill').forEach(btn=>btn.addEventListener('click',function(){
    document.querySelectorAll('.category-pill').forEach(b=>b.classList.remove('active'));
    this.classList.add('active');
  }));
})();