// src/app/lock/page.tsx
import styles from "./lock.module.css";
import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <main className={styles.lockRoot}>
      <div className={styles.lockBg} />

      <div className={styles.lockWrap}>
        <section className={styles.lockCard}>
          <div className={styles.lockInner}>
            {/* LEFT */}
            <div>
              <div className={styles.lockKicker}>
                <span className={styles.lockDot} />
                Private build · founder access
              </div>

              <h1 className={styles.lockTitle}>Directr is in private mode.</h1>
              <p className={styles.lockSub}>
                Access is limited while we stabilize uploads + editing.
              </p>

              <LockForm />

              <div className={styles.lockTiles}>
                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <div className={styles.lockTileLabel}>Create</div>
                    <div className={styles.lockTileMeta}>v0.1</div>
                  </div>
                  <div className={styles.lockTileDesc}>Prompt → script → output</div>
                </div>

                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <div className={styles.lockTileLabel}>Clipper</div>
                    <div className={styles.lockTileMeta}>soon</div>
                  </div>
                  <div className={styles.lockTileDesc}>Auto-find hooks & moments</div>
                </div>

                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <div className={styles.lockTileLabel}>Planner</div>
                    <div className={styles.lockTileMeta}>soon</div>
                  </div>
                  <div className={styles.lockTileDesc}>Plan posts & deadlines</div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <aside className={styles.lockPanel}>
              <div className={styles.lockPanelTitle}>Founder access</div>
              <p className={styles.lockSub} style={{ marginTop: 0 }}>
                Enter your key to unlock the Create page.
              </p>

              {/* LockForm already includes the input/button UI. This panel is just “context”. */}
              <div className={styles.lockFine}>
                Tip: Keep your key private. This is a temporary gate while we ship stability updates.
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
