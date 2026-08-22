"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  title?: string;
  compact?: boolean;
};

export default function IdeaComposer({ title = "Have something in your head?", compact = false }: Props) {
  const router = useRouter();
  const [idea, setIdea] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idea.trim()) return;
    router.push(`/create?idea=${encodeURIComponent(idea.trim())}`);
  }

  return (
    <section className={`idea-composer ${compact ? "idea-composer--compact" : ""}`}>
      <div className="idea-composer__intro">
        <h2>{title}</h2>
        {!compact && <p>Give Directr the rough thought. It will make the creative decisions.</p>}
      </div>
      <form className="idea-composer__form" onSubmit={submit}>
        <input
          aria-label="Your rough content idea"
          placeholder="I want to talk about why most people quit ecommerce."
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          maxLength={1200}
        />
        <button className="directr-button directr-button--accent" type="submit" disabled={!idea.trim()}>
          Direct it <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  );
}
