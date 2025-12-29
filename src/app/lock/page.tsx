import LockForm from "./LockForm";
import "./lock.css";
export default function LockPage() {
  return (
    <main className="lock">
      <div className="lock__bg" />
      <div className="lock__grain" />

      <div className="lock__wrap">
        <div className="lock__content">
          <div className="lock__pill">
            <span className="lock__dot" />
            PRIVATE BUILD · FOUNDER ACCESS
          </div>

          <h1 className="lock__h1">Directr is in private mode.</h1>
          <p className="lock__p">
            Access is limited while we stabilize uploads + editing.
          </p>

          <div className="lock__card">
            <div className="lock__label">Enter access key</div>
            <div className="lock__hint">Ask the founder for access.</div>
            <div style={{ marginTop: 10 }}>
              <LockForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
