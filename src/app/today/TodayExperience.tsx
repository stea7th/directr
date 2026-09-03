"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatorDNAIndicator from "@/components/CreatorDNAIndicator";
import IdeaComposer from "@/components/IdeaComposer";
import { fallbackRecommendations, type CreatorDNA, type Recommendation } from "@/lib/directr";
import { readLocalDirections, writeLocalCreatorDNA } from "@/lib/directr-client";

function cacheKey(profile: CreatorDNA): string {
  return `directr:recommendations:${profile.userId}:${new Date().toISOString().slice(0, 10)}:${profile.completionScore}:${profile.niche}`;
}

export default function TodayExperience({ profile }: { profile: CreatorDNA }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(fallbackRecommendations(profile));
  const [thinking, setThinking] = useState(true);

  useEffect(() => {
    let active = true;
    writeLocalCreatorDNA(profile);

    async function load() {
      try {
        const cached = window.sessionStorage.getItem(cacheKey(profile));
        if (cached) {
          const ideas = JSON.parse(cached) as Recommendation[];
          if (active && Array.isArray(ideas) && ideas.length) {
            setRecommendations(ideas);
            setThinking(false);
            return;
          }
        }

        const history = readLocalDirections(profile.userId);
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: history.slice(0, 8) }),
        });

        if (!response.ok) throw new Error("Could not load today's direction.");
        const result = await response.json() as { recommendations?: Recommendation[] };
        if (!active) return;

        if (result.recommendations?.length) {
          setRecommendations(result.recommendations.slice(0, 3));
          window.sessionStorage.setItem(cacheKey(profile), JSON.stringify(result.recommendations));
        }
      } catch {
        if (active) setRecommendations(fallbackRecommendations(profile, readLocalDirections(profile.userId)));
      } finally {
        if (active) setThinking(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [profile]);

  const primary = recommendations[0];
  const alternatives = recommendations.slice(1, 3);

  return (
    <div className="product-shell today-shell">
      <div className="product-topline">
        <span>Today</span>
        <CreatorDNAIndicator score={profile.completionScore} />
      </div>

      <section className="today-heading">
        <p className="section-kicker">Your creative director</p>
        <h1>Film this today.</h1>
        <p>Directr made the call. You can override it, but you do not need to decide from scratch.</p>
      </section>

      <section className="recommendation-list" aria-label="Directr's recommendation for today">
        <div className="recommendation-list__heading">
          <span>Directr&apos;s pick</span>
          {thinking && <span className="thinking-inline">Directr is choosing the strongest angle<span className="thinking-dots" /></span>}
        </div>

        {primary && (
          <article className="recommendation-item">
            <div className="recommendation-item__index">01</div>
            <div className="recommendation-item__body">
              <div className="recommendation-item__meta">
                <span>{primary.format}</span>
                <span>{primary.duration} sec</span>
                <span>~{primary.filmingMinutes} min to film</span>
              </div>
              <h2>{primary.concept}</h2>
              <p className="recommendation-item__hook">“{primary.hook}”</p>
              <p className="recommendation-item__reason"><span>Why Directr chose it:</span> {primary.reason}</p>
            </div>
            <Link
              className="recommendation-item__action"
              href={`/create?idea=${encodeURIComponent(primary.concept)}`}
            >
              Build direction <span aria-hidden="true">→</span>
            </Link>
          </article>
        )}
      </section>

      {alternatives.length > 0 && (
        <section className="recommendation-list" aria-label="Alternative directions">
          <div className="recommendation-list__heading">
            <span>If you want a different angle</span>
            <span>Optional — Directr still recommends #1</span>
          </div>

          {alternatives.map((recommendation, index) => (
            <article key={recommendation.id} className="recommendation-item" style={{ animationDelay: `${index * 75}ms` }}>
              <div className="recommendation-item__index">{String(index + 2).padStart(2, "0")}</div>
              <div className="recommendation-item__body">
                <div className="recommendation-item__meta">
                  <span>{index === 0 ? "Safer" : "More experimental"}</span>
                  <span>{recommendation.format}</span>
                  <span>{recommendation.duration} sec</span>
                </div>
                <h2>{recommendation.concept}</h2>
                <p className="recommendation-item__hook">“{recommendation.hook}”</p>
                <p className="recommendation-item__reason"><span>Why this:</span> {recommendation.reason}</p>
              </div>
              <Link
                className="recommendation-item__action"
                href={`/create?idea=${encodeURIComponent(recommendation.concept)}`}
              >
                Choose this <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </section>
      )}

      <IdeaComposer />
    </div>
  );
}
