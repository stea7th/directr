// src/app/lock/page.tsx
import styles from "./lock.module.css";
import LockForm from "./LockForm";
import WaitlistForm from "./WaitlistForm";

export default function LockPage() {
  return (
    <>
      <div className={styles.lockBg} />

      <div className={styles.lockWrap}>
        <div className={styles.lockCard}>
          <div className={styles.lockInner}>
            {/* LEFT */}
            <div>
              <div className={styles.lockKicker}>
                <span className={styles.lockDot} />
                PRIVATE BUILD · FOUNDER ACCESS
              </div>

              <h1 className={styles.lockTitle}>Directr is in private mode.</h1>

              <p className={styles.lockSub}>
                Access is limited while we stabilize uploads + editing.
              </p>

              <LockForm />

              {/* ✅ waitlist (clean + not cluttered) */}
              <div className={styles.lockPanel} style={{ marginTop: 12 }}>
                <div className={styles.lockPanelTitle}>Join the waitlist</div>
                <WaitlistForm />
                <div className={styles.waitNote}>
                  You’ll get an email when public access opens.
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.lockAside}>
              <div className={styles.lockAsideInner}>
                <div className={styles.lockPanel}>
                  <div className={styles.lockPanelTitle}>Roadmap</div>

                  <div className={styles.lockTiles}>
                    <div className={styles.lockTile}>
                      <div className={styles.lockTileTop}>
                        <span className={styles.lockTileLabel}>CREATE</span>
                        <span className={styles.lockTileMeta}>v0.1</span>
                      </div>
                      <div className={styles.lockTileDesc}>
                        Prompt → script → output
                      </div>
                    </div>

                    <div className={styles.lockTile}>
                      <div className={styles.lockTileTop}>
                        <span className={styles.lockTileLabel}>CLIPPER</span>
                        <span className={styles.lockTileMeta}>soon</span>
                      </div>
                      <div className={styles.lockTileDesc}>
                        Auto-find hooks & moments
                      </div>
                    </div>

                    <div className={styles.lockTile}>
                      <div className={styles.lockTileTop}>
                        <span className={styles.lockTileLabel}>PLANNER</span>
                        <span className={styles.lockTileMeta}>soon</span>
                      </div>
                      <div className={styles.lockTileDesc}>
                        Plan posts & deadlines
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.lockPanel} style={{ marginTop: 12 }}>
                  <div className={styles.lockPanelTitle}>Founder note</div>
                  <div className={styles.lockTileDesc}>
                    Keep your key private. This is a temporary gate while we ship
                    stability updates.
                  </div>
                </div>
              </div>
            </div>
            {/* /RIGHT */}
          </div>
        </div>
      </div>
    </>
  );
}
