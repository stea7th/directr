"use client";

import { useEffect, useState } from "react";

const examples = [
  {
    label: "Personal brand",
    thought: "I want to talk about how I wasted time trying to look successful.",
    concept: "Looking successful vs. becoming useful",
    hook: "I wasted a year trying to look successful instead of becoming useful.",
    format: "Talking head + one cutaway",
    shots: 4,
    duration: 32,
    delivery: "Slow down. Leave the first take imperfect.",
  },
  {
    label: "Fitness",
    thought: "People keep asking why my workouts got way shorter.",
    concept: "Why I stopped treating the gym like a second job",
    hook: "My best progress started when I stopped living in the gym.",
    format: "Voiceover + training footage",
    shots: 3,
    duration: 26,
    delivery: "Matter-of-fact. No transformation speech.",
  },
  {
    label: "Real estate",
    thought: "I toured a nice house but one detail ruined the whole thing.",
    concept: "The detail beautiful listings hide",
    hook: "This house looked perfect until I stood in the kitchen for ten seconds.",
    format: "Walkthrough + voiceover",
    shots: 4,
    duration: 29,
    delivery: "Let the reveal land before you explain it.",
  },
];

export default function HomeDemo() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const example = examples[index];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % examples.length), 7200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className="home-demo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="home-demo__tabs" aria-label="Direction examples">
        {examples.map((item, itemIndex) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setIndex(itemIndex)}
            className={itemIndex === index ? "is-active" : ""}
            aria-pressed={itemIndex === index}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="home-demo__workspace" key={example.label}>
        <section className="home-demo__thought">
          <span className="section-kicker">Your rough thought</span>
          <p>“{example.thought}”</p>
          <span className="home-demo__uncertainty">You do not need to know how to film it yet.</span>
        </section>

        <div className="home-demo__transfer" aria-hidden="true">
          <span />
          <span>→</span>
          <span />
        </div>

        <section className="home-demo__direction">
          <span className="section-kicker">Directr&apos;s direction</span>
          <h3>{example.concept}</h3>
          <div className="home-demo__hook">
            <span>Opening line</span>
            <p>“{example.hook}”</p>
          </div>
          <div className="home-demo__details">
            <span>{example.format}</span>
            <span>{example.shots} shots</span>
            <span>{example.duration} sec</span>
          </div>
          <div className="home-demo__delivery">{example.delivery}</div>
        </section>
      </div>
    </div>
  );
}
