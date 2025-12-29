// src/app/lock/page.tsx
import styles from "./lock.module.css";
import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <main className={styles.lockRoot}>
      <div className={styles.lockBg} />
      <div className={styles.lockWrap}>
        <div className={styles.lockCard}>
          <div className={styles.lockInner}>
            <div className={styles.left}>
              <div className={styles.lockKicker}>
                <span className={styles.lockDot} />
                PRIVATE BUILD · FOUNDER ACCESS
              </div>

              <h1 className={styles.lockTitle}>Directr is in private mode.</h1>
              <p className={styles.lockSub}>
                Access is limited while we stabilize uploads + editing.
              </p>

              <LockForm />

              <details className={styles.details}>
                <summary className={styles.detailsSummary}>What’s inside</summary>

                <div className={styles.lockTiles}>
                  <div className={styles.lockTile}>
                    <div className={styles.lockTileTop}>
                      <div className={styles.lockTileLabel}>CREATE</div>
                      <div className={styles.lockTileMeta}>v0.1</div>
                    </div>
                    <div className={styles.lockTileDesc}>Prompt → script → output</div>
                  </div>

                  <div className={styles.lockTile}>
                    <div className={styles.lockTileTop}>
                      <div className={styles.lockTileLabel}>CLIPPER</div>
                      <div className={styles.lockTileMeta}>soon</div>
                    </div>
                    <div className={styles.lockTileDesc}>Auto-find hooks &amp; moments</div>
                  </div>

                  <div className={styles.lockTile}>
                    <div className={styles.lockTileTop}>
                      <div className={styles.lockTileLabel}>PLANNER</div>
                      <div className={styles.lockTileMeta}>soon</div>
                    </div>
                    <div className={styles.lockTileDesc}>Plan posts &amp; deadlines</div>
                  </div>
                </div>
              </details>
            </div>

            <aside className={styles.right}>
              <div className={styles.sideCard}>
                <div className={styles.sideTitle}>Founder access</div>
                <div className={styles.sideText}>
                  Keep your key private. This is a temporary gate while we ship stability updates.
                </div>
              </div>

              <div className={styles.sideCard}>
                <div className={styles.sideTitle}>Want in?</div>
                <div className={styles.sideText}>
                  Join the waitlist and you’ll get first access when we open invites.
                </div>
                <div className={styles.waitlistHint}>
                  Use the <b>Waitlist</b> tab.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
