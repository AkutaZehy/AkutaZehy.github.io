document.addEventListener('DOMContentLoaded', () => {
  // 动态生成CSS规则
  const style = document.createElement('style');
  document.head.appendChild(style);
  const sheet = style.sheet;

  // 获取所有的 .wiggling-text span 元素
  const spans = document.querySelectorAll('.wiggling-text span');

  // 根据元素数量生成样式规则
  spans.forEach((span, index) => {
    const duration = 0.15 + Math.sin(index*114514%1919) * 0.03;
    const rule = `.wiggling-text span:nth-child(${index + 1}) { animation-duration: ${duration}s; }`;
    sheet.insertRule(rule, sheet.cssRules.length);
  });

  // 添加点击事件监听器到整个页面
  document.addEventListener('click', () => {
    const wigglingText = document.querySelector('.wiggling-text');
    if (wigglingText) {
      wigglingText.classList.toggle('no-animation');
    }
  });
});