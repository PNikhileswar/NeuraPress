'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';

interface BookmarkContextType {
  bookmarks: { [articleId: string]: boolean };
  isBookmarked: (articleId: string) => boolean;
  toggleBookmark: (articleId: string) => Promise<void>;
  isLoading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | null>(null);

interface BookmarkProviderProps {
  children: ReactNode;
  articleIds: string[];
}

export function BookmarkProvider({ children, articleIds }: BookmarkProviderProps) {
  const { bookmarks, isBookmarked, toggleBookmark, isLoading } = useBookmarks(articleIds);

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark, isLoading }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarkContext() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarkContext must be used within a BookmarkProvider');
  }
  return context;
}

// Simple bookmark button that uses the context
export function ContextBookmarkButton({ 
  articleId, 
  className = '' 
}: { 
  articleId: string; 
  className?: string; 
}) {
  const { isBookmarked, toggleBookmark, isLoading } = useBookmarkContext();
  const bookmarked = isBookmarked(articleId);

  return (
    <button
      onClick={() => toggleBookmark(articleId)}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
        bookmarked
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
    >
      {isLoading ? (
        <span className="text-sm">...</span>
      ) : (
        <span className="text-lg">
          {bookmarked ? '★' : '☆'}
        </span>
      )}
    </button>
  );
}
