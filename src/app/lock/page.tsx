import LockForm from "./LockForm";

export default function LockPage() {
  return (
    <main className="lockShell">
      <div className="lockCard">
        <div className="lockKicker">Private build · founder access</div>
        <h1 className="lockTitle">Directr is in private mode.</h1>
        <p className="lockSub">
          Access is limited while we stabilize uploads + editing.
        </p>
        <LockForm />
      </div>
    </main>
  );
}
