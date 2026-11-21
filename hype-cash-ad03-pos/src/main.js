// HYPE CASH Motion 03 (non-gamers). One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (word timestamps of the ElevenLabs narration).
const T = window.TIMING, E = T.emphasis_prelaunch, N = T.emphasis;
const $ = (s) => document.querySelector(s);

function build() {
  const tl = gsap.timeline({ paused: true });
  // post-launch version with price: the scenes keep the pre-launch narration's times (E) and every position is remapped onto
  // the new narration through matching words; the new CTA uses the new times directly (N)
  const P = T.emphasis_post1;
  const A = [[0, 0], [E.nao, P.nao], [E.precisa, P.precisa], [E.jogar, P.jogar], [E.gta, P.gta], [E.criar, P.criar], [E.conteudo, P.conteudo], [E.assunto, P.assunto], [E.estar, P.estar], [E.todo, P.todo], [E.lugar, P.lugar], [E.noticias, P.noticias], [E.curiosidades, P.curiosidades], [E.analises, P.analises], [E.hypecash, P.hypecash], [E.playbook, P.playbook], [E.interativo, P.interativo], [E.mostra, P.mostra], [E.missao, P.missao], [E.missao2, P.missao2], [E.comecar, P.comecar], [E.projeto, P.projeto], [E.conteudo2, P.conteudo2], [E.com, P.com], [E.tema, P.tema], [E.sem, P.sem], [E.facil, P.facil], [E.com_dir, P.com_dir], [E.direcao, P.direcao], [18.85, 18.2]];
  const pw = (AA) => (t) => {
    if (t <= 0) return t;
    for (let i = 1; i < AA.length; i++) if (t <= AA[i][0]) { const [a0, b0] = AA[i - 1], [a1, b1] = AA[i]; return b0 + (t - a0) * (b1 - b0) / (a1 - a0); }
    return t + AA[AA.length - 1][1] - AA[AA.length - 1][0];
  };
  // v2 narration (what is inside + objections): the shared opening words move from the v1 times (P) to the v2 ones (N)
  const B2 = [[0, 0], ...["nao", "precisa", "jogar", "gta", "criar", "conteudo", "assunto", "estar", "todo", "lugar", "noticias", "curiosidades", "analises",
    "hypecash", "playbook", "interativo", "mostra", "missao", "missao2"].map((k) => [P[k], N[k]])];
  const r1 = pw(A), r2 = pw(B2), remap = (t) => r2(r1(t));
  const raw = { to: tl.to.bind(tl), fromTo: tl.fromTo.bind(tl), set: tl.set.bind(tl) };
  const span = (v, at) => { const d = v.duration ?? 0.5, a = remap(at); return [a, Math.max(0.02, remap(at + d) - a)]; };
  tl.to = (t, v, at) => { if (typeof at !== "number") return raw.to(t, v, at); const [a, d] = span(v, at); return raw.to(t, { ...v, duration: d }, a); };
  tl.fromTo = (t, f, v, at) => { if (typeof at !== "number") return raw.fromTo(t, f, v, at); const [a, d] = span(v, at); return raw.fromTo(t, f, { ...v, duration: d }, a); };
  tl.set = (t, v, at) => raw.set(t, v, typeof at === "number" ? remap(at) : at);
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
  tl.to("#t1b", { color: "#5a5070", duration: 0.3 }, E.gta + 0.1);
  // the controller is not needed: it drops out of the page
  tl.to("#pad", { y: 1500, rotate: 38, duration: 0.75, ease: "power2.in" }, E.gta + 0.12);
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
  tl.set("#s3", { visibility: "visible" }, 9.48);
  tl.fromTo("#bloom3", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, E.hypecash - 0.05);
  const L3 = 640 / 1189;
  tl.fromTo("#logo3", { x: 220, y: 300, scale: L3 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 220, y: 300, scale: L3, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, E.hypecash);
  tl.fromTo("#chip3", { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, E.playbook - 0.05);
  const L3b = 330 / 1189;
  tl.to("#logo3", { x: 60, y: 200, scale: L3b, duration: 0.55, ease: "expo.inOut" }, E.mostra ?? 11.4);
  tl.to("#bloom3", { x: 260, y: 500, duration: 0.55, ease: "expo.inOut" }, E.mostra ?? 11.4);
  tl.to("#chip3", { opacity: 0, y: -40, duration: 0.3 }, (E.mostra ?? 11.4) - 0.05);
  rise("#lb0", E.missao - 0.05);
  rise("#lb1", E.missao2 - 0.04);
  // v2: "ao seu primeiro vídeo", then the only phone moment (~5 s): one real screen per item
  raw.fromTo("#lbV", { y: 44, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, N.ao - 0.06);
  const PH_IN = N.roteiros - 0.35, PH_OUT = N.dias7 + 0.35;
  raw.fromTo("#phone", { x: 760, rotateY: -50, rotateZ: 10, scale: 0.9, filter: "blur(20px)" }, { x: 0, rotateY: -16, rotateZ: 2, scale: 0.92, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }, PH_IN);
  raw.to("#phone", { rotateY: -8, rotateZ: 0, duration: PH_OUT - PH_IN - 0.6, ease: "sine.inOut" }, PH_IN + 0.6);
  raw.to(["#lb0", "#lb1", "#lbV"], { y: -40, opacity: 0, filter: "blur(8px)", duration: 0.3, ease: "power2.in" }, PH_IN - 0.05);
  const ITEMS = [N.roteiros, N.cinquenta, N.cortes, N.plano];
  ["#pg1", "#pg2", "#pg3"].forEach((g) => gsap.set(g, { x: 512 }));
  ITEMS.forEach((at, i) => {
    if (i > 0) raw.fromTo(`#pg${i}`, { x: 512 }, { x: 0, duration: 0.32, ease: "power3.out", immediateRender: false }, at - 0.12);
    raw.fromTo(`#it${i}`, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.32, ease: "expo.out", immediateRender: false }, at - 0.08);
    raw.fromTo(`#it${i} b`, { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at + 0.05);
    if (i < 3) raw.to(`#it${i}`, { x: 30, opacity: 0, duration: 0.2, ease: "power2.in" }, ITEMS[i + 1] - 0.22);
    raw.fromTo(`#pg${i} img`, { y: 0 }, { y: -90, duration: 1.4, ease: "sine.inOut", immediateRender: false }, at + 0.25);
  });
  raw.to("#phone", { x: 900, rotateY: 40, filter: "blur(14px)", duration: 0.4, ease: "power3.in" }, PH_OUT - 0.4);
  raw.to(["#it3", "#logo3"], { opacity: 0, duration: 0.25 }, PH_OUT - 0.35);
  const S5A = N.sem1 - 0.25;
  raw.set("#s3", { visibility: "hidden" }, S5A);
  raw.set("#pA", { visibility: "visible" }, S5A - 0.3);
  raw.fromTo("#pA", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3, ease: "power3.inOut" }, S5A - 0.3);
  raw.set("#pA", { visibility: "hidden" }, S5A + 0.02);

  // ================= S5 v2 (N.sem1 – N.tudo): no followers, no gear, no face
  raw.set("#s5", { visibility: "visible" }, S5A); raw.set("#s5", { visibility: "hidden" }, N.tudo - 0.1);
  [[0, N.sem1, N.seguidores], [1, N.sem2, N.equipamento], [2, N.sem3, N.rosto]].forEach(([i, a, k]) => {
    raw.fromTo(`#ob${i}`, { y: 50, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, a - 0.06);
    raw.fromTo(`#ob${i} .gr`, { scale: 1.2 }, { scale: 1, duration: 0.35, ease: "expo.out", immediateRender: false }, k - 0.04);
  });
  raw.set("#pB", { visibility: "visible" }, N.tudo - 0.42);
  raw.fromTo("#pB", { clipPath: "circle(0% at 50% 64%)" }, { clipPath: "circle(120% at 50% 64%)", duration: 0.32, ease: "power3.in", immediateRender: false }, N.tudo - 0.42);
  raw.set("#pB", { visibility: "hidden" }, N.tudo - 0.08);

  // ================= S6 CTA (18.2 – 24.5): the price, the button
  const C = N.tudo - 18.3;     // the CTA was timed for "Tudo" at 18.3 s
  raw.set("#s6", { visibility: "visible" }, N.tudo - 0.1);
  raw.fromTo("#bloom6", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, 18.2 + C);
  const L6 = 560 / 1189;
  raw.fromTo("#logo6", { x: 260, y: 230, scale: L6 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 260, y: 230, scale: L6, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, 18.22 + C);
  raw.to("#logo6", { scale: L6 * 1.03, duration: 2.6, ease: "sine.inOut" }, 18.8 + C);
  raw.fromTo("#t6a", { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, 18.45 + C);
  raw.fromTo("#price .p1", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, N.reais);
  raw.fromTo("#price .p2", { y: 30, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, N.garantia - 0.75);
  raw.fromTo("#btn", { y: 60, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, N.toque - 0.05);
  raw.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut", immediateRender: false }, 22.4 + C);
  raw.fromTo("#shine", { x: 0 }, { x: 1150, duration: 0.7, ease: "power2.inOut", immediateRender: false }, 23.6 + C);
  raw.fromTo("#cursor", { x: 980, y: 1720, opacity: 0 }, { x: 760, y: 1162, opacity: 1, duration: 0.45, ease: "expo.out" }, N.toque + 0.05);
  raw.to("#cursor", { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 }, N.botao + 0.1);
  raw.to("#btn", { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 }, N.botao + 0.1);
  raw.fromTo("#ripple", { x: 712, y: 1120, scale: 0.3, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 0.55, ease: "power2.out", immediateRender: false }, N.botao + 0.12);
  raw.to("#btn", { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, N.comece);
  raw.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 21.0 + C);

  for (let k = 0; k < 31 * 12; k++) raw.set("#grain", { x: (k * 73) % 200, y: (k * 131) % 200 }, k / 12);
  raw.set({}, {}, T.video_duration_s);
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
