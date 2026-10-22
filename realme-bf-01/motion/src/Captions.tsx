import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PAGES } from "./captions";

export const GREEN = "#2EE66B";

// Legenda karaokê: até 4 palavras por tela, a 78% da altura.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const idx = PAGES.findIndex((p, i) => {
    const start = p[0].s;
    const next = PAGES[i + 1]?.[0].s ?? Infinity;
    const end = Math.min(next, p[p.length - 1].e + 0.35);
    return t >= start && t < end;
  });
  if (idx === -1) return null;
  const page = PAGES[idx];
  const pageStart = page[0].s * fps;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 108,
          right: 108,
          top: 1920 * 0.78,
          translate: "0px -50%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 20,
          rowGap: 4,
          fontFamily: "Inter",
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.1,
          letterSpacing: -1,
          textAlign: "center",
          scale: String(
            interpolate(frame, [pageStart, pageStart + 4], [0.92, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.33, 1, 0.68, 1),
            }),
          ),
          opacity: interpolate(frame, [pageStart, pageStart + 3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {page.map((w, i) => {
          const ws = w.s * fps;
          const spoken = frame >= ws;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: w.money ? GREEN : "white",
                opacity: spoken ? 1 : 0.6,
                scale: String(
                  interpolate(frame, [ws, ws + 1, ws + 3, ws + 6], [1, 1.12, 1.12, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                ),
                WebkitTextStroke: "2px rgba(0,0,0,0.35)",
                paintOrder: "stroke fill",
                textShadow:
                  "0 4px 14px rgba(0,0,0,0.55), 0 2px 3px rgba(0,0,0,0.6)",
              }}
            >
              {w.t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
