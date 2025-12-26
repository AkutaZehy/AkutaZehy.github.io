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
        <div class="browser-button">Refresh</div>
      </div>
    `;

    // 内容区
    const content = document.createElement("div");
    content.className = "browser-content";
    items.forEach(item => content.appendChild(this.createBrowserLink(item)));

    container.appendChild(addressBar);
    container.appendChild(content);
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
