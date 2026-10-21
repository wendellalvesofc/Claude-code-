// HYPE CASH Motion 02 (gamer). One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (word timestamps of the ElevenLabs narration).
const T = window.TIMING, E = T.emphasis;
const $ = (s) => document.querySelector(s);

function build() {
  const tl = gsap.timeline({ paused: true });
  const scene = (id, a, b) => { tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b); };
  const blurPulse = (el, at, dur, px) => tl.fromTo(el, { filter: `blur(${px}px)` }, { filter: "blur(0px)", duration: dur, ease: "power2.out" }, at);
  const words = (el) => { if (!el.querySelector(".w")) el.innerHTML = el.innerHTML.split(" ").map((w) => `<span class="w">${w}</span>`).join(" "); return el.querySelectorAll(".w"); };
  const rise = (sel, at, stagger = 0.07) => tl.fromTo(words($(sel)), { y: 44, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out", stagger }, at);
  const slam = (sel, at, from = 1.4) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.36, ease: "expo.out" }, at);
  const leave = (sel, at, y = -50) => tl.to(sel, { y, opacity: 0, filter: "blur(10px)", duration: 0.26, ease: "power2.in" }, at);
  const wipe = (sel, cx, cy, at, dur) => {
    tl.set(sel, { left: cx - 100, top: cy - 100, width: 200, height: 200, scale: 0, visibility: "visible" }, at);
    tl.to(sel, { scale: 24, duration: dur, ease: "power3.in" }, at);
    tl.set(sel, { visibility: "hidden" }, at + dur + 0.02);
  };
  const rectOf = (el) => { const r = el.getBoundingClientRect(), b = $("#root").getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; };

  // ================= S1 + S2 (0 – 5.07): the endless session, then the objective changes
  tl.set("#s1", { visibility: "hidden" }, 5.07);            // visible from frame 0 (CSS)
  tl.fromTo(["#brTL", "#brTR", "#brBL", "#brBR"], { scale: 1.25 }, { scale: 1, duration: 0.4, ease: "expo.out" }, 0);
  tl.fromTo("#pad", { scale: 1.18, rotate: -8, filter: "blur(2px)" }, { scale: 1, rotate: 0, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, 0);
  tl.to("#pad", { y: -18, duration: 1.2, yoyo: true, repeat: 2, ease: "sine.inOut" }, 0.45);
  tl.fromTo("#t1a", { scale: 1.08 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);   // on screen at frame 0
  slam("#t1b", E.jogar - 0.05);
  rise("#t1c", E.gta - 0.04);
  const clock = { v: 3 * 3600 + 12 * 60 + 40 };              // play time racing forward: a session that never ends
  const fmt = (s) => [s / 3600, (s % 3600) / 60, s % 60].map((n) => String(Math.floor(n)).padStart(2, "0")).join(":");
  tl.fromTo(clock, { v: clock.v }, { v: clock.v + 2.6 * 3600, duration: 4.6, ease: "power1.in", onUpdate: () => ($("#clock").textContent = fmt(clock.v)) }, 0);
  leave(["#t1a", "#t1b", "#t1c"], E.entao - 0.22);
  rise("#t2a", E.entao - 0.04);
  slam("#t2b", E.alem - 0.06, 1.3);
  tl.fromTo("#objPanel", { x: 900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, E.entao);
  blurPulse("#objPanel", E.entao, 0.45, 14);
  tl.fromTo("#objStrike", { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power3.out" }, E.alem + 0.05);
  tl.to("#objOld", { y: -40, opacity: 0, duration: 0.25, ease: "power2.in" }, E.partida - 0.1);
  tl.fromTo("#objNew", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }, E.partida + 0.1);
  // "além": the HUD frame breaks outward, past the edges of the match
  [["#brTL", -260, -260], ["#brTR", 260, -260], ["#brBL", -260, 260], ["#brBR", 260, 260]].forEach(([s, x, y]) =>
    tl.to(s, { x, y, opacity: 0, duration: 0.5, ease: "expo.in" }, E.alem));
  tl.to(["#p1", "#timer"], { opacity: 0, y: -30, duration: 0.3, ease: "power2.in" }, E.alem);
  // controller flips into REC
  tl.set("#recIcon", { rotateY: -90, opacity: 1 }, 0.01);
  tl.to("#pad", { rotateY: 90, duration: 0.22, ease: "power2.in" }, 4.42);
  tl.to("#recIcon", { rotateY: 0, duration: 0.3, ease: "back.out(2)" }, 4.64);
  leave(["#t2a", "#t2b", "#objPanel"], 4.45, -40);
  wipe("#wA", 540, 920, 4.74, 0.33);

  // ================= S3 lime field (5.07 – 9.25): every session can become content
  scene("#s3", 5.07, 9.25);
  rise("#t3a", 5.08, 0.05);
  slam("#t3b", E.conteudo - 0.05, 1.3);
  [[E.gameplay, "#c0", "#x0"], [E.guia, "#c1", "#x1"], [E.react, "#c2", "#x2"]].forEach(([at, c, x], i) => {
    tl.fromTo(c, { y: 340, scale: 0.4, rotate: i === 1 ? -20 : 20, opacity: 0 }, { y: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "back.out(1.6)" }, at - 0.06);
    blurPulse(c, at - 0.06, 0.45, 16);
    tl.fromTo(x, { y: 20, scale: 0.5, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: "back.out(3)" }, at + 0.12);
    tl.to(x, { y: -50, opacity: 0, duration: 0.5, ease: "power1.in" }, at + 0.75);
  });
  tl.to(["#c0", "#c1", "#c2"], { x: (i) => [0, 310, -310][i], y: (i) => [140, -240, -240][i], scale: 0.2, opacity: 0, duration: 0.3, ease: "power3.in" }, 8.88);
  leave(["#t3a", "#t3b"], 8.85);
  wipe("#wB", 540, 960, 8.92, 0.33);

  // ================= S4 + S5 (9.25 – 16.2): logo burst, then the mission log
  scene("#s4", 9.25, 16.22);
  const rays = $("#rays");
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2, r0 = 330, r1 = 560 + (i % 3) * 90;
    rays.insertAdjacentHTML("beforeend", `<line class="ray" x1="${540 + Math.cos(a) * r0}" y1="${520 + Math.sin(a) * r0}" x2="${540 + Math.cos(a) * r1}" y2="${520 + Math.sin(a) * r1}" stroke="${i % 2 ? "#d4ff3f" : "#ff3fa2"}" stroke-width="6" stroke-linecap="round"/>`);
  }
  tl.fromTo(".ray", { strokeDasharray: "0 400", opacity: 1 }, { strokeDasharray: "400 0", duration: 0.45, ease: "expo.out" }, E.hypecash);
  tl.to(".ray", { opacity: 0, duration: 0.4 }, E.hypecash + 0.55);
  const L4 = 640 / 1189;
  tl.fromTo("#logo4", { x: 220, y: 290, scale: L4 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 220, y: 290, scale: L4, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, E.hypecash);
  tl.fromTo("#chip4", { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, E.playbook - 0.05);
  const L4b = 360 / 1189;
  tl.to("#logo4", { x: 360, y: 180, scale: L4b, duration: 0.6, ease: "expo.inOut" }, E.missoes - 0.15);
  tl.to("#chip4", { y: -300, duration: 0.6, ease: "expo.inOut" }, E.missoes - 0.15);
  tl.fromTo("#log", { y: 1100, rotateX: 25 }, { y: 0, rotateX: 0, duration: 0.65, ease: "expo.out" }, E.missoes - 0.05);
  blurPulse("#log", E.missoes - 0.05, 0.5, 16);
  tl.fromTo(".row", { opacity: 0.4 }, { opacity: 0.4, duration: 0.01 }, E.missoes);
  tl.fromTo("#xpfill", { scaleX: 0 }, { scaleX: 0, duration: 0.01 }, E.missoes);
  [E.formato, E.primeiro, E.audiencia, E.monetizacao].forEach((at, i) => {
    tl.to(`#r${i}`, { opacity: 1, duration: 0.2 }, at - 0.05);
    tl.fromTo(`#r${i} .box i`, { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.4, ease: "back.out(3)" }, at - 0.02);
    tl.fromTo(`#r${i} .kw`, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, at);
    tl.to("#xpfill", { scaleX: (i + 1) / 4, duration: 0.45, ease: "expo.out" }, at);
  });
  tl.to("#log", { y: -200, scale: 0.9, opacity: 0, filter: "blur(12px)", duration: 0.35, ease: "power3.in" }, 15.95);
  tl.to("#logo4", { opacity: 0, duration: 0.3 }, 15.95);

  // ================= S6 phone (16.15 – 18.3): real checklist and real progress (~2.1 s)
  scene("#s6", 16.15, 18.3);
  tl.fromTo("#phone", { y: 1400, rotateX: 45, rotateZ: -10, scale: 0.9 }, { y: 0, rotateX: 8, rotateZ: 3, scale: 0.94, duration: 0.55, ease: "expo.out" }, 16.15);
  blurPulse("#phone", 16.15, 0.5, 22);
  tl.to("#phone", { rotateY: 12, rotateZ: -1, duration: 1.4, ease: "sine.inOut" }, 16.7);
  [0, 1, 2, 3].forEach((k) => tl.set(`#m1_${k}`, { y: -1189 }, 16.15));
  tl.set("#m1_4", { y: -1216 }, 16.15);
  [16.62, 16.76, 16.9, 17.04].forEach((at, k) => tl.fromTo(`#m1_${k + 1}`, { opacity: 0 }, { opacity: 1, duration: 0.05 }, at));
  tl.fromTo("#pgAfter", { x: 512 }, { x: 0, duration: 0.3, ease: "power3.out" }, E.progresso - 0.1);
  const PX = 512 / 430;
  tl.set("#hlP", { left: 16 * PX - 4, top: 22 + 285 * PX - 4, width: 398 * PX + 8, height: 87 * PX + 8, opacity: 0 }, 16.15);
  tl.to("#hlP", { opacity: 1, duration: 0.2 }, E.progresso + 0.25);
  [["#tg0", E.checklist - 0.05, -120], ["#tg1", E.progresso - 0.02, 120]].forEach(([s, at, x]) => {
    tl.fromTo(s, { x, opacity: 0, filter: "blur(12px)" }, { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, at);
    tl.fromTo(`${s} .icon`, { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2.4)" }, at + 0.05);
  });
  tl.to("#phone", { y: 1700, rotateX: -30, duration: 0.4, ease: "power3.in" }, 17.9);
  tl.to("#phone", { filter: "blur(14px)", duration: 0.4, ease: "power2.in" }, 17.9);
  tl.to(["#tg0", "#tg1"], { opacity: 0, scale: 0.8, duration: 0.25, ease: "power2.in" }, 17.95);

  // ================= S7 minimap (18.25 – 20.8): no easy promise, a plan
  scene("#s7", 18.25, 20.8);
  $("#t7a").innerHTML = '<span class="w">Sem</span> <span class="w">promessa</span> <span class="w" id="facilW">fácil.</span>';
  rise("#t7a", E.sem - 0.06, 0.08);
  const fr = rectOf($("#facilW"));
  tl.set("#fstrike", { left: fr.x - 6, top: fr.y + fr.h * 0.52, width: fr.w + 12, scaleX: 0 }, 18.25);
  tl.to("#fstrike", { scaleX: 1, duration: 0.25, ease: "power3.out" }, E.facil + 0.15);
  tl.to("#t7a", { opacity: 0.45, duration: 0.3 }, E.com_plano - 0.1);
  tl.to("#fstrike", { opacity: 0.45, duration: 0.3 }, E.com_plano - 0.1);
  rise("#t7b", E.com_plano - 0.04);
  slam("#t7c", E.plano - 0.05, 1.35);
  tl.fromTo("#radar", { scale: 0.6, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "expo.out" }, E.com_plano);
  tl.fromTo("#sweep", { opacity: 0, rotate: 0 }, { opacity: 1, rotate: 0, duration: 0.3 }, E.com_plano + 0.1);
  tl.to("#sweep", { rotate: 420, duration: 1.1, ease: "none" }, E.com_plano + 0.1);
  const route = $("#route7"), len = route.getTotalLength();
  tl.fromTo(route, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, E.plano + 0.05);
  tl.fromTo("#wp7", { scale: 0, transformOrigin: "470px 120px" }, { scale: 1, duration: 0.35, ease: "back.out(3)" }, E.plano + 0.5);
  tl.to(["#radar", "#sweep"], { scale: 4, opacity: 0, duration: 0.35, ease: "power3.in" }, 20.45);
  leave(["#t7a", "#t7b", "#t7c", "#fstrike"], 20.45);

  // ================= S8 CTA (20.75 – 24)
  scene("#s8", 20.75, 24.1);
  tl.fromTo("#bloom8", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, E.conheca - 0.05);
  const L8 = 760 / 1189;
  tl.fromTo("#logo8", { x: 160, y: 380, scale: L8 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 160, y: 380, scale: L8, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, E.conheca);
  tl.to("#logo8", { scale: L8 * 1.03, duration: 2.6, ease: "sine.inOut" }, E.conheca + 0.5);
  rise("#t8a", 21.3, 0.035);
  tl.fromTo("#btn", { y: 60, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 21.6);
  tl.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut" }, 21.95);
  tl.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut", immediateRender: false }, 23.05);
  tl.fromTo("#cursor", { x: 980, y: 1720, opacity: 0 }, { x: 760, y: 1222, opacity: 1, duration: 0.5, ease: "expo.out" }, 22.0);
  tl.to("#cursor", { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 }, 22.55);
  tl.to("#btn", { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 }, 22.55);
  tl.fromTo("#ripple", { x: 712, y: 1180, scale: 0.3, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 0.55, ease: "power2.out", immediateRender: false }, 22.57);
  tl.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 22.0);

  for (let f = 0; f < 24 * 12; f++) tl.set("#grain", { x: (f * 73) % 200, y: (f * 131) % 200 }, f / 12);
  return tl;
}

window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  $("#recIcon").style.opacity = 0;
  $("#clock").textContent = "03:12:40";
  const tl = build();
  window.seek = (t) => { tl.seek(t, false); };
  tl.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
