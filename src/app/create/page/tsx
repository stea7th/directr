// src/app/create/page.tsx
export const dynamic = "force-dynamic";

export default function CreatePage() {
  return (
    <main className="container" style={{ padding: "2rem" }}>
      <h1 className="h1" style={{ marginBottom: "0.5rem" }}>Create</h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        Minimal placeholder so the route never 404s.
      </p>

      <section className="panel" style={{ padding: "1rem", border: "1px solid #222", borderRadius: 12 }}>
        <form action="/api/generate" method="post" encType="multipart/form-data">
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <label>
              <div style={{ marginBottom: 6 }}>Prompt</div>
              <textarea name="prompt" rows={4} placeholder="Clip 5 times; 9:16; captions" />
            </label>
            <label>
              <div style={{ marginBottom: 6 }}>File (optional)</div>
              <input type="file" name="file" accept="video/*,audio/*" />
            </label>
            <button className="btn btn--primary" type="submit">Create</button>
          </div>
        </form>
      </section>
    </main>
  );
}
