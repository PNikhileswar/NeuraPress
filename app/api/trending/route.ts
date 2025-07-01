import { NextRequest, NextResponse } from 'next/server';
import { getAllTrendingTopics } from '@/lib/trending';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { generateArticleContent } from '@/lib/openai';
import { createSlug } from '@/lib/utils';

// GET /api/trending - Get trending topics
export async function GET() {
  try {
    const trendingTopics = await getAllTrendingTopics();
    return NextResponse.json(trendingTopics);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending topics' },
      { status: 500 }
    );
  }
}

// POST /api/trending/generate - Generate articles from trending topics
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { count = 5, categories = [] } = body;

    const trendingTopics = await getAllTrendingTopics();
    
    // Filter by categories if specified
    const filteredTopics = categories.length > 0
      ? trendingTopics.filter(topic => categories.includes(topic.category))
      : trendingTopics;

    const topicsToGenerate = filteredTopics.slice(0, count);
    const generatedArticles = [];

    for (const topic of topicsToGenerate) {
      try {
        // Check if article already exists
        const existingArticle = await Article.findOne({
          $or: [
            { title: { $regex: topic.topic, $options: 'i' } },
            { slug: createSlug(topic.topic) }
          ]
        });

        if (existingArticle) {
          console.log(`Article already exists for topic: ${topic.topic}`);
          continue;
        }

        // Generate content using AI
        const generatedContent = await generateArticleContent({
          topic: topic.topic,
          keywords: topic.keywords,
          category: topic.category,
        });

        const articleData = {
          ...generatedContent,
          slug: createSlug(generatedContent.title),
          category: topic.category,
          featured: Math.random() > 0.7, // 30% chance of being featured
          media: {
            images: [],
            videos: [],
            tweets: [],
          },
        };

        const article = new Article(articleData);
        await article.save();
        generatedArticles.push(article);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error generating article for topic ${topic.topic}:`, error);
      }
    }

    return NextResponse.json({
      message: `Generated ${generatedArticles.length} articles from trending topics`,
      articles: generatedArticles,
    });
  } catch (error) {
    console.error('Error generating articles from trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate articles from trending topics' },
      { status: 500 }
    );
  }
}
