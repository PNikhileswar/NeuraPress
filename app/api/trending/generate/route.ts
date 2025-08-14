import { NextRequest, NextResponse } from 'next/server';
import { getAllTrendingTopics } from '@/lib/utils/trending';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';
import { generateArticleContent } from '@/lib/services/openai';
import { createSlug } from '@/lib/utils/utils';
// POST /api/trending/generate - Generate articles from trending topics
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { 
      count = 10, 
      categories = [], 
      maxAge = 7,
      prioritizeRecent = true,
      includePolitics = true,
      includeSports = true 
    } = body;
    console.log(`Starting article generation for ${count} articles...`);
    console.log(`Settings: maxAge=${maxAge} days, prioritizeRecent=${prioritizeRecent}, includePolitics=${includePolitics}, includeSports=${includeSports}`);
    const trendingTopics = await getAllTrendingTopics();
    console.log(`Found ${trendingTopics.length} trending topics from various sources`);
    // Helper function to calculate topic priority
    const calculateTopicPriority = (topic: any) => {
      let score = topic.popularity || 50000;
      // Boost recent content
      if (topic.publishedAt) {
        const hoursAgo = (Date.now() - new Date(topic.publishedAt).getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 6) score *= 2.0;
        else if (hoursAgo < 24) score *= 1.5;
      }
      // Boost manual and breaking news
      if (topic.source === 'manual' || topic.source === 'news_api') score *= 1.3;
      return score;
    };
    // Filter by categories if specified
    let filteredTopics = categories.length > 0
      ? trendingTopics.filter(topic => categories.includes(topic.category))
      : trendingTopics;
    // Filter out politics/sports if requested
    if (!includePolitics) {
      filteredTopics = filteredTopics.filter(topic => topic.category !== 'politics');
      console.log('Filtering out politics topics');
    }
    if (!includeSports) {
      filteredTopics = filteredTopics.filter(topic => topic.category !== 'sports');
      console.log('Filtering out sports topics');
    }
    // Sort by recency and priority if requested
    if (prioritizeRecent) {
      filteredTopics.sort((a, b) => {
        const scoreA = calculateTopicPriority(a);
        const scoreB = calculateTopicPriority(b);
        return scoreB - scoreA;
      });
      console.log('Prioritizing recent and high-priority topics');
    }
    const topicsToGenerate = filteredTopics.slice(0, count);
    console.log(`Will attempt to generate ${topicsToGenerate.length} articles`);
    const categories_set = Array.from(new Set(topicsToGenerate.map(t => t.category)));
    console.log(`Topic categories: ${categories_set.join(', ')}`);
    // Pre-filter topics to exclude those with recent articles (more efficient)
    console.log('Pre-filtering topics to exclude those with recent articles...');
    const maxAgeDate = new Date();
    maxAgeDate.setDate(maxAgeDate.getDate() - maxAge);
    const availableTopics = [];
    const skippedTopics = [];
    for (const topic of topicsToGenerate) {
      // Check if we have a recent article on this topic with more precise matching
      // Clean topic words by removing punctuation and filtering out short words
      const topicWords = topic.topic.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 3); // Filter out short words
      const significantWords = topicWords.slice(0, 2); // Take first 2 significant words
      let recentArticle = null;
      if (significantWords.length >= 2) {
        // Create a more precise regex that requires both significant words to be present
        const titleRegex = new RegExp(significantWords.join('.*'), 'i');
        recentArticle = await Article.findOne({
          $and: [
            {
              $or: [
                { title: { $regex: titleRegex } },
                // Only match exact topic in tags (case insensitive)
                { tags: { $in: [topic.topic.toLowerCase(), ...topic.keywords.map(k => k.toLowerCase())] } }
              ]
            },
            { publishedAt: { $gte: maxAgeDate } }
          ]
        });
      }
      if (recentArticle) {
        console.log(`â­ï¸  Skipping topic: "${topic.topic}" - Recent article exists: "${recentArticle.title}" (published: ${recentArticle.publishedAt.toLocaleDateString()})`);
        skippedTopics.push({
          topic: topic.topic,
          reason: 'Recent article exists',
          existingTitle: recentArticle.title,
          publishedAt: recentArticle.publishedAt
        });
      } else {
        console.log(`âœ… Topic available for generation: "${topic.topic}"`);
        availableTopics.push(topic);
      }
    }
    console.log(`\nðŸ“Š Pre-filtering results:`);
    console.log(`   Available topics: ${availableTopics.length}`);
    console.log(`   Skipped topics: ${skippedTopics.length}`);
    if (availableTopics.length === 0) {
      console.log('âš ï¸  No available topics for generation - all have recent articles');
      return NextResponse.json({
        message: 'No new articles generated - all topics have recent articles',
        availableTopics: 0,
        skippedTopics: skippedTopics.length,
        skippedDetails: skippedTopics,
        suggestion: `Try increasing maxAge (currently ${maxAge} days) or adding more diverse topics`
      });
    }
    console.log(`\nðŸš€ Starting generation for ${availableTopics.length} available topics...\n`);
    const generatedArticles = [];
    const errors = [];
    for (const topic of availableTopics) {
      try {
        console.log(`ðŸ“ Generating article for topic: "${topic.topic}" (${topic.category})`);
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
        // Extract first image URL for ogImage (improved logic)
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const imageMatch = imageRegex.exec(generatedContent.content);
        let ogImageUrl = imageMatch ? imageMatch[1] : undefined;
        // If no image found in content, use first media image
        if (!ogImageUrl && generatedContent.media.images.length > 0) {
          ogImageUrl = generatedContent.media.images[0].url;
        }
        // If still no image, ensure we have a fallback
        if (!ogImageUrl) {
          ogImageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop&crop=center';
          console.log('âš ï¸ Using default fallback ogImage');
        }
        console.log(`ðŸ–¼ï¸ OG Image set to: ${ogImageUrl}`);
        const articleData = {
          ...generatedContent,
          slug: uniqueSlug, // Use the unique slug we generated
          category: topic.category,
          ogImage: ogImageUrl, // Set first image as ogImage
          featured: Math.random() > 0.7, // 30% chance of being featured
          // Media is already properly structured from generateArticleContent
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
    console.log(`\nâœ… Generation completed!`);
    console.log(`   Successfully generated: ${generatedArticles.length} articles`);
    console.log(`   Skipped (recent articles): ${skippedTopics.length} topics`);
    if (errors.length > 0) {
      console.log(`   Errors encountered: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error.topic}: ${error.error}`));
    }
    return NextResponse.json({
      message: `Generated ${generatedArticles.length} articles from trending topics`,
      articles: generatedArticles,
      statistics: {
        generated: generatedArticles.length,
        skipped: skippedTopics.length,
        errors: errors.length,
        totalTopicsChecked: topicsToGenerate.length
      },
      skippedTopics: skippedTopics,
      errors: errors.length > 0 ? errors : undefined,
      totalTopicsAttempted: availableTopics.length,
    });
  } catch (error) {
    console.error('Error generating articles from trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate articles from trending topics' },
      { status: 500 }
    );
  }
}