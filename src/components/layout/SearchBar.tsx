'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
interface SearchBarProps {
  initialSearch?: string;
}
interface SearchSuggestion {
  type: 'article' | 'category' | 'tag';
  text: string;
  url: string;
  description?: string;
}
export default function SearchBar({ initialSearch = '' }: SearchBarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  // Popular search suggestions
  const popularSuggestions: SearchSuggestion[] = [
    { type: 'category', text: 'Technology', url: '/category/technology', description: 'Latest tech trends and innovations' },
    { type: 'category', text: 'Business', url: '/category/business', description: 'Business strategies and insights' },
    { type: 'category', text: 'Health', url: '/category/health', description: 'Health and wellness articles' },
    { type: 'tag', text: 'AI', url: '/?search=AI', description: 'Artificial Intelligence articles' },
    { type: 'tag', text: 'Machine Learning', url: '/?search=Machine%20Learning', description: 'ML algorithms and applications' },
    { type: 'tag', text: 'Remote Work', url: '/?search=Remote%20Work', description: 'Remote work best practices' },
    { type: 'tag', text: 'Digital Transformation', url: '/?search=Digital%20Transformation', description: 'Enterprise digital strategies' },
    { type: 'tag', text: 'Quantum Computing', url: '/?search=Quantum%20Computing', description: 'Quantum technology advances' },
  ];
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (search.trim().length > 0) {
      const filteredSuggestions = popularSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(search.toLowerCase()) ||
        suggestion.description?.toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions(popularSuggestions.slice(0, 6)); // Show top 6 popular suggestions
    }
  }, [search]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/');
    }
  };
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === 'article' || suggestion.type === 'tag') {
      setSearch(suggestion.text);
    }
  };
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'article':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'category':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'tag':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      default:
        return null;
    }
  };
  return (
    <div className="max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Search articles, topics, AI, technology, business..."
            className="block w-full pl-10 pr-32 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-lg shadow-sm"
            autoComplete="off"
            aria-label="Search articles and topics"
            role="searchbox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Search"
          >
            <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md">
              Search
            </span>
          </button>
        </div>
      </form>
      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          <div className="p-2">
            {search.trim().length === 0 && (
              <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                Popular Searches
              </div>
            )}
            {suggestions.map((suggestion, index) => (
              <Link
                key={index}
                href={suggestion.url}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
                role="option"
              >
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 font-medium truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.description && (
                    <div className="text-gray-500 text-sm truncate">
                      {suggestion.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  {suggestion.type}
                </div>
              </Link>
            ))}
          </div>
          {search.trim().length > 0 && (
            <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-xl">
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Search for "{search}"  ←’
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}