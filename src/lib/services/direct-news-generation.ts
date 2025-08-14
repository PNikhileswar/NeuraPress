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
export interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
}
export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}
export interface SauravTechArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
}
export interface SauravTechResponse {
  status: string;
  totalResults: number;
  articles: SauravTechArticle[];
}
export interface ProcessedArticle {
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
 * Fetch articles directly from saurav.tech News API and process them for publication
 */
export async function fetchAndProcessNewsArticles(options: {
  categories?: string[];
  limit?: number;
  country?: string;
  maxAge?: number; // in hours
  prioritizeRecent?: boolean;
}): Promise<ProcessedArticle[]> {
  const {
    categories = ['technology', 'business', 'health', 'science', 'sports'],
    limit = 20,
    country = 'us',
    maxAge = 24,
    prioritizeRecent = true
  } = options;
  const allArticles: { article: SauravTechArticle; category: string }[] = [];
  try {
    // Fetch from multiple categories using saurav.tech API
    for (const category of categories) {
      try {
        // Saurav.tech API endpoint for top headlines by category
        const url = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/${country}.json`;
        console.log(`ðŸ“° Fetching ${category} articles from saurav.tech News API...`);
        console.log(`ðŸ”— API URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`âŒ Failed to fetch ${category} articles: ${response.status} ${response.statusText}`);
          continue;
        }
        const data: SauravTechResponse = await response.json();
        console.log(`ï¿½ API Response for ${category}:`, { 
          status: data.status, 
          totalResults: data.totalResults,
          articlesCount: data.articles?.length || 0 
        });
        if (data.status === 'ok' && data.articles && data.articles.length > 0) {
          // Filter articles with substantial content
          const substantialArticles = data.articles.filter(article => 
            article.title &&
            article.description &&
            article.content &&
            article.title.length > 10 &&
            article.description.length > 50 &&
            article.content.length > 100 &&
            !article.content.includes('[Removed]') &&
            article.url
          );
          // Add articles with their category information
          const articlesWithCategory = substantialArticles.map(article => ({ article, category }));
          allArticles.push(...articlesWithCategory);
          console.log(`âœ… Found ${substantialArticles.length} substantial articles in ${category}`);
        } else {
          console.warn(`âš ï¸ No articles found for ${category}`);
        }
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`âŒ Error fetching ${category} articles:`, error);
        continue;
      }
    }
    if (allArticles.length === 0) {
      console.warn('ðŸ“­ No articles found from saurav.tech News API');
      return [];
    }
    console.log(`ðŸ“Š Total articles fetched: ${allArticles.length}`);
    // Sort by recency if requested
    if (prioritizeRecent) {
      allArticles.sort((a, b) => 
        new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime()
      );
    }
    // Remove duplicates by URL
    const uniqueArticles = allArticles.filter((item, index, self) => 
      index === self.findIndex(a => a.article.url === item.article.url)
    );
    // Limit results
    const selectedArticles = uniqueArticles.slice(0, limit);
    // Process each article
    const processedArticles: ProcessedArticle[] = [];
    for (const { article, category } of selectedArticles) {
      try {
        console.log(`ðŸ”„ Processing article: "${article.title}"`);
        const processed = await processNewsArticle(article, category);
        processedArticles.push(processed);
        // Small delay between processing
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`âŒ Error processing article "${article.title}":`, error);
        continue;
      }
    }
    return processedArticles;
  } catch (error) {
    console.error('âŒ Error in fetchAndProcessNewsArticles:', error);
    throw error;
  }
}
/**
 * Process a single news article from saurav.tech API into our format
 */
