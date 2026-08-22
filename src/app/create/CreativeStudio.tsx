"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreatorDNAIndicator from "@/components/CreatorDNAIndicator";
import CreativeTools from "./CreativeTools";
import { type CreatorDNA, type CreativeDirection } from "@/lib/directr";
import { readLocalDirections, saveLocalDirection, writeLocalCreatorDNA } from "@/lib/directr-client";

const stages = [
  "Finding the strongest angle",
  "Building the opening line",
  "Planning the shots",
  "Tightening the pacing",
];

export default function CreativeStudio({ profile }: { profile: CreatorDNA }) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [thinking, setThinking] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    writeLocalCreatorDNA(profile);
    const initial = new URLSearchParams(window.location.search).get("idea");
    if (initial) setIdea(initial);
  }, [profile]);

  useEffect(() => {
    if (!thinking) return;
    const timer = window.setInterval(() => setStage((current) => (current + 1) % stages.length), 1650);
    return () => window.clearInterval(timer);
  }, [thinking]);

  async function directIdea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idea.trim() || thinking) return;
    setThinking(true);
    setError("");
    setLimitReached(false);
    setStage(0);

    try {
      const history = readLocalDirections(profile.userId);
      const response = await fetch("/api/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), history: history.slice(0, 6) }),
      });

      const result = await response.json() as {
        success?: boolean;
        error?: string;
        direction?: CreativeDirection;
      };

      if (response.status === 402) {
        setLimitReached(true);
        setError("You have used your three free directions. Upgrade to keep your Director working.");
        return;
      }

      if (!response.ok || !result.direction) {
        throw new Error(result.error || "Directr could not build that direction.");
      }

      saveLocalDirection(result.direction, profile.userId);
      router.push(`/direction/${result.direction.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something interrupted your direction.");
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="product-shell create-shell">
      <div className="product-topline">
        <span>Create</span>
        <CreatorDNAIndicator score={profile.completionScore} />
      </div>

      <section className="create-intro">
        <p className="section-kicker">One idea. One clear direction.</p>
        <h1>What are you thinking about?</h1>
        <p>It does not need to be polished. Directr will decide how to make it worth filming.</p>
      </section>

      <form className="create-workspace" onSubmit={directIdea}>
        <textarea
          className="create-workspace__input"
          placeholder="I want to talk about how I spent a year trying to look successful instead of becoming useful."
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          maxLength={1200}
          rows={5}
          disabled={thinking}
          aria-label="Your rough content idea"
        />

        <div className="create-workspace__footer">
          <span>{idea.length > 0 ? `${idea.length} / 1200` : "A rough thought is enough."}</span>
          <button type="submit" className="directr-button directr-button--accent" disabled={!idea.trim() || thinking}>
            {thinking ? "Directr is thinking…" : "Build the direction →"}
          </button>
        </div>
      </form>

      {thinking && (
        <div className="creative-thinking" role="status" aria-live="polite">
          <span className="creative-thinking__pulse" />
          <div>
            <strong>Directr is thinking through your idea.</strong>
            <span>{stages[stage]}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="create-error" role="alert">
          <p>{error}</p>
          {limitReached && <Link href="/pricing" className="directr-button directr-button--accent">See Directr Pro</Link>}
        </div>
      )}

      <div className="create-context">
        <div>
          <span>Directr already knows</span>
          <strong>{profile.niche} · {profile.preferredFormats.slice(0, 2).join(" + ")}</strong>
        </div>
        <Link href="/dna">Update Creator DNA <span aria-hidden="true">→</span></Link>
      </div>

      <CreativeTools />
    </div>
  );
}
