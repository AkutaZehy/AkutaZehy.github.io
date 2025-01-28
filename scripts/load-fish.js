document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('fish-navigate');

  fetch('/pages/template/fish-navigate.html')
    .then(response => response.text())
    .then(data => {
      container.innerHTML = data;
    })
    .catch(error => console.error('Error loading template:', error));
});