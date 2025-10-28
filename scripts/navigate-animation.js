document.addEventListener("DOMContentLoaded", function () {
  const navigateSound0 = new Audio("/resources/sound/sfx/sheep_demon.wav");
  const navigateSound1 = new Audio("/resources/sound/sfx/sheep1.wav");
  const navigateSound2 = new Audio("/resources/sound/sfx/sheep2.wav");
  const navigateSound3 = new Audio("/resources/sound/sfx/sheep3.wav");

  const isPlaySound = false;

  function playSound(area) {
    if (!isPlaySound) return;
    if (area.id === "0") {
      navigateSound0.play();
    } else {
      const sounds = [navigateSound1, navigateSound2, navigateSound3];
      const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
      randomSound.play();
    }
  }

  const areas = document.querySelectorAll(".area");
  const isHoverSupported = window.matchMedia("(hover: hover)").matches;

  if (!isHoverSupported && window.innerWidth > 800) {
    areas.forEach((area) => {
      area.addEventListener("click", function () {
        if (area.classList.contains("expanded")) {
          area.classList.add("active");
          playSound(area);
          setTimeout(() => {
            const link = area.getAttribute("data-link");
            window.location.href = link;
          }, 1000);
        } else {
          areas.forEach((a) => a.classList.remove("expanded"));
          area.classList.add("expanded");
          setTimeout(() => {
            area.classList.add("active");
            playSound(area);
            setTimeout(() => {
              const link = area.getAttribute("data-link");
              window.location.href = link;
            }, 1000);
          }, 500);
        }
      });

      area.addEventListener("animationend", function () {
        area.classList.remove("active");
      });
    });
  } else {
    areas.forEach((area) => {
      area.addEventListener("click", function () {
        area.classList.add("active");
        playSound(area);
        setTimeout(() => {
          const link = area.getAttribute("data-link");
          window.location.href = link;
        }, 1000);
      });

      area.addEventListener("animationend", function () {
        area.classList.remove("active");
      });
    });
  }

  const svgContainer = document.getElementById("svg-container");

  if (svgContainer) {
    fetch("/resources/svgs/escape.svg")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((svgData) => {
        svgContainer.innerHTML = svgData;

        initializeEscapeAnimation();
      })
      .catch((error) => {
        console.error("Error loading or processing SVG:", error);
      });
  }

  function initializeEscapeAnimation() {
    const svg = document.getElementById("escape-animation");

    if (!svg) {
      console.error('SVG with id "escape-animation" not found after loading.');
      return;
    }

    const door = svg.querySelector(".door");
    const background = svg.querySelector(".background");
    const arrow = svg.querySelector(".arrow");
    const light = svg.querySelector(".light");
    const person = svg.querySelector(".person");

    svg.addEventListener("click", () => {
      door.style.fill = "white";
      background.style.fill = "darkgreen";

      setTimeout(() => {
        light.style.opacity = 1;
      }, 100);

      setTimeout(() => {
        arrow.style.opacity = 1;
        arrow.style.transform = "translateX(50px)";

        person.classList.add("is-running");
      }, 500);

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
    });
  }
});
