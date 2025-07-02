import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/SessionProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TrendWise - AI-Powered Blog Platform',
    template: '%s | TrendWise',
  },
  description: 'Discover trending topics and AI-generated content on TrendWise. Stay updated with the latest trends in technology, business, health, and more.',
  keywords: ['trending topics', 'AI content', 'blog', 'news', 'technology', 'business'],
  authors: [{ name: 'TrendWise Team' }],
  creator: 'TrendWise',
  publisher: 'TrendWise',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'TrendWise - AI-Powered Blog Platform',
    description: 'Discover trending topics and AI-generated content on TrendWise.',
    siteName: 'TrendWise',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TrendWise - AI-Powered Blog Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendWise - AI-Powered Blog Platform',
    description: 'Discover trending topics and AI-generated content on TrendWise.',
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
