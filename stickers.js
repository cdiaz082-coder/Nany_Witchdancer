(() => {
  const API = '/api/stickers';
  const ROOT = 'Sticker Nany/';
  const categories = [
    { folder:'Nany Hollywood', label:'Nany Hollywood' },
    { folder:'Nany animada', label:'Nany Animada' },
    { folder:'Nany brujita feminista', label:'Nany Brujita Feminista' },
    { folder:'Nany folclore mundial', label:'Nany Folclore Mundial' },
    { folder:'Nany frases', label:'Nany Frases' },
    { folder:'Nany gamer', label:'Nany Gamer' },
    { folder:'Nany por el mundo', label:'Nany por el Mundo' },
    { folder:'Nany sentimientos', label:'Nany Sentimientos' },
    { folder:'Nany tarot', label:'Nany Tarot' },
    { folder:'Nany tiktoker', label:'Nany TikToker' }
  ];

  const cursor = document.getElementById('cursor');
  if (cursor) addEventListener('pointermove', e => { cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px'; });

  const grid = document.getElementById('category-grid');
  const catalogModal = document.getElementById('catalog-modal');
  const catalogGrid = document.getElementById('catalog-grid');
  const catalogTitle = document.getElementById('catalog-title');
  const catalogStatus = document.getElementById('catalog-status');
  const catalogCount = document.getElementById('catalog-count');

  function escapeHtml(value){return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function apiUrl(folder, mode='list'){ return `${API}?mode=${encodeURIComponent(mode)}&folder=${encodeURIComponent(ROOT + folder)}`; }

  function buildCategories(){
    grid.innerHTML = categories.map((cat,i) => `
      <article class="category-card no-data" data-folder="${escapeHtml(cat.folder)}" data-index="${i}" tabindex="0" role="button" aria-label="Abrir ${escapeHtml(cat.label)}">
        <div class="showcase"><span class="loading">Conectando colecciÃ³nâ€¦</span><img alt="${escapeHtml(cat.label)}" /></div>
        <div class="cat-copy"><strong>${escapeHtml(cat.label)}</strong><span>EXPLORAR â€º</span></div>
      </article>`).join('');

    grid.querySelectorAll('.category-card').forEach(card => {
      const open = () => openCatalog(card.dataset.folder);
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); open(); } });
    });
  }

  async function getStickers(folder){
    const response = await fetch(apiUrl(folder), { headers:{'Accept':'application/json'}, cache:'no-store' });
    if(!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    const items = Array.isArray(data) ? data : (Array.isArray(data.objects) ? data.objects : (Array.isArray(data.stickers) ? data.stickers : []));
    return items.map(item => typeof item === 'string' ? item : (item.url || item.key || item.name)).filter(Boolean);
  }

  function startShowcase(card, urls){
    const img = card.querySelector('img');
    const loading = card.querySelector('.loading');
    if(!urls.length){ card.classList.add('no-data'); loading.textContent='Sin stickers disponibles'; return; }
    card.classList.remove('no-data'); loading.remove();
    let index = 0;
    const show = () => {
      img.classList.remove('visible');
      setTimeout(() => { img.src = urls[index % urls.length]; img.onload=()=>img.classList.add('visible'); }, 280);
      index++;
    };
    show();
    setInterval(show, 3300);
  }

  async function loadShowcases(){
    const cards = [...grid.querySelectorAll('.category-card')];
    await Promise.all(cards.map(async card => {
      try { startShowcase(card, (await getStickers(card.dataset.folder)).slice(0,10)); }
      catch(e){ card.querySelector('.loading').textContent='ColecciÃ³n lista para conectar'; }
    }));
  }

  async function openCatalog(folder){
    const cat = categories.find(x=>x.folder===folder) || {label:folder};
    catalogTitle.textContent = cat.label;
    catalogStatus.textContent = 'Cargando la colecciÃ³nâ€¦';
    catalogCount.textContent = 'â€¦';
    catalogGrid.innerHTML = '<div class="catalog-item"><span>Cargandoâ€¦</span></div>';
    catalogModal.classList.add('open'); catalogModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    try{
      const urls = await getStickers(folder);
      catalogStatus.textContent = urls.length ? 'Explora la colecciÃ³n y elige un sticker para editarlo.' : 'No encontramos stickers en esta colecciÃ³n todavÃ­a.';
      catalogCount.textContent = urls.length ? `${urls.length} stickers` : '0 stickers';
      catalogGrid.innerHTML = urls.map((url,i)=>`<div class="catalog-item"><img src="${escapeHtml(url)}" alt="Sticker ${i+1}" loading="lazy"><button type="button" data-edit-url="${escapeHtml(url)}">âœ¦ EDITAR</button></div>`).join('');
      catalogGrid.querySelectorAll('[data-edit-url]').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        alert('Editor Premium: la base del editor estÃ¡ preparada. La integraciÃ³n del desbloqueo se conecta en la siguiente etapa.');
      }));
    }catch(e){
      catalogStatus.textContent = 'La colecciÃ³n estÃ¡ preparada, pero el catÃ¡logo aÃºn no estÃ¡ conectado al Worker.';
      catalogCount.textContent = 'R2';
      catalogGrid.innerHTML = '<div class="catalog-item"><span>ConexiÃ³n R2 pendiente</span></div>';
    }
  }

  function closeModals(){ document.querySelectorAll('.modal.open').forEach(m=>{m.classList.remove('open');m.setAttribute('aria-hidden','true')}); document.body.style.overflow=''; }
  document.addEventListener('click', e => { if(e.target.matches('[data-close-modal]')) closeModals(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModals(); });
  document.getElementById('open-editor-info')?.addEventListener('click', ()=>{ document.getElementById('editor-info-modal').classList.add('open'); document.getElementById('editor-info-modal').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; });

  buildCategories();
  loadShowcases();
})();

