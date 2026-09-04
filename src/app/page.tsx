import Link from "next/link";
import styles from "./page.module.css";

const signup = "/login?mode=signup&next=%2Fonboarding";
const shots = ["You, direct to camera", "Walk away from your desk", "Laptop close-up", "Back to camera"];

export default function Home() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}><i /> Your personal creative director</span>
        <h1>Know what to film.<br /><span>Then go film it.</span></h1>
        <p>Directr learns how you create, chooses the strongest idea for today, builds the direction, and guides you through filming it.</p>
        <div className={styles.actions}>
          <Link href={signup} className={styles.primary}>Get today&apos;s direction <span>→</span></Link>
          <Link href="#product" className={styles.secondary}>See how it works</Link>
        </div>
      </section>

      <section className={styles.proof} id="product">
        <div className={styles.window}>
          <div className={styles.toolbar}>
            <div className={styles.dots}><i /><i /><i /></div>
            <div className={styles.status}><i /> Today&apos;s direction is ready</div>
          </div>
          <div className={styles.dashboard}>
            <div className={styles.today}>
              <span className={styles.label}>Film this today</span>
              <h2>The performance of success</h2>
              <div className={styles.meta}><span>Talking head</span><span>32 sec</span><span>4 shots</span><span>8 min to film</span></div>
              <div className={styles.hook}>
                <span>Opening line</span>
                <blockquote>“I wasted a year trying to look successful instead of becoming useful.”</blockquote>
              </div>
              <p className={styles.why}><strong>Why Directr chose it:</strong> You prefer opinion-led personal stories, this fits your usual setup, and it matches what you want to become known for.</p>
            </div>
            <aside className={styles.shotPanel}>
              <div className={styles.shotPanelTop}><span>Your shots</span><span>4 total</span></div>
              <div className={styles.shots}>
                {shots.map((shot, index) => <div className={styles.shot} key={shot}><span>{String(index + 1).padStart(2, "0")}</span><p>{shot}</p><i /></div>)}
              </div>
              <p className={styles.note}><span>Director&apos;s note</span>Say it like you&apos;re admitting something, not teaching. Don&apos;t overfilm this.</p>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div><span className={styles.kicker}>Creator DNA</span><h2>It learns how you create.</h2></div>
            <p>Your voice, taste, goals, references, equipment, filming environments, and the things you actually choose to make become context for every future recommendation.</p>
          </div>
          <div className={styles.dnaGrid}>
            <article className={styles.dnaCard}><span>Best format</span><strong>Opinion-led stories</strong><p>Directr notices what you naturally choose and leans into it.</p></article>
            <article className={styles.dnaCard}><span>Preferred length</span><strong>20–40 seconds</strong><p>No sixty-second script just because the model can write one.</p></article>
            <article className={styles.dnaCard}><span>Default setup</span><strong>Home · iPhone</strong><p>Recommendations fit the environment and gear you actually have.</p></article>
            <article className={styles.dnaCard}><span>Directr learned</span><strong>Skip generic tutorials</strong><p>Your creative direction gets sharper every time you make something.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.filmSection}>
        <div className={styles.filmIntro}>
          <h2>From idea to camera without the overthinking.</h2>
          <p>Directr doesn&apos;t dump a giant script on you. Film Mode walks you through the shoot one shot at a time.</p>
        </div>
        <div className={styles.filmStage}>
          <div className={styles.phone}>
            <div className={styles.phoneTop}><span>FILM MODE</span><span>01 / 04</span></div>
            <div className={styles.frame}><span>Main A-roll</span><strong>Chest-up · eye level</strong></div>
            <div className={styles.dialogue}><span>Say</span><p>“I wasted a year trying to look successful instead of becoming useful.”</p></div>
            <div className={styles.next}><span>Got the shot →</span></div>
          </div>
          <div className={styles.learn}>
            <article className={styles.learnCard}><span>Directr notices</span><strong>You keep choosing personal stories.</strong><p>Tomorrow&apos;s recommendations shift toward the kind of content you actually want to make.</p></article>
            <article className={styles.learnCard}><span>Directr avoids</span><strong>More options for the sake of options.</strong><p>One strong recommendation first. Alternatives only when you actually want them.</p></article>
            <article className={styles.learnCard}><span>Directr remembers</span><strong>Your voice, setups, and dislikes.</strong><p>You stop re-explaining yourself every time you want help creating.</p></article>
            <article className={styles.learnCard}><span>Directr gets better</span><strong>The product learns from making.</strong><p>Feedback from each direction improves what it recommends next.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Stop deciding what to post.</h2>
        <p>Open Directr. Get the direction. Film the thing.</p>
        <div className={styles.actions}><Link href={signup} className={styles.primary}>Get today&apos;s direction <span>→</span></Link></div>
      </section>

      <footer className={styles.footer}><Link href="/">directr.</Link><span>Your creative director, built around you.</span><Link href="/pricing">Pricing</Link></footer>
    </div>
  );
}
