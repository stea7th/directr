import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directr",
  description: "Your AI content director"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
