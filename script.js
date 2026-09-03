const copyButtons = document.querySelectorAll(".copy-btn");
const toast = document.getElementById("toast");

copyButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const codeId = btn.dataset.copy;
    const codeEl = document.getElementById(codeId);
    if (!codeEl) return;

    const text = codeEl.textContent;

    try {
      await navigator.clipboard.writeText(text);
      showCopied(btn);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showCopied(btn);
    }
  });
});

function showCopied(btn) {
  const copyIcon = btn.querySelector(".icon-copy");
  const checkIcon = btn.querySelector(".icon-check");

  btn.classList.add("copied");
  copyIcon.hidden = true;
  checkIcon.hidden = false;
  toast.hidden = false;
  toast.classList.add("show");

  setTimeout(() => {
    btn.classList.remove("copied");
    copyIcon.hidden = false;
    checkIcon.hidden = true;
    toast.classList.remove("show");
    toast.hidden = true;
  }, 2000);
}
