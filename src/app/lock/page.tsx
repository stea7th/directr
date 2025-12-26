import "./lock.css";
import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <main className="lock">
      <div className="lock__bg" />
      <section className="lock__card">
        <div className="lock__pill">Private build • founder access</div>
        <h1 className="lock__title">Directr is in private mode.</h1>
        <p className="lock__sub">
          Access is limited while we stabilize uploads + editing.
        </p>

        <LockForm />
      </section>
    </main>
  );
}
