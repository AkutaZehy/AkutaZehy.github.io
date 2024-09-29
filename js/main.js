function welcome() {
  let num = Math.random();
  num > 0.99
    ? window.alert("今日もいい天気！")
    : num > 0.9 && window.alert("休憩中よ。");
}