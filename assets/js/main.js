function welcome() {
  let num = Math.random();
  num > 0.9
    ? window.alert("休憩中よ。")
    : num > 0.8 && window.alert("今日もいい天気！");
}

function loadCode(filename) {
  fetch(`/assets/${filename}`)
    .then((response) => response.text())
    .then((text) => {
      const codeElement = document.getElementById("code");
      codeElement.textContent = text;
      hljs.highlightBlock(codeElement);
    });
}
