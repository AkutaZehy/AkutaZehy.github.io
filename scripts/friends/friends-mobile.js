/**
 * Friends Page - 移动端管理
 */

const MobileManager = {
  init() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    const closeBtn = document.getElementById("mobile-content-close");

    if (!menuBtn || !menu) return;

    // 打开菜单
    menuBtn.addEventListener("click", () => menu.classList.add("active"));

    // 点击文件夹
    menu.querySelectorAll(".mobile-folder").forEach(folder => {
      folder.addEventListener("click", () => {
        this.openContent(folder.getAttribute("data-folder"));
        menu.classList.remove("active");
      });
    });

    // 关闭内容容器
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        document.getElementById("mobile-content-container").classList.remove("active");
        closeBtn.style.display = "none";
      });
    }
  },

  openContent(folderId) {
    const container = document.getElementById("mobile-content-container");
    const body = document.getElementById("mobile-content-body");
    const title = document.getElementById("mobile-content-title");
    const closeBtn = document.getElementById("mobile-content-close");

    if (!container || !body || !title || !closeBtn) return;

    const titles = {
      "favicon-wall": "Favicon Wall",
      "friends-backlinks": "Friends with backlinks",
      "one-way": "One-way to people I know",
      "others": "Others"
    };

    title.textContent = titles[folderId] || folderId;
    body.innerHTML = "";
    body.className = "mobile-content-body";

    if (!State.linksData) {
      body.innerHTML = '<div class="mobile-placeholder"><p>Loading...</p></div>';
      container.classList.add("active");
      closeBtn.style.display = "flex";
      return;
    }

    // 渲染内容
    const renderers = {
      "favicon-wall": () => this.renderGrid(body, State.linksData.filter(item => item.type === "friends" && item.hasFavicon)),
      "friends-backlinks": () => this.renderGrid(body, State.linksData.filter(item => item.type === "friends" && !item.isOneWay)),
      "one-way": () => this.renderGrid(body, State.linksData.filter(item => item.type === "friends" && item.isOneWay)),
      "others": () => this.renderBrowser(body, State.linksData.filter(item => item.type === "sites"))
    };

    if (renderers[folderId]) {
      renderers[folderId]();
    }

    container.classList.add("active");
    closeBtn.style.display = "flex";
  },

  renderGrid(container, items) {
    if (items.length === 0) {
      container.innerHTML = '<div class="mobile-placeholder"><p>No items</p></div>';
      return;
    }

    const grid = document.createElement("div");
    grid.className = "favicon-grid";

    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "favicon-item tooltip";
      div.setAttribute("data-link", item.url);

      if (item.description) {
        const tooltip = document.createElement("span");
        tooltip.className = "tooltiptext";
        tooltip.textContent = item.description;
        div.appendChild(tooltip);
      }

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

      div.addEventListener("click", () => { if (item.url) window.open(item.url, "_blank"); });
      grid.appendChild(div);
    });

    container.appendChild(grid);
  },

  renderBrowser(container, items) {
    if (items.length === 0) {
      container.innerHTML = '<div class="mobile-placeholder"><p>No items</p></div>';
      return;
    }

    container.classList.add("browser-style");

    const addressBar = document.createElement("div");
    addressBar.className = "browser-header";
    addressBar.innerHTML = `
      <div class="browser-address-bar">file://usr/documents/friends/other_pages/</div>
      <div class="browser-controls">
        <div class="browser-button">Refresh</div>
      </div>
    `;

    const content = document.createElement("div");
    content.className = "browser-content";

    items.forEach(item => {
      const linkContainer = document.createElement("div");
      linkContainer.className = "browser-link-container";

      const link = document.createElement("a");
      link.className = "browser-link";
      link.href = item.url;
      link.target = "_blank";
      link.textContent = item.name;

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
        linkContainer.appendChild(wrapper);
      } else {
        linkContainer.appendChild(link);
      }

      content.appendChild(linkContainer);
    });

    container.appendChild(addressBar);
    container.appendChild(content);
  }
};