async function processNewsArticle(article: SauravTechArticle, category: string = 'general'): Promise<ProcessedArticle> {
  // Determine category based on the API endpoint used
  const primaryCategory = category;
  // Extract keywords from content
  const keywords = extractKeywordsFromContent(article.title, article.description, article.content);
  // Search for relevant media
  const media = await searchArticleMedia(article.title, keywords, primaryCategory);
  // Calculate reading time from actual content
  const wordCount = article.content.split(' ').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  // Enhanced content with media integration
  const enhancedContent = await enhanceArticleContent(article, media);
  // Generate unique slug
  const baseSlug = createSlug(article.title);
  const timestamp = Date.now().toString().slice(-6);
  const uniqueSlug = `${baseSlug}-${timestamp}`;
  // Create excerpt from description
  const excerpt = article.description.substring(0, 300);
  // Smart date handling for old articles
  const originalDate = new Date(article.publishedAt);
  const currentDate = new Date();
  const daysDifference = Math.floor((currentDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
  // If article is older than 30 days, update to recent date
  let publishDate = originalDate;
  let isDateUpdated = false;
  if (daysDifference > 30) {
    // Generate a random date within the last 7 days
    const randomDaysAgo = Math.floor(Math.random() * 7);
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    publishDate = new Date();
    publishDate.setDate(publishDate.getDate() - randomDaysAgo);
    publishDate.setHours(randomHours, randomMinutes, 0, 0);
    isDateUpdated = true;
  }
  // Determine source information
  const sourceName = article.source?.name || 'Unknown Source';
  const sourceId = article.source?.id || createSlug(sourceName);
  const authorName = article.author || sourceName;
  // Add date update notation if needed
  const authorWithDateNote = isDateUpdated 
    ? `${authorName} via NeuraPress AI (Content Updated: ${new Date().toLocaleDateString()})`
    : `${authorName} via NeuraPress AI`;
  return {
    title: article.title,
    slug: uniqueSlug,
    content: enhancedContent,
    excerpt,
    metaDescription: article.description.substring(0, 160),
    metaKeywords: keywords.slice(0, 10),
    ogImage: article.urlToImage || (media.images.length > 0 ? media.images[0].url : undefined),
    author: authorWithDateNote,
    publishedAt: publishDate, // Use updated date if applicable
    updatedAt: new Date(),
    tags: keywords.slice(0, 8),
    category: primaryCategory,
    readingTime,
    featured: Math.random() > 0.8, // 20% chance of being featured
    media,
    seoData: {
      title: article.title.length > 60 ? article.title.substring(0, 57) + '...' : article.title,
      description: article.description.substring(0, 160),
      keywords: keywords.slice(0, 10),
    },
    originalSource: {
      url: article.url,
      sourceName,
      sourceId,
      publishedAt: article.publishedAt, // Keep original date for attribution
    },
  };
}
/**
 * Extract keywords from article content
 */
function extractKeywordsFromContent(title: string, description: string, content: string): string[] {
  const text = `${title} ${description} ${content}`.toLowerCase();
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'a', 'an', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'said', 'says', 'new', 'first', 'last', 'also', 'more'
  ]);
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
}
/**
 * Search for relevant media for an article
 */
async function searchArticleMedia(title: string, keywords: string[], category: string): Promise<{
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
      uniqueId: `direct_news_${title.substring(0, 20)}`
    };
    const relevantMedia = await mediaManager.searchRelevantMedia(mediaOptions);
    return {
      images: relevantMedia.filter(item => item.type === 'image'),
      videos: relevantMedia.filter(item => item.type === 'video'),
      tweets: [] // Not generating tweets for direct news
    };
  } catch (error) {
    console.error('Error searching for article media:', error);
    return { images: [], videos: [], tweets: [] };
  }
}
/**
 * Generate AI content when needed (keeping for potential future use)
 */
async function generateAIContentFromNews(article: SauravTechArticle): Promise<string> {
  const { title, description } = article;
  // Create a comprehensive prompt for news content generation
  const prompt = `
    Write a comprehensive news article based on the following information:
    Title: ${title}
    Description: ${description}
    Requirements:
    - Write a complete, professional news article (800-1200 words)
    - Use journalistic style with proper structure (lead, body, conclusion)
    - Include relevant context and background information
    - Maintain factual tone while being engaging
    - Use proper paragraphs and formatting
    - Include quotes where appropriate (can be hypothetical but realistic)
    - Cover the who, what, when, where, why aspects
    - End with implications or future outlook
    Format the response as clean text without markdown formatting, ready for web display.
  `;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional journalist writing comprehensive news articles. Create factual, well-structured content that expands on the given information while maintaining journalistic integrity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    const generatedContent = completion.choices[0].message.content;
    if (!generatedContent) {
      throw new Error('No content generated');
    }
    return generatedContent;
  } catch (error) {
    console.error('âŒ Error generating AI content:', error);
    // Fallback to description if AI generation fails
    return description || 'Content temporarily unavailable.';
  }
}
/**
 * Enhance article content with media integration and better formatting
 */
