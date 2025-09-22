document.addEventListener("DOMContentLoaded", () => {
  const lessonsContainer = document.getElementById("lessonsContainer");
  const searchInput = document.getElementById("searchInput");

  function renderLessons(filter = "") {
    lessonsContainer.innerHTML = "";
    lessons.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        if (lesson.title.includes(filter)) {
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <h3>${lesson.title}</h3>
            ${lesson.images.map(img => `<img src="${img}" alt="${lesson.title}">`).join("")}
          `;
          lessonsContainer.appendChild(card);
        }
      });
    });
  }

  searchInput.addEventListener("input", e => {
    renderLessons(e.target.value);
  });

  renderLessons();
});