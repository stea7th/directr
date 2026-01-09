"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export default function SignInModal({
  open,
  onClose,
  title = "Please sign in first",
  message = "Create an account or sign in to continue.",
}: Props) {
  if (!open) return null;

  return (
    <div className="si__overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="si__card" onClick={(e) => e.stopPropagation()}>
        <div className="si__head">
          <div>
            <div className="si__title">{title}</div>
            <div className="si__sub">{message}</div>
          </div>

          <button type="button" className="si__x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="si__actions">
          <Link href="/login" className="btn btn--primary" style={{ width: "100%" }}>
            Sign in / Create account
          </Link>

          <button
            type="button"
            className="btn btn--ghost"
            style={{ width: "100%" }}
            onClick={onClose}
          >
            Not now
          </button>
        </div>
      </div>

      <style jsx>{`
        .si__overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(10px);
        }
        .si__card {
          width: 100%;
          max-width: 420px;
          border-radius: 18px;
          padding: 14px;
          background: radial-gradient(
                circle at 0 0,
                rgba(148, 202, 255, 0.18),
                transparent 60%
              ),
            #0b0d12;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.85);
        }
        .si__head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 6px 6px 10px;
        }
        .si__title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.92);
          margin-bottom: 4px;
        }
        .si__sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.5;
        }
        .si__x {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.8);
          width: 34px;
          height: 34px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 20px;
          line-height: 30px;
          display: grid;
          place-items: center;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .si__x:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.06);
        }
        .si__actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 8px 6px 6px;
        }
      `}</style>
    </div>
  );
}
