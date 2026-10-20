// HYPE CASH AD 01. Every visual property is a pure function of t (seconds), so window.seek(t) always
// produces the same frame regardless of what was rendered before. Times come from timing.json (word timestamps).
const T = window.TIMING;
const E = T.emphasis;
const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------------ math
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = {
  lin: (k) => k,
  in: (k) => k * k * k,
  out: (k) => 1 - Math.pow(1 - k, 3),
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  outBack: (k) => { const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
};
const prog = (t, a, b, e = ease.out) => e(clamp((t - a) / (b - a)));

// keys: [[time, {prop: value}, easeName?], ...]; the ease of a key shapes the segment that ends on it.
function track(t, keys) {
  if (t <= keys[0][0]) return { ...keys[0][1] };
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const k = (ease[e1 || "inOut"])(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
      const o = {};
      for (const p in v1) o[p] = lerp(v0[p] ?? v1[p], v1[p], k);
      return { ...v0, ...o };
    }
  }
  return { ...keys[keys.length - 1][1] };
}

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ------------------------------------------------------------------ text helper
// Visible on [a, b): enters with rise + unblur, leaves with lift + blur.
function show(el, t, a, b, { dy = 46, inDur = 0.32, outDur = 0.24, scale0 = 1.06, slam = false } = {}) {
  if (t < a - 0.001 || t > b + outDur) { el.style.opacity = 0; el.style.visibility = "hidden"; return 0; }
  el.style.visibility = "visible";
  const ki = slam ? prog(t, a, a + 0.22, ease.outBack) : prog(t, a, a + inDur, ease.out);
  const ko = prog(t, b, b + outDur, ease.in);
  const op = clamp(slam ? (t - a) / 0.08 : ki) * (1 - ko);
  const y = (1 - ki) * dy - ko * dy * 0.8;
  const sc = slam ? lerp(1.35, 1, ki) : lerp(scale0, 1, ki);
  const blur = (1 - clamp(ki * 1.4)) * 14 + ko * 10;
  el.style.opacity = op;
  el.style.transform = `translateY(${y}px) scale(${sc})`;
  el.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
  return op;
}

// ------------------------------------------------------------------ build: feed (original UI, no third-party marks)
const FEED = [
  ["Trailer 2: detalhes escondidos", "Canal Gamer BR", "há 2 h", ["#ff3fa2", "#3b1263"]],
  ["Data de lançamento?", "notícias.games", "há 5 h", ["#3f8fff", "#160d3a"]],
  ["Mapa completo explicado", "mapas.br", "há 1 dia", ["#a83ffe", "#0f2a4a"]],
  ["10 teorias insanas", "teoria.play", "há 1 dia", ["#ff8a3f", "#3a0f3f"]],
  ["React ao vivo", "live.react", "ao vivo", ["#ff3f5a", "#1d0c2e"]],
  ["Tudo que sabemos", "Canal Gamer BR", "há 2 dias", ["#3fd4ff", "#1a1046"]],
  ["Personagens novos", "lore.gg", "há 2 dias", ["#d4ff3f", "#16283a"]],
  ["Vale a pena esperar?", "opinião.games", "há 3 dias", ["#ff3fa2", "#0c1e3f"]],
  ["Easter eggs do trailer", "detalhes.br", "há 3 dias", ["#a83ffe", "#2a0d2a"]],
  ["Guia do mapa de GTA VI", "mapas.br", "há 4 dias", ["#ff3fa2", "#2b0f55"]],
  ["Carros confirmados", "garagem.gg", "há 4 dias", ["#3f8fff", "#2a0c22"]],
  ["Física nova?", "teoria.play", "há 5 dias", ["#3fd4ff", "#2e0f3f"]],
  ["Online: o que muda", "notícias.games", "há 6 dias", ["#ff8a3f", "#14143a"]],
  ["Ranking de trailers", "lore.gg", "há 1 sem.", ["#a83ffe", "#0e2638"]],
];
const HERO_I = 9, PITCH = 380, LIST_TOP = 100, HERO_TOP = 386;
function thumbStyle([c1, c2], i) {
  const sx = 70 + (i * 37) % 300, sy = 60 + (i * 53) % 90;
  return `background:
    radial-gradient(circle at ${sx}px ${sy}px, rgba(255,226,140,.95) 0 46px, rgba(255,160,90,.35) 48px, transparent 120px),
    repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 3px, transparent 3px 14px) 0 170px / 100% 100px no-repeat,
    linear-gradient(180deg, ${c1} 0%, ${c2} 78%);`;
}
const list = $("feedlist");
FEED.forEach((f, i) => {
  const d = document.createElement("div");
  d.className = "fcard"; d.id = `fc${i}`; d.style.top = `${i * PITCH}px`;
  d.innerHTML = `<div class="thumb" style="${thumbStyle(f[3], i)}"><div class="tt">${f[0]}</div><div class="dur">${8 + (i * 7) % 15}:${String((i * 23) % 60).padStart(2, "0")}</div><div class="seen" id="seen${i}"></div></div>
    <div class="meta"><div class="ava" style="background: linear-gradient(135deg, ${f[3][0]}, ${f[3][1]})"></div>
    <div><div class="mt">${f[0]}</div><div class="ms">${f[1]} · ${f[2]}</div></div></div>`;
  list.appendChild(d);
});
// hero copy of card 9
{
  const f = FEED[HERO_I];
  $("heroThumb").setAttribute("style", thumbStyle(f[3], HERO_I));
  $("heroTitle").textContent = f[0];
  $("heroMt").textContent = f[0];
  $("heroMs").textContent = `${f[1]} · ${f[2]}`;
  $("heroAvaOld").style.background = `linear-gradient(135deg, ${f[3][0]}, ${f[3][1]})`;
}

