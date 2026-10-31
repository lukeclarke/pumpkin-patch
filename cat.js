(function () {
  var me = document.currentScript;
  var cat = me.getAttribute("data-cat"), line = me.getAttribute("data-line");

  var css = document.createElement("style");
  css.textContent =
    ".cat-gate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px));" +
    "background:color-mix(in oklab,var(--background) 82%,transparent);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:cat-in .35s ease-out}" +
    ".cat-box{width:min(100%,340px);display:flex;flex-direction:column;align-items:center;gap:16px;padding:18px 18px 20px;background:var(--card);border-radius:var(--radius-2xl);text-align:center;animation:cat-pop .5s cubic-bezier(.2,.9,.3,1.3)}" +
    ".cat-box img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--radius-xl);display:block}" +
    ".cat-box p{margin:0;font-size:1.35rem;line-height:1.15;color:var(--primary);text-transform:lowercase;letter-spacing:.04em}" +
    ".cat-box button{font:inherit;font-size:.95rem;color:var(--foreground);background:transparent;border-radius:var(--radius);padding:10px 30px;cursor:pointer}" +
    ".cat-box button:active{transform:scale(.96)}" +
    ".cat-gate.bye{animation:cat-out .3s ease-in forwards}" +
    "@keyframes cat-in{from{opacity:0}}@keyframes cat-out{to{opacity:0}}" +
    "@keyframes cat-pop{from{transform:scale(.7) rotate(-4deg);opacity:0}}" +
    "@media (prefers-reduced-motion:reduce){.cat-gate,.cat-box,.cat-gate.bye{animation-duration:.01s}}";
  document.head.appendChild(css);

  var gate = document.createElement("div");
  gate.className = "cat-gate";
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-label", line);
  gate.innerHTML = '<div class="cat-box neon-border"><img alt="" src="../cats/' + cat + '.jpg">' +
    '<p class="neon-text">' + line + '</p><button type="button" class="neon-border">ok</button></div>';

  function keys(e) {
    e.stopPropagation();
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); close(); }
  }
  function close() {
    if (gate.classList.contains("bye")) return;
    gate.classList.add("bye");
    window.removeEventListener("keydown", keys, true);
    setTimeout(function () { gate.remove(); }, 300);
  }
  gate.addEventListener("click", close);
  window.addEventListener("keydown", keys, true);

  function show() { document.body.appendChild(gate); gate.querySelector("button").focus({ preventScroll: true }); }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
