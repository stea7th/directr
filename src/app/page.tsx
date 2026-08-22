import Link from "next/link";
import HomeDemo from "@/components/HomeDemo";

const before = [
  "I should post today.",
  "What do I even talk about?",
  "Is this hook stupid?",
  "How should I film it?",
  "Do I need B-roll?",
  "I’ll figure it out tomorrow.",
];

const coachNotes = [
  "You’re forcing the hook.",
  "This topic is too broad.",
  "Don’t film ten shots. You need three.",
  "You already made this point last week.",
];

export default function Home() {
  return (
    <div className="marketing-shell">
      <section className="marketing-hero">
        <div className="marketing-hero__ambient" aria-hidden="true"><span /><span /><span /></div>
        <p className="marketing-eyebrow"><span className="marketing-live-dot" /> Your creative director is ready.</p>
        <h1>Know exactly what<br /><span>to film next.</span></h1>
        <p className="marketing-hero__copy">Directr learns your content, your taste, and your goals — then tells you what to make and exactly how to film it.</p>
        <div className="marketing-hero__actions"><Link href="/login?mode=signup&next=%2Fonboarding" className="directr-button directr-button--accent marketing-primary-cta">Get your first direction →</Link><a href="#how-it-works" className="marketing-text-link">See it in action <span aria-hidden="true">↓</span></a></div>
        <span className="marketing-hero__note">Three directions free. No credit card. No guessing.</span>
        <div className="marketing-hero__proof" aria-label="How Directr helps"><span>One idea</span><i>→</i><span>One sharp hook</span><i>→</i><span>Four shots</span><i>→</i><span>Go film it</span></div>
      </section>

      <section id="how-it-works" className="marketing-demo-section">
        <div className="marketing-section-heading"><span className="section-kicker">See the difference in ten seconds</span><h2>A rough thought.<br />A direction you can actually film.</h2><p>Pick a creator. Watch Directr decide the angle, opening line, format, shots, and delivery.</p></div>
        <HomeDemo />
        <div className="marketing-demo-cta"><Link href="/login?mode=signup&next=%2Fonboarding">Get a direction built around you <span aria-hidden="true">→</span></Link></div>
      </section>

      <section className="marketing-film-section"><div className="marketing-section-heading"><span className="section-kicker">A director in your pocket</span><h2>When it&apos;s time to film,<br /><span>you&apos;ll know every shot.</span></h2><p>No shot list buried in a document. Film Mode puts one clear instruction on screen, then gets out of your way.</p></div><div className="marketing-film-preview"><div className="marketing-film-device"><div className="marketing-film-device__top"><span>DIRECTR</span><span>SHOT 01 / 04</span></div><div className="marketing-film-device__frame"><span className="marketing-frame-corner marketing-frame-corner--tl"/><span className="marketing-frame-corner marketing-frame-corner--tr"/><span className="marketing-frame-corner marketing-frame-corner--bl"/><span className="marketing-frame-corner marketing-frame-corner--br"/><p>Main A-roll</p><span>Chest-up · Eye level · 8 sec</span></div><blockquote>“I wasted a year trying to look successful instead of becoming useful.”</blockquote><div className="marketing-film-device__record"><span /> Got the shot</div></div><div className="marketing-film-copy"><p>One shot at a time.</p><p>Delivery notes that actually help.</p><p>Everything you need. Nothing you don&apos;t.</p><strong>Four shots. Thirty seconds. Done.</strong></div></div></section>

      <section className="marketing-before-after">
        <div className="marketing-section-heading"><span className="section-kicker">The difference</span><h2>Stop turning every post<br />into a production.</h2></div>
        <div className="before-after-grid">
          <div className="before-column"><span>Before Directr</span>{before.map((line) => <p key={line}>{line}</p>)}</div>
          <div className="after-column"><span>After Directr</span><h3>Film this.</h3><p>One direction.<br />One hook.<br />Four shots.<br />Thirty-two seconds.</p><Link href="/login?next=%2Fonboarding">Start filming →</Link></div>
        </div>
      </section>

      <section className="marketing-dna-section">
        <div className="marketing-dna-copy"><span className="section-kicker">Creator DNA</span><h2>Generic AI knows content.<br /><span>Directr learns yours.</span></h2><p>Your voice. Your taste. What you are trying to become known for. What you actually enjoy making. The more Directr understands, the less you have to explain.</p><Link href="/login?next=%2Fonboarding">Build your Creator DNA →</Link></div>
        <div className="marketing-dna-visual"><div className="dna-visual-header"><span>Creator DNA</span><span>78% understood</span></div><div className="dna-visual-track"><span /></div>{[["Voice", "Understated. Direct. Human."], ["Topics", "Business, lifestyle, personal stories"], ["Format", "Talking head + cinematic cutaways"], ["Taste", "No guru energy. No forced hooks."], ["Audience", "People building something real"]].map(([label, value]) => <div className="dna-visual-row" key={label}><span>{label}</span><p>{value}</p></div>)}</div>
      </section>

      <section className="marketing-coach-section"><div className="marketing-section-heading"><span className="section-kicker">Your coach has standards</span><h2>Someone should tell you<br />when the content isn’t good.</h2><p>Directr does not exist to validate every idea. It exists to make the idea better.</p></div><div className="coach-notes">{coachNotes.map((note) => <div key={note}><span aria-hidden="true">—</span><p>{note}</p></div>)}</div></section>

      <section className="marketing-close"><span className="section-kicker">Your Director is waiting</span><h2>Stop deciding.<br /><span>Start filming.</span></h2><Link href="/login?mode=signup&next=%2Fonboarding" className="directr-button directr-button--accent marketing-primary-cta">Get your first direction →</Link><span className="marketing-hero__note">Start free. Know what to film today.</span></section>

      <footer className="marketing-footer"><Link href="/" className="logo">directr<span className="dot">.</span></Link><span>Your creative director, built around you.</span><Link href="/pricing">Pricing</Link></footer>
    </div>
  );
}
