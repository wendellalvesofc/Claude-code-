import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GREEN } from "./Captions";
import { T } from "./timing";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const TEXT_SHADOW = "0 4px 14px rgba(0,0,0,0.5), 0 2px 3px rgba(0,0,0,0.55)";

// Caixa escura translúcida no topo da tela: entra com slide + fade (0,5 s), sai em 0,25 s.
const Panel: React.FC<{
  durationInFrames: number;
  top?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, top = 230, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = durationInFrames - 0.25 * fps;
  const enter = interpolate(frame, [0, 0.5 * fps], [0, 1], { ...clamp, easing: easeOut });
  const exit = interpolate(frame, [out, durationInFrames], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top,
          maxWidth: 864,
          padding: "26px 44px 30px",
          borderRadius: 32,
          backgroundColor: "rgba(10,10,10,0.62)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Inter",
          fontWeight: 900,
          color: "white",
          textAlign: "center",
          textShadow: TEXT_SHADOW,
          opacity: enter * (1 - exit),
          translate: `0px ${(1 - enter) * 60 - exit * 30}px`,
          scale: String(interpolate(enter, [0, 1], [0.9, 1])),
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 6, opacity: 0.9 }}>{children}</div>
);

const Headline: React.FC<{ size?: number; children: React.ReactNode }> = ({ size = 92, children }) => (
  <div style={{ fontSize: size, lineHeight: 1.0, letterSpacing: -2 }}>{children}</div>
);

// Valor em verde que "bate" na tela: escala 1,6 -> 1 e tremida curta.
const Money: React.FC<{ at: number; size: number; children: React.ReactNode; pulseAt?: number }> = ({
  at,
  size,
  children,
  pulseAt,
}) => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [at, at + 6], [0, 1], { ...clamp, easing: easeOut });
  const pulse =
    pulseAt === undefined
      ? 0
      : interpolate(frame, [pulseAt, pulseAt + 3, pulseAt + 9], [0, 1, 0], clamp);
  const shaking = frame >= at && frame < at + 5;
  return (
    <div
      style={{
        fontSize: size,
        lineHeight: 1.0,
        letterSpacing: -3,
        color: GREEN,
        opacity: slam,
        scale: String(interpolate(slam, [0, 1], [1.6, 1]) + pulse * 0.1),
        translate: shaking
          ? `${(random(`mx${frame}`) * 2 - 1) * 6}px ${(random(`my${frame}`) * 2 - 1) * 6}px`
          : undefined,
      }}
    >
      {children}
    </div>
  );
};

// Contador R$ 0 -> R$ 1.000 em 0,35 s.
const PixCounter: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = interpolate(frame, [at, at + 0.35 * fps], [0, 1000], { ...clamp, easing: easeOut });
  const label = `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
  return (
    <Money at={at} size={150}>
      {label}
    </Money>
  );
};

const Pin: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" style={{ marginRight: 14, flexShrink: 0 }}>
    <path
      fill="white"
      d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
    />
  </svg>
);

export const Cards: React.FC = () => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);

  return (
    <AbsoluteFill>
      {/* Gancho: a oferta mais forte logo nos primeiros 3 s */}
      <Sequence name="Gancho" from={f(0.1)} durationInFrames={f(3.5)}>
        <Panel durationInFrames={f(3.5)}>
          <Kicker>BLACK FRIDAY REALME</Kicker>
          <Headline size={88}><span style={{ whiteSpace: "nowrap" }}>FONE OFICIAL POR</span></Headline>
          <Money at={f(0.35)} size={150}>R$ 1</Money>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, opacity: 0.85 }}>
            na compra do seu realme
          </div>
        </Panel>
      </Sequence>

      <Sequence name="Pré-Black" from={f(T.preBlack)} durationInFrames={f(1.5)}>
        <Panel durationInFrames={f(1.5)}>
          <Kicker>A PRÉ-BLACK</Kicker>
          <Headline>JÁ COMEÇOU</Headline>
        </Panel>
      </Sequence>

      <Sequence name="Preço garantido" from={f(T.precoGarantido)} durationInFrames={f(3.6)}>
        <Panel durationInFrames={f(3.6)}>
          <Headline>✓ PREÇO</Headline>
          <Headline>GARANTIDO</Headline>
        </Panel>
      </Sequence>

      <Sequence name="Pix R$ 1.000" from={f(T.pixStart)} durationInFrames={f(1.2)}>
        <Panel durationInFrames={f(1.2)}>
          <Kicker>TE GARANTO UM PIX DE</Kicker>
          <PixCounter at={f(T.pixValue - T.pixStart)} />
        </Panel>
      </Sequence>

      <Sequence name="Datas" from={f(T.datas)} durationInFrames={f(2.0)}>
        <Panel durationInFrames={f(2.0)}>
          <Kicker>COMPRAS DE</Kicker>
          <Headline size={110}>15/10 A 27/11</Headline>
        </Panel>
      </Sequence>

      <Sequence name="Fone R$ 1" from={f(T.fone)} durationInFrames={f(T.vaiPerder - T.fone)}>
        <Panel durationInFrames={f(T.vaiPerder - T.fone)}>
          <Kicker>NO DIA DA BLACK</Kicker>
          <Headline>FONE OFICIAL</Headline>
          <Money
            at={f(T.foneValue - T.fone)}
            pulseAt={f(T.foneRepeat - T.fone)}
            size={170}
          >
            R$ 1
          </Money>
        </Panel>
      </Sequence>

      <Sequence name="CTA" from={f(T.cta)}>
        <Panel durationInFrames={f(30 - T.cta) + 30}>
          <Kicker>BLACK FRIDAY</Kicker>
          <Headline size={104}>VEM PRA</Headline>
          <Headline size={128}>REALME</Headline>
        </Panel>
      </Sequence>

      <Sequence name="CTA endereço" from={f(T.storefront)}>
        <Panel durationInFrames={f(30 - T.storefront) + 30} top={1400}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 50, fontWeight: 900 }}>
            <Pin />
            Plaza Shopping Carapicuíba
          </div>
        </Panel>
      </Sequence>
    </AbsoluteFill>
  );
};
