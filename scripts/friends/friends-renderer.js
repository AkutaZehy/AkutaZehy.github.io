/**
 * Friends Page - 内容渲染系统
 */

const ContentRenderer = {
  generateAll() {
    if (!State.linksData) return;

    this.generateFaviconWall();
    this.generateFriendsBacklinks();
    this.generateOneWay();
    this.generateOthers();
  },

  generateFaviconWall() {
    const container = document.getElementById("favicon-wall-content");
    if (!container) return;

    container.innerHTML = "";
    State.linksData
      .filter(item => item.type === "friends" && item.hasFavicon)
      .forEach(item => container.appendChild(this.createFaviconItem(item)));
  },

  generateFriendsBacklinks() {
    const container = document.getElementById("friends-backlinks-content");
    if (!container) return;

    container.innerHTML = "";
    State.linksData
      .filter(item => item.type === "friends" && !item.isOneWay)
      .forEach(item => container.appendChild(this.createFaviconItem(item)));
  },

  generateOneWay() {
    const container = document.getElementById("one-way-content");
    if (!container) return;

    container.innerHTML = "";
    State.linksData
      .filter(item => item.type === "friends" && item.isOneWay)
      .forEach(item => container.appendChild(this.createFaviconItem(item)));
  },

  generateOthers() {
    const container = document.getElementById("others-content");
    if (!container) return;

    container.innerHTML = "";
    const items = State.linksData.filter(item => item.type === "sites");

    // 地址栏
    const addressBar = document.createElement("div");
    addressBar.className = "browser-header";
    addressBar.innerHTML = `
      <div class="browser-address-bar">file://usr/documents/friends/other_pages/</div>
      <div class="browser-controls">
        <div class="browser-button" id="others-refresh-btn">Refresh</div>
      </div>
    `;

    // 内容区
    const content = document.createElement("div");
    content.className = "browser-content";
    content.id = "others-browser-content";
    items.forEach(item => content.appendChild(this.createBrowserLink(item)));

    container.appendChild(addressBar);
    container.appendChild(content);

    // 添加刷新功能
    this.initOthersRefresh(content, items);
  },

  initOthersRefresh(contentElement, items) {
    const refreshBtn = document.getElementById("others-refresh-btn");
    if (!refreshBtn) return;

    refreshBtn.addEventListener("click", () => {
      // 置空内容，显示加载状态
      contentElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; color: #808080;">
          <div class="loading-spinner" style="width: 30px; height: 30px; border: 3px solid #e0e0e0; border-top-color: #000080; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px;"></div>
          <span>Refreshing...</span>
        </div>
      `;

      // 随机延迟 0.5-1.5秒
      const delay = 500 + Math.random() * 1000;

      setTimeout(() => {
        // 10% 概率加载失败
        const isError = Math.random() < 0.1;

        if (isError) {
          // 显示 404 错误（删除刷新功能，只显示错误）
          contentElement.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; padding: 40px 20px; color: #808080;">
              <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
              <div style="font-size: 18px; color: #ff0000; margin-bottom: 10px;">404 Not Found</div>
              <div style="font-size: 14px;">The requested page was not found.</div>
            </div>
          `;
        } else {
          // 正常加载
          contentElement.innerHTML = "";
          items.forEach(item => contentElement.appendChild(this.createBrowserLink(item)));
        }
      }, delay);
    });
  },

  createFaviconItem(item) {
    const div = document.createElement("div");
    div.className = "favicon-item tooltip";
    div.setAttribute("data-link", item.url);

    if (item.description) {
      const tooltip = document.createElement("span");
      tooltip.className = "tooltiptext";
      tooltip.textContent = item.description;
      div.appendChild(tooltip);
    }

    // 图片或占位符
    if (item.hasFavicon === true || (item.image && item.image.trim() !== "")) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      div.appendChild(img);
    } else {
      const noImg = document.createElement("div");
      noImg.className = "no-favicon";
      noImg.textContent = "No Image";
      div.appendChild(noImg);
    }

    const span = document.createElement("span");
    span.textContent = item.name;
    div.appendChild(span);

    return div;
  },

  createBrowserLink(item) {
    const container = document.createElement("div");
    container.className = "browser-link-container";

    const link = document.createElement("a");
    link.className = "browser-link";
    link.href = item.url;
    link.target = "_blank";
    link.textContent = item.name;
    link.style.display = "inline-block";

    if (item.description) {
      const wrapper = document.createElement("div");
      wrapper.className = "tooltip";
      wrapper.style.display = "inline-block";
      wrapper.style.position = "relative";

      const tooltip = document.createElement("span");
      tooltip.className = "tooltiptext";
      tooltip.textContent = item.description;

      wrapper.appendChild(tooltip);
      wrapper.appendChild(link);
      container.appendChild(wrapper);
    } else {
      container.appendChild(link);
    }

    return container;
  }
};
