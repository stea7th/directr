import Link from "next/link";
import styles from "./landing-refresh.module.css";

const signup = "/login?mode=signup&next=%2Fonboarding";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Your personal creative director</span>
            <h1>Stop wondering<br /><span>what to film.</span></h1>
            <p className={styles.heroSub}>Directr learns how you create, makes the creative call for you, then gives you the hook, shots, delivery, and filming plan.</p>
            <div className={styles.actions}>
              <Link href={signup} className={styles.primary}>Get today&apos;s direction <span>→</span></Link>
              <span className={styles.actionsNote}>Free to start. No card.</span>
            </div>
          </div>
        </div>

        <div className={styles.heroProduct}>
          <div className={styles.productBar}>
            <span className={styles.wordmark}>directr.</span>
            <span className={styles.ready}>Today&apos;s pick is ready</span>
          </div>
          <div className={styles.productGrid}>
            <div className={styles.pick}>
              <span className={styles.pickLabel}>Film this today</span>
              <h2>The performance of success</h2>
              <p className={styles.hook}>“I wasted a year trying to look successful instead of becoming useful.”</p>
              <div className={styles.pickMeta}><span>Talking head</span><span>32 sec</span><span>4 shots</span><span>8 min to film</span></div>
            </div>
            <aside className={styles.why}>
              <div>
                <span className={styles.whyLabel}>Why Directr chose it</span>
                <p>You prefer opinion-led personal stories, you can film this with your normal setup, and it matches what you want to become known for.</p>
              </div>
              <div className={styles.shots}>
                {["You, direct to camera", "Walk away from your desk", "Laptop close-up", "Back to camera"].map((shot, index) => (
                  <div className={styles.shot} key={shot}><b>{String(index + 1).padStart(2, "0")}</b><span>{shot}</span><i /></div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.manifesto}>
        <div>
          <span className={styles.sectionEyebrow}>The point</span>
          <h2>Less choice.<br />Better output.</h2>
        </div>
        <div className={styles.manifestoCopy}>
          <p>Most creator tools give you more tabs, more prompts, and more decisions. <strong>Directr does the opposite.</strong> It thinks through the creative decisions so you can start filming.</p>
        </div>
      </section>

      <section className={styles.learn}>
        <div className={styles.copy}>
          <span className={styles.sectionEyebrow}>Creator DNA</span>
          <h2>It learns<br />your taste.</h2>
          <p>Your niche, voice, favorite formats, references, equipment, filming locations, topics, and the things you actually choose to make become context for every future direction.</p>
        </div>
        <div className={styles.dnaCard}>
          <div className={styles.dnaTop}><strong>Creator DNA</strong><span>82% understood</span></div>
          <div className={styles.progress}><i /></div>
          <div className={styles.learned}>
            <div><span>Best format</span><strong>Opinion-led personal stories</strong></div>
            <div><span>Preferred length</span><strong>20–40 seconds</strong></div>
            <div><span>Default setup</span><strong>Home · iPhone · natural light</strong></div>
            <div><span>Avoid</span><strong>Generic tutorial content</strong></div>
          </div>
        </div>
      </section>

      <section className={styles.film}>
        <div className={styles.filmCard}>
          <div className={styles.filmTop}><span>FILM MODE</span><span>01 / 04</span></div>
          <div className={styles.viewfinder}>
            <span>Main A-roll · Chest-up · Eye level</span>
            <blockquote>“I wasted a year trying to look successful instead of becoming useful.”</blockquote>
          </div>
          <div className={styles.filmBottom}><span>Target · 8 sec</span><b>Got the shot →</b></div>
        </div>
        <div className={styles.copy}>
          <span className={styles.sectionEyebrow}>Film Mode</span>
          <h2>Then it<br />directs you.</h2>
          <p>No giant script on one screen. Directr walks you through the shoot one shot at a time: framing, dialogue, timing, and delivery.</p>
        </div>
      </section>

      <section className={styles.close}>
        <span className={styles.sectionEyebrow}>Your next post is already in there</span>
        <h2>Open Directr.<br />Film the thing.</h2>
        <p>The product should remove the part where you stare at your phone for an hour trying to decide what to make.</p>
        <Link href={signup} className={styles.primary}>Get today&apos;s direction <span>→</span></Link>
      </section>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLogo}>directr.</Link>
        <span>Your creative director, built around you.</span>
        <Link href="/pricing">Pricing</Link>
      </footer>
    </div>
  );
}
