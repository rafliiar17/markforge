import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarkForge — Universal Markdown to PDF & DOCX Engine',
  description:
    'Open-source studio for compiling Markdown to ATS-compliant resumes, technical whitepapers, and documents with PDF & DOCX export.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
