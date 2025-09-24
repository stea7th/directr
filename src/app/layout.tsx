import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Directr — Create",
  description: "Upload raw video → get a captioned, social-ready clip back.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
