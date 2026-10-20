// HYPE CASH v2 — one paused GSAP timeline + pure functions of t for the procedural layers.
// All times come from timing.json (window.TIMING), generated from the narration.
window.__ready = (async () => {
  // build nothing until the fonts are in: GSAP measures elements when the timeline is built
  const faces = ["700 10px Poppins", "800 10px Poppins", "900 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  const T = window.TIMING, E = T.emphasis, FPS = T.fps;
  const S = Object.fromEntries(T.scenes.map((s) => [s.id, s]));
  const q = (s) => document.querySelector(s);
  const qa = (s) => [...document.querySelectorAll(s)];
  const LEAD = 2 / FPS; // text may land up to two frames before its word
  const W = (text, from = 0) => {
    const i = T.words.findIndex((w, k) => k >= from && w.w.replace(/[.,:?]/g, "").toLowerCase() === text.toLowerCase());
    if (i < 0) throw new Error("word not found: " + text);
    return T.words[i].start;
  };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const backOut = (x) => { x = clamp(x); const c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
  let seed = 1805; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); // fixed-seed PRNG

  // ---------- procedural: topic chips (S1 wave → S2 collapse) ----------
  const TOPICS = ["#GTAVI", "trailer novo", "gameplay", "teorias", "Vice City", "data de lançamento?", "reação", "mapa completo",
    "carros", "personagens", "easter eggs", "#GTA6", "análise", "dicas", "ranking", "notícias", "vazou?", "missões"];
  const chipsEl = q("#chips");
  const chips = TOPICS.map((txt, i) => {
    const el = document.createElement("div");
    el.className = "chip" + (i % 3 === 1 ? " b" : i % 3 === 2 ? " l" : "");
    el.innerHTML = `<i></i>${txt}`;
    chipsEl.appendChild(el);
    const ROWS = [250, 365, 480, 1250, 1365, 1480, 1595, 140, 1710];
    return { el, y0: ROWS[i % 9] + (i >= 9 ? 40 : 0), x0: (i >= 9 ? 820 : 120) + rnd() * 520, v: 140 + rnd() * 160,
      ph: rnd(), appear: i < 7 ? 0 : 0.05 + (i - 7) * 0.07, w: 0 };
  });
  const layoutChips = (t) => {
    const dim = 1 - 0.6 * smooth((t - E.gta + 0.05) / 0.25);  // chips step back when GTA VI lands
    const k = smooth((t - 2.3) / 0.55);                          // collapse into the viewfinder
    for (const c of chips) {
      if (!c.w) c.w = c.el.offsetWidth;
      const x = c.x0 - c.v * t, y = c.y0 + 38 * Math.sin(2 * Math.PI * (0.45 * t + c.ph));
      const cx = x + (540 - x) * k, cy = y + (860 - y) * k;
      const s = c.appear === 0 ? 1 : backOut((t - c.appear) / 0.28);
      const vis = t >= c.appear ? 1 : 0;
      c.el.style.transform = `translate(${(cx - c.w / 2).toFixed(1)}px, ${(cy - 35).toFixed(1)}px) scale(${(s * (1 - 0.8 * k)).toFixed(3)})`;
      c.el.style.opacity = (vis * dim * (1 - k)).toFixed(3);
    }
  };

  // ---------- procedural: crowd (S2) ----------
  const crowdEl = q("#crowd");
  const crowd = Array.from({ length: 9 }, (_, i) => {
    const x = 160 + i * 95, y = 1335 + 34 * Math.cos(((i - 4) / 4) * 1.3) - 34;
    const ring = document.createElement("div"); ring.className = "ring";
    const av = document.createElement("div"); av.className = "avatar";
    ring.style.left = `${x - 54}px`; ring.style.top = `${y - 54}px`;
    av.style.left = `${x - 48}px`; av.style.top = `${y - 48}px`;
    crowdEl.append(ring, av);
    return { ring, av, t0: E.galera - LEAD + Math.abs(i - 4) * 0.06 };
  });
  const layoutCrowd = (t) => {
    for (const c of crowd) {
      const s = backOut((t - c.t0) / 0.3), o = t >= c.t0 ? 1 : 0;
      for (const el of [c.ring, c.av]) { el.style.transform = `scale(${s.toFixed(3)})`; el.style.opacity = o; }
    }
  };

  // ---------- S6 plan path (missions 01–06 + bonus) ----------
  const pathSvg = q("#path");
  const pts = Array.from({ length: 7 }, (_, i) => [60 + i * 130, 130 + 70 * Math.sin(i * 1.15)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  pathSvg.innerHTML = `<defs><linearGradient id="pg" x1="0" x2="1"><stop offset="0" stop-color="#ff3fa4"/><stop offset=".5" stop-color="#b04bff"/><stop offset="1" stop-color="#4f8bff"/></linearGradient></defs>
    <path id="planLine" d="${d}" fill="none" stroke="url(#pg)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>` +
    pts.map((p, i) => `<g class="pn" transform="translate(${p[0]} ${p[1]})"><circle r="44" fill="${i === 6 ? "#dcfe64" : "#1a1830"}" stroke="${i === 6 ? "#dcfe64" : "#b04bff"}" stroke-width="5"/>
      <text y="12" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="34" fill="${i === 6 ? "#12101f" : "#fff"}">${i === 6 ? "★" : "0" + (i + 1)}</text></g>`).join("");

  // ---------- timeline ----------
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  const show = (sel, at) => tl.set(sel, { autoAlpha: 1 }, at);
  const hide = (sel, at) => tl.set(sel, { autoAlpha: 0 }, at);
  gsap.set(["#s2", "#s3", "#s4", "#s5", "#s6", "#s7"], { autoAlpha: 0 });
  gsap.set("#bg1", { xPercent: -50, yPercent: -50 });
  gsap.set("#pill", { xPercent: -50 });
  gsap.set("#bg3", { xPercent: -50, yPercent: -50 });
  gsap.set("#bg7", { xPercent: -50, yPercent: -50 });

  // S1 · Gancho (0 → 2.48)
  tl.fromTo("#bg1", { scale: 1.25, y: 120 }, { scale: 1.1, y: 40, duration: 2.6, ease: "none" }, 0);
  tl.fromTo("#todo", { scale: 1.08, opacity: 1 }, { scale: 1, opacity: 1, duration: 0.45, ease: "expo.out" }, 0);
  tl.fromTo("#falar", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, E.falar - 0.16 - LEAD);
  tl.to(["#todo", "#falar"], { y: -150, duration: 0.45, ease: "power4.out" }, E.gta - LEAD);
  tl.fromTo("#gta", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.36, ease: "expo.out" }, E.gta - LEAD);
  tl.fromTo("#flash", { opacity: 0.5 }, { opacity: 0, duration: 0.2, ease: "power2.out", immediateRender: false }, E.gta);
  tl.fromTo("#gtaR", { x: -28, y: 6 }, { x: -5, y: 0, duration: 0.5, ease: "power2.out" }, E.gta);
  tl.fromTo("#gtaC", { x: 28, y: -6 }, { x: 5, y: 0, duration: 0.5, ease: "power2.out" }, E.gta);
  tl.to("#gtaR", { x: -18, duration: 0.05, yoyo: true, repeat: 1, ease: "none" }, W("Seis"));
  tl.to("#gtaC", { x: 18, duration: 0.05, yoyo: true, repeat: 1, ease: "none" }, W("Seis"));
  tl.to(["#todo", "#falar", "#gta"], { scale: 0.7, opacity: 0, duration: 0.3, ease: "power2.in" }, 2.3);
  tl.fromTo("#s2", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none", immediateRender: false }, 2.42);
  hide("#s1", 2.9);

  // S2 · A pergunta (2.48 → 7.2)
  tl.fromTo("#vf", { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45 }, 2.55);
  tl.fromTo("#perg", { opacity: 0, letterSpacing: "0.5em" }, { opacity: 1, letterSpacing: "0.22em", duration: 0.45 }, E.pergunta - 0.16 - LEAD);
  tl.fromTo("#quem", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, E.quem - LEAD);
  tl.fromTo("#criar", { scale: 1.45, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.38, ease: "expo.out" }, E.criar - LEAD);
  tl.fromTo("#criarLine", { width: 0 }, { width: 660, duration: 0.35, ease: "power2.inOut" }, E.criar + 0.2);
  const ow = qa("#oconteudo .w");
  ["o", "conteúdo", "que", "essa", "galera", "vai", "assistir"].forEach((w, i) =>
    tl.fromTo(ow[i], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.22 }, W(w, 13 + (i ? 1 : 0)) - LEAD));
  // continuous camera drift so the holds between words never read as frozen frames
  tl.fromTo("#s2", { scale: 1 }, { scale: 1.06, duration: 6.95 - 2.48, ease: "none", immediateRender: false }, 2.48);
  tl.fromTo("#crowd", { y: 0 }, { y: -18, duration: 6.95 - E.galera, ease: "sine.inOut" }, E.galera);
  tl.to("#s2", { scale: 1.3, opacity: 0, duration: 0.45, ease: "power2.in" }, 6.95);
  tl.fromTo("#flash", { opacity: 0 }, { opacity: 0.9, duration: 0.12, ease: "none", immediateRender: false }, E.hypecash - 0.14);
  tl.to("#flash", { opacity: 0, duration: 0.35, ease: "power2.out" }, E.hypecash - 0.02);
  hide("#s2", 7.42);

  // S3 · Revelação (7.2 → 11.64)
  show("#s3", 7.3);
  tl.fromTo("#bg3", { scale: 1.0 }, { scale: 1.12, duration: 4.5, ease: "none" }, 7.2);
  tl.fromTo("#logoBox", { scale: 0.55, rotation: -5, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(1.5)" }, E.hypecash - LEAD);
  // light sweep: a brightened copy of the logo seen through a moving skewed band (clip-path, no async mask)
  const band = { x: -50 };
  tl.fromTo(band, { x: -50 }, { x: 150, duration: 0.7, ease: "power2.inOut", onUpdate: () => {} }, E.hypecash + 0.3);
  window.__band = band;
  tl.fromTo("#pill", { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, E.playbook - LEAD);
  tl.to("#logoBox", { y: -40, scale: 0.94, duration: 2.5, ease: "none" }, E.playbook);
  const tw = qa("#tema .w");
  ["usar", "esse", "hype", "como", "tema"].forEach((w, i) =>
    tl.fromTo(tw[i], { opacity: 0, y: 40, scale: i === 2 || i === 4 ? 1.3 : 1 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)" }, W(w, 28) - LEAD));
  tl.to(["#logoBox", "#pill", "#tema"], { y: "-=160", opacity: 0, duration: 0.35, ease: "power2.in", stagger: 0.04 }, S.S3.end - 0.25);
  hide("#s3", S.S3.end + 0.2);

  // S4 · O caminho (11.64 → 18.46)
  tl.fromTo("#s4", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "none", immediateRender: false }, S.S4.start - 0.1);
  tl.fromTo("#track", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.35 }, S.S4.start);
  gsap.set("#trackFill", { width: 0 });
  gsap.set(".node .on", { scale: 0 });
  gsap.set("#stepWord div", { yPercent: 260 });
  gsap.set([".ucard", "#mark"], { autoAlpha: 0 });
  const steps = [
    { t: E.formato, card: "#u1", cap: "Missão 01 · checklist", mark: [1297, 1040] },
    { t: E.constancia, card: "#u2", cap: "Missão 01 · passo 4", mark: [920, 783] },
    { t: E.audiencia, card: "#u3", cap: "Missões 02 e 03" },
    { t: E.monetizacao, card: "#u4", cap: "Mapa de Missões" },
  ];
  const words = qa("#stepWord div"), ons = qa(".node .on"), cap = q("#stepCap");
  steps.forEach((s, i) => {
    const at = s.t - 0.12;
    tl.to("#trackFill", { width: (800 * i) / 3, duration: 0.35, ease: "power2.inOut" }, at - 0.1);
    tl.fromTo(ons[i], { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2.2)" }, at);
    tl.fromTo(words[i], { yPercent: 260 }, { yPercent: 0, duration: 0.32, ease: "power3.out" }, at);
    if (i) tl.to(words[i - 1], { yPercent: -220, duration: 0.22, ease: "power3.in" }, at - 0.08);
    tl.fromTo(s.card, { autoAlpha: 0, x: 420, rotationY: -18 }, { autoAlpha: 1, x: 0, rotationY: 0, duration: 0.45, ease: "power3.out" }, at);
    if (i) tl.to(steps[i - 1].card, { autoAlpha: 0, x: -420, rotationY: 18, duration: 0.35, ease: "power3.in" }, at - 0.05);
    s.capAt = at;
    // slow push on the held card until the next step
    const until = i < 3 ? null : S.S4.end - 0.3;
    s.pushFrom = at + 0.45; s.until = until;
  });
  steps.forEach((s, i) => {
    const end = i < 3 ? steps[i + 1].t - 0.17 : S.S4.end - 0.3;
    tl.fromTo(s.card, { scale: 1 }, { scale: 1.045, duration: end - s.pushFrom, ease: "none", immediateRender: false }, s.pushFrom);
  });
  tl.fromTo("#g4a", { x: 0, y: 0 }, { x: 260, y: -220, duration: S.S4.end - S.S4.start, ease: "sine.inOut" }, S.S4.start);
  tl.fromTo("#g4b", { x: 0, y: 0 }, { x: -240, y: -300, duration: S.S4.end - S.S4.start, ease: "sine.inOut" }, S.S4.start);
  // lime highlight on the line the narration refers to (centre y measured on the 920 px preview; crop top, card scale)
  const markBox = (s) => {
    const card = q(s.card), crop0 = s.mark[1], scale = 1000 / (s.card === "#u1" ? 920 : 860);
    const cy = card.offsetTop + (s.mark[0] - crop0) * scale;
    return s.card === "#u1" ? { left: 52, top: cy - 52, width: 976, height: 104 } : { left: 172, top: cy - 31, width: 770, height: 64 };
  };
  steps.slice(0, 2).forEach((s, i) => {
    tl.set("#mark", markBox(s), s.t + 0.2);
    tl.fromTo("#mark", { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 0.28, immediateRender: false }, s.t + 0.25);
    tl.to("#mark", { autoAlpha: 0, duration: 0.15 }, steps[i + 1].t - 0.2);
  });
  tl.to(["#u4", "#track", "#stepWord", "#stepCap"], { opacity: 0, duration: 0.3 }, S.S4.end - 0.15);
  tl.fromTo("#u4", { scale: 1 }, { scale: 1.12, duration: 0.45, ease: "power2.in", immediateRender: false }, S.S4.end - 0.3);
  hide("#s4", S.S4.end + 0.2);

  // S5 · Prova (18.46 → 23.92)
  tl.fromTo("#s5", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "none", immediateRender: false }, S.S5.start - 0.12);
  gsap.set(["#fTools", "#fCheck"], { xPercent: 100 });
  gsap.set(".big-badge", { autoAlpha: 0 });
  tl.fromTo("#fMapa", { y: 60, scale: 1.04 }, { y: -150, scale: 1, duration: W("central") - S.S5.start, ease: "none" }, S.S5.start - 0.12);
  tl.fromTo("#bSeis", { autoAlpha: 0, x: -300, rotation: -8 }, { autoAlpha: 1, x: 0, rotation: -3, duration: 0.42, ease: "back.out(1.7)" }, E.seis - LEAD);
  tl.fromTo("#bBonus", { autoAlpha: 0, x: 300, rotation: 8 }, { autoAlpha: 1, x: 0, rotation: 3, duration: 0.42, ease: "back.out(1.7)" }, E.bonus - LEAD);
  const swap1 = E.central - 0.18;
  tl.to(["#bSeis", "#bBonus"], { autoAlpha: 0, scale: 0.8, duration: 0.22, ease: "power2.in" }, swap1 - 0.05);
  tl.to("#fMapa", { xPercent: -40, opacity: 0.3, duration: 0.42, ease: "power3.inOut" }, swap1);
  tl.fromTo("#fTools", { xPercent: 100 }, { xPercent: 0, duration: 0.42, ease: "power3.inOut" }, swap1);
  tl.fromTo("#fTools", { y: 0 }, { y: -170, duration: E.checklist - swap1, ease: "none" }, swap1 + 0.2);
  tl.fromTo("#bTools", { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }, E.central + 0.1);
  const swap2 = E.checklist - 0.3;
  tl.to("#bTools", { autoAlpha: 0, duration: 0.2 }, swap2 - 0.05);
  tl.to("#fTools", { xPercent: -40, opacity: 0.3, duration: 0.42, ease: "power3.inOut" }, swap2);
  tl.fromTo("#fCheck", { xPercent: 100 }, { xPercent: 0, duration: 0.42, ease: "power3.inOut" }, swap2);
  // real checklist: checkbox centres measured on the 920 px preview, crop starts at y=1040, shown at 1080/920
  const k = 1080 / 920;
  const checkTimes = [0, 1, 2, 3].map((i) => E.checklist + 0.1 + i * 0.16);
  [1168, 1297, 1425, 1553].forEach((y, i) => {
    const el = document.createElement("div");
    el.className = "chk"; el.id = `c${i}`;
    el.innerHTML = `<svg viewBox="0 0 22 22"><path d="M4 11.5 L9 16 L18 6" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
    el.style.left = `${87 * k}px`; el.style.top = `${(y - 1040) * k}px`;
    q("#chkWrap").appendChild(el);
    tl.fromTo(el, { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(2.5)" }, checkTimes[i]);
    tl.fromTo(el.querySelector("path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.18 }, checkTimes[i] + 0.06);
  });
  gsap.set("#fill", { width: "0%" });
  tl.fromTo("#fill", { width: "0%" }, { width: "100%", duration: 0.7, ease: "power2.inOut" }, E.progresso - LEAD);

  // S6 · Sem promessa (23.92 → 27.9): hard cut with a glitch
  hide("#s5", S.S6.start);
  show("#s6", S.S6.start);
  tl.fromTo("#flash", { opacity: 0.35 }, { opacity: 0, duration: 0.12, ease: "none", immediateRender: false }, S.S6.start);
  tl.fromTo("#g6a", { x: 0, y: 0, opacity: 0.6 }, { x: 300, y: 160, opacity: 1, duration: S.S6.end - S.S6.start, ease: "sine.inOut" }, S.S6.start);
  tl.fromTo("#g6b", { x: 0, y: 0 }, { x: -260, y: -200, duration: S.S6.end - S.S6.start, ease: "sine.inOut" }, S.S6.start);
  tl.fromTo("#nao", { scale: 1 }, { scale: 1.05, duration: E.dinheiro - S.S6.start, ease: "none" }, S.S6.start);
  const nw = qa("#nao .w");
  ["Não", "é", "promessa", "de"].forEach((w, i) => tl.fromTo(nw[i], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.22 }, W(w, 64) - LEAD));
  tl.fromTo("#facil", { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, E.dinheiro - LEAD);
  tl.to("#facilR", { keyframes: [{ x: -22, y: 4 }, { x: 12, y: -3 }, { x: -9, y: 2 }, { x: 18, y: 0 }, { x: -4, y: 0 }], duration: 0.45, ease: "none" }, E.dinheiro);
  tl.to("#facilC", { keyframes: [{ x: 22, y: -4 }, { x: -12, y: 3 }, { x: 9, y: -2 }, { x: -18, y: 0 }, { x: 4, y: 0 }], duration: 0.45, ease: "none" }, E.dinheiro);
  tl.fromTo("#strike", { width: 0 }, { width: 820, duration: 0.25, ease: "power2.out" }, E.facil + 0.15);
  tl.to(["#facil", "#strike", "#nao"], { opacity: 0.32, duration: 0.3 }, W("É", 71) - 0.05);
  const pw = qa("#plano .w");
  ["É", "um", "plano"].forEach((w, i) => tl.fromTo(pw[i], { opacity: 0, y: 40, scale: i === 2 ? 1.35 : 1 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)" }, W(w, 71) - LEAD));
  tl.fromTo("#comecar", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, E.comecar - 0.12 - LEAD);
  tl.fromTo("#planLine", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut" }, E.plano);
  qa(".pn").forEach((g, i) => tl.fromTo(g, { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, E.plano + i * 0.16));

  // S7 · CTA (27.9 → end)
  tl.fromTo("#s7", { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, S.S7.start - 0.1);
  hide("#s6", S.S7.start + 0.25);
  tl.fromTo("#bg7", { scale: 1.2, y: 0 }, { scale: 1.08, y: -40, duration: T.video_duration_s - S.S7.start, ease: "none" }, S.S7.start);
  tl.fromTo("#endLogo", { autoAlpha: 0, y: -100, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, S.S7.start);
  const ew = qa("#entre .w");
  ew.forEach((w, i) => tl.fromTo(w, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, S.S7.start + 0.12 + i * 0.08));
  tl.fromTo("#cta", { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.42, ease: "back.out(1.8)" }, E.toque - 0.05);
  tl.to("#cta", { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }, E.botao);
  tl.fromTo("#cta .shine", { left: -200 }, { left: 1000, duration: 0.7, ease: "power2.inOut" }, E.botao);
  tl.fromTo("#url", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35 }, E.botao + 0.2);
  tl.fromTo("#chev", { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: 0, duration: 0.3 }, E.botao + 0.15);
  tl.to("#chev", { y: 24, duration: 0.4, yoyo: true, repeat: 6, ease: "sine.inOut" }, E.botao + 0.45);
  tl.fromTo("#legal", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, E.botao + 0.5);
  tl.to("#endLogo", { scale: 1.07, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, E.cash_end);
  tl.to("#cta", { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }, E.cash_end);
  tl.fromTo("#cta .shine", { left: -200 }, { left: 1000, duration: 0.7, ease: "power2.inOut", immediateRender: false }, E.cash_end);
  tl.set({}, {}, T.video_duration_s);

  // ---------- deterministic seek ----------
  const tc = q("#tc"), rec = q("#rec i"), grain = q("#grain"), chkCount = q("#chkCount"), pct = q("#pct");
  window.seek = (t) => {
    // canonical path: back to 0 (reverts every tween), then forward to t. The state never depends on seek history.
    tl.seek(0, false);
    tl.seek(t, false);
    const x = window.__band.x;
    q("#sweep").style.clipPath = `polygon(${x + 20}% 0, ${x + 32}% 0, ${x + 12}% 100%, ${x}% 100%)`;
    layoutChips(t);
    layoutCrowd(t);
    const f = Math.max(0, Math.round((t - 2.48) * FPS));
    tc.textContent = `00:00:${String(Math.floor(f / FPS)).padStart(2, "0")}:${String(f % FPS).padStart(2, "0")}`;
    rec.style.opacity = Math.floor(t * 2) % 2 ? 0.25 : 1;
    const g = Math.round(t * FPS) % 16; // grain: 16 seeded offsets
    grain.style.transform = `translate(${-((g * 389) % 900)}px, ${-((g * 571) % 600)}px)`;
    chkCount.textContent = `Checklist (${checkTimes.filter((c) => t >= c + 0.06).length}/4)`;
    pct.textContent = `${Math.round((parseFloat(q("#fill").style.width) || 0))}%`;
    q("#stepCap").textContent = [...steps].reverse().find((s) => t >= s.capAt)?.cap ?? " ";
  };
  window.duration = tl.duration();
  await Promise.all([...document.images].map((img) => (img.complete ? img.decode().catch(() => {}) : new Promise((r) => (img.onload = img.onerror = r)))));
  chips.forEach((c) => (c.w = c.el.offsetWidth));
  window.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