async function enhanceArticleContent(article: SauravTechArticle, media: { images: MediaItem[]; videos: MediaItem[] }): Promise<string> {
  const { title, content, description, urlToImage } = article;
  const { images, videos } = media;
  // Use the full content from saurav.tech (no truncation issues!)
  let enhancedContent = content || description || '';
  // If content is unusually short, combine with description
  if (enhancedContent.length < 300 && content && description && content !== description) {
    enhancedContent = `${description}\n\n${content}`;
  }
  // Basic formatting improvements
  const sections = enhancedContent.split('\n').filter(line => line.trim().length > 0);
  const formattedSections: string[] = [];
  sections.forEach((section, index) => {
    formattedSections.push(section.trim());
    // Add the original article image first if available
    if (index === 0 && urlToImage) {
      formattedSections.push(`\n![${title}](${urlToImage})\n`);
    }
    // Add additional images at strategic points
    else if (index === Math.floor(sections.length / 3) && images[0] && images[0].url !== urlToImage) {
      formattedSections.push(`\n![Related to ${title}](${images[0].url})\n`);
    } else if (index === Math.floor(sections.length * 2 / 3) && images[1]) {
      formattedSections.push(`\n![${images[1].title || 'Related content'}](${images[1].url})\n`);
    } else if (index === sections.length - 2 && videos[0]) {
      formattedSections.push(`\n<div class="video-container mb-4">
  <p class="text-gray-600 text-sm mb-2">Related Video: ${videos[0].title || 'Video Content'}</p>
  <a href="${videos[0].url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
    Watch on ${videos[0].source}
  </a>
</div>\n`);
    }
  });
  return formattedSections.join('\n\n');
}
/**
 * Save processed articles to database
 */
export async function saveProcessedArticles(articles: ProcessedArticle[]): Promise<{
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
      // Check if article already exists (by original URL or similar title)
      const existingArticle = await Article.findOne({
        $or: [
          { slug: articleData.slug },
          { title: articleData.title },
          { 'originalSource.url': articleData.originalSource.url }
        ]
      });
      if (existingArticle) {
        console.log(`â­ï¸ Skipping existing article: "${articleData.title}"`);
        results.skipped++;
        continue;
      }
      const article = new Article(articleData);
      await article.save();
      console.log(`âœ… Saved article: "${articleData.title}"`);
      results.saved++;
    } catch (error) {
      const errorMsg = `Failed to save "${articleData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }
  }
  return results;
}
/**
 * Main function to fetch, process, and save articles from saurav.tech News API
 */
export async function generateArticlesFromNewsData(options: {
  categories?: string[];
  limit?: number;
  country?: string;
  maxAge?: number;
  autoSave?: boolean;
} = {}): Promise<{
  processed: ProcessedArticle[];
  saved?: number;
  skipped?: number;
  errors?: string[];
}> {
  const { autoSave = true, ...fetchOptions } = options;
  try {
    console.log('ðŸš€ Starting direct news article generation from saurav.tech News API...');
    // Fetch and process articles
    const processedArticles = await fetchAndProcessNewsArticles(fetchOptions);
    if (processedArticles.length === 0) {
      return { processed: [] };
    }
    console.log(`ðŸ“ Processed ${processedArticles.length} articles`);
    let saveResults;
    if (autoSave) {
      // Save to database
      saveResults = await saveProcessedArticles(processedArticles);
      console.log(`ðŸ’¾ Save results: ${saveResults.saved} saved, ${saveResults.skipped} skipped, ${saveResults.errors.length} errors`);
    }
    return {
      processed: processedArticles,
      ...saveResults
    };
  } catch (error) {
    console.error('Error in generateArticlesFromNewsData:', error);
    throw error;
  }
}