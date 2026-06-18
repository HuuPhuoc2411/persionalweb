(function () {
  const copyButton = document.querySelector("[data-copy-code]");
  const codeBlock = document.querySelector("[data-code]");

  if (copyButton && codeBlock) {
    copyButton.addEventListener("click", async () => {
      const originalText = copyButton.textContent;

      try {
        await navigator.clipboard.writeText(codeBlock.textContent.trim());
        copyButton.textContent = "Đã copy";
      } catch (error) {
        copyButton.textContent = "Không copy được";
      }

      window.setTimeout(() => {
        copyButton.textContent = originalText;
      }, 1800);
    });
  }

  const lcdLine = document.querySelector("[data-lcd-line]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (lcdLine && !prefersReducedMotion) {
    const lines = [
      "xin chào Việt Nam",
      "nhiệt độ: 25.5 0C",
      "độ ẩm: 68%",
      "VN_LCD sẵn sàng"
    ];
    let index = 0;

    window.setInterval(() => {
      index = (index + 1) % lines.length;
      lcdLine.textContent = lines[index];
    }, 2400);
  }
})();
