import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';
import { getCachedStats, updateStatsCache, getRecentEvents } from '@/lib/utils/stats-cache';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
// GET /api/stats - Get dynamic platform statistics
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cacheResult = getCachedStats();
    if (cacheResult.cached && !cacheResult.needsRefresh) {
      console.log('ðŸ“Š Returning cached stats');
      return NextResponse.json({
        ...cacheResult.data,
        cached: true,
        lastUpdate: cacheResult.lastUpdate
      });
    }
    console.log('ðŸ“Š Fetching fresh stats from database');
    await connectDB();
    // Get category counts
    const categoryStats = await Article.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          featured: { $sum: { $cond: ['$featured', 1, 0] } },
          totalReadingTime: { $sum: '$readingTime' },
          latestArticle: { $max: '$publishedAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    // Get media statistics
    const mediaStats = await Article.aggregate([
      {
        $project: {
          category: 1,
          imageCount: { $size: '$media.images' },
          videoCount: { $size: '$media.videos' },
          tweetCount: { $size: '$media.tweets' },
          totalMedia: {
            $add: [
              { $size: '$media.images' },
              { $size: '$media.videos' },
              { $size: '$media.tweets' }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalImages: { $sum: '$imageCount' },
          totalVideos: { $sum: '$videoCount' },
          totalTweets: { $sum: '$tweetCount' },
          totalMediaItems: { $sum: '$totalMedia' },
          avgImagesPerArticle: { $avg: '$imageCount' },
          avgVideosPerArticle: { $avg: '$videoCount' },
          avgTweetsPerArticle: { $avg: '$tweetCount' }
        }
      }
    ]);
    // Get overall statistics
    const totalArticles = await Article.countDocuments();
    const featuredArticles = await Article.countDocuments({ featured: true });
    const totalReadingTime = await Article.aggregate([
      { $group: { _id: null, total: { $sum: '$readingTime' } } }
    ]);
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentArticles = await Article.countDocuments({
      publishedAt: { $gte: sevenDaysAgo }
    });
    // Get tag popularity
    const tagStats = await Article.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    // Format category statistics with proper defaults
    const formattedCategoryStats = categoryStats.map(stat => ({
      category: stat._id,
      count: stat.count,
      featured: stat.featured,
      totalReadingTime: stat.totalReadingTime,
      latestArticle: stat.latestArticle,
      percentage: ((stat.count / totalArticles) * 100).toFixed(1)
    }));
    // Ensure all main categories are represented
    const allCategories = ['technology', 'business', 'health', 'lifestyle', 'finance', 'science', 'environment'];
    const completeCategories = allCategories.map(category => {
      const existing = formattedCategoryStats.find(stat => stat.category === category);
      return existing || {
        category,
        count: 0,
        featured: 0,
        totalReadingTime: 0,
        latestArticle: null,
        percentage: '0.0'
      };
    });
    const response = {
      overview: {
        totalArticles,
        featuredArticles,
        totalReadingTime: totalReadingTime[0]?.total || 0,
        avgReadingTime: totalArticles > 0 ? Math.round((totalReadingTime[0]?.total || 0) / totalArticles) : 0,
        recentArticles: recentArticles,
        lastUpdated: new Date()
      },
      categories: completeCategories,
      media: {
        totalImages: mediaStats[0]?.totalImages || 0,
        totalVideos: mediaStats[0]?.totalVideos || 0,
        totalTweets: mediaStats[0]?.totalTweets || 0,
        totalMediaItems: mediaStats[0]?.totalMediaItems || 0,
        avgImagesPerArticle: Math.round((mediaStats[0]?.avgImagesPerArticle || 0) * 10) / 10,
        avgVideosPerArticle: Math.round((mediaStats[0]?.avgVideosPerArticle || 0) * 10) / 10,
        avgTweetsPerArticle: Math.round((mediaStats[0]?.avgTweetsPerArticle || 0) * 10) / 10
      },
      tags: tagStats.map(tag => ({
        name: tag._id,
        count: tag.count,
        categories: tag.categories,
        percentage: ((tag.count / totalArticles) * 100).toFixed(1)
      })),
      performance: {
        articlesThisWeek: recentArticles,
        avgArticlesPerDay: totalArticles > 0 ? (totalArticles / 30).toFixed(1) : '0.0', // Last 30 days estimate
        contentHealth: {
          withImages: await Article.countDocuments({ 'media.images.0': { $exists: true } }),
          withVideos: await Article.countDocuments({ 'media.videos.0': { $exists: true } }),
          withTweets: await Article.countDocuments({ 'media.tweets.0': { $exists: true } }),
          withOgImage: await Article.countDocuments({ ogImage: { $exists: true, $ne: '' } })
        }
      },
      recentEvents: getRecentEvents(5), // Include recent activity
      cached: false,
      deploymentCheck: "v2.0" // Version check
    };
    // Update cache with fresh data
    updateStatsCache(response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    console.error('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    // Return empty stats instead of error to prevent UI breakage
    return NextResponse.json({
      overview: {
        totalArticles: 0,
        featuredArticles: 0,
        totalReadingTime: 0,
        avgReadingTime: 0,
        recentArticles: 0,
        lastUpdated: new Date()
      },
      categories: [],
      media: {
        totalImages: 0,
        totalVideos: 0,
        totalTweets: 0,
        totalMediaItems: 0,
        avgImagesPerArticle: 0,
        avgVideosPerArticle: 0,
        avgTweetsPerArticle: 0
      },
      tags: [],
      performance: {
        articlesThisWeek: 0,
        avgArticlesPerDay: '0.0',
        contentHealth: {
          withImages: 0,
          withVideos: 0,
          withTweets: 0,
          withOgImage: 0
        }
      },
      recentEvents: [],
      cached: false,
      error: 'Database connection failed - check MongoDB Atlas IP whitelist'
    });
  }
}