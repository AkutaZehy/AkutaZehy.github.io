/**
 * Friends Page - 窗口管理系统
 */

const WindowManager = {
  open(windowId) {
    const window = document.getElementById(windowId + "-window");
    if (!window) return;

    if (window.classList.contains("active")) {
      this.activate(window);
      return;
    }

    // 随机位置
    window.style.left = 50 + Math.random() * 200 + "px";
    window.style.top = 50 + Math.random() * 100 + "px";

    window.classList.add("active");
    this.activate(window);
  },

  resetPosition(windowId) {
    const window = document.getElementById(windowId + "-window");
    if (window) {
      window.style.left = 50 + Math.random() * 200 + "px";
      window.style.top = 50 + Math.random() * 100 + "px";
      window.style.transform = "none";
    }
  },

  activate(window) {
    if (State.activeWindow) {
      State.activeWindow.style.zIndex = State.windowZIndex;
    }

    window.style.zIndex = ++State.windowZIndex;
    State.activeWindow = window;
  },

  close(windowId) {
    const window = document.getElementById(windowId + "-window");
    if (window) {
      window.classList.remove("active");

      if (State.activeWindow === window) {
        State.activeWindow = null;
      }
    }
  },

  init() {
    // 文件夹点击事件
    document.querySelectorAll(".folder").forEach((folder) => {
      folder.addEventListener("click", () => {
        const folderId = folder.getAttribute("data-folder");
        const existingWindow = document.getElementById(folderId + "-window");

        if (existingWindow && existingWindow.classList.contains("active")) {
          this.resetPosition(folderId);
          this.activate(existingWindow);
          return;
        }

        this.open(folderId);
      });
    });

    // 关闭按钮
    document.querySelectorAll(".window-control.close").forEach((button) => {
      button.addEventListener("click", () => {
        const window = button.closest(".window");
        const windowId = window.id.replace("-window", "");
        this.close(windowId);
      });
    });

    // 装饰性按钮（最小化/最大化）
    document.querySelectorAll(".window-control.minimize, .window-control.maximize").forEach((button) => {
      button.addEventListener("click", () => {
        // 仅作为装饰，不执行操作
      });
    });

    // 拖拽和调整大小
    document.querySelectorAll(".window-header").forEach((header) => {
      this.initDragAndResize(header);
    });
  },

  initDragAndResize(header) {
    let isDragging = false;
    let isResizing = false;
    let currentX, currentY;
    let initialX, initialY;
    let xOffset = 0, yOffset = 0;
    let initialWidth, initialHeight;
    let initialMouseX, initialMouseY;
    let resizeDirection = "";

    const window = header.closest(".window");
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "window-resize-handle";
    window.appendChild(resizeHandle);

    // 事件处理函数
    const dragStart = (e) => {
      if (e.target.classList.contains("window-control")) return;
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header) {
        isDragging = true;
        this.activate(window);
      }
    };

    const resizeStart = (e) => {
      if (window.classList.contains("maximized")) return;

      isResizing = true;
      initialMouseX = e.clientX;
      initialMouseY = e.clientY;
      initialWidth = window.offsetWidth;
      initialHeight = window.offsetHeight;

      const rect = window.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const edgeThreshold = 10;

      // 确定调整方向
      if (mouseX < edgeThreshold && mouseY < edgeThreshold) resizeDirection = "top-left";
      else if (mouseX > rect.width - edgeThreshold && mouseY < edgeThreshold) resizeDirection = "top-right";
      else if (mouseX < edgeThreshold && mouseY > rect.height - edgeThreshold) resizeDirection = "bottom-left";
      else if (mouseX > rect.width - edgeThreshold && mouseY > rect.height - edgeThreshold) resizeDirection = "bottom-right";
      else if (mouseX < edgeThreshold) resizeDirection = "left";
      else if (mouseX > rect.width - edgeThreshold) resizeDirection = "right";
      else if (mouseY < edgeThreshold) resizeDirection = "top";
      else if (mouseY > rect.height - edgeThreshold) resizeDirection = "bottom";

      this.activate(window);
      e.preventDefault();
    };

    const drag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      window.style.transform = `translate(${currentX}px, ${currentY}px)`;
    };

    const resize = (e) => {
      if (!isResizing || window.classList.contains("maximized")) return;
      e.preventDefault();

      const deltaX = e.clientX - initialMouseX;
      const deltaY = e.clientY - initialMouseY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newLeft = window.offsetLeft;
      let newTop = window.offsetTop;

      // 根据方向计算
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

      // 最小尺寸限制
      if (newWidth >= 300) { window.style.width = newWidth + "px"; }
      if (newHeight >= 200) { window.style.height = newHeight + "px"; }
      if (newLeft !== undefined) { window.style.left = newLeft + "px"; }
      if (newTop !== undefined) { window.style.top = newTop + "px"; }
    };

    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    };

    const resizeEnd = () => {
      isResizing = false;
      resizeDirection = "";
    };

    // 绑定事件
    header.addEventListener("mousedown", dragStart);
    resizeHandle.addEventListener("mousedown", resizeStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mouseup", resizeEnd);
  }
};
