import { NextRequest, NextResponse } from 'next/server';
import { getAllTrendingTopics } from '@/lib/trending';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';
import { generateArticleContent } from '@/lib/openai';
import { createSlug } from '@/lib/utils';

// POST /api/trending/generate - Generate articles from trending topics
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const { count = 10, categories = [], maxAge = 7 } = body;

    console.log(`Starting article generation for ${count} articles...`);

    const trendingTopics = await getAllTrendingTopics();
    console.log(`Found ${trendingTopics.length} trending topics`);
    
    // Filter by categories if specified
    const filteredTopics = categories.length > 0
      ? trendingTopics.filter(topic => categories.includes(topic.category))
      : trendingTopics;

    const topicsToGenerate = filteredTopics.slice(0, count);
    console.log(`Will attempt to generate ${topicsToGenerate.length} articles`);
    
    const generatedArticles = [];
    const errors = [];

    for (const topic of topicsToGenerate) {
      try {
        // Check if we have a recent article on this topic (within maxAge days)
        const maxAgeDate = new Date();
        maxAgeDate.setDate(maxAgeDate.getDate() - maxAge);
        
        const recentArticle = await Article.findOne({
          $and: [
            {
              $or: [
                { title: { $regex: topic.topic.split(' ').slice(0, 3).join('|'), $options: 'i' } },
                { tags: { $in: topic.keywords.slice(0, 2) } }
              ]
            },
            { publishedAt: { $gte: maxAgeDate } }
          ]
        });

        if (recentArticle) {
          console.log(`Recent article exists for topic: ${topic.topic} (published: ${recentArticle.publishedAt})`);
          continue;
        }

        console.log(`Generating article for topic: ${topic.topic}`);

        // Generate content using AI
        const generatedContent = await generateArticleContent({
          topic: topic.topic,
          keywords: topic.keywords,
          category: topic.category,
        });

        // Create a unique slug with timestamp to ensure uniqueness
        const baseSlug = createSlug(generatedContent.title);
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        let uniqueSlug = `${baseSlug}-${timestamp}`;
        
        // Double-check slug doesn't exist (very unlikely with timestamp)
        const existingSlug = await Article.findOne({ slug: uniqueSlug });
        if (existingSlug) {
          // If by some miracle it exists, add random suffix
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          uniqueSlug = `${baseSlug}-${randomSuffix}`;
        }

        // Extract image URLs from content
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const images: string[] = [];
        let match;
        while ((match = imageRegex.exec(generatedContent.content)) !== null) {
          images.push(match[1]);
        }

        const articleData = {
          ...generatedContent,
          slug: uniqueSlug, // Use the unique slug we generated
          category: topic.category,
          ogImage: images.length > 0 ? images[0] : undefined, // Set first image as ogImage
          featured: Math.random() > 0.7, // 30% chance of being featured
          media: {
            images: images,
            videos: [],
            tweets: [],
          },
        };

        const article = new Article(articleData);
        await article.save();
        generatedArticles.push(article);

        console.log(`Successfully generated article: ${generatedContent.title}`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating article for topic ${topic.topic}:`, error);
        errors.push({ topic: topic.topic, error: error instanceof Error ? error.message : 'Unknown error' });
        // Continue to next topic instead of stopping
        continue;
      }
    }

    console.log(`Successfully generated ${generatedArticles.length} articles`);
    if (errors.length > 0) {
      console.log(`Encountered ${errors.length} errors:`, errors);
    }

    return NextResponse.json({
      message: `Generated ${generatedArticles.length} articles from trending topics`,
      articles: generatedArticles,
      errors: errors.length > 0 ? errors : undefined,
      totalTopicsAttempted: topicsToGenerate.length,
    });
  } catch (error) {
    console.error('Error generating articles from trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate articles from trending topics' },
      { status: 500 }
    );
  }
}
