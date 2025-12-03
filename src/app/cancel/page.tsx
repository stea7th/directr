// src/app/cancel/page.tsx
export default function CancelPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          background: "#050506",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 24,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Checkout canceled</h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 20,
          }}
        >
          No charges were made. You can choose a different plan or come back
          later.
        </p>
        <a
          href="/pricing"
          style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            background: "#111827",
            color: "#f5f5f7",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Back to pricing
        </a>
      </div>
    </main>
  );
}
