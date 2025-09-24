// إعدادات
const ADMIN_PASSWORD = "2468";
const STORAGE_KEY = "omar_lessons_v1";

// حالة التطبيق
const state = { lessons: [], filtered: [], adminVisible: false };

// عينات مبدئية (تظهر أول مرة فقط)
const SAMPLE_DATA = [
  {
    id: crypto.randomUUID(),
    title: "مجموعة أركيديا – تجميعة السبورات",
    grade: "ثالثة ثانوي",
    boards: [
    "images/arcadia/L1-1.jpg",
    "images/arcadia/L1-2.jpg",
    "images/arcadia/L2-1.jpg",
    "images/arcadia/L2-2.jpg",
    "images/arcadia/L3-1.jpg",
    "images/arcadia/L3-2.jpg",
    "images/arcadia/L4-1.jpg",
    "images/arcadia/L4-2.jpg",
    "images/arcadia/L5-1.jpg",
    "images/arcadia/L5-2.jpg",
    "images/arcadia/L6-1.jpg",
    "images/arcadia/L6-2.jpg",
    "images/arcadia/L7-1.jpg",
    "images/arcadia/L7-2.jpg",
    "images/arcadia/L7-3.jpg",
    "images/arcadia/L7-4.jpg",
    "images/arcadia/L8-1.jpg",
    "images/arcadia/L8-2.jpg",
    "images/arcadia/L9-1.jpg",
    "images/arcadia/L9-2.jpg",
    "images/arcadia/C2L1-1.jpg",
    "images/arcadia/C2L1-2.jpg",
    "images/arcadia/C2L1-3.webp",
    "images/arcadia/C2L1-4.webp",
    "images/arcadia/logo.png"
    ]
  }
];


// عناصر DOM
const gridEl = document.getElementById("grid");
const search = document.getElementById("search");
const resetFilters = document.getElementById("resetFilters");
const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const hideAdmin = document.getElementById("hideAdmin");
const lessonForm = document.getElementById("lessonForm");
const boardsInput = document.getElementById("boards");
const lessonTitle = document.getElementById("lessonTitle");
const lessonGrade = document.getElementById("lessonGrade");
const adminListTbody = document.querySelector("#adminList tbody");

// مودال
const modal = document.getElementById("wbModal");
const wbImg = document.getElementById("wbImg");
const wbTitle = document.getElementById("wbTitle");
const downloadBtn = document.getElementById("downloadBtn");
const closeModal = document.getElementById("closeModal");
const closeModal2 = document.getElementById("closeModal2");

// تحميل/حفظ
function loadLessons(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){
      state.lessons = SAMPLE_DATA;
      saveLessons();
    } else {
      state.lessons = JSON.parse(raw);
    }
  } catch(e){
    console.error(e);
    state.lessons = SAMPLE_DATA;
  }
  state.filtered = [...state.lessons];
}
function saveLessons(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lessons));
}

// رسم الشبكة
function renderGrid(list){
  gridEl.innerHTML = "";
  if(list.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = '<div class="card-body"><div class="card-title">لا توجد دروس مطابقة</div><div class="muted">جرّب تعديل البحث.</div></div>';
    gridEl.appendChild(empty);
    return;
  }
  for(const lesson of list){
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = lesson.boards?.[0] || "";
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
    meta.textContent = [lesson.grade, (lesson.boards?.length||0)+' صورة'].filter(Boolean).join(' • ');

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const openBtn = document.createElement("button");
    openBtn.className = "btn";
    openBtn.textContent = "فتح السبورة";
    openBtn.addEventListener("click", ()=> openWhiteboard(lesson, 0));

    const listBtn = document.createElement("button");
    listBtn.className = "btn";
    listBtn.textContent = "الصور";
    listBtn.title = "عرض كل صور الدرس";
    listBtn.addEventListener("click", ()=> openWhiteboard(lesson, 0));

    actions.append(openBtn, listBtn);
    body.append(h, meta, actions);
    card.append(img, body);
    gridEl.appendChild(card);
  }
}

