'use client';

import React from 'react';
import { useStats } from '@/hooks/useStats';

interface StatsDashboardProps {
  showMediaStats?: boolean;
  showCategoryBreakdown?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export default function StatsDashboard({ 
  showMediaStats = true, 
  showCategoryBreakdown = true, 
  autoRefresh = true,
  className = ''
}: StatsDashboardProps) {
  const { stats, loading, error, lastFetch, fetchStats } = useStats(autoRefresh);

  if (loading && !stats) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Stats</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Content Overview</h2>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              Last updated: {lastFetch?.toLocaleTimeString()}
            </div>
            <button
              onClick={fetchStats}
              className="text-blue-600 hover:text-blue-700 transition-colors"
              title="Refresh stats"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.overview.totalArticles.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {stats.overview.featuredArticles}
            </div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.performance.articlesThisWeek}
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {stats.overview.avgReadingTime}
            </div>
            <div className="text-sm text-gray-600">Avg. Read Time (min)</div>
          </div>
        </div>
      </div>

      {/* Media Stats */}
      {showMediaStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rich Media Content</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.media.totalImages.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700 mb-2">Total Images</div>
              <div className="text-xs text-gray-600">
                {stats.media.avgImagesPerArticle.toFixed(1)} per article
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.media.totalVideos.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 mb-2">Total Videos</div>
              <div className="text-xs text-gray-600">
                {stats.media.avgVideosPerArticle.toFixed(1)} per article
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.media.totalTweets.toLocaleString()}
              </div>
              <div className="text-sm text-green-700 mb-2">Total Tweets</div>
              <div className="text-xs text-gray-600">
                {stats.media.avgTweetsPerArticle.toFixed(1)} per article
              </div>
            </div>
          </div>

          {/* Content Health Indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Content Health</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {stats.performance.contentHealth.withImages}
                </div>
                <div className="text-xs text-gray-600">With Images</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {stats.performance.contentHealth.withVideos}
                </div>
                <div className="text-xs text-gray-600">With Videos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {stats.performance.contentHealth.withTweets}
                </div>
                <div className="text-xs text-gray-600">With Tweets</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {stats.performance.contentHealth.withOgImage}
                </div>
                <div className="text-xs text-gray-600">With OG Images</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {showCategoryBreakdown && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h3>
          
          <div className="space-y-4">
            {stats.categories
              .filter(cat => cat.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{category.category}</div>
                      <div className="text-sm text-gray-600">{category.percentage}% of total content</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">{category.count}</div>
                    <div className="text-xs text-gray-500">
                      {category.featured > 0 && `${category.featured} featured`}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Show empty categories */}
          {stats.categories.filter(cat => cat.count === 0).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Categories needing content:</div>
              <div className="flex flex-wrap gap-2">
                {stats.categories
                  .filter(cat => cat.count === 0)
                  .map(category => (
                    <span
                      key={category.category}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs capitalize"
                    >
                      {category.category}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