// bokeh
const BOKEH = [];
{
  const r = rng(7), host = $("bokeh"), cols = ["255,63,162", "63,143,255", "168,63,254", "63,212,255"];
  for (let i = 0; i < 18; i++) {
    const d = document.createElement("div"); d.className = "dot";
    const size = 30 + r() * 110, c = cols[i % cols.length];
    d.style.width = d.style.height = `${size}px`;
    d.style.background = `radial-gradient(circle, rgba(${c},.55) 0%, rgba(${c},.12) 45%, rgba(${c},0) 70%)`;
    host.appendChild(d);
    BOKEH.push({ d, x: r() * 1080, y: r() * 1920, sp: 12 + r() * 30, ph: r() * 6.28, a: 0.25 + r() * 0.45 });
  }
}

// ------------------------------------------------------------------ geometry of the real screens
// Captures are 430 CSS px wide; on the 512 px phone screen 1 CSS px = 512/430 px, below a 22 px status bar.
const PX = 512 / 430, TOPBAR = 22;
const MAP_MAX = 1583 - 932, M1_MAX = 1949 - 932;
const CARDS = { 1: [404, 139], 2: [559, 121], 3: [696, 121], 4: [832, 139], 5: [987, 139], 6: [1142, 139], 7: [1296, 139] };
const BADGE = [116, 122, 200, 36]; // "PLAYBOOK INTERATIVO" pill on the map (x, y, w, h in CSS px)
const scr = (cssY, scroll) => TOPBAR + (cssY - scroll) * PX;
function placeHl(el, [x, y, w, h], scroll, op) {
  el.style.left = `${x * PX - 4}px`; el.style.top = `${scr(y, scroll) - 4}px`;
  el.style.width = `${w * PX + 8}px`; el.style.height = `${h * PX + 8}px`; el.style.opacity = op;
}
// phone-local y (0..1180) of a CSS y on screen, and the phone center Y that puts it at canvas y
const localY = (cssY, scroll) => 24 + scr(cssY, scroll);
const centerFor = (cssY, scroll, canvasY, s) => canvasY - (localY(cssY, scroll) - 590) * s;

// ------------------------------------------------------------------ timeline data
const FLIP = 6.42;
const S4 = [
  { at: E.formato - 0.6, card: 1, label: "t4s0" },
  { at: E.publicar, card: 2, label: "t4s1" },
  { at: E.construir, card: 5, label: "t4s2" },
  { at: E.entender, card: 6, label: "t4s3" },
];
const mapScrollFor = (card) => clamp(CARDS[card][0] - 300, 0, MAP_MAX);
const TICKS = [19.80, 19.98, 20.16, 20.34];
const P_M1 = 19.55, P_AFTER = E.progresso - 0.05, P_TOOLS = E.central - 0.06, P_BACK = 22.95;
const S4_Y = centerFor(250, 0, 924, 1.42);

