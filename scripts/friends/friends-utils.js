/**
 * Friends Page - 状态管理 + 加载状态
 */

// 全局状态
const State = {
  activeWindow: null,
  windowZIndex: 100,
  linksData: null
};

// 加载状态管理
const LoadingManager = {
  show(container) {
    container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading...</p>
      </div>
    `;
  },

  hide() {
    // 加载完成后由 generateContent 清除
  },

  showAll() {
    const containers = [
      document.getElementById("favicon-wall-content"),
      document.getElementById("friends-backlinks-content"),
      document.getElementById("one-way-content"),
      document.getElementById("others-content"),
      document.getElementById("mobile-content-body")
    ];

    containers.forEach(container => {
      if (container) this.show(container);
    });
  },

  showError(message) {
    const containers = [
      document.getElementById("favicon-wall-content"),
      document.getElementById("friends-backlinks-content"),
      document.getElementById("one-way-content"),
      document.getElementById("others-content"),
      document.getElementById("mobile-content-body")
    ];

    const errorHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-message">${message}</p>
        <button class="error-retry" onclick="location.reload()">Refresh</button>
      </div>
    `;

    containers.forEach(container => {
      if (container) container.innerHTML = errorHTML;
    });
  }
};
