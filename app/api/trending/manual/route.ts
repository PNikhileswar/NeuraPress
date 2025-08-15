import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { addManualTopic } from '@/lib/utils/trending';
import { generateArticleContent } from '@/lib/services/openai';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';
import { createSlug } from '@/lib/utils/utils';
// POST /api/trending/manual - Add manual topic and optionally generate article
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    await connectDB();
    const body = await request.json();
    const { 
      topic, 
      category = 'general', 
      keywords = [], 
      generateArticle = false,
      priority = 'high' // high, medium, low
    } = body;
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    // Validate category
    const validCategories = [
      'technology', 'business', 'health', 'science', 'sports', 
      'politics', 'entertainment', 'environment', 'finance', 
      'lifestyle', 'general'
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }
    // Generate keywords if not provided
    const finalKeywords = keywords.length > 0 ? keywords : topic.split(' ').filter((word: string) => word.length > 2);
    // Create manual topic
    const manualTopic = await addManualTopic(topic, category, finalKeywords);
    // Set priority-based popularity
    switch (priority) {
      case 'high':
        manualTopic.popularity = 150000;
        break;
      case 'medium':
        manualTopic.popularity = 100000;
        break;
      case 'low':
        manualTopic.popularity = 75000;
        break;
    }
    let generatedArticle = null;
    // Generate article if requested
    if (generateArticle) {
      console.log(`ðŸš€ Generating article for manual topic: "${topic}"`);
      // Check if similar article already exists
      const existingArticle = await Article.findOne({
        $or: [
          { title: { $regex: topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
          { tags: { $in: finalKeywords } }
        ]
      }).sort({ publishedAt: -1 });
      if (existingArticle) {
        console.log(`âš ï¸ Similar article already exists: "${existingArticle.title}"`);
        return NextResponse.json({
          message: 'Manual topic added successfully',
          topic: manualTopic,
          warning: 'Similar article already exists',
          existingArticle: {
            id: existingArticle._id,
            title: existingArticle.title,
            slug: existingArticle.slug,
            publishedAt: existingArticle.publishedAt
          }
        });
      }
      try {
        // Generate content using AI
        const generatedContent = await generateArticleContent({
          topic: manualTopic.topic,
          keywords: manualTopic.keywords,
          category: manualTopic.category,
        });
        // Create unique slug
        const baseSlug = createSlug(generatedContent.title);
        const timestamp = Date.now().toString().slice(-6);
        let uniqueSlug = `${baseSlug}-${timestamp}`;
        // Double-check slug uniqueness
        const existingSlug = await Article.findOne({ slug: uniqueSlug });
        if (existingSlug) {
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          uniqueSlug = `${baseSlug}-${randomSuffix}`;
        }
        // Get OG image
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const imageMatch = imageRegex.exec(generatedContent.content);
        let ogImageUrl = imageMatch ? imageMatch[1] : undefined;
        if (!ogImageUrl && generatedContent.media.images.length > 0) {
          ogImageUrl = generatedContent.media.images[0].url;
        }
        if (!ogImageUrl) {
          ogImageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop&crop=center';
        }
        const articleData = {
          ...generatedContent,
          slug: uniqueSlug,
          category: manualTopic.category,
          ogImage: ogImageUrl,
          featured: priority === 'high', // High priority topics are featured
          tags: Array.from(new Set([...generatedContent.tags, ...manualTopic.keywords])), // Merge tags
        };
        const article = new Article(articleData);
        await article.save();
        generatedArticle = article;
        console.log(` ❌… Successfully generated article: ${generatedContent.title}`);
      } catch (error) {
        console.error('Error generating article for manual topic:', error);
        return NextResponse.json({
          message: 'Manual topic added but article generation failed',
          topic: manualTopic,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    return NextResponse.json({
      message: generateArticle ? 
        'Manual topic added and article generated successfully' : 
        'Manual topic added successfully',
      topic: manualTopic,
      article: generatedArticle ? {
        id: generatedArticle._id,
        title: generatedArticle.title,
        slug: generatedArticle.slug,
        category: generatedArticle.category,
        publishedAt: generatedArticle.publishedAt
      } : null
    });
  } catch (error) {
    console.error('Error adding manual topic:', error);
    return NextResponse.json(
      { error: 'Failed to add manual topic' },
      { status: 500 }
    );
  }
}
// GET /api/trending/manual - Get list of recent manual topics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    await connectDB();
    // Get recent articles that were generated from manual topics
    const manualArticles = await Article.find({
      tags: { $regex: /manual|breaking|urgent/i }
    })
    .sort({ publishedAt: -1 })
    .limit(20)
    .select('title slug category publishedAt tags');
    return NextResponse.json({
      message: 'Recent manual topics retrieved successfully',
      articles: manualArticles
    });
  } catch (error) {
    console.error('Error fetching manual topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual topics' },
      { status: 500 }
    );
  }
}