import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Cache duration: 5 minutes for category counts
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory cache for category counts
let categoryCountsCache: Record<string, number> = {};
let lastCacheUpdate: number = 0;

// GET /api/stats/category-counts - Get only category counts (lightweight)
export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    
    // Check if cache is still valid
    if (categoryCountsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
      return NextResponse.json({
        counts: categoryCountsCache,
        cached: true,
        lastUpdate: new Date(lastCacheUpdate),
        cacheAge: Math.round((now - lastCacheUpdate) / 1000)
      });
    }

    // Fetch fresh data from database
    await connectDB();
    
    // Use a single, efficient aggregation pipeline
    const categoryStats = await Article.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Convert to simple counts object
    const counts: Record<string, number> = {};
    categoryStats.forEach(stat => {
      counts[stat._id] = stat.count;
    });

    // Ensure all main categories are represented (even with 0 count)
    const mainCategories = [
      'technology', 'business', 'health', 'lifestyle', 
      'finance', 'science', 'environment', 'sports', 
      'politics', 'entertainment'
    ];
    
    mainCategories.forEach(category => {
      if (!(category in counts)) {
        counts[category] = 0;
      }
    });

    // Update cache
    categoryCountsCache = counts;
    lastCacheUpdate = now;

    return NextResponse.json({
      counts,
      cached: false,
      lastUpdate: new Date(lastCacheUpdate),
      cacheAge: 0
    });

  } catch (error) {
    console.error('Error fetching category counts:', error);
    
    // Return cached data if available, even if expired
    if (Object.keys(categoryCountsCache).length > 0) {
      return NextResponse.json({
        counts: categoryCountsCache,
        cached: true,
        lastUpdate: new Date(lastCacheUpdate),
        cacheAge: Math.round((Date.now() - lastCacheUpdate) / 1000),
        error: 'Using cached data due to database error'
      });
    }

    // Return empty counts if no cache available
    return NextResponse.json({
      counts: {},
      cached: false,
      lastUpdate: new Date(),
      cacheAge: 0,
      error: 'Failed to fetch category counts'
    });
  }
}

// POST /api/stats/category-counts - Invalidate cache (called when articles change)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, category } = body;
    
    // Invalidate cache for specific category or all categories
    if (action === 'invalidate') {
      if (category) {
        // Invalidate specific category
        delete categoryCountsCache[category];
        console.log(`📊 Invalidated cache for category: ${category}`);
      } else {
        // Invalidate all cache
        categoryCountsCache = {};
        lastCacheUpdate = 0;
        console.log('📊 Invalidated all category counts cache');
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidated',
      invalidatedCategory: category || 'all'
    });
  } catch (error) {
    console.error('Error invalidating category counts cache:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to invalidate cache' 
    }, { status: 500 });
  }
}
