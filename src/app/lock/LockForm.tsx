// src/app/lock/LockForm.tsx
import styles from "./lock.module.css";
import { unlockAction, relockAction } from "./actions";

export default function LockForm() {
  return (
    <>
      <form action={unlockAction}>
        <div className={styles.lockRow}>
          <input
            className={styles.lockInput}
            name="key"
            type="password"
            placeholder="Access key"
            autoComplete="off"
          />
          <button className={`${styles.lockBtn} ${styles.lockBtnPrimary}`} type="submit">
            Unlock
          </button>
        </div>
      </form>

      <div className={styles.lockActions}>
        <form action={relockAction}>
          <button className={styles.lockLinkBtn} type="submit">
            Relock
          </button>
        </form>
      </div>
    </>
  );
}
