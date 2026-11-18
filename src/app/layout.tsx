import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '@fontsource-variable/inter';
import './globals.css';

const serif = localFont({
  src: [
    { path: '../fonts/InstrumentSerif-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/InstrumentSerif-Italic.ttf', weight: '400', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = { title: 'Wedding Planner', description: 'Catatan kebutuhan pernikahan' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={serif.variable}>
      <body>{children}</body>
    </html>
  );
}
