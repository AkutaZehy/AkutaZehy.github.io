function renderMarkdown(filename) {
  // 获取markdown文件内容并渲染到页面
  fetch(`/assets/md/${filename}.md`)
    .then((response) => response.text())
    .then((text) => {
      document.getElementById("content").innerHTML = marked(text);
    });
}
