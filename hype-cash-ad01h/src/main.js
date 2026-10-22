// HYPE CASH Motion 01 F ("Alto Impacto"). One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (faster-whisper word timestamps of the ElevenLabs narration).
const T = window.TIMING, E = T.emphasis;
const $ = (s) => document.querySelector(s);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function build() {
  const tl = gsap.timeline({ paused: true });
  const base = $("#root").getBoundingClientRect();
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; };
  // measure strike targets before any tween offsets them
  const PRE = { d11: box($("#t11b").querySelectorAll(".w")[0]), f11: box($("#t11b").querySelectorAll(".w")[1]) };

  // ---- helpers: hard cuts with a camera punch, words that land on the narration
  const shot = (id, a, b, punch = 1.18) => {
    tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b);
    tl.fromTo(id, { scale: punch }, { scale: 1, duration: 0.4, ease: "expo.out", immediateRender: false }, a);
  };
  const rise = (els, at, stagger = 0.07) => tl.fromTo(els, { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.34, ease: "expo.out", stagger }, at);
  const riseOn = (sel, times) => $(sel).querySelectorAll(".w").forEach((w, i) => rise(w, times[i] - 0.05));
  const slam = (sel, at, from = 1.5) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out" }, at);
  const pop = (sel, at, s = 1) => tl.fromTo(sel, { scale: 0, rotate: -14, opacity: 0 }, { scale: s, rotate: 0, opacity: 1, duration: 0.45, ease: "back.out(2.4)" }, at);
  const shake = (at, px = 14) => tl.fromTo("#cam", { x: 0 }, { x: px, duration: 0.04, yoyo: true, repeat: 5, ease: "none", immediateRender: false }, at).set("#cam", { x: 0 }, at + 0.25);

  // floating dust on the dark beats (one clock draws every canvas; hidden scenes cost nothing visible)
  const R = rng(5), P = Array.from({ length: 110 }, () => ({ x: R() * 1080, y: R() * 1920, r: 1 + R() * 3, v: 10 + R() * 40, a: 0.15 + R() * 0.5 }));
  const dusts = [...document.querySelectorAll(".dust")].map((c) => c.getContext("2d"));
  const dk = { t: 0 };
  const drawDust = () => dusts.forEach((cx) => {
    cx.clearRect(0, 0, 1080, 1920);
    for (const p of P) { cx.globalAlpha = p.a; cx.fillStyle = "#fff"; cx.beginPath(); cx.arc(p.x + Math.sin(dk.t + p.y) * 20, (p.y - p.v * dk.t + 1920) % 1920, p.r, 0, 6.283); cx.fill(); }
  });
  drawDust();
  tl.fromTo(dk, { t: 0 }, { t: 35, duration: 35, ease: "none", onUpdate: drawDust, immediateRender: false }, 0);

  // Vice City night (the app's identity): a neon grid floor always moving, a colour wash that changes per beat, sunset flashes on the hard cuts
  tl.fromTo("#gridf", { backgroundPosition: "0px 0px" }, { backgroundPosition: "0px 4200px", duration: 35, ease: "none" }, 0);
  const WASH = { pink: "rgba(255,63,162,.55)", purple: "rgba(168,63,254,.6)", blue: "rgba(63,143,255,.55)", deep: "rgba(90,23,201,.6)" };
  const wash = (c, at, y = 42) => tl.set("#wash", { background: `radial-gradient(ellipse 80% 55% at 50% ${y}%, ${WASH[c]}, rgba(10,6,18,0) 70%)` }, at);
  [["purple", 0], ["pink", 3.25], ["pink", 6.42, 50], ["blue", 7.22], ["purple", 10.65], ["blue", 14.62], ["pink", 16.8], ["purple", 20.35], ["pink", 24.45], ["deep", 25.55], ["purple", 28.46], ["pink", 31.46]]
    .forEach(([c, at, y]) => wash(c, at, y));
  const flashG = (at, o = 0.75) => tl.fromTo("#flashG", { opacity: o }, { opacity: 0, duration: 0.2, ease: "power2.out", immediateRender: false }, at);
  [1.62, 6.42, 10.65, 16.8, 20.35, 24.45, 28.46].forEach((t) => flashG(t));

  // ================= B1 (0 – 1.62): "O mundo inteiro vai parar" — the planet stops
  shot("#s1", 0, 1.62, 1.0);
  const RL = rng(11);
  $("#lands").innerHTML = Array.from({ length: 22 }, (_, i) => {
    const w = 90 + RL() * 200, h = 70 + RL() * 150, x = (i * 107 + RL() * 60) % 2240, y = 40 + RL() * 440;
    return `<div class="land" style="left:${x.toFixed(0)}px; top:${y.toFixed(0)}px; width:${w.toFixed(0)}px; height:${h.toFixed(0)}px; transform: rotate(${(RL() * 90).toFixed(0)}deg)"></div>`;
  }).join("") + Array.from({ length: 9 }, (_, i) => `<div style="position:absolute; left:${(i * 260 + 40) % 2240}px; top:${(60 + i * 53) % 480}px; width:${220 + (i % 3) * 60}px; height:26px; border-radius:13px; background:rgba(255,255,255,.55); filter: blur(3px)"></div>`).join("");
  tl.fromTo("#lands", { x: 0 }, { x: -820, duration: E.parar + 0.1, ease: "power1.out" }, 0);    // spinning, then it stops on "parar"
  tl.fromTo(["#globe", "#gatm"], { scale: 1.08 }, { scale: 1, duration: 1.3, ease: "power2.out" }, 0);
  tl.fromTo("#t1a", { scale: 1.08 }, { scale: 1, duration: 0.6, ease: "expo.out" }, 0);   // on screen at frame 0
  riseOn("#t1b", [1.06, E.parar]);   // first "vai" (E.vai is the second one, in "Vai ser")
  pop("#pause", E.parar + 0.02);
  tl.to(["#globe", "#lands"], { filter: "saturate(0.3) brightness(0.7)", duration: 0.2 }, E.parar + 0.02);
  shake(E.parar + 0.04, 12);

  // ================= B2 (1.62 – 3.25): "pra ver GTA 6"
  shot("#s2", 1.62, 3.25, 1.2);
  rise("#t2a", 1.62);
  tl.fromTo("#play2", { scale: 0.2, rotate: -20, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, 1.66);
  slam("#t2b", E.gta - 0.04, 1.6);
  shake(E.gta, 10);
  tl.to("#play2", { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1, ease: "sine.inOut" }, 2.4);

  // ================= B3 (3.25 – 6.42): "Milhões de pessoas procurando vídeo, notícia, teoria."
  shot("#s3", 3.25, 6.42);
  const n3 = $("#cnt3"), c3 = { n: 0 };
  tl.fromTo(c3, { n: 0 }, { n: 1000000, duration: 0.75, ease: "power2.out", onUpdate: () => { n3.textContent = Math.round(c3.n).toLocaleString("pt-BR") + (c3.n >= 999999 ? "+" : ""); }, immediateRender: false }, E.milhoes - 0.05);
  slam("#cnt3", E.milhoes - 0.05, 1.3);
  pop("#bA", E.milhoes + 0.2); pop("#bB", E.milhoes + 0.35);
  riseOn("#t3", [E.pessoas, E.procurando]);
  [["#q1", E.video], ["#q2", E.noticia], ["#q3", E.teoria]].forEach(([s, at]) => {
    tl.fromTo(s, { x: 700, opacity: 0, rotate: 6 }, { x: 0, opacity: 1, rotate: 0, duration: 0.4, ease: "expo.out" }, at - 0.08);
    tl.fromTo(`${s} .icon`, { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2.6)" }, at);
  });

  // ================= B4 (6.42 – 7.22): "E você?"
  shot("#s4", 6.42, 7.22, 1.3);
  slam("#t4", E.e, 1.8);
  shake(E.voce + 0.05, 16);

  // ================= B5 (7.22 – 10.65): viewer → creator toggle
  shot("#s5", 7.22, 10.65);
  tl.fromTo("#tg", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, 7.25);
  riseOn("#t5a", [E.so, E.mais, E.um, E.assistindo]);
  tl.set("#tlA", { color: "#fff" }, 0);
  riseOn("#t5b", [E.ou, E.quem, E.eles, 9.74, E.assistir]);
  tl.fromTo("#cursor5", { x: 900, y: 1500, opacity: 0 }, { x: 700, y: 950, opacity: 1, duration: 0.35, ease: "expo.out" }, E.ou - 0.1);
  tl.to("#cursor5", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "15% 10%" }, E.quem + 0.05);
  tl.to("#knob", { x: 418, background: "linear-gradient(90deg, #ff3fa2, #a83ffe)", boxShadow: "0 0 50px rgba(255,63,162,.7)", duration: 0.3, ease: "back.out(1.6)" }, E.quem + 0.1);
  tl.to("#tlA", { color: "#6c6386", duration: 0.2 }, E.quem + 0.1);
  tl.to("#tlB", { color: "#ffffff", duration: 0.2 }, E.quem + 0.1);
  tl.to("#cursor5", { x: 900, y: 1500, opacity: 0, duration: 0.35, ease: "power2.in" }, E.quem + 0.5);

  // ================= B6 (10.65 – 14.62): "O problema não é o celular. Não é a edição. Não é o tempo."
  shot("#s6", 10.65, 14.62);
  rise("#t6a", E.problema - 0.25);
  slam("#t6b", E.nao1 - 0.04, 1.4);
  tl.set(["#sc0", "#sc1", "#sc2"], { yPercent: 110 }, 0);
  tl.set(".sc .x", { scaleX: 0 }, 0);
  [["#sc0", E.celular, E.nao2], ["#sc1", E.edicao, E.nao3], ["#sc2", E.tempo, 99]].forEach(([s, at, outAt]) => {
    tl.to(s, { yPercent: 0, duration: 0.22, ease: "back.out(1.6)" }, at - 0.14);
    tl.to(`${s} .x`, { scaleX: 1, duration: 0.18, ease: "power3.out" }, at + 0.38);
    if (outAt < 90) tl.to(s, { yPercent: -110, duration: 0.18, ease: "power3.in" }, outAt - 0.05);
  });
  tl.to("#slot6", { x: 10, duration: 0.04, yoyo: true, repeat: 3 }, E.tempo + 0.4);

  // ================= B7 (14.62 – 16.8): "É não saber por onde começar."
  shot("#s7", 14.62, 16.8, 1.15);
  riseOn("#t7a", [E.e4, E.nao4, E.saber]);
  riseOn("#t7b", [15.5, E.onde, E.comecar]);
  ["#qm1", "#qm2", "#qm3", "#qm4"].forEach((s, i) => {
    pop(s, 14.7 + i * 0.12);
    tl.to(s, { rotate: (i % 2 ? 1 : -1) * 14, y: -40, duration: 1.6, ease: "sine.inOut" }, 15.1);
  });

  // ================= B8 (16.8 – 20.35): "Por isso existe o Hype Cash: um playbook interativo"
  shot("#s8", 16.8, 20.35, 1.0);
  rise("#t8a", E.porisso - 0.05);
  const L8 = 640 / 1189;
  tl.fromTo("#logo8", { x: 220, y: 640, scale: L8 * 1.5, opacity: 0, filter: "blur(18px)" }, { x: 220, y: 640, scale: L8, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, E.hypecash - 0.06);
  shake(E.hypecash, 10);
  ["#r1", "#r2", "#r3"].forEach((s, i) => tl.set(s, { top: 865 }, 0)
    .fromTo(s, { scale: 0.4, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1.4, ease: "power2.out", repeat: 1, immediateRender: false }, E.hypecash + i * 0.45));
  tl.fromTo("#t8b", { letterSpacing: "0.7em", opacity: 0 }, { letterSpacing: "0.3em", opacity: 1, duration: 0.5, ease: "expo.out" }, E.playbook - 0.05);
  tl.to("#logo8", { scale: L8 * 1.04, duration: 1.2, ease: "sine.inOut" }, 18.5);

  // ================= B9 (20.35 – 24.45): the only phone moment (~4 s), real screens on blue
  shot("#s9", 20.35, 24.45, 1.0);
  riseOn("#t9", [E.missao, 20.98, 21.18]);
  tl.fromTo("#phone", { y: 1200, rotate: 8 }, { y: 0, rotate: -2, duration: 0.5, ease: "expo.out" }, 20.35);
  tl.to("#phone", { rotate: 2, y: -16, duration: 3.5, ease: "sine.inOut" }, 20.85);
  const W = 440, M1Y = -1189 * W / 512;
  [0, 1, 2, 3].forEach((k) => tl.set(`#m1_${k}`, { y: M1Y }, 0));
  tl.set("#m1_4", { y: M1Y - 27 * W / 512 }, 0);
  tl.set(["#pgM1", "#pgProg", "#pgTools"], { x: W }, 0);
  tl.to("#pgM1", { x: 0, duration: 0.26, ease: "power3.out" }, E.checklist - 0.16);
  [0.05, 0.17, 0.29, 0.41].forEach((d, k) => tl.fromTo(`#m1_${k + 1}`, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: true }, E.checklist + d));
  tl.to("#pgProg", { x: 0, duration: 0.26, ease: "power3.out" }, E.progresso - 0.12);
  const PX = W / 430;
  tl.set("#hlP", { left: 16 * PX - 4, top: 22 + 285 * PX - 4, width: 398 * PX + 8, height: 87 * PX + 8, opacity: 0 }, 0);
  tl.to("#hlP", { opacity: 1, duration: 0.12, yoyo: true, repeat: 3 }, E.progresso + 0.12);
  tl.to("#pgTools", { x: 0, duration: 0.26, ease: "power3.out" }, E.ferramentas - 0.12);
  tl.fromTo("#toolsImg", { y: 0 }, { y: -300, duration: 0.8, ease: "power1.inOut", immediateRender: false }, E.ferramentas + 0.2);
  [["#c9a", E.checklist, -1], ["#c9b", E.progresso, 1], ["#c9c", E.ferramentas, -1]].forEach(([s, at, d]) => {
    tl.fromTo(s, { x: 160 * d, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: 0.38, ease: "back.out(2)" }, at - 0.06);
    tl.fromTo(`${s} .icon`, { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2.6)" }, at);
  });

  // ================= B10 (24.45 – 25.55): "Sem enrolação." — a coil that pulls straight
  shot("#s10", 24.45, 25.55);
  const coil = $("#coilP"), ck = { u: 0 };
  const drawCoil = () => {
    const u = ck.u, pts = [];
    for (let i = 0; i <= 160; i++) {
      const s = i / 160, ang = s * Math.PI * 2 * 6, r = 60 + 30 * Math.sin(s * 9);
      const cx = 180 + s * 720 + Math.cos(ang) * r, cy = 1150 + Math.sin(ang) * r;
      const lx = 120 + s * 840, ly = 1150;
      pts.push(`${(cx + (lx - cx) * u).toFixed(1)} ${(cy + (ly - cy) * u).toFixed(1)}`);
    }
    coil.setAttribute("d", "M" + pts.join(" L"));
  };
  drawCoil();
  tl.fromTo(ck, { u: 0 }, { u: 1, duration: 0.35, ease: "back.out(1.4)", onUpdate: drawCoil, immediateRender: false }, E.enrolacao + 0.35);
  riseOn("#t10", [E.sem, E.enrolacao]);

  // ================= B11 (25.55 – 27.32): "sem promessa de dinheiro fácil."
  shot("#s11", 25.55, 27.32);
  rise("#t11a", E.sem2 - 0.05);
  riseOn("#t11b", [E.dinheiro, E.facil]);
  tl.set("#sk11", { left: PRE.d11.x - 10, top: PRE.d11.y + PRE.d11.h * 0.5 - 7, width: PRE.f11.x + PRE.f11.w - PRE.d11.x + 20, scaleX: 0 }, 0);
  tl.to("#sk11", { scaleX: 1, duration: 0.2, ease: "power3.out" }, E.facil + 0.14);
  pop("#coin", E.dinheiro - 0.1);
  slam("#ban", E.facil + 0.1, 2);
  shake(E.facil + 0.14, 12);

  // ================= B12 (27.32 – 28.46): "Só o próximo passo."
  shot("#s12", 27.32, 28.46, 1.2);
  riseOn("#t12", [E.so2, E.so2 + 0.22, E.proximo, E.passo]);
  ["#ch1", "#ch2", "#ch3"].forEach((s, i) => tl.fromTo(s, { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: "expo.out" }, 27.5 + i * 0.13)
    .to(s, { x: 40, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, E.passo + i * 0.06));

  // ================= B13 (28.46 – 31.46): "GTA 6 chega dia 19 de novembro."
  shot("#s13", 28.46, 31.46);
  riseOn("#t13a", [E.gta2, E.gta2 + 0.6, E.chega]);
  tl.fromTo("#cal", { rotateX: -90, transformPerspective: 1200, transformOrigin: "50% 0%", opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, E.chega + 0.1);
  slam("#calN", E.d19 - 0.03, 1.6);
  shake(E.d19, 10);
  tl.to("#cal", { scale: 1.04, duration: 1.2, ease: "sine.inOut" }, 30.2);

  // ================= B14 (31.46 – 35): "Toque em saiba mais e comece hoje." — the tap floods the screen
  shot("#s14", 31.46, 35.1, 1.0);
  pop("#cta", E.toque - 0.02);
  tl.fromTo("#cursor14", { x: 880, y: 1600, opacity: 0 }, { x: 600, y: 1150, opacity: 1, duration: 0.3, ease: "expo.out" }, E.toque + 0.05);
  tl.to("#cursor14", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "15% 10%" }, E.saiba + 0.08);
  tl.to("#cta", { scale: 0.93, duration: 0.08, yoyo: true, repeat: 1 }, E.saiba + 0.08);
  tl.fromTo("#ripple", { left: 570, top: 1130, scale: 0.4, opacity: 0.9 }, { scale: 5, opacity: 0, duration: 0.6, ease: "expo.out" }, E.saiba + 0.12);
  tl.fromTo("#flood", { scale: 0 }, { scale: 24, duration: 0.45, ease: "power3.in" }, E.saiba + 0.14);
  tl.set("#cta", { background: "#0a0612", boxShadow: "0 0 0 4px rgba(255,255,255,.5), 0 0 80px rgba(10,6,18,.6)" }, E.saiba + 0.5);
  tl.to("#cursor14", { x: 880, y: 1600, opacity: 0, duration: 0.35, ease: "power2.in" }, E.saiba + 0.4);
  const L14 = 560 / 1189;
  tl.fromTo("#logo14", { x: 260, y: 320, scale: L14 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 260, y: 320, scale: L14, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, E.comece - 0.25);
  tl.set("#t14", { color: "#ffffff" }, 0);
  riseOn("#t14", [E.comece, E.hoje]);
  tl.to("#cta", { scale: 1.05, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, 33.2);
  tl.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 33.3);

  tl.set({}, {}, 35.0);
  return tl;
}

window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "900 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter", "italic 400 10px InstrumentSerif"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  const tl = build();
  window.seek = (t) => { tl.seek(t, false); };
  tl.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
