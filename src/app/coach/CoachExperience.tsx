"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatorDNAIndicator from "@/components/CreatorDNAIndicator";
import { type CreatorDNA } from "@/lib/directr";
import { readLocalDirections, writeLocalCreatorDNA } from "@/lib/directr-client";

const prompts = [
  "What should I improve this week?",
  "Why does my content feel boring?",
  "Am I posting too broadly?",
  "What should I stop doing?",
  "What should I film tomorrow?",
];

type Coaching = {
  assessment: string;
  observations: string[];
  adjustments: string[];
  nextMove: string;
};

export default function CoachExperience({ profile }: { profile: CreatorDNA }) {
  const [question, setQuestion] = useState("");
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    writeLocalCreatorDNA(profile);
    setHistoryCount(readLocalDirections(profile.userId).length);
  }, [profile]);

  async function ask(text: string) {
    const prompt = text.trim();
    if (!prompt || thinking) return;
    setQuestion(prompt);
    setThinking(true);
    setError("");

    try {
      const history = readLocalDirections(profile.userId);
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, history: history.slice(0, 12) }),
      });
      const result = await response.json() as { coaching?: Coaching; error?: string };
      if (!response.ok || !result.coaching) throw new Error(result.error || "Coach could not answer that.");
      setCoaching(result.coaching);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Coach could not answer that yet.");
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="product-shell coach-shell">
      <div className="product-topline"><span>Coach</span><CreatorDNAIndicator score={profile.completionScore} /></div>

      <section className="coach-intro">
        <p className="section-kicker">Creative direction without the polite version</p>
        <h1>Ask the person directing your content.</h1>
        <p>Directr answers around your voice, goals, and the {historyCount ? `${historyCount} direction${historyCount === 1 ? "" : "s"} you have actually created` : "Creator DNA you have shared"}.</p>
      </section>

      <div className="coach-prompts">
        {prompts.map((prompt) => (
          <button type="button" key={prompt} className={question === prompt ? "is-active" : ""} onClick={() => void ask(prompt)} disabled={thinking}>
            {prompt}
          </button>
        ))}
      </div>

      <form className="coach-composer" onSubmit={(event) => { event.preventDefault(); void ask(question); }}>
        <input
          placeholder="What are you overthinking?"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          aria-label="Ask your creative coach"
        />
        <button type="submit" className="directr-button directr-button--accent" disabled={!question.trim() || thinking}>
          {thinking ? "Thinking…" : "Ask Directr →"}
        </button>
      </form>

      {thinking && <p className="coach-thinking">Directr is looking at your actual creative direction<span className="thinking-dots" /></p>}
      {error && <p className="directr-error" role="alert">{error}</p>}

      {coaching ? (
        <article className="coaching-result">
          <div className="coaching-result__assessment"><span>Directr&apos;s read</span><p>{coaching.assessment}</p></div>

          {coaching.observations.length > 0 && (
            <section className="coaching-result__section"><h2>What I&apos;m noticing</h2>{coaching.observations.slice(0, 3).map((item) => <p key={item}>{item}</p>)}</section>
          )}

          {coaching.adjustments.length > 0 && (
            <section className="coaching-result__section"><h2>Change this</h2>{coaching.adjustments.slice(0, 3).map((item) => <p key={item}>{item}</p>)}</section>
          )}

          <div className="coaching-result__next"><span>Your next move</span><p>{coaching.nextMove}</p><Link href="/create">Build that direction →</Link></div>
        </article>
      ) : !thinking && (
        <aside className="coach-empty-note">
          {historyCount === 0 ? (
            <>I know your taste, but I have not seen you make anything yet. <Link href="/create">Create your first direction</Link> and my feedback gets more useful.</>
          ) : <>Ask a question above. You will get a decision, not a motivational speech.</>}
        </aside>
      )}

      <aside className="review-preview"><div><span className="section-kicker">Coming later</span><h2>Should you post it?</h2><p>Draft review will eventually critique your hook, pacing, clarity, and delivery. Upload and transcript analysis are not available yet.</p></div><span>Draft review · Coming soon</span></aside>
    </div>
  );
}
