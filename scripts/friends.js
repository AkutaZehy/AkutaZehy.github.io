/**
 * Friends Page - 主入口
 */

(function() {
  "use strict";

  // ========================================
  // 初始化
  // ========================================
  document.addEventListener("DOMContentLoaded", () => {
    WindowManager.init();
    InteractionManager.init();
    RandomFeature.init();
    MobileManager.init();
    DataLoader.load();
  });

})();
