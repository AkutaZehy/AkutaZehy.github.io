document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  document.addEventListener("mousemove", (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (
      element &&
      element.textContent.trim().length > 0 &&
      !element.classList.contains("no-select")
    ) {
      body.classList.add("text-hover");
    } else {
      body.classList.remove("text-hover");
    }
  });
});
