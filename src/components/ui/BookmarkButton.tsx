'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
interface BookmarkButtonProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt?: string;
  articleCategory?: string;
  articleImage?: string;
  className?: string;
}
export default function BookmarkButton({
  articleId,
  articleTitle,
  articleSlug,
  articleExcerpt = '',
  articleCategory = 'Uncategorized',
  articleImage,
  className = ''
}: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (session?.user) {
      checkBookmarkStatus();
    }
  }, [session, articleId]);
  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/bookmarks/check?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };
  const handleBookmark = async () => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?articleId=${articleId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setIsBookmarked(false);
        } else {
          throw new Error('Failed to remove bookmark');
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articleId,
            articleTitle,
            articleSlug,
            articleExcerpt,
            articleCategory,
            articleImage,
          }),
        });
        if (response.ok) {
          setIsBookmarked(true);
        } else {
          const error = await response.json();
          if (response.status === 409) {
            setIsBookmarked(true); // Already bookmarked
          } else {
            throw new Error(error.error || 'Failed to add bookmark');
          }
        }
      }
    } catch (error) {
      console.error('Error managing bookmark:', error);
      alert(`Failed to ${isBookmarked ? 'remove' : 'add'} bookmark. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  if (status === 'loading') {
    return (
      <button className={`p-2 rounded-lg bg-gray-100 ${className}`} disabled>
        <svg className="w-5 h-5 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    );
  }
  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
        isBookmarked
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={
        status === 'unauthenticated'
          ? 'Sign in to bookmark articles'
          : isBookmarked
          ? 'Remove from bookmarks'
          : 'Save to bookmarks'
      }
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg 
          className={`w-5 h-5 transition-colors ${isBookmarked ? 'fill-current' : ''}`}
          fill={isBookmarked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
}