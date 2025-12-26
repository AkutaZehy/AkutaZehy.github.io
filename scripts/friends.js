let activeWindow = null;
let windowZIndex = 100;
let linksData = null;

function loadData() {
  (function () {
    const script = document.createElement("script");
    script.src = "/resources/friends.json";
    script.onload = function () {
      fetch("/resources/friends.json")
        .then((response) => response.json())
        .then((data) => {
          linksData = data;
          // 触发内容生成
          if (typeof generateContent === "function") {
            generateContent();
          }
        })
        .catch((error) => console.error("Error loading JSON:", error));
    };
    document.head.appendChild(script);
  })();
}

function openWindow(windowId) {
  const window = document.getElementById(windowId + "-window");
  if (window) {
    if (window.classList.contains("active")) {
      activateWindow(window);
      return;
    }

    window.style.left = 50 + Math.random() * 200 + "px";
    window.style.top = 50 + Math.random() * 100 + "px";

    window.classList.add("active");

    activateWindow(window);
  }
}

// 重置窗口位置
function resetWindowPosition(windowId) {
  const window = document.getElementById(windowId + "-window");
  if (window) {
    window.style.left = 50 + Math.random() * 200 + "px";
    window.style.top = 50 + Math.random() * 100 + "px";
    window.style.transform = "none";
  }
}

function activateWindow(window) {
  if (activeWindow) {
    activeWindow.style.zIndex = windowZIndex;
  }

  window.style.zIndex = ++windowZIndex;
  activeWindow = window;
}

function closeWindow(windowId) {
  const window = document.getElementById(windowId + "-window");
  if (window) {
    window.classList.remove("active");

    if (activeWindow === window) {
      activeWindow = null;
    }
  }
}

