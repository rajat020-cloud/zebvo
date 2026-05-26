import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zebvo | Social Media Scraper Dashboard',
  description: 'Enterprise NLP social media scraper monitoring passport & visa mentions, sentiment analysis, clustering and translation.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        {/* Import premium google typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#07080e] text-[#f8fafc] antialiased selection:bg-indigo-600/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
