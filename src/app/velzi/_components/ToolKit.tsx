"use client";

import { useId } from "react";

/** Slider row with a live-formatted value. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  display: (n: number) => string;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className="v-field">
      <div className="v-field__top">
        <label className="v-field__label" htmlFor={id}>
          {label}
        </label>
        <span className="v-field__val">{display(value)}</span>
      </div>
      <input
        id={id}
        className="v-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%` }}
      />
    </div>
  );
}

/** Free-entry numeric field, for values a slider range would squash. */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  step?: number;
  min?: number;
}) {
  const id = useId();
  return (
    <div className="v-field">
      <div className="v-field__top">
        <label className="v-field__label" htmlFor={id}>
          {label}
        </label>
      </div>
      <input
        id={id}
        className="v-input"
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        aria-label={prefix ? `${label} in ${prefix}` : label}
      />
    </div>
  );
}

export function Readout({
  rows,
}: {
  rows: { label: string; value: string; hero?: boolean; tone?: string }[];
}) {
  return (
    <div className="v-readout">
      {rows.map((row) => (
        <div
          key={row.label}
          className={`v-readout__row ${row.hero ? "v-readout__row--hero" : ""}`}
        >
          <span>{row.label}</span>
          <b style={row.tone ? { color: row.tone } : undefined}>{row.value}</b>
        </div>
      ))}
    </div>
  );
}

export function Meter({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="v-meter" role="presentation">
      <div
        className="v-meter__fill"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );
}

export function Tool({
  icon,
  title,
  sub,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="v-tool">
      <div className="v-tool__head">
        <span className="v-tool__badge">{icon}</span>
        <h3>{title}</h3>
      </div>
      <p className="v-tool__sub">{sub}</p>
      {children}
    </section>
  );
}
