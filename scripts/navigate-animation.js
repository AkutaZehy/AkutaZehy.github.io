const navigateSound0 = new Audio('/resources/sound/sfx/sheep_demon.wav');
const navigateSound1 = new Audio('/resources/sound/sfx/sheep1.wav');
const navigateSound2 = new Audio('/resources/sound/sfx/sheep2.wav');
const navigateSound3 = new Audio('/resources/sound/sfx/sheep3.wav');

document.addEventListener('DOMContentLoaded', function () {
  const areas = document.querySelectorAll('.area');

  const isHoverSupported = window.matchMedia('(hover: hover)').matches;

  if (!isHoverSupported) {
    areas.forEach(area => {
      area.addEventListener('click', function () {
        if (area.classList.contains('expanded')) {
          area.classList.add('active');
          setTimeout(() => {
            const link = area.getAttribute('data-link');
            window.location.href = link;
          }, 1000);
        } else {
          areas.forEach(a => a.classList.remove('expanded'));
          area.classList.add('expanded');
          setTimeout(() => {
            area.classList.add('active');
            setTimeout(() => {
              const link = area.getAttribute('data-link');
              window.location.href = link;
            }, 1000);
          }, 500);
        }
      });

      area.addEventListener('animationend', function () {
        area.classList.remove('active');
      });
    });
  } else {
    areas.forEach(area => {
      area.addEventListener('click', function () {
        area.classList.add('active');

        if (area.id === '0') {
          navigateSound0.play();
        } else {
          const randomSound = Math.floor(Math.random() * 3) + 1;
          eval(`navigateSound${randomSound}.play()`);
        }

        setTimeout(() => {
          const link = area.getAttribute('data-link');
          window.location.href = link;
        }, 2000);
      });

      area.addEventListener('animationend', function () {
        area.classList.remove('active');
      });
    });
  }

  const svg = document.getElementById('escape-animation');
  const door = document.querySelector('.door');
  const background = document.querySelector('.background');
  const arrow = document.querySelector('.arrow');
  const light = document.querySelector('.light');
  const person = document.querySelector('.person');
  const person_body = document.querySelector('.person-body');

  svg.addEventListener('click', () => {
    door.style.fill = 'white';
    background.style.fill = 'darkgreen';

    setTimeout(() => {
      light.style.opacity = 1;
    }, 100);

    setTimeout(() => {
      arrow.style.opacity = 1;
      arrow.style.transform = 'translateX(50px)';
    }, 500);

    setTimeout(() => {
      person.style.opacity = 1;
      person.style.transform = 'translateX(30px)';
      person_body.style.opacity = 1;
      person_body.style.transform = 'translateX(45px) translateY(-10px) rotate(30deg)';
    }, 900);

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);
  });
});
