import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GrooveKit — The Complete Drum Learning Platform',
  description:
    'Master drumming from beginner to expert with interactive lessons, 40 PAS rudiments, beat sequencer, rhythm games, and real-time feedback.',
  applicationName: 'GrooveKit',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GrooveKit',
  },
  formatDetection: {
    telephone: false,
  },
};

// Separate `viewport` export (Next 14+ convention). Keep user-scaling enabled
// so the page stays accessible for low-vision users on mobile browsers.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' },
    { media: '(prefers-color-scheme: light)', color: '#0A0A0F' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
