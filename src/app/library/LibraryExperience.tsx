"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatorDNAIndicator from "@/components/CreatorDNAIndicator";
import { type CreatorDNA, type CreativeDirection } from "@/lib/directr";
import {
  fetchDirections,
  onLibraryChange,
  readLocalDirections,
  saveLocalDirection,
  syncDirection,
  writeLocalCreatorDNA,
} from "@/lib/directr-client";

type Filter = "all" | "ready" | "filmed" | "posted";

function dateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function statusLabel(direction: CreativeDirection): string {
  if (direction.status === "filming") return "In progress";
  if (direction.status === "filmed") return "Filmed";
  if (direction.status === "posted") return "Posted";
  return "Ready to film";
}

export default function LibraryExperience({ profile }: { profile: CreatorDNA }) {
  const [directions, setDirections] = useState<CreativeDirection[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    writeLocalCreatorDNA(profile);
    setDirections(readLocalDirections(profile.userId));

    async function refresh() {
      const result = await fetchDirections(profile.userId || "");
      if (active) {
        setDirections(result);
        setLoading(false);
      }
    }

    void refresh();
    const unsubscribe = onLibraryChange(() => void refresh());
    return () => { active = false; unsubscribe(); };
  }, [profile]);

  function markPosted(direction: CreativeDirection) {
    const next: CreativeDirection = { ...direction, status: "posted" };
    saveLocalDirection(next, profile.userId);
    void syncDirection(next);
    setDirections((items) => items.map((item) => item.id === direction.id ? next : item));
  }

  const visible = directions.filter((direction) => {
    if (filter === "all") return true;
    if (filter === "ready") return direction.status === "ready" || direction.status === "filming";
    return direction.status === filter;
  });

  return (
    <div className="product-shell library-shell">
      <div className="product-topline"><span>Library</span><CreatorDNAIndicator score={profile.completionScore} /></div>

      <header className="library-header">
        <div><p className="section-kicker">Your creative history</p><h1>Everything worth keeping.</h1></div>
        <Link href="/create" className="directr-button directr-button--accent">New direction →</Link>
      </header>

      {loading && directions.length === 0 ? (
        <div className="library-loading">Finding your directions<span className="thinking-dots" /></div>
      ) : directions.length === 0 ? (
        <section className="empty-state library-empty">
          <span className="empty-state__mark" aria-hidden="true">○</span>
          <h2>Nothing here yet.</h2>
          <p>Film something worth keeping.</p>
          <Link href="/create" className="directr-button directr-button--accent">Create your first direction →</Link>
        </section>
      ) : (
        <>
          <div className="library-filters">
            {(["all", "ready", "filmed", "posted"] as const).map((item) => (
              <button type="button" key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>
                {item === "all" ? "All" : item === "ready" ? "Ready" : item === "filmed" ? "Filmed" : "Posted"}
              </button>
            ))}
          </div>

          <div className="library-list">
            {visible.map((direction) => (
              <article className="library-item" key={direction.id}>
                <Link href={`/direction/${direction.id}`} className="library-item__content">
                  <div className="library-item__top"><span>{dateLabel(direction.createdAt)}</span><span className={`library-status library-status--${direction.status}`}>{statusLabel(direction)}</span></div>
                  <h2>{direction.concept}</h2>
                  <p>“{direction.recommendedHook}”</p>
                  <div className="library-item__meta"><span>{direction.format}</span><span>{direction.estimatedDuration}s</span><span>{direction.shots.length} shots</span></div>
                </Link>
                <div className="library-item__actions">
                  {direction.status === "filmed" && <button type="button" onClick={() => markPosted(direction)}>Mark posted</button>}
                  {direction.status !== "posted" && <Link href={`/film/${direction.id}`}>{direction.status === "filmed" ? "View shoot" : "Film this"} →</Link>}
                </div>
              </article>
            ))}
            {!visible.length && <p className="library-filter-empty">Nothing in this stage yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
