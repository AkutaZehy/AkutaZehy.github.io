/**
 * Friends Page - 交互管理
 */

const InteractionManager = {
  init() {
    // 点击打开链接
    document.addEventListener("click", (e) => {
      const item = e.target.closest(".favicon-item");
      if (item) {
        const link = item.getAttribute("data-link");
        if (link) window.open(link, "_blank");
      }
    });

    // Tooltip 位置
    document.addEventListener("mouseover", (e) => {
      const tooltip = e.target.closest(".tooltip");
      if (tooltip) {
        const text = tooltip.querySelector(".tooltiptext");
        if (text) {
          text.style.left = e.clientX + "px";
          text.style.top = (e.clientY - 40) + "px";
        }
      }
    });

    // 表格行点击
    document.querySelectorAll("tr[data-link]").forEach(row => {
      row.addEventListener("click", () => {
        const link = row.getAttribute("data-link");
        if (link) window.open(link, "_blank");
      });
    });
  }
};
