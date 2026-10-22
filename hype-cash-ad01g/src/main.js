// HYPE CASH Motion 01 E ("O Plano"). One paused GSAP timeline; window.seek(t) puts every element exactly at t.
// All times come from timing.json (faster-whisper word timestamps of the ElevenLabs narration).
const T = window.TIMING, E = T.emphasis;
const $ = (s) => document.querySelector(s);

function build() {
  const tl = gsap.timeline({ paused: true });
  const base = $("#root").getBoundingClientRect();
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; };

  // ---- helpers
  // every shot is a hard cut with a small camera punch (the kinetic-edit language of the references)
  const shot = (id, a, b, punch = 1.08) => {
    tl.set(id, { visibility: "visible" }, a); tl.set(id, { visibility: "hidden" }, b);
    tl.fromTo(id, { scale: punch }, { scale: 1, duration: 0.4, ease: "expo.out", immediateRender: false }, a);
  };
  const rise = (els, at, stagger = 0.07) => tl.fromTo(els, { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.36, ease: "expo.out", stagger }, at);
  const riseOn = (sel, times) => $(sel).querySelectorAll(".w").forEach((w, i) => rise(w, times[i] - 0.05));
  const slam = (sel, at, from = 1.4) => tl.fromTo(sel, { scale: from, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.34, ease: "expo.out" }, at);
  const pop = (sel, at) => tl.fromTo(sel, { scale: 0, rotate: -14, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.45, ease: "back.out(2.4)" }, at);
  const out = (sel, at) => tl.to(sel, { opacity: 0, filter: "blur(10px)", duration: 0.15, ease: "power2.in" }, at);
  // measure strike targets before any tween offsets them (fromTo renders its start state immediately)
  const PRE = { tal: box($("#tal")), tem: box($("#tem")), d11: box($("#t11b").querySelectorAll(".w")[0]), f11: box($("#t11b").querySelectorAll(".w")[1]) };
  const strike = (sel, b, at) => {
    tl.set(sel, { left: b.x - 8, top: b.y + b.h * 0.52 - 6, width: b.w + 16, scaleX: 0 }, 0);
    tl.to(sel, { scaleX: 1, duration: 0.22, ease: "power3.out" }, at);
  };
  const shake = (at, px = 14) => tl.fromTo("#cam", { x: 0 }, { x: px, duration: 0.04, yoyo: true, repeat: 5, ease: "none", immediateRender: false }, at).set("#cam", { x: 0 }, at + 0.25);

  // ================= sh1 (0 – 1.85): "Se você vai passar os próximos meses"
  // frame 0: full-bleed wall of GTA 6 videos racing up, a heavy caption over it
  shot("#sh1", 0, 1.85, 1.0);
  const VIDS = [["TRAILER 2 EXPLICADO", "#ff3fa2", "#3b1263"], ["TEORIAS INSANAS", "#3f8fff", "#160d3a"], ["MAPA COMPLETO", "#a83ffe", "#0f2a4a"], ["REACT AO TRAILER", "#ff8a3f", "#3a0f3f"],
    ["TUDO QUE VAZOU", "#3fd4ff", "#1a1046"], ["EASTER EGGS", "#d4ff3f", "#16283a"], ["PERSONAGENS", "#ff3fa2", "#2a0f5c"], ["DATA CONFIRMADA", "#3f8fff", "#3b1263"],
    ["GAMEPLAY?", "#a83ffe", "#3a0f3f"], ["10 DETALHES", "#ff8a3f", "#16283a"]];
  const thumb = ([t, a, b], i) => `background: radial-gradient(circle at ${25 + (i * 37) % 55}% 45%, rgba(255,226,150,.9) 0 8%, transparent 20%), linear-gradient(180deg, ${a}, ${b} 85%)`;
  let wall = "";
  for (let i = 0; i < 20; i++) {
    const v = VIDS[i % VIDS.length], col = i % 2, row = Math.floor(i / 2);
    wall += `<div class="wv" style="left:${col ? 556 : 24}px; top:${row * 306 + (col ? 150 : 0)}px; ${thumb(v, i)}"><b>${v[0]}</b><u>${8 + (i * 7) % 15}:${String((i * 23) % 60).padStart(2, "0")}</u><i style="width:${20 + (i * 29) % 70}%"></i></div>`;
  }
  $("#wall1").innerHTML = wall;
  tl.fromTo("#wall1", { y: -200 }, { y: -1700, duration: 1.85, ease: "power1.in" }, 0);
  tl.fromTo("#t1a", { scale: 1.1 }, { scale: 1, duration: 0.6, ease: "expo.out" }, 0);   // on screen at frame 0
  tl.to("#t1a", { y: -40, opacity: 0, filter: "blur(10px)", duration: 0.14, ease: "power2.in" }, E.proximos - 0.32);
  riseOn("#t1b", [E.proximos - 0.24, E.proximos]);
  // month slot: NOV → DEZ → JAN → FEV → MESES, each line punching through
  const slot = [...document.querySelectorAll("#slot div")];
  gsap.set(slot, { yPercent: 100 });   // outside the timeline: a set at 0 is not rendered by seek(0)
  slot.forEach((d, i) => {
    const at = E.proximos + 0.02 + i * 0.1;
    tl.fromTo(d, { yPercent: 100 }, { yPercent: 0, duration: 0.09, ease: "power2.out", immediateRender: false }, at);
    if (i < slot.length - 1) tl.to(d, { yPercent: -100, duration: 0.09, ease: "power2.in" }, at + 0.1);
  });
  tl.fromTo(slot[slot.length - 1], { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "expo.out", immediateRender: false }, E.meses);
  shake(E.meses + 0.02, 10);

  // ================= sh2 (1.85 – 4.38): "só assistindo vídeo de GTA 6" — screen time ticking up
  shot("#sh2", 1.85, 4.38, 1.12);
  tl.fromTo("#glow2", { scale: 0.6, opacity: 0.5 }, { scale: 1.15, opacity: 1, duration: 2.5, ease: "sine.inOut" }, 1.85);
  // thumbnails flying past the camera (hyperspace of content)
  const FLY = 16, flyEls = [];
  for (let i = 0; i < FLY; i++) {
    const el = document.createElement("div"); el.className = "fl";
    el.setAttribute("style", thumb(VIDS[i % VIDS.length], i));
    $("#fly").appendChild(el); flyEls.push({ el, a: i * 2.39996, ph: (i / FLY) });
  }
  const fc = { t: 0 };
  const flyDraw = () => {
    for (const f of flyEls) {
      const p = (fc.t * 0.55 + f.ph) % 1;                 // 0 = far, 1 = at the camera
      const z = -2600 + p * 3200, r = 260 + p * 520;
      f.el.style.transform = `translate3d(${Math.cos(f.a) * r}px, ${Math.sin(f.a) * r * 1.4}px, ${z}px)`;
      f.el.style.opacity = (Math.min(1, p * 3) * (1 - Math.max(0, (p - 0.85) / 0.15)) * 0.8).toFixed(3);
    }
  };
  flyDraw();
  tl.fromTo(fc, { t: 0 }, { t: 2.6, duration: 2.6, ease: "none", onUpdate: flyDraw, immediateRender: false }, 1.85);
  riseOn("#t2a", [E.so, E.assistindo]);
  tl.fromTo("#t2a .pink", { scale: 1.3 }, { scale: 1, duration: 0.35, ease: "expo.out", immediateRender: false }, E.assistindo - 0.05);
  rise("#hrsL", 1.95);
  const hc = { h: 0 }, hrs = $("#hrs");
  tl.fromTo(hc, { h: 0 }, { h: 312, duration: 2.3, ease: "power2.in", onUpdate: () => { hrs.textContent = `${Math.round(hc.h)}h`; }, immediateRender: false }, 1.95);
  tl.fromTo("#hrs", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" }, 1.9);
  tl.to("#hrs", { scale: 1.08, duration: 2.2, ease: "power1.in" }, 2.2);
  riseOn("#t2b", [E.video, E.video + 0.2, E.gta, E.gta + 0.3]);

  // ================= sh3 (4.38 – 6.34): "esse vídeo não é pra você." then the screen switches off like an old TV
  shot("#sh3", 4.38, 6.2, 1.0);
  tl.fromTo("#sh3", { backgroundColor: "#ffffff" }, { backgroundColor: "#f5f2f9", duration: 0.25 }, 4.38);
  riseOn("#t3a", [E.esse, E.esse + 0.2]);
  tl.set(["#b3a", "#b3b", "#b3c"], { rotate: -5 }, 0);
  [["#b3a", E.nao], ["#b3b", E.pra], ["#b3c", E.voce]].forEach(([s, at], i) => { slam(s, at - 0.04, 1.9); shake(at, 8 + i * 6); });
  tl.to("#b3c", { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, E.voce + 0.3);
  // CRT power-off: the picture collapses to a bright line, then to a dot, then black
  gsap.set("#cam", { filter: "brightness(1)" });
  tl.fromTo("#cam", { scaleY: 1, filter: "brightness(1)" }, { scaleY: 0.006, filter: "brightness(2.5)", duration: 0.14, ease: "power3.in", immediateRender: false }, 5.92);
  tl.to("#cam", { scaleX: 0.02, duration: 0.1, ease: "power3.in" }, 6.06);
  tl.set("#cam", { opacity: 0 }, 6.17);
  tl.set("#cam", { scaleX: 1, scaleY: 1, filter: "brightness(1)", opacity: 1 }, 6.3);
  tl.to("#rgb", { opacity: 1, duration: 0.03, yoyo: true, repeat: 3 }, 6.2);
  shake(6.3, 26);

  // ================= sh4 (6.34 – 10.08): "Agora, se você já pensou em criar conteúdo sobre esse hype,"
  shot("#sh4", 6.34, 10.08, 1.15);
  slam("#t4a", E.agora - 0.04, 1.5);
  out("#t4a", E.se2 - 0.12);
  riseOn("#t4b", [E.se2, 7.18, 7.52, E.pensou, 8.16]);
  riseOn("#t4c", [E.criar, E.conteudo]);
  riseOn("#t4d", [E.sobre, 9.3, E.hype]);
  pop("#ic4a", E.criar + 0.05); pop("#ic4b", E.criar + 0.18); pop("#ic4c", E.conteudo + 0.2);
  tl.to(["#ic4a", "#ic4b", "#ic4c"], { y: -30, duration: 1.4, ease: "sine.inOut", stagger: 0.1 }, 8.6);

  // ================= sh5 (10.08 – 11.14): "presta atenção."
  shot("#sh5", 10.08, 11.14, 1.25);
  riseOn("#t5", [E.presta, E.atencao]);

  // ================= sh6 (11.14 – 14.32): "Não é falta de talento. Não é falta de tempo."
  shot("#sh6", 11.14, 14.32);
  tl.fromTo("#p6a", { y: 70, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "expo.out" }, E.nao1 - 0.05);
  strike("#sk6a", PRE.tal, E.talento + 0.35);
  tl.to("#p6a", { opacity: 0.45, duration: 0.3 }, E.nao2 - 0.05);
  tl.fromTo("#p6b", { y: 70, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "expo.out" }, E.nao2 - 0.05);
  strike("#sk6b", PRE.tem, E.tempo + 0.3);

  // ================= sh7 (14.32 – 15.8): "É falta de um plano."
  shot("#sh7", 14.32, 15.8, 1.12);
  riseOn("#t7a", [E.e3, 14.52, 14.84, E.um]);
  slam("#t7b", E.plano - 0.05, 1.6);
  shake(E.plano + 0.02, 12);

  // ================= sh8 (15.8 – 17.88): "O Hype Cash é um playbook interativo,"
  shot("#sh8", 15.8, 17.88, 1.0);
  tl.fromTo("#glow8", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 15.8);
  const L8 = 700 / 1189;
  tl.fromTo("#logo8", { x: 190, y: 540, scale: L8 * 1.4, opacity: 0, filter: "blur(18px)" }, { x: 190, y: 540, scale: L8, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, E.hypecash - 0.06);
  tl.to("#logo8", { scale: L8 * 1.03, duration: 1.4, ease: "sine.inOut" }, E.hypecash + 0.45);
  tl.fromTo("#t8", { letterSpacing: "0.7em", opacity: 0 }, { letterSpacing: "0.3em", opacity: 1, duration: 0.5, ease: "expo.out" }, E.playbook - 0.05);

  // ================= sh9 (17.88 – 22.62): the only phone moment (~4.6 s), real screens
  shot("#sh9", 17.88, 22.62, 1.0);
  tl.fromTo("#glow9", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "expo.out" }, 17.88);
  tl.fromTo("#phone", { y: 1200, rotate: 6 }, { y: 0, rotate: 0, duration: 0.55, ease: "expo.out" }, 17.88);
  tl.to("#phone", { y: -20, duration: 4, ease: "sine.inOut" }, 18.5);
  const W = 440, M1Y = -1189 * W / 512;
  [0, 1, 2, 3].forEach((k) => tl.set(`#m1_${k}`, { y: M1Y }, 0));
  tl.set("#m1_4", { y: M1Y - 27 * W / 512 }, 0);
  tl.set(["#pgM1", "#pgProg"], { x: W }, 0);
  tl.to("#pgM1", { x: 0, duration: 0.28, ease: "power3.out" }, E.checklist - 0.18);
  [0.05, 0.17, 0.29, 0.41].forEach((d, k) => tl.fromTo(`#m1_${k + 1}`, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: true }, E.checklist + d));
  tl.to("#pgProg", { x: 0, duration: 0.28, ease: "power3.out" }, E.progresso - 0.12);
  const PX = W / 430;
  tl.set("#hlP", { left: 16 * PX - 4, top: 22 + 285 * PX - 4, width: 398 * PX + 8, height: 87 * PX + 8, opacity: 0 }, 0);
  tl.to("#hlP", { opacity: 1, duration: 0.15, yoyo: true, repeat: 3 }, E.progresso + 0.15);
  [["#c9a", E.missoes, -1], ["#c9b", E.checklist, 1], ["#c9c", E.progresso, -1]].forEach(([s, at, d]) => {
    tl.fromTo(s, { x: 160 * d, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, at - 0.06);
    tl.fromTo(`${s} .icon`, { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2.6)" }, at);
  });
  riseOn("#t9", [E.leva + 0.16, E.zero, 21.3, E.primeiro, E.video2]);
  tl.to(["#phone", "#c9a", "#c9b", "#c9c"], { y: "+=1300", duration: 0.35, ease: "power3.in", stagger: 0.02 }, 22.3);

  // ================= sh10 (22.62 – 25.56): "Você escolhe o formato. Grava. Publica."
  shot("#sh10", 22.62, 25.56);
  riseOn("#t10a", [22.7, E.escolhe, 23.28, E.formato]);
  const TILES = [["Gameplay", "#ff3fa2", "#5a17c9"], ["React", "#3f8fff", "#1a1046"], ["Notícias", "#a83ffe", "#2a0f5c"], ["Teorias", "#ff8a3f", "#3a0f3f"]];
  $("#tiles").innerHTML = TILES.map(([t, a, b], i) => `<div class="tile" style="left:${90 + (i % 2) * 500}px; top:${760 + Math.floor(i / 2) * 260}px; background: linear-gradient(150deg, ${a}, ${b})">${t}</div>`).join("");
  const tiles = [...document.querySelectorAll(".tile")];
  tl.fromTo(tiles, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.06 }, E.escolhe);
  tl.to(tiles.filter((_, i) => i !== 1), { opacity: 0.3, duration: 0.2 }, E.formato + 0.3);
  tl.to(tiles[1], { scale: 1.08, borderColor: "#d4ff3f", boxShadow: "0 0 50px rgba(212,255,63,.6)", duration: 0.25, ease: "back.out(2)" }, E.formato + 0.3);
  tl.set(["#t10a", ...tiles], { visibility: "hidden" }, E.grava - 0.08);
  tl.set(["#t10b", "#rec", "#t10c", "#pub", "#pubOk"], { opacity: 0 }, 0);
  tl.set(["#t10b", "#rec"], { opacity: 1 }, E.grava - 0.08);
  slam("#t10b", E.grava - 0.08, 1.5);
  pop("#rec", E.grava);
  const rc = { s: 0 }, recT = $("#recT");
  tl.fromTo(rc, { s: 0 }, { s: 3, duration: 0.55, ease: "none", onUpdate: () => { recT.textContent = `00:0${Math.floor(rc.s)}`; }, immediateRender: false }, E.grava);
  tl.to("#rec .dot", { opacity: 0.2, duration: 0.12, yoyo: true, repeat: 3, ease: "steps(1)" }, E.grava + 0.1);
  tl.set(["#t10b", "#rec"], { visibility: "hidden" }, E.publica - 0.08);
  tl.set(["#t10c", "#pub"], { opacity: 1 }, E.publica - 0.08);
  slam("#t10c", E.publica - 0.08, 1.5);
  pop("#pub", E.publica);
  tl.to("#pub", { scale: 0.93, duration: 0.08, yoyo: true, repeat: 1 }, E.publica + 0.4);
  tl.set("#pubOk", { opacity: 1 }, E.publica + 0.5);
  tl.fromTo("#pubOk", { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, E.publica + 0.5);

  // ================= sh11 (25.56 – 27.06): "Sem promessa de dinheiro fácil."
  shot("#sh11", 25.56, 27.06);
  rise("#t11a", E.sem - 0.05);
  riseOn("#t11b", [E.dinheiro, E.facil]);
  const a = PRE.d11, b = PRE.f11;
  tl.set("#sk11", { left: a.x - 10, top: a.y + a.h * 0.5 - 6, width: b.x + b.w - a.x + 20, scaleX: 0 }, 0);
  tl.to("#sk11", { scaleX: 1, duration: 0.2, ease: "power3.out" }, E.facil + 0.12);

  // ================= sh12 (27.06 – 30.34): "Dia 19 de novembro, GTA 6 chega."
  shot("#sh12", 27.06, 30.34);
  rise("#t12a", E.dia - 0.05);
  slam("#t12b", E.d19 - 0.05, 1.7);
  shake(E.d19, 10);
  tl.fromTo("#t12c", { letterSpacing: "0.5em", opacity: 0 }, { letterSpacing: "0.1em", opacity: 1, duration: 0.5, ease: "expo.out" }, E.novembro - 0.06);
  riseOn("#t12d", [E.gta2, E.gta2 + 0.2, E.chega]);
  tl.to("#t12b", { scale: 1.05, duration: 2.4, ease: "none" }, 27.9);

  // ================= sh13 (30.34 – 33.46): "Ou você começa agora… ou assiste os outros começarem."
  shot("#sh13", 30.34, 33.46, 1.0);
  tl.fromTo("#top13", { y: -960 }, { y: 0, duration: 0.35, ease: "expo.out" }, 30.34);
  riseOn("#t13a", [E.ou1, 30.52, E.comeca, E.agora2]);
  tl.fromTo("#bot13", { y: 960 }, { y: 0, duration: 0.35, ease: "expo.out" }, E.ou2 - 0.15);
  riseOn("#t13b", [E.ou2, E.assiste, 32.3, E.outros, E.comecarem]);
  tl.to("#top13", { boxShadow: "inset 0 0 0 14px #15101f", duration: 0.2, yoyo: true, repeat: 3 }, E.comecarem + 0.1);

  // ================= sh14 (33.46 – 37): CTA
  shot("#sh14", 33.46, 37.1, 1.0);
  tl.fromTo("#glow14", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" }, 33.46);
  const L14 = 560 / 1189;
  tl.fromTo("#logo14", { x: 260, y: 320, scale: L14 * 1.35, opacity: 0, filter: "blur(18px)" }, { x: 260, y: 320, scale: L14, opacity: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, 33.5);
  tl.to("#logo14", { scale: L14 * 1.05, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, E.conheca);
  tl.fromTo("#btn", { y: 160, scale: 0.85, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, E.toque - 0.05);
  tl.fromTo("#cursor", { x: 880, y: 1600, opacity: 0 }, { x: 700, y: 1150, opacity: 1, duration: 0.35, ease: "expo.out" }, E.botao - 0.25);
  tl.to("#cursor", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "15% 10%" }, E.botao + 0.2);
  tl.to("#btn", { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, E.botao + 0.2);
  tl.fromTo("#ripple", { left: 684, top: 1128, scale: 0.4, opacity: 0.9 }, { scale: 5, opacity: 0, duration: 0.6, ease: "expo.out" }, E.botao + 0.25);
  tl.to("#cursor", { x: 880, y: 1600, opacity: 0, duration: 0.4, ease: "power2.in" }, E.botao + 0.8);
  rise("#t14", E.cash_end + 0.05);
  tl.fromTo("#shine", { x: 0 }, { x: 1300, duration: 0.8, ease: "power2.inOut", repeat: 1, repeatDelay: 0.3 }, 35.3);
  tl.fromTo("#legal", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 35.4);

  tl.set({}, {}, 37.0);
  return tl;
}

window.__ready = (async () => {
  const faces = ["700 10px Poppins", "800 10px Poppins", "900 10px Poppins", "500 10px Inter", "600 10px Inter", "700 10px Inter"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  const tl = build();
  window.seek = (t) => { tl.seek(t, false); };
  tl.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), images: document.images.length, duration: tl.duration() };
})();
