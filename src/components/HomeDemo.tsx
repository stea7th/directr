"use client";

import { useEffect, useState } from "react";

const directions = [
  {
    label: "Personal brand",
    thought: "I wasted so much time trying to look successful.",
    hook: "I wasted a year trying to look successful instead of becoming useful.",
    angle: "The performance of success",
    format: "Talking head",
    duration: "32 sec",
    shots: ["You, direct to camera", "Walking out of your office", "Close-up of your laptop", "Back to camera"],
    delivery: "Say it like you’re admitting something. Not teaching.",
  },
  {
    label: "Fitness",
    thought: "My workouts got shorter and my results got better.",
    hook: "The gym started working when I stopped making it my whole personality.",
    angle: "Less gym. Better results.",
    format: "Voiceover",
    duration: "26 sec",
    shots: ["Loading your first set", "One clean working rep", "Leaving the gym"],
    delivery: "Calm. Matter-of-fact. No transformation speech.",
  },
  {
    label: "Real estate",
    thought: "This house looked perfect until I walked into the kitchen.",
    hook: "Every listing photo hid the one thing I noticed in ten seconds.",
    angle: "What the listing didn’t show",
    format: "Walkthrough",
    duration: "29 sec",
    shots: ["Outside the front door", "Slow kitchen walkthrough", "Reveal the actual problem"],
    delivery: "Let the camera find it before you explain it.",
  },
] as const;

export default function HomeDemo() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const direction = directions[active];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActive((value) => (value + 1) % directions.length), 8200);
    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <div className="director-preview" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="director-preview__bar"><span className="director-preview__wordmark">directr<span>.</span></span><span className="director-preview__signal"><i /> Your direction is ready</span></div>
      <div className="director-preview__tabs" role="tablist" aria-label="Example creator">
        {directions.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)}>{item.label}</button>)}
      </div>
      <div className="director-preview__body" key={direction.label}>
        <div className="director-preview__thought"><span>Your rough thought</span><p>“{direction.thought}”</p></div>
        <div className="director-preview__result"><div className="director-preview__result-head"><span>Film this</span><span>{direction.format} · {direction.duration}</span></div><h3>{direction.angle}</h3><blockquote>“{direction.hook}”</blockquote></div>
        <div className="director-preview__shots"><div className="director-preview__shots-head"><span>Your shots</span><span>{direction.shots.length} total</span></div>{direction.shots.map((shot, index) => <div className="director-shot" key={shot}><span>{String(index + 1).padStart(2, "0")}</span><p>{shot}</p><i /></div>)}</div>
        <div className="director-preview__note"><span>Director&apos;s note</span><p>{direction.delivery}</p></div>
      </div>
    </div>
  );
}
