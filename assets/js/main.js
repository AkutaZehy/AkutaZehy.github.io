function welcome() {
  let num = Math.random();
  num > 0.99
    ? window.alert("今日もいい天気！")
    : num > 0.5 && window.alert("休憩中よ。");
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
