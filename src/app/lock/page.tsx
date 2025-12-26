// src/app/lock/page.tsx
import "./lock.css";
import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <main className="lock">
      <div className="lock__bg" />
      <div className="lock__grain" />

      <div className="lock__wrap">
        <div className="lock__brand">
          <div className="lock__logo">
            directr<span style={{ color: "var(--accent)" }}>.</span>
          </div>

          <div className="lock__pill">
            <span className="lock__dot" />
            Private build • founder access
          </div>
        </div>

        <section className="lock__content">
          <h1 className="lock__h1">Directr is in private mode.</h1>
          <p className="lock__p">
            AI-powered creation → clips → captions. Access is limited while we stabilize uploads +
            editing.
          </p>

          <div className="lock__card">
            <div className="lock__label">Enter access key</div>
            <div className="lock__hint">This device stays unlocked for 7 days.</div>

            <LockForm />

            <div className="lock__fine">
              Tip: set <code>SITE_LOCK_ENABLED</code>=<code>false</code> to disable.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
