import Link from "next/link";
import HomeDemo from "@/components/HomeDemo";

const signup = "/login?mode=signup&next=%2Fonboarding";

export default function Home() {
  return (
    <div className="landing-v3">
      <section className="landing-v3__hero">
        <div className="landing-v3__intro">
          <span className="landing-v3__eyebrow"><i /> Your personal creative director</span>
          <h1>Know exactly what<br /><span>to film next.</span></h1>
          <p>Directr learns how you create, decides what you should film today, builds the hook and shots, then guides you through filming it.</p>
          <div className="landing-v3__actions">
            <Link href={signup} className="landing-v3__primary">Get today&apos;s direction <span>→</span></Link>
            <span>Free to start. No card needed.</span>
          </div>
          <div className="landing-v3__formats"><span>One pick</span><i /> <span>Full direction</span><i /> <span>Film Mode</span></div>
        </div>
        <div className="landing-v3__product"><HomeDemo /></div>
      </section>

      <section className="landing-v3__difference">
        <div className="landing-v3__difference-copy">
          <span>STOP DECIDING.</span>
          <h2>Directr makes<br /><span>the call.</span></h2>
          <p>No blank prompt. No list of 30 ideas. Directr uses your Creator DNA to choose the strongest thing for you to film today, then tells you why.</p>
          <Link href={signup}>See what Directr picks for you <span>→</span></Link>
        </div>
        <div className="landing-v3__filming">
          <div className="landing-v3__filming-top"><span>FILM MODE</span><span>01 / 04</span></div>
          <div className="landing-v3__viewfinder"><i /><i /><i /><i /><span>Main A-roll</span><p>Chest-up. Eye level.</p></div>
          <blockquote>“I wasted a year trying to look successful instead of becoming useful.”</blockquote>
          <div className="landing-v3__filming-bottom"><span><i /> 00:08</span><button type="button" tabIndex={-1} aria-hidden="true">Got the shot</button></div>
        </div>
      </section>

      <section className="landing-v3__difference">
        <div className="landing-v3__difference-copy">
          <span>CREATOR DNA</span>
          <h2>It learns how<br /><span>you create.</span></h2>
          <p>Your niche, voice, formats, references, equipment, topics, filming setup, and what you actually choose to make. Directr carries that context into every recommendation.</p>
          <Link href={signup}>Build my Creator DNA <span>→</span></Link>
        </div>
        <div className="landing-v3__filming">
          <div className="landing-v3__filming-top"><span>DIRECTR LEARNED</span><span>82%</span></div>
          <div className="landing-v3__viewfinder"><i /><i /><i /><i /><span>Your pattern</span><p>Personal stories over generic advice.</p></div>
          <blockquote>“Keep the next recommendation opinion-led, under 40 seconds, and easy to film at home.”</blockquote>
          <div className="landing-v3__filming-bottom"><span>Creator DNA</span><button type="button" tabIndex={-1} aria-hidden="true">Updated</button></div>
        </div>
      </section>

      <section className="landing-v3__close">
        <p>One decision. One direction. One shoot.</p>
        <h2>Stop deciding.<br /><span>Start filming.</span></h2>
        <Link href={signup} className="landing-v3__primary">Get today&apos;s direction <span>→</span></Link>
      </section>

      <footer className="landing-v3__footer"><Link href="/" className="logo">directr<span className="dot">.</span></Link><span>Your next post, decided.</span><Link href="/pricing">Pricing</Link></footer>
    </div>
  );
}
