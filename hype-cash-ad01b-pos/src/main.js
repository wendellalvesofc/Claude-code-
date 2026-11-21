// HYPE CASH Motion 01 B ("A Busca"), post-launch version with price. One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// The scenes are written against the pre-launch narration (E = its word times); every position is remapped onto the
// post-launch narration through matching words (anchors below). The new CTA uses the new times directly (N).
const T = window.TIMING, E = T.emphasis_prelaunch, N = T.emphasis;
const $ = (s) => document.querySelector(s);

function build() {
  const tl = gsap.timeline({ paused: true });
  // old time → new time, piecewise linear through the same words in both narrations
  const P = T.emphasis_post1;
  const A = [[0, 0], [E.muita, P.muita], [E.pesquisar, P.pesquisar], [E.ele, P.ele], [E.trailer, P.trailer], [E.mapa, P.mapa], [E.segredos, P.segredos], [E.teorias, P.teorias], [E.pergunta, P.pergunta], [E.quem, P.quem], [E.aparecer, P.aparecer], [E.buscas, P.buscas], [E.pode, P.pode], [E.voce, P.voce], [E.hypecash, P.hypecash], [E.playbook, P.playbook], [E.interativo, P.interativo], [E.guia, P.guia], [E.missao, P.missao], [E.criar, P.criar], [E.conteudo, P.conteudo], [E.hype, P.hype], [E.primeiro, P.primeiro], [E.audiencia, P.audiencia], [E.checklist, P.checklist], [E.progresso, P.progresso], [E.sem, P.sem], [E.dinheiro, P.dinheiro], [E.facil, P.facil], [E.plano, P.plano], [E.comecar, P.comecar], [E.enquanto, P.enquanto], [E.hype2, P.hype2], [E.ar, P.ar], [25.82, 25.85]];
  const pw = (AA) => (t) => {
    if (t <= 0) return t;
    for (let i = 1; i < AA.length; i++) if (t <= AA[i][0]) { const [a0, b0] = AA[i - 1], [a1, b1] = AA[i]; return b0 + (t - a0) * (b1 - b0) / (a1 - a0); }
    return t + AA[AA.length - 1][1] - AA[AA.length - 1][0];
  };
  // v2 narration (what is inside + objections): the shared opening words move from the v1 times (P) to the v2 ones (N)
  const B2 = [[0, 0], ...["chegar", "muita", "pesquisar", "ele", "trailer", "mapa", "segredos", "teorias", "pergunta", "quem", "aparecer", "buscas", "pode", "voce",
    "hypecash", "playbook", "interativo", "guia", "missao"].map((k) => [P[k], N[k]])];
  const r1 = pw(A), r2 = pw(B2), remap = (t) => r2(r1(t));
  const raw = { to: tl.to.bind(tl), fromTo: tl.fromTo.bind(tl), set: tl.set.bind(tl) };
  const span = (v, at) => { const d = v.duration ?? 0.5, a = remap(at); return [a, Math.max(0.02, remap(at + d) - a)]; };
  tl.to = (t, v, at) => { if (typeof at !== "number") return raw.to(t, v, at); const [a, d] = span(v, at); return raw.to(t, { ...v, duration: d }, a); };
  tl.fromTo = (t, f, v, at) => { if (typeof at !== "number") return raw.fromTo(t, f, v, at); const [a, d] = span(v, at); return raw.fromTo(t, f, { ...v, duration: d }, a); };
  tl.set = (t, v, at) => raw.set(t, v, typeof at === "number" ? remap(at) : at);

  // ---- helpers
  const scene = (id, a, b) => { tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b); };
  const blurPulse = (el, at, dur, px) => tl.fromTo(el, { filter: `blur(${px}px)` }, { filter: "blur(0px)", duration: dur, ease: "power2.out", immediateRender: false }, at);
  const rise = (els, at, stagger = 0.07) => tl.fromTo(els, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out", stagger }, at);
  // words land on the narration: one start time per word
  const riseOn = (sel, times) => $(sel).querySelectorAll(".w").forEach((w, i) => rise(w, times[i] - 0.06));
  const slam = (sel, at, from = 1.35) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.38, ease: "expo.out" }, at);
  const pop = (sel, at, s = 1) => tl.fromTo(sel, { scale: 0, rotate: -12, opacity: 0 }, { scale: s, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(2.2)" }, at);
  const leave = (sel, at, y = -50) => tl.to(sel, { y, opacity: 0, filter: "blur(10px)", duration: 0.28, ease: "power2.in" }, at);
  const wipe = (sel, cx, cy, at, dur) => {
    tl.set(sel, { left: cx - 100, top: cy - 100, width: 200, height: 200, scale: 0, visibility: "visible" }, at);
    tl.to(sel, { scale: 24, duration: dur, ease: "power3.in" }, at);
    tl.set(sel, { visibility: "hidden" }, at + dur + 0.02);
  };
  const type = (el, str, at, dur, from = 0) => {
    const o = { n: from };
    const put = () => { el.textContent = str.slice(0, Math.round(o.n)); };
    put();
    tl.fromTo(o, { n: from }, { n: str.length, duration: dur, ease: "none", onUpdate: put, immediateRender: false }, at);
  };
  const blink = (sel, at, until) => tl.fromTo(sel, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "steps(1)", yoyo: true, repeat: Math.floor((until - at) / 0.3) }, at);
  const GLYPH = {
    play: '<path d="M8 5.5v13l11-6.5z" fill="#fff"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" fill="#fff"/><circle cx="12" cy="10" r="2.4" fill="#1b4fb8"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#fff"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" stroke="#fff" stroke-width="2.6" fill="none"/><circle cx="12" cy="15.4" r="1.6" fill="#5a17c9"/>',
    bulb: '<path d="M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V17h5.2v-.7c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z" fill="#15101f"/><rect x="9.4" y="18.3" width="5.2" height="2.2" rx="1" fill="#15101f"/>',
    search: '<circle cx="10.5" cy="10.5" r="6" stroke="#15101f" stroke-width="2.6" fill="none" opacity=".45"/><path d="M15 15l5 5" stroke="#15101f" stroke-width="2.8" stroke-linecap="round" opacity=".45"/>',
  };

  // ================= S1 hook (0 – 3.95): "Quando GTA 6 chegar, muita gente vai pesquisar sobre ele."
  // frame 0 already shows the search bar typing; on "muita gente" it multiplies into many searches
  tl.set("#s12", { visibility: "hidden" }, 7.4);   // visible from the first frame (see CSS)
  type($("#q1"), "gta 6", 0, 0.6, 1);
  blink("#caret1", 0.7, 7.2);
  tl.fromTo("#bar", { scale: 1.06 }, { scale: 1, duration: 0.6, ease: "expo.out" }, 0);
  tl.fromTo("#t1a", { x: -24 }, { x: 0, duration: 0.6, ease: "expo.out" }, 0);   // on screen at frame 0
  tl.fromTo("#glow12", { scale: 0.8, opacity: 0.6 }, { scale: 1.15, opacity: 1, duration: 3.9, ease: "sine.inOut" }, 0);
  riseOn("#t1b", [E.muita, 2.41, 2.69]);
  slam("#t1c", E.pesquisar - 0.05, 1.25);
  tl.to("#bar", { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, E.pesquisar - 0.05);
  const MINIS = [
    [40, 760, 0.9, "gta 6 data de lançamento"], [470, 845, 0.78, "gta 6 trailer 2"], [-150, 1190, 0.86, "gta 6 mapa completo"],
    [560, 1230, 0.9, "gta 6 gameplay"], [70, 1340, 0.76, "gta 6 personagens"], [600, 1440, 0.82, "gta 6 easter eggs"],
    [-70, 1540, 0.9, "gta 6 teorias"], [400, 1650, 0.8, "gta 6 vale a pena?"], [700, 730, 0.7, "gta 6 segredos"], [620, 1820, 0.76, "gta 6 requisitos"],
  ];
  const miniEls = MINIS.map(([x, y, s, txt], i) => {
    const m = document.createElement("div"); m.className = "mini";
    m.innerHTML = `<svg viewBox="0 0 24 24">${GLYPH.search}</svg><span>${txt}</span>`;
    $("#minis").appendChild(m);
    tl.fromTo(m, { x, y: y + 90, scale: s * 0.6, opacity: 0, filter: "blur(12px)" },
      { y, scale: s, opacity: s > 0.85 ? 1 : 0.8, filter: s > 0.85 ? "blur(0px)" : "blur(2px)", duration: 0.5, ease: "expo.out" }, E.muita + i * 0.055);
    return m;
  });
  tl.to("#minis", { y: 60, duration: 1.8, ease: "none" }, E.muita);
  // far layer: blurred searches already drifting at frame 0, so the first frame moves
  [[-120, 820, "gta 6 lançamento"], [640, 1250, "gta 6 trailer"], [-60, 1480, "gta 6 mapa"], [560, 1700, "gta 6 teorias"], [600, 700, "gta 6 data"]].forEach(([x, y, txt], i) => {
    const f = document.createElement("div"); f.className = "mini";
    f.innerHTML = `<svg viewBox="0 0 24 24">${GLYPH.search}</svg><span>${txt}</span>`;
    f.style.filter = "blur(7px)";
    $("#far").appendChild(f);
    tl.fromTo(f, { x, y, scale: 0.62, opacity: 0.32 }, { y: y - 260, duration: 3.9, ease: "none" }, 0);
    tl.to(f, { opacity: 0, duration: 0.3 }, 3.55);
  });
  miniEls.forEach((m, i) => tl.to(m, { x: `+=${(MINIS[i][0] < 300 ? -1 : 1) * 700}`, opacity: 0, filter: "blur(16px)", duration: 0.4, ease: "power2.in" }, 3.55 + i * 0.015));
  leave(["#t1a", "#t1b", "#t1c"], 3.62, -60);
  tl.to("#bar", { y: -700, duration: 0.5, ease: "expo.inOut" }, 3.65);

  // ================= S2 (3.95 – 7.4): "Trailer, mapa, segredos, teorias." — the suggestions drop down
  const SUG = [["trailer", "i-pink", "play"], ["mapa", "i-blue", "pin"], ["segredos", "i-purple", "lock"], ["teorias", "i-lime", "bulb"]];
  const SAT = [E.trailer, E.mapa, E.segredos, E.teorias];
  const rows = SUG.map(([kw, ic, g], i) => {
    const r = document.createElement("div"); r.className = "row";
    r.innerHTML = `<div class="hi"></div><div class="icon ic ${ic}"><svg viewBox="0 0 24 24">${GLYPH[g]}</svg></div><div class="tx">gta 6 <b>${kw}</b></div><div class="up">↗ em alta</div>`;
    $("#drop").appendChild(r);
    return r;
  });
  tl.set(rows, { height: 0, opacity: 0 }, 0);
  tl.fromTo("#drop", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, SAT[0] - 0.15);
  rows.forEach((r, i) => {
    const at = SAT[i] - 0.08;
    tl.to(r, { height: 150, opacity: 1, duration: 0.32, ease: "expo.out" }, at);
    tl.fromTo(r.querySelector(".ic"), { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2.4)" }, at + 0.05);
    tl.fromTo(r.querySelector(".up"), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, at + 0.12);
    tl.fromTo(r.querySelector(".hi"), { opacity: 0 }, { opacity: 1, duration: 0.15 }, at);
    if (i < 3) tl.to(r.querySelector(".hi"), { opacity: 0, duration: 0.2 }, SAT[i + 1] - 0.08);
    // the giant outlined keyword behind the panel
    tl.fromTo(`#bw${i}`, { y: 260 }, { y: 0, duration: 0.45, ease: "expo.out", immediateRender: false }, at + 0.04);
    if (i < 3) tl.to(`#bw${i}`, { y: -260, duration: 0.18, ease: "power3.in" }, SAT[i + 1] - 0.16);
  });
  gsap.set(["#bw0", "#bw1", "#bw2", "#bw3"], { y: 260 });   // outside the timeline: a set at 0 is not rendered by seek(0)
  tl.to(["#drop", "#bar"], { y: "-=900", filter: "blur(12px)", duration: 0.4, ease: "power3.in", stagger: 0.04 }, 7.05);
  tl.to("#bw3", { y: -260, duration: 0.3, ease: "power3.in" }, 7.05);
  wipe("#w23", 540, 1300, 7.05, 0.36);

  // ================= S3 (7.4 – 11.95): "A pergunta é: quem vai aparecer nessas buscas? Pode ser você."
  scene("#s3", 7.4, 11.95);
  rise("#t3a", 7.42);
  riseOn("#t3b", [E.quem, E.quem + 0.18, E.aparecer, E.aparecer + 0.48, E.buscas]);
  tl.fromTo("#apa", { scale: 1 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, E.aparecer + 0.1);
  tl.fromTo(["#slot", "#r1", "#r2"], { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out", stagger: 0.09 }, 7.5);
  tl.fromTo(".shim", { x: -340 }, { x: 340, duration: 0.9, ease: "none", repeat: 4 }, 7.5);
  pop("#qmark", E.quem);
  tl.to("#qmark", { rotate: 10, duration: 0.15, yoyo: true, repeat: 3, ease: "sine.inOut" }, E.aparecer + 0.2);
  riseOn("#t3c", [E.pode, E.pode + 0.22, E.voce]);
  tl.fromTo("#t3c .pink", { scale: 1.4 }, { scale: 1, duration: 0.4, ease: "expo.out" }, E.voce - 0.06);
  tl.fromTo("#fill", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, E.voce - 0.04);
  blurPulse("#fill", E.voce - 0.04, 0.35, 10);
  tl.to("#slot", { scale: 1.04, duration: 0.45, ease: "back.out(1.8)" }, E.voce - 0.04);
  tl.fromTo("#fill .nw", { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, E.voce + 0.25);
  tl.to(["#r1", "#r2"], { opacity: 0.35, filter: "blur(3px)", duration: 0.4 }, E.voce);
  wipe("#w34", 470, 860, 11.6, 0.36);

  // ================= S4 (11.95 – 17.45): the product, then the route mission by mission
  scene("#s4", 11.95, 17.45);
  tl.fromTo("#bloom4", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, E.hypecash - 0.05);
  const L4 = 640 / 1189, L4b = 300 / 1189;
  tl.fromTo("#logo4", { x: 220, y: 470, scale: L4 * 1.35, opacity: 0, filter: "blur(18px)" },
    { x: 220, y: 470, scale: L4, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, E.hypecash - 0.05);
  tl.fromTo("#chip4", { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, E.playbook - 0.05);
  tl.to("#logo4", { x: 390, y: 200, scale: L4b, duration: 0.55, ease: "expo.inOut" }, E.guia - 0.25);
  tl.to("#bloom4", { y: -330, scale: 0.55, duration: 0.55, ease: "expo.inOut" }, E.guia - 0.25);
  tl.to("#chip4", { opacity: 0, y: -40, filter: "blur(8px)", duration: 0.3, ease: "power2.in" }, E.guia - 0.25);
  const MISSIONS = ["Entre no Jogo", "Modo Gameplay", "Mercado de Criadores", "Conteúdo Evergreen", "Território Próprio", "Escala de Monetização", "A Próxima Onda"];
  const GAP4 = 132, Y0 = 470;
  tl.fromTo("#rline", { height: 0 }, { height: GAP4 * 6, duration: 1.3, ease: "power2.inOut" }, E.guia);
  MISSIONS.forEach((m, i) => {
    const st = document.createElement("div"); st.className = "st"; st.style.top = `${Y0 + i * GAP4 - 30 + 3}px`;
    st.innerHTML = `<div class="dot"></div><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="tt">${m}</span>`;
    $("#route").appendChild(st);
    tl.fromTo(st, { x: -60, opacity: 0 }, { x: 0, opacity: 0.3, duration: 0.4, ease: "expo.out" }, E.guia - 0.05 + i * 0.04);
    const on = E.missao + i * 0.14;
    tl.to(st, { opacity: 1, duration: 0.15 }, on);
    tl.to(st.querySelector(".dot"), { backgroundColor: "#d4ff3f", borderColor: "#d4ff3f", boxShadow: "0 0 26px rgba(212,255,63,.8)", duration: 0.15 }, on);
    tl.fromTo(st.querySelector(".dot"), { scale: 1.5 }, { scale: 1, duration: 0.35, ease: "back.out(3)", immediateRender: false }, on);
  });
  $("#t4").querySelectorAll(".w").forEach((w, i) => raw.fromTo(w, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, [N.ao, N.ao + 0.08, N.primeiro, N.video][i] - 0.06));
  tl.to("#route", { y: 30, duration: 2.6, ease: "sine.inOut" }, 15.0);

  // ================= S5 v2 (N.roteiros – N.sem1): what is inside, the only phone moment, real screens (~6 s)
  const S5A = N.roteiros - 0.45, S5B = N.sem1 - 0.15;
  raw.set("#s4", { visibility: "hidden" }, S5A);
  raw.to(["#route", "#t4", "#logo4"], { y: "-=300", opacity: 0, duration: 0.35, ease: "power3.in" }, S5A - 0.35);
  raw.set("#s5", { visibility: "visible" }, S5A); raw.set("#s5", { visibility: "hidden" }, S5B);
  raw.fromTo("#s5", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35, ease: "power3.inOut" }, S5A);
  raw.fromTo("#t5a", { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, S5A + 0.1);
  const PH_IN = N.roteiros - 0.35, PH_OUT = N.plano + 0.95;
  raw.fromTo("#phone", { y: 1300, rotate: -9, scale: 0.86 }, { y: 0, rotate: -2, scale: 0.86, duration: 0.5, ease: "expo.out" }, PH_IN);
  raw.to("#phone", { rotate: 2, duration: PH_OUT - PH_IN - 0.5, ease: "sine.inOut" }, PH_IN + 0.5);
  raw.fromTo("#tagReal", { opacity: 0 }, { opacity: 1, duration: 0.3 }, N.roteiros);
  const ITEMS = [N.roteiros, N.cinquenta, N.cortes, N.plano];
  ["#pg1", "#pg2", "#pg3"].forEach((g) => gsap.set(g, { x: 512 }));
  ITEMS.forEach((at, i) => {
    if (i > 0) raw.fromTo(`#pg${i}`, { x: 512 }, { x: 0, duration: 0.32, ease: "power3.out", immediateRender: false }, at - 0.12);
    raw.fromTo(`#it${i}`, { y: 50, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, at - 0.08);
    raw.fromTo(`#it${i} b`, { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at + 0.05);
    if (i < 3) raw.to(`#it${i}`, { y: -40, opacity: 0, duration: 0.2, ease: "power2.in" }, ITEMS[i + 1] - 0.22);
    raw.to(`#dt${i}`, { background: "#d4ff3f", boxShadow: "0 0 18px rgba(212,255,63,.8)", duration: 0.2 }, at);
    raw.fromTo(`#pg${i} img`, { y: 0 }, { y: -90, duration: 1.4, ease: "sine.inOut", immediateRender: false }, at + 0.25);
  });
  raw.to("#phone", { y: 1500, rotate: 8, duration: 0.4, ease: "power3.in" }, PH_OUT - 0.4);
  raw.to(["#it3", "#t5a", "#tagReal", "#dots"], { opacity: 0, scale: 0.9, filter: "blur(10px)", duration: 0.25, ease: "power2.in" }, PH_OUT - 0.35);

  // ================= S6 v2 (N.sem1 – N.tudo): no followers, no gear, no face
  const S6A = S5B, S6B = N.tudo - 0.05;
  raw.set("#s6", { visibility: "visible" }, S6A); raw.set("#s6", { visibility: "hidden" }, S6B);
  [[0, N.sem1, N.seguidores], [1, N.sem2, N.equipamento], [2, N.sem3, N.rosto]].forEach(([i, a, k]) => {
    raw.fromTo(`#ob${i}`, { x: -60, opacity: 0, filter: "blur(12px)" }, { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, a - 0.06);
    raw.fromTo(`#ob${i} .grad`, { scale: 1.2 }, { scale: 1, duration: 0.35, ease: "expo.out", immediateRender: false }, k - 0.04);
  });
  raw.set("#w67", { left: 440, top: 1055, width: 200, height: 200, scale: 0, visibility: "visible" }, S6B - 0.24);
  raw.to("#w67", { scale: 24, duration: 0.22, ease: "power3.in" }, S6B - 0.24);

  // ================= S7 (25.85 – 32): CTA with the price; the search bar types "hype cash" and becomes the button
  const C = N.tudo - 25.96;     // the CTA was timed for "Tudo" at 25.96 s
  raw.set("#s7", { visibility: "visible" }, N.tudo - 0.1);
  raw.fromTo("#bloom7", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, 25.85 + C);
  const L7 = 560 / 1189;
  raw.fromTo("#logo7", { x: 260, y: 230, scale: L7 * 1.35, opacity: 0, filter: "blur(18px)" }, { x: 260, y: 230, scale: L7, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, 25.88 + C);
  raw.to("#logo7", { scale: L7 * 1.03, duration: 0.9, yoyo: true, repeat: 3, ease: "sine.inOut" }, 26.5 + C);
  raw.fromTo("#t7", { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, 26.05 + C);
  raw.fromTo("#bar7", { y: 80, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "expo.out" }, 25.9 + C);
  type($("#q7"), "hype cash", 26.0 + C, 0.3);
  raw.fromTo("#caret7", { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "steps(1)", yoyo: true, repeat: 8 }, 26.3 + C);
  raw.fromTo("#price .p1", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, N.reais);
  raw.fromTo("#price .p2", { y: 30, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, N.garantia - 1.2);
  raw.to("#bar7", { opacity: 0, scale: 0.96, duration: 0.1 }, N.toque - 0.02);
  raw.fromTo("#ctaBtn", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, N.toque + 0.04);
  raw.fromTo("#hand", { x: 760, y: 1670, rotate: -12, opacity: 0 }, { x: 551, y: 1249, rotate: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, N.botao - 0.3);
  raw.to("#hand", { scale: 0.88, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "40% 10%" }, N.botao + 0.1);
  raw.to("#ctaBtn", { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1, ease: "power2.out" }, N.botao + 0.1);
  raw.fromTo("#ripple", { left: 480, top: 80, scale: 0.4, opacity: 0.9 }, { scale: 5, opacity: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, N.botao + 0.15);
  raw.to("#hand", { x: 760, y: 1670, opacity: 0, duration: 0.4, ease: "power2.in" }, N.botao + 0.6);
  raw.to("#ctaBtn", { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, N.comece);
  raw.fromTo("#ctaShine", { x: 0 }, { x: 1400, duration: 0.8, ease: "power2.inOut", repeat: 1, repeatDelay: 0.5 }, 30.5 + C);
  raw.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 29.0 + C);

  raw.set({}, {}, T.video_duration_s);
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
