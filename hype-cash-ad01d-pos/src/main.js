// HYPE CASH Motion 01 D ("A Estreia"), post-launch version with price. One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// The scenes are written against the pre-launch narration (E = its word times); every position is remapped onto the
// post-launch narration through matching words (anchors below). The new CTA uses the new times directly (N).
const T = window.TIMING, E = T.emphasis_prelaunch, N = T.emphasis;
const $ = (s) => document.querySelector(s);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const clamp = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

function build() {
  const tl = gsap.timeline({ paused: true });
  // old time → new time, piecewise linear through the same words in both narrations
  const P = T.emphasis_post1;
  const A = [[0, 0], [E.milhoes, P.milhoes], [E.visualizacoes, P.visualizacoes], [E.h24, P.h24], [E.horas, P.horas], [E.foi, P.foi], [E.segundo, P.segundo],
    [E.trailer, P.trailer], [E.gta, P.gta], [E.fez, P.fez], [8.6, 7.4], [E.dia, P.dia], [E.d19, P.d19], [E.novembro, P.novembro], [11.35, 8.55], [E.toda, P.toda],
    [E.atencao, P.atencao], [E.procurar, P.procurar], [E.conteudo, P.conteudo], [13.8, 11.4], [E.maioria, P.maioria], [E.assistir, P.assistir], [E.poucos, P.poucos],
    [E.prontos, P.prontos], [E.criar, P.criar], [18.35, 14.7], [E.hypecash, P.hypecash], [E.playbook, P.playbook], [E.interativo, P.interativo], [E.prepara, P.prepara],
    [E.missao, P.missao], [22.45, 18.75], [E.zero, P.zero], [E.primeiro, P.primeiro], [E.video, P.video], [E.checklist, P.checklist], [E.progresso, P.progresso],
    [25.95, 22.05], [E.sem, P.sem], [E.dinheiro, P.dinheiro], [E.facil, P.facil], [E.so, P.so], [E.plano, P.plano], [E.comecar, P.comecar], [E.atrasado, P.atrasado],
    [30.35, 27.1]];
  const pw = (AA) => (t) => {
    if (t <= 0) return t;
    for (let i = 1; i < AA.length; i++) if (t <= AA[i][0]) { const [a0, b0] = AA[i - 1], [a1, b1] = AA[i]; return b0 + (t - a0) * (b1 - b0) / (a1 - a0); }
    return t + AA[AA.length - 1][1] - AA[AA.length - 1][0];
  };
  // v2 narration (what is inside + objections): the shared opening words move from the v1 times (P) to the v2 ones (N)
  const B2 = [[0, 0], ...["milhoes", "visualizacoes", "h24", "horas", "foi", "segundo", "trailer", "gta", "fez", "jogo", "chega", "toda", "atencao", "procurar", "conteudo",
    "maioria", "assistir", "poucos", "prontos", "criar", "hypecash", "playbook", "interativo", "prepara", "missao"].map((k) => [P[k], N[k]])];
  const r1 = pw(A), r2 = pw(B2), remap = (t) => r2(r1(t));
  const raw = { to: tl.to.bind(tl), fromTo: tl.fromTo.bind(tl), set: tl.set.bind(tl) };
  const span = (v, at) => { const d = v.duration ?? 0.5, a = remap(at); return [a, Math.max(0.02, remap(at + d) - a)]; };
  tl.to = (t, v, at) => { if (typeof at !== "number") return raw.to(t, v, at); const [a, d] = span(v, at); return raw.to(t, { ...v, duration: d }, a); };
  tl.fromTo = (t, f, v, at) => { if (typeof at !== "number") return raw.fromTo(t, f, v, at); const [a, d] = span(v, at); return raw.fromTo(t, f, { ...v, duration: d }, a); };
  tl.set = (t, v, at) => raw.set(t, v, typeof at === "number" ? remap(at) : at);

  // ---- helpers
  const scene = (id, a, b) => { tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b); };
  const rise = (els, at, stagger = 0.07) => tl.fromTo(els, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out", stagger }, at);
  const riseOn = (sel, times) => $(sel).querySelectorAll(".w").forEach((w, i) => rise(w, times[i] - 0.06));
  const slam = (sel, at, from = 1.4) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(18px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, at);
  const pop = (sel, at) => tl.fromTo(sel, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2.4)" }, at);
  const leave = (sel, at, y = -60) => tl.to(sel, { y, opacity: 0, filter: "blur(12px)", duration: 0.28, ease: "power2.in" }, at);
  const streak = (sel, at) => tl.fromTo(sel, { x: -900, opacity: 0 }, { x: 900, opacity: 1, duration: 0.7, ease: "power2.inOut" }, at).to(sel, { opacity: 0, duration: 0.2 }, at + 0.5);
  // cinematic cut: a short white flash over the hard cut
  const flashEl = document.createElement("div");
  Object.assign(flashEl.style, { position: "absolute", inset: "0", background: "#fff", opacity: "0", zIndex: "35", pointerEvents: "none" });
  $("#root").appendChild(flashEl);
  const flash = (at, o = 0.55) => tl.fromTo(flashEl, { opacity: o }, { opacity: 0, duration: 0.28, ease: "power2.out", immediateRender: false }, at);

  // ================= S1 hook (0 – 5.3): "475 milhões de visualizações em 24 horas."
  // frame 0: the counter is already rolling in the brand gradient
  tl.set("#s1", { visibility: "hidden" }, 5.3);
  const num = $("#num"), cnt = { n: 180 };
  const putN = () => { num.textContent = String(Math.round(cnt.n)); };
  putN();
  tl.fromTo(cnt, { n: 180 }, { n: 475, duration: 1.85, ease: "power3.out", onUpdate: putN }, 0);
  tl.fromTo("#n475", { scale: 1.12 }, { scale: 1, duration: 1.9, ease: "power3.out" }, 0);
  tl.fromTo("#glow1", { scale: 0.7, opacity: 0.6 }, { scale: 1.1, opacity: 1, duration: 5, ease: "sine.inOut" }, 0);
  tl.fromTo("#t1top", { opacity: 0.85, y: 0 }, { opacity: 1, y: 0, duration: 0.1 }, 0);   // on screen at frame 0
  slam("#t1m", E.milhoes - 0.05, 1.3);
  streak("#sk1", 1.75);
  tl.to("#n475", { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, 1.85);
  rise("#t1v", E.visualizacoes - 0.06);
  slam("#t1h", E.h24 - 0.05, 1.25);
  tl.fromTo("#src", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.4);
  tl.to("#src", { opacity: 0, duration: 0.3 }, 8.4);
  tl.to(["#n475", "#t1m", "#t1v", "#t1h", "#t1top"], { scale: 0.4, y: 260, opacity: 0, filter: "blur(16px)", duration: 0.4, ease: "power3.in", stagger: 0.02 }, 4.95);

  // ================= S2 (5.3 – 8.6): "Foi isso que o segundo trailer de GTA 6 fez."
  scene("#s2", 5.3, 8.6);
  let city = "";
  const Rc = rng(4);
  for (let x = 0; x < 900; x += 20 + Rc() * 26) { const h = 20 + Rc() * 90, w = 14 + Rc() * 24; city += `<rect x="${x.toFixed(0)}" y="${(120 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#12081f"/>`; }
  $("#city").innerHTML = city;
  tl.fromTo("#card", { scale: 0.55, opacity: 0, filter: "blur(18px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, 5.25);
  tl.to("#card", { scale: 1.05, duration: 2.8, ease: "none" }, 5.8);
  // the shot keeps moving like a playing video: a steady push-in with a slow pan, no stop until the card leaves
  tl.fromTo("#card .shot", { scale: 1.06, x: -36, y: 10 }, { scale: 1.3, x: 40, y: -14, duration: 3.45, ease: "none" }, 5.2);
  tl.fromTo("#card .prog i", { scaleX: 0.04 }, { scaleX: 0.3, duration: 3.3, ease: "none" }, 5.25);
  rise("#t2a", E.foi - 0.06);
  riseOn("#t2b", [E.segundo, E.trailer, E.trailer + 0.4, E.gta, E.fez]);
  rise("#stat", 6.0);
  tl.to("#card", { scale: 2.6, opacity: 0, filter: "blur(20px)", duration: 0.35, ease: "power3.in" }, 8.3);
  tl.to("#gpdim", { opacity: 1, duration: 0.01 }, 0);
  tl.fromTo("#gpdim", { backgroundColor: "rgba(5,3,7,0)" }, { backgroundColor: "rgba(5,3,7,.35)", duration: 0.4, immediateRender: false }, 5.1);
  tl.to(["#gpbg", "#gpdim"], { opacity: 0, duration: 0.35, ease: "power2.in" }, 8.28);
  tl.set(["#gpbg", "#gpdim"], { visibility: "hidden" }, 8.7);
  leave(["#t2a", "#t2b", "#stat"], 8.28);
  flash(8.6, 0.22);

  // ================= S3 + S4 (8.6 – 18.35): the date, the attention, the few who are ready
  scene("#s3", 8.6, 18.35);
  slam("#t3a", E.d19 - 0.04, 1.4);
  streak("#sk1", 9.0);
  tl.fromTo("#dNov", { letterSpacing: "0.6em", opacity: 0 }, { letterSpacing: "0.14em", opacity: 1, duration: 0.6, ease: "expo.out" }, E.novembro - 0.06);
  tl.to("#d19", { scale: 1.04, duration: 1.4, ease: "none" }, 9.4);
  leave(["#t3a", "#d19", "#dNov"], 11.35, -120);

  // the crowd: every dot is someone paying attention (one deterministic canvas)
  const cv = $("#crowd"), cx = cv.getContext("2d");
  const R = rng(19), COLS = 24, ROWS = 27, SP = 38, GX = 540 - (COLS - 1) * SP / 2, GY = 700, CX = 540, CY = 1130;
  const dots = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const a = R() * Math.PI * 2, d0 = 1100 + R() * 500;
    dots.push({ sx: CX + Math.cos(a) * d0, sy: CY + Math.sin(a) * d0 * 1.2, oa: R() * Math.PI * 2, or: 90 + R() * 300, del: R() * 1.1,
      gx: GX + c * SP, gy: GY + r * SP, gd: r * 0.012 + R() * 0.15, ph: R() * 6.28 });
  }
  const chosen = [];
  while (chosen.length < 14) { const k = Math.floor(R() * dots.length), d = dots[k]; if (!chosen.includes(k) && d.gy > 760 && d.gy < 1640) chosen.push(k); }
  chosen.sort((a, b) => dots[a].gy - dots[b].gy || dots[a].gx - dots[b].gx);
  const clock = { t: 0 };
  const orbit = (d, t) => [CX + Math.cos(d.oa + t * 0.9) * d.or, CY + Math.sin(d.oa + t * 0.9) * d.or * 0.8];
  const pos = (d, t) => {
    const p = ease(clamp((t - 11.55 - d.del) / 0.9));
    const [ox, oy] = orbit(d, t);
    let x = d.sx + (ox - d.sx) * p, y = d.sy + (oy - d.sy) * p;
    const q = ease(clamp((t - 13.85 - d.gd) / 0.7));
    if (q > 0) { x += (d.gx + Math.sin(t * 2 + d.ph) * 2 - x) * q; y += (d.gy + Math.cos(t * 2 + d.ph) * 2 - y) * q; }
    return [x, y, p];
  };
  const draw = () => {
    const t = clock.t;
    cx.clearRect(0, 0, 1080, 1920);
    const grey = clamp((t - E.assistir) / 0.5);
    const base = [255 - 185 * grey, 255 - 193 * grey, 255 - 163 * grey].map(Math.round);
    dots.forEach((d, i) => {
      if (chosen.includes(i)) return;
      const [x, y, p] = pos(d, t);
      if (p <= 0) return;
      cx.globalAlpha = Math.min(1, p * 1.2) * 0.9;
      cx.fillStyle = `rgb(${base})`;
      cx.beginPath(); cx.arc(x, y, 5, 0, 6.283); cx.fill();
    });
    cx.globalAlpha = 1;
    const pts = chosen.map((k, j) => {
      const d = dots[k], [x, y, p] = pos(d, t), b = clamp((t - E.poucos - j * 0.06) / 0.25);
      return { x, y, p, b, col: j % 3 === 2 ? "#d4ff3f" : "#ff3fa2" };
    });
    // connections between the few who create
    pts.forEach((a, j) => {
      if (j === 0) return;
      const l = clamp((t - E.criar - j * 0.04) / 0.3); if (l <= 0) return;
      const b = pts[j - 1];
      cx.strokeStyle = "rgba(255,63,162,.75)"; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x + (a.x - b.x) * l, b.y + (a.y - b.y) * l); cx.stroke();
    });
    pts.forEach(({ x, y, p, b, col }) => {
      if (p <= 0) return;
      cx.globalAlpha = Math.min(1, p * 1.2);
      if (b > 0) { cx.shadowColor = col; cx.shadowBlur = 26 * b; cx.fillStyle = col; }
      else cx.fillStyle = `rgb(${base})`;
      cx.beginPath(); cx.arc(x, y, 5 + 7 * b, 0, 6.283); cx.fill();
      cx.shadowBlur = 0;
    });
    cx.globalAlpha = 1;
  };
  tl.fromTo(clock, { t: 11.4 }, { t: 18.4, duration: 7.0, ease: "none", onUpdate: draw, immediateRender: false }, 11.4);
  pop("#node", E.toda - 0.05);
  tl.to("#node", { scale: 1.12, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut" }, E.toda + 0.4);
  tl.to("#node", { scale: 0, opacity: 0, duration: 0.3, ease: "back.in(2)" }, 13.75);
  rise("#t3b", E.toda - 0.06);
  riseOn("#t3c", [E.atencao + 0.4, E.procurar, E.conteudo]);
  leave(["#t3b", "#t3c"], 13.8);
  riseOn("#t4a", [14.2, E.maioria, 14.68, E.assistir]);
  riseOn("#t4b", [E.poucos, E.prontos, E.criar]);
  // push into one of the few: it becomes the light of the logo
  const k0 = dots[chosen[Math.floor(chosen.length / 2)]];
  tl.to("#crowd", { scale: 9, transformOrigin: `${k0.gx}px ${k0.gy}px`, duration: 0.45, ease: "power3.in" }, 17.95);
  leave(["#t4a", "#t4b"], 17.95, -80);
  flash(18.35, 0.12);

  // ================= S5 (18.35 – 22.45): the product, mission by mission
  scene("#s5", 18.35, 22.45);
  tl.fromTo("#glow5", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, 18.35);
  const L5 = 640 / 1189;
  tl.fromTo("#logo5", { x: 220, y: 330, scale: L5 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 220, y: 330, scale: L5, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, E.hypecash - 0.06);
  streak("#sk5", E.hypecash);
  tl.to("#logo5", { scale: L5 * 1.03, duration: 1.6, ease: "sine.inOut" }, E.hypecash + 0.5);
  rise("#t5a", E.playbook - 0.06);
  rise("#t5b", E.prepara - 0.5);
  const MIS = ["Entre no Jogo", "Modo Gameplay", "Mercado de Criadores", "Conteúdo Evergreen", "Território Próprio", "Escala de Monetização", "A Próxima Onda"];
  // the seven missions as a route: the logo moves up, every mission lands and lights on "missão por missão"
  const R0 = N.prepara - 0.3, GAP5 = 128, Y5 = 520;
  raw.to("#logo5", { x: 390, y: 150, scale: 300 / 1189, duration: 0.5, ease: "expo.inOut" }, R0 - 0.15);
  raw.to("#glow5", { y: -420, scale: 0.6, duration: 0.5, ease: "expo.inOut" }, R0 - 0.15);
  raw.to("#t5a", { opacity: 0, y: -30, duration: 0.25 }, R0 - 0.15);

  raw.fromTo("#rl5", { height: 0 }, { height: GAP5 * 6, duration: 0.9, ease: "power2.inOut" }, R0);
  MIS.forEach((t, i) => {
    const st = document.createElement("div"); st.className = "st5"; st.style.top = `${Y5 + i * GAP5 - 27}px`;
    st.innerHTML = `<div class="dot"></div><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="tt">${t}</span>`;
    $("#route5").appendChild(st);
    raw.fromTo(st, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "expo.out" }, R0 + 0.2 + i * 0.09);
    const on = N.missao - 0.1 + i * 0.1;
    raw.to(st.querySelector(".dot"), { backgroundColor: "#d4ff3f", borderColor: "#d4ff3f", boxShadow: "0 0 26px rgba(212,255,63,.8)", duration: 0.12 }, on);
    raw.fromTo(st.querySelector(".dot"), { scale: 1.5 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, on);
  });
  flash(22.45, 0.15);

  // ================= S6 v2 (N.ao – N.sem1): what is inside, the only phone moment, real screens (~6 s)
  const S6A = N.ao - 0.2, S6B = N.ins0 - 0.1;
  raw.set("#s5", { visibility: "hidden" }, S6A);
  raw.set("#s6", { visibility: "visible" }, S6A); raw.set("#s6", { visibility: "hidden" }, S6B);
  raw.fromTo("#spot", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }, S6A);
  $("#t6").querySelectorAll(".w").forEach((w, i) => raw.fromTo(w, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, [N.ao, N.ao + 0.06, N.primeiro, N.video][i] - 0.06));
  // phone on screen ~5 s: it comes in with the first item and leaves after the last
  const PH_IN = N.roteiros - 0.35, PH_OUT = N.dias7 + 0.35;
  raw.fromTo("#phone", { y: 160, scale: 0.9, opacity: 0, filter: "blur(16px)" }, { y: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, PH_IN);
  raw.to("#phone", { y: -20, duration: PH_OUT - PH_IN - 0.5, ease: "sine.inOut" }, PH_IN + 0.5);
  raw.fromTo("#tagReal", { opacity: 0 }, { opacity: 1, duration: 0.3 }, N.roteiros - 0.1);
  const ITEMS = [N.roteiros, N.cinquenta, N.cortes, N.plano];
  ["#pg1", "#pg2", "#pg3"].forEach((g) => gsap.set(g, { x: 460 }));
  ITEMS.forEach((at, i) => {
    if (i > 0) raw.fromTo(`#pg${i}`, { x: 460 }, { x: 0, duration: 0.32, ease: "power3.out", immediateRender: false }, at - 0.12);
    raw.fromTo(`#it${i}`, { y: 50, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, at - 0.08);
    raw.fromTo(`#it${i} b`, { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at + 0.05);
    if (i < 3) raw.to(`#it${i}`, { y: -40, opacity: 0, duration: 0.2, ease: "power2.in" }, ITEMS[i + 1] - 0.22);
    raw.to(`#dt${i}`, { background: "#d4ff3f", boxShadow: "0 0 18px rgba(212,255,63,.8)", duration: 0.2 }, at);
  });
  // the page scrolls a little on each screen, so the real content reads as alive
  [0, 1, 2, 3].forEach((i) => raw.fromTo(`#pg${i} img`, { y: 0 }, { y: -90, duration: 1.4, ease: "sine.inOut", immediateRender: false }, ITEMS[i] + 0.25));
  raw.fromTo("#sum", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, N.plano - 0.05);
  raw.to("#sum", { y: -40, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power2.in" }, S6B - 0.25);
  raw.to(["#phone", "#t6", "#it3", "#tagReal", "#dots"], { y: -60, opacity: 0, filter: "blur(12px)", duration: 0.28, ease: "power2.in" }, PH_OUT - 0.28);

  // ================= SX (N.ins0 – N.sem1): "E tem muito mais" – everything inside, so the four items read as a sample
  const SXA = N.ins0 - 0.1, SXB = N.sem1 - 0.15;
  raw.set("#sx", { visibility: "visible" }, SXA); raw.set("#sx", { visibility: "hidden" }, SXB);
  raw.fromTo("#sx", { opacity: 0 }, { opacity: 1, duration: 0.25 }, SXA);
  raw.fromTo("#xtitle", { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, N.ins0);
  raw.fromTo("#xtitle .xg", { scale: 1.25 }, { scale: 1, duration: 0.35, ease: "expo.out", immediateRender: false }, N.mais - 0.05);
  // recap: the four items already shown land first, dimmed
  [4, 5, 6, 7].forEach((k, i) => raw.fromTo(`#x${k}`, { y: 40, opacity: 0, scale: 0.9 }, { y: 0, opacity: 0.55, scale: 1, duration: 0.35, ease: "back.out(2)" }, N.mais + 0.1 + i * 0.09));
  // the rest pops on its words
  [[0, N.missoes7], [1, N.ferramentas], [2, N.parcerias], [3, N.marcas + 0.4]].forEach(([k, at]) => {
    raw.fromTo(`#x${k}`, { y: 40, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, at - 0.08);
    raw.fromTo(`#x${k} b`, { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at + 0.05);
  });
  raw.to(["#x4", "#x5", "#x6", "#x7"], { opacity: 1, duration: 0.3 }, N.marcas + 0.75);
  raw.fromTo("#xfoot", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, N.marcas + 0.7);
  raw.to(["#xtitle", "#xgrid", "#xfoot"], { y: -60, opacity: 0, filter: "blur(12px)", duration: 0.28, ease: "power2.in" }, SXB - 0.3);

  // ================= S7 v2 (N.sem1 – N.tudo): no followers, no gear, no face; no magic formula
  const S7A = N.sem1 - 0.15, S7B = N.tudo - 0.3;
  raw.set("#s7", { visibility: "visible" }, S7A); raw.set("#s7", { visibility: "hidden" }, S7B);
  [[0, N.sem1, N.seguidores], [1, N.sem2, N.equipamento], [2, N.sem3, N.rosto]].forEach(([i, a, k]) => {
    raw.fromTo(`#ob${i}`, { y: 50, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, a - 0.06);
    raw.fromTo(`#ob${i} .gt`, { scale: 1.25 }, { scale: 1, duration: 0.35, ease: "expo.out", immediateRender: false }, k - 0.04);
  });
  raw.to(["#ob0", "#ob1", "#ob2"], { y: -80, opacity: 0, filter: "blur(12px)", duration: 0.28, ease: "power2.in", stagger: 0.04 }, N.semF - 0.32);
  raw.fromTo("#t7a", { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, N.semF - 0.06);
  $("#t7b").querySelectorAll(".w").forEach((w, i) => raw.fromTo(w, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, [N.formula, N.magica][i] - 0.06));
  const ws = $("#t7b").querySelectorAll(".w"), base = $("#root").getBoundingClientRect();
  const a7 = ws[0].getBoundingClientRect(), b7 = ws[ws.length - 1].getBoundingClientRect();
  gsap.set("#strike", { left: a7.left - base.left - 12, top: a7.top - base.top + a7.height * 0.52, width: b7.right - a7.left + 24, scaleX: 0 });
  raw.to("#strike", { scaleX: 1, duration: 0.2, ease: "power3.out" }, N.magica + 0.08);

  // ================= S8 (N.tudo – end): CTA with the price, the letterbox opens
  const C = N.tudo - 27.2;     // the CTA was timed for "Tudo" at 27.2 s
  raw.set("#s8", { visibility: "visible" }, S7B);
  raw.to("#barT", { y: -150, duration: 0.6, ease: "power3.inOut" }, 27.15 + C);
  raw.to("#barB", { y: 150, duration: 0.6, ease: "power3.inOut" }, 27.15 + C);
  raw.fromTo("#glow8", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, 27.1 + C);
  const L8 = 560 / 1189;
  raw.fromTo("#logo8", { x: 260, y: 250, scale: L8 * 1.35, opacity: 0, filter: "blur(18px)" }, { x: 260, y: 250, scale: L8, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, 27.12 + C);
  raw.to("#logo8", { scale: L8 * 1.03, duration: 0.9, yoyo: true, repeat: 3, ease: "sine.inOut" }, 27.8 + C);
  raw.fromTo("#t8", { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, 27.3 + C);
  raw.fromTo("#price .p1", { scale: 1.5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, N.reais);
  raw.fromTo("#price .p2", { y: 30, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out" }, N.garantia - 0.9);
  raw.fromTo("#btn", { y: 160, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.8)" }, N.toque - 0.05);
  raw.fromTo("#cursor", { x: 880, y: 1600, opacity: 0 }, { x: 700, y: 1220, opacity: 1, duration: 0.4, ease: "expo.out" }, N.botao - 0.2);
  raw.to("#cursor", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "15% 10%" }, N.botao + 0.25);
  raw.to("#btn", { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, N.botao + 0.25);
  raw.fromTo("#ripple", { left: 684, top: 1198, scale: 0.4, opacity: 0.9 }, { scale: 5, opacity: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, N.botao + 0.3);
  raw.to("#cursor", { x: 880, y: 1600, opacity: 0, duration: 0.4, ease: "power2.in" }, N.botao + 0.8);
  raw.to("#btn", { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, N.comece);
  raw.fromTo("#shine", { x: 0 }, { x: 1300, duration: 0.8, ease: "power2.inOut", repeat: 1, repeatDelay: 0.5 }, N.hoje + 0.1);
  raw.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, N.garantia + 0.3);

  raw.set({}, {}, T.video_duration_s);
  return tl;
}

window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "900 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter", "italic 400 10px InstrumentSerif"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  const tl = build();
  // gameplay frames (30 fps JPGs from assets/gameplay/heli.mp4) and the countdown follow t directly
  const gp = $("#gpbg"), timer = $("#timer"), DUR = T.video_duration_s;
  window.seek = (t) => {
    tl.seek(t, false);
    const left = Math.max(0, Math.ceil(DUR - t - 1e-6));
    timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    const f = Math.min(276, Math.max(1, Math.floor(t * 30) + 1));
    gp.style.transform = `scale(${(1.04 + 0.06 * Math.min(1, t / 8.5)).toFixed(4)})`;
    const src = `img/gp/h${String(f).padStart(3, "0")}.jpg`;
    if (gp.getAttribute("src") === src) return;
    gp.setAttribute("src", src);
    return gp.decode().catch(() => {});
  };
  tl.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
