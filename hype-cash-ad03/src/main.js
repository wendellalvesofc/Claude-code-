// HYPE CASH Motion 03 (non-gamers). One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (word timestamps of the ElevenLabs narration).
const T = window.TIMING, E = T.emphasis;
const $ = (s) => document.querySelector(s);

function build() {
  const tl = gsap.timeline({ paused: true });
  const scene = (id, a, b) => { tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b); };
  const blurPulse = (el, at, dur, px) => tl.fromTo(el, { filter: `blur(${px}px)` }, { filter: "blur(0px)", duration: dur, ease: "power2.out" }, at);
  const words = (el) => { if (!el.querySelector(".w")) el.innerHTML = el.innerHTML.split(" ").map((w) => `<span class="w">${w}</span>`).join(" "); return el.querySelectorAll(".w"); };
  const rise = (sel, at, stagger = 0.07) => tl.fromTo(words($(sel)), { y: 44, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out", stagger }, at);
  const slam = (sel, at, from = 1.3) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, at);
  // stroke stays invisible until it starts drawing (a round cap would otherwise show as a dot)
  const draw = (el, at, dur, ease = "power2.inOut") => { const L = el.getTotalLength();
    tl.fromTo(el, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L, opacity: 0 }, { strokeDashoffset: 0, duration: dur, ease }, at);
    tl.to(el, { opacity: 1, duration: 0.01 }, at); };
  const rectOf = (el) => { const r = el.getBoundingClientRect(), b = $("#root").getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; };

  // ================= S1 (0 – 4.2): the objection, crossed out
  tl.set("#s1", { visibility: "hidden" }, 4.2);           // visible from frame 0 (CSS)
  tl.fromTo("#rule1", { scaleX: 0.35 }, { scaleX: 1, duration: 0.6, ease: "expo.out" }, 0);
  tl.fromTo("#t1a", { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);
  tl.fromTo("#pad", { scale: 1.15, rotate: -6 }, { scale: 1, rotate: 0, duration: 0.5, ease: "expo.out" }, 0);
  slam("#t1b", E.jogar - 0.06, 1.25);
  const j = rectOf($("#jogarW"));
  $("#strike1").setAttribute("d", `M${j.x - 20} ${j.y + j.h * 0.58} L${j.x + j.w + 20} ${j.y + j.h * 0.5}`);
  draw($("#strike1"), E.gta, 0.28, "power3.out");
  tl.to("#t1b", { color: "#9a93a3", duration: 0.3 }, E.gta + 0.1);
  // the controller is not needed: it drops out of the page
  tl.to("#pad", { y: 1100, rotate: 38, duration: 0.75, ease: "power2.in" }, E.gta + 0.12);
  rise("#t1c", E.criar - 0.06, 0.1);
  const c = rectOf($("#t1c")), cy = c.y + c.h / 2;
  $("#loop1").setAttribute("d", `M${c.x + 120} ${cy - 90} C ${c.x - 40} ${cy - 70}, ${c.x - 30} ${cy + 95}, ${c.x + 470} ${cy + 92} S ${c.x + c.w + 30} ${cy - 40}, ${c.x + 600} ${cy - 96} S ${c.x + 200} ${cy - 110}, ${c.x + 150} ${cy - 70}`);
  draw($("#loop1"), E.conteudo + 0.15, 0.55);
  rise("#t1d", E.criar + 0.74);
  tl.to(["#kick1", "#rule1", "#t1a", "#t1b", "#t1c", "#t1d", "#ink1"], { y: -420, opacity: 0, duration: 0.4, ease: "expo.in" }, 3.85);

  // ================= S2 (3.85 – 9.5): the subject everywhere; three formats drawn from a dot
  scene("#s2", 3.85, 9.5);
  tl.fromTo("#s2", { y: 1920 }, { y: 0, duration: 0.42, ease: "expo.inOut" }, 3.85);
  tl.fromTo("#kick2", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 4.15);
  slam("#mast", E.assunto - 0.04, 1.2);
  rise("#t2a", E.estar ?? 4.84, 0.06);
  tl.fromTo("#rule2", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "expo.out" }, E.lugar);
  const CARDS = [["#k1", E.noticias, [300, 1120]], ["#k2", E.curiosidades, [790, 930]], ["#k3", E.analises, [790, 1310]]];
  tl.fromTo("#dot", { x: 518, y: 680, scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, E.noticias - 0.4);
  CARDS.forEach(([k, at, [x, y]], i) => {
    tl.to("#dot", { x: x - 22, y: y - 22, duration: 0.32, ease: "expo.inOut" }, at - 0.3);
    tl.to("#dot", { scale: 14, opacity: 0, duration: 0.3, ease: "power2.out" }, at);
    tl.set("#dot", { scale: 1, opacity: 1 }, at + 0.31);
    tl.fromTo(k, { scale: 0.6, rotate: i === 1 ? 6 : -6, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, at - 0.02);
    blurPulse(k, at - 0.02, 0.4, 12);
  });
  tl.set("#dot", { opacity: 0 }, E.analises + 0.32);
  tl.fromTo(["#l0", "#l1", "#l2", "#l3", "#l4", "#l5"], { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "expo.out", stagger: 0.06 }, E.noticias + 0.15);
  tl.fromTo("#photo", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "expo.inOut" }, E.noticias + 0.25);
  tl.fromTo("#qm", { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1, .55)" }, E.curiosidades + 0.12);
  tl.fromTo(["#b0", "#b1", "#b2", "#b3"], { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: "expo.out", stagger: 0.08 }, E.analises + 0.1);
  draw($("#trend"), E.analises + 0.35, 0.5);
  // the page folds into the product
  tl.to(["#k1", "#k2", "#k3"], { x: (i) => [240, -240, -240][i], y: (i) => [-20, 170, -210][i], scale: 0.3, rotate: (i) => [12, -10, 8][i], duration: 0.35, ease: "power3.in" }, 9.05);
  tl.to(["#mast", "#t2a", "#kick2", "#rule2"], { opacity: 0, y: -60, duration: 0.3, ease: "power2.in" }, 9.05);
  tl.set("#pB", { visibility: "visible" }, 9.15);
  tl.fromTo("#pB", { clipPath: "circle(0% at 50% 58%)" }, { clipPath: "circle(120% at 50% 58%)", duration: 0.32, ease: "power3.in" }, 9.15);
  tl.set("#pB", { visibility: "hidden" }, 9.5);

  // ================= S3 (9.48 – 14.25): the product; the only phone moment (real screens)
  scene("#s3", 9.48, 14.25);
  tl.fromTo("#bloom3", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, E.hypecash - 0.05);
  const L3 = 640 / 1189;
  tl.fromTo("#logo3", { x: 220, y: 300, scale: L3 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 220, y: 300, scale: L3, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, E.hypecash);
  tl.fromTo("#chip3", { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, E.playbook - 0.05);
  const L3b = 330 / 1189;
  tl.to("#logo3", { x: 60, y: 200, scale: L3b, duration: 0.55, ease: "expo.inOut" }, E.mostra ?? 11.4);
  tl.to("#bloom3", { x: 260, y: 500, duration: 0.55, ease: "expo.inOut" }, E.mostra ?? 11.4);
  tl.to("#chip3", { opacity: 0, y: -40, duration: 0.3 }, (E.mostra ?? 11.4) - 0.05);
  tl.fromTo("#phone", { x: 760, rotateY: -50, rotateZ: 10, scale: 0.9 }, { x: 0, rotateY: -16, rotateZ: 2, scale: 0.92, duration: 0.6, ease: "expo.out" }, 11.55);
  blurPulse("#phone", 11.55, 0.5, 20);
  tl.to("#phone", { rotateY: -8, rotateZ: 0, duration: 2.2, ease: "sine.inOut" }, 12.15);
  rise("#lb0", E.missao - 0.05);
  rise("#lb1", E.missao2 - 0.04);
  tl.set("#chkImg", { y: -1216 }, 9.48);
  tl.fromTo("#pgCheck", { x: 512 }, { x: 0, duration: 0.3, ease: "power3.out" }, 12.6);
  tl.fromTo("#pgTools", { x: 512 }, { x: 0, duration: 0.3, ease: "power3.out" }, 13.25);
  tl.fromTo("#toolsImg", { y: 0 }, { y: -260, duration: 0.7, ease: "power1.inOut" }, 13.45);
  [["#lb2", 11.75, 12.55], ["#lb3", 12.6, 13.2], ["#lb4", 13.25, 13.9]].forEach(([s, a, b]) => {
    tl.fromTo(s, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "expo.out" }, a);
    tl.to(s, { x: 30, opacity: 0, duration: 0.2, ease: "power2.in" }, b);
  });
  tl.to("#phone", { x: 900, rotateY: 40, duration: 0.4, ease: "power3.in" }, 13.92);
  tl.to("#phone", { filter: "blur(14px)", duration: 0.4, ease: "power2.in" }, 13.92);
  tl.to(["#lb0", "#lb1", "#logo3"], { opacity: 0, duration: 0.25 }, 13.95);
  tl.set("#pA", { visibility: "visible" }, 13.95);
  tl.fromTo("#pA", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3, ease: "power3.inOut" }, 13.95);
  tl.set("#pA", { visibility: "hidden" }, 14.27);

  // ================= S4 (14.25 – 16.4): a content project around the theme
  scene("#s4", 14.25, 16.4);
  tl.fromTo("#rule4", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "expo.out" }, 14.25);
  tl.fromTo("#kick4", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 14.25);
  rise("#t4a", 14.22, 0.06);
  slam("#t4b", E.conteudo2 - 0.06, 1.25);
  draw($("#u4"), E.conteudo2 + 0.3, 0.5);
  rise("#t4c", E.com ?? 14.96, 0.07);
  tl.to("#s4", { x: -700, opacity: 0, duration: 0.42, ease: "expo.inOut" }, 15.98);

  // ================= S5 (15.98 – 18.85): no easy promise, direction
  scene("#s5", 15.98, 18.85);
  tl.fromTo("#s5", { x: 1080 }, { x: 0, duration: 0.42, ease: "expo.inOut" }, 15.98);
  rise("#t5a", E.sem - 0.05, 0.08);
  const f = rectOf($("#facilW"));
  tl.set("#strike5", { left: f.x - 8, top: f.y + f.h * 0.56, width: f.w + 16, scaleX: 0 }, 15.98);
  tl.to("#strike5", { scaleX: 1, duration: 0.28, ease: "power3.out" }, E.facil + 0.2);
  tl.to(["#t5a"], { opacity: 0.45, duration: 0.3 }, E.com_dir - 0.1);
  rise("#t5b", E.com_dir - 0.04);
  slam("#t5c", E.direcao - 0.05, 1.25);
  tl.fromTo("#compass", { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2)" }, E.com_dir);
  tl.fromTo("#needle", { rotate: -150, transformOrigin: "150px 150px" }, { rotate: 35, duration: 0.9, ease: "elastic.out(1, .4)" }, E.direcao);
  tl.set("#pB", { visibility: "visible" }, 18.55);
  tl.fromTo("#pB", { clipPath: "circle(0% at 50% 64%)" }, { clipPath: "circle(120% at 50% 64%)", duration: 0.32, ease: "power3.in", immediateRender: false }, 18.55);
  tl.set("#pB", { visibility: "hidden" }, 18.9);

  // ================= S6 CTA (18.85 – 22.5)
  scene("#s6", 18.85, 22.6);
  tl.fromTo("#bloom6", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, E.conheca - 0.05);
  const L6 = 760 / 1189;
  tl.fromTo("#logo6", { x: 160, y: 380, scale: L6 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 160, y: 380, scale: L6, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, E.conheca);
  tl.to("#logo6", { scale: L6 * 1.03, duration: 2.6, ease: "sine.inOut" }, E.conheca + 0.5);
  rise("#t6a", 19.6, 0.035);
  tl.fromTo("#btn", { y: 60, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, 19.9);
  tl.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut" }, 20.25);
  tl.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut", immediateRender: false }, 21.5);
  tl.fromTo("#cursor", { x: 980, y: 1720, opacity: 0 }, { x: 760, y: 1222, opacity: 1, duration: 0.5, ease: "expo.out" }, 20.3);
  tl.to("#cursor", { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 }, 20.85);
  tl.to("#btn", { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 }, 20.85);
  tl.fromTo("#ripple", { x: 712, y: 1180, scale: 0.3, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 0.55, ease: "power2.out", immediateRender: false }, 20.87);
  tl.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 20.3);

  for (let k = 0; k < 23 * 12; k++) tl.set("#grain", { x: (k * 73) % 200, y: (k * 131) % 200 }, k / 12);
  return tl;
}

window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter", "italic 400 10px InstrumentSerif", "400 10px InstrumentSerif"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  const tl = build();
  window.seek = (t) => { tl.seek(t, false); };
  tl.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.style} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
