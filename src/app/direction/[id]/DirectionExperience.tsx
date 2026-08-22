"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatorDNAIndicator from "@/components/CreatorDNAIndicator";
import { type CreatorDNA, type CreativeDirection } from "@/lib/directr";
import { fetchDirections, readLocalDirections, writeLocalCreatorDNA } from "@/lib/directr-client";

export default function DirectionExperience({ id, profile }: { id: string; profile: CreatorDNA }) {
  const [direction, setDirection] = useState<CreativeDirection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAlternates, setShowAlternates] = useState(false);

  useEffect(() => {
    let active = true;
    writeLocalCreatorDNA(profile);
    const cached = readLocalDirections(profile.userId).find((item) => item.id === id);
    if (cached) {
      setDirection(cached);
      setLoading(false);
    }

    void fetchDirections(profile.userId || "").then((items) => {
      if (!active) return;
      const found = items.find((item) => item.id === id);
      if (found) setDirection(found);
      setLoading(false);
    });

    return () => { active = false; };
  }, [id, profile]);

  if (loading) {
    return <div className="product-shell direction-loading">Getting your direction ready<span className="thinking-dots" /></div>;
  }

  if (!direction) {
    return (
      <div className="product-shell empty-state">
        <h1>That direction is not here.</h1>
        <p>It may be saved on the device where you created it.</p>
        <Link className="directr-button directr-button--accent" href="/library">Open your Library</Link>
      </div>
    );
  }

  return (
    <article className="product-shell direction-shell">
      <div className="product-topline">
        <Link href="/library" className="subtle-back">← Your Library</Link>
        <CreatorDNAIndicator score={profile.completionScore} />
      </div>

      <header className="direction-header">
        <p className="section-kicker">Your direction is ready</p>
        <h1>{direction.concept}</h1>
        <div className="direction-header__meta">
          <span>{direction.format}</span>
          <span>{direction.estimatedDuration} sec</span>
          <span>{direction.shots.length} shots</span>
          <span>~{direction.estimatedFilmTime} min to film</span>
        </div>
        <Link href={`/film/${direction.id}`} className="directr-button directr-button--accent direction-header__cta">
          Start filming <span aria-hidden="true">→</span>
        </Link>
      </header>

      <section className="direction-section">
        <div className="direction-section__label">The angle</div>
        <p className="direction-angle">{direction.angle}</p>
      </section>

      <section className="direction-section direction-section--hook">
        <div className="direction-section__label">The hook <span>Directr&apos;s pick</span></div>
        <blockquote>“{direction.recommendedHook}”</blockquote>
        {direction.alternateHooks.length > 0 && (
          <>
            <button type="button" className="alternate-toggle" onClick={() => setShowAlternates(!showAlternates)}>
              {showAlternates ? "Hide other directions" : "See other directions"}
            </button>
            {showAlternates && (
              <div className="alternate-hooks">
                {direction.alternateHooks.map((hook) => <p key={hook}>“{hook}”</p>)}
              </div>
            )}
          </>
        )}
      </section>

      <section className="direction-section">
        <div className="direction-section__label">Why this works</div>
        <p className="direction-reasoning">{direction.whyThisWorks}</p>
      </section>

      {direction.videoFlow.length > 0 && (
        <section className="direction-section">
          <div className="direction-section__label">Video flow</div>
          <div className="direction-timeline">
            {direction.videoFlow.map((beat, index) => (
              <div className="timeline-beat" key={`${beat.start}-${index}`}>
                <span className="timeline-beat__time">{beat.start}–{beat.end}s</span>
                <span className="timeline-beat__marker" aria-hidden="true" />
                <p>{beat.instruction}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="direction-section">
        <div className="direction-section__label">Shot list <span>{direction.shots.length} total</span></div>
        <div className="direction-shots">
          {direction.shots.map((shot) => (
            <div className={`direction-shot ${shot.completed ? "is-complete" : ""}`} key={shot.order}>
              <span className="direction-shot__number">{String(shot.order).padStart(2, "0")}</span>
              <div>
                <strong>{shot.title}</strong>
                <p>{shot.description}</p>
                {shot.framing && <span>{shot.framing}</span>}
              </div>
              <span className="direction-shot__duration">{shot.duration}s</span>
            </div>
          ))}
        </div>
        <p className="shot-coaching">You only need {direction.shots.length} shots. Don&apos;t overfilm this.</p>
      </section>

      {direction.delivery.length > 0 && (
        <section className="direction-section">
          <div className="direction-section__label">Delivery</div>
          <div className="delivery-list">
            {direction.delivery.map((note) => <p key={note}>{note}</p>)}
          </div>
        </section>
      )}

      {direction.onScreenText.length > 0 && (
        <section className="direction-section">
          <div className="direction-section__label">On-screen text</div>
          <div className="screen-text-list">
            {direction.onScreenText.map((item, index) => (
              <div key={`${item.text}-${index}`}><span>{item.timestamp}</span><p>{item.text}</p></div>
            ))}
          </div>
        </section>
      )}

      {direction.caption && (
        <section className="direction-section">
          <div className="direction-section__label">Caption</div>
          <p className="direction-caption">{direction.caption}</p>
        </section>
      )}

      {direction.postingNote && (
        <section className="direction-section">
          <div className="direction-section__label">Posting note</div>
          <p className="direction-reasoning">{direction.postingNote}</p>
        </section>
      )}

      <footer className="direction-footer">
        <div><strong>Directr already thought it through.</strong><span>{direction.shots.length} shots. {direction.estimatedDuration} seconds. Go film it.</span></div>
        <Link href={`/film/${direction.id}`} className="directr-button directr-button--accent">Start filming →</Link>
      </footer>
    </article>
  );
}
