import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "./Captions";
import { Cards } from "./Cards";
import { CUTS, T } from "./timing";

loadFont({ family: "Inter", url: staticFile("Inter-Black.otf"), weight: "900" });
loadFont({ family: "Inter", url: staticFile("Inter-ExtraBold.otf"), weight: "800" });

const easeOut = Easing.bezier(0.33, 1, 0.68, 1); // ease-out cubic

// Zoom de cada plano: [zoom inicial, zoom final] do Ken Burns.
const KEN_BURNS: [number, number][] = [
  [1.0, 1.08],
  [1.0, 1.06],
  [1.1, 1.12],
  [1.0, 1.04],
  [1.08, 1.11],
  [1.0, 1.06],
  [1.06, 1.1],
];

// Punch-ins: no segundo t soma `amount` em 0,25 s; vale até o fim do plano.
const PUNCHES: { t: number; amount: number }[] = [
  { t: T.realme, amount: 0.06 },
  { t: T.precoGarantido, amount: 0.06 },
  { t: T.pixValue, amount: 0.06 },
  { t: T.foneValue, amount: 0.06 },
  { t: T.vaiPerder, amount: 0.06 },
];

// Tremidas de ±6 px por 5 frames nas palavras de impacto.
const SHAKES = [T.pixValue, T.foneValue];

const segmentOf = (frame: number) => {
  let i = 0;
  while (i < CUTS.length - 2 && frame >= CUTS[i + 1]) i++;
  return i;
};

export const RealmeBF: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seg = segmentOf(frame);
  const [z0, z1] = KEN_BURNS[seg];
  const segStart = CUTS[seg];
  const segEnd = CUTS[seg + 1];

  let zoom = interpolate(frame, [segStart, segEnd], [z0, z1]);
  for (const p of PUNCHES) {
    const f = p.t * fps;
    if (f >= segStart && f < segEnd) {
      zoom += interpolate(frame, [f, f + 0.25 * fps], [0, p.amount], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeOut,
      });
    }
  }
  // No CTA o punch de "Vai perder essa?" volta suave para abrir a fachada.
  if (seg === 5) zoom -= interpolate(frame, [T.cta * fps, (T.cta + 0.6) * fps], [0, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  let shakeX = 0;
  let shakeY = 0;
  for (const s of SHAKES) {
    const f = Math.round(s * fps);
    if (frame >= f && frame < f + 5) {
      shakeX = (random(`sx${frame}`) * 2 - 1) * 6;
      shakeY = (random(`sy${frame}`) * 2 - 1) * 6;
    }
  }

  // Entrada do 2º plano depois do whip da câmera: desliza e desfoca por 5 frames.
  const whipIn = interpolate(frame, [CUTS[1], CUTS[1] + 5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const inWhip = frame >= CUTS[1] && frame < CUTS[1] + 5;

  // Flash branco de 2 frames na virada de assunto (preço garantido -> fone).
  const flash = frame >= CUTS[3] && frame < CUTS[3] + 2 ? 0.75 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          scale: String(zoom),
          translate: `${shakeX + (inWhip ? whipIn * 140 : 0)}px ${shakeY}px`,
          filter: inWhip ? `blur(${whipIn * 10}px)` : undefined,
        }}
      >
        <Video src={staticFile("base.mp4")} muted />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
      <Cards />
      <Captions />
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
