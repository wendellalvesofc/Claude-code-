// HYPE CASH Motion 01. One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (ElevenLabs Scribe word timestamps of the narration).
const T = window.TIMING, E = T.emphasis;
const $ = (s) => document.querySelector(s);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function build() {
  const tl = gsap.timeline({ paused: true });

  // ---- helpers
  const scene = (id, a, b) => { tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b); };
  // motion blur: a blur that peaks mid-move and clears as the element settles
  const blurPulse = (el, at, dur, px) => tl.fromTo(el, { filter: `blur(${px}px)` }, { filter: "blur(0px)", duration: dur, ease: "power2.out" }, at);
  const words = (el) => { el.innerHTML = el.textContent.split(" ").map((w) => `<span class="w">${w}</span>`).join(" "); return el.querySelectorAll(".w"); };
  const riseWords = (sel, at, stagger = 0.07) => {
    const el = $(sel); const ws = el.querySelectorAll(".w").length ? el.querySelectorAll(".w") : words(el);
    tl.fromTo(ws, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out", stagger }, at);
  };
  const slam = (sel, at, from = 1.35) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.38, ease: "expo.out" }, at);
  const pop = (sel, at) => tl.fromTo(sel, { scale: 0, rotate: -12, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(2.2)" }, at);
  const leave = (sel, at, y = -50) => tl.to(sel, { y, opacity: 0, filter: "blur(10px)", duration: 0.28, ease: "power2.in" }, at);
  const wipe = (sel, cx, cy, at, dur) => {
    tl.set(sel, { left: cx - 100, top: cy - 100, width: 200, height: 200, scale: 0, visibility: "visible" }, at);
    tl.to(sel, { scale: 24, duration: dur, ease: "power3.in" }, at);
    tl.set(sel, { visibility: "hidden" }, at + dur + 0.02);
  };

  // ================= S1 hook (0 – 3.85): a swarm of videos bursts out of the play icon
  tl.set("#s1", { visibility: "hidden" }, 3.86);   // s1 is visible from the first frame (see CSS)
  const R = rng(9), swarm = $("#swarm"), COLS = [["#ff3fa2", "#3b1263"], ["#3f8fff", "#160d3a"], ["#a83ffe", "#0f2a4a"], ["#ff8a3f", "#3a0f3f"], ["#3fd4ff", "#1a1046"], ["#d4ff3f", "#16283a"]];
  const THUMBS = [];
  for (let i = 0; i < 34; i++) {
    let x, y, tries = 0;
    do { x = 40 + R() * 1000; y = 720 + R() * 900; tries++; } while (Math.hypot(x - 540, y - 1000) < 250 && tries < 50);
    const z = -700 + R() * 820, c = COLS[i % COLS.length];
    const d = document.createElement("div");
    d.className = "thumb"; d.style.background = `linear-gradient(160deg, ${c[0]}, ${c[1]})`;
    d.innerHTML = `<i></i><b style="width:${30 + (i * 37) % 70}%"></b>`;
    const wrap = document.createElement("div"); wrap.style.cssText = `position:absolute; left:0; top:0; filter: blur(${Math.max(0, -z / 140).toFixed(1)}px); opacity:${(0.55 + (z + 700) / 1800).toFixed(2)}`;
    wrap.appendChild(d); swarm.appendChild(wrap);
    THUMBS.push({ d, x, y, z });
  }
  tl.fromTo("#play1", { scale: 1.25, filter: "blur(6px)" }, { scale: 1, filter: "blur(0px)", duration: 0.35, ease: "expo.out" }, 0);
  tl.fromTo("#t1a", { scale: 1.08, y: 10 }, { scale: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0);  // already on screen at frame 0
  slam("#t1b", E.centenas - 0.04);
  THUMBS.forEach((th, i) => {
    const at = i < 12 ? i * 0.025 : E.centenas + 0.02 + (i - 12) * 0.022;
    tl.fromTo(th.d, { x: 420, y: 932, z: 0, scale: 0.35, opacity: i < 12 ? 0.9 : 0, rotate: 0 },
      { x: th.x - 120, y: th.y - 68, z: th.z, scale: 1, opacity: 1, rotate: (i % 5 - 2) * 4, duration: 0.6, ease: "expo.out" }, at);
    blurPulse(th.d, at, 0.5, 10);
    tl.to(th.d, { y: th.y - 68 - 60 * (1 + th.z / 700), duration: 3.35 - (at + 0.6), ease: "none" }, at + 0.6);
  });
  riseWords("#t1c", E.videos - 0.05, 0.09);
  tl.fromTo("#play1", { scale: 1.14 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, .5)" }, E.gta);
  leave(["#t1a", "#t1b", "#t1c"], 3.3);

  // the one video that becomes yours: lifted out of the swarm, a paper wipe opens behind it
  const HERO_START = { x: 690, y: 1290 };
  const lift = document.createElement("div");
  lift.className = "thumb"; lift.style.background = "linear-gradient(160deg, #ff3fa2, #3b1263)";
  lift.innerHTML = `<i></i><b style="width:70%"></b>`;
  $("#heroLift").appendChild(lift);
  tl.fromTo(lift, { x: HERO_START.x - 120, y: HERO_START.y - 68, scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "expo.out" }, E.centenas + 0.4);
  tl.to(lift, { y: HERO_START.y - 128, duration: 2.2, ease: "none" }, E.centenas + 0.9);
  tl.to("#swarm", { opacity: 0.0, scale: 0.9, filter: "blur(14px)", duration: 0.4, ease: "power2.in" }, 3.35);
  tl.to("#play1", { scale: 0.4, opacity: 0, filter: "blur(10px)", duration: 0.35, ease: "power2.in" }, 3.35);
  tl.to(lift, { x: 420, y: 932, scale: 2.6, rotate: 0, duration: 0.5, ease: "expo.inOut" }, 3.35);
  blurPulse(lift, 3.35, 0.5, 8);
  wipe("#w12", 540, 1000, 3.45, 0.38);

  // ================= S2 turn (3.85 – 6.38)
  scene("#s2", 3.85, 6.38);
  tl.set("#hero", { x: 420, y: 932, scale: 2.6 }, 3.85);
  tl.set("#heroShadow", { x: 280, y: 1210 }, 3.85);
  tl.to("#hero", { y: 902, duration: 2.0, ease: "sine.inOut" }, 3.86);
  riseWords("#t2a", E.e_se - 0.06);
  riseWords("#t2b", E.fossem - 0.06, 0.32);
  tl.fromTo("#hero", { rotateY: 0 }, { rotateY: 180, duration: 0.6, ease: "back.out(1.4)" }, E.seus);
  const r = $("#seus").getBoundingClientRect(), base = $("#root").getBoundingClientRect();
  tl.set("#ul2", { left: r.left - base.left, top: r.bottom - base.top - 6, width: r.width, scaleX: 0 }, 3.85);
  tl.to("#ul2", { scaleX: 1, duration: 0.35, ease: "power3.out" }, E.seus + 0.15);
  pop("#rec", E.seus + 0.25);
  tl.to("#rec", { scale: 1.08, duration: 0.25, yoyo: true, repeat: 2, ease: "sine.inOut" }, E.seus + 0.75);
  wipe("#w23", 835, 1205, 6.02, 0.36);

  // ================= S3 product (6.38 – 11.9)
  scene("#s3", 6.38, 11.92);
  tl.fromTo("#bloom", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, E.hypecash);
  const L3 = 600 / 1189;
  tl.fromTo("#logo3", { x: 240, y: 330, scale: L3 * 1.35, opacity: 0, filter: "blur(18px)" },
    { x: 240, y: 330, scale: L3, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, E.hypecash);
  tl.fromTo("#chip3", { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, E.playbook - 0.05);
  const L3b = 380 / 1189;
  tl.to("#logo3", { x: 350, y: 170, scale: L3b, duration: 0.6, ease: "expo.inOut" }, 8.7);
  tl.to("#bloom", { y: -260, scale: 0.6, duration: 0.6, ease: "expo.inOut" }, 8.7);
  tl.to("#chip3", { y: -300, duration: 0.6, ease: "expo.inOut" }, 8.7);
  tl.fromTo("#nodeA", { x: -900, rotateY: 25, opacity: 0 }, { x: 0, rotateY: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, E.assunto - 0.12);
  blurPulse("#nodeA", E.assunto - 0.12, 0.45, 14);
  tl.fromTo("#flowLine", { strokeDashoffset: 0, opacity: 0 }, { opacity: 1, duration: 0.2 }, E.assunto + 0.3);
  tl.fromTo("#flowDot", { attr: { cy: 1080 }, opacity: 0 }, { attr: { cy: 1260 }, opacity: 1, duration: 0.45, ease: "power2.inOut" }, E.assunto + 0.35);
  tl.fromTo("#nodeB", { scale: 0.7, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.8)" }, E.projeto - 0.05);
  tl.to("#nodeB", { boxShadow: "0 0 110px rgba(212,255,63,.45), 0 40px 90px rgba(10,0,30,.45)", duration: 0.4, yoyo: true, repeat: 1 }, E.conteudo);
  wipe("#w34", 540, 1370, 11.5, 0.4);

  // ================= S4 missions (11.9 – 19.6): the real mission cards stack up
  scene("#s4", 11.9, 19.62);
  tl.to("#b4a", { x: 160, y: -200, duration: 7.7, ease: "sine.inOut" }, 11.9);
  tl.to("#b4b", { x: -180, y: 260, duration: 7.7, ease: "sine.inOut" }, 11.9);
  riseWords("#t4", E.missao - 0.05, 0.12);
  const CARDS = [
    { img: "card-01.png", icon: "i-lime", glyph: '<rect x="4" y="4" width="7" height="7" rx="1.5" fill="#15101f"/><rect x="13" y="4" width="7" height="7" rx="1.5" fill="#15101f" opacity=".5"/><rect x="4" y="13" width="7" height="7" rx="1.5" fill="#15101f" opacity=".5"/><rect x="13" y="13" width="7" height="7" rx="1.5" fill="#15101f"/>' },
    { img: "card-02.png", icon: "i-pink", glyph: '<path d="M8 5.5v13l11-6.5z" fill="#fff"/>' },
    { img: "card-05.png", icon: "i-white", glyph: '<circle cx="9" cy="8.5" r="3.2" fill="#5a17c9"/><circle cx="16.5" cy="9.5" r="2.6" fill="#a83ffe"/><path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5zM14 19c.3-2.4 1.6-3.8 3.5-3.8S20.7 16.6 21 19z" fill="#5a17c9"/>' },
    { img: "card-06.png", icon: "i-purple", glyph: '<rect x="4" y="13" width="3.6" height="7" rx="1" fill="#fff"/><rect x="10.2" y="9" width="3.6" height="11" rx="1" fill="#fff"/><rect x="16.4" y="5" width="3.6" height="15" rx="1" fill="#fff"/>' },
  ];
  const ENTER = [E.missao2 - 0.05, E.publicar - 0.1, E.construir - 0.1, E.entender - 0.1];
  const KW = [E.formato - 0.05, E.primeiro - 0.05, E.audiencia - 0.05, E.monetizacao - 0.05];
  const stack = $("#stack"), cardEls = [];
  CARDS.forEach((c, i) => {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img class="shot" src="img/${c.img}"><div class="icon ${c.icon}"><svg viewBox="0 0 24 24">${c.glyph}</svg></div>`;
    stack.appendChild(d); cardEls.push(d);
  });
  cardEls.forEach((d, i) => {
    const at = ENTER[i];
    tl.fromTo(d, { y: 1500, z: 0, rotateX: -35, rotate: i % 2 ? 6 : -6, opacity: 0 }, { y: 760, rotateX: 4, rotate: 0, opacity: 1, duration: 0.6, ease: "expo.out" }, at);
    blurPulse(d, at, 0.5, 18);
    tl.fromTo(d.querySelector(".icon"), { scale: 0, rotate: -30 }, { scale: 1, rotate: -8, duration: 0.55, ease: "back.out(2.4)" }, at + 0.2);
    for (let k = 0; k < i; k++) {        // earlier cards recede up and back
      const back = i - k;
      tl.to(cardEls[k], { y: 760 - 105 * back, z: -240 * back, opacity: Math.max(0.15, 1 - 0.32 * back), filter: `blur(${2.5 * back}px)`, duration: 0.6, ease: "expo.out" }, at);
    }
    tl.fromTo(`#kw${i}`, { y: 40, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, KW[i]);
    if (i < 3) leave(`#kw${i}`, ENTER[i + 1] - 0.05, -30);
  });
  // push out
  tl.set("#s4", { zIndex: 5 }, 19.2);
  tl.to("#s4", { y: -1920, duration: 0.42, ease: "power3.in" }, 19.2);
  tl.to("#s4", { filter: "blur(10px)", duration: 0.42, ease: "power2.in" }, 19.2);

  // ================= S5 phone (19.2 – 23.2): real screens, the only phone moment (~3.5 s)
  scene("#s5", 19.2, 23.25);
  tl.fromTo("#phone", { x: 760, y: 420, rotateY: -45, rotateZ: 14, rotateX: 10, scale: 0.9 }, { x: 0, y: 0, rotateY: -12, rotateZ: -3, rotateX: 6, scale: 0.94, duration: 0.65, ease: "expo.out" }, 19.35);
  blurPulse("#phone", 19.35, 0.55, 22);
  tl.to("#phone", { rotateY: 10, rotateZ: 1, rotateX: 3, duration: 2.6, ease: "sine.inOut" }, 20.0);
  tl.fromTo("#pshadow", { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 0.5 }, 19.45);
  const M1Y = -1189;
  [0, 1, 2, 3].forEach((k) => tl.set(`#m1_${k}`, { y: M1Y }, 19.2));
  tl.set("#m1_4", { y: M1Y - 27 }, 19.2);
  const TICKS = [19.80, 19.97, 20.14, 20.31];
  [1, 2, 3, 4].forEach((k) => tl.fromTo(`#m1_${k}`, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: true }, TICKS[k - 1]));
  tl.fromTo("#pgAfter", { x: 512 }, { x: 0, duration: 0.32, ease: "power3.out" }, E.progresso - 0.08);
  const PX = 512 / 430;
  tl.set("#hlP", { left: 16 * PX - 4, top: 22 + 285 * PX - 4, width: 398 * PX + 8, height: 87 * PX + 8, opacity: 0 }, 19.2);
  tl.to("#hlP", { opacity: 1, duration: 0.2 }, E.progresso + 0.3);
  tl.fromTo("#pgTools", { x: 512 }, { x: 0, duration: 0.32, ease: "power3.out" }, E.central - 0.1);
  tl.fromTo("#toolsImg", { y: 0 }, { y: -320, duration: 1.1, ease: "power1.inOut" }, E.central + 0.3);
  [["#tg0", E.checklist - 0.05], ["#tg1", E.progresso - 0.02], ["#tg2", E.central - 0.02]].forEach(([s, at]) => {
    tl.fromTo(s, { x: s === "#tg1" ? 120 : -120, opacity: 0, filter: "blur(12px)" }, { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, at);
    tl.fromTo(`${s} .icon`, { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2.4)" }, at + 0.05);
  });
  tl.to("#phone", { y: -1700, rotateX: -35, rotateZ: -10, duration: 0.45, ease: "power3.in" }, 22.75);
  blurPulse("#phone", 22.75, 0.01, 0);
  tl.to("#phone", { filter: "blur(14px)", duration: 0.45, ease: "power2.in" }, 22.75);
  tl.to(["#tg0", "#tg1", "#tg2"], { opacity: 0, x: 0, scale: 0.8, filter: "blur(10px)", duration: 0.3, ease: "power2.in", stagger: 0.04 }, 22.75);
  tl.to("#pshadow", { opacity: 0, duration: 0.3 }, 22.75);

  // ================= S6 honest framing (23.0 – 26.8): paper panel rises over the phone scene
  scene("#s6", 22.95, 26.8);
  tl.fromTo("#s6", { clipPath: "inset(100% 0% 0% 0% round 0px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.35, ease: "power3.inOut" }, 22.95);
  riseWords("#t6a", E.sem - 0.08, 0.08);
  slam("#t6b", E.dinheiro - 0.08, 1.25);
  const r6 = $("#t6b").getBoundingClientRect();
  tl.set("#strike", { left: 120, top: 720 + 62, width: 840, scaleX: 0 }, 22.95);
  tl.to("#strike", { scaleX: 1, duration: 0.3, ease: "power3.out" }, E.facil);
  tl.to(["#t6a", "#t6b", "#strike"], { y: 70, opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "power2.in", stagger: 0.03 }, 24.85);
  riseWords("#t6c", 25.02);
  slam("#t6d", E.plano - 0.08, 1.5);
  pop("#start6", E.plano + 0.1);
  tl.fromTo("#path6", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "power2.inOut" }, E.plano + 0.2);
  pop("#flag", E.comecar);
  riseWords("#t6e", E.comecar - 0.05, 0.1);
  wipe("#w67", 905, 1135, 26.4, 0.38);

  // ================= S7 CTA (26.8 – 30)
  scene("#s7", 26.8, 30.1);
  tl.fromTo("#bloom7", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, ease: "expo.out" }, E.conheca);
  const L7 = 760 / 1189;
  tl.fromTo("#logo7", { x: 160, y: 380, scale: L7 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 160, y: 380, scale: L7, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, E.conheca);
  tl.to("#logo7", { scale: L7 * 1.03, duration: 2.6, ease: "sine.inOut" }, E.conheca + 0.5);
  riseWords("#t7a", 27.35, 0.04);
  tl.fromTo("#btn", { y: 60, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 27.7);
  tl.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut" }, 28.0);
  tl.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut", immediateRender: false }, 29.2);
  tl.fromTo("#cursor", { x: 980, y: 1720, opacity: 0 }, { x: 760, y: 1222, opacity: 1, duration: 0.55, ease: "expo.out" }, 28.0);
  tl.to("#cursor", { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 }, 28.62);
  tl.to("#btn", { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 }, 28.62);
  tl.fromTo("#ripple", { x: 712, y: 1180, scale: 0.3, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 0.55, ease: "power2.out" }, 28.64);
  tl.set("#ripple", { opacity: 0 }, 0);
  tl.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 28.0);

  // grain, stepped 12 fps
  for (let f = 0; f < 30 * 12; f++) tl.set("#grain", { x: (f * 73) % 200, y: (f * 131) % 200 }, f / 12);
  return tl;
}

window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  const tl = build();
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  window.seek = (t) => { tl.seek(t, false); };
  tl.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
