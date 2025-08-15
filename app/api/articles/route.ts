import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';
import { generateArticleContent } from '@/lib/services/openai';
import { createSlug } from '@/lib/utils/utils';
import { invalidateStatsCache, notifyStatsUpdate } from '@/lib/utils/stats-cache';
// GET /api/articles - Get all articles with pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const skip = (page - 1) * limit;
    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const articles = await Article
      .find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude full content for list view
    const total = await Article.countDocuments(query);
    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { topic, keywords, category, autoGenerate = true } = body;
    if (!topic || !category) {
      return NextResponse.json(
        { error: 'Topic and category are required' },
        { status: 400 }
      );
    }
    let articleData;
    if (autoGenerate) {
      // Generate content using AI
      const generatedContent = await generateArticleContent({
        topic,
        keywords: keywords || [],
        category,
      });
      articleData = {
        ...generatedContent,
        slug: createSlug(generatedContent.title),
        category,
        featured: false,
        // Keep the generated media instead of overriding with empty arrays
        media: generatedContent.media || {
          images: [],
          videos: [],
          tweets: [],
        },
      };
    } else {
      // Manual content creation
      const { title, content, metaDescription, tags = [] } = body;
      if (!title || !content) {
        return NextResponse.json(
          { error: 'Title and content are required for manual creation' },
          { status: 400 }
        );
      }
      articleData = {
        title,
        content,
        slug: createSlug(title),
        excerpt: content.substring(0, 200) + '...',
        metaDescription: metaDescription || content.substring(0, 160) + '...',
        metaKeywords: keywords || [],
        category,
        tags,
        readingTime: Math.ceil(content.split(' ').length / 200),
        featured: false,
        media: {
          images: [],
          videos: [],
          tweets: [],
        },
        seoData: {
          title,
          description: metaDescription || content.substring(0, 160) + '...',
          keywords: keywords || [],
        },
      };
    }
    const article = new Article(articleData);
    await article.save();
    // Invalidate stats cache and notify of the update
    const updateEvent = {
      type: 'article_created' as const,
      articleId: article._id.toString(),
      category: article.category,
      timestamp: new Date()
    };
    invalidateStatsCache(updateEvent);
    notifyStatsUpdate(updateEvent);
  console.log(`📝 Article created: "${article.title}" in ${article.category} category`);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}