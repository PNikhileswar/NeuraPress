'use client';

import React from 'react';
import { useStats } from '@/hooks/useStats';
import Link from 'next/link';

interface StatsWidgetProps {
  className?: string;
  showCategories?: boolean;
}

export default function StatsWidget({ className = '', showCategories = true }: StatsWidgetProps) {
  const { stats, loading, totalArticles, totalImages, totalVideos, totalTweets } = useStats(true);

  if (loading && !stats) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Platform Statistics</h3>
        <div className="flex items-center gap-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs">Live</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {totalArticles.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Articles</div>
        </div>
        
        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {totalImages.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Images</div>
        </div>
        
        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {totalVideos.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Videos</div>
        </div>
        
        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {totalTweets.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Tweets</div>
        </div>
      </div>

      {/* Category Quick View */}
      {showCategories && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Active Categories</div>
          <div className="flex flex-wrap gap-2">
            {stats.categories
              .filter(cat => cat.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(category => (
                <Link
                  key={category.category}
                  href={`/?category=${category.category}`}
                  className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors shadow-sm"
                >
                  <span className="capitalize">{category.category}</span>
                  <span className="ml-1 font-medium">({category.count})</span>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Activity Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>
          {stats.performance.articlesThisWeek} articles this week
        </span>
        <Link 
          href="/admin" 
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View Dashboard →
        </Link>
      </div>
    </div>
  );
}
