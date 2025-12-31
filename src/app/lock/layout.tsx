// src/app/lock/layout.tsx
import styles from "./lock.module.css";

export default function LockLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.lockRoot}>{children}</div>;
}
