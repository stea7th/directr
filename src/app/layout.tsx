import type { Metadata } from 'next';
import './globals.css';
import './page.css'; // load the home page styles globally

export const metadata: Metadata = {
  title: 'Directr',
  description: 'Upload a file or type a command — get clips, hooks, captions, and exports automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
