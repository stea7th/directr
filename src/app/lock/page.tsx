import "./lock.css";
import { unlockAction } from "./actions";

type LockSearchParams = {
  from?: string;
  error?: string;
};

export default async function LockPage(props: {
  searchParams?: Promise<LockSearchParams>;
}) {
  const sp = (await props.searchParams) || {};
  const from = sp.from || "/create";
  const isError = sp.error === "1";

  return (
    <div className="lock">
      <div className="lock__bg" aria-hidden />
      <div className="lock__grain" aria-hidden />

      <div className="lock__wrap">
        <div className="lock__card">
          <div className="lock__badge">
            <span className="lock__dot" />
            Private build • founder access
          </div>

          <h1 className="lock__title">Directr is in private mode.</h1>
          <p className="lock__sub">
            AI-powered creation → clips → captions. Access is limited while we
            stabilize uploads + editing.
          </p>

          <div className="lock__grid">
            <div className="lock__pill">
              <div className="lock__pillTop">
                <span>CREATE</span>
                <em>scripts • angles • notes</em>
              </div>
              <p>Turn a prompt or upload into a clean content plan.</p>
            </div>
            <div className="lock__pill">
              <div className="lock__pillTop">
                <span>CLIPPER</span>
                <em>hooks • moments</em>
              </div>
              <p>Find the best segments and generate a clip plan.</p>
            </div>
            <div className="lock__pill">
              <div className="lock__pillTop">
                <span>PLANNER</span>
                <em>weekly execution</em>
              </div>
              <p>Turn outputs into a posting schedule + checklist.</p>
            </div>
          </div>

          <div className="lock__divider" />

          <div className="lock__row">
            <div>
              <h2 className="lock__h2">Enter access key</h2>
              <p className="lock__hint">This device stays unlocked for 7 days.</p>
            </div>
          </div>

          <form className="lock__form" action={unlockAction}>
            <input type="hidden" name="from" value={from} />
            <input
              className="lock__input"
              name="key"
              type="password"
              placeholder="Access key"
              autoComplete="current-password"
              required
            />
            <button className="lock__btn lock__btn--primary" type="submit">
              Unlock
              <span className="lock__btnGlow" aria-hidden />
            </button>
          </form>

          {isError && <div className="lock__error">Wrong key. Try again.</div>}

          <div className="lock__cta">
            <a
              className="lock__btn lock__btn--ghost"
              href="mailto:founder@directr.so?subject=Directr%20Waitlist&body=Name%3A%0AEmail%3A%0AUse%20case%3A"
            >
              Join waitlist
            </a>
            <a
              className="lock__btn lock__btn--ghost"
              href="mailto:founder@directr.so?subject=Request%20Directr%20Access&body=Name%3A%0AEmail%3A%0AWhy%20you%3A%0A"
            >
              Request access
            </a>
          </div>

          <div className="lock__foot">
            Tip: set <code>SITE_LOCK_ENABLED=false</code> to disable.
          </div>
        </div>
      </div>
    </div>
  );
}
