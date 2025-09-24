const data = window.SITE_DATA;
const gridEl = document.getElementById("grid");
const search = document.getElementById("search");
const resetFilters = document.getElementById("resetFilters");
const chapterFilter = document.getElementById("chapterFilter");

const modal = document.getElementById("wbModal");
const wbImg = document.getElementById("wbImg");
const wbTitle = document.getElementById("wbTitle");
const downloadBtn = document.getElementById("downloadBtn");
const closeModal = document.getElementById("closeModal");
const closeModal2 = document.getElementById("closeModal2");

document.getElementById("year").textContent = new Date().getFullYear();

// Flatten chapters->lessons into array with title "Chapter X – Lesson Y"
const lessons = [];
data.chapters.forEach((ch, ci)=>{
  ch.lessons.forEach((ls, li)=>{
    lessons.push({
      id: `${ci+1}-${li+1}`,
      title: `${ch.title} – ${ls.title}`,
      chapter: `${ci+1}`,
      grade: "Third Secondary – Chemistry (Languages)",
      boards: ls.images
    });
  });
});

let filtered = [...lessons];

function renderGrid(list){
  gridEl.innerHTML = "";
  if(list.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = '<div class="card-body"><div class="card-title">لا توجد دروس مطابقة</div><div class="muted">جرّب تعديل البحث/الفصل.</div></div>';
    gridEl.appendChild(empty);
    return;
  }
  list.forEach(lesson=>{
    const card = document.createElement("article");
    card.className = "card";
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = lesson.boards[0];
    img.alt = lesson.title;
    img.loading = "lazy";
    img.addEventListener("click", ()=> openWhiteboard(lesson, 0));

    const body = document.createElement("div");
    body.className = "card-body";
    const h = document.createElement("div");
    h.className = "card-title";
    h.textContent = lesson.title;
    const meta = document.createElement("div");
    meta.className = "chip";
    meta.textContent = `${lesson.boards.length} صورة`;

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const openBtn = document.createElement("button");
    openBtn.className = "btn";
    openBtn.textContent = "فتح السبورة";
    openBtn.addEventListener("click", ()=> openWhiteboard(lesson, 0));

    actions.append(openBtn);
    body.append(h, meta, actions);
    card.append(img, body);
    gridEl.appendChild(card);
  });
}

