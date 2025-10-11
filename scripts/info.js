let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const menuItems = document.querySelectorAll(".menu-item");

function updateMenu(index) {
  menuItems.forEach((item) => {
    item.classList.remove("active-menu-item");
  });
  menuItems[index].classList.add("active-menu-item");
}

function showSlide(index) {
  if (index < 0 || index >= slides.length) return;

  slides[currentSlide].classList.remove("active-slide");

  currentSlide = index;

  slides[currentSlide].classList.add("active-slide");

  updateMenu(index);
}

document.addEventListener("DOMContentLoaded", function () {
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const index = parseInt(this.getAttribute("data-slide"));
      showSlide(index);
    });
  });

  const images = document.querySelectorAll(".image");
  const fullscreenView = document.getElementById("fullscreenView");
  const fullscreenImage = document.getElementById("fullscreenImage");
  const closeBtn = document.getElementById("closeBtn");

  images.forEach((image) => {
    image.addEventListener("click", function () {
      fullscreenImage.src = this.src;
      fullscreenView.classList.add("show");
    });
  });

  closeBtn.addEventListener("click", function () {
    fullscreenView.classList.remove("show");
  });

  fullscreenView.addEventListener("click", function (e) {
    if (e.target === fullscreenView) {
      fullscreenView.classList.remove("show");
    }
  });

  showSlide(0);
});
