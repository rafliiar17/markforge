import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: {
    default: 'MarkForge — Universal Markdown to PDF & DOCX Studio',
    template: '%s | MarkForge',
  },
  description:
    'Universal Markdown document compiler with ATS optimization, OpenXML DOCX & print-ready PDF export, Developer CLI, and MCP Server.',
  keywords: [
    'markdown',
    'pdf compiler',
    'docx compiler',
    'ats resume',
    'openxml',
    'developer tools',
    'mcp server',
  ],
  authors: [{ name: 'MarkForge Contributors', url: 'https://github.com/rafliiar17/markforge' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/favicon.svg' }],
  },
  openGraph: {
    title: 'MarkForge — Universal Markdown to PDF & DOCX Studio',
    description:
      'Universal Markdown document compiler with ATS optimization, OpenXML DOCX & print-ready PDF export.',
    url: 'https://mark.arafz.id',
    siteName: 'MarkForge',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
