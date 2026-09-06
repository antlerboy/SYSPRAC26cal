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
  style.textContent = `.update-pixel{position:fixed;right:0;bottom:0;width:44px;height:44px;z-index:99999;background:transparent;border:0}.update-pixel::after{content:"";position:absolute;right:8px;bottom:8px;width:5px;height:5px;border-radius:50%;background:#777;box-shadow:0 0 0 1px #fff}.update-pixel:focus-visible{outline:3px solid #ffbf47;outline-offset:-3px}.update-pixel{font-size:0;color:transparent;text-indent:-9999px}`;
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
