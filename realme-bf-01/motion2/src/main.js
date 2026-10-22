// realme | Black Friday 01 (motion). Uma timeline GSAP pausada; window.seek(t) põe tudo exatamente em t.
// Os tempos vêm de timing.json (palavras da voz já cortada). As gravações da loja (src/foot) já estão
// cortadas e sincronizadas com essa mesma voz, então o quadro da gravação é sempre round(t * fps).
const T = window.TIMING;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
// tempo da n-ésima ocorrência de uma palavra (sem pontuação)
const W = (txt, n = 0) => {
  const hits = T.words.filter((w) => w.t.replace(/[.,?!]/g, "").toLowerCase() === txt.toLowerCase());
  if (!hits[n]) throw new Error("palavra não encontrada: " + txt + " #" + n);
  return hits[n].s;
};

// trechos em que a gravação aparece (em tela cheia, sob os motions)
const FOOT = [[3.52, 6.55], [8.0, 10.0], [14.5, 16.5], [20.7, 23.0], [23.8, 30.0]];
// cenas: [id, início, fim, punch]
const SCENES = [
  ["#s1", 0, 1.94, 1.0], ["#s2", 1.94, 3.52, 1.12], ["#s3", 3.52, 6.55, 1.0], ["#s4", 6.55, 8.0, 1.15],
  ["#s5", 8.0, 10.0, 1.0], ["#s6", 10.0, 12.95, 1.1], ["#s7", 12.95, 14.5, 1.12], ["#s8", 14.5, 16.5, 1.0],
  ["#s9", 16.5, 20.7, 1.1], ["#s10", 20.7, 23.0, 1.0], ["#s11", 23.0, 23.8, 1.15], ["#s12", 23.8, 27.0, 1.0],
  ["#s13", 27.0, 30.0, 1.0],
];

