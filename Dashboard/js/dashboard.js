// Initialize sidebar toggle
const sidebar = document.getElementById("adminSidebar");
const toggleBtn = document.getElementById("sidebarToggle");

function toggleSidebar() {
  if (window.innerWidth < 992) {
    sidebar.classList.toggle("show");
  } else {
    sidebar.classList.toggle("collapsed");
  }
}

function handleResize() {
  if (window.innerWidth < 992) {
    sidebar.classList.remove("collapsed");
  } else {
    sidebar.classList.remove("show");
  }
}

toggleBtn.addEventListener("click", toggleSidebar);
window.addEventListener("resize", handleResize);
handleResize();

// menuLinks.forEach((link) => {
//   link.addEventListener("click", function () {
//     menuLinks.forEach((l) => l.classList.remove("active"));
//     this.classList.add("active");
//   });
// });
