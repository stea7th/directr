import styles from "./lock.module.css";
import { unlockAction, relockAction } from "./actions";

export default function LockPage({
  searchParams,
}: {
  searchParams?: { ok?: string; err?: string };
}) {
  const err = searchParams?.err ? decodeURIComponent(searchParams.err) : "";

  return (
    <>
      <div className={styles.bg} />
      <div className={styles.grain} />

      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.inner}>
            {/* LEFT */}
            <div>
              <div className={styles.kicker}>
                <span className={styles.dot} />
                <span>PRIVATE BUILD • FOUNDER ACCESS</span>
              </div>

              <h1 className={styles.h1}>Directr is in private mode.</h1>
              <p className={styles.p}>
                Access is limited while we stabilize uploads + editing.
              </p>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Enter access key</div>

                <form action={unlockAction} className={styles.row}>
                  <input
                    className={styles.input}
                    name="key"
                    placeholder="Access key"
                    autoComplete="off"
                  />
                  <button className={`${styles.btn} ${styles.primary}`} type="submit">
                    Unlock
                  </button>
                </form>

                <div className={styles.subActions}>
                  <form action={relockAction}>
                    <button className={styles.btn} type="submit">
                      Relock
                    </button>
                  </form>
                </div>

                {err ? <div className={styles.error}>{err}</div> : null}
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Join the waitlist</div>

                <form action="/api/waitlist" method="post" className={styles.row}>
                  <input
                    className={styles.input}
                    name="email"
                    type="email"
                    placeholder="Email address"
                    required
                  />
                  <button className={styles.btn} type="submit">
                    Join
                  </button>
                </form>

                <div className={styles.helper}>
                  You’ll get an email when public access opens.
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.right}>
              <div className={styles.rightCard}>
                <div className={styles.rightTitle}>Roadmap</div>

                <div className={styles.tiles}>
                  <div className={styles.tile}>
                    <div className={styles.tileTop}>
                      <div className={styles.tileLabel}>CREATE</div>
                      <div className={styles.tileMeta}>v0.1</div>
                    </div>
                    <div className={styles.tileDesc}>Prompt → script → output</div>
                  </div>

                  <div className={styles.tile}>
                    <div className={styles.tileTop}>
                      <div className={styles.tileLabel}>CLIPPER</div>
                      <div className={styles.tileMeta}>soon</div>
                    </div>
                    <div className={styles.tileDesc}>Auto-find hooks & moments</div>
                  </div>

                  <div className={styles.tile}>
                    <div className={styles.tileTop}>
                      <div className={styles.tileLabel}>PLANNER</div>
                      <div className={styles.tileMeta}>soon</div>
                    </div>
                    <div className={styles.tileDesc}>Plan posts & deadlines</div>
                  </div>

                  <div className={styles.tile}>
                    <div className={styles.tileTop}>
                      <div className={styles.tileLabel}>EXPORT</div>
                      <div className={styles.tileMeta}>soon</div>
                    </div>
                    <div className={styles.tileDesc}>Copy, share, and save outputs</div>
                  </div>
                </div>
              </div>

              <div className={styles.rightCard}>
                <div className={styles.rightTitle}>Founder note</div>
                <div className={styles.helper}>
                  Keep your key private. This is a temporary gate while we ship stability updates.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
