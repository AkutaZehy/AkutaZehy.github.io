document.addEventListener('DOMContentLoaded', () => {
  const icons = document.querySelectorAll('.ico');

  // 初始化每个元素的位置
  icons.forEach(icon => {
    const initialX = Math.random() * (document.documentElement.clientWidth - icon.clientWidth);
    const initialY = Math.random() * (document.documentElement.clientHeight - icon.clientHeight);
    icon.style.left = `${initialX}px`;
    icon.style.top = `${initialY}px`;
    icon.dataset.initialY = initialY; // 保存初始Y位置
  });

  // 添加按钮的点击事件
  const button = document.querySelector('#nuclearButton');
  button.addEventListener('click', () => {
    // 修改页面标题
    document.title = 'LOOK WHAT YOU HAVE DONE!';

    // 给每个元素赋予水平和垂直速度
    icons.forEach(icon => {
      const speedX = Math.random() * 2 + 1; // 随机生成水平速度
      const directionX = Math.random() < 0.5 ? -1 : 1; // 随机生成水平方向
      icon.dataset.speedX = speedX * directionX; // 保存水平速度和方向

      const speedY = Math.random() * 2 + 1; // 随机生成垂直速度
      const directionY = Math.random() < 0.5 ? -1 : 1; // 随机生成垂直方向
      icon.dataset.speedY = speedY * directionY; // 保存垂直速度和方向
    });

    // 横向和纵向运动
    const moveIcons = () => {
      icons.forEach(icon => {
        const currentX = parseFloat(icon.style.left);
        const speedX = parseFloat(icon.dataset.speedX);
        let newX = currentX + speedX;

        const currentY = parseFloat(icon.style.top);
        const speedY = parseFloat(icon.dataset.speedY);
        let newY = currentY + speedY;

        // 检查X方向边界并调整位置
        if (newX < 0) {
          newX = 0;
          icon.dataset.speedX = -speedX; // 反弹
        } else if (newX + icon.clientWidth > document.documentElement.clientWidth) {
          newX = document.documentElement.clientWidth - icon.clientWidth;
          icon.dataset.speedX = -speedX; // 反弹
        }

        // 检查Y方向边界并调整位置
        if (newY < 0) {
          newY = 0;
          icon.dataset.speedY = -speedY; // 反弹
        } else if (newY + icon.clientHeight > document.documentElement.clientHeight) {
          newY = document.documentElement.clientHeight - icon.clientHeight;
          icon.dataset.speedY = -speedY; // 反弹
        }

        icon.style.left = `${newX}px`;
        icon.style.top = `${newY}px`;
      });

      requestAnimationFrame(moveIcons);
    };

    moveIcons();
  });
});