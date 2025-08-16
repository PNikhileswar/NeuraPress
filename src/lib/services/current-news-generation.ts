import { MediaManager, MediaSearchOptions, MediaItem } from './media-manager';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';
import { createSlug } from '@/lib/utils/utils';
import OpenAI from 'openai';
const mediaManager = new MediaManager();
// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export interface CurrentTopic {
  title: string;
  category: string;
  keywords: string[];
  trend_score: number;
  description: string;
}
export interface ProcessedCurrentArticle {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  metaKeywords: string[];
  ogImage?: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  readingTime: number;
  featured: boolean;
  media: {
    images: MediaItem[];
    videos: MediaItem[];
    tweets: string[];
  };
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
  originalSource: {
    url: string;
    sourceName: string;
    sourceId: string;
    publishedAt: string;
  };
}
/**
 * Generate current trending topics for today's date
 */
export async function generateCurrentTrendingTopics(categories: string[], limit: number = 10): Promise<CurrentTopic[]> {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prompt = `Generate ${limit} current, realistic trending news topics for ${currentDate} (${currentMonth}) across these categories: ${categories.join(', ')}.
Requirements:
- Topics must be realistic and plausible for today's date
- Include breaking news, tech updates, business developments, health discoveries, etc.
- Each topic should be newsworthy and engaging
- Mix of different types: product launches, policy changes, research findings, market updates
- Topics should reflect current global trends and ongoing developments
Format as JSON array with this structure:
[
  {
    "title": "Compelling news headline",
    "category": "technology|business|health|science|sports",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "trend_score": 85,
    "description": "Brief description of why this is trending today"
  }
]
Generate realistic, current topics that could genuinely be in today's news:`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a news trend analyst creating realistic current topics for ${currentDate}. Generate plausible, newsworthy topics that could genuinely be trending today. Be creative but realistic.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });
    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No topics generated');
    // Parse JSON response
    const topics: CurrentTopic[] = JSON.parse(response);
  console.log(`📝 Generated ${topics.length} current trending topics`);
    return topics;
  } catch (error) {
  console.error('❌ Error generating trending topics:', error);
    // Fallback topics for current date
    return [
      {
        title: "Major Tech Company Announces AI Breakthrough in Healthcare",
        category: "technology",
        keywords: ["artificial intelligence", "healthcare", "breakthrough", "technology"],
        trend_score: 95,
        description: "Revolutionary AI development in medical diagnostics"
      },
      {
        title: "Global Markets React to New Economic Policy Announcements",
        category: "business", 
        keywords: ["markets", "economy", "policy", "finance"],
        trend_score: 88,
        description: "Financial markets showing significant movement"
      }
    ];
  }
}
/**
 * Generate a full news article from a trending topic
 */
async function generateArticleFromTopic(topic: CurrentTopic): Promise<string> {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const prompt = `Write a comprehensive, current news article about: "${topic.title}"
Context:
- Date: ${currentDate}
- Category: ${topic.category}
- Keywords: ${topic.keywords.join(', ')}
- Trend Description: ${topic.description}
Requirements:
- Write as if this is breaking news happening TODAY (${currentDate})
- 800-1200 words, professional journalism style
- Include realistic quotes from relevant sources
- Cover who, what, when, where, why, how
- Use current market conditions, recent events as context
- Include specific details, numbers, and implications
- End with future outlook and next steps
- Write in present/recent past tense as if happening now
Format as clean text without markdown, ready for web display.
Make it engaging, informative, and feel like genuine current news.`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional journalist writing breaking news for ${currentDate}. Create realistic, detailed current news articles that feel authentic and timely.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    const article = completion.choices[0].message.content;
    if (!article) throw new Error('No article content generated');
    return article;
  } catch (error) {
  console.error('❌ Error generating article content:', error);
    return `${topic.description}\n\nThis is a developing story. More details will be provided as they become available.`;
  }
}
/**
 * Process a trending topic into a complete article
 */
export async function processCurrentTopic(topic: CurrentTopic): Promise<ProcessedCurrentArticle> {
  // Generate full article content
  console.log(`🛠️ Generating current article: "${topic.title}"`);
  const content = await generateArticleFromTopic(topic);
  // Search for relevant media
  const media = await searchTopicMedia(topic.title, topic.keywords, topic.category);
  // Enhanced content with media integration
  const enhancedContent = await enhanceCurrentContent(topic, content, media);
  // Calculate reading time
  const wordCount = content.split(' ').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  // Generate unique slug
  const baseSlug = createSlug(topic.title);
  const timestamp = Date.now().toString().slice(-6);
  const uniqueSlug = `${baseSlug}-${timestamp}`;
  // Create excerpt
  const sentences = content.split('. ');
  const excerpt = sentences.slice(0, 2).join('. ') + '.';
  // Generate current publication time (within last few hours)
  const publishDate = new Date();
  const randomHoursAgo = Math.floor(Math.random() * 6); // 0-6 hours ago
  const randomMinutes = Math.floor(Math.random() * 60);
  publishDate.setHours(publishDate.getHours() - randomHoursAgo, randomMinutes, 0, 0);
  return {
    title: topic.title,
    slug: uniqueSlug,
    content: enhancedContent,
    excerpt: excerpt.substring(0, 300),
    metaDescription: topic.description.substring(0, 160),
    metaKeywords: topic.keywords,
    ogImage: media.images.length > 0 ? media.images[0].url : undefined,
    author: `NeuraPress Newsroom`,
    publishedAt: publishDate,
    updatedAt: new Date(),
    tags: topic.keywords.slice(0, 8),
    category: topic.category,
    readingTime,
    featured: topic.trend_score > 90,
    media,
    seoData: {
      title: topic.title.length > 60 ? topic.title.substring(0, 57) + '...' : topic.title,
      description: topic.description.substring(0, 160),
      keywords: topic.keywords,
    },
    originalSource: {
      url: `https://neurapress.ai/news/${uniqueSlug}`,
      sourceName: 'NeuraPress AI News',
      sourceId: 'neurapress-ai',
      publishedAt: publishDate.toISOString(),
    },
  };
}
/**
 * Search for relevant media for a topic
 */
