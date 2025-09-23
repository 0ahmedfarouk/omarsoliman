
const container = document.getElementById('cardsContainer');
const search = document.getElementById('search');
const chapterFilter = document.getElementById('chapterFilter');
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const closeLightbox = document.getElementById('closeLightbox');

const data = window.SITE_DATA;

function initFilters(){
  // Fill chapter options
  data.chapters.forEach((ch, idx)=>{
    const op = document.createElement('option');
    op.value = idx;
    op.textContent = ch.title;
    chapterFilter.appendChild(op);
  });
}

function render(){
  container.innerHTML='';
  const q = (search.value||'').trim().toLowerCase();
  const chapterIdx = chapterFilter.value;
  let chapters = data.chapters;
  if(chapterIdx !== 'all'){
    chapters = [data.chapters[parseInt(chapterIdx)]];
  }
  chapters.forEach((ch,ci)=>{
    ch.lessons.forEach((ls,li)=>{
      const title = `${ch.title} - ${ls.title}`;
      const match = !q || title.toLowerCase().includes(q);
      if(!match) return;
      const card = document.createElement('article');
      card.className='card';
      card.innerHTML = `
        <div class="badge">${ch.title}</div>
        <div class="badge">${ls.title}</div>
        <h3>${title}</h3>
        <div class="grid-images">
          ${ls.images.map((src,i)=>`<img loading="lazy" src="${src}" alt="${title} ${i+1}" data-ci="${ci}" data-li="${li}">`).join('')}
        </div>
      `;
      card.addEventListener('click', (e)=>{
        if(e.target.tagName.toLowerCase()==='img'){
          openLightbox(ls.images, title);
        }
      });
      container.appendChild(card);
    });
  });
}

function openLightbox(imgs, title){
  lightboxContent.innerHTML = imgs.map(src=>`<img src="${src}" alt="${title}">`).join('');
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden','false');
}

closeLightbox.addEventListener('click', ()=>{
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden','true');
});

document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape') closeLightbox.click();
});

search.addEventListener('input', render);
chapterFilter.addEventListener('change', render);

initFilters();
render();
