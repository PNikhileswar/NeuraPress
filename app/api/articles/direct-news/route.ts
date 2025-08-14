import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { generateRealTimeNewsArticles } from '@/lib/services/realtime-news-generation';
// POST /api/articles/direct-news - Generate REAL current breaking news articles
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    const body = await request.json().catch(() => ({}));
    const {
      categories = ['technology', 'business', 'health', 'science', 'sports'],
      limit = 5,
      country = 'us',
      hours = 24,
      autoSave = true
    } = body;
    console.log(`ðŸš€ Generating REAL current news articles...`);
    console.log(`Settings: categories=${categories.join(',')}, limit=${limit}, hours=${hours}`);
    // Generate REAL current news articles from NewsAPI.org
    const results = await generateRealTimeNewsArticles({
      categories: Array.isArray(categories) ? categories : [categories],
      limit: Math.min(limit, 20), // Cap at 20 to prevent abuse
      country,
      hours,
      autoSave
    });
    if (results.processed.length === 0) {
      return NextResponse.json({
        message: 'No current real articles were found',
        reason: 'This could be due to no recent articles in selected categories, or NewsAPI limits.',
        suggestions: [
          'Try different categories',
          'Increase hours parameter (try 48 or 72)',
          'Check NewsAPI.org API key configuration',
          'Try different country codes (us, gb, ca, au)'
        ]
      });
    }
    const response = {
      message: `Successfully generated ${results.processed.length} REAL current news articles`,
      date: new Date().toISOString().split('T')[0],
      provider: 'NewsAPI.org (Real-time)',
      statistics: {
        processed: results.processed.length,
        saved: results.saved || 0,
        skipped: results.skipped || 0,
        errors: results.errors?.length || 0
      },
      articles: results.processed.map((article: any) => ({
        title: article.title,
        slug: article.slug,
        category: article.category,
        publishedAt: article.publishedAt,
        readingTime: article.readingTime,
        source: article.originalSource.sourceName,
        originalUrl: article.originalSource.url
      })),
      errors: results.errors && results.errors.length > 0 ? results.errors : undefined
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in real-time news generation API:', error);
    let errorMessage = 'Failed to generate real-time news articles';
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('NewsAPI') || error.message.includes('API key')) {
        errorMessage = 'NewsAPI.org error - check API key configuration';
        statusCode = 503;
      }
    }
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: {
          checkNewsAPI: 'Get a free API key from https://newsapi.org and add it to NEWS_API_KEY in .env.local',
          checkConnection: 'Test internet connectivity',
          reduceLimit: 'Try reducing the limit parameter',
          increaseHours: 'Try increasing hours parameter for more articles'
        }
      },
      { status: statusCode }
    );
  }
}
// GET /api/articles/direct-news - Get information about direct news generation capabilities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const info = searchParams.get('info');
    if (info === 'capabilities') {
      return NextResponse.json({
        title: 'Real-Time Breaking News Generation',
        description: 'Fetch and process REAL current news articles from NewsAPI.org with today\'s dates',
        capabilities: {
          'Real Current News': 'Fetch actual current news articles from NewsAPI.org',
          'Today\'s Dates': 'All articles have real publication dates from the last 24-48 hours',
          'Live Content': 'Get fresh articles published by real news sources today',
          'No Repetition': 'Each API call fetches different articles based on real news flow',
          'Proper Attribution': 'Real source names, authors, and original article links',
          'Enhanced Content': 'AI enhances short articles while maintaining accuracy',
          'Media Integration': 'Automatically adds relevant images and videos',
          'SEO Optimized': 'Generate SEO-friendly metadata from real content',
          'Category Support': 'Technology, business, health, science, sports categories',
          'Quality Filtering': 'Filters out removed/truncated articles automatically',
          'Duplicate Prevention': 'Avoids saving duplicate articles to database'
        },
        advantages: {
          'Always Fresh': 'Real news articles published within last 24-48 hours',
          'No Fake Dates': 'Uses actual publication timestamps from news sources',
          'Unique Every Time': 'Different articles each time based on real news cycle',
          'Real Sources': 'Actual news outlets like CNN, BBC, TechCrunch, etc.',
          'Accurate Content': 'Real journalism, not AI-generated fake news',
          'Live Updates': 'Reflects current events, breaking news, market changes',
          'Professional Quality': 'Content from established news organizations',
          'Proper Links': 'Original article URLs for source verification'
        },
        configuration: {
          categories: ['technology', 'business', 'health', 'science', 'sports'],
          countries: ['us', 'gb', 'ca', 'au', 'de', 'fr', 'in'],
          hours: '12-72 hours (how far back to search)',
          limit: '1-20 articles per request'
        },
        requirements: {
          newsAPI: 'NEWS_API_KEY from newsapi.org (free tier: 1000 requests/day)',
          adminAccess: 'Admin user authentication required'
        }
      });
    }
    // Default response - show current status
    const hasNewsAPI = !!process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'your-newsapi-org-key-here';
    return NextResponse.json({
      message: 'Real-Time Breaking News Generation API',
      status: hasNewsAPI ? 'Ready with NewsAPI.org' : 'NewsAPI Key Required',
      provider: 'NewsAPI.org (Real-time news)',
      date: new Date().toISOString().split('T')[0],
      benefits: [
        'âœ… REAL current news from major outlets',
        'âœ… Actual today\'s dates - no fake timestamps', 
        'âœ… Different articles every time',
        'âœ… Professional journalism quality',
        'âœ… Proper source attribution'
      ],
      setup: hasNewsAPI ? 'Ready to use!' : 'Get free API key from https://newsapi.org',
      usage: {
        endpoint: 'POST /api/articles/direct-news',
        method: 'POST',
        authentication: 'Admin access required',
        parameters: {
          categories: 'Array of categories (optional)',
          limit: 'Number of articles (default: 5, max: 20)',
          country: 'Country code (default: us)',
          hours: 'Hours back to search (default: 24)',
          autoSave: 'Auto-save to database (default: true)'
        }
      },
      examples: {
        basicUsage: {
          method: 'POST',
          body: { limit: 3 }
        },
        singleCategory: {
          method: 'POST',
          body: {
            categories: ['technology'],
            limit: 1,
            hours: 12
          }
        },
        international: {
          method: 'POST',
          body: {
            country: 'gb',
            categories: ['business'],
            limit: 5
          }
        }
      }
    });
  } catch (error) {
    console.error('Error in direct news generation info API:', error);
    return NextResponse.json(
      { error: 'Failed to get API information' },
      { status: 500 }
    );
  }
}