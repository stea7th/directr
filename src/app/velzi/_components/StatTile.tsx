"use client";

import { CountUp } from "./motion";

/** Inline sparkline — trend shape only, no axes. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const W = 120;
  const H = 34;
  const step = W / (values.length - 1);
  const y = (v: number) => H - 2 - (v / max) * (H - 6);

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${i * step} ${y(v)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg className="v-kpi__spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="v-draw"
        style={{ ["--len" as string]: "400" }}
      />
    </svg>
  );
}

export default function StatTile({
  label,
  icon,
  value,
  format,
  note,
  spark,
  color = "var(--series-1)",
  delay = 0,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  format: (n: number) => string;
  note?: React.ReactNode;
  spark?: number[];
  color?: string;
  delay?: number;
}) {
  return (
    <div className="v-kpi" style={{ animationDelay: `${delay}ms` }}>
      <div className="v-kpi__label">
        <span style={{ color }} aria-hidden="true">
          {icon}
        </span>
        {label}
      </div>
      <div className="v-kpi__value">
        <CountUp value={value} format={format} />
      </div>
      {note ? <div className="v-kpi__note">{note}</div> : null}
      {spark ? <Sparkline values={spark} color={color} /> : null}
    </div>
  );
}
