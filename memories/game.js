(function () {
  "use strict";

  var MAX_PAIRS = 12;
  var MIN_PAIRS = 3;
  var FLIP_BACK = 800;

  var $ = function (id) { return document.getElementById(id); };
  var intro = $("intro"), game = $("game"), win = $("win");
  var board = $("board"), movesEl = $("moves"), timeEl = $("time");
  var fan = $("fan"), scoreEl = $("score"), muteBtn = $("mute");
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  // photos
  function photoList() {
    var src = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];
    var seen = {}, out = [];
    src.forEach(function (p) {
      if (typeof p === "string" && p && !seen[p]) { seen[p] = 1; out.push(p); }
    });
    out = out.slice(0, MAX_PAIRS);
    while (out.length < MIN_PAIRS) out.push(null);
    return out;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  // sound
  var audio = null, muted = !!store("memories-muted");
  function setMute(m) {
    muted = m;
    muteBtn.setAttribute("aria-pressed", m ? "true" : "false");
    store("memories-muted", m);
  }
  setMute(muted);
  function initAudio() {
    if (audio) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audio = new AC();
    } catch (e) { audio = null; }
  }
  function tone(freq, start, dur, type, vol, slideTo) {
    if (!audio || muted) return;
    try {
      if (audio.state === "suspended") audio.resume();
      var t = audio.currentTime + start;
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(audio.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  var sfx = {
    flip: function () { tone(620, 0, 0.09, "triangle", 0.08, 340); },
    match: function () { tone(523, 0, 0.18, "sine", 0.12); tone(784, 0.09, 0.28, "sine", 0.1); },
    miss: function () { tone(180, 0, 0.22, "triangle", 0.09, 120); },
    win: function () {
      [440, 523, 659, 880, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.4, "sine", 0.09); });
    }
  };
  document.addEventListener("pointerdown", initAudio, { once: true });
  document.addEventListener("keydown", initAudio, { once: true });

  // card backs
  var GRASS = "M0 80V74q3-6 5 0q3-7 5 0q2-5 5 0q3-7 5 0q3-6 5 0q2-7 5 0q3-5 5 0q3-7 5 0q2-6 5 0q3-7 5 0q3-5 5 0q2-6 5 0V80Z";
  var BACKS = [
    '<path class="stone" d="M8 76V30a22 22 0 0 1 44 0v46Z"/><path class="etch" d="M30 20v18M23 27h14M18 50h24M21 57h18"/>',
    '<path class="stone" d="M12 76V42h12V30h-8v-9h8V10h12v11h8v9h-8v12h12v34Z"/><path class="etch" d="M18 54h24M21 61h18"/>',
    '<path class="stone" d="M6 76V27L30 9l24 18v49Z"/><path class="door" d="M18 76V46a12 12 0 0 1 24 0v30Z"/><path class="etch" d="M30 34v42"/><circle class="glow" cx="34" cy="60" r="1.6"/><circle class="glow" cx="26" cy="60" r="1.6"/>'
  ];
  function backSVG(i) {
    return '<svg viewBox="0 0 60 80" aria-hidden="true">' + BACKS[i % BACKS.length] + '<path class="grass" d="' + GRASS + '"/></svg>';
  }

  // state
  var deck, cards = [], cols = 4, first = null, lock = false;
  var moves = 0, matched = 0, pairs = 0, t0 = 0, tick = null, photos = [];

  function picHTML(src, n) {
    return src ? '<img alt="" draggable="false" src="' + src + '"><span class="num">' + n + "</span>"
               : '<span class="num">' + n + "</span>";
  }

  function deal() {
    clearInterval(tick); tick = null; t0 = 0;
    first = null; lock = false; moves = 0; matched = 0;
    movesEl.textContent = "0"; timeEl.textContent = "0:00";
    photos = photoList();
    pairs = photos.length;
    var ids = [];
    for (var p = 0; p < pairs; p++) ids.push(p, p);
    shuffle(ids);

    board.classList.remove("cheer");
    board.innerHTML = "";
    deck = document.createElement("div");
    deck.className = "deck";
    cards = ids.map(function (id, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "card";
      b.dataset.pair = id;
      b.dataset.index = i;
      b.style.setProperty("--i", i);
      b.tabIndex = i === 0 ? 0 : -1;
      b.setAttribute("aria-label", "Card " + (i + 1));
      b.innerHTML = '<span class="inner"><span class="face back">' + backSVG(i) +
        '</span><span class="face front"><span class="pic' + (photos[id] ? "" : " noimg") + '">' +
        picHTML(photos[id], id + 1) + "</span></span></span>";
      var img = b.querySelector("img");
      if (img) img.addEventListener("error", function () { img.parentNode.classList.add("noimg"); });
      b.addEventListener("click", function () { flip(b); });
      deck.appendChild(b);
      return b;
    });
    board.appendChild(deck);
    layout();
  }

  function layout() {
    if (!cards.length || game.hidden) return;
    var W = board.clientWidth, H = board.clientHeight, n = cards.length;
    var gap = W < 500 ? 8 : 12, best = null;
    for (var c = 2; c <= n; c++) {
      var r = Math.ceil(n / c);
      var cw = Math.min((W - gap * (c - 1)) / c, ((H - gap * (r - 1)) / r) * 0.75);
      var score = cw * (r * c === n ? 1 : 0.9);
      if (!best || score > best.score) best = { c: c, cw: cw, score: score };
    }
    cols = best.c;
    var cw2 = Math.max(30, Math.min(best.cw, 150));
    deck.style.setProperty("--gap", gap + "px");
    deck.style.setProperty("--cw", cw2 + "px");
    deck.style.setProperty("--ch", cw2 / 0.75 + "px");
    deck.style.setProperty("--dw", cw2 * cols + gap * (cols - 1) + 1 + "px");
  }
  window.addEventListener("resize", layout);

  function startClock() {
    if (tick) return;
    t0 = Date.now();
    tick = setInterval(function () { timeEl.textContent = fmt(Date.now() - t0); }, 250);
  }

  function flip(card) {
    if (lock || card.classList.contains("up")) return;
    initAudio();
    startClock();
    card.classList.add("up");
    sfx.flip();
    if (!first) { first = card; return; }
    var a = first, b = card;
    first = null;
    moves++;
    movesEl.textContent = moves;
    if (a.dataset.pair === b.dataset.pair) {
      setTimeout(function () {
        a.classList.add("matched"); b.classList.add("matched");
        a.setAttribute("aria-label", "Matched"); b.setAttribute("aria-label", "Matched");
        sfx.match();
        burst(a); burst(b);
      }, 280);
      matched++;
      if (matched === pairs) finish();
    } else {
      lock = true;
      setTimeout(function () { a.classList.add("miss"); b.classList.add("miss"); sfx.miss(); }, 420);
      setTimeout(function () {
        a.classList.remove("up", "miss"); b.classList.remove("up", "miss");
        lock = false;
      }, FLIP_BACK + 300);
    }
  }

  var puffLayer = document.createElement("div");
  puffLayer.className = "puffs";
  document.body.appendChild(puffLayer);

  function burst(el, count) {
    if (reduced) return;
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    count = count || 9;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "puff";
      var ang = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      var dist = r.width * (0.55 + Math.random() * 0.5);
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist - 20 + "px");
      p.style.setProperty("--s", (0.7 + Math.random() * 0.6).toFixed(2));
      p.style.animationDelay = Math.random() * 120 + "ms";
      puffLayer.appendChild(p);
      p.addEventListener("animationend", function () { this.remove(); });
    }
  }

  function finish() {
    clearInterval(tick); tick = null;
    var ms = t0 ? Date.now() - t0 : 0;
    timeEl.textContent = fmt(ms);
    lock = true;

    var key = "memories-best-" + pairs;
    var prev = store(key) || {};
    var best = {
      moves: prev.moves ? Math.min(prev.moves, moves) : moves,
      ms: prev.ms ? Math.min(prev.ms, ms) : ms
    };
    store(key, best);
    var line = moves + " moves · " + fmt(ms);
    if (prev.moves) line += "  —  best " + best.moves + " · " + fmt(best.ms);
    scoreEl.textContent = line;

    setTimeout(function () {
      sfx.win();
      board.classList.add("cheer");
      cards.forEach(function (c, i) { if (i % 3 === 0) setTimeout(function () { burst(c, 6); }, i * 45); });
    }, 700);
    setTimeout(showWin, reduced ? 900 : 1900);
  }

  function showWin() {
    game.hidden = true;
    win.hidden = false;
    fan.classList.remove("open");
    fan.innerHTML = "";
    var n = photos.length;
    var W = fan.clientWidth || 320;
    var pw = Math.min(180, W * 0.36, (fan.clientHeight || 300) * 0.7);
    var h = pw * 1.17, pivot = h * 1.7;
    var maxHalf = Math.asin(Math.max(0, Math.min(1, (W / 2 - pw / 2) / pivot))) * 180 / Math.PI;
    var spread = Math.min(n * 13, 110, maxHalf * 2);
    photos.forEach(function (src, i) {
      var d = document.createElement("div");
      d.className = "pol" + (src ? "" : " noimg");
      var a = n > 1 ? -spread / 2 + (spread * i) / (n - 1) : 0;
      d.style.setProperty("--a", a.toFixed(1) + "deg");
      d.style.setProperty("--i", i);
      d.style.setProperty("--pw", pw + "px");
      d.innerHTML = picHTML(src, i + 1);
      var img = d.querySelector("img");
      if (img) img.addEventListener("error", function () { d.classList.add("noimg"); });
      fan.appendChild(d);
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fan.classList.add("open"); });
    });
    if (usingKeys) $("again").focus({ preventScroll: true });
  }

  // keyboard: arrows move between cards
  board.addEventListener("keydown", function (e) {
    var i = cards.indexOf(document.activeElement);
    if (i < 0) return;
    var j = i;
    if (e.key === "ArrowRight") j = i + 1;
    else if (e.key === "ArrowLeft") j = i - 1;
    else if (e.key === "ArrowDown") j = i + cols;
    else if (e.key === "ArrowUp") j = i - cols;
    else return;
    e.preventDefault();
    if (j < 0 || j >= cards.length) return;
    cards[i].tabIndex = -1;
    cards[j].tabIndex = 0;
    cards[j].focus();
  });
  board.addEventListener("focusin", function (e) {
    var i = cards.indexOf(e.target);
    if (i < 0) return;
    cards.forEach(function (c, k) { c.tabIndex = k === i ? 0 : -1; });
  });

  var usingKeys = false;
  document.addEventListener("keydown", function () { usingKeys = true; });
  document.addEventListener("pointerdown", function () { usingKeys = false; });

  function play() {
    intro.hidden = true;
    win.hidden = true;
    game.hidden = false;
    deal();
    if (usingKeys) cards[0].focus({ preventScroll: true });
  }

  $("start").addEventListener("click", play);
  $("again").addEventListener("click", play);
  $("restart").addEventListener("click", function () { deal(); if (usingKeys) cards[0].focus({ preventScroll: true }); });
  muteBtn.addEventListener("click", function () { setMute(!muted); if (!muted) { initAudio(); sfx.flip(); } });

})();
