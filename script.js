/* ==========================================================================
   For You 💗  — engine
   Builds the page from config.js, drives the mood system, particles,
   the cat companion, synthesized meows, and heart bursts.
   No build step, no libraries, works straight from a file:// or GitHub Pages.
   ========================================================================== */
(function () {
  "use strict";
  // config.js declares `const LOVE` — a top-level const is a global lexical
  // binding but is NOT a property of window, so read the binding directly.
  var C = (typeof LOVE !== "undefined" && LOVE) ? LOVE : (window.LOVE || {});
  var app = document.getElementById("app");

  /* ---------- tiny helpers ---------------------------------------------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  /* A photo frame that shows an elegant placeholder until the real image is
     dropped in. On success it shows the photo; on error it stays beautiful. */
  function photo(src, alt) {
    var frame = el("div", "frame reveal");
    var ph = el("div", "ph");
    ph.style.aspectRatio = ""; // inherit from frame
    ph.innerHTML =
      '<div class="ph-heart">💗</div>' +
      '<div>Your photo goes here</div>' +
      '<small>' + esc(src) + '</small>';
    frame.appendChild(ph);
    if (src) {
      var img = new Image();
      img.alt = alt || "us";
      img.onload = function () { frame.innerHTML = ""; frame.appendChild(img); frame._img = src; };
      img.onerror = function () { /* keep placeholder */ };
      img.src = src;
    }
    return frame;
  }

  /* ---------- build sections -------------------------------------------- */
  function sectionEl(id, mood, cls) {
    var s = el("section", cls || "");
    s.id = id; s.dataset.mood = mood;
    return s;
  }

  function buildHero() {
    var s = sectionEl("hero", "soft", "hero");
    var g = el("div", "greeting reveal", esc(C.greeting || "Happy Girlfriend's Day"));
    var h = el("h1", "reveal");
    // animate her name letter by letter
    var name = C.herName || "My Love";
    var nameWrap = el("span", "hero-name");
    name.split("").forEach(function (ch, i) {
      var c = el("span", "ch", ch === " " ? "&nbsp;" : esc(ch));
      c.style.animationDelay = (0.4 + i * 0.06) + "s";
      nameWrap.appendChild(c);
    });
    h.innerHTML = esc(C.heroLine || "There is a whole universe in the space between us.");
    var line = el("div", "sub reveal", "");
    line.appendChild(nameWrap);
    var sub = el("p", "sub reveal", esc(C.heroSub || ""));
    var btn = el("button", "enter reveal", esc(C.enterButton || "Come closer 💗"));
    btn.addEventListener("click", function () {
      startAudioContext();
      meow();
      var next = s.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: "smooth" });
    });
    s.append(g, line, h, sub, btn);
    s.appendChild(el("div", "scroll-cue", "scroll ♥"));
    return s;
  }

  function buildBeginning() {
    var b = C.beginning || {};
    var s = sectionEl("beginning", "tender");
    var split = el("div", "split");
    var txt = el("div", "txt");
    txt.append(
      el("div", "eyebrow reveal", "how it began"),
      el("h2", "reveal", esc(b.title || "")),
      el("p", "body reveal", esc(b.text || ""))
    );
    split.append(photo(b.photo, "how it began"), txt);
    s.appendChild(split);
    return s;
  }

  function buildJourney() {
    var s = sectionEl("journey", "playful");
    s.append(
      el("div", "eyebrow reveal", "our little journey"),
      el("h2", "reveal", "The story of us")
    );
    var wrap = el("div", "journey-wrap");
    (C.journey || []).forEach(function (step) {
      var j = el("div", "jstep");
      var txt = el("div", "txt reveal");
      txt.append(
        el("div", "date", esc(step.date || "")),
        el("h2", "", esc(step.title || "")),
        el("p", "body", esc(step.text || ""))
      );
      j.append(photo(step.photo, step.title), txt);
      wrap.appendChild(j);
    });
    s.appendChild(wrap);
    return s;
  }

  function buildReasons() {
    var s = sectionEl("reasons", "soft");
    s.append(
      el("div", "eyebrow reveal", "just a few of the reasons"),
      el("h2", "reveal", "Why I love you")
    );
    var grid = el("div", "reasons-grid");
    (C.reasons || []).forEach(function (r, i) {
      var card = el("div", "reason reveal", esc(r));
      card.style.transitionDelay = (i * 0.06) + "s";
      grid.appendChild(card);
    });
    s.appendChild(grid);
    return s;
  }

  function buildGallery() {
    var s = sectionEl("gallery", "playful");
    s.append(
      el("div", "eyebrow reveal", "moments I keep"),
      el("h2", "reveal", "Us")
    );
    var grid = el("div", "gallery-grid");
    (C.gallery || []).forEach(function (src) {
      var f = photo(src, "us");
      f.addEventListener("click", function () {
        if (f._img) openLightbox(f._img);
      });
      grid.appendChild(f);
    });
    s.appendChild(grid);
    return s;
  }

  function buildSpicy() {
    var sp = C.spicy || {};
    var s = sectionEl("spicy", "spicy");
    s.appendChild(el("div", "heat"));
    var split = el("div", "split rtl");
    var txt = el("div", "txt");
    txt.append(
      el("div", "eyebrow reveal", "a little closer"),
      el("h2", "reveal", esc(sp.title || "")),
      el("p", "body reveal", esc(sp.text || ""))
    );
    split.append(photo(sp.photo, "us"), txt);
    s.appendChild(split);
    return s;
  }

  function buildLetter() {
    var lt = C.letter || {};
    var s = sectionEl("letter", "tender");
    var box = el("div", "letter reveal");
    box.appendChild(el("h2", "", esc(lt.title || "")));
    (lt.lines || []).forEach(function (ln) {
      box.appendChild(el("p", "line", esc(ln)));
    });
    box.appendChild(el("div", "sign", esc(C.myName || "")));
    s.appendChild(box);
    return s;
  }

  function buildForever() {
    var f = C.forever || {};
    var s = sectionEl("forever", "soft", "forever");
    s.append(
      el("div", "big-heart reveal", "💗"),
      el("div", "eyebrow reveal", "and this is just the start"),
      el("h2", "reveal", esc(f.title || "")),
      el("p", "body reveal", esc(f.text || ""))
    );
    var btn = el("button", "heartbtn reveal", esc(f.button || "I love you 💗"));
    btn.addEventListener("click", function () { celebrate(); });
    s.appendChild(btn);
    s.appendChild(el("div", "footer-note",
      "Rucha♥Vedant"));
    return s;
  }

  // assemble
  [buildHero, buildBeginning, buildJourney, buildReasons,
   buildGallery, buildSpicy, buildLetter, buildForever]
    .forEach(function (fn) { app.appendChild(fn()); });

  /* ---------- MOOD system: retint page as sections scroll in ------------ */
  var body = document.body;
  var moodObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.intersectionRatio > 0.5) {
        var m = e.target.dataset.mood;
        if (m && body.dataset.mood !== m) body.dataset.mood = m;
      }
    });
  }, { threshold: [0.5] });
  document.querySelectorAll("section").forEach(function (s) { moodObs.observe(s); });

  /* ---------- reveal-on-scroll ------------------------------------------ */
  var revObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.18 });
  function watchReveals() {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (n) { revObs.observe(n); });
  }
  watchReveals();

  /* letter lines cascade in */
  var letterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".line").forEach(function (ln, i) {
        setTimeout(function () { ln.classList.add("in"); }, 350 + i * 650);
      });
      letterObs.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  var lb = document.querySelector(".letter");
  if (lb) letterObs.observe(lb);

  /* ---------- petals / hearts canvas ------------------------------------ */
  var canvas = document.getElementById("petals");
  var ctx = canvas.getContext("2d");
  var W, H, parts = [];
  var GLYPHS = ["♥", "❤", "🌸", "✿", "❀"];
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  addEventListener("resize", resize); resize();
  function seed() {
    if (C.petals === false) return;
    var n = Math.min(30, Math.round(W / 46));
    for (var i = 0; i < n; i++) parts.push(newPart(Math.random() * H));
  }
  function newPart(y) {
    return {
      x: Math.random() * W, y: y == null ? -20 : y,
      s: 9 + Math.random() * 16, sp: 0.25 + Math.random() * 0.7,
      sway: Math.random() * 6.28, sws: 0.005 + Math.random() * 0.015,
      a: 0.25 + Math.random() * 0.5, g: GLYPHS[(Math.random() * GLYPHS.length) | 0],
      rot: Math.random() * 6.28, rs: (Math.random() - 0.5) * 0.02
    };
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    var accent = getComputedStyle(body).getPropertyValue("--accent").trim() || "#ffa6c4";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y += p.sp; p.sway += p.sws; p.x += Math.sin(p.sway) * 0.5; p.rot += p.rs;
      if (p.y > H + 24) { parts[i] = newPart(-20); continue; }
      ctx.save();
      ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.font = p.s + "px serif"; ctx.fillStyle = accent;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(p.g, 0, 0);
      ctx.restore();
    }
    requestAnimationFrame(tick);
  }
  seed(); tick();

  /* ---------- Web Audio: synthesized meow + ambient ---------------------- */
  var AC = window.AudioContext || window.webkitAudioContext;
  var actx = null, soundOn = true, musicOn = false, musicNodes = null;
  function startAudioContext() {
    if (!actx && AC) actx = new AC();
    if (actx && actx.state === "suspended") actx.resume();
  }

  // a cute little "meow": pitch bends up then down through a formant-ish filter
  function meow() {
    if (!soundOn || !C.catsEnabled) return;
    startAudioContext();
    if (!actx) return;
    var t = actx.currentTime;
    var osc = actx.createOscillator();
    var osc2 = actx.createOscillator();
    var filt = actx.createBiquadFilter();
    var gain = actx.createGain();
    osc.type = "sawtooth"; osc2.type = "triangle";
    osc2.detune.value = -1200; // an octave below for body
    filt.type = "bandpass"; filt.Q.value = 6;
    // "mee-oww" pitch contour
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(1020, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.42);
    osc2.frequency.setValueAtTime(620, t);
    osc2.frequency.exponentialRampToValueAtTime(1020, t + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(560, t + 0.42);
    filt.frequency.setValueAtTime(900, t);
    filt.frequency.exponentialRampToValueAtTime(1600, t + 0.12);
    filt.frequency.exponentialRampToValueAtTime(700, t + 0.42);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(filt); osc2.connect(filt); filt.connect(gain); gain.connect(actx.destination);
    osc.start(t); osc2.start(t); osc.stop(t + 0.52); osc2.stop(t + 0.52);
  }

  // soft ambient pad (gentle, optional) — layered detuned sines
  function toggleMusic() {
    startAudioContext();
    if (!actx) return;
    musicOn = !musicOn;
    document.getElementById("musicBtn").classList.toggle("off", !musicOn);
    if (musicOn) {
      var master = actx.createGain(); master.gain.value = 0.0001;
      master.gain.linearRampToValueAtTime(0.05, actx.currentTime + 2);
      master.connect(actx.destination);
      var freqs = [220, 277.18, 329.63, 440]; // Am-ish warm chord
      var oscs = freqs.map(function (f, i) {
        var o = actx.createOscillator(); o.type = "sine";
        o.frequency.value = f; o.detune.value = (i - 1.5) * 6;
        var g = actx.createGain(); g.gain.value = 0.25 / freqs.length;
        // slow tremolo
        var lfo = actx.createOscillator(); lfo.frequency.value = 0.08 + i * 0.03;
        var lg = actx.createGain(); lg.gain.value = 0.12;
        lfo.connect(lg); lg.connect(g.gain); lfo.start();
        o.connect(g); g.connect(master); o.start();
        return { o: o, lfo: lfo };
      });
      musicNodes = { master: master, oscs: oscs };
    } else if (musicNodes) {
      var m = musicNodes; var now = actx.currentTime;
      m.master.gain.cancelScheduledValues(now);
      m.master.gain.setValueAtTime(m.master.gain.value, now);
      m.master.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      setTimeout(function () {
        m.oscs.forEach(function (n) { try { n.o.stop(); n.lfo.stop(); } catch (e) {} });
      }, 1700);
      musicNodes = null;
    }
  }

  /* ---------- controls --------------------------------------------------- */
  document.getElementById("soundBtn").addEventListener("click", function () {
    soundOn = !soundOn;
    this.textContent = soundOn ? "🔊" : "🔇";
    this.classList.toggle("off", !soundOn);
    if (soundOn) meow();
  });
  document.getElementById("musicBtn").addEventListener("click", toggleMusic);

  /* ---------- the cat ---------------------------------------------------- */
  var cat = document.getElementById("cat");
  var bubble = document.getElementById("catBubble");
  var purrs = ["meow 💕", "purr~", "mrrp!", "nya~ 🐾", "I love her too 🐱", "mew 💗"];
  if (C.catsEnabled === false) { cat.style.display = "none"; }
  function catSpeak() {
    bubble.textContent = purrs[(Math.random() * purrs.length) | 0];
    bubble.classList.add("show");
    cat.classList.add("happy");
    meow();
    heartBurst(cat.getBoundingClientRect().left + 60,
               cat.getBoundingClientRect().top + 20, 6);
    setTimeout(function () { cat.classList.remove("happy"); }, 520);
    clearTimeout(cat._t);
    cat._t = setTimeout(function () { bubble.classList.remove("show"); }, 1600);
  }
  cat.addEventListener("click", catSpeak);
  // occasional spontaneous meow so she feels the page is alive
  setInterval(function () {
    if (document.hidden || !C.catsEnabled) return;
    if (Math.random() < 0.5) {
      bubble.textContent = purrs[(Math.random() * purrs.length) | 0];
      bubble.classList.add("show");
      setTimeout(function () { bubble.classList.remove("show"); }, 1800);
    }
  }, 14000);

  /* ---------- heart bursts on tap ---------------------------------------- */
  function heartBurst(x, y, count) {
    if (C.heartsOnClick === false) return;
    var glyphs = ["💗", "💖", "💕", "❤️", "💞"];
    for (var i = 0; i < (count || 10); i++) {
      var h = el("div", "fheart", glyphs[(Math.random() * glyphs.length) | 0]);
      h.style.left = x + "px"; h.style.top = y + "px";
      h.style.setProperty("--dx", ((Math.random() - 0.5) * 220) + "px");
      h.style.setProperty("--rot", ((Math.random() - 0.5) * 90) + "deg");
      h.style.fontSize = (16 + Math.random() * 18) + "px";
      document.body.appendChild(h);
      (function (node) { setTimeout(function () { node.remove(); }, 1650); })(h);
    }
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest(".ctrl,.cat,.enter,.heartbtn,.lightbox,.frame,button")) return;
    heartBurst(e.clientX, e.clientY, 8);
  });

  /* show the little hint briefly */
  var hint = document.getElementById("loveHint");
  setTimeout(function () { hint.classList.add("show"); }, 3000);
  setTimeout(function () { hint.classList.remove("show"); }, 8000);

  /* ---------- finale celebration ----------------------------------------- */
  function celebrate() {
    startAudioContext();
    var n = 60, i = 0;
    var iv = setInterval(function () {
      heartBurst(Math.random() * innerWidth, innerHeight * (0.5 + Math.random() * 0.5), 4);
      if (++i > n) clearInterval(iv);
    }, 60);
    // a happy trio of meows
    meow(); setTimeout(meow, 260); setTimeout(meow, 540);
    catSpeak();
  }

  /* ---------- lightbox --------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightImg = document.getElementById("lightboxImg");
  function openLightbox(src) { lightImg.src = src; lightbox.classList.add("open"); }
  function closeLightbox() { lightbox.classList.remove("open"); }
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

  /* re-scan reveals once images may have swapped in layout */
  setTimeout(watchReveals, 400);
})();
