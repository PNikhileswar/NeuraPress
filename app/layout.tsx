import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/layout/SessionProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SessionSynchronizer } from '@/components/layout/SessionSynchronizer';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: {
    default: 'NeuraPress - AI-Powered Blog Platform',
    template: '%s | NeuraPress',
  },
  description: 'Discover trending topics and AI-generated content on NeuraPress. Stay updated with the latest trends in technology, business, health, and more.',
  keywords: ['trending topics', 'AI content', 'blog', 'news', 'technology', 'business'],
  authors: [{ name: 'NeuraPress Team' }],
  creator: 'NeuraPress',
  publisher: 'NeuraPress',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'NeuraPress - AI-Powered Blog Platform',
    description: 'Discover trending topics and AI-generated content on NeuraPress.',
    siteName: 'NeuraPress',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeuraPress - AI-Powered Blog Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuraPress - AI-Powered Blog Platform',
    description: 'Discover trending topics and AI-generated content on NeuraPress.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <SessionProvider>
          <SessionSynchronizer />
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}