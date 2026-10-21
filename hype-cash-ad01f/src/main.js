// HYPE CASH Motion 01 D ("A Estreia"). One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (faster-whisper word timestamps of the ElevenLabs narration).
const T = window.TIMING, E = T.emphasis;
const $ = (s) => document.querySelector(s);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const clamp = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

function build() {
  const tl = gsap.timeline({ paused: true });

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
  rise("#t2a", E.foi - 0.06);
  riseOn("#t2b", [E.segundo, E.trailer, E.trailer + 0.4, E.gta, E.fez]);
  rise("#stat", 6.0);
  tl.to("#card", { scale: 2.6, opacity: 0, filter: "blur(20px)", duration: 0.35, ease: "power3.in" }, 8.3);
  leave(["#t2a", "#t2b", "#stat"], 8.28);
  flash(8.6, 0.22);

  // ================= S3 + S4 (8.6 – 18.35): the date, the attention, the few who are ready
  scene("#s3", 8.6, 18.35);
  rise("#t3a", 8.65);
  slam("#d19", E.d19 - 0.04, 1.6);
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
  riseOn("#t4a", [14.2, E.maioria, 14.68, 14.92, E.assistir]);
  riseOn("#t4b", [E.poucos, 16.52, 16.7, E.prontos, 17.36, E.criar]);
  // push into one of the few: it becomes the light of the logo
  const k0 = dots[chosen[Math.floor(chosen.length / 2)]];
  tl.to("#crowd", { scale: 9, transformOrigin: `${k0.gx}px ${k0.gy}px`, duration: 0.45, ease: "power3.in" }, 17.95);
  leave(["#t4a", "#t4b"], 17.95, -80);
  flash(18.35, 0.7);

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
  $("#strip").innerHTML = MIS.map((m, i) => `<div class="fr"><div class="in"><div class="n gt">${String(i + 1).padStart(2, "0")}</div><div class="t">${m}</div></div></div>`).join("");
  tl.fromTo("#strip", { x: 1080 }, { x: -1720, duration: 2.0, ease: "power1.inOut" }, E.prepara - 0.45);
  flash(22.45, 0.35);

  // ================= S6 (22.45 – 25.95): the only phone moment (~3.5 s), real screens
  scene("#s6", 22.45, 25.95);
  tl.fromTo("#spot", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }, 22.45);
  riseOn("#t6", [E.zero - 0.18, E.zero, 23.16, E.primeiro, E.video]);
  tl.fromTo("#phone", { y: 160, scale: 0.9, opacity: 0, filter: "blur(16px)" }, { y: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }, 22.5);
  tl.to("#phone", { y: -24, duration: 3.0, ease: "sine.inOut" }, 23.1);
  const W = 460, M1Y = -1189 * W / 512;
  [0, 1, 2, 3].forEach((k) => tl.set(`#m1_${k}`, { y: M1Y }, 0));
  tl.set("#m1_4", { y: M1Y - 27 * W / 512 }, 0);
  [23.5, 23.75, 24.0, 24.25].forEach((t, k) => tl.fromTo(`#m1_${k + 1}`, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: true }, t));
  tl.set("#pgMap", { x: W }, 0);
  tl.to("#pgMap", { x: 0, duration: 0.3, ease: "power3.out" }, E.progresso - 0.15);
  const PX = W / 430;
  tl.set("#hlP", { left: 16 * PX - 4, top: 22 + 285 * PX - 4, width: 398 * PX + 8, height: 87 * PX + 8, opacity: 0 }, 0);
  tl.to("#hlP", { opacity: 1, duration: 0.15, yoyo: true, repeat: 3 }, E.progresso + 0.15);
  tl.fromTo("#l6a", { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, E.checklist - 0.08);
  tl.fromTo("#l6b", { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "expo.out" }, E.progresso - 0.05);
  leave(["#phone", "#t6", "#l6a", "#l6b"], 25.7, -60);

  // ================= S7 (25.95 – 30.35): no easy money; a plan, so you don't start late
  scene("#s7", 25.95, 30.35);
  rise("#t7a", E.sem - 0.06);
  riseOn("#t7b", [E.dinheiro, E.facil]);
  const ws = $("#t7b").querySelectorAll(".w"), base = $("#root").getBoundingClientRect();
  const a7 = ws[0].getBoundingClientRect(), b7 = ws[ws.length - 1].getBoundingClientRect();
  tl.set("#strike", { left: a7.left - base.left - 12, top: a7.top - base.top + a7.height * 0.52, width: b7.right - a7.left + 24, scaleX: 0 }, 0);
  tl.to("#strike", { scaleX: 1, duration: 0.25, ease: "power3.out" }, E.facil + 0.12);
  leave(["#t7a", "#t7b", "#strike"], 27.3, -80);
  riseOn("#t7c", [E.so, 27.9, E.plano]);
  riseOn("#t7d", [28.62, 28.76, 28.94, E.comecar, E.atrasado]);
  tl.fromTo("#tline", { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.5, ease: "power3.out" }, E.plano + 0.05);
  tl.set("#tfill", { scaleX: 0 }, 0);
  tl.fromTo(["#tkA", "#tkB"], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "expo.out", stagger: 0.12 }, E.plano + 0.1);
  pop("#pinYou", 28.66);
  rise("#you", 28.72);
  tl.to("#pinYou", { boxShadow: "0 0 60px rgba(212,255,63,1)", duration: 0.25, yoyo: true, repeat: 3 }, 29.0);
  tl.to("#tfill", { scaleX: 0.3, duration: 0.6, ease: "power2.out" }, E.comecar);
  tl.to("#pinYou", { x: 240, duration: 0.6, ease: "power2.out" }, E.comecar);
  tl.to("#you", { x: 240, duration: 0.6, ease: "power2.out" }, E.comecar);
  pop("#pinLate", E.atrasado - 0.02);
  rise("#late", E.atrasado + 0.05);
  flash(30.35, 0.35);

  // ================= S8 (30.35 – 34): CTA, the letterbox opens
  scene("#s8", 30.35, 34.1);
  tl.to("#barT", { y: -150, duration: 0.6, ease: "power3.inOut" }, 30.4);
  tl.to("#barB", { y: 150, duration: 0.6, ease: "power3.inOut" }, 30.4);
  tl.fromTo("#glow8", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, 30.35);
  const L8 = 560 / 1189;
  tl.fromTo("#logo8", { x: 260, y: 310, scale: L8 * 1.35, opacity: 0, filter: "blur(18px)" }, { x: 260, y: 310, scale: L8, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, 30.4);
  tl.to("#logo8", { scale: L8 * 1.03, duration: 0.9, yoyo: true, repeat: 2, ease: "sine.inOut" }, 31.0);
  tl.fromTo("#btn", { y: 160, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.8)" }, E.toque - 0.05);
  tl.fromTo("#cursor", { x: 880, y: 1600, opacity: 0 }, { x: 700, y: 1150, opacity: 1, duration: 0.4, ease: "expo.out" }, E.botao - 0.2);
  tl.to("#cursor", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "15% 10%" }, E.botao + 0.25);
  tl.to("#btn", { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, E.botao + 0.25);
  tl.fromTo("#ripple", { left: 684, top: 1128, scale: 0.4, opacity: 0.9 }, { scale: 5, opacity: 0, duration: 0.6, ease: "expo.out" }, E.botao + 0.3);
  tl.to("#cursor", { x: 880, y: 1600, opacity: 0, duration: 0.4, ease: "power2.in" }, E.botao + 0.8);
  tl.to("#btn", { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, E.comece);
  rise("#t8", E.hoje + 0.1);
  tl.fromTo("#shine", { x: 0 }, { x: 1300, duration: 0.8, ease: "power2.inOut", repeat: 1, repeatDelay: 0.5 }, 32.4);
  tl.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 32.4);

  tl.set({}, {}, 34.0);
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