function build() {
  const tl = gsap.timeline({ paused: true });

  // ---- helpers
  const hide = (sel) => gsap.set(sel, { opacity: 0 });
  const rise = (els, at, stagger = 0.07) => hide(els) && tl.fromTo(els, { y: 50, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.36, ease: "expo.out", stagger, immediateRender: false }, at);
  // cada palavra sobe no instante em que é falada
  const riseOn = (sel, times) => $(sel).querySelectorAll(".w").forEach((w, i) => { gsap.set(w, { opacity: 0 }); rise(w, times[i] - 0.05); });
  const slam = (sel, at, from = 1.5) => hide(sel) && tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(18px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out", immediateRender: false }, at);
  const pop = (sel, at, rot = -14) => hide(sel) && tl.fromTo(sel, { scale: 0, rotate: rot, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(2.2)", immediateRender: false }, at);
  const out = (sel, at) => tl.to(sel, { opacity: 0, y: -30, filter: "blur(10px)", duration: 0.16, ease: "power2.in" }, at);
  const float = (sel, at, dur, amp = 16) => tl.fromTo(sel, { y: -amp }, { y: amp, duration: dur / 3, ease: "sine.inOut", yoyo: true, repeat: 2, immediateRender: false }, at);
  const shake = (at, px = 16) => tl.fromTo("#cam", { x: 0, y: 0 }, { x: px, y: -px / 2, duration: 0.035, yoyo: true, repeat: 5, ease: "none", immediateRender: false }, at).set("#cam", { x: 0, y: 0 }, at + 0.22);
  const flash = (at, o = 0.85) => tl.fromTo("#flash", { opacity: o }, { opacity: 0, duration: 0.12, ease: "power2.out", immediateRender: false }, at);

  // ---- cenas: corte seco com um punch de câmera
  for (const [id, a, b, punch] of SCENES) {
    if (a > 0) tl.set(id, { visibility: "visible" }, a);
    tl.set(id, { visibility: "hidden" }, b);
    if (punch !== 1) tl.fromTo(id, { scale: punch }, { scale: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, a);
  }
  // gravação: punch leve na entrada de cada trecho e zoom lento até o fim
  for (const [a, b] of FOOT) {
    tl.set("#foot", { visibility: "visible" }, a).set("#foot", { visibility: "hidden" }, b);
    tl.fromTo("#fimg", { scale: 1.1 }, { scale: 1.0, duration: 0.5, ease: "expo.out", immediateRender: false }, a);
    tl.to("#fimg", { scale: 1.06, duration: b - a - 0.5, ease: "none" }, a + 0.5);
  }

  hide(["#cd1", "#cd2", "#notif", "#date8", "#orbit", "#loc12", "#btn", "#loc13", "#cursor"]);

  // ================= s1 (0 – 1.94): "E se você pudesse se planejar pra Black,"
  tl.fromTo("#glow1", { scale: 0.7, opacity: 0.6 }, { scale: 1.1, opacity: 1, duration: 1.94, ease: "sine.inOut" }, 0);
  tl.fromTo("#bg1", { x: -60 }, { x: 60, duration: 1.94, ease: "none" }, 0);
  tl.fromTo("#t1a", { scale: 1.08 }, { scale: 1, duration: 0.5, ease: "expo.out" }, 0);   // já na tela no quadro 0
  slam("#t1b", W("pudesse") - 0.04, 1.35);
  pop("#cal1", W("se", 1) - 0.1);
  float("#cal1", W("se", 1) + 0.4, 1.0, 10);
  riseOn("#t1c", [W("se", 1), W("planejar")]);
  riseOn("#t1d", [W("pra"), W("black")]);
  tl.fromTo("#bk1", { scale: 1.4 }, { scale: 1, duration: 0.3, ease: "expo.out", immediateRender: false }, W("black"));

  // ================= s2 (1.94 – 3.52): "sem ficar esperando pra última hora?"
  riseOn("#t2a", [W("sem"), W("ficar"), W("esperando")]);
  pop("#clk", 1.96, 0);
  tl.fromTo("#clk", { rotate: -9 }, { rotate: 9, duration: 0.06, yoyo: true, repeat: 23, ease: "none", immediateRender: false }, 2.2);
  ["#rg1", "#rg2", "#rg3"].forEach((r, i) => {
    for (let k = 0; k < 3; k++) tl.fromTo(r, { scale: 0.45, opacity: 0.95 }, { scale: 1.6, opacity: 0, duration: 1.0, ease: "power2.out", immediateRender: false }, 2.0 + i * 0.17 + k * 0.5);
  });
  riseOn("#t2b", [W("pra", 1)]);
  riseOn("#t2c", [W("última"), W("hora")]);
  shake(W("hora"), 12);

  // ================= s3 (3.52 – 6.55, gravação): "Aqui na realme você já consegue." / "E por aqui"
  riseOn("#t3a", [W("aqui"), W("na")]);
  slam("#t3b", W("realme") - 0.03, 1.6);
  riseOn("#t3c", [W("você", 1), W("já"), W("consegue")]);
  pop("#chk3", W("consegue"));
  out(["#t3a", "#t3b", "#t3c", "#chk3"], 5.62);
  flash(5.73, 0.35);                           // o whip da câmera vira corte
  riseOn("#t3d", [W("e", 1), W("por"), W("aqui", 1)]);

  // ================= s4 (6.55 – 8.0): "a pré-Black já começou." (tela amarela)
  rise("#t4a", 6.55);
  slam("#t4b", W("pré-black") - 0.02, 1.7);
  shake(W("pré-black"), 14);
  riseOn("#t4c", [W("já", 1), W("começou")]);
  pop("#fire2", W("começou") - 0.05, 0); pop("#fire1", W("começou") + 0.05, -20); pop("#fire3", W("começou") + 0.12, 20);

  // ================= s5 (8.0 – 10.0, gravação): "Tem mais, aqui você tem um preço garantido."
  riseOn("#t5a", [W("tem"), W("mais")]);
  out("#t5a", W("preço") - 0.15);
  pop("#shd5", W("preço") - 0.08);
  slam("#t5b", W("preço") - 0.02, 1.4);
  slam("#t5c", W("garantido") - 0.02, 1.5);

  // ================= s6 (10.0 – 12.95): "Se chegar no dia da Black e os preços estiverem diferentes do que já estão,"
  riseOn("#t6a", [W("se", 2), W("chegar"), W("no"), W("dia"), W("da"), W("black", 1)]);
  tl.fromTo("#cd1", { x: -500, rotate: -12, opacity: 0 }, { x: 0, rotate: -4, opacity: 1, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, 10.5);
  tl.fromTo("#cd2", { x: 500, rotate: 12, opacity: 0 }, { x: 0, rotate: 4, opacity: 1, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, 10.75);
  // o preço da Black embaralha sem parar: é diferente, não importa o valor
  const scr = { t: 0 }, scrEl = $("#scr");
  const scrDraw = () => { const n = Math.floor(scr.t * 22); scrEl.textContent = "R$ " + ((n * 7919) % 9) + "." + String((n * 104729) % 1000).padStart(3, "0"); };
  scrDraw();
  tl.fromTo(scr, { t: 0 }, { t: 2.2, duration: 2.2, ease: "none", onUpdate: scrDraw, immediateRender: false }, 10.75);
  pop("#neq", W("diferentes") - 0.05, 0);
  riseOn("#t6b", [W("e", 2), W("os"), W("preços"), W("estiverem")]);
  slam("#t6c", W("diferentes") - 0.03, 1.4);
  shake(W("diferentes"), 10);

  // ================= s7 (12.95 – 14.5): "eu te garanto um Pix de R$ 1.000."
  tl.fromTo("#notif", { y: -420, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.4)", immediateRender: false }, W("pix") - 0.1);
  riseOn("#t7a", [W("eu"), W("te"), W("garanto"), W("o")]);
  out("#t7a", W("pix") - 0.12);
  slam("#t7b", W("pix") - 0.02, 1.5);
  const pv = { v: 0 }, pvEl = $("#pixv");
  const pvDraw = () => { pvEl.textContent = "R$ " + Math.round(pv.v).toLocaleString("pt-BR"); };
  pvDraw();
  slam("#t7c", W("r$ 1000") - 0.02, 1.6);
  tl.fromTo(pv, { v: 0 }, { v: 1000, duration: 0.4, ease: "expo.out", onUpdate: pvDraw, immediateRender: false }, W("r$ 1000"));
  shake(W("r$ 1000"), 18);
  flash(W("r$ 1000"), 0.4);
  // cédulas caindo
  const bills = [];
  for (let i = 0; i < 9; i++) {
    const im = document.createElement("img"); im.src = "img/" + (i % 3 === 2 ? "money_with_wings" : "dollar_banknote") + ".png"; im.className = "ic";
    im.style.cssText = `left:${60 + (i * 397) % 900}px; top:0; width:${150 + (i * 53) % 90}px; opacity:0`;
    $("#bills").appendChild(im); bills.push(im);
    tl.fromTo(im, { y: -300 - (i * 131) % 300, rotate: -30 + (i * 47) % 60, opacity: 1 }, { y: 2100, rotate: 40 - (i * 29) % 80, duration: 1.4 + (i % 3) * 0.2, ease: "power1.in", immediateRender: false }, W("r$ 1000") + 0.03 * i);
  }

  // ================= s8 (14.5 – 16.5, gravação): "E pra você que garantiu o seu realme,"
  riseOn("#t8a", [W("e", 3), W("pra", 2), W("você", 2), W("que", 1), W("garantiu")]);
  riseOn("#t8b", [W("o", 1), W("seu"), W("realme", 1)]);
  tl.fromTo("#date8", { y: 160, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)", immediateRender: false }, 15.0);

  // ================= s9 (16.5 – 20.7): "no dia da Black você garante um fone de ouvido oficial da marca por apenas R$ 1."
  tl.fromTo("#glow9", { scale: 0.7, opacity: 0.5 }, { scale: 1.1, opacity: 1, duration: 4.2, ease: "sine.inOut" }, 16.5);
  riseOn("#t9a", [W("no", 1), W("dia", 1), W("da", 1), W("black", 2), W("você", 3), W("garante")]);
  slam("#hp", W("no", 1) - 0.06, 1.6);
  float("#hp", W("no", 1) + 0.3, 3.0, 14);
  tl.fromTo("#orbit", { scale: 0.6, opacity: 0, rotate: 0 }, { scale: 1, opacity: 1, rotate: 40, duration: 4.0, ease: "expo.out", immediateRender: false }, W("no", 1) - 0.06);
  const sats = $$(".sat"), orb = { a: 0 };
  const orbDraw = () => sats.forEach((s, i) => {
    const ang = orb.a + i * Math.PI / 2;
    s.style.left = 540 + Math.cos(ang) * 410 + "px"; s.style.top = 960 + Math.sin(ang) * 410 + "px";
  });
  orbDraw();
  tl.fromTo(orb, { a: 0 }, { a: Math.PI * 1.2, duration: 4.2, ease: "none", onUpdate: orbDraw, immediateRender: false }, 16.5);
  sats.forEach((s, i) => pop(s, W("oficial") + i * 0.08, 0));
  riseOn("#t9b", [W("fone"), W("oficial")]);
  riseOn("#t9c", [W("da", 2), W("marca"), W("por", 1), W("apenas")]);
  slam("#t9d", W("r$ 1") - 0.02, 1.9);
  tl.to("#hp", { scale: 1.12, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, W("r$ 1"));
  shake(W("r$ 1"), 20);
  flash(W("r$ 1"), 0.45);

  // ================= s10 (20.7 – 23.0, gravação): "É isso mesmo, um fone de ouvido por apenas R$ 1."
  riseOn("#t10a", [W("é"), W("isso"), W("mesmo")]);
  riseOn("#t10b", [W("um", 2), W("fone", 1), W("por", 2), W("apenas", 1)]);
  slam("#t10c", W("r$ 1", 1) - 0.02, 1.8);
  shake(W("r$ 1", 1), 14);

  // ================= s11 (23.0 – 23.8): "Vai perder essa?"
  pop("#face", 23.0, -20);
  tl.fromTo("#face", { rotate: -6 }, { rotate: 6, duration: 0.08, yoyo: true, repeat: 5, ease: "none", immediateRender: false }, 23.35);
  riseOn("#t11a", [W("vai"), W("perder")]);
  slam("#t11b", W("essa") - 0.02, 1.6);

  // ================= s12 (23.8 – 27.0, gravação): "Então vem pra realme do Plaza Shopping Carapicuíba."
  riseOn("#t12a", [W("então"), W("vem"), W("pra", 3)]);
  slam("#t12b", W("realme", 2) - 0.03, 1.6);
  tl.fromTo("#loc12", { y: 160, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)", immediateRender: false }, W("plaza") - 0.1);

  // ================= s13 (27.0 – 30.0): CTA sobre a fachada
  tl.fromTo("#fimg", { filter: "blur(0px)" }, { filter: "blur(16px)", duration: 0.5, ease: "power2.out", immediateRender: false }, 27.0);
  tl.set("#fimg", { filter: "blur(0px)" }, 0);
  tl.fromTo("#dim13", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 27.0);
  rise("#t13a", 27.05); rise("#t13b", 27.2); rise("#t13c", 27.4);
  tl.fromTo("#t13c .g", { scale: 1.4 }, { scale: 1, duration: 0.3, ease: "expo.out", immediateRender: false }, 27.45);
  tl.fromTo("#btn", { y: 160, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.8)", immediateRender: false }, 27.6);
  tl.fromTo("#loc13", { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, 27.8);
  const CLICK = 28.55;
  tl.fromTo("#cursor", { x: 900, y: 1700, opacity: 0 }, { x: 640, y: 1110, opacity: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, CLICK - 0.5);
  tl.to("#cursor", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "35% 10%" }, CLICK);
  tl.to("#btn", { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, CLICK);
  tl.fromTo("#ripple", { left: 680, top: 1125, scale: 0.4, opacity: 0.9 }, { scale: 6, opacity: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, CLICK + 0.04);
  tl.fromTo("#shine", { x: 0 }, { x: 1400, duration: 0.8, ease: "power2.inOut", immediateRender: false }, CLICK + 0.1);
  tl.to("#cursor", { x: 900, y: 1750, opacity: 0, duration: 0.45, ease: "power2.in" }, CLICK + 0.7);

  // ---- poeira nas cenas escuras (posição só depende de t)
  const dust = $("#dust"), D = [];
  for (let i = 0; i < 46; i++) {
    const d = document.createElement("i"); dust.appendChild(d);
    D.push({ d, x: (i * 263) % 1080, y: (i * 571) % 1920, v: 18 + (i * 37) % 50, s: 0.5 + ((i * 13) % 10) / 10, o: 0.15 + ((i * 7) % 10) / 22 });
  }
  const dc = { t: 0 };
  const DARK = [[0, 3.52], [12.95, 14.5], [16.5, 20.7], [27.0, 30.0]];
  const dustDraw = () => { dust.style.opacity = DARK.some(([a, b]) => dc.t >= a && dc.t < b) ? 1 : 0; D.forEach((p) => {
    p.d.style.transform = `translate(${p.x + Math.sin(dc.t * 0.7 + p.x) * 20}px, ${((p.y - dc.t * p.v) % 1920 + 1920) % 1920}px) scale(${p.s})`;
    p.d.style.opacity = p.o;
  }); };
  dustDraw();
  tl.fromTo(dc, { t: 0 }, { t: 30, duration: 30, ease: "none", onUpdate: dustDraw, immediateRender: false }, 0);
  tl.set("#grain", { x: 0 }, 0);
  for (let f = 0; f < 30 * 30; f += 2) tl.set("#grain", { x: ((f * 37) % 60) - 30, y: ((f * 53) % 60) - 30 }, f / 30);

  tl.set({}, {}, T.video_duration_s);
  return tl;
}

window.__ready = (async () => {
  const faces = ["800 10px Poppins", "900 10px Poppins", "500 10px Inter", "700 10px Inter", "italic 400 10px \"Instrument Serif\""];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => (im.src ? im.decode().catch(() => {}) : null)));
  const tl = build();
  await Promise.all([...document.images].map((im) => (im.src ? im.decode().catch(() => {}) : null)));
  const fimg = $("#fimg");
  window.seek = async (t) => {
    tl.seek(t, false);
    const on = FOOT.some(([a, b]) => t >= a && t < b);
    if (on) {
      const f = Math.min(T.total_frames - 1, Math.round(t * T.fps));
      fimg.src = `foot/${String(f + 1).padStart(4, "0")}.jpg`;
      await fimg.decode();
    }
  };
  await window.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.style} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
