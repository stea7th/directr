"use client";

import { useMemo, useState } from "react";
import { shortDate } from "@/lib/velzi/metrics";

export type ChartPoint = { day: string; value: number };

type Props = {
  points: ChartPoint[];
  /** Series colour; also the fill hue for the area gradient. */
  color: string;
  kind?: "area" | "bar";
  /** Formats the y-axis ticks and the tooltip value. */
  format: (n: number) => string;
  /** Series name, used in the tooltip row. */
  label: string;
  height?: number;
  gradientId: string;
};

const W = 720;
const PAD = { top: 16, right: 14, bottom: 30, left: 52 };

/** Rounds a maximum up to a friendly axis ceiling (1/2/5 × 10ⁿ). */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export default function TimeChart({
  points,
  color,
  kind = "area",
  format,
  label,
  height = 260,
  gradientId,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const H = height;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const geometry = useMemo(() => {
    const max = niceMax(Math.max(...points.map((p) => p.value), 0));
    const stepX = points.length > 1 ? plotW / (points.length - 1) : plotW;

    const x = (i: number) =>
      points.length > 1 ? PAD.left + i * stepX : PAD.left + plotW / 2;
    const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p.value)}`).join(" ");
    const area = `${line} L${x(points.length - 1)} ${PAD.top + plotH} L${x(0)} ${PAD.top + plotH} Z`;

    // Four gridlines including the ceiling reads as enough structure.
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      value: max * t,
      y: PAD.top + plotH - t * plotH,
    }));

    return { max, stepX, x, y, line, area, ticks };
  }, [points, plotH, plotW]);

  // Bars get a 2px surface gap on each side, per the mark spec.
  const barW = Math.max(3, Math.min(22, geometry.stepX - 4));

  const active = hover !== null ? points[hover] : null;

  function onMove(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, index)));
  }

  // Label roughly every fifth day so ticks never collide.
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div className="v-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} over time`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.34" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <g className="v-chart__grid">
          {geometry.ticks.map((tick) => (
            <line key={tick.y} x1={PAD.left} x2={W - PAD.right} y1={tick.y} y2={tick.y} />
          ))}
        </g>

        <g className="v-chart__axis">
          {geometry.ticks.map((tick) => (
            <text key={tick.y} x={PAD.left - 10} y={tick.y + 3.5} textAnchor="end">
              {format(tick.value)}
            </text>
          ))}
          {points.map((p, i) =>
            i % labelEvery === 0 || i === points.length - 1 ? (
              <text key={p.day} x={geometry.x(i)} y={H - PAD.bottom + 18} textAnchor="middle">
                {shortDate(p.day)}
              </text>
            ) : null,
          )}
        </g>

        {kind === "area" ? (
          <>
            <path d={geometry.area} fill={`url(#${gradientId})`} className="v-fade-in" />
            <path
              d={geometry.line}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="v-draw"
              style={{ ["--len" as string]: "2400" }}
            />
          </>
        ) : (
          points.map((p, i) => {
            const barH = Math.max(0, PAD.top + plotH - geometry.y(p.value));
            if (barH <= 0) return null;
            return (
              <rect
                key={p.day}
                x={geometry.x(i) - barW / 2}
                y={geometry.y(p.value)}
                width={barW}
                height={barH}
                rx="4"
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.45}
                className="v-rise"
                style={{ animationDelay: `${i * 18}ms` }}
              />
            );
          })
        )}

        <line
          className="v-chart__baseline"
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + plotH}
          y2={PAD.top + plotH}
        />

        {active && hover !== null ? (
          <g>
            <line
              className="v-crosshair"
              x1={geometry.x(hover)}
              x2={geometry.x(hover)}
              y1={PAD.top}
              y2={PAD.top + plotH}
            />
            {kind === "area" ? (
              <circle
                cx={geometry.x(hover)}
                cy={geometry.y(active.value)}
                r="5"
                fill={color}
                stroke="var(--v-bg)"
                strokeWidth="2"
              />
            ) : null}
          </g>
        ) : null}

        <rect
          className="v-chart__hit"
          x={PAD.left - geometry.stepX / 2}
          y={PAD.top}
          width={plotW + geometry.stepX}
          height={plotH}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>

      {active && hover !== null ? (
        <div
          className="v-tip"
          style={{
            left: `${(geometry.x(hover) / W) * 100}%`,
            top: `${(kind === "area" ? geometry.y(active.value) / H : PAD.top / H) * 100}%`,
          }}
        >
          <div className="v-tip__day">{shortDate(active.day)}</div>
          <div className="v-tip__row">
            <span className="v-tip__key">
              <span
                className="v-legend__swatch"
                style={{ background: color }}
                aria-hidden="true"
              />
              {label}
            </span>
            <b>{format(active.value)}</b>
          </div>
        </div>
      ) : null}
    </div>
  );
}
