document.addEventListener('DOMContentLoaded', () => {
  const icons = document.querySelectorAll('.ico');

  // 初始化每个元素的位置
  icons.forEach(icon => {
    const initialX = Math.random() * (window.innerWidth - icon.clientWidth);
    const initialY = Math.random() * (window.innerHeight - icon.clientHeight);
    icon.style.left = `${initialX}px`;
    icon.style.top = `${initialY}px`;
    icon.dataset.initialY = initialY; // 保存初始Y位置
  });

  // 添加按钮的点击事件
  const button = document.querySelector('#nuclearButton');
  button.addEventListener('click', () => {
    // 给每个元素赋予水平速度
    icons.forEach(icon => {
      const speed = Math.random() * 50 - 25; // 随机生成速度
      const direction = Math.random() < 0.5 ? -1 : 1; // 随机生成方向
      icon.dataset.speed = speed * direction; // 保存速度和方向
    });

    // 横向运动
    const moveIcons = () => {
      icons.forEach(icon => {
        const currentX = parseFloat(icon.style.left);
        const speed = parseFloat(icon.dataset.speed);
        const newX = currentX + speed;

        // 到达页面边界后出现在另一边
        if (newX < 0 - icon.clientWidth) {
          icon.style.left = `${window.innerWidth}px`;
        } else if (newX > window.innerWidth) {
          icon.style.left = `${0 - icon.clientWidth}px`;
        } else {
          icon.style.left = `${newX}px`;
        }
      });

      requestAnimationFrame(moveIcons);
    };

    moveIcons();
  });
});