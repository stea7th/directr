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
            <section>
              <div className={styles.lockKicker}>
                <span className={styles.lockDot} />
                Private build · founder access
              </div>

              <h1 className={styles.lockTitle}>Directr is in private mode.</h1>
              <p className={styles.lockSub}>
                Access is limited while we stabilize uploads + editing.
              </p>

              <div className={styles.lockTiles}>
                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <div className={styles.lockTileLabel}>Create</div>
                    <div className={styles.lockTileMeta}>v0</div>
                  </div>
                  <div className={styles.lockTileDesc}>Generate scripts + hooks</div>
                </div>

                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <div className={styles.lockTileLabel}>Clipper</div>
                    <div className={styles.lockTileMeta}>beta</div>
                  </div>
                  <div className={styles.lockTileDesc}>Auto-find moments</div>
                </div>

                <div className={styles.lockTile}>
                  <div className={styles.lockTileTop}>
                    <div className={styles.lockTileLabel}>Planner</div>
                    <div className={styles.lockTileMeta}>soon</div>
                  </div>
                  <div className={styles.lockTileDesc}>Plan posts + schedule</div>
                </div>
              </div>
            </section>

            <aside className={styles.lockPanel}>
              <div className={styles.lockPanelTitle}>Enter access key</div>
              <LockForm />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
