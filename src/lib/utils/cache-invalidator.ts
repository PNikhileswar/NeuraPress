/**
 * Cache invalidation utility for category counts
 * Automatically invalidates cache when articles change
 */

interface CacheInvalidationEvent {
  type: 'article_created' | 'article_updated' | 'article_deleted';
  category: string;
  timestamp: Date;
}

/**
 * Invalidate category counts cache when articles change
 */
export async function invalidateCategoryCountsCache(event: CacheInvalidationEvent) {
  try {
    console.log(`🔄 Invalidating category counts cache: ${event.type} in ${event.category}`);
    
    // Invalidate the specific category cache
    await fetch('/api/stats/category-counts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'invalidate',
        category: event.category,
      }),
    });

    // Also invalidate the main stats cache if it exists
    if (typeof window !== 'undefined') {
      // Client-side cache invalidation
      const customEvent = new CustomEvent('categoryCountsInvalidated', {
        detail: { category: event.category, timestamp: new Date() }
      });
      window.dispatchEvent(customEvent);
    }

  } catch (error) {
    console.error('Failed to invalidate category counts cache:', error);
  }
}

/**
 * Invalidate all category counts cache
 */
export async function invalidateAllCategoryCountsCache() {
  try {
    console.log('🔄 Invalidating all category counts cache');
    
    await fetch('/api/stats/category-counts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'invalidate',
      }),
    });

    // Client-side cache invalidation
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('categoryCountsInvalidated', {
        detail: { category: 'all', timestamp: new Date() }
      });
      window.dispatchEvent(customEvent);
    }

  } catch (error) {
    console.error('Failed to invalidate all category counts cache:', error);
  }
}

/**
 * Batch invalidate multiple categories
 */
export async function invalidateMultipleCategoryCountsCache(categories: string[]) {
  try {
    console.log(`🔄 Invalidating multiple category counts cache: ${categories.join(', ')}`);
    
    for (const category of categories) {
      await invalidateCategoryCountsCache({
        type: 'article_updated',
        category,
        timestamp: new Date(),
      });
    }

  } catch (error) {
    console.error('Failed to invalidate multiple category counts cache:', error);
  }
}

/**
 * Set up automatic cache invalidation for article changes
 * This should be called in components that modify articles
 */
export function setupCacheInvalidation() {
  if (typeof window === 'undefined') return;

  // Listen for article changes from other components
  window.addEventListener('articleChanged', (event: any) => {
    const { category, action } = event.detail;
    if (category && action) {
      invalidateCategoryCountsCache({
        type: action,
        category,
        timestamp: new Date(),
      });
    }
  });

  // Listen for manual refresh requests
  window.addEventListener('refreshCategoryCounts', () => {
    invalidateAllCategoryCountsCache();
  });
}

/**
 * Notify other components that an article has changed
 * Call this when creating, updating, or deleting articles
 */
export function notifyArticleChange(category: string, action: 'article_created' | 'article_updated' | 'article_deleted') {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('articleChanged', {
    detail: { category, action, timestamp: new Date() }
  });
  window.dispatchEvent(event);
}
