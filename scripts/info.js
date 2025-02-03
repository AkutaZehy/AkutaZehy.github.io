let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const title = document.getElementById('title');

const onSound = new Audio('/resources/sound/sfx/pc_on.wav');
const offSound = new Audio('/resources/sound/sfx/pc_off.wav');

function showSlide (index) {
  slides[currentSlide].classList.remove('active-slide');
  dots[currentSlide].classList.remove('active-dot');
  currentSlide = index;
  slides[currentSlide].classList.add('active-slide');
  dots[currentSlide].classList.add('active-dot');
}

function handleWheelEvent (event) {
  const delta = Math.sign(event.deltaY);
  const newIndex = currentSlide + delta;
  if (newIndex >= 0 && newIndex < slides.length) {
    showSlide(newIndex);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  title.addEventListener('click', function () {
    if (title.classList.contains('active')) {
      title.classList.remove('active');
      document.removeEventListener('wheel', handleWheelEvent);
      offSound.play();
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Browser Notification', {
            body: 'Wheel control has been deactivated.',
            icon: '/resources/svgs/orange-seamless-pattern.svg'
          });
        }
      });
    } else {
      title.classList.add('active');
      document.addEventListener('wheel', handleWheelEvent);
      onSound.play();
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Browser Notification', {
            body: 'Wheel control has been activated.',
            icon: '/resources/svgs/orange-seamless-pattern.svg'
          });
        }
      });
    }
  });

  const images = document.querySelectorAll('.image');
  const fullscreenView = document.getElementById('fullscreenView');
  const fullscreenImage = document.getElementById('fullscreenImage');
  const closeBtn = document.getElementById('closeBtn');

  images.forEach(image => {
    image.addEventListener('click', function () {
      fullscreenImage.src = this.src;
      fullscreenView.classList.add('show');
      document.removeEventListener('wheel', handleWheelEvent);
    });
  });

  closeBtn.addEventListener('click', function () {
    fullscreenView.classList.remove('show');
    if (title.classList.contains('active')) {
      document.addEventListener('wheel', handleWheelEvent);
    }
  });

  fullscreenView.addEventListener('click', function (e) {
    if (e.target === fullscreenView) {
      fullscreenView.classList.remove('show');
      if (title.classList.contains('active')) {
        document.addEventListener('wheel', handleWheelEvent);
      }
    }
  });
});

showSlide(0);