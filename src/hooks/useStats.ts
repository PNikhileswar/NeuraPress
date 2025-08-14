'use client';
import { useState, useEffect, useCallback } from 'react';
export interface CategoryStat {
  category: string;
  count: number;
  featured: number;
  totalReadingTime: number;
  latestArticle: string | null;
  percentage: string;
}
export interface MediaStats {
  totalImages: number;
  totalVideos: number;
  totalTweets: number;
  totalMediaItems: number;
  avgImagesPerArticle: number;
  avgVideosPerArticle: number;
  avgTweetsPerArticle: number;
}
export interface OverviewStats {
  totalArticles: number;
  featuredArticles: number;
  totalReadingTime: number;
  avgReadingTime: number;
  recentArticles: number;
  lastUpdated: string;
}
export interface PlatformStats {
  overview: OverviewStats;
  categories: CategoryStat[];
  media: MediaStats;
  tags: Array<{
    name: string;
    count: number;
    categories: string[];
    percentage: string;
  }>;
  performance: {
    articlesThisWeek: number;
    avgArticlesPerDay: string;
    contentHealth: {
      withImages: number;
      withVideos: number;
      withTweets: number;
      withOgImage: number;
    };
  };
}
export function useStats(autoRefresh = false, refreshInterval = 30000) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/stats', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      const data: PlatformStats = await response.json();
      setStats(data);
      setLastFetch(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);
  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStats]);
  // Get category by name
  const getCategoryStats = useCallback((categoryName: string) => {
    return stats?.categories.find(cat => cat.category === categoryName) || {
      category: categoryName,
      count: 0,
      featured: 0,
      totalReadingTime: 0,
      latestArticle: null,
      percentage: '0.0',
    };
  }, [stats]);
  // Get formatted stats for display
  const getFormattedStats = useCallback(() => {
    if (!stats) return null;
    return {
      ...stats,
      overview: {
        ...stats.overview,
        lastUpdated: new Date(stats.overview.lastUpdated).toLocaleString(),
      },
      categories: stats.categories.map(cat => ({
        ...cat,
        latestArticle: cat.latestArticle 
          ? new Date(cat.latestArticle).toLocaleDateString()
          : null,
      })),
    };
  }, [stats]);
  return {
    stats,
    loading,
    error,
    lastFetch,
    fetchStats,
    getCategoryStats,
    getFormattedStats,
    // Computed values for quick access
    totalArticles: stats?.overview.totalArticles || 0,
    totalImages: stats?.media.totalImages || 0,
    totalVideos: stats?.media.totalVideos || 0,
    totalTweets: stats?.media.totalTweets || 0,
    isHealthy: stats ? (
      stats.performance.contentHealth.withImages > 0 &&
      stats.performance.contentHealth.withVideos > 0 &&
      stats.performance.contentHealth.withTweets > 0
    ) : false,
  };
}
// Hook specifically for category counts (lighter weight)
export function useCategoryCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchCounts() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data: PlatformStats = await response.json();
          const countsMap: Record<string, number> = {};
          data.categories.forEach(cat => {
            countsMap[cat.category] = cat.count;
          });
          setCounts(countsMap);
        }
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);
  return { counts, loading };
}