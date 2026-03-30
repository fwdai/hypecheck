import { ImageResponse } from "next/og";
import { getHypeReportBySlug } from "@/lib/measure-store";

export const maxDuration = 60;
export const runtime = "nodejs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const START_DEG = 135;
const SWEEP_DEG = 270;
const toRad = (d: number) => (d * Math.PI) / 180;

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  sweepDeg: number,
): string {
  const endDeg = startDeg + sweepDeg;
  const sx = cx + r * Math.cos(toRad(startDeg));
  const sy = cy + r * Math.sin(toRad(startDeg));
  const ex = cx + r * Math.cos(toRad(endDeg));
  const ey = cy + r * Math.sin(toRad(endDeg));
  const large = sweepDeg >= 180 ? 1 : 0;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

function getColor(val: number) {
  if (val <= 30) return "#22c55e";
  if (val <= 50) return "#eab308";
  if (val <= 70) return "#f97316";
  return "#ef4444";
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getHypeReportBySlug(slug);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <span style={{ color: "#444", fontSize: 28 }}>Not found</span>
        </div>
      ),
      { ...size },
    );
  }

  const { termName, analysis } = data;
  const { hypeScore, verdict } = analysis;
  const color = getColor(hypeScore);

  // Gauge geometry — mirrors HypeGauge.tsx
  const G = 300;
  const cx = G / 2; // 150
  const cy = G / 2; // 150
  const gr = G / 2 - 20; // 130

  const scoreSweep = SWEEP_DEG * (hypeScore / 100);
  const scoreEndDeg = START_DEG + scoreSweep;
  const dotX = cx + gr * Math.cos(toRad(scoreEndDeg));
  const dotY = cy + gr * Math.sin(toRad(scoreEndDeg));

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const deg = START_DEG + (SWEEP_DEG * i) / 10;
    const isMajor = i % 5 === 0;
    const innerR = gr - (isMajor ? 20 : 14);
    const outerR = gr - 8;
    return {
      x1: cx + innerR * Math.cos(toRad(deg)),
      y1: cy + innerR * Math.sin(toRad(deg)),
      x2: cx + outerR * Math.cos(toRad(deg)),
      y2: cy + outerR * Math.sin(toRad(deg)),
      isMajor,
    };
  });

  // Label anchor positions (matches canvas fillText offsets)
  const realX = cx + (gr + 24) * Math.cos(toRad(START_DEG)) + 10;
  const realY = cy + (gr + 24) * Math.sin(toRad(START_DEG));
  const hypeX = cx + (gr + 24) * Math.cos(toRad(START_DEG + SWEEP_DEG)) - 10;
  const hypeY = cy + (gr + 24) * Math.sin(toRad(START_DEG + SWEEP_DEG));

  const scoreFontSize = G * 0.2; // 60
  const labelFontSize = G * 0.055; // ~16
  const endLabelFontSize = G * 0.046; // ~14

  // Scale term name font to fit
  const termFontSize =
    termName.length <= 8
      ? 100
      : termName.length <= 14
        ? 82
        : termName.length <= 20
          ? 66
          : 52;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          gap: 0,
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            display: "flex",
          }}
        />

        {/* Radial glow behind gauge */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 520,
            height: 520,
            marginTop: -260,
            marginLeft: -260,
            background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
            borderRadius: 999,
            display: "flex",
          }}
        />

        {/* HYPECHECK.FYI — top left branding */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 56,
            display: "flex",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#1ae6d5",
          }}
        >
          HYPECHECK.FYI
        </div>

        {/* Term name */}
        <div
          style={{
            display: "flex",
            fontSize: termFontSize,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginBottom: 32,
          }}
        >
          {termName}
        </div>

        {/* Gauge */}
        <div
          style={{
            position: "relative",
            width: G,
            height: G,
            display: "flex",
          }}
        >
          <svg
            width={G}
            height={G}
            viewBox={`0 0 ${G} ${G}`}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {/* Track */}
            <path
              d={arcPath(cx, cy, gr, START_DEG, SWEEP_DEG)}
              fill="none"
              stroke="#1c1c1c"
              strokeWidth={14}
              strokeLinecap="round"
            />

            {/* Ticks */}
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={t.x1.toFixed(2)}
                y1={t.y1.toFixed(2)}
                x2={t.x2.toFixed(2)}
                y2={t.y2.toFixed(2)}
                stroke="#2a2a2a"
                strokeWidth={t.isMajor ? 2 : 1}
              />
            ))}

            {/* Glow arc */}
            {hypeScore > 0 && (
              <path
                d={arcPath(cx, cy, gr, START_DEG, scoreSweep)}
                fill="none"
                stroke={color + "38"}
                strokeWidth={28}
                strokeLinecap="round"
              />
            )}

            {/* Score arc */}
            {hypeScore > 0 && (
              <path
                d={arcPath(cx, cy, gr, START_DEG, scoreSweep)}
                fill="none"
                stroke={color}
                strokeWidth={14}
                strokeLinecap="round"
              />
            )}

            {/* Dot glow */}
            {hypeScore > 0 && (
              <circle
                cx={dotX.toFixed(2)}
                cy={dotY.toFixed(2)}
                r={11}
                fill={color + "30"}
              />
            )}

            {/* Dot */}
            {hypeScore > 0 && (
              <circle
                cx={dotX.toFixed(2)}
                cy={dotY.toFixed(2)}
                r={7}
                fill={color}
              />
            )}
          </svg>

          {/* Score number */}
          <div
            style={{
              position: "absolute",
              top: cy - 8 - scoreFontSize / 2,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              fontSize: scoreFontSize,
              fontWeight: 800,
              color: color,
              lineHeight: 1,
            }}
          >
            {hypeScore}
          </div>

          {/* HYPE SCORE label */}
          <div
            style={{
              position: "absolute",
              top: cy + G * 0.1 - labelFontSize / 2,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              fontSize: labelFontSize,
              color: "#4a4a4a",
              letterSpacing: "0.1em",
            }}
          >
            HYPE SCORE
          </div>

          {/* REAL label */}
          <div
            style={{
              position: "absolute",
              top: realY - endLabelFontSize / 2,
              left: realX - 28,
              fontSize: endLabelFontSize,
              fontWeight: 700,
              color: "#22c55e",
              letterSpacing: "0.06em",
              display: "flex",
            }}
          >
            REAL
          </div>

          {/* HYPE label */}
          <div
            style={{
              position: "absolute",
              top: hypeY - endLabelFontSize / 2,
              left: hypeX - 28,
              fontSize: endLabelFontSize,
              fontWeight: 700,
              color: "#ef4444",
              letterSpacing: "0.06em",
              display: "flex",
            }}
          >
            HYPE
          </div>
        </div>

        {/* Verdict pill */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            padding: "10px 32px",
            borderRadius: 999,
            background: color + "18",
            border: `1px solid ${color}35`,
            fontSize: 22,
            fontWeight: 700,
            color: color,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {verdict}
        </div>
      </div>
    ),
    { ...size },
  );
}