function initWindows() {
  document.querySelectorAll(".folder").forEach((folder) => {
    folder.addEventListener("click", () => {
      const folderId = folder.getAttribute("data-folder");

      // 检查是否已存在该窗口
      const existingWindow = document.getElementById(folderId + "-window");

      if (existingWindow && existingWindow.classList.contains("active")) {
        // 如果窗口已存在且处于活动状态，则重置窗口位置
        resetWindowPosition(folderId);
        activateWindow(existingWindow);
        return;
      }

      // 打开新窗口
      openWindow(folderId);
    });
  });

  document.querySelectorAll(".window-control.close").forEach((button) => {
    button.addEventListener("click", () => {
      const window = button.closest(".window");
      const windowId = window.id.replace("-window", "");
      closeWindow(windowId);
    });
  });

  document.querySelectorAll(".window-control.minimize").forEach((button) => {
    button.addEventListener("click", () => {
      // 最小化功能已移除，仅保留为装饰按钮
      console.log("最小化按钮仅作为装饰，不执行任何操作");
    });
  });

  document.querySelectorAll(".window-control.maximize").forEach((button) => {
    button.addEventListener("click", () => {
      // 最大化功能已移除，仅保留为装饰按钮
      console.log("最大化按钮仅作为装饰，不执行任何操作");
    });
  });

  document.querySelectorAll(".window-header").forEach((header) => {
    let isDragging = false;
    let isResizing = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let initialWidth;
    let initialHeight;
    let initialMouseX;
    let initialMouseY;
    let resizeDirection = "";

    const window = header.closest(".window");

    // 添加调整大小的区域
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "window-resize-handle";
    window.appendChild(resizeHandle);

    header.addEventListener("mousedown", dragStart);
    resizeHandle.addEventListener("mousedown", resizeStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mouseup", resizeEnd);

    function dragStart(e) {
      if (e.target.classList.contains("window-control")) return;

      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header) {
        isDragging = true;
        activateWindow(window);
      }
    }

    function resizeStart(e) {
      if (window.classList.contains("maximized")) return;

      isResizing = true;
      initialMouseX = e.clientX;
      initialMouseY = e.clientY;
      initialWidth = window.offsetWidth;
      initialHeight = window.offsetHeight;

      // 确定调整大小的方向
      const rect = window.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 检查是否在边缘区域
      const edgeThreshold = 10;

      if (mouseX < edgeThreshold && mouseY < edgeThreshold) {
        resizeDirection = "top-left";
      } else if (
        mouseX > rect.width - edgeThreshold &&
        mouseY < edgeThreshold
      ) {
        resizeDirection = "top-right";
      } else if (
        mouseX < edgeThreshold &&
        mouseY > rect.height - edgeThreshold
      ) {
        resizeDirection = "bottom-left";
      } else if (
        mouseX > rect.width - edgeThreshold &&
        mouseY > rect.height - edgeThreshold
      ) {
        resizeDirection = "bottom-right";
      } else if (mouseX < edgeThreshold) {
        resizeDirection = "left";
      } else if (mouseX > rect.width - edgeThreshold) {
        resizeDirection = "right";
      } else if (mouseY < edgeThreshold) {
        resizeDirection = "top";
      } else if (mouseY > rect.height - edgeThreshold) {
        resizeDirection = "bottom";
      }

      activateWindow(window);
      e.preventDefault();
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        window.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    }

    function resize(e) {
      if (!isResizing || window.classList.contains("maximized")) return;

      e.preventDefault();

      const deltaX = e.clientX - initialMouseX;
      const deltaY = e.clientY - initialMouseY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newLeft = window.offsetLeft;
      let newTop = window.offsetTop;

      // 根据调整方向计算新尺寸和位置
      switch (resizeDirection) {
        case "top-left":
          newWidth = initialWidth - deltaX;
          newHeight = initialHeight - deltaY;
          newLeft = initialMouseX + deltaX;
          newTop = initialMouseY + deltaY;
          break;
        case "top-right":
          newWidth = initialWidth + deltaX;
          newHeight = initialHeight - deltaY;
          newTop = initialMouseY + deltaY;
          break;
        case "bottom-left":
          newWidth = initialWidth - deltaX;
          newHeight = initialHeight + deltaY;
          newLeft = initialMouseX + deltaX;
          break;
        case "bottom-right":
          newWidth = initialWidth + deltaX;
          newHeight = initialHeight + deltaY;
          break;
        case "left":
          newWidth = initialWidth - deltaX;
          newLeft = initialMouseX + deltaX;
          break;
        case "right":
          newWidth = initialWidth + deltaX;
          break;
        case "top":
          newHeight = initialHeight - deltaY;
          newTop = initialMouseY + deltaY;
          break;
        case "bottom":
          newHeight = initialHeight + deltaY;
          break;
      }

      // 设置最小尺寸
      const minWidth = 300;
      const minHeight = 200;

      if (newWidth >= minWidth) {
        window.style.width = newWidth + "px";
      }

      if (newHeight >= minHeight) {
        window.style.height = newHeight + "px";
      }

      if (newLeft !== undefined) {
        window.style.left = newLeft + "px";
      }

      if (newTop !== undefined) {
        window.style.top = newTop + "px";
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;

      isDragging = false;
    }

    function resizeEnd(e) {
      isResizing = false;
      resizeDirection = "";
    }
  });
}

function generateContent() {
  if (!linksData) return;

  const faviconWallContent = document.getElementById("favicon-wall-content");
  if (faviconWallContent) {
    faviconWallContent.innerHTML = "";
    linksData
      .filter((item) => item.type === "friends" && item.hasFavicon)
      .forEach((item) => {
        const div = document.createElement("div");
        div.className = "favicon-item tooltip";
        div.setAttribute("data-link", item.url);

        if (item.description) {
          const tooltipText = document.createElement("span");
          tooltipText.className = "tooltiptext";
          tooltipText.textContent = item.description;
          div.appendChild(tooltipText);
        }

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        div.appendChild(img);

        const span = document.createElement("span");
        span.textContent = item.name;
        div.appendChild(span);
        faviconWallContent.appendChild(div);
      });
  }

  const friendsBacklinksContent = document.getElementById(
    "friends-backlinks-content"
  );
  if (friendsBacklinksContent) {
    friendsBacklinksContent.innerHTML = "";
    linksData
      .filter((item) => item.type === "friends" && !item.isOneWay)
      .forEach((item) => {
        const div = document.createElement("div");
        div.className = "favicon-item tooltip";
        div.setAttribute("data-link", item.url);

        if (item.description) {
          const tooltipText = document.createElement("span");
          tooltipText.className = "tooltiptext";
          tooltipText.textContent = item.description;
          div.appendChild(tooltipText);
        }

        if (item.hasFavicon === true) {
          const img = document.createElement("img");
          img.src = item.image;
          img.alt = item.name;
          div.appendChild(img);
        } else if (item.image && item.image.trim() !== "") {
          const img = document.createElement("img");
          img.src = item.image;
          img.alt = item.name;
          div.appendChild(img);
        } else {
          const noFavicon = document.createElement("div");
          noFavicon.className = "no-favicon";
          noFavicon.textContent = "No Image";
          div.appendChild(noFavicon);
        }

        const span = document.createElement("span");
        span.textContent = item.name;
        div.appendChild(span);
        friendsBacklinksContent.appendChild(div);
      });
  }

  const oneWayContent = document.getElementById("one-way-content");
  if (oneWayContent) {
    oneWayContent.innerHTML = "";
    linksData
      .filter((item) => item.type === "friends" && item.isOneWay)
      .forEach((item) => {
        const div = document.createElement("div");
        div.className = "favicon-item tooltip";
        div.setAttribute("data-link", item.url);

        if (item.description) {
          const tooltipText = document.createElement("span");
          tooltipText.className = "tooltiptext";
          tooltipText.textContent = item.description;
          div.appendChild(tooltipText);
        }

        if (item.hasFavicon === true) {
          const img = document.createElement("img");
          img.src = item.image;
          img.alt = item.name;
          div.appendChild(img);
        } else if (item.image && item.image.trim() !== "") {
          const img = document.createElement("img");
          img.src = item.image;
          img.alt = item.name;
          div.appendChild(img);
        } else {
          const noFavicon = document.createElement("div");
          noFavicon.className = "no-favicon";
          noFavicon.textContent = "No Image";
          div.appendChild(noFavicon);
        }

        const span = document.createElement("span");
        span.textContent = item.name;
        div.appendChild(span);
        oneWayContent.appendChild(div);
      });
  }

  const othersContent = document.getElementById("others-content");
  if (othersContent) {
    othersContent.innerHTML = "";
    const othersItems = linksData.filter((item) => item.type === "sites");

    const addressBar = document.createElement("div");
    addressBar.className = "browser-header";
    addressBar.innerHTML = `
      <div class="browser-address-bar">file://usr/documents/friends/other_pages/</div>
      <div class="browser-controls">
        <div class="browser-button">Refresh</div>
      </div>
    `;

    const browserContent = document.createElement("div");
    browserContent.className = "browser-content";

    othersItems.forEach((item) => {
      const linkContainer = document.createElement("div");
      linkContainer.className = "browser-link-container";

      const link = document.createElement("a");
      link.className = "browser-link";
      link.href = item.url;
      link.target = "_blank";
      link.textContent = item.name;
      link.style.display = "inline-block";

      if (item.description) {
        const tooltipWrapper = document.createElement("div");
        tooltipWrapper.className = "tooltip";
        tooltipWrapper.style.display = "inline-block";
        tooltipWrapper.style.position = "relative";

        const tooltipText = document.createElement("span");
        tooltipText.className = "tooltiptext";
        tooltipText.textContent = item.description;
        tooltipWrapper.appendChild(tooltipText);

        tooltipWrapper.appendChild(link);

        linkContainer.appendChild(tooltipWrapper);
      } else {
        linkContainer.appendChild(link);
      }

      browserContent.appendChild(linkContainer);
    });

    othersContent.appendChild(addressBar);
    othersContent.appendChild(browserContent);
  }
}

function initInteractions() {
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".favicon-item");
    if (item) {
      const link = item.getAttribute("data-link");
      if (link) {
        window.open(link, "_blank");
      }
    }
  });

  document.addEventListener("mouseover", (e) => {
    const tooltip = e.target.closest(".tooltip");
    if (tooltip) {
      const tooltipText = tooltip.querySelector(".tooltiptext");
      if (tooltipText) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        tooltipText.style.left = mouseX + "px";
        tooltipText.style.top = mouseY - 40 + "px";
      }
    }
  });

  document.querySelectorAll("tr[data-link]").forEach((row) => {
    row.addEventListener("click", () => {
      const link = row.getAttribute("data-link");
      if (link) {
        window.open(link, "_blank");
      }
    });
  });
}

