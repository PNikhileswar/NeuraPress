import { NextRequest, NextResponse } from 'next/server';
import { getAllTrendingTopics, TrendingTopic } from '@/lib/utils/trending';
import { generateCurrentTrendingTopics, processCurrentTopic } from '@/lib/services/current-news-generation';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      count = 10,
      categories = ['technology', 'business', 'health'],
      maxAge = 7,
      prioritizeRecent = true,
      includePolitics = true,
      includeSports = true
    } = body;

    // Validate input
    if (count < 1 || count > 50) {
      return NextResponse.json(
        { error: 'Article count must be between 1 and 50' },
        { status: 400 }
      );
    }

    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category must be selected' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get trending topics based on selected categories
    let trendingTopics: TrendingTopic[] = [];
    
    try {
      // First try to get real trending topics
      trendingTopics = await getAllTrendingTopics();
      
      // Filter by selected categories
      trendingTopics = trendingTopics.filter(topic => 
        categories.includes(topic.category)
      );

      // If we don't have enough topics, generate some using AI
      if (trendingTopics.length < count) {
        const aiTopics = await generateCurrentTrendingTopics(categories, count - trendingTopics.length);
        const convertedTopics: TrendingTopic[] = aiTopics.map(topic => ({
          topic: topic.title,
          category: topic.category,
          keywords: topic.keywords,
          popularity: topic.trend_score * 1000,
          source: 'manual' as const,
          publishedAt: new Date().toISOString()
        }));
        trendingTopics = [...trendingTopics, ...convertedTopics];
      }
    } catch (error) {
      console.error('Error getting trending topics:', error);
      // Fallback to AI-generated topics
      const aiTopics = await generateCurrentTrendingTopics(categories, count);
      trendingTopics = aiTopics.map(topic => ({
        topic: topic.title,
        category: topic.category,
        keywords: topic.keywords,
        popularity: topic.trend_score * 1000,
        source: 'manual' as const,
        publishedAt: new Date().toISOString()
      }));
    }

    // Limit to requested count and sort by popularity
    trendingTopics = trendingTopics
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, count);

    // Process each topic into an article
    const generatedArticles = [];
    const errors = [];
    let generated = 0;
    let skipped = 0;

    for (const topic of trendingTopics) {
      try {
        // Check if article already exists
        const existingArticle = await Article.findOne({
          title: { $regex: new RegExp(topic.topic.substring(0, 50), 'i') }
        });

        if (existingArticle) {
          skipped++;
          continue;
        }

        // Process the topic into an article
        const article = await processCurrentTopic({
          title: topic.topic,
          category: topic.category,
          keywords: topic.keywords,
          trend_score: topic.popularity / 1000,
          description: `Trending topic: ${topic.topic}`
        });

        if (article) {
          generatedArticles.push({
            title: article.title,
            slug: article.slug,
            category: article.category,
            publishedAt: article.publishedAt,
            source: topic.source,
            originalUrl: topic.url
          });
          generated++;
        }
      } catch (error) {
        console.error(`Error processing topic "${topic.topic}":`, error);
        errors.push(`Failed to process: ${topic.topic} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${generated} articles from trending topics`,
      articles: generatedArticles,
      statistics: {
        requested: count,
        generated,
        skipped,
        errors: errors.length,
        total: generated + skipped + errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in trending generate API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate articles from trending topics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 