document.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  if (e.key === '/' && (!active || active.tagName !== 'INPUT')) {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
});

const container = document.getElementById('lessonsContainer');
const searchInput = document.getElementById('searchInput');
const chapterSelect = document.getElementById('chapterSelect');
const resetBtn = document.getElementById('resetBtn');

const allChapters = lessons.map(c => c.chapter);
chapterSelect.innerHTML = '<option value="">كل الفصول</option>' + allChapters.map(c => `<option value="${c}">${c}</option>`).join('');

function match(title, q){return title.toLowerCase().includes((q||'').toLowerCase());}

function render(){
  const q = searchInput.value.trim();
  const ch = chapterSelect.value;
  container.innerHTML = '';
  lessons.forEach((chapter) => {
    if (ch && chapter.chapter !== ch) return;
    chapter.lessons.forEach((l) => {
      if (!match(l.title, q)) return;
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <h3>${l.title}</h3>
        <div class="thumb-grid">
          ${l.images.slice(0,2).map((src,i) => `<div class='thumb'><img src='${src}' loading='lazy' alt='${l.title} - ${i+1}'></div>`).join('')}
          ${l.images.length>2 ? `<div class='thumb'><img src='${l.images[2]}' loading='lazy' alt='${l.title} - 3'><span class='more-badge'>+${l.images.length-3}</span></div>` : ''}
        </div>
        <div class='actions'>
          <button class='btn primary' data-title='${l.title}'>عرض كل الصور</button>
          <span class='tags'>${chapter.chapter}</span>
        </div>`;
      card.querySelector('.btn.primary').addEventListener('click', () => openLightbox(l.images, l.title, 0));
      card.querySelectorAll('.thumb img').forEach((img, idx) => {
        img.addEventListener('click', () => openLightbox(l.images, l.title, idx));
      });
      container.appendChild(card);
    });
  });
}

searchInput.addEventListener('input', render);
chapterSelect.addEventListener('change', render);
resetBtn.addEventListener('click', ()=>{searchInput.value='';chapterSelect.value='';render();});

let lbIdx=0, lbImages=[], lbTitle='';
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImage');
const lbCaption = document.getElementById('lbCaption');
document.getElementById('lbClose').onclick=()=>lb.classList.remove('open');
document.getElementById('lbPrev').onclick=()=>showIdx(lbIdx-1);
document.getElementById('lbNext').onclick=()=>showIdx(lbIdx+1);
lb.addEventListener('click',(e)=>{if(e.target===lb)lb.classList.remove('open');});
document.addEventListener('keydown',(e)=>{
  if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')lb.classList.remove('open');
  if(e.key==='ArrowRight')showIdx(lbIdx+1);
  if(e.key==='ArrowLeft')showIdx(lbIdx-1);
});

function openLightbox(images,title,start=0){
  lbImages=images; lbTitle=title; lbIdx=start;
  showIdx(lbIdx);
  lb.classList.add('open');
}
function showIdx(i){
  if(!lbImages.length)return;
  lbIdx=(i+lbImages.length)%lbImages.length;
  lbImg.src=lbImages[lbIdx];
  lbCaption.textContent=`${lbTitle} — صورة ${lbIdx+1} من ${lbImages.length}`;
}

render();
