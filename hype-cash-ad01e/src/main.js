// HYPE CASH Motion 01 C ("Do caos à ordem"). One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (faster-whisper word timestamps of the ElevenLabs narration).
const T = window.TIMING, E = T.emphasis;
const $ = (s) => document.querySelector(s);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function build() {
  const tl = gsap.timeline({ paused: true });

  // ---- helpers
  const scene = (id, a, b) => { tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b); };
  const rise = (els, at, stagger = 0.07) => tl.fromTo(els, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out", stagger }, at);
  const riseOn = (sel, times) => $(sel).querySelectorAll(".w").forEach((w, i) => rise(w, times[i] - 0.06));
  const slam = (sel, at, from = 1.35) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.38, ease: "expo.out" }, at);
  const pop = (sel, at, s = 1) => tl.fromTo(sel, { scale: 0, rotate: -14, opacity: 0 }, { scale: s, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(2.4)" }, at);
  const leave = (sel, at, y = -60) => tl.to(sel, { y, opacity: 0, filter: "blur(10px)", duration: 0.26, ease: "power2.in" }, at);
  // hard-cut color block: slides up over the old scene, the new scene is swapped in underneath, then it leaves through the top
  const slab = (sel, at) => {
    tl.set(sel, { visibility: "visible", y: 1920 }, at);
    tl.to(sel, { y: 0, duration: 0.22, ease: "power3.in" }, at);
    tl.to(sel, { y: -1920, duration: 0.26, ease: "power3.out" }, at + 0.24);
    tl.set(sel, { visibility: "hidden" }, at + 0.52);
  };
  tl.set(".blk", { y: 1920 }, 0);

  // ================= S1 hook (0 – 3.85): "Quer criar conteúdo sobre GTA 6, mas não sabe por onde começar?"
  // frame 0: pink block, the headline and a knot of doubt already drawing itself
  tl.set("#s1", { visibility: "hidden" }, 3.98);
  const R = rng(6), P = [];
  for (let i = 0; i < 46; i++) { const a = R() * Math.PI * 2, r = 120 + R() * 250; P.push([540 + Math.cos(a) * r * 1.15, 1230 + Math.sin(a) * r]); }
  let d = `M${P[0][0].toFixed(0)} ${P[0][1].toFixed(0)}`;
  for (let i = 1; i < P.length - 2; i++) {     // Catmull-Rom through the points → smooth scribble
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(0)} ${c1[1].toFixed(0)} ${c2[0].toFixed(0)} ${c2[1].toFixed(0)} ${p2[0].toFixed(0)} ${p2[1].toFixed(0)}`;
  }
  const kp = $("#knotPath"); kp.setAttribute("d", d);
  const KL = kp.getTotalLength();
  kp.style.strokeDasharray = `${KL}`;
  tl.fromTo(kp, { strokeDashoffset: KL * 0.82 }, { strokeDashoffset: 0, duration: 3.6, ease: "none" }, 0);
  tl.fromTo("#knot", { rotate: -4, transformOrigin: "540px 1230px" }, { rotate: 6, duration: 3.9, ease: "sine.inOut" }, 0);
  tl.fromTo("#qm", { scale: 1, rotate: -8 }, { scale: 1.06, rotate: 8, duration: 0.45, yoyo: true, repeat: 7, ease: "sine.inOut" }, 0);
  tl.fromTo("#t1a", { x: -20 }, { x: 0, duration: 0.6, ease: "expo.out" }, 0);   // on screen at frame 0
  riseOn("#t1b", [E.mas, E.mas + 0.1, E.sabe, E.sabe + 0.18, E.onde]);
  slam("#t1c", E.comecar - 0.05, 1.3);
  tl.to("#knot", { scale: 1.08, transformOrigin: "540px 1230px", duration: 0.1, yoyo: true, repeat: 3, ease: "power1.inOut" }, E.comecar + 0.1);
  slab("#b12", 3.74);

  // ================= S2 (3.98 – 9.95): the questions pile up in a mess…
  scene("#s2", 3.98, 9.98);
  const CARDS = [["#q0", E.rede, [50, 830, -7]], ["#q1", E.formato, [200, 1090, 6]], ["#q2", E.oque, [90, 1330, -4]]];
  CARDS.forEach(([s, at, [x, y, r]], i) => {
    tl.fromTo(s, { x: x + (i % 2 ? 300 : -300), y: y + 200, rotate: r * 4, scale: 1.3, opacity: 0 },
      { x, y, rotate: r, scale: 1, opacity: 1, duration: 0.42, ease: "back.out(1.6)" }, at - 0.12);
    for (let k = 0; k < i; k++) tl.to(CARDS[k][0], { x: `+=${(k % 2 ? 1 : -1) * 14}`, rotate: `+=${(k % 2 ? 2 : -2)}`, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, at - 0.02);
    tl.fromTo(`${s} .icon`, { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2.6)" }, at);
  });
  // …then the Hype Cash answers them in the right order
  const L3 = 420 / 1189;
  tl.fromTo("#logo3", { x: 330, y: 170, scale: L3 * 1.4, opacity: 0, filter: "blur(16px)" }, { x: 330, y: 170, scale: L3, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, E.hypecash - 0.06);
  const ORDER = 8.86;
  CARDS.forEach(([s], i) => {
    tl.to(s, { x: 140, y: 800 + i * 245, rotate: 0, boxShadow: "14px 14px 0 #d4ff3f", duration: 0.5, ease: "back.out(1.4)" }, ORDER + i * 0.06);
    tl.to(`${s} .tx`, { opacity: 0, y: -20, duration: 0.15 }, ORDER + 0.1 + i * 0.06);
    tl.fromTo(`${s} .ans`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" }, ORDER + 0.22 + i * 0.06);
    tl.fromTo(`${s} .num`, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(3)" }, ORDER + 0.3 + i * 0.08);
    tl.fromTo(`${s} .ck`, { opacity: 0, scale: 0, rotate: -40 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease: "back.out(3)" }, E.certa + i * 0.12);
  });
  riseOn("#t3", [E.ordem - 0.12, E.ordem, E.certa]);
  slab("#b34", 9.74);

  // ================= S4 (9.98 – 13.92): the only phone moment (~3.6 s), real screens, flat sticker phone on blue
  scene("#s4", 9.98, 13.92);
  riseOn("#t4", [E.playbook, E.interativo]);
  tl.fromTo("#phone", { y: 1300, rotate: 10 }, { y: 0, rotate: -3, duration: 0.6, ease: "back.out(1.3)" }, 10.05);
  tl.to("#phone", { rotate: 2, duration: 3.2, ease: "sine.inOut" }, 10.65);
  const W = 496, M1Y = -1189 * W / 512;
  [0, 1, 2, 3].forEach((k) => tl.set(`#m1_${k}`, { y: M1Y }, 0));
  tl.set("#m1_4", { y: M1Y - 27 * W / 512 }, 0);
  tl.set(["#pgM1", "#pgProg"], { x: W }, 0);
  tl.to("#pgM1", { x: 0, duration: 0.3, ease: "power3.out" }, E.checklist - 0.2);
  [0.0, 0.14, 0.28, 0.42].forEach((d, k) => tl.fromTo(`#m1_${k + 1}`, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: true }, E.checklist + 0.1 + d));
  tl.to("#pgProg", { x: 0, duration: 0.3, ease: "power3.out" }, E.progresso - 0.12);
  const PX = W / 430;
  tl.set("#hlP", { left: 16 * PX - 4, top: 22 + 285 * PX - 4, width: 398 * PX + 8, height: 87 * PX + 8, opacity: 0 }, 0);
  tl.to("#hlP", { opacity: 1, duration: 0.15, yoyo: true, repeat: 3 }, E.progresso + 0.15);
  [["#g0", E.missoes - 0.05, -8], ["#g1", E.checklist - 0.05, 7], ["#g2", E.progresso - 0.05, -5]].forEach(([s, at, r]) => {
    tl.fromTo(s, { scale: 0, rotate: r * 4, opacity: 0 }, { scale: 1, rotate: r, opacity: 1, duration: 0.45, ease: "back.out(2.6)" }, at);
  });
  slab("#b45", 13.68);

  // ================= S5 (13.92 – 16.9): out of the idea, the first video published
  scene("#s5", 13.92, 16.9);
  riseOn("#t5a", [E.sair, E.sair + 0.24, E.ideia]);
  pop("#bulb", E.ideia - 0.05);
  tl.to("#bulb", { boxShadow: "0 0 0 18px rgba(212,255,63,.45), inset 0 -8px 16px rgba(0,0,0,.22), inset 0 6px 12px rgba(255,255,255,.45)", duration: 0.25, yoyo: true, repeat: 1 }, E.ideia + 0.3);
  riseOn("#t5b", [E.publicar - 0.26, E.publicar, E.primeiro2 - 0.16]);
  tl.fromTo("#up", { x: 700, rotate: 8, opacity: 0 }, { x: 0, rotate: 2, opacity: 1, duration: 0.45, ease: "back.out(1.5)" }, E.publicar - 0.12);
  tl.fromTo("#upFill", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power1.inOut" }, E.publicar + 0.2);
  tl.fromTo("#toast", { y: 200, rotate: -6, opacity: 0, scale: 0.8 }, { y: 0, rotate: -2, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" }, E.video - 0.04);
  tl.fromTo("#toast .ck", { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.4, ease: "back.out(3)" }, E.video + 0.12);
  slab("#b56", 16.66);

  // ================= S6 (16.9 – 20.86): no easy-money promise; only the next step, always clear
  scene("#s6", 16.9, 20.86);
  rise("#t6a", E.sem - 0.06);
  riseOn("#t6b", [E.dinheiro, E.facil]);
  const b6 = $("#t6b").getBoundingClientRect(), base = $("#root").getBoundingClientRect();
  tl.set("#strike", { left: b6.left - base.left - 10, top: b6.top - base.top + b6.height * 0.5, width: b6.width + 20, scaleX: 0 }, 0);
  tl.to("#strike", { scaleX: 1, duration: 0.26, ease: "power3.out" }, E.facil + 0.14);
  leave(["#t6a", "#t6b", "#strike"], 18.42, -80);
  riseOn("#t6c", [E.so, E.so + 0.18, E.proximo, E.passo]);
  riseOn("#t6d", [E.sempre, E.claro]);
  const STEPS = 5, BOT = 1660, SX = 80, SW = 200, SG = 184;
  const top = (i) => BOT - (170 + i * 120);
  const stepEls = [];
  for (let i = 0; i < STEPS; i++) {
    const s = document.createElement("div"); s.className = "stp";
    s.style.left = `${SX + i * SG}px`; s.style.top = `${top(i)}px`; s.style.height = `${BOT - top(i)}px`;
    $("#steps").appendChild(s); stepEls.push(s);
    tl.fromTo(s, { y: 900 }, { y: 0, duration: 0.5, ease: "back.out(1.2)" }, 18.6 + i * 0.07);
  }
  const ball = (i) => ({ x: SX + i * SG + SW / 2 - 40, y: top(i) - 80 });
  tl.fromTo("#hop", { ...ball(1), scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(3)" }, 18.95);
  const hop = (from, to, at) => {
    const a = ball(from), b = ball(to);
    tl.to("#hop", { x: b.x, duration: 0.42, ease: "none" }, at);
    tl.to("#hop", { y: Math.min(a.y, b.y) - 150, duration: 0.21, ease: "power2.out" }, at);
    tl.to("#hop", { y: b.y, duration: 0.21, ease: "power2.in" }, at + 0.21);
    tl.to(stepEls[to], { backgroundColor: "#d4ff3f", duration: 0.12 }, at + 0.4);
    tl.fromTo(stepEls[to], { y: 0 }, { y: 14, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out", immediateRender: false }, at + 0.42);
  };
  tl.set(stepEls[1], { backgroundColor: "#d4ff3f" }, 18.95);
  hop(1, 2, E.passo - 0.3);
  hop(2, 3, E.claro - 0.3);
  slab("#b67", 20.62);

  // ================= S7 (20.86 – 24): CTA
  scene("#s7", 20.86, 24.1);
  tl.fromTo("#bloom7", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 20.86);
  const L7 = 560 / 1189;
  tl.fromTo("#logo7", { x: 260, y: 330, scale: L7 * 1.35, opacity: 0, filter: "blur(18px)" },
    { x: 260, y: 330, scale: L7, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, E.conheca - 0.02);
  tl.to("#logo7", { scale: L7 * 1.03, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, E.conheca + 0.6);
  rise("#t7", E.cash_end);
  tl.fromTo("#btn", { y: 200, scale: 0.8, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.8)" }, E.conheca + 0.25);
  tl.fromTo("#cursor", { x: 860, y: 1560, opacity: 0 }, { x: 686, y: 1181, opacity: 1, duration: 0.45, ease: "expo.out" }, 21.9);
  tl.to("#cursor", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "15% 10%" }, 22.4);
  tl.to("#btn", { x: 8, y: 8, boxShadow: "6px 6px 0 #d4ff3f", duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, 22.4);
  tl.fromTo("#ripple", { left: 670, top: 1160, scale: 0.4, opacity: 0.9 }, { scale: 5, opacity: 0, duration: 0.6, ease: "expo.out" }, 22.45);
  tl.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 22.3);

  tl.set({}, {}, 24.0);
  return tl;
}

window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  const tl = build();
  window.seek = (t) => { tl.seek(t, false); };
  tl.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
