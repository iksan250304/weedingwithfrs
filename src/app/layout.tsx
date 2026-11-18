import type { Metadata, Viewport } from 'next';
<<<<<<< HEAD
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
=======
import './globals.css';
export const metadata: Metadata = { title: 'Wedding I & F', description: 'Catatan kebutuhan pernikahan' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
>>>>>>> 6fbf6c92df783892fa8773654767ca0275a4600e
      <body>{children}</body>
    </html>
  );
}
