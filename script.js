const lessonsContainer=document.getElementById('lessonsContainer');
const searchInput=document.getElementById('searchInput');
const chapterSelect=document.getElementById('chapterSelect');
const clearBtn=document.getElementById('clearBtn');
const stats=document.getElementById('stats');
const emptyState=document.getElementById('emptyState');
const chipBar=document.getElementById('chipBar');

const chapterLabels={"Chapter 1":"الفصل الأول","Chapter 2":"الفصل الثاني"};

window.addEventListener('keydown',(e)=>{ if(e.key==='/'&&document.activeElement!==searchInput){ e.preventDefault(); searchInput.focus(); }});

function populateChapterFilter(){
  const chapters=lessons.map(c=>c.chapter);
  chapterSelect.innerHTML=`<option value="">كل الفصول</option>`;
  chipBar.innerHTML='';
  chapters.forEach(ch=>{
    const opt=document.createElement('option');
    opt.value=ch; opt.textContent=chapterLabels[ch]??ch;
    chapterSelect.appendChild(opt);
    const chip=document.createElement('button');
    chip.className='chip'; chip.dataset.value=ch; chip.textContent=chapterLabels[ch]??ch;
    chip.addEventListener('click',()=>{
      if(chapterSelect.value===ch){ chapterSelect.value=''; chip.classList.remove('active'); }
      else { chapterSelect.value=ch; document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); chip.classList.add('active'); }
      render();
    });
    chipBar.appendChild(chip);
  });
}

function debounce(fn,ms=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

function buildCard(chapterName, lesson){
  const card=document.createElement('article'); card.className='card';
  const badge=`<span class="badge">${chapterLabels[chapterName]??chapterName}</span>`;
  const header=`<div class="card-header"><h3 class="card-title">${lesson.title}</h3>${badge}</div>`;
  const imgs=lesson.images.map(src=>`<img src="${src}" alt="${lesson.title}" loading="lazy" onerror="this.style.display='none'" data-caption="${lesson.title} — ${chapterLabels[chapterName]??chapterName}" />`).join('');
  card.innerHTML=header+`<div class="images">${imgs}</div>`;
  return card;
}

function queryLessons(q='',chapter=''){
  const lower=q.trim().toLowerCase(); const out=[];
  lessons.forEach(group=>{
    if(chapter && group.chapter!==chapter) return;
    group.lessons.forEach(lesson=>{
      const hay=(lesson.title+' '+group.chapter).toLowerCase();
      if(!lower || hay.includes(lower)) out.push({chapter:group.chapter, lesson});
    });
  });
  return out;
}

function render(){
  const q=searchInput.value, ch=chapterSelect.value;
  const list=queryLessons(q,ch);
  lessonsContainer.innerHTML='';
  list.forEach(item=>lessonsContainer.appendChild(buildCard(item.chapter,item.lesson)));
  stats.textContent=list.length+' نتيجة';
  emptyState.hidden=list.length>0;
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c.dataset.value===ch&&ch!==''));
  document.querySelectorAll('.images img').forEach(img=>img.addEventListener('click',()=>openLightbox(img.src,img.dataset.caption||'')));
}

const lb=document.getElementById('lightbox'), lbImg=document.getElementById('lbImg'), lbCap=document.getElementById('lbCaption'), lbClose=document.getElementById('lbClose');
function openLightbox(src,cap=''){ lbImg.src=src; lbCap.textContent=cap; lb.hidden=false; lb.setAttribute('aria-hidden','false'); }
function closeLightbox(){ lb.setAttribute('aria-hidden','true'); lb.hidden=true; lbImg.src=''; }
lb.addEventListener('click',(e)=>{ if(e.target===lb) closeLightbox(); });
lbClose.addEventListener('click', closeLightbox);
window.addEventListener('keydown',(e)=>{ if(e.key==='Escape'&&lb.getAttribute('aria-hidden')==='false') closeLightbox(); });

searchInput.addEventListener('input', debounce(()=>render(),150));
chapterSelect.addEventListener('change', ()=>render());
clearBtn.addEventListener('click', ()=>{ searchInput.value=''; chapterSelect.value=''; render(); });

populateChapterFilter(); render();
