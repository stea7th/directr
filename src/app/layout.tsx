// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directr",
  description: "Your AI Content Director",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* if Tailwind loads, these classes will style the page */}
      <body className="min-h-dvh bg-neutral-900 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