function randomSite() {
  const links = document.querySelectorAll(
    ".favicon-item[data-link], tr[data-link]"
  );
  const random = Math.floor(Math.random() * links.length);
  const link = links[random].getAttribute("data-link");
  if (link) {
    window.open(link, "_blank");
  }
}

function initDvdPopup() {
  const dvdPopup = document.getElementById("dvd-popup");
  if (!dvdPopup) return;

  let x = Math.random() * (window.innerWidth - 200);
  let y = Math.random() * (window.innerHeight - 50);
  let dx = 0.5 + Math.random() * 0.5;
  let dy = 0.5 + Math.random() * 0.5;
  let isPaused = false;

  dvdPopup.style.left = x + "px";
  dvdPopup.style.top = y + "px";

  function animateDvd() {
    if (dvdPopup.style.display === "none") return;

    if (!isPaused) {
      x += dx;
      y += dy;

      if (x <= 0 || x >= window.innerWidth - 200) {
        dx = -dx;
        const colors = [
          "#0000ff",
          "#ff00ff",
          "#00ffff",
          "#ff0000",
          "#00ff00",
          "#800080",
          "#0080ff",
          "#ff0080",
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        dvdPopup.querySelector(".popup-content").style.backgroundColor =
          randomColor;
      }

      if (y <= 0 || y >= window.innerHeight - 50) {
        dy = -dy;
        const colors = [
          "#0000ff",
          "#ff00ff",
          "#00ffff",
          "#ff0000",
          "#00ff00",
          "#800080",
          "#0080ff",
          "#ff0080",
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        dvdPopup.querySelector(".popup-content").style.backgroundColor =
          randomColor;
      }

      dvdPopup.style.left = x + "px";
      dvdPopup.style.top = y + "px";
    }

    requestAnimationFrame(animateDvd);
  }

  dvdPopup.addEventListener("mouseenter", () => {
    isPaused = true;
  });

  dvdPopup.addEventListener("mouseleave", () => {
    isPaused = false;
  });

  dvdPopup.addEventListener("click", (e) => {
    if (!e.target.classList.contains("popup-close")) randomSite();
  });

  function closePopupHandler() {
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

    isPaused = true;

    document.getElementById("confirm-yes").addEventListener("click", () => {
      document.getElementById("dvd-popup").style.display = "none";
      document.body.removeChild(dialog);
    });

    document.getElementById("confirm-no").addEventListener("click", () => {
      document.body.removeChild(dialog);
      isPaused = false;
    });
  }

  document
    .querySelector(".popup-close")
    .addEventListener("click", closePopupHandler);

  animateDvd();
}

document.addEventListener("DOMContentLoaded", () => {
  initWindows();
  initInteractions();
  initDvdPopup();
  loadData();
});
