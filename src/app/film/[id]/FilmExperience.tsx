"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type CreatorDNA, type CreativeDirection } from "@/lib/directr";
import { fetchDirections, readLocalDirections, saveLocalDirection, syncDirection } from "@/lib/directr-client";

export default function FilmExperience({ id, profile }: { id: string; profile: CreatorDNA }) {
  const [direction, setDirection] = useState<CreativeDirection | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [capturedName, setCapturedName] = useState("");
  const [loading, setLoading] = useState(true);
  const captureRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.classList.add("film-active");
    return () => document.body.classList.remove("film-active");
  }, []);

  useEffect(() => {
    let active = true;
    const cached = readLocalDirections(profile.userId).find((item) => item.id === id);
    if (cached) {
      const firstUnfinished = cached.shots.findIndex((shot) => !shot.completed);
      setIndex(firstUnfinished >= 0 ? firstUnfinished : 0);
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

  function updateDirection(next: CreativeDirection) {
    setDirection(next);
    saveLocalDirection(next, profile.userId);
    void syncDirection(next);
  }

  function completeShot() {
    if (!direction) return;
    const shots = direction.shots.map((shot, shotIndex) => shotIndex === index ? { ...shot, completed: true } : shot);
    const isLast = index >= shots.length - 1;
    const next: CreativeDirection = { ...direction, shots, status: isLast ? "filmed" : "filming" };
    updateDirection(next);
    setCapturedName("");
    if (isLast) setFinished(true);
    else setIndex(index + 1);
  }

  function captureSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCapturedName(file.name);
  }

  function updateRating(rating: "loved" | "fine" | "hated") {
    if (!direction) return;
    updateDirection({ ...direction, creatorRating: rating });
  }

  if (loading) return <main className="film-shell"><p className="film-status">Loading your shoot…</p></main>;

  if (!direction) {
    return (
      <main className="film-shell film-empty">
        <h1>That shoot is not available here.</h1>
        <Link href="/library">Back to your Library</Link>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="film-shell film-complete">
        <div className="film-complete__mark" aria-hidden="true">✓</div>
        <p className="section-kicker">All {direction.shots.length} shots complete</p>
        <h1>You&apos;re done.</h1>
        <p>You have everything you need. Stop filming.</p>
        <Link href={`/direction/${direction.id}`} className="directr-button directr-button--accent">Review your direction →</Link>
        <div className="film-rating">
          <span>How did making this feel?</span>
          <div>
            {(["loved", "fine", "hated"] as const).map((rating) => (
              <button key={rating} type="button" onClick={() => updateRating(rating)} className={direction.creatorRating === rating ? "is-selected" : ""}>
                {rating === "loved" ? "Loved it" : rating === "fine" ? "Fine" : "Hated it"}
              </button>
            ))}
          </div>
        </div>
        <Link href="/library" className="film-library-link">Back to your Library</Link>
      </main>
    );
  }

  const shot = direction.shots[index];
  const progress = ((index + (shot.completed ? 1 : 0)) / direction.shots.length) * 100;

  return (
    <main className="film-shell">
      <header className="film-header">
        <Link href={`/direction/${direction.id}`} aria-label="Exit Film Mode">←</Link>
        <span>Film Mode</span>
        <span>{String(index + 1).padStart(2, "0")} / {String(direction.shots.length).padStart(2, "0")}</span>
      </header>

      <div className="film-progress"><span style={{ width: `${progress}%` }} /></div>

      <section className="film-shot" key={shot.order}>
        <p className="section-kicker">Shot {shot.order} of {direction.shots.length}</p>
        <h1>{shot.title}</h1>
        <p className="film-shot__description">{shot.description}</p>

        {shot.framing && (
          <div className="film-instruction"><span>Framing</span><p>{shot.framing}</p></div>
        )}

        {shot.dialogue && (
          <div className="film-dialogue"><span>Say</span><blockquote>“{shot.dialogue}”</blockquote></div>
        )}

        {!shot.dialogue && <p className="film-no-dialogue">No dialogue needed.</p>}

        {direction.delivery[0] && (
          <div className="film-instruction"><span>Delivery</span><p>{direction.delivery[0]}</p></div>
        )}

        <span className="film-target">Target: {shot.duration} sec</span>
      </section>

      <footer className="film-controls">
        <input ref={captureRef} className="film-hidden-input" type="file" accept="video/*" capture="environment" onChange={captureSelected} />
        <button type="button" className="film-record" onClick={() => captureRef.current?.click()} aria-label="Record or choose video for this shot">
          <span />
        </button>
        {capturedName && <span className="film-capture-note">Captured on this device. Directr does not upload your footage.</span>}
        <button type="button" className="film-next" onClick={completeShot}>
          {index === direction.shots.length - 1 ? "Got it. Finish shoot →" : "Got it. Next shot →"}
        </button>
        <span className="film-capture-help">Use the record button, or film in your camera app and mark the shot done.</span>
      </footer>
    </main>
  );
}
