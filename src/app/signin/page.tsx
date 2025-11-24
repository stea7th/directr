"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SigninInner() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const plan = searchParams.get("plan");

  let heading = "You're in.";
  let subheading = "Your Directr account is ready to go.";
  let badge = "";

  if (status === "success" && plan) {
    heading = "Subscription active";
    subheading = `Your ${plan} plan is now live.`;
    badge = plan;
  } else if (status === "success") {
    heading = "Subscription active";
    subheading = "Your plan is now live.";
  } else if (status === "canceled") {
    heading = "Checkout canceled";
    subheading = "You can restart your subscription anytime.";
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "72px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 24,
          borderRadius: 24,
          background: "#050506",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.9)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#f5f5f7",
            marginBottom: 8,
          }}
        >
          {heading}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 24,
          }}
        >
          {subheading}
        </p>

        {badge && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,202,255,0.6)",
              fontSize: 11,
              color: "rgba(220,235,255,0.9)",
              marginBottom: 16,
            }}
          >
            Active plan: <span style={{ marginLeft: 4, fontWeight: 500 }}>{badge}</span>
          </div>
        )}

        <a
          href="/create"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 20px",
            borderRadius: 999,
            border: "1px solid rgba(139,187,255,0.7)",
            background:
              "radial-gradient(circle at 0% 0%, rgba(139,187,255,0.45), rgba(50,80,130,0.6
