"use client";

import Link from "next/link";
import { useState } from "react";

type ReferenceAnalysis = { structure: string; hookPattern: string; pacing: string; originalAngle: string; suggestedIdea: string; differentiation: string };
type DraftReview = { verdict: string; summary: string; hook: string; pacing: string; clarity: string; delivery: string; cuts: string[]; nextMove: string };

export default function CreativeTools() {
  const [tool, setTool] = useState<"reference" | "review">("reference");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [transcript, setTranscript] = useState("");
  const [reference, setReference] = useState<ReferenceAnalysis | null>(null);
  const [review, setReview] = useState<DraftReview | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true); setError("");
    try {
      const response = await fetch(tool === "reference" ? "/api/reference" : "/api/review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tool === "reference" ? { url, notes } : { transcript }),
      });
      const data = await response.json() as { error?: string; analysis?: ReferenceAnalysis; review?: DraftReview };
      if (!response.ok) throw new Error(data.error || "Directr could not finish that analysis.");
      if (tool === "reference" && data.analysis) setReference(data.analysis);
      if (tool === "review" && data.review) setReview(data.review);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); }
    finally { setWorking(false); }
  }

  return (
    <section className="creative-tools">
      <div className="creative-tools__switch" role="tablist" aria-label="Creative tools">
        <button type="button" role="tab" aria-selected={tool === "reference"} onClick={() => { setTool("reference"); setError(""); }}>Make a format yours</button>
        <button type="button" role="tab" aria-selected={tool === "review"} onClick={() => { setTool("review"); setError(""); }}>Review a draft</button>
      </div>
      {tool === "reference" ? (
        <form className="creative-tools__form" onSubmit={submit}>
          <h2>Borrow the structure. Not the idea.</h2>
          <p>Add a video you like and describe what caught your attention. Directr uses your description and Creator DNA; it does not claim to watch the linked video.</p>
          <input className="directr-input" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://instagram.com/reel/..." />
          <textarea className="directr-textarea" required minLength={20} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="The first line is quiet and personal, then it cuts between their desk and a walk outside..." />
          <button type="submit" disabled={working || notes.trim().length < 20} className="directr-button directr-button--quiet">{working ? "Finding the underlying structure…" : "Make this format mine →"}</button>
          {reference && <div className="creative-tools__result"><span className="section-kicker">Your original direction</span><h3>{reference.originalAngle}</h3><p>{reference.differentiation}</p><dl><div><dt>Structure</dt><dd>{reference.structure}</dd></div><div><dt>Hook pattern</dt><dd>{reference.hookPattern}</dd></div><div><dt>Pacing</dt><dd>{reference.pacing}</dd></div></dl><Link className="directr-button directr-button--accent" href={`/create?idea=${encodeURIComponent(reference.suggestedIdea)}`}>Build this direction →</Link></div>}
        </form>
      ) : (
        <form className="creative-tools__form" onSubmit={submit}>
          <h2>Should you post it?</h2>
          <p>Paste the actual transcript. Directr will tell you what stays, what goes, and whether the opening is doing its job.</p>
          <textarea className="directr-textarea" required minLength={40} rows={7} value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Paste the words from your draft here..." />
          <button type="submit" disabled={working || transcript.trim().length < 40} className="directr-button directr-button--quiet">{working ? "Reviewing the draft…" : "Give me the honest review →"}</button>
          {review && <div className="creative-tools__result"><span className="section-kicker">{review.verdict}</span><h3>{review.summary}</h3><dl>{[["Hook", review.hook], ["Pacing", review.pacing], ["Clarity", review.clarity], ["Delivery", review.delivery]].map(([title, detail]) => <div key={title}><dt>{title}</dt><dd>{detail}</dd></div>)}</dl>{review.cuts.length > 0 && <div className="creative-tools__cuts"><strong>Cut this</strong>{review.cuts.slice(0, 3).map((cut) => <p key={cut}>{cut}</p>)}</div>}<p className="creative-tools__next">{review.nextMove}</p></div>}
        </form>
      )}
      {error && <p className="directr-error" role="alert">{error}</p>}
    </section>
  );
}
