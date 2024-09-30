function welcome (threshold) {
  let num = threshold;
  if (num > 0.99) {
    window.alert("今日もいい天気！");
  } else if (num > 0.9) {
    window.alert("休憩中よ。");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const audio = document.querySelector('audio');
  const num = Math.random();

  let isPlaying = false;
  welcome(num);

  document.addEventListener('click', () => {
    if (!isPlaying && num > 0.8) {
      audio.play();
      isPlaying = true;
      console.log('HELLO');
    }
  });
});