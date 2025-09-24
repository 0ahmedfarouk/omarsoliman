// بيانات الدروس - يتم تعبئتها من ملف data.js
const lessons = window.SITE_DATA.lessons;

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

        lessonCard.appendChild(lessonTitle);
        lessonCard.appendChild(lessonImage);
        lessonsContainer.appendChild(lessonCard);
    });
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

// تحميل الصبورة
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