function phoneAt(t) {
  const big = 1.42;
  const keys = [
    [0, { x: 540, y: 1150, z: 0, rx: 10, ry: -16, rz: -3, s: 0.98 }],
    [3.3, { x: 540, y: 1120, z: 0, rx: 7, ry: -8, rz: -2, s: 1.0 }, "inOut"],
    [4.1, { x: 540, y: 1150, z: 0, rx: 4, ry: 0, rz: 0, s: 1.0 }, "inOut"],
    [5.95, { x: 540, y: 1170, z: 0, rx: 3, ry: 3, rz: 0, s: 1.0 }, "inOut"],
    [FLIP, { x: 540, y: 1260, z: 0, rx: 4, ry: -90, rz: 0, s: 0.92 }, "in"],
    [FLIP + 0.0001, { x: 540, y: 1260, z: 0, rx: 4, ry: 90, rz: 0, s: 0.92 }],
    [7.15, { x: 540, y: 1300, z: 0, rx: 5, ry: 8, rz: -2, s: 0.9 }, "out"],
    [11.5, { x: 540, y: 1290, z: 0, rx: 6, ry: -6, rz: -1, s: 0.92 }, "inOut"],
    [12.55, { x: 540, y: S4_Y, z: 0, rx: 2, ry: -3, rz: 0, s: big }, "inOut"],
    [19.2, { x: 540, y: S4_Y, z: 0, rx: 2, ry: 3, rz: 0, s: big }, "inOut"],
    [P_M1 + 0.35, { x: 540, y: centerFor(640, 0, 1160, 1.3), z: 0, rx: 3, ry: -3, rz: 0, s: 1.3 }, "inOut"],
    [P_AFTER, { x: 540, y: centerFor(640, 0, 1160, 1.3), z: 0, rx: 3, ry: 0, rz: 0, s: 1.3 }, "inOut"],
    [P_AFTER + 0.35, { x: 540, y: centerFor(420, 0, 1080, 1.3), z: 0, rx: 3, ry: 2, rz: 0, s: 1.3 }, "inOut"],
    [P_BACK, { x: 540, y: centerFor(420, 0, 1080, 1.3), z: 0, rx: 3, ry: -2, rz: 0, s: 1.3 }, "inOut"],
    [23.7, { x: 560, y: 1340, z: 0, rx: 14, ry: 22, rz: 4, s: 0.78 }, "inOut"],
    [26.55, { x: 560, y: 1320, z: 0, rx: 10, ry: 14, rz: 2, s: 0.8 }, "inOut"],
    [27.1, { x: 560, y: 2500, z: 0, rx: 34, ry: 10, rz: 8, s: 0.8 }, "in"],
  ];
  return track(t, keys);
}

function feedScroll(t) {
  // thumb flicks with momentum; the last one settles card 9 in the middle of the screen
  const flicks = [[-0.3, 570], [0.45, 570], [1.15, 570], [1.85, 570], [2.55, 570]];
  const total = LIST_TOP + HERO_I * PITCH - HERO_TOP;
  flicks.push([3.12, total - 570 * 5]);
  let y = 0;
  for (const [ti, d] of flicks) if (t > ti) y += d * (1 - Math.exp(-(t - ti) / 0.22));
  else if (ti < 0) y += d;
  return y;
}

// page visibility with a horizontal "navigate" slide (new page enters from the right)
function pageSlide(el, t, a, b, { slideIn = true, slideOut = false } = {}) {
  if (t < a || t >= b + 0.3) { el.style.visibility = "hidden"; return; }
  el.style.visibility = "visible";
  const ki = slideIn ? prog(t, a, a + 0.28, ease.out) : 1;
  const ko = slideOut ? prog(t, b, b + 0.28, ease.out) : (t >= b ? 1 : 0);
  el.style.transform = `translateX(${(1 - ki) * 512 - ko * 160}px)`;
  el.style.opacity = slideOut ? 1 - ko * 0.6 : (t >= b ? 0 : 1);
  el.style.zIndex = Math.round(a * 10);
}

