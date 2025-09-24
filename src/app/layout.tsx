import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directr",
  description: "Your AI content director"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}
