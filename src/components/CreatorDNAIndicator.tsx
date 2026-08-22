import Link from "next/link";

export default function CreatorDNAIndicator({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <Link href="/dna" className="dna-indicator" aria-label={`Creator DNA ${safeScore}% complete`}>
      <span className="dna-indicator__label">Creator DNA</span>
      <span className="dna-indicator__track" aria-hidden="true">
        <span style={{ width: `${safeScore}%` }} />
      </span>
      <span className="dna-indicator__score">{safeScore}%</span>
    </Link>
  );
}
