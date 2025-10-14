// app/page.tsx
import Link from 'next/link';
import GenerateBox from '@/components/GenerateBox';

export default function Page() {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h2 style={styles.title}>Type what you want or upload a file</h2>
        <div style={styles.generateWrap}>
          <GenerateBox />
        </div>
      </section>

      <section style={styles.cardsRow}>
        <FeatureCard
          title="Create"
          subtitle="Upload → get captioned clips"
          href="/"
        />
        <FeatureCard
          title="Clipper"
          subtitle="Auto-find hooks & moments"
          href="/clipper"
        />
        <FeatureCard
          title="Planner"
          subtitle="Plan posts & deadlines"
          href="/planner"
        />
      </section>
    </main>
  );
}

/** ---------- Small presentational card ---------- */
function FeatureCard({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={href} style={styles.cardLink}>
      <div style={styles.card}>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardSubtitle}>{subtitle}</div>
      </div>
    </Link>
  );
}

/** ---------- Styles (inline to avoid CSS file hopping) ---------- */
const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 980,
    margin: '0 auto',
    padding: '40px 24px 80px',
    color: '#fff',
  },
  hero: {
    margin: '20px 0 28px',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 18px',
    letterSpacing: 0.2,
  },
  generateWrap: {
    // GenerateBox renders its own textarea, file input, and button.
    // We just give it a nice container width.
    maxWidth: 960,
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 18,
    marginTop: 28,
  },
  cardLink: {
    textDecoration: 'none',
  },
  card: {
    background: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    padding: '18px 18px 16px',
    transition: 'transform 120ms ease, border-color 120ms ease',
  },
  cardTitle: {
    fontWeight: 700,
    marginBottom: 6,
    color: '#fff',
  },
  cardSubtitle: {
    color: '#a7a7a7',
    fontSize: 14,
    lineHeight: 1.4,
  },
};
