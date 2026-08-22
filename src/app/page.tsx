import Link from "next/link";
import HomeDemo from "@/components/HomeDemo";

const signup = "/login?mode=signup&next=%2Fonboarding";

export default function Home() {
  return (
    <div className="landing-v3">
      <section className="landing-v3__hero">
        <div className="landing-v3__intro"><span className="landing-v3__eyebrow"><i /> Your personal creative director</span><h1>Know what to film.<br /><span>Then go film it.</span></h1><p>Directr learns your taste, picks the idea, writes the hook, and tells you exactly how to shoot it.</p><div className="landing-v3__actions"><Link href={signup} className="landing-v3__primary">Get my first direction <span>→</span></Link><span>Free to start. No card needed.</span></div><div className="landing-v3__formats"><span>Reels</span><i /> <span>TikTok</span><i /> <span>Shorts</span></div></div>
        <div className="landing-v3__product"><HomeDemo /></div>
      </section>

      <section className="landing-v3__difference"><div className="landing-v3__difference-copy"><span>EVERY DECISION, MADE.</span><h2>Stop asking<br /><span>what to post.</span></h2><p>Your angle. Your opening line. Your exact shots. The way you should deliver it. Thought through before you hit record.</p><Link href={signup}>See what you should film <span>→</span></Link></div><div className="landing-v3__filming"><div className="landing-v3__filming-top"><span>FILM MODE</span><span>01 / 04</span></div><div className="landing-v3__viewfinder"><i /><i /><i /><i /><span>Main A-roll</span><p>Chest-up. Eye level.</p></div><blockquote>“I wasted a year trying to look successful instead of becoming useful.”</blockquote><div className="landing-v3__filming-bottom"><span><i /> 00:08</span><button type="button" tabIndex={-1} aria-hidden="true">Got the shot</button></div></div></section>

      <section className="landing-v3__close"><p>Four shots. Thirty seconds. Zero overthinking.</p><h2>Your next post<br /><span>starts here.</span></h2><Link href={signup} className="landing-v3__primary">Get my first direction <span>→</span></Link></section>

      <footer className="landing-v3__footer"><Link href="/" className="logo">directr<span className="dot">.</span></Link><span>Less thinking. Better content.</span><Link href="/pricing">Pricing</Link></footer>
    </div>
  );
}