async function searchTopicMedia(title: string, keywords: string[], category: string): Promise<{
  images: MediaItem[];
  videos: MediaItem[];
  tweets: string[];
}> {
  try {
    const mediaOptions: MediaSearchOptions = {
      query: title,
      keywords: keywords.slice(0, 5),
      category: category,
      type: 'both',
      limit: 8,
      uniqueId: `current_news_${title.substring(0, 20)}`
    };
    const relevantMedia = await mediaManager.searchRelevantMedia(mediaOptions);
    return {
      images: relevantMedia.filter(item => item.type === 'image'),
      videos: relevantMedia.filter(item => item.type === 'video'),
      tweets: []
    };
  } catch (error) {
    console.error('Error searching for topic media:', error);
    return { images: [], videos: [], tweets: [] };
  }
}
/**
 * Enhance article content with media integration
 */
async function enhanceCurrentContent(
  topic: CurrentTopic, 
  content: string, 
  media: { images: MediaItem[]; videos: MediaItem[] }
): Promise<string> {
  const { images, videos } = media;
  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
  const enhancedParagraphs: string[] = [];
  paragraphs.forEach((paragraph, index) => {
    enhancedParagraphs.push(paragraph.trim());
    // Add images at strategic points
    if (index === 0 && images[0]) {
      enhancedParagraphs.push(`\n![${topic.title}](${images[0].url})\n`);
    } else if (index === Math.floor(paragraphs.length / 3) && images[1]) {
      enhancedParagraphs.push(`\n![Related to ${topic.title}](${images[1].url})\n`);
    } else if (index === Math.floor(paragraphs.length * 2 / 3) && videos[0]) {
      enhancedParagraphs.push(`\n<div class="video-container mb-4">
  <p class="text-gray-600 text-sm mb-2">Related Video: ${videos[0].title || 'Video Content'}</p>
  <a href="${videos[0].url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
    Watch on ${videos[0].source}
  </a>
</div>\n`);
    }
  });
  return enhancedParagraphs.join('\n\n');
}
/**
 * Generate current news articles from trending topics
 */
export async function generateCurrentNewsArticles(options: {
  categories?: string[];
  limit?: number;
  autoSave?: boolean;
} = {}): Promise<{
  processed: ProcessedCurrentArticle[];
  saved?: number;
  skipped?: number;
  errors?: string[];
}> {
  const { 
    categories = ['technology', 'business', 'health', 'science', 'sports'], 
    limit = 10,
    autoSave = true 
  } = options;
  try {
  console.log(`🚀 Generating ${limit} current news articles for ${new Date().toDateString()}...`);
    // Generate current trending topics
    const topics = await generateCurrentTrendingTopics(categories, limit);
    if (topics.length === 0) {
      return { processed: [] };
    }
    // Process each topic into a complete article
    const processedArticles: ProcessedCurrentArticle[] = [];
    for (const topic of topics) {
      try {
        const processed = await processCurrentTopic(topic);
        processedArticles.push(processed);
        // Small delay between processing
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
  console.error(`❌ Error processing topic "${topic.title}":`, error);
        continue;
      }
    }
  console.log(`📝 Generated ${processedArticles.length} current articles`);
    let saveResults;
    if (autoSave) {
      // Save to database
      saveResults = await saveCurrentArticles(processedArticles);
  console.log(`💾 Save results: ${saveResults.saved} saved, ${saveResults.skipped} skipped, ${saveResults.errors.length} errors`);
    }
    return {
      processed: processedArticles,
      ...saveResults
    };
  } catch (error) {
  console.error('❌ Error in generateCurrentNewsArticles:', error);
    throw error;
  }
}
/**
 * Save processed current articles to database
 */
async function saveCurrentArticles(articles: ProcessedCurrentArticle[]): Promise<{
  saved: number;
  skipped: number;
  errors: string[];
}> {
  await connectDB();
  const results = {
    saved: 0,
    skipped: 0,
    errors: [] as string[]
  };
  for (const articleData of articles) {
    try {
      // Check if similar article already exists (by title similarity)
      const existingArticle = await Article.findOne({
        $or: [
          { slug: articleData.slug },
          { title: { $regex: articleData.title.substring(0, 30), $options: 'i' } }
        ]
      });
      if (existingArticle) {
  console.log(`⏭️ Skipping similar article: "${articleData.title}"`);
        results.skipped++;
        continue;
      }
      const article = new Article(articleData);
      await article.save();
  console.log(`💾 Saved current article: "${articleData.title}"`);
      results.saved++;
    } catch (error) {
      const errorMsg = `Failed to save "${articleData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }
  }
  return results;
}