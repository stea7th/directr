// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "directr",
  description: "Upload once → get branded, ready-to-post clips.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-200">
        <div style={{border:'2px solid lime', padding:'8px', margin:'8px'}}>
          ROOT LAYOUT WRAPPER (temporary)
        </div>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
