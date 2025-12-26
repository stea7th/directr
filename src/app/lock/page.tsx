// src/app/lock/page.tsx
import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <div className="lock">
      <div className="lock__bg" aria-hidden="true" />
      <div className="lock__grain" aria-hidden="true" />

      <div className="lock__wrap">
        <div className="lock__brand">
          <div className="lock__logo">
            directr<span className="dot">.</span>
          </div>
          <div className="lock__pill">
            <span className="lock__dot" />
            Private build · founder access
          </div>
        </div>

        <div className="lock__content">
          <h1 className="lock__h1">Directr is in private mode.</h1>
          <p className="lock__p">
            Access is limited while we stabilize uploads + editing. Enter your key
            to continue.
          </p>

          <div className="lock__card">
            <div className="lock__cardHead">
              <div>
                <div className="lock__label">Access key</div>
                <div className="lock__hint">Stays unlocked for 7 days on this device.</div>
              </div>
            </div>

            <LockForm />

            <div className="lock__actions">
              <a className="btn btn--ghost lock__btn" href="/waitlist">
                Join waitlist
              </a>
              <a className="btn btn--ghost lock__btn" href="mailto:hello@directr.so?subject=Directr%20Access%20Request">
                Request access
              </a>
            </div>

            <div className="lock__fine">
              Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable the lock.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
