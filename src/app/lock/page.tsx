// src/app/lock/page.tsx
import styles from "./lock.module.css";
import LockForm from "./LockForm";

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

              <h1 className={styles.lockTitle}>
                Directr is in private mode.
              </h1>

              <p className={styles.lockSub}>
                Access is limited while we stabilize uploads + editing.
              </p>

              <LockForm />
            </div>

            {/* RIGHT */}
            <div className={styles.lockPanel}>
              <div className={styles.lockPanelTitle}>Founder access</div>

              <div className={styles.lockTiles}>
                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <span className={styles.lockTileLabel}>CREATE</span>
                    <span className={styles.lockTileMeta}>v0.1</span>
                  </div>
                  <p className={styles.lockTileDesc}>
                    Prompt → script → output
                  </p>
                </div>

                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <span className={styles.lockTileLabel}>CLIPPER</span>
                    <span className={styles.lockTileMeta}>soon</span>
                  </div>
                  <p className={styles.lockTileDesc}>
                    Auto-find hooks & moments
                  </p>
                </div>

                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <span className={styles.lockTileLabel}>PLANNER</span>
                    <span className={styles.lockTileMeta}>soon</span>
                  </div>
                  <p className={styles.lockTileDesc}>
                    Plan posts & deadlines
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
