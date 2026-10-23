// realme | Vídeo 02 no estilo UGC das referências. Uma timeline GSAP pausada; window.seek(t) põe tudo em t.
// A gravação (src/foot) já está cortada nos trechos de fala; o quadro é sempre round(t * fps).
const T = window.TIMING;
const $ = (s) => document.querySelector(s);

// trocas de apresentador (flash quente) e jump cuts dentro do mesmo plano (punch-in)
const PRESENTER_CUTS = [4.5, 10.567, 17.7];
const JUMP_CUTS = [14.7, 22.3];

// legendas normais: [início, texto]. Cada uma fica até a próxima começar.
const CAPS = [
  [0.0, "você ouviu"], [0.98, "falar em"],
  ["H1"],
  [2.44, "mas não sabe"], [3.24, "o que isso significa?"],
  [4.68, "a realme resolveu"], [5.36, "antecipar a Black"],
  [6.32, "e do dia 15/10"], [7.3, "até 15/11"],
  [8.68, "todos os nossos aparelhos"],
  ["H2"],
  [10.64, "se você comprar"], [11.68, "qualquer um"], [12.34, "de nossos aparelhos"], [13.48, "durante a campanha"],
  [14.96, "no dia da Black"], [15.7, "você garante"],
  ["H3"],
  [18.22, "e caso você venha"], [19.02, "pra Black"], [19.4, "e o preço esteja"], [20.02, "mais baixo,"],
  ["H4"],
  [22.34, "então vem pra realme"],
];
// destaques: linha 1 branca + linha 2 grande colorida, palavra a palavra no tempo da fala
const HL = {
  H1: { l1: [["preço", 1.5]], l2: [["garantido", 1.8]], c: "y" },
  H2: { l1: [["já", 9.48], ["estão", 9.66], ["com", 9.8], ["o", 9.95]], l2: [["preço", 9.98], ["da", 10.12], ["Black", 10.3]], c: "y" },
  H3: { l1: [["um", 16.5], ["fone", 16.76], ["por", 16.98]], l2: [["R$ 1", 17.22]], c: "g" },
  H4: { l1: [["eu", 20.88], ["te", 20.94], ["faço", 21.1], ["um", 21.22]], l2: [["pix", 21.38], ["de", 21.52], ["R$ 1.000", 21.68]], c: "g" },
};
const END = T.video_duration_s;

function build() {
  const tl = gsap.timeline({ paused: true });
  const caps = $("#caps");

  // ---- legendas
  const items = CAPS.map((c) => {
    if (c[0] in HL) {
      const h = HL[c[0]], el = document.createElement("div");
      el.className = "hl";
      const line = (ws, cls) => `<div class="${cls}">` + ws.map(([t]) => `<span class="w">${t}</span>`).join(" ") + "</div>";
      el.innerHTML = line(h.l1, "l1") + line(h.l2, "l2 " + h.c);
      caps.appendChild(el);
      return { el, a: h.l1[0][1], h };
    }
    const el = document.createElement("div");
    el.className = "cap"; el.textContent = c[1]; caps.appendChild(el);
    return { el, a: c[0] };
  });
  items.forEach((it, i) => {
    const b = i + 1 < items.length ? items[i + 1].a : END;
    tl.set(it.el, { visibility: "visible" }, it.a).set(it.el, { visibility: "hidden" }, b);
    if (!it.h) return;   // legenda normal: corte seco de uma para a outra, sem animação
    // palavra "fantasma" (cinza translúcida) que acende na cor quando é falada
    const ws = [...it.el.querySelectorAll(".w")], times = [...it.h.l1, ...it.h.l2].map((x) => x[1]);
    const l1n = it.h.l1.length;
    ws.forEach((w, k) => {
      gsap.set(w, { opacity: 0.32, filter: "grayscale(1) brightness(1.6)" });
      tl.to(w, { opacity: 1, filter: "grayscale(0) brightness(1)", duration: 0.08, ease: "none" }, times[k] - 0.03);
      if (k >= l1n) tl.fromTo(w, { scale: 1.25 }, { scale: 1, duration: 0.22, ease: "back.out(2)", immediateRender: false }, times[k] - 0.03);
    });
  });

  // ---- câmera: empurrão lento em cada plano e punch-in nos jump cuts
  const bounds = [0, ...PRESENTER_CUTS, ...JUMP_CUTS, END].sort((x, y) => x - y);
  for (let i = 0; i < bounds.length - 1; i++) {
    const a = bounds[i], b = bounds[i + 1];
    const z0 = JUMP_CUTS.includes(a) ? 1.09 : 1.0;   // o jump cut entra mais fechado
    tl.fromTo("#cam", { scale: z0 }, { scale: z0 + 0.03, duration: b - a, ease: "none", immediateRender: false }, a);
  }

  // ---- flash quente na troca de apresentador (estoura ~4 quadros antes e revela o próximo plano)
  for (const c of PRESENTER_CUTS) {
    tl.fromTo("#leak", { opacity: 0, "--lx": "15%" }, { opacity: 1, "--lx": "45%", duration: 0.14, ease: "power2.in", immediateRender: false }, c - 0.14);
    tl.to("#leak", { opacity: 0, "--lx": "85%", duration: 0.22, ease: "power2.out" }, c);
    tl.fromTo("#fimg", { filter: "brightness(1) saturate(1)" }, { filter: "brightness(1.4) saturate(1.3)", duration: 0.14, ease: "power2.in", immediateRender: false }, c - 0.14);
    tl.to("#fimg", { filter: "brightness(1) saturate(1)", duration: 0.22, ease: "power2.out" }, c);
  }

  tl.set({}, {}, END);
  return tl;
}

window.__ready = (async () => {
  const faces = ["800 10px Poppins", "900 10px Poppins", "500 10px Inter", "700 10px Inter"];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  const tl = build();
  const fimg = $("#fimg");
  window.seek = async (t) => {
    tl.seek(t, false);
    const f = Math.min(T.total_frames - 1, Math.round(t * T.fps));
    fimg.src = `foot/${String(f + 1).padStart(4, "0")}.jpg`;
    await fimg.decode();
  };
  await window.seek(0);
  return { fonts: Object.fromEntries([...document.fonts].map((f) => [`${f.family} ${f.weight}`, f.status])), duration: tl.duration() };
})();
