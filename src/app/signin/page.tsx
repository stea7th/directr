"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SigninInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status");
  const plan = (searchParams.get("plan") || "creator").toLowerCase();

  let title = "Signed in";
  let message = "You’re good to go.";
  let accent = "#9dcbff";

  if (status === "success") {
    title = "Subscription active ✅";
    message = `Your ${plan} plan is ready. You can start generating clips right away.`;
    accent = "#4ade80";
  } else if (status === "canceled") {
    title = "Checkout canceled";
    message = "No charges were made. You can subscribe anytime from the pricing page.";
    accent = "#f97373";
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        padding: 24,
        borderRadius: 24,
        background: "#050506",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 20px 45px rgba(0,0,0,0.9)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "999px",
            background: accent,
            boxShadow: `0 0 18px ${accent}`,
          }}
        />
        <span
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.12,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          account
        </span>
      </div>

      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "#f5f5f7",
          marginBottom: 8,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          marginBottom: 20,
        }}
      >
        {message}
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 6,
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/create")}
          style={{
            flexShrink: 0,
            padding: "9px 20px",
            borderRadius: 999,
            border: "1px solid rgba(139,187,255,0.7)",
            background:
              "radial-gradient(circle at 0% 0%, rgba(139,187,255,0.45), rgba(50,80,130,0.6)), #171c26",
            color: "#f5f7ff",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0.02,
            cursor: "pointer",
            boxShadow:
              "0 0 0 1px rgba(20,40,70,0.7), 0 12px 30px rgba(0,0,0,0.9)",
          }}
        >
          Go to Create
        </button>

        <button
          type="button"
          onClick={() => router.push("/pricing")}
          style={{
            flexShrink: 0,
            padding: "9px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(15,16,22,0.9)",
            color: "rgba(255,255,255,0.8)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          View plans
        </button>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "72px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.03), transparent 55%), #050506",
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              padding: 24,
              borderRadius: 24,
              background: "#050506",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 20px 45px rgba(0,0,0,0.9)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
            }}
          >
            Finishing up your sign-in…
          </div>
        }
      >
        <SigninInner />
      </Suspense>
    </main>
  );
}
