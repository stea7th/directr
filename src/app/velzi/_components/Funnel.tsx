// Conversion funnel. Ordinal blue ramp — light at the top of the funnel,
// deepening as the stages narrow. Every stage carries its own label and
// number, so colour is never doing the work alone.

import { percent } from "@/lib/velzi/metrics";

export type FunnelStage = { label: string; value: number };

// Ordinal steps chosen for the dark surface (nothing past step 500).
const RAMP = ["#9ec5f4", "#6da7ec", "#3987e5", "#256abf"];

export default function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value ?? 0;

  return (
    <div className="v-funnel">
      {stages.map((stage, i) => {
        const share = top > 0 ? stage.value / top : 0;
        const previous = i > 0 ? stages[i - 1].value : null;
        const dropped = previous !== null ? previous - stage.value : 0;
        const dropRate = previous && previous > 0 ? dropped / previous : 0;

        return (
          <div className="v-funnel__row" key={stage.label}>
            <div className="v-funnel__meta">
              <span>{stage.label}</span>
              <span>
                <b>{stage.value.toLocaleString("en-US")}</b>{" "}
                <span style={{ color: "var(--v-muted-2)" }}>
                  {i === 0 ? "of traffic" : percent(share)}
                </span>
              </span>
            </div>

            <div className="v-funnel__track">
              <div
                className="v-funnel__bar"
                style={{
                  width: `${Math.max(share * 100, stage.value > 0 ? 1.5 : 0)}%`,
                  background: RAMP[Math.min(i, RAMP.length - 1)],
                  animationDelay: `${i * 130}ms`,
                }}
              />
            </div>

            {previous !== null && dropped > 0 ? (
              <div className="v-funnel__drop">
                −{dropped.toLocaleString("en-US")} lost here ({percent(dropRate, 0)} drop-off)
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
