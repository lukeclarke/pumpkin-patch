(function () {
  'use strict';

  // types = how many kinds, each = how many of each kind, mess = how crowded the pile is
  var LEVELS = [
    { types: 4, each: 4, mess: 1.1 },
    { types: 6, each: 6, mess: 1.5 },
    { types: 8, each: 8, mess: 1.9 },
    { types: 12, each: 9, mess: 2.2 },
    { types: 15, each: 10, mess: 2.45 }
  ];
  var MIN_VISIBLE = 0.25;   // nothing may ever be hidden more than this
  var PLACE_VISIBLE = 0.36; // what we aim for while scattering
  var M = 64;               // hit mask resolution
  var STRIDE = 4;           // sample spacing on the mask
  var SPRITE = 240;         // sprite px, covers the box plus 10% padding each side

  var $ = function (id) { return document.getElementById(id); };
  var cv = $('cv'), ctx = cv.getContext('2d'), stage = $('stage');
  var motionQuery = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function calm() { return !!(motionQuery && motionQuery.matches); }

  var css = getComputedStyle(document.documentElement);
  function tok(name, fb) { return (css.getPropertyValue(name) || '').trim() || fb; }
  var C = {
    bg: tok('--background', '#0a0708'), card: tok('--card', '#130e0f'), sec: tok('--secondary', '#1f1517'),
    primary: tok('--primary', '#ff6a00'), accent: tok('--accent', '#8cff3a'), spook: tok('--spook', '#a35cff'),
    border: tok('--border', '#3a2214'), muted: tok('--muted-foreground', '#a39489')
  };

  // ---------- helpers ----------
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function now() { return performance.now(); }
  function fmt(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  // ---------- icon sprites + masks ----------
  var T = {};
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }

  function buildType(key, img) {
    var icon = canvas(SPRITE);
    icon.getContext('2d').drawImage(img, 0, 0, SPRITE, SPRITE);
    var sprite = canvas(SPRITE), sc = sprite.getContext('2d');
    sc.shadowColor = 'rgba(0,0,0,0.6)'; sc.shadowBlur = 16; sc.shadowOffsetY = 5;
    sc.drawImage(icon, 0, 0);
    var ghost = canvas(SPRITE), gc = ghost.getContext('2d');
    gc.drawImage(icon, 0, 0); gc.globalCompositeOperation = 'source-in';
    gc.fillStyle = '#f3e9dc'; gc.fillRect(0, 0, SPRITE, SPRITE);

    var mask = new Uint8Array(M * M);
    try {
      var mc = canvas(M), mx = mc.getContext('2d');
      var pad = SPRITE / 12;
      mx.drawImage(icon, pad, pad, SPRITE - pad * 2, SPRITE - pad * 2, 0, 0, M, M);
      var d = mx.getImageData(0, 0, M, M).data;
      for (var i = 0; i < M * M; i++) mask[i] = d[i * 4 + 3] > 110 ? 1 : 0;
    } catch (e) {
      // pixels not readable: fall back to a round shape
      for (var y = 0; y < M; y++) for (var x = 0; x < M; x++) {
        var dx = (x + 0.5) / M - 0.5, dy = (y + 0.5) / M - 0.5;
        mask[y * M + x] = dx * dx + dy * dy < 0.16 ? 1 : 0;
      }
    }
    var su = [], sv = [], sg = [];
    for (var gy = 1; gy < M; gy += STRIDE) for (var gx = 1; gx < M; gx += STRIDE) {
      if (mask[gy * M + gx]) { su.push((gx + 0.5) / M - 0.5); sv.push((gy + 0.5) / M - 0.5); sg.push(gy * M + gx); }
    }
    T[key] = { key: key, name: ICONS.defs[key].name, sprite: sprite, ghost: ghost, mask: mask, su: su, sv: sv, sg: sg, n: su.length, url: ICONS.url(key, 0, 100) };
  }

  function loadAll() {
    return Promise.all(ICONS.keys.map(function (key) {
      return new Promise(function (res, rej) {
        var img = new Image();
        img.onload = function () { buildType(key, img); res(); };
        img.onerror = rej;
        img.src = ICONS.url(key, 10, SPRITE);
      });
    }));
  }

  // ---------- geometry ----------
  function setTransform(it) { it.c = Math.cos(it.r); it.sn = Math.sin(it.r); }

  function covers(it, wx, wy) {
    var dx = wx - it.x, dy = wy - it.y;
    var lx = (dx * it.c + dy * it.sn) / it.s, ly = (-dx * it.sn + dy * it.c) / it.s;
    if (lx <= -0.5 || lx >= 0.5 || ly <= -0.5 || ly >= 0.5) return false;
    return T[it.key].mask[((ly + 0.5) * M | 0) * M + ((lx + 0.5) * M | 0)] === 1;
  }

  function samplePoints(it) {
    var t = T[it.key], n = t.n;
    it.wx = new Float32Array(n); it.wy = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var u = t.su[i] * it.s, v = t.sv[i] * it.s;
      it.wx[i] = it.x + u * it.c - v * it.sn;
      it.wy[i] = it.y + u * it.sn + v * it.c;
    }
  }

  function near(a, b) {
    var r = (a.s + b.s) * 0.71, dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy < r * r;
  }

  // ---------- the pile ----------
  var world = { w: 1, h: 1 };
  var items = [];
  var nextId = 1;

  function makeCandidate(key, s, ww, wh) {
    var m = s * 0.45, x, y;
    if (Math.random() < 0.55) { x = ww / 2 + gauss() * ww * 0.42; y = wh / 2 + gauss() * wh * 0.42; }
    else { x = rand(0, ww); y = rand(0, wh); }
    var it = { key: key, s: s, x: clamp(x, m, ww - m), y: clamp(y, m, wh - m), r: rand(0, Math.PI * 2) };
    setTransform(it);
    return it;
  }

  function tryPlace(key, s, placed, ww, wh) {
    var best = null, bestMin = -1, bestHits = null;
    for (var t = 0; t < 140; t++) {
      if (t === 70) s *= 0.9;
      var it = makeCandidate(key, s, ww, wh);
      var minFrac = 1, hits = [];
      for (var p = 0; p < placed.length && minFrac > bestMin; p++) {
        var o = placed[p];
        if (!near(o, it)) continue;
        var newly = [];
        for (var j = 0; j < o.wx.length; j++) if (!o.cov[j] && covers(it, o.wx[j], o.wy[j])) newly.push(j);
        if (!newly.length) continue;
        var frac = (o.wx.length - o.ncov - newly.length) / o.wx.length;
        if (frac < minFrac) minFrac = frac;
        hits.push([o, newly]);
      }
      if (minFrac > bestMin) { best = it; bestMin = minFrac; bestHits = hits; }
      if (minFrac >= PLACE_VISIBLE) break;
    }
    if (bestMin < MIN_VISIBLE + 0.07) return null;
    bestHits.forEach(function (h) { h[1].forEach(function (j) { h[0].cov[j] = 1; }); h[0].ncov += h[1].length; });
    samplePoints(best);
    best.cov = new Uint8Array(best.wx.length); best.ncov = 0;
    for (var i = 0; i < best.wx.length; i++) {
      if (best.wx[i] < 0 || best.wy[i] < 0 || best.wx[i] > ww || best.wy[i] > wh) { best.cov[i] = 1; best.ncov++; }
    }
    best.id = nextId++;
    return best;
  }

  function scatter(keys, ww, wh, mess) {
    var n = keys.length;
    var base = clamp(Math.sqrt(ww * wh * mess / n), 34, Math.min(ww, wh) * 0.3);
    base = Math.min(base, 132);
    for (var attempt = 0; attempt < 10; attempt++) {
      var placed = [], ok = true;
      var list = shuffle(keys.slice());
      for (var i = 0; i < list.length; i++) {
        var it = tryPlace(list[i], base * rand(0.88, 1.12), placed, ww, wh);
        if (!it) { ok = false; break; }
        placed.push(it);
      }
      if (ok) return placed;
      base *= 0.92;
    }
    return placed;
  }

  // ---------- layout ----------
  var W = 0, H = 0, dpr = 1;
  var L = { pile: { x: 0, y: 0, w: 1, h: 1 }, shelf: { x: 0, y: 0, w: 1, h: 1 } };
  var view = { k: 1, ox: 0, oy: 0 };
  var finaleShelf = null, finaleFrom = null, finaleT0 = 0;

  function computeLayout() {
    var r = stage.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var n = level ? level.slots.length : 4, pad = 12;
    var portrait = W < 700 || W < H * 0.95;
    if (portrait) {
      var cols = Math.min(n, W < 520 ? 5 : 8), rows = Math.ceil(n / cols);
      var slotH = clamp(H * 0.28 / rows, 52, 110);
      var sh = rows * slotH + 16;
      L.shelf = { x: pad, y: H - sh - pad, w: W - pad * 2, h: sh };
      L.pile = { x: pad, y: 6, w: W - pad * 2, h: L.shelf.y - 6 - pad };
    } else {
      var sw = clamp(W * 0.3, 240, 420);
      L.shelf = { x: W - sw - pad, y: pad, w: sw, h: H - pad * 2 };
      L.pile = { x: pad, y: pad, w: L.shelf.x - pad * 2, h: H - pad * 2 };
    }
    fitView();
    if (state === 'finale') measureFinale(false);
  }

  function fitView() {
    var p = L.pile;
    view.k = Math.min(p.w / world.w, p.h / world.h);
    view.ox = p.x + (p.w - world.w * view.k) / 2;
    view.oy = p.y + (p.h - world.h * view.k) / 2;
  }

  function onResize() {
    var oldAspect = world.w / world.h;
    computeLayout();
    if (level && items.length && state !== 'finale') {
      var aspect = L.pile.w / L.pile.h;
      if (Math.abs(Math.log(aspect / oldAspect)) > 0.22) {
        // big shape change (phone rotated): scatter what is left to fit the new space
        var keys = items.map(function (it) { return it.key; });
        world = { w: L.pile.w, h: L.pile.h };
        items = scatter(keys, world.w, world.h, level.cfg.mess);
        fitView();
      }
    }
    dirty = true;
  }

  function slotGrid(rect, n) {
    var ip = 8, w = rect.w - ip * 2, h = rect.h - ip * 2, best = null;
    for (var cols = 1; cols <= n; cols++) {
      var rows = Math.ceil(n / cols);
      var cw = Math.min(w / cols, 190), ch = Math.min(h / rows, 170, cw * 1.6);
      var score = Math.min(cw, ch * 1.15);
      if (!best || score > best.score) best = { cols: cols, rows: rows, cw: cw, ch: ch, score: score };
    }
    var gx = rect.x + ip + (w - best.cols * best.cw) / 2, gy = rect.y + ip + (h - best.rows * best.ch) / 2;
    var out = [];
    for (var i = 0; i < n; i++) {
      var c = i % best.cols, r = Math.floor(i / best.cols);
      out.push({ x: gx + c * best.cw + 3, y: gy + r * best.ch + 3, w: best.cw - 6, h: best.ch - 6 });
    }
    return out;
  }

  // neat little grid inside a slot, filled from the bottom row up
  function stackSpot(slotRect, k, each) {
    var best = null, pad = 6, w = slotRect.w - pad * 2, h = slotRect.h - pad * 2;
    for (var c = 1; c <= each; c++) {
      var r = Math.ceil(each / c), size = Math.min(w / c, h / r) * 1.18;
      if (!best || size > best.size) best = { c: c, r: r, size: size };
    }
    var size = Math.min(best.size, 92);
    var cw = Math.min(w / best.c, size * 0.95), ch = Math.min(h / best.r, size * 0.95);
    var gw = cw * best.c, gh = ch * best.r;
    var col = k % best.c, row = Math.floor(k / best.c);
    var x0 = slotRect.x + pad + (w - gw) / 2, y0 = slotRect.y + pad + (h - gh) / 2;
    return { x: x0 + (col + 0.5) * cw, y: y0 + gh - (row + 0.5) * ch, s: size, r: ((k % 2) ? 1 : -1) * 0.05 };
  }

  function currentShelf() {
    if (state === 'finale' && finaleShelf) {
      var t = calm() ? 1 : clamp((now() - finaleT0) / 900, 0, 1);
      t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var a = finaleFrom, b = finaleShelf;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t };
    }
    return L.shelf;
  }

  // ---------- game state ----------
  var state = 'loading';
  var level = null;
  var flyers = [], sparks = [];
  var hint = null, lastTap = null;
  var dirty = true;
  var runTotal = 0;

  function startLevel(i) {
    var cfg = LEVELS[i];
    var kinds = shuffle(ICONS.keys.slice()).slice(0, cfg.types);
    level = { i: i, cfg: cfg, slots: kinds.map(function (k) { return { key: k, sent: 0, landed: 0, bump: 0 }; }), target: 0, t0: 0, t1: 0 };
    flyers = []; hint = null;
    computeLayout();
    world = { w: L.pile.w, h: L.pile.h };
    var keys = [];
    kinds.forEach(function (k) { for (var j = 0; j < cfg.each; j++) keys.push(k); });
    items = scatter(keys, world.w, world.h, cfg.mess);
    fitView();
    $('lvl').textContent = (i + 1) + '/' + LEVELS.length;
    updatePrompt(true);
    dirty = true;
  }

  function begin() {
    state = 'play';
    level.t0 = now();
    $('title').hidden = true; $('done').hidden = true; $('finale').hidden = true;
    $('prompt').style.visibility = '';
  }

  function targetKey() { return level && level.slots[level.target] ? level.slots[level.target].key : null; }
  function leftOf(key) { var n = 0; for (var i = 0; i < items.length; i++) if (items[i].key === key) n++; return n; }

  function updatePrompt(swap) {
    var key = targetKey();
    if (!key) return;
    $('pIcon').src = T[key].url;
    $('pName').textContent = T[key].name;
    $('pCount').textContent = leftOf(key);
    if (swap) bounce($('prompt'), 'swap');
  }

  function bounce(el, cls) {
    el.classList.remove('swap', 'nope');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function toWorld(px, py) { return { x: (px - view.ox) / view.k, y: (py - view.oy) / view.k }; }
  function toScreen(wx, wy) { return { x: view.ox + wx * view.k, y: view.oy + wy * view.k }; }

  function topAt(wx, wy) {
    for (var i = items.length - 1; i >= 0; i--) if (covers(items[i], wx, wy)) return items[i];
    return null;
  }

  function tapAt(px, py) {
    var key = targetKey(), p = toWorld(px, py);
    var hit = topAt(p.x, p.y);
    if (!hit || hit.key !== key) {
      // a little forgiveness for fingers
      var rad = 8 / view.k;
      for (var a = 0; a < 8; a++) {
        var h = topAt(p.x + Math.cos(a * Math.PI / 4) * rad, p.y + Math.sin(a * Math.PI / 4) * rad);
        if (h && h.key === key) { hit = h; break; }
      }
    }
    if (!hit) { lastTap = { result: 'none' }; return; }
    if (hit.key === key) collect(hit);
    else wrong(hit);
  }

  function collect(it) {
    var idx = items.indexOf(it);
    items.splice(idx, 1);
    var si = level.target, slot = level.slots[si];
    var from = toScreen(it.x, it.y);
    flyers.push({ key: it.key, slot: si, k: slot.sent, x0: from.x, y0: from.y, s0: it.s * view.k, r0: it.r, t0: now(), dur: calm() ? 220 : 620 });
    slot.sent++;
    if (hint && hint.id === it.id) hint = null;
    lastTap = { result: 'ok', id: it.id };
    sfx('pick');
    if (!leftOf(slot.key)) {
      if (level.target < level.slots.length - 1) { level.target++; updatePrompt(true); }
      else $('pCount').textContent = '0';
    } else updatePrompt(false);
    dirty = true;
  }

  function wrong(it) {
    it.shake = now();
    lastTap = { result: 'wrong', id: it.id };
    bounce($('prompt'), 'nope');
    sfx('wrong');
    try { if (navigator.vibrate) navigator.vibrate(25); } catch (e) {}
    dirty = true;
  }

  function landed(f) {
    var slot = level.slots[f.slot];
    slot.landed++; slot.bump = now();
    sfx('place');
    if (!items.length && !flyers.length && state === 'play') levelDone();
  }

  function levelDone() {
    var ms = now() - level.t0;
    level.t1 = ms;
    runTotal += ms;
    var best = loadBest(), i = level.i, prev = best.levels[i];
    var isBest = !prev || ms < prev;
    if (isBest) best.levels[i] = ms;
    sfx('done');
    if (i === LEVELS.length - 1) {
      var fullRun = level.fromStart;
      if (fullRun && (!best.total || runTotal < best.total)) { best.total = runTotal; level.newTotal = true; }
      saveBest(best);
      finale(best);
      return;
    }
    saveBest(best);
    state = 'done';
    $('doneTime').textContent = fmt(ms);
    var b = $('doneBest');
    b.textContent = isBest ? (prev ? 'new best' : '') : 'best ' + fmt(prev);
    b.className = isBest ? 'best' : '';
    $('done').hidden = false;
    burst(L.pile.x + L.pile.w / 2, L.pile.y + L.pile.h / 2, 26);
    var at = level.i;
    clearTimeout(levelDone.timer);
    levelDone.timer = setTimeout(function () { if (state === 'done' && level.i === at) nextLevel(); }, 2400);
  }

  function nextLevel() {
    var fromStart = level.fromStart;
    startLevel(level.i + 1);
    level.fromStart = fromStart;
    begin();
  }

  function finale(best) {
    state = 'finale';
    $('finTime').textContent = fmt(level.fromStart ? runTotal : level.t1);
    var fb = $('finBest');
    if (level.fromStart && best.total) { fb.textContent = level.newTotal ? 'new best' : 'best ' + fmt(best.total); fb.className = level.newTotal ? 'best' : ''; }
    else { fb.textContent = ''; }
    $('finale').hidden = false;
    $('prompt').style.visibility = 'hidden';
    finaleFrom = { x: L.shelf.x, y: L.shelf.y, w: L.shelf.w, h: L.shelf.h };
    measureFinale(true);
  }

  function measureFinale(fresh) {
    var box = $('finale'), card = box.querySelector('.card');
    var top = box.getBoundingClientRect().top + card.offsetTop;
    var bottom = Math.min(H, top - stage.getBoundingClientRect().top) - 10;
    finaleShelf = { x: 12, y: 8, w: W - 24, h: Math.max(120, bottom - 8) };
    if (fresh) {
      finaleT0 = now();
      var spread = setInterval(function () {
        if (state !== 'finale') return clearInterval(spread);
        var r = finaleShelf;
        burst(r.x + rand(0.1, 0.9) * r.w, r.y + rand(0.1, 0.9) * r.h, 10);
      }, 260);
      setTimeout(function () { clearInterval(spread); }, 3200);
    }
  }

  function loadBest() {
    var b = null;
    try { b = JSON.parse(store('tidy.best') || 'null'); } catch (e) { b = null; }
    if (!b || !Array.isArray(b.levels)) b = { levels: [], total: 0 };
    return b;
  }
  function saveBest(b) { try { store('tidy.best', JSON.stringify(b)); } catch (e) {} }

  // ---------- sparkles ----------
  function burst(x, y, n) {
    if (calm()) return;
    var cols = [C.primary, C.accent, C.spook, '#ffd23a'];
    for (var i = 0; i < n; i++) {
      var a = rand(0, Math.PI * 2), v = rand(60, 260);
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t0: now(), life: rand(600, 1100), c: cols[i % 4], s: rand(2, 4.5) });
    }
  }

  // ---------- sound ----------
  var actx = null, muted = store('tidy.muted') === '1';
  function audioOn() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
    if (actx && actx.state === 'suspended') actx.resume();
  }
  function tone(f, dur, type, vol, slide, delay) {
    var t = actx.currentTime + (delay || 0);
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(f + slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function sfx(name) {
    if (muted || !actx) return;
    try {
      if (name === 'pick') tone(520, 0.13, 'triangle', 0.12, 340);
      else if (name === 'place') tone(330, 0.1, 'sine', 0.18, -110);
      else if (name === 'wrong') { tone(180, 0.16, 'triangle', 0.1, -50); tone(150, 0.18, 'triangle', 0.08, -40, 0.09); }
      else if (name === 'done') [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, 'triangle', 0.1, 0, i * 0.09); });
    } catch (e) {}
  }
  function setMuted(m) {
    muted = m; store('tidy.muted', m ? '1' : '0');
    $('mute').setAttribute('aria-pressed', m ? 'true' : 'false');
  }

  // ---------- drawing ----------
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  }

  function drawSprite(img, x, y, s, r, alpha) {
    var c = Math.cos(r), sn = Math.sin(r);
    ctx.setTransform(c * dpr, sn * dpr, -sn * dpr, c * dpr, x * dpr, y * dpr);
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ctx.drawImage(img, -s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    ctx.globalAlpha = 1;
  }

  function drawPileFloor() {
    var p = L.pile;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = ctx.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 0, p.x + p.w / 2, p.y + p.h / 2, Math.max(p.w, p.h) * 0.7);
    g.addColorStop(0, 'rgba(163,92,255,0.10)');
    g.addColorStop(1, 'rgba(163,92,255,0.0)');
    rrect(p.x, p.y, p.w, p.h, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fill();
    ctx.fillStyle = g; ctx.fill();
    ctx.setLineDash([3, 9]); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(163,148,137,0.18)'; ctx.stroke(); ctx.setLineDash([]);
  }

  function drawPile(t) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i], p = toScreen(it.x, it.y), r = it.r;
      if (it.shake) {
        var e = (t - it.shake) / 420;
        if (e >= 1) it.shake = 0;
        else if (!calm()) { p.x += Math.sin(e * 28) * 5 * (1 - e) ; r += Math.sin(e * 22) * 0.06 * (1 - e); }
      }
      drawSprite(T[it.key].sprite, p.x, p.y, it.s * view.k, r);
      if (it.shake && calm()) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.beginPath(); ctx.arc(p.x, p.y, it.s * view.k * 0.45, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,61,46,0.7)'; ctx.lineWidth = 3; ctx.stroke();
      }
    }
  }

  function drawHint(t) {
    if (!hint) return;
    var it = null;
    for (var i = 0; i < items.length; i++) if (items[i].id === hint.id) it = items[i];
    var e = (t - hint.t0) / 1800;
    if (!it || e >= 1) { hint = null; return; }
    var p = toScreen(hint.x, hint.y), base = Math.max(18, it.s * view.k * 0.28);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var waves = calm() ? 1 : 3;
    for (var w = 0; w < waves; w++) {
      var ph = calm() ? 0.4 : ((e * 3 + w / waves) % 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, base * (0.6 + ph * 1.2), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140,255,58,' + (0.9 * (1 - ph)) + ')';
      ctx.lineWidth = 3;
      ctx.shadowColor = C.accent; ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function drawShelf(t) {
    var sh = currentShelf();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rrect(sh.x, sh.y, sh.w, sh.h, 18);
    ctx.fillStyle = C.card; ctx.fill();
    ctx.shadowColor = C.primary; ctx.shadowBlur = 14;
    ctx.lineWidth = 2; ctx.strokeStyle = C.primary; ctx.stroke();
    ctx.shadowBlur = 0;
    var rects = slotGrid(sh, level.slots.length);
    var each = level.cfg.each;
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i], slot = level.slots[i];
      var active = state === 'play' && i === level.target;
      var full = slot.landed >= each;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rrect(r.x, r.y, r.w, r.h, 10);
      ctx.fillStyle = C.sec; ctx.fill();
      if (active) { ctx.shadowColor = C.primary; ctx.shadowBlur = 10; ctx.strokeStyle = C.primary; ctx.lineWidth = 2; }
      else if (full) { ctx.strokeStyle = 'rgba(140,255,58,0.55)'; ctx.lineWidth = 1.5; }
      else { ctx.strokeStyle = C.border; ctx.lineWidth = 1; }
      ctx.stroke(); ctx.shadowBlur = 0;
      var bump = slot.bump && !calm() ? Math.max(0, 1 - (t - slot.bump) / 260) : 0;
      for (var k = 0; k < each; k++) {
        var sp = stackSpot(r, k, each);
        if (k < slot.landed) {
          var s = sp.s * (k === slot.landed - 1 ? 1 + bump * 0.18 : 1);
          drawSprite(T[slot.key].sprite, sp.x, sp.y, s, sp.r);
        } else {
          drawSprite(T[slot.key].ghost, sp.x, sp.y, sp.s, sp.r, active ? 0.16 : 0.07);
        }
      }
    }
    return rects;
  }

  function drawFlyers(t, rects) {
    for (var i = flyers.length - 1; i >= 0; i--) {
      var f = flyers[i], e = clamp((t - f.t0) / f.dur, 0, 1);
      var to = stackSpot(rects[f.slot], f.k, level.cfg.each);
      var q = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
      var x, y;
      if (calm()) { x = f.x0 + (to.x - f.x0) * q; y = f.y0 + (to.y - f.y0) * q; }
      else {
        var cx = (f.x0 + to.x) / 2, cy = Math.min(f.y0, to.y) - Math.max(60, Math.abs(to.x - f.x0) * 0.25);
        var u = 1 - q;
        x = u * u * f.x0 + 2 * u * q * cx + q * q * to.x;
        y = u * u * f.y0 + 2 * u * q * cy + q * q * to.y;
      }
      var dr = ((to.r - f.r0) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      var lift = calm() ? 1 : 1 + Math.sin(e * Math.PI) * 0.25;
      drawSprite(T[f.key].sprite, x, y, (f.s0 + (to.s - f.s0) * q) * lift, f.r0 + dr * q);
      if (e >= 1) { flyers.splice(i, 1); landed(f); }
    }
  }

  function drawSparks(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i], e = (t - s.t0) / s.life;
      if (e >= 1) { sparks.splice(i, 1); continue; }
      var sec = (t - s.t0) / 1000;
      var x = s.x + s.vx * sec, y = s.y + s.vy * sec + 260 * sec * sec;
      ctx.globalAlpha = 1 - e;
      ctx.fillStyle = s.c;
      ctx.beginPath();
      var r = s.s * (1 - e * 0.5);
      ctx.moveTo(x, y - r * 2); ctx.lineTo(x + r * 0.6, y - r * 0.6); ctx.lineTo(x + r * 2, y); ctx.lineTo(x + r * 0.6, y + r * 0.6);
      ctx.lineTo(x, y + r * 2); ctx.lineTo(x - r * 0.6, y + r * 0.6); ctx.lineTo(x - r * 2, y); ctx.lineTo(x - r * 0.6, y - r * 0.6);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function busy(t) {
    if (flyers.length || sparks.length || hint) return true;
    if (state === 'finale' && t - finaleT0 < 1000) return true;
    for (var i = 0; i < level.slots.length; i++) if (level.slots[i].bump && t - level.slots[i].bump < 300) return true;
    for (var j = 0; j < items.length; j++) if (items[j].shake) return true;
    return false;
  }

  var lastClock = '';
  function frame() {
    requestAnimationFrame(frame);
    if (!level) return;
    var t = now();
    if (state === 'play') {
      var clock = fmt(t - level.t0);
      if (clock !== lastClock) { $('time').textContent = clock; lastClock = clock; }
    }
    if (!dirty && !busy(t)) return;
    dirty = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (state !== 'finale') { drawPileFloor(); drawPile(t); drawHint(t); }
    var rects = drawShelf(t);
    drawFlyers(t, rects);
    drawSparks(t);
  }

  // ---------- visibility ----------
  function uncoveredSamples(idx) {
    var it = items[idx], t = T[it.key], out = [];
    for (var i = 0; i < t.n; i++) {
      var u = t.su[i] * it.s, v = t.sv[i] * it.s;
      var wx = it.x + u * it.c - v * it.sn, wy = it.y + u * it.sn + v * it.c;
      var hidden = wx < 0 || wy < 0 || wx > world.w || wy > world.h;
      for (var j = idx + 1; j < items.length && !hidden; j++) if (near(it, items[j]) && covers(items[j], wx, wy)) hidden = true;
      if (!hidden) out.push({ g: t.sg[i], x: wx, y: wy });
    }
    return out;
  }

  // the most "inside" visible spot of an item, in world coords
  function visibleSpot(it) {
    var idx = items.indexOf(it);
    if (idx < 0) return null;
    var pts = uncoveredSamples(idx);
    if (!pts.length) return null;
    var set = {};
    pts.forEach(function (p) { set[p.g] = 1; });
    var best = null, bestScore = -1;
    pts.forEach(function (p) {
      var score = 0;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) if (set[p.g + dy * STRIDE * M + dx * STRIDE]) score++;
      if (score > bestScore && topAt(p.x, p.y) === it) { bestScore = score; best = p; }
    });
    return best;
  }

  // full resolution check of how much of an item can be seen
  function visibleFraction(idx) {
    var it = items[idx], mask = T[it.key].mask, total = 0, seen = 0;
    for (var gy = 0; gy < M; gy++) for (var gx = 0; gx < M; gx++) {
      if (!mask[gy * M + gx]) continue;
      total++;
      var u = ((gx + 0.5) / M - 0.5) * it.s, v = ((gy + 0.5) / M - 0.5) * it.s;
      var wx = it.x + u * it.c - v * it.sn, wy = it.y + u * it.sn + v * it.c;
      if (wx < 0 || wy < 0 || wx > world.w || wy > world.h) continue;
      var hidden = false;
      for (var j = idx + 1; j < items.length && !hidden; j++) if (near(it, items[j]) && covers(items[j], wx, wy)) hidden = true;
      if (!hidden) seen++;
    }
    return seen / total;
  }

  // ---------- input ----------
  cv.addEventListener('pointerdown', function (e) {
    audioOn();
    if (state === 'done') { nextLevel(); return; }
    if (state !== 'play') return;
    var r = cv.getBoundingClientRect();
    tapAt(e.clientX - r.left, e.clientY - r.top);
  });
  $('done').addEventListener('pointerdown', function () { if (state === 'done') nextLevel(); });

  $('start').addEventListener('click', function () {
    audioOn();
    runTotal = 0;
    level.fromStart = true;
    begin();
  });
  $('again').addEventListener('click', function () {
    audioOn();
    runTotal = 0;
    startLevel(0);
    level.fromStart = true;
    begin();
  });
  $('mute').addEventListener('click', function () { audioOn(); setMuted(!muted); if (!muted) sfx('place'); });
  $('hint').addEventListener('click', function () {
    audioOn();
    if (state !== 'play') return;
    var key = targetKey(), pool = items.filter(function (it) { return it.key === key; });
    if (!pool.length) return;
    var it = pool[Math.floor(Math.random() * pool.length)], spot = visibleSpot(it);
    if (spot) { hint = { id: it.id, x: spot.x, y: spot.y, t0: now() }; dirty = true; }
  });

  if (window.ResizeObserver) new ResizeObserver(onResize).observe(stage);
  else window.addEventListener('resize', onResize);

  // dev helpers for checking layouts
  window.tidyDebug = {
    levels: LEVELS,
    info: function () {
      return { state: state, level: level ? level.i : -1, target: targetKey(), left: items.length, flying: flyers.length,
        types: level ? level.slots.map(function (s) { return s.key; }) : [] };
    },
    items: function () { return items.map(function (it) { return { id: it.id, key: it.key }; }); },
    visibility: function () { return items.map(function (it, i) { return { id: it.id, key: it.key, frac: visibleFraction(i) }; }); },
    point: function (id) {
      var it = items.filter(function (x) { return x.id === id; })[0];
      var spot = it && visibleSpot(it);
      if (!spot) return null;
      var r = cv.getBoundingClientRect(), p = toScreen(spot.x, spot.y);
      return { x: r.left + p.x, y: r.top + p.y };
    },
    probe: function (x, y) {
      var r = cv.getBoundingClientRect(), p = toWorld(x - r.left, y - r.top), h = topAt(p.x, p.y);
      return h ? { id: h.id, key: h.key } : null;
    },
    lastTap: function () { return lastTap; },
    jump: function (i) {
      clearTimeout(levelDone.timer);
      startLevel(i);
      begin();
    },
    generate: function (i) { startLevel(i); state = 'title'; }
  };

  // ---------- go ----------
  setMuted(muted);
  var deco = ['pumpkin', 'ghost', 'candycorn', 'bat', 'potion'];
  $('titleIcons').innerHTML = deco.map(function (k) { return '<img alt="" src="' + ICONS.url(k, 0, 100) + '">'; }).join('');
  loadAll().then(function () {
    state = 'title';
    startLevel(0);
    requestAnimationFrame(frame);
  });
})();
