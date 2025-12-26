// src/app/lock/LockScreen.tsx
import LockForm from "./LockForm";

export default function LockScreen() {
  return (
    <main className="lock">
      <div className="lock__bg" />
      <div className="lock__wrap">
        <header className="lock__head">
          <div className="lock__brand">
            <span className="lock__logo">directr<span className="dot">.</span></span>
            <span className="lock__badge">Private build • founder access</span>
          </div>

          <h1 className="lock__title">Directr is in private mode.</h1>
          <p className="lock__desc">
            AI-powered creation → clips → captions. Access is limited while we stabilize uploads + editing.
          </p>
        </header>

        <section className="lock__grid">
          <div className="lock__card">
            <div className="lock__cardTop">
              <span>CREATE</span><em>scripts • angles • notes</em>
            </div>
            <p>Turn a prompt or upload into a clean content plan.</p>
          </div>

          <div className="lock__card">
            <div className="lock__cardTop">
              <span>CLIPPER</span><em>hooks • moments</em>
            </div>
            <p>Find the best segments and generate a clip plan.</p>
          </div>

          <div className="lock__card">
            <div className="lock__cardTop">
              <span>PLANNER</span><em>weekly execution</em>
            </div>
            <p>Turn outputs into a posting schedule + checklist.</p>
          </div>
        </section>

        <section className="lock__panel">
          <LockForm />
          <div className="lock__ctaRow">
            <a className="btn btn--ghost" href="mailto:hello@directr.so?subject=Waitlist%20Directr">
              Join waitlist
            </a>
            <a className="btn btn--ghost" href="mailto:hello@directr.so?subject=Request%20access%20Directr">
              Request access
            </a>
          </div>
        </section>

        <footer className="lock__foot">
          <span>© {new Date().getFullYear()} Directr</span>
        </footer>
      </div>
    </main>
  );
}