// ------------------------------------------------------------------ frame
function render(t) {
  // ---------- background
  const bgOut = prog(t, 26.35, 26.9, ease.inOut);
  $("bgCity").style.opacity = 1 - bgOut;
  $("bgCity").style.transform = `scale(${1.08 + t * 0.004}) translateY(${-t * 3}px)`;
  const sharp = prog(t, FLIP, FLIP + 0.5) * (1 - prog(t, 11.6, 12.4, ease.inOut));
  $("bgCitySharp").style.opacity = sharp * 0.85 * (1 - bgOut);
  $("bgCitySharp").style.transform = `scale(${1.1 + t * 0.004})`;
  $("bgCar").style.opacity = bgOut;
  $("bgCar").style.transform = `scale(${1.12 - prog(t, 26.4, 30, ease.out) * 0.08})`;
  const dark = 0.25 + 0.35 * prog(t, 22.9, 23.5) * (1 - prog(t, 26.3, 26.8)) + 0.2 * prog(t, 12, 12.6) * (1 - prog(t, 22.8, 23.3));
  $("tint").style.background = `linear-gradient(180deg, rgba(10,6,18,${0.55 + dark * 0.4}) 0%, rgba(10,6,18,${dark}) 38%, rgba(10,6,18,${0.35 + dark * 0.5}) 100%)`;

  for (const b of BOKEH) {
    const y = ((b.y - t * b.sp) % 2100 + 2100) % 2100 - 90;
    const x = b.x + Math.sin(t * 0.6 + b.ph) * 26;
    b.d.style.transform = `translate(${x}px, ${y}px)`;
    b.d.style.opacity = b.a * (0.75 + 0.25 * Math.sin(t * 1.3 + b.ph)) * (1 - 0.6 * prog(t, 26.4, 27));
  }

  // ---------- phone
  const p = phoneAt(t);
  $("rig").style.transform = `translate3d(${p.x - 280}px, ${p.y - 590}px, ${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s})`;
  const sh = $("shadow");
  sh.style.transform = `translate(${p.x - 280}px, ${p.y + 590 * p.s - 70}px) scale(${p.s * (1 - Math.abs(p.ry) / 300)}, ${p.s})`;
  sh.style.opacity = clamp(1 - (p.y + 590 * p.s - 1920) / 300) * 0.8;
  $("glare").style.background = `linear-gradient(${112 + p.ry * 0.6}deg, rgba(255,255,255,0) ${28 + p.ry * 0.5}%, rgba(255,255,255,.10) ${40 + p.ry * 0.5}%, rgba(255,255,255,.02) ${52 + p.ry * 0.5}%, rgba(255,255,255,0) 70%)`;
  $("dim").style.opacity = 0.5 * prog(t, 23.0, 23.7) + 0.45 * prog(t, E.deles, E.deles + 0.3) * (1 - prog(t, 5.9, 6.3)) + (Math.abs(p.ry) > 60 ? (Math.abs(p.ry) - 60) / 60 : 0);

  // feed page
  const feedOn = t < FLIP;
  $("feed").style.visibility = feedOn ? "visible" : "hidden";
  if (feedOn) {
    const fy = feedScroll(t);
    $("feedlist").style.transform = `translateY(${-fy}px)`;
    for (let i = 0; i < FEED.length; i++) {
      // a card counts as "watched" once it has scrolled past the top of the screen
      const top = LIST_TOP + i * PITCH - fy;
      $(`seen${i}`).style.width = `${clamp((200 - top) / 300) * 100}%`;
    }
    $(`fc${HERO_I}`).style.opacity = 1 - prog(t, E.deles, E.deles + 0.15);
  }

  // real screens
  pageSlide($("pMap"), t, FLIP, P_M1, { slideIn: false });
  let ms = 0;
  if (t >= 11.9) {
    ms = prog(t, 11.95, 12.9, ease.inOut) * 90;
    for (const st of S4) if (t >= st.at - 0.1) ms = lerp(ms, mapScrollFor(st.card), prog(t, st.at - 0.1, st.at + 0.4, ease.inOut));
  }
  $("pMap").querySelector("img").style.transform = `translateY(${-ms * PX}px)`;
  // highlight: badge in S3, mission cards in S4
  const hl = $("hlMap");
  const badgeOp = prog(t, E.playbook, E.playbook + 0.2) * (1 - prog(t, 8.9, 9.2));
  let rect = BADGE, cardOp = 0;
  if (t >= S4[0].at - 0.1) {
    let r = [16, ...CARDS[1]].slice();
    r = [16, CARDS[1][0], 398, CARDS[1][1]];
    for (const st of S4) {
      if (t >= st.at - 0.1) {
        const k = prog(t, st.at - 0.1, st.at + 0.4, ease.inOut);
        const to = [16, CARDS[st.card][0], 398, CARDS[st.card][1]];
        r = r.map((v, j) => lerp(v, to[j], k));
      }
    }
    rect = r;
    cardOp = prog(t, S4[0].at, S4[0].at + 0.25) * (1 - prog(t, 19.15, 19.4));
  }
  placeHl(hl, rect, rect === BADGE ? 0 : ms, Math.max(badgeOp, cardOp) * (0.8 + 0.2 * Math.sin(t * 9)));

  // mission 01 checklist, ticked one item at a time (real captures of each state)
  pageSlide($("pM1"), t, P_M1, P_AFTER);
  for (let k = 0; k <= 4; k++) {
    const im = $(`m1_${k}`);
    const on = k === 0 ? 1 : prog(t, TICKS[k - 1], TICKS[k - 1] + 0.06, ease.lin);
    im.style.opacity = on;
    im.style.transform = `translateY(${-M1_MAX * PX - (k === 4 ? 27 : 0)}px)`;
  }
  pageSlide($("pAfter"), t, P_AFTER, 99, { slideIn: true });
  if (t >= P_TOOLS && t < P_BACK) $("pAfter").style.visibility = "hidden";
  const hlA = $("hlAfter");
  placeHl(hlA, [16, 285, 398, 87], 0, prog(t, P_AFTER + 0.25, P_AFTER + 0.45) * (1 - prog(t, P_TOOLS - 0.1, P_TOOLS)));
  pageSlide($("pTools"), t, P_TOOLS, P_BACK, { slideOut: true });
  $("pTools").querySelector("img").style.transform = `translateY(${-prog(t, P_TOOLS + 0.3, P_BACK + 0.3, ease.inOut) * 230 * PX}px)`;
  if (t >= P_BACK) { $("pAfter").style.zIndex = 400; $("pAfter").style.transform = "none"; $("pAfter").style.opacity = prog(t, P_BACK, P_BACK + 0.3); }

  // ---------- hero card (S2)
  const hero = $("hero");
  if (t >= E.deles && t < 6.45) {
    hero.style.visibility = "visible";
    const up = prog(t, E.deles, E.deles + 0.55, ease.outBack);
    const back = prog(t, 5.95, 6.38, ease.in);
    const cx = lerp(lerp(p.x, 540, up), p.x, back), cy = lerp(lerp(p.y, 925, up), p.y, back);
    const k = lerp(lerp(p.s, 1.5, up), p.s * 0.6, back);
    const z = lerp(up * 240, 0, back);
    hero.style.transform = `translate3d(${cx - 240}px, ${cy - 180}px, ${z}px) rotateX(${(1 - up) * 3}deg) rotateZ(${-2.5 * up}deg) scale(${k})`;
    hero.style.opacity = clamp((t - E.deles) / 0.06) * (1 - back);
    const you = prog(t, E.seus - 0.05, E.seus + 0.2);
    $("heroMetaOld").style.opacity = 1 - you;
    $("heroMetaYou").style.opacity = you;
    $("heroRec").style.opacity = you * (0.6 + 0.4 * (Math.floor(t * 2.5) % 2));
  } else hero.style.visibility = "hidden";

  // ---------- type
  show($("t1a"), t, -0.12, 3.32, { slam: true });
  show($("t1b"), t, E.centenas - 0.04, 3.32, { slam: true });
  show($("t1c"), t, E.gta - 0.04, 3.32, { slam: true });
  show($("t2a"), t, E.e_se - 0.05, 5.98);
  show($("t2b"), t, E.seus - 0.08, 5.98, { slam: true });
  $("seusLine").style.width = "100%";
  $("seusLine").style.transform = `scaleX(${prog(t, E.seus + 0.1, E.seus + 0.45)})`;

  // logo
  const logo = $("logo");
  const lin = prog(t, E.hypecash, E.hypecash + 0.3, ease.outBack), lout = prog(t, 8.85, 9.15, ease.in);
  const lin7 = prog(t, E.conheca - 0.05, E.conheca + 0.3, ease.outBack);
  if (t >= E.hypecash && t < 9.2) {
    const w = 600 * lerp(1.3, 1, lin) * lerp(1, 0.6, lout);
    logo.style.opacity = clamp((t - E.hypecash) / 0.06) * (1 - lout);
    logo.style.transform = `translate(${540 - w / 2}px, ${215 - lout * 40 + (600 - w) * 0.35}px) scale(${w / 1189})`;
    logo.style.visibility = "visible";
  } else if (t >= E.conheca - 0.05) {
    const w = 760 * lerp(1.3, 1, lin7) * (1 + 0.012 * Math.sin((t - 27) * 3));
    logo.style.opacity = clamp((t - E.conheca + 0.05) / 0.08);
    logo.style.transform = `translate(${540 - w / 2}px, ${300 + (760 - w) * 0.35}px) scale(${w / 1189})`;
    logo.style.visibility = "visible";
  } else logo.style.visibility = "hidden";

  show($("t3a"), t, E.playbook - 0.06, 8.85, { dy: 24 });
  show($("t3b"), t, E.assunto - 0.1, 11.6, { dy: 24 });
  show($("t3c"), t, E.projeto - 0.1, 11.6, { slam: true });
  show($("t4a"), t, E.missao - 0.08, S4[0].at - 0.1, { slam: true });
  S4.forEach((st, i) => show($(st.label), t, st.at - 0.04, i < 3 ? S4[i + 1].at - 0.12 : 19.25, { dy: 30 }));
  show($("t5a"), t, E.checklist - 0.1, E.progresso - 0.12, { slam: true });
  show($("t5b"), t, E.progresso - 0.06, E.central - 0.14, { slam: true });
  show($("t5c"), t, E.central - 0.06, 22.85, { slam: true });
  show($("t6a"), t, E.sem - 0.06, 24.95);
  show($("t6b"), t, E.dinheiro - 0.12, 24.95, { slam: true });
  $("strike").style.width = "calc(100% + 20px)";
  $("strike").style.transform = `scaleX(${prog(t, E.facil, E.facil + 0.3, ease.out)})`;
  show($("t6c"), t, 25.06, 26.45);
  show($("t6d"), t, E.plano - 0.08, 26.45, { slam: true });
  $("planoLine").style.width = "100%";
  $("planoLine").style.transform = `scaleX(${prog(t, E.plano + 0.15, E.plano + 0.5)})`;

  // ---------- CTA
  show($("t7a"), t, E.conheca + 0.25, 40, { dy: 24 });
  const btn = $("btn");
  const bi = prog(t, 27.15, 27.5, ease.outBack);
  const press = prog(t, 28.3, 28.38, ease.out) * (1 - prog(t, 28.38, 28.6, ease.out));
  btn.style.opacity = clamp((t - 27.15) / 0.1);
  btn.style.transform = `scale(${lerp(0.82, 1, bi) * (1 + 0.018 * Math.sin((t - 27.5) * 5.5) * prog(t, 27.6, 28)) * (1 - 0.05 * press)})`;
  btn.style.visibility = t >= 27.15 ? "visible" : "hidden";
  const shineK = ((t - 27.6) % 1.6) / 0.6;
  $("shine").style.left = `${-200 + clamp(shineK) * 1300}px`;
  const tap = $("tap"), tk = prog(t, 28.3, 28.85, ease.out);
  tap.style.visibility = t >= 28.3 && t < 28.85 ? "visible" : "hidden";
  tap.style.left = "700px"; tap.style.top = "1125px";
  tap.style.transform = `scale(${0.4 + tk * 1.4})`; tap.style.opacity = 1 - tk;
  show($("hint"), t, 27.7, 40, { dy: 16 });
  show($("legal"), t, 27.9, 40, { dy: 10 });

  // ---------- fx
  const fl = Math.max(0.85 * (1 - prog(t, E.hypecash, E.hypecash + 0.4, ease.out)) * (t >= E.hypecash ? 1 : 0),
    0.5 * (1 - prog(t, E.conheca, E.conheca + 0.35, ease.out)) * (t >= E.conheca ? 1 : 0));
  $("flash").style.opacity = fl;
  const sw = $("sweep");
  const swk = t < 20 ? prog(t, E.hypecash + 0.1, E.hypecash + 0.75, ease.inOut) : prog(t, E.conheca + 0.15, E.conheca + 0.85, ease.inOut);
  sw.style.transform = `translate(${-400 + swk * 1900}px, -300px) rotate(18deg)`;
  sw.style.opacity = swk > 0 && swk < 1 ? 1 : 0;

  // top scrim keeps the labels readable while the phone fills the frame
  $("scrim").style.opacity = prog(t, 12.2, 12.6) * (1 - prog(t, 22.9, 23.4));

  const f = Math.floor(t * T.fps);
  $("grain").style.transform = `translate(${(f * 73) % 200}px, ${(f * 131) % 200}px)`;
}

// ------------------------------------------------------------------ boot
window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "900 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  window.seek = (t) => render(t);
  render(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length };
})();
