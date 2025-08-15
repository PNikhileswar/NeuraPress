'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark } from '@/lib/database/models/Bookmark';
export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchBookmarks();
    }
  }, [status, router]);
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bookmarks');
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      const data = await response.json();
      setBookmarks(data);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const removeBookmark = async (articleId: string) => {
    try {
      const response = await fetch(`/api/bookmarks?articleId=${articleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }
      // Remove from local state
      setBookmarks(bookmarks.filter(bookmark => bookmark.articleId !== articleId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      alert('Failed to remove bookmark. Please try again.');
    }
  };
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (status === 'unauthenticated') {
    return null; // Router will redirect
  }
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              My Bookmarks
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              Your saved articles for later reading
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100">
                \uD83D\uDCA1 <strong>Tip:</strong> Click the bookmark icon on any article to save it here for easy access later.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Bookmarks Content */}
      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookmarks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookmarks</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchBookmarks}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookmarks Yet</h3>
            <p className="text-gray-600 mb-6">
              Start bookmarking articles you want to read later. Look for the bookmark icon on articles.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Saved Articles ({bookmarks.length})
              </h2>
              <p className="text-gray-600">
                Articles you've bookmarked for later reading
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {bookmark.articleImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={bookmark.articleImage}
                        alt={bookmark.articleTitle}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {bookmark.articleCategory}
                      </span>
                      <button
                        onClick={() => removeBookmark(bookmark.articleId)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <Link href={`/article/${bookmark.articleSlug}`}>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        {bookmark.articleTitle}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {bookmark.articleExcerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Saved {formatDate(bookmark.bookmarkedAt)}
                      </span>
                      <Link
                        href={`/article/${bookmark.articleSlug}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Read Article  ←’
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}