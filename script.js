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

// Close button functionality for whiteboard
const closeButton = document.getElementById('closeButton');
const downloadButton = document.getElementById('downloadButton');
const whiteboardImage = document.getElementById('whiteboardImage');

closeButton.addEventListener('click', () => {
    whiteboardImage.style.display = 'none';  // Hide whiteboard
    closeButton.style.display = 'none';  // Hide the close button
    downloadButton.style.display = 'none';  // Hide the download button
});

// Download button functionality
downloadButton.addEventListener('click', () => {
    const imageURL = whiteboardImage.src;
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = 'whiteboard.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Admin panel link shown after successful password input
function showAdminPanel() {
    const password = prompt("Enter Admin Password:");
    if (password === "admin123") {
        const adminLink = document.createElement('a');
        adminLink.href = "/admin-panel";
        adminLink.textContent = "Go to Admin Panel";
        adminLink.className = "admin-panel-link";
        document.body.appendChild(adminLink);
    } else {
        alert("Incorrect password!");
    }
}

window.addEventListener('load', showAdminPanel);
