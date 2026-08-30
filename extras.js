// Small additions kept separate from the scraped/provisional programme data.
// This file loads after data.js and before app.js.

if (window.SYSPRAC_DATA?.events && typeof E === "function") {
  window.SYSPRAC_DATA.events.push(
    E(
      "d1-dinner",
      "dinner",
      "2026-09-21",
      "19:30",
      "22:00",
      "",
      "",
      "Dinner",
      false,
      "Published programme gives a 19:30 start; 22:00 end time added for calendar purposes."
    )
  );
}

(() => {
  const style = document.createElement("style");
  style.textContent = `
    .update-pixel {
      position: fixed;
      right: 5px;
      bottom: 5px;
      z-index: 9999;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      color: #17202a;
      opacity: .28;
      overflow: hidden;
      text-indent: -9999px;
      box-shadow: 0 0 0 1px rgba(255,255,255,.7);
      transition: opacity .15s ease, transform .15s ease;
    }
    .update-pixel:hover,
    .update-pixel:focus-visible {
      opacity: .9;
      transform: scale(1.7);
      outline: 2px solid #ffbf47;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);

  window.addEventListener("DOMContentLoaded", () => {
    const dot = document.createElement("a");
    dot.className = "update-pixel";
    dot.href = "https://github.com/antlerboy/SYSPRAC26cal/issues/1";
    dot.target = "_blank";
    dot.rel = "noopener";
    dot.title = "Suggest a SysPrac26 schedule update";
    dot.setAttribute("aria-label", "Suggest a SysPrac26 schedule update on GitHub");
    dot.textContent = "Suggest update";
    document.body.appendChild(dot);
  });
})();
