"use client";

import Link from "next/link";
import { useState } from "react";

export default function NavMobile() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn btn--ghost"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open menu"
      >
        Menu
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 220,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.10)",
            background: "rgba(10,10,10,.92)",
            backdropFilter: "blur(14px)",
            padding: 10,
            boxShadow: "0 30px 90px rgba(0,0,0,.6)",
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <Link href="/create" onClick={() => setOpen(false)}>Create</Link>
            <Link href="/clipper" onClick={() => setOpen(false)}>Clipper</Link>
            <Link href="/planner" onClick={() => setOpen(false)}>Planner</Link>
            <Link href="/jobs" onClick={() => setOpen(false)}>Jobs</Link>
            <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
          </div>
        </div>
      )}
    </div>
  );
}