// مودال
function openWhiteboard(lesson, index){
  const src = lesson.boards?.[index];
  if(!src) return;
  wbImg.src = src;
  wbTitle.textContent = lesson.title;
  downloadBtn.href = src; // زر التحميل
  if(typeof modal.showModal === "function"){ modal.showModal(); }
  else { modal.setAttribute("open",""); }
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

// بحث
search.addEventListener("input", ()=>{
  const q = search.value.trim();
  if(!q){ state.filtered = [...state.lessons]; renderGrid(state.filtered); return; }
  const k = q.toLowerCase();
  state.filtered = state.lessons.filter(l => l.title.toLowerCase().includes(k) || (l.grade||'').toLowerCase().includes(k));
  renderGrid(state.filtered);
});
resetFilters.addEventListener("click", ()=>{ search.value=""; state.filtered=[...state.lessons]; renderGrid(state.filtered); });

// إدارة (محميّة بكلمة مرور)
adminBtn.addEventListener("click", ()=>{
  if(state.adminVisible){ adminPanel.classList.remove("visible"); state.adminVisible=false; return; }
  const pwd = prompt("أدخل كلمة المرور للوصول إلى لوحة الإدارة:");
  if(pwd === ADMIN_PASSWORD){
    state.adminVisible = true;
    adminPanel.classList.add("visible");
    refreshAdminTable();
    adminPanel.scrollIntoView({behavior:"smooth"});
  } else if(pwd !== null){
    alert("كلمة المرور غير صحيحة");
  }
});
hideAdmin.addEventListener("click", ()=>{ adminPanel.classList.remove("visible"); state.adminVisible=false; });

lessonForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const title = lessonTitle.value.trim();
  if(!title) return alert("اكتب عنوان الدرس");
  const grade = lessonGrade.value.trim();
  const files = Array.from(boardsInput.files||[]);
  if(files.length === 0) return alert("اختر صورة واحدة على الأقل");

  const dataURLs = await Promise.all(files.map(file => toDataURL(file)));
  const lesson = { id: crypto.randomUUID(), title, grade, boards: dataURLs };
  state.lessons.unshift(lesson);
  saveLessons();
  state.filtered = [...state.lessons];
  renderGrid(state.filtered);
  refreshAdminTable();
  lessonForm.reset();
  alert("تمت إضافة الدرس بنجاح");
});

function refreshAdminTable(){
  const tbody = adminListTbody;
  tbody.innerHTML = "";
  state.lessons.forEach((l, i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(l.title)}</td><td>${l.boards?.length||0}</td>`;
    const td = document.createElement("td");
    const del = document.createElement("button");
    del.className = "btn btn-danger";
    del.textContent = "حذف";
    del.addEventListener("click", ()=>{
      if(confirm("تأكيد حذف هذا الدرس؟")){
        state.lessons = state.lessons.filter(x=>x.id!==l.id);
        saveLessons();
        state.filtered = [...state.lessons];
        renderGrid(state.filtered);
        refreshAdminTable();
      }
    });
    td.appendChild(del);
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
}

function toDataURL(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function escapeHtml(str){
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// تهيئة
document.getElementById("year").textContent = new Date().getFullYear();
loadLessons();
renderGrid(state.filtered);

// ===== Enhanced filtering: by text + chapter =====
function applyFilters(){
  const q = (search.value||"").trim().toLowerCase();
  const chSel = (typeof chapterFilter!=="undefined" && chapterFilter) ? chapterFilter.value : "all";
  state.filtered = state.lessons.filter(l => {
    const matchesText = !q || l.title.toLowerCase().includes(q) || (l.grade||'').toLowerCase().includes(q);
    let matchesChapter = true;
    if(chSel !== "all"){
      const m = l.title.match(/Chapter\s+(\d+)/i);
      const num = m ? m[1] : null;
      matchesChapter = (num === chSel);
    }
    return matchesText && matchesChapter;
  });
  renderGrid(state.filtered);
}

if (typeof chapterFilter !== "undefined" && chapterFilter) {
  chapterFilter.addEventListener("change", applyFilters);
}
search.addEventListener("input", applyFilters);
resetFilters.addEventListener("click", ()=>{ 
  search.value=""; 
  if (typeof chapterFilter !== "undefined" && chapterFilter) chapterFilter.value="all";
  state.filtered=[...state.lessons]; 
  renderGrid(state.filtered); 
});
