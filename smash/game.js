(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CLASSIC = ["danger", "charm", "mystery", "brains", "brawn", "chaos"];
  var ROMANCE = ["toxic", "loyal", "dramatic", "clingy", "mysterious", "fun"];
  var VERDICTS = {
    danger: "you like them a little bit murdery.",
    charm: "a smooth talker could get away with anything. literally.",
    mystery: "you want someone you'll never fully figure out.",
    brains: "big brain energy is your love language.",
    brawn: "you want someone who can carry you. and a coffin.",
    chaos: "you're here for the plot twists, not the peace.",
    toxic: "red flags look like party decorations to you.",
    loyal: "you want someone who'd haunt only you.",
    dramatic: "you want a cape, a monologue and a thunderstorm.",
    clingy: "you like being followed. literally.",
    mysterious: "the less they say, the harder you fall.",
    fun: "you just want someone to scream-laugh with."
  };
  var PLEADS = ["wait", "are you sure?", "angel pls", "i made you a whole website", "i'll share my candy", "think of the pumpkins"];
  var TAUNTS = ["too slow", "nope", "hehe", "nice try", "smash is right there", "not today", "so close"];
  var SMASH_TEASE = ["ooh, eager?", "make me work for it"];

  var chars = (window.CHARACTERS || []).slice();
  var lavCard = window.LAV_CARD || { img: "characters/lav.jpg" };

  var deck, idx, smashed, passed, busy, lav;
  var topEl = null, nextEl = null;

  var stack = $("stack"), bubble = $("bubble");
  var passBtn = $("passBtn"), smashBtn = $("smashBtn");

  // sounds
  var audio = null, muted = false;
  try { muted = localStorage.getItem("smash-muted") === "1"; } catch (e) {}
  $("muteBtn").setAttribute("aria-pressed", String(muted));

  function initAudio() {
    if (audio) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { audio = new AC(); } catch (e) { audio = null; }
  }
  function tone(freq, start, dur, type, vol, endFreq) {
    var t = audio.currentTime + start;
    var o = audio.createOscillator(), g = audio.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audio.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function play(kind) {
    if (muted || !audio) return;
    if (audio.state === "suspended") audio.resume();
    if (kind === "swoosh") {
      var len = Math.floor(audio.sampleRate * 0.28);
      var buf = audio.createBuffer(1, len, audio.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
      src.buffer = buf; f.type = "bandpass"; f.Q.value = 1.2;
      var t = audio.currentTime;
      f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.25);
      g.gain.setValueAtTime(0.25, t);
      src.connect(f).connect(g).connect(audio.destination);
      src.start();
    } else if (kind === "stamp") {
      tone(140, 0, 0.16, "sine", 0.35, 50);
    } else if (kind === "boing") {
      tone(300, 0, 0.18, "triangle", 0.15, 700);
    } else if (kind === "yay") {
      [523, 659, 784, 1047].forEach(function (n, i) { tone(n, i * 0.09, 0.3, "triangle", 0.16); });
    } else if (kind === "sad") {
      [392, 370, 349, 262].forEach(function (n, i) { tone(n, i * 0.32, 0.45, "sawtooth", 0.06); });
    }
  }
  document.addEventListener("pointerdown", initAudio, { once: true });
  document.addEventListener("keydown", initAudio, { once: true });
  $("muteBtn").addEventListener("click", function () {
    muted = !muted;
    this.setAttribute("aria-pressed", String(muted));
    try { localStorage.setItem("smash-muted", muted ? "1" : "0"); } catch (e) {}
  });

  // helpers
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function show(id) {
    ["intro", "play", "results"].forEach(function (s) { $(s).hidden = s !== id; });
    window.scrollTo(0, 0);
  }

  var bubbleTimer;
  function say(text, ms) {
    if (!text) return;
    bubble.textContent = text;
    bubble.classList.remove("show");
    void bubble.offsetWidth;
    bubble.classList.add("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.classList.remove("show"); }, ms || 2000);
  }

  function makeCard(item) {
    var el = document.createElement("div");
    el.className = "card" + (item.isLav ? " lav" : "");
    var face = document.createElement("div");
    face.className = "face";
    var img = document.createElement("img");
    img.src = item.img; img.alt = ""; img.draggable = false;
    var s = document.createElement("div"); s.className = "stamp smash"; s.textContent = "Smash";
    var p = document.createElement("div"); p.className = "stamp pass"; p.textContent = "Pass";
    face.appendChild(img); face.appendChild(s); face.appendChild(p);
    el.appendChild(face);
    el._item = item;
    return el;
  }

  function current() { return deck[idx]; }
  function isLavNow() { return !!(current() && current().isLav); }

  function updateProgress() {
    var n = Math.min(idx + 1, deck.length);
    $("progText").textContent = n + " / " + deck.length;
    $("progFill").style.width = (idx / deck.length * 100) + "%";
  }

  function setupStack() {
    stack.innerHTML = "";
    topEl = deck[idx] ? makeCard(deck[idx]) : null;
    nextEl = deck[idx + 1] ? makeCard(deck[idx + 1]) : null;
    if (nextEl) { nextEl.classList.add("next"); stack.appendChild(nextEl); }
    if (topEl) { topEl.classList.add("top"); stack.appendChild(topEl); bindDrag(topEl); }
    updateProgress();
  }

  function advance() {
    if (topEl) topEl.remove();
    idx++;
    topEl = nextEl;
    nextEl = deck[idx + 1] ? makeCard(deck[idx + 1]) : null;
    if (nextEl) { nextEl.classList.add("next"); stack.insertBefore(nextEl, stack.firstChild); }
    if (topEl) {
      topEl.style.transform = "";
      topEl.classList.add("promote");
      topEl.classList.remove("next");
      topEl.classList.add("top");
      setTimeout(function (el) { el.classList.remove("promote"); }.bind(null, topEl), 320);
      bindDrag(topEl);
    }
    updateProgress();
  }

  function setLean(el, ratio) {
    el.style.setProperty("--s", Math.max(0, ratio).toFixed(3));
    el.style.setProperty("--p", Math.max(0, -ratio).toFixed(3));
    if (nextEl) {
      var a = Math.min(1, Math.abs(ratio));
      nextEl.style.transform = "translateY(" + (16 - 16 * a) + "px) scale(" + (0.93 + 0.07 * a) + ")";
    }
  }

  function springBack(el, shake) {
    el.style.transition = "transform .45s cubic-bezier(.2,1.4,.4,1)";
    el.style.transform = "";
    setLean(el, 0);
    if (nextEl) nextEl.style.transform = "";
    if (shake) {
      var f = el.querySelector(".face");
      f.classList.remove("nope"); void f.offsetWidth; f.classList.add("nope");
    }
  }

  function fling(el, dir, dy, slow) {
    var w = window.innerWidth;
    var dur = reduced ? 0.2 : (slow ? 0.9 : 0.38);
    el.style.transition = "transform " + dur + "s ease-in, opacity " + dur + "s ease-in";
    if (reduced) {
      el.style.opacity = "0";
    } else {
      el.style.transform = "translate(" + (dir * w * 1.25) + "px," + ((dy || 0) + 60) + "px) rotate(" + (dir * 32) + "deg)";
    }
    return dur * 1000;
  }

  // dragging
  var threshold = function () { return Math.min(130, (topEl ? topEl.offsetWidth : 300) * 0.32); };

  function bindDrag(el) {
    var startX = 0, startY = 0, dx = 0, dy = 0, raw = 0, lastX = 0, lastT = 0, vx = 0, active = false, id = null;

    el.addEventListener("pointerdown", function (e) {
      if (busy || el !== topEl || e.button > 0) return;
      active = true; id = e.pointerId;
      try { el.setPointerCapture(id); } catch (err) {}
      startX = lastX = e.clientX; startY = e.clientY; lastT = performance.now(); vx = 0; dx = dy = raw = 0;
      el.style.transition = "none";
    });
    el.addEventListener("pointermove", function (e) {
      if (!active || e.pointerId !== id) return;
      raw = e.clientX - startX;
      dy = (e.clientY - startY) * 0.4;
      var now = performance.now();
      vx = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
      dx = raw;
      if (el._item.isLav && raw < 0) dx = -44 * (1 - Math.exp(raw / 90));
      el.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + (dx * 0.07) + "deg)";
      setLean(el, dx / threshold());
    });
    function end(e) {
      if (!active || e.pointerId !== id) return;
      active = false;
      var t = threshold();
      var right = raw > t || (raw > 40 && vx > 0.7);
      var left = raw < -t || (raw < -40 && vx < -0.7);
      if (el._item.isLav) {
        if (left || raw < -60) { springBack(el, true); lavPass("swipe"); return; }
        if (right) { lavSmash("swipe", dx, dy); return; }
        springBack(el);
        return;
      }
      if (right) commit("smash", dy);
      else if (left) commit("pass", dy);
      else springBack(el);
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", function (e) { if (active) { active = false; springBack(el); } });
  }

  function commit(choice, dy) {
    if (busy || !topEl) return;
    busy = true;
    var el = topEl, dir = choice === "smash" ? 1 : -1;
    (choice === "smash" ? smashed : passed).push(current());
    setLean(el, dir);
    play("stamp");
    setTimeout(function () {
      play("swoosh");
      var ms = fling(el, dir, dy);
      setTimeout(function () {
        busy = false;
        advance();
        if (idx >= deck.length) toResults();
      }, ms * 0.8);
    }, dy === undefined ? 160 : 0);
  }

  function decide(choice, via) {
    if (!topEl) return;
    if (isLavNow()) {
      if (choice === "pass") { springBack(topEl, via !== "button"); lavPass(via); }
      else lavSmash(via);
      return;
    }
    commit(choice);
  }

  passBtn.addEventListener("click", function () {
    if (lav.ignoreClick) { lav.ignoreClick = false; return; }
    decide("pass", "button");
  });
  smashBtn.addEventListener("click", function () {
    if (lav.zooming) return;
    decide("smash", "button");
  });
  document.addEventListener("keydown", function (e) {
    if ($("play").hidden || busy) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); decide("pass", "key"); }
    else if (e.key === "ArrowRight") { e.preventDefault(); decide("smash", "key"); }
  });

  // loose buttons
  function loosen(btn) {
    if (btn.classList.contains("loose")) return;
    var r = btn.getBoundingClientRect();
    btn.style.width = r.width + "px";
    btn.style.left = r.left + "px";
    btn.style.top = r.top + "px";
    btn.classList.add("loose");
    void btn.offsetWidth;
  }
  function moveTo(btn, x, y) {
    loosen(btn);
    var w = btn.offsetWidth, h = btn.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    x = Math.max(8, Math.min(vw - w - 8, x));
    y = Math.max(8, Math.min(vh - h - 8, y));
    btn.style.left = x + "px";
    btn.style.top = y + "px";
  }
  function overlaps(btn, x, y, r) {
    var other = (btn === passBtn ? smashBtn : passBtn).getBoundingClientRect();
    return x < other.right + 12 && x + r.width > other.left - 12 && y < other.bottom + 12 && y + r.height > other.top - 12;
  }
  function moveRandom(btn) {
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var r = btn.getBoundingClientRect(), x, y, tries = 0;
    do {
      x = rand(8, vw - r.width - 8); y = rand(50, vh - r.height - 8); tries++;
    } while (tries < 20 && (Math.hypot(x - r.left, y - r.top) < Math.min(vw, vh) * 0.35 || overlaps(btn, x, y, r)));
    moveTo(btn, x, y);
  }
  function hop(btn, far) {
    var r = btn.getBoundingClientRect();
    var ang = rand(Math.PI * 1.05, Math.PI * 1.95);
    var dist = far ? rand(130, 200) : rand(70, 120);
    var x = r.left + Math.cos(ang) * dist * (Math.random() < 0.5 ? -1 : 1);
    var y = r.top + Math.sin(ang) * dist;
    moveTo(btn, x, y);
    play("boing");
  }
  function settle(btn) {
    btn.classList.remove("loose", "fast");
    btn.style.left = btn.style.top = btn.style.width = "";
  }

  // the last card
  function lavPass(via) {
    if (lav.done) return;
    if (lav.flying) {
      if (via === "button") return heartbreak();
      say("catch the button. if you can.");
      return;
    }
    lav.passTries++;
    var t = lav.passTries;
    if (t <= 2) { hop(passBtn, false); return; }
    if (t - 3 < PLEADS.length) {
      say(PLEADS[t - 3]);
      hop(passBtn, true);
      return;
    }
    say("fine. catch me then", 2400);
    startFlying();
  }

  function startFlying() {
    lav.flying = true;
    passBtn.classList.add("fast");
    moveRandom(passBtn);
    lav.flyTimer = setInterval(function () { moveRandom(passBtn); }, reduced ? 1100 : 560);
  }
  function stopFlying() {
    lav.flying = false;
    clearInterval(lav.flyTimer);
  }
  passBtn.addEventListener("pointerenter", function (e) {
    if (lav.flying && e.pointerType === "mouse") { moveRandom(passBtn); if (Math.random() < 0.3) say(TAUNTS[Math.floor(Math.random() * TAUNTS.length)], 1200); }
  });
  passBtn.addEventListener("pointerdown", function (e) {
    if (!lav.flying) return;
    if (Math.random() < 0.6) {
      lav.ignoreClick = true;
      moveRandom(passBtn);
      say(TAUNTS[Math.floor(Math.random() * TAUNTS.length)], 1200);
    } else {
      lav.ignoreClick = false;
    }
  });

  function lavSmash(via, dx, dy) {
    if (lav.done || lav.zooming) return;
    if (lav.smashTries < SMASH_TEASE.length) {
      say(SMASH_TEASE[lav.smashTries]);
      lav.smashTries++;
      springBack(topEl);
      zoomSmash();
      return;
    }
    celebrate();
  }

  function zoomSmash() {
    lav.zooming = true;
    var n = 0, hops = reduced ? 1 : 3;
    (function step() {
      if (n++ < hops) { moveRandom(smashBtn); play("boing"); setTimeout(step, 300); }
      else { settle(smashBtn); setTimeout(function () { lav.zooming = false; }, 280); }
    })();
  }

  function finishLav() {
    lav.done = true;
    busy = true;
    stopFlying();
    settle(passBtn); settle(smashBtn);
    clearTimeout(bubbleTimer); bubble.classList.remove("show");
    $("progFill").style.width = "100%";
  }

  function celebrate() {
    finishLav();
    smashed.push(current());
    setLean(topEl, 1);
    topEl.classList.add("chosen");
    play("stamp");
    setTimeout(function () { play("yay"); }, 200);
    confetti();
    setTimeout(function () {
      openMoment(false, "Smash", "correct answer.");
    }, reduced ? 100 : 700);
  }

  function heartbreak() {
    finishLav();
    passed.push(current());
    setLean(topEl, -1);
    topEl.classList.add("broken");
    play("sad");
    setTimeout(function () { fling(topEl, -1, 0, true); }, 500);
    setTimeout(function () { openMoment(true, "wow.", "okay. that's fine. i'm fine."); }, reduced ? 200 : 1000);
  }

  var HEART = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<path class="heart-l" d="M50 88 C30 72 8 58 8 34 C8 20 20 10 32 10 C40 10 46 14 50 22 L44 36 L54 48 L46 62 Z" fill="var(--destructive)"/>' +
    '<path class="heart-r" d="M50 88 C70 72 92 58 92 34 C92 20 80 10 68 10 C60 10 54 14 50 22 L44 36 L54 48 L46 62 Z" fill="var(--destructive)"/></svg>';

  function openMoment(sad, big, line) {
    var m = $("moment");
    m.classList.toggle("sad", sad);
    $("momentArt").innerHTML = sad ? HEART : "";
    $("momentBig").textContent = big;
    $("momentLine").textContent = line;
    m.hidden = false;
  }
  $("momentBtn").addEventListener("click", function () {
    $("moment").hidden = true;
    toResults();
  });

  // confetti
  var fx = $("fx"), ctx = fx.getContext("2d"), parts = [], raf = 0;
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function confetti() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = window.innerWidth, H = window.innerHeight;
    fx.width = W * dpr; fx.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = [cssVar("--primary"), cssVar("--accent"), cssVar("--spook"), cssVar("--destructive")];
    var count = reduced ? 30 : 140;
    parts = [];
    for (var i = 0; i < count; i++) {
      var burst = i % 2 === 0;
      parts.push({
        x: burst ? W / 2 : rand(0, W),
        y: burst ? H * 0.45 : rand(-H * 0.6, -10),
        vx: burst ? rand(-7, 7) : rand(-1, 1),
        vy: burst ? rand(-13, -3) : rand(1, 3),
        r: rand(0, Math.PI * 2), vr: rand(-0.15, 0.15),
        size: rand(9, 18),
        kind: Math.random() < 0.5 ? "pumpkin" : "heart",
        color: cols[Math.floor(Math.random() * cols.length)],
        stem: cols[1], pump: cols[0]
      });
    }
    var start = performance.now();
    cancelAnimationFrame(raf);
    (function frame(now) {
      var t = now - start;
      ctx.clearRect(0, 0, W, H);
      var alpha = t > 3500 ? Math.max(0, 1 - (t - 3500) / 1200) : 1;
      ctx.globalAlpha = alpha;
      parts.forEach(function (p) {
        if (!reduced) { p.vy += 0.22; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; }
        else { p.y += 2; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        if (p.kind === "heart") drawHeart(p.size, p.color); else drawPumpkin(p.size, p.pump, p.stem);
        ctx.restore();
      });
      if (alpha > 0) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    })(start);
  }
  function drawHeart(s, c) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.4, -s * 0.8, 0, -s * 0.3);
    ctx.bezierCurveTo(s * 0.4, -s * 0.8, s * 0.9, -s * 0.2, 0, s * 0.35);
    ctx.fill();
  }
  function drawPumpkin(s, c, stem) {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(-s * 0.22, 0, s * 0.3, s * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.22, 0, s * 0.3, s * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.3, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = stem;
    ctx.fillRect(-s * 0.05, -s * 0.58, s * 0.1, s * 0.2);
  }

  // results
  function toResults() {
    busy = true;
    var sRow = $("smashRow"), pRow = $("passRow");
    fillRow(sRow, smashed); fillRow(pRow, passed);
    $("smashCount").textContent = smashed.length;
    $("passCount").textContent = passed.length;

    var picks = smashed.filter(function (c) { return !c.isLav && c.traits; });
    avg = {};
    CLASSIC.concat(ROMANCE).forEach(function (k) {
      var sum = 0;
      picks.forEach(function (c) { sum += +c.traits[k] || 0; });
      avg[k] = picks.length ? sum / picks.length : 0;
    });
    var top = null;
    CLASSIC.concat(ROMANCE).forEach(function (k) { if (top === null || avg[k] > avg[top]) top = k; });
    $("verdict").textContent = picks.length ? VERDICTS[top] : "only one ghoul for you. good answer.";
    setTab("classic");
    show("results");
  }
  function fillRow(row, list) {
    row.innerHTML = "";
    if (!list.length) {
      var n = document.createElement("span"); n.className = "none"; n.textContent = "nobody";
      row.appendChild(n); return;
    }
    list.forEach(function (c, i) {
      var img = document.createElement("img");
      img.src = c.img; img.alt = ""; img.loading = "lazy";
      img.style.animationDelay = (i * 45) + "ms";
      if (c.isLav) img.className = "is-lav";
      row.appendChild(img);
    });
  }

  var avg = {};
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(name, attrs, text) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function drawRadar(keys, cls) {
    var svg = $("radar");
    svg.innerHTML = "";
    var cx = 170, cy = 150, R = 96, n = keys.length;
    var pt = function (i, r) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    for (var ring = 1; ring <= 4; ring++) {
      var pts = [];
      for (var i = 0; i < n; i++) pts.push(pt(i, R * ring / 4).join(","));
      svg.appendChild(el("polygon", { "class": "ring", points: pts.join(" ") }));
    }
    for (i = 0; i < n; i++) {
      var p = pt(i, R);
      svg.appendChild(el("line", { "class": "axis", x1: cx, y1: cy, x2: p[0], y2: p[1] }));
    }
    var shape = [];
    for (i = 0; i < n; i++) shape.push(pt(i, R * Math.max(0.03, avg[keys[i]] / 10)).join(","));
    svg.appendChild(el("polygon", { "class": "shape " + cls, points: shape.join(" ") }));
    for (i = 0; i < n; i++) {
      var d = pt(i, R * Math.max(0.03, avg[keys[i]] / 10));
      svg.appendChild(el("circle", { "class": "dot", cx: d[0], cy: d[1], r: 3 }));
      var l = pt(i, R + 22);
      var anchor = Math.abs(l[0] - cx) < 5 ? "middle" : (l[0] > cx ? "start" : "end");
      var ly = l[1] + (l[1] < cy - 10 ? -2 : (l[1] > cy + 10 ? 10 : 4));
      var lx = l[0] + (anchor === "start" ? -6 : anchor === "end" ? 6 : 0);
      svg.appendChild(el("text", { x: lx, y: ly, "text-anchor": anchor }, keys[i]));
      svg.appendChild(el("text", { "class": "val", x: lx, y: ly + 13, "text-anchor": anchor }, avg[keys[i]].toFixed(1)));
    }
  }
  function setTab(which) {
    $("tabClassic").setAttribute("aria-selected", String(which === "classic"));
    $("tabRomance").setAttribute("aria-selected", String(which === "romance"));
    drawRadar(which === "classic" ? CLASSIC : ROMANCE, which);
  }
  $("tabClassic").addEventListener("click", function () { setTab("classic"); });
  $("tabRomance").addEventListener("click", function () { setTab("romance"); });

  // flow
  function start() {
    deck = shuffle(chars.slice()).concat([{ img: lavCard.img, isLav: true }]);
    idx = 0; smashed = []; passed = []; busy = false;
    if (lav) stopFlying();
    lav = { passTries: 0, smashTries: 0, flying: false, zooming: false, done: false, ignoreClick: false };
    settle(passBtn); settle(smashBtn);
    $("moment").hidden = true;
    show("play");
    setupStack();
  }
  lav = { ignoreClick: false };
  $("startBtn").addEventListener("click", start);
  $("againBtn").addEventListener("click", start);

  window.addEventListener("resize", function () {
    if (lav && lav.flying) moveRandom(passBtn);
  });

  // preload
  chars.concat([lavCard]).forEach(function (c) { var i = new Image(); i.src = c.img; });

  // for testing the last card without having to catch anything
  window.smashDebug = {
    catchPass: function () { if (isLavNow() && !lav.done) heartbreak(); },
    state: function () { return { idx: idx, total: deck ? deck.length : 0, lav: isLavNow(), flying: !!lav.flying, passTries: lav.passTries, smashTries: lav.smashTries }; }
  };
})();
