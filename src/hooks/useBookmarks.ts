import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface BookmarkState {
  [articleId: string]: boolean;
}

interface UseBookmarksReturn {
  bookmarks: BookmarkState;
  isBookmarked: (articleId: string) => boolean;
  toggleBookmark: (articleId: string) => Promise<void>;
  isLoading: boolean;
}

export function useBookmarks(articleIds: string[]): UseBookmarksReturn {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkState>({});
  const [isLoading, setIsLoading] = useState(false);
  const pendingUpdates = useRef<Set<string>>(new Set());

  // Batch check bookmarks for multiple articles
  const checkBookmarks = useCallback(async (ids: string[]) => {
    if (!session?.user?.email || ids.length === 0) return;

    try {
      const response = await fetch('/api/bookmarks/batch-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleIds: ids }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarks(prev => ({ ...prev, ...data.bookmarks }));
      }
    } catch (error) {
      console.error('Error checking bookmarks:', error);
    }
  }, [session?.user?.email]);

  // Initialize bookmarks for the provided article IDs
  useEffect(() => {
    if (articleIds.length > 0 && session?.user?.email) {
      const uncheckedIds = articleIds.filter(id => !(id in bookmarks));
      if (uncheckedIds.length > 0) {
        checkBookmarks(uncheckedIds);
      }
    }
  }, [articleIds, session?.user?.email, bookmarks, checkBookmarks]);

  // Toggle bookmark state
  const toggleBookmark = useCallback(async (articleId: string) => {
    if (!session?.user?.email) return;

    // Optimistically update UI
    setBookmarks(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));

    // Add to pending updates to prevent duplicate requests
    if (pendingUpdates.current.has(articleId)) return;
    pendingUpdates.current.add(articleId);

    try {
      const isCurrentlyBookmarked = bookmarks[articleId];
      const method = isCurrentlyBookmarked ? 'DELETE' : 'POST';

      const response = await fetch('/api/bookmarks', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (!response.ok) {
        // Revert on error
        setBookmarks(prev => ({
          ...prev,
          [articleId]: !prev[articleId]
        }));
        throw new Error('Failed to update bookmark');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      pendingUpdates.current.delete(articleId);
    }
  }, [bookmarks, session?.user?.email]);

  // Check if an article is bookmarked
  const isBookmarked = useCallback((articleId: string): boolean => {
    return bookmarks[articleId] || false;
  }, [bookmarks]);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    isLoading,
  };
}
