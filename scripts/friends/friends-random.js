/**
 * Friends Page - 随机跳转功能
 */

const RandomFeature = {
  init() {
    const popup = document.getElementById("dvd-popup");
    if (!popup) return;

    let x = Math.random() * (window.innerWidth - 200);
    let y = Math.random() * (window.innerHeight - 50);
    let dx = 0.5 + Math.random() * 0.5;
    let dy = 0.5 + Math.random() * 0.5;
    let isPaused = false;

    popup.style.left = x + "px";
    popup.style.top = y + "px";

    const colors = ["#0000ff", "#ff00ff", "#00ffff", "#ff0000", "#00ff00", "#800080", "#0080ff", "#ff0080"];

    const animate = () => {
      if (popup.style.display === "none") return;

      if (!isPaused) {
        x += dx;
        y += dy;

        // 边界碰撞检测
        if (x <= 0 || x >= window.innerWidth - 200) {
          dx = -dx;
          popup.querySelector(".popup-content").style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        }
        if (y <= 0 || y >= window.innerHeight - 50) {
          dy = -dy;
          popup.querySelector(".popup-content").style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        }

        popup.style.left = x + "px";
        popup.style.top = y + "px";
      }

      requestAnimationFrame(animate);
    };

    popup.addEventListener("mouseenter", () => isPaused = true);
    popup.addEventListener("mouseleave", () => isPaused = false);
    popup.addEventListener("click", (e) => {
      if (!e.target.classList.contains("popup-close")) this.jump();
    });

    popup.querySelector(".popup-close").addEventListener("click", () => this.showConfirmDialog(popup));

    animate();
  },

  jump() {
    const links = document.querySelectorAll(".favicon-item[data-link], tr[data-link]");
    if (links.length === 0) return;
    const link = links[Math.floor(Math.random() * links.length)].getAttribute("data-link");
    if (link) window.open(link, "_blank");
  },

  showConfirmDialog(popup) {
    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";
    dialog.innerHTML = `
      <h3>Close the random service?</h3>
      <div class="confirm-dialog-buttons">
        <button id="confirm-yes">Y</button>
        <button id="confirm-no">N</button>
      </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById("confirm-yes").addEventListener("click", () => {
      popup.style.display = "none";
      dialog.remove();
    });

    document.getElementById("confirm-no").addEventListener("click", () => dialog.remove());
  }
};
