import { useState, useEffect, useCallback, useRef } from 'react';

interface CategoryCounts {
  [category: string]: number;
}

interface UseOptimizedCategoryCountsReturn {
  counts: CategoryCounts;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  cacheAge: number;
  refresh: () => Promise<void>;
  invalidateCache: () => Promise<void>;
}

export function useOptimizedCategoryCounts(): UseOptimizedCategoryCountsReturn {
  const [counts, setCounts] = useState<CategoryCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cacheAge, setCacheAge] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch category counts from the optimized API
  const fetchCounts = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stats/category-counts', {
        signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch category counts: ${response.status}`);
      }

      const data = await response.json();
      
      if (signal?.aborted) return;

      setCounts(data.counts);
      setLastUpdate(new Date(data.lastUpdate));
      setCacheAge(data.cacheAge || 0);

      // If data is cached and old, schedule a refresh
      if (data.cached && data.cacheAge > 240) { // 4 minutes
        scheduleRefresh();
      }

    } catch (err) {
      if (signal?.aborted) return;
      
      console.error('Error fetching category counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch category counts');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Schedule a background refresh
  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      fetchCounts();
    }, 5000); // Refresh after 5 seconds
  }, [fetchCounts]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    await fetchCounts(abortControllerRef.current.signal);
  }, [fetchCounts]);

  // Invalidate cache function
  const invalidateCache = useCallback(async () => {
    try {
      await fetch('/api/stats/category-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'invalidate' }),
      });
      
      // Immediately refresh data
      await refresh();
    } catch (err) {
      console.error('Error invalidating cache:', err);
    }
  }, [refresh]);

  // Initial fetch
  useEffect(() => {
    fetchCounts();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchCounts]);

  // Set up periodic refresh (every 2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchCounts();
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchCounts, loading]);

  // Listen for cache invalidation events
  useEffect(() => {
    const handleCacheInvalidated = (event: CustomEvent) => {
      const { category } = event.detail;
      console.log(`🔄 Cache invalidated for category: ${category}, refreshing...`);
      
      // Immediately refresh the data
      if (category === 'all') {
        fetchCounts();
      } else if (category in counts) {
        // For specific category, just refresh to get updated counts
        fetchCounts();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('categoryCountsInvalidated', handleCacheInvalidated as EventListener);
      
      return () => {
        window.removeEventListener('categoryCountsInvalidated', handleCacheInvalidated as EventListener);
      };
    }
  }, [fetchCounts, counts]);

  return {
    counts,
    loading,
    error,
    lastUpdate,
    cacheAge,
    refresh,
    invalidateCache,
  };
}
