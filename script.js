// بيانات الدروس - سيتم تعبئتها من ملف data.js
const lessons = window.SITE_DATA.lessons;

// عرض الدروس على الصفحة
function displayLessons() {
    const lessonsContainer = document.getElementById('lessons');
    lessons.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.classList.add('lesson-card');
        
        const lessonTitle = document.createElement('h2');
        lessonTitle.textContent = lesson.title;

        const lessonImage = document.createElement('img');
        lessonImage.src = lesson.image;
        lessonImage.alt = lesson.title;
        lessonImage.classList.add('lesson-image');

        lessonCard.appendChild(lessonTitle);
        lessonCard.appendChild(lessonImage);
        lessonsContainer.appendChild(lessonCard);

        lessonImage.addEventListener('click', () => openWhiteboard(lesson.image));
    });
}

// فتح الصبورة عند النقر على الصورة
function openWhiteboard(imageSrc) {
    const whiteboardImage = document.getElementById('whiteboardImage');
    const lightbox = document.getElementById('lightbox');
    const closeButton = document.getElementById('closeButton');
    const downloadButton = document.getElementById('downloadButton');

    whiteboardImage.src = imageSrc;
    lightbox.style.display = 'block';
    closeButton.style.display = 'block';
    downloadButton.style.display = 'block';
}

// إغلاق الصبورة
const closeButton = document.getElementById('closeButton');
const downloadButton = document.getElementById('downloadButton');
const whiteboardImage = document.getElementById('whiteboardImage');

closeButton.addEventListener('click', () => {
    whiteboardImage.style.display = 'none';  // إخفاء الصبورة
    closeButton.style.display = 'none';  // إخفاء زر الإغلاق
    downloadButton.style.display = 'none';  // إخفاء زر التحميل
});

// تحميل الصورة
downloadButton.addEventListener('click', () => {
    const imageURL = whiteboardImage.src;
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = 'whiteboard.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// إضافة رابط لوحة الإدارة بعد إدخال كلمة المرور
function showAdminPanel() {
    const password = prompt("ادخل كلمة المرور:");
    if (password === "admin123") {
        const adminLink = document.createElement('a');
        adminLink.href = "/admin-panel";
        adminLink.textContent = "اذهب إلى لوحة الإدارة";
        adminLink.className = "admin-panel-link";
        document.body.appendChild(adminLink);
    } else {
        alert("كلمة المرور غير صحيحة!");
    }
}

const adminLinkButton = document.getElementById('admin-link');
adminLinkButton.addEventListener('click', showAdminPanel);

window.addEventListener('load', displayLessons);
