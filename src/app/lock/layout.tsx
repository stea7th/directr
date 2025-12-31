import styles from "./lock.module.css";

export default function LockLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.root}>{children}</div>;
}
