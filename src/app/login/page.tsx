"use client";

import { Suspense } from "react";
import LoginInner from "./LoginInner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-loading">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