function openWhiteboard(lesson, index){
  const src = lesson.boards[index];
  if(!src) return;
  wbImg.src = src;
  wbTitle.textContent = lesson.title;
  downloadBtn.href = src;
  if(typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open","");
}
function closeWhiteboard(){
  wbImg.src = "";
  if(typeof modal.close === "function") modal.close();
  else modal.removeAttribute("open");
}
closeModal.addEventListener("click", closeWhiteboard);
closeModal2.addEventListener("click", closeWhiteboard);
modal.addEventListener("click", (e)=>{
  const rect = modal.getBoundingClientRect();
  const inDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
  if(!inDialog) closeWhiteboard();
});

function applyFilters(){
  const q = (search.value||"").trim().toLowerCase();
  const ch = (chapterFilter && chapterFilter.value) ? chapterFilter.value : "all";
  filtered = lessons.filter(l=>{
    const matchesText = !q || l.title.toLowerCase().includes(q);
    const matchesChapter = ch==="all" || l.chapter===ch;
    return matchesText && matchesChapter;
  });
  renderGrid(filtered);
}

search.addEventListener("input", applyFilters);
if (chapterFilter) chapterFilter.addEventListener("change", applyFilters);
resetFilters.addEventListener("click", ()=>{
  search.value="";
  if (chapterFilter) chapterFilter.value="all";
  filtered = [...lessons];
  renderGrid(filtered);
});

renderGrid(filtered);

// ===== Gallery navigation + Download all =====
let currentLesson = null;
let currentIndex = 0;

function renderThumbs(lesson){
  const wrap = document.createElement("div");
  wrap.className = "thumbs";
  lesson.boards.forEach((src, i)=>{
    const t = document.createElement("img");
    t.src = src; t.alt = `thumb-${i+1}`;
    t.className = "thumb-mini" + (i===currentIndex ? " active" : "");
    t.addEventListener("click", ()=>{ currentIndex = i; openWhiteboard(lesson, currentIndex, true); });
    wrap.appendChild(t);
  });
  return wrap;
}

function openWhiteboard(lesson, index, keepOpen=false){
  currentLesson = lesson;
  currentIndex = index||0;
  const src = lesson.boards[currentIndex];
  if(!src) return;
  wbImg.src = src;
  wbTitle.textContent = `${lesson.title} – ${currentIndex+1}/${lesson.boards.length}`;
  downloadBtn.href = src;

  // Render thumbs
  const existing = document.querySelector(".thumbs");
  if(existing && existing.parentElement) existing.parentElement.removeChild(existing);
  const ma = document.querySelector(".modal-actions");
  ma.parentElement.insertBefore(renderThumbs(lesson), ma);

  if(!keepOpen){
    if(typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open","");
  }
}

function nextImg(){ if(!currentLesson) return; currentIndex = (currentIndex+1)%currentLesson.boards.length; openWhiteboard(currentLesson, currentIndex, true); }
function prevImg(){ if(!currentLesson) return; currentIndex = (currentIndex-1+currentLesson.boards.length)%currentLesson.boards.length; openWhiteboard(currentLesson, currentIndex, true); }

document.addEventListener("keydown", (e)=>{
  if(!modal.open) return;
  if(e.key === "ArrowRight") nextImg();
  if(e.key === "ArrowLeft") prevImg();
});

// Add buttons Prev/Next + Download All
(function addExtraButtons(){
  const actions = document.querySelector(".modal-actions");
  if(!actions) return;
  const prev = document.createElement("button");
  prev.className = "btn";
  prev.textContent = "◀ السابق";
  prev.addEventListener("click", prevImg);

  const next = document.createElement("button");
  next.className = "btn";
  next.textContent = "التالي ▶";
  next.addEventListener("click", nextImg);

  const dlAll = document.createElement("button");
  dlAll.className = "btn";
  dlAll.textContent = "تحميل الكل";
  dlAll.addEventListener("click", downloadAllCurrentLesson);

  actions.insertBefore(prev, actions.firstChild);
  actions.insertBefore(next, actions.firstChild.nextSibling);
  actions.insertBefore(dlAll, actions.firstChild.nextSibling.nextSibling);
})();

// Minimal ZIP (store) builder
function crc32(buf){
  let c = 0 ^ (-1);
  for(let i=0;i<buf.length;i++){
    c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
  }
  return (c ^ (-1)) >>> 0;
}
const CRC_TABLE = (() => {
  let c; const table = new Uint32Array(256);
  for(let n=0;n<256;n++){
    c = n;
    for(let k=0;k<8;k++){
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function strToU8(str){ return new TextEncoder().encode(str); }
function numToU16(n){ const b = new Uint8Array(2); b[0]=n&255; b[1]=(n>>>8)&255; return b; }
function numToU32(n){ const b = new Uint8Array(4); b[0]=n&255; b[1]=(n>>>8)&255; b[2]=(n>>>16)&255; b[3]=(n>>>24)&255; return b; }

async function downloadAllCurrentLesson(){
  if(!currentLesson) return;
  const files = currentLesson.boards;
  const fileEntries = [];
  // Fetch all
  for(const path of files){
    const res = await fetch(path);
    const buf = new Uint8Array(await res.arrayBuffer());
    const crc = crc32(buf);
    const name = path.split('/').slice(-1)[0];
    fileEntries.push({name, buf, crc, size: buf.length});
  }
  // Build zip (store)
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;
  for(const f of fileEntries){
    const nameU8 = strToU8(f.name);
    const localHeader = new Uint8Array([
      ...numToU32(0x04034b50), // local file header signature
      ...numToU16(20), // version
      ...numToU16(0),  // flags
      ...numToU16(0),  // compression (0=store)
      ...numToU16(0), ...numToU16(0), // time,date
      ...numToU32(f.crc),
      ...numToU32(f.size),
      ...numToU32(f.size),
      ...numToU16(nameU8.length),
      ...numToU16(0) // extra len
    ]);
    localChunks.push(localHeader, nameU8, f.buf);
    const centralHeader = new Uint8Array([
      ...numToU32(0x02014b50),
      ...numToU16(20), ...numToU16(20),
      ...numToU16(0), ...numToU16(0),
      ...numToU16(0), ...numToU16(0),
      ...numToU32(f.crc),
      ...numToU32(f.size),
      ...numToU32(f.size),
      ...numToU16(nameU8.length),
      ...numToU16(0), ...numToU16(0),
      ...numToU16(0), ...numToU16(0),
      ...numToU32(0),
      ...numToU32(offset)
    ]);
    centralChunks.push(centralHeader, nameU8);
    offset += localHeader.length + nameU8.length + f.buf.length;
  }
  // End of central directory
  let centralSize = 0;
  centralChunks.forEach(c => centralSize += c.length);
  const end = new Uint8Array([
    ...numToU32(0x06054b50),
    ...numToU16(0), ...numToU16(0),
    ...numToU16(fileEntries.length),
    ...numToU16(fileEntries.length),
    ...numToU32(centralSize),
    ...numToU32(offset),
    ...numToU16(0)
  ]);
  // Concatenate all
  function concat(chunks){
    let total = 0; chunks.forEach(c=> total += c.length);
    const out = new Uint8Array(total);
    let pos=0;
    chunks.forEach(c=>{ out.set(c, pos); pos += c.length; });
    return out;
  }
  const zipU8 = concat([...localChunks, ...centralChunks, end]);
  const blob = new Blob([zipU8], {type: "application/zip"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (currentLesson.title.replace(/\\s+/g,'_')) + ".zip";
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ===== Welcome modal (first visit) =====
(function welcomeOnce(){
  try{
    const key = "welcome_seen_v1";
    if(!localStorage.getItem(key)){
      const wm = document.getElementById("welcomeModal");
      const ok = document.getElementById("welcomeOk");
      const closeBtn = document.getElementById("welcomeClose");
      if(wm && typeof wm.showModal==="function"){ wm.showModal(); }
      else if(wm){ wm.setAttribute("open",""); }
      function closeIt(){
        if(wm && typeof wm.close==="function") wm.close();
        else if(wm) wm.removeAttribute("open");
        localStorage.setItem(key, "1");
      }
      if(ok) ok.addEventListener("click", closeIt);
      if(closeBtn) closeBtn.addEventListener("click", closeIt);
    }
  }catch(e){}
})();

// ===== Admin (password protected, local-only edits) =====
const ADMIN_PASSWORD = "2468";
const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const hideAdmin = document.getElementById("hideAdmin");
const adminChapter = document.getElementById("adminChapter");
const adminLessonTitle = document.getElementById("adminLessonTitle");
const adminLessonSelect = document.getElementById("adminLessonSelect");
const adminBoards = document.getElementById("adminBoards");
const addBoardsBtn = document.getElementById("addBoardsBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const adminStatus = document.getElementById("adminStatus");

const OVERRIDE_KEY = "SITE_DATA_OVERRIDE_V1";

function getActiveData(){
  // Merge base lessons with overrides if present
  const base = JSON.parse(JSON.stringify(lessons));
  try{
    const raw = localStorage.getItem(OVERRIDE_KEY);
    if(!raw) return base;
    const over = JSON.parse(raw);
    // over is same flattened format as lessons
    const map = new Map(base.map(l=>[l.title, l]));
    over.forEach(o=>{
      if(map.has(o.title)){ map.get(o.title).boards = o.boards; }
      else { map.set(o.title, o); }
    });
    return Array.from(map.values());
  }catch(e){
    console.error(e);
    return base;
  }
}

function saveOverrides(updatedLessons){
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(updatedLessons));
  adminStatus.textContent = "تم الحفظ محليًا.";
  setTimeout(()=> adminStatus.textContent="", 2000);
}

function refreshAdminLessonSelect(){
  adminLessonSelect.innerHTML = '<option value="">— اختر درسًا —</option>';
  const chVal = adminChapter.value;
  getActiveData()
    .filter(l=> l.chapter === chVal)
    .forEach(l=>{
      const op = document.createElement("option");
      op.value = l.title;
      op.textContent = l.title;
      adminLessonSelect.appendChild(op);
    });
}

adminBtn.addEventListener("click", ()=>{
  if(adminPanel.classList.contains("visible")){ adminPanel.classList.remove("visible"); return; }
  const pwd = prompt("أدخل كلمة المرور:");
  if(pwd === ADMIN_PASSWORD){
    adminPanel.classList.add("visible");
    refreshAdminLessonSelect();
    adminPanel.scrollIntoView({behavior:"smooth"});
  } else if(pwd !== null){
    alert("كلمة المرور غير صحيحة");
  }
});
if(hideAdmin) hideAdmin.addEventListener("click", ()=> adminPanel.classList.remove("visible"));

adminChapter.addEventListener("change", refreshAdminLessonSelect);

function toDataURLs(fileList){
  const files = Array.from(fileList||[]);
  return Promise.all(files.map(f => new Promise((res, rej)=>{
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(f);
  })));
}

addBoardsBtn.addEventListener("click", async ()=>{
  const ch = adminChapter.value;
  const selectedTitle = adminLessonSelect.value;
  const typedTitle = adminLessonTitle.value.trim();
  if(!selectedTitle && !typedTitle){
    alert("اختر درسًا موجودًا أو اكتب اسم درس جديد.");
    return;
  }
  const title = selectedTitle || (`Chapter ${ch} – ${typedTitle}`);
  const added = await toDataURLs(adminBoards.files);
  if(added.length===0){
    alert("اختر صورة واحدة على الأقل.");
    return;
  }
  // merge
  const current = getActiveData();
  const idx = current.findIndex(l => l.title === title);
  if(idx>=0){
    current[idx].boards = current[idx].boards.concat(added);
  } else {
    current.push({ id: crypto.randomUUID(), title, chapter: ch, grade: "Third Secondary – Chemistry (Languages)", boards: added });
  }
  saveOverrides(current);
  // refresh UI
  filtered = getActiveData();
  renderGrid(filtered);
  refreshAdminLessonSelect();
  adminBoards.value = "";
  adminLessonTitle.value = "";
  alert("تمت إضافة/تحديث الصور للدرس.");
});

exportDataBtn.addEventListener("click", ()=>{
  // Export merged data.js using legacy schema (chapters/lessons/images)
  const merged = getActiveData();
  const chapters = { "1": [], "2": [] };
  merged.forEach(l => {
    const m = l.title.match(/Chapter\s+(\d+)\s+–\s+Lesson\s+(\d+)/i);
    let ch = l.chapter || (m ? m[1] : "1");
    let lsTitle = m ? `Lesson ${m[2]}` : "Lesson X";
    chapters[ch] = chapters[ch] || [];
    chapters[ch].push({ "title": lsTitle, "images": l.boards });
  });
  // Build structured object
  const out = {
    chapters: [
      { title: "Chapter 1", lessons: chapters["1"]||[] },
      { title: "Chapter 2", lessons: chapters["2"]||[] }
    ]
  };
  const jsText = "window.SITE_DATA = " + JSON.stringify(out, null, 2) + ";";
  const blob = new Blob([jsText], {type:"application/javascript"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
});
