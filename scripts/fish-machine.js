document.addEventListener("DOMContentLoaded", function () {
  const fishContainer = document.getElementById("fish-container");

  function createFish() {
    const fishText = document.createElement("div");
    fishText.classList.add("fish-text");
    const randomNum = Math.random();
    let fishOptions, randomFish;

    let isSwimmingFish = false;
    if (randomNum < 0.1) {
      fishOptions = [
        "sakana",
        "鱼",
        "рыбы",
        "poisson",
        "pez",
        "pescare",
        "fisch",
        "[ˈfɪʃ]",
        "🐟",
      ];
      randomFish = fishOptions[Math.floor(Math.random() * fishOptions.length)];
      fishText.textContent = randomFish;
    } else if (randomNum < 0.25) {
      fishOptions = ["𓆝", "𓆟", "𓆞", "𓆟"];
      fishText.textContent = fishOptions[0];
      fishText.classList.add("active-fish");
      isSwimmingFish = true;
    } else {
      fishText.textContent = "fish";
    }

    const size = Math.floor(Math.random() * 24 + 12);
    fishText.style.fontSize = `${size}px`;

    fishContainer.appendChild(fishText);

    const maxStartX = window.innerWidth - fishText.offsetWidth;
    const startX = Math.random() * maxStartX;

    if (isSwimmingFish) {
      let fishIndex = 0;
      const swimInterval = setInterval(() => {
        if (!fishText.isConnected) {
          clearInterval(swimInterval);
          return;
        }
        fishIndex = (fishIndex + 1) % fishOptions.length;
        fishText.textContent = fishOptions[fishIndex];
      }, 500);
    }

    const a = Math.random() * 0.02 + 0.001;
    const b = Math.random() * 2 - 1;

    const horizontalSpeed = isSwimmingFish ? -Math.random() : 0;
    let currentX = startX;

    let startTime = null;
    function animateFish(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      const y = a * progress + b - 5;

      if (isSwimmingFish) {
        currentX += horizontalSpeed;
      }

      fishText.style.transform = `translate(${currentX}px, ${y}px)`;

      if (y > window.innerHeight) {
        fishText.remove();
        return;
      }

      requestAnimationFrame(animateFish);
    }

    requestAnimationFrame(animateFish);
  }

  setInterval(createFish, 1500);
});
