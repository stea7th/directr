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
        <p className="marketing-eyebrow">Your creative director, built around you.</p>
        <h1>Know exactly what<br /><span>to film next.</span></h1>
        <p className="marketing-hero__copy">Directr learns your content, your taste, and your goals — then tells you what to make and exactly how to film it.</p>
        <div className="marketing-hero__actions"><Link href="/login?next=%2Fonboarding" className="directr-button directr-button--accent">Get your direction →</Link><a href="#how-it-works" className="marketing-text-link">See how it works</a></div>
        <span className="marketing-hero__note">Three free directions. No production team required.</span>
      </section>

      <section id="how-it-works" className="marketing-demo-section">
        <div className="marketing-section-heading"><span className="section-kicker">The idea is the easy part</span><h2>A rough thought.<br />A direction you can actually film.</h2></div>
        <HomeDemo />
      </section>

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

      <section className="marketing-close"><span className="section-kicker">Your Director is waiting</span><h2>Stop deciding.<br /><span>Start filming.</span></h2><Link href="/login?next=%2Fonboarding" className="directr-button directr-button--accent">Get your direction →</Link></section>

      <footer className="marketing-footer"><Link href="/" className="logo">directr<span className="dot">.</span></Link><span>Your creative director, built around you.</span><Link href="/pricing">Pricing</Link></footer>
    </div>
  );
}
