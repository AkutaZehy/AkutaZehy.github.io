document.addEventListener('DOMContentLoaded', function () {
  const fishContainer = document.getElementById('fish-container');

  function createFish () {
    const fishText = document.createElement('div');
    fishText.classList.add('fish-text');
    const randomNum = Math.random();
    let fishOptions, randomFish;

    if (randomNum < 0.1) {
      fishOptions = ['sakana', '鱼', 'рыбы', 'poisson', 'pez', 'pescare', 'fisch', '[ˈfɪʃ]', '🐟'];
      randomFish = fishOptions[Math.floor(Math.random() * fishOptions.length)];
      fishText.textContent = randomFish;
    } else if (randomNum < 0.25) {
      fishOptions = ['𓆝', '𓆟', '𓆞', '𓆟'];
      fishText.textContent = fishOptions[0];
      fishText.classList.add('active-fish');
    } else {
      fishText.textContent = 'fish';
    }

    const size = Math.floor(Math.random() * 24 + 12);
    fishText.style.fontSize = `${size}px`;

    const startX = Math.random() * window.innerWidth;
    fishText.style.left = `${startX}px`;
    fishText.style.top = `0px`;

    fishContainer.appendChild(fishText);

    if (randomNum > 0.09 && randomNum < 0.25) {
      let fishIndex = 0;
      setInterval(() => {
        fishIndex = (fishIndex + 1) % fishOptions.length;
        fishText.textContent = fishOptions[fishIndex];
      }, 500);
    }

    const a = Math.random() * 0.01 + 0.001;
    const b = Math.random() * 2 - 1;

    let startTime = null;
    function animateFish (timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      const y = a * progress + b;
      fishText.style.top = `${y}px`;

      if (y > window.innerHeight) {
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