'use client';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
export default function Hero() {
  const { stats, loading } = useStats();
  return (
    <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover & Save
            <span className="block bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Your Favorites
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
            AI-powered articles on technology, business, health, and lifestyle. 
            Discover great content and bookmark articles for later reading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#latest-articles"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Articles
            </a>
            <Link
              href="/bookmarks"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              My Bookmarks
            </Link>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="border-t border-blue-500 bg-blue-700 bg-opacity-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {loading ? '...' : stats?.overview.totalArticles || 0}
              </div>
              <div className="text-blue-200">AI-Generated Articles</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">âˆž</div>
              <div className="text-blue-200">Personal Bookmarks</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Always Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}