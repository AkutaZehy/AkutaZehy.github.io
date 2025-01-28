document.addEventListener('DOMContentLoaded', function () {
  const fishContainer = document.getElementById('fish-container');

  function createFish () {
    const fishText = document.createElement('div');
    fishText.classList.add('fish-text');
    const randomNum = Math.random();
    if (randomNum < 0.05) {
      const fishOptions = ['sakana', '鱼', 'рыбы', 'poisson', 'pez', 'pescare', 'fisch'];
      const randomFish = fishOptions[Math.floor(Math.random() * fishOptions.length)];
      fishText.textContent = randomFish;
    } else {
      fishText.textContent = 'fish';
    }

    const size = Math.floor(Math.random() * 24 + 12);
    fishText.style.fontSize = `${size}px`;

    const startX = Math.random() * window.innerWidth;
    fishText.style.left = `${startX}px`;
    fishText.style.top = `0px`;

    const a = Math.random() * 0.01 + 0.001;
    const b = Math.random() * 2 - 1;

    fishContainer.appendChild(fishText);

    let startTime = null;
    function animateFish (timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      const y = a * progress + b;
      fishText.style.top = `${y}px`;

      if (y > window.innerHeight * 0.9) {
        setTimeout(() => {
          fishText.remove();
        }, 1000);
        return;
      }

      requestAnimationFrame(animateFish);
    }

    requestAnimationFrame(animateFish);
  }

  setInterval(createFish, 1000);
});
