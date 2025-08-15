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
  urlToImage: string | null;
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
export interface ProcessedRealTimeArticle {
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
 * Map our category names to NewsAPI.org supported categories
 */
function mapToNewsAPICategory(category: string): string | null {
  const categoryMap: Record<string, string> = {
    'technology': 'technology',
    'business': 'business', 
    'health': 'health',
    'science': 'science',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'politics': 'general', // NewsAPI doesn't have politics, use general
    'finance': 'business', // Map finance to business
    'lifestyle': 'entertainment', // Map lifestyle to entertainment
    'environment': 'science', // Map environment to science
    'general': 'general'
  };
  return categoryMap[category.toLowerCase()] || null;
}
/**
 * Fetch REAL current news articles from NewsAPI.org
 */
export async function fetchRealTimeNews(options: {
  categories?: string[];
  limit?: number;
  country?: string;
  hours?: number; // Articles from last X hours
}): Promise<{ article: NewsAPIArticle; category: string }[]> {
  const {
    categories = ['technology', 'business', 'health', 'science', 'sports'],
    limit = 10,
    country = 'us',
    hours = 24
  } = options;
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your-newsapi-org-key-here') {
    console.warn('âš ï¸ NEWS_API_KEY not configured. Using sample data.');
    // Return sample current data for testing
    return [{
      article: {
        title: "Breaking: Major Tech Company Announces Revolutionary AI Development",
        description: "A leading technology company has unveiled groundbreaking artificial intelligence capabilities that could transform healthcare diagnostics.",
        url: "https://example.com/tech-ai-breakthrough",
        urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
        publishedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(), // Random within last 6 hours
        content: "In a groundbreaking announcement today, researchers have unveiled new AI technology that promises to revolutionize healthcare diagnostics. The breakthrough could enable faster, more accurate disease detection and treatment planning.",
        source: { id: "techcrunch", name: "TechCrunch" },
        author: "Tech Reporter"
      },
      category: 'technology'
    }];
  }
  const allArticles: { article: NewsAPIArticle; category: string }[] = [];
  try {
    for (const category of categories) {
      try {
        // Map our categories to NewsAPI.org categories
        const newsAPICategory = mapToNewsAPICategory(category);
        if (!newsAPICategory) {
          console.log(`âš ï¸ Skipping unsupported category: ${category}`);
          continue;
        }
        // NewsAPI.org endpoint for current top headlines (automatically recent)
        const url = `https://newsapi.org/v2/top-headlines?` +
          `country=${country}&` +
          `category=${newsAPICategory}&` +
          `sortBy=publishedAt&` +
          `pageSize=${Math.ceil(limit / categories.length) + 2}&` + // Get a few extra for filtering
          `apiKey=${NEWS_API_KEY}`;
  console.log(`📰 Fetching REAL ${newsAPICategory} news from NewsAPI.org...`);
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`âŒ NewsAPI.org error for ${category}: ${response.status} - ${errorText}`);
          continue;
        }
        const data: NewsAPIResponse = await response.json();
  console.log(`📊 Real news for ${category}: ${data.articles?.length || 0} articles`);
        if (data.status === 'ok' && data.articles && data.articles.length > 0) {
          // Filter with very relaxed criteria - prioritize getting articles
          const currentArticles = data.articles.filter(article => {
            if (!article.title || !article.description || !article.url) {
              console.log(`âŒ Skipping article with missing basic fields`);
              return false;
            }
            // Check article age - be very generous
            const articleDate = new Date(article.publishedAt);
            const hoursOld = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60);
            const daysOld = hoursOld / 24;
            // Very relaxed filtering - accept most articles
            const hasValidContent = article.title.length > 5 && 
                                  article.description.length > 20 &&
                                  !article.title.toLowerCase().includes('removed') &&
                                  !article.description.toLowerCase().includes('removed');
            // Accept articles up to 7 days old initially for testing
            const withinTimeWindow = daysOld <= 7;
            console.log(`📄 "${article.title.substring(0, 40)}...": ${daysOld.toFixed(1)} days old, valid: ${hasValidContent && withinTimeWindow}`);
            return hasValidContent && withinTimeWindow;
          });
          const articlesWithCategory = currentArticles.map(article => ({ 
            article, 
            category 
          }));
          allArticles.push(...articlesWithCategory);
          console.log(` ❌… Found ${currentArticles.length} REAL current ${category} articles`);
        }
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`âŒ Error fetching ${category}:`, error);
        continue;
      }
    }
    // Sort by recency and remove duplicates
    const uniqueArticles = allArticles
      .filter((item, index, self) => 
        index === self.findIndex(a => a.article.url === item.article.url)
      )
      .sort((a, b) => 
        new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime()
      );
  console.log(`🏯 Total unique REAL articles: ${uniqueArticles.length}`);
    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error('âŒ Error in fetchRealTimeNews:', error);
    return [];
  }
}
/**
 * Process real news article into our format
 */
async function processRealNewsArticle(article: NewsAPIArticle, category: string): Promise<ProcessedRealTimeArticle> {
  console.log(`🛠️ Processing REAL article: "${article.title}"`);
  // Extract keywords from content
  const keywords = extractKeywordsFromContent(article.title, article.description, article.content || '');
  // Search for relevant media
  const media = await searchArticleMedia(article.title, keywords, category);
  // Enhanced content - use original if good, otherwise enhance with AI
  let enhancedContent = article.content || article.description;
  // NewsAPI.org free tier ALWAYS truncates content - force enhancement for all articles
  const isNewsAPI = true; // Since we're using NewsAPI.org
  const isTruncated = isNewsAPI || !article.content || 
    article.content.length < 800 ||  // Most NewsAPI content is short
    article.content.includes('[+') ||      // NewsAPI format: "[+1234 chars]"
    article.content.includes('â€¦ [+') ||    // Variant with ellipsis 
    article.content.includes('...') ||
    article.content.endsWith('â€¦') ||
    article.content.match(/\.\.\.$/) ||
    article.content.match(/â€¦$/) ||
    article.content.match(/\[\+\d+\s+chars?\]/) ||  // Regex for [+123 chars]
    article.content.split(' ').length < 120; // Less than ~120 words needs enhancement
  if (isTruncated) {
  console.log(`🤔 Enhancing NewsAPI content for: "${article.title.substring(0, 50)}..."`);
  console.log(`📝 Original content: ${(article.content || 'None').substring(0, 200)}${article.content && article.content.length > 200 ? '...' : ''}`);
    try {
      enhancedContent = await enhanceShortContent(article);
      // Validate that enhancement actually worked
      if (enhancedContent && enhancedContent.length > (article.content?.length || 0)) {
        console.log(` ❌… Content successfully expanded: ${article.content?.length || 0}  ←’ ${enhancedContent.length} chars`);
      } else {
        console.log(`âš ï¸ Enhancement didn't expand content significantly`);
        enhancedContent = article.content || article.description || '';
      }
    } catch (error) {
      console.log(`âŒ All enhancement methods failed: ${error instanceof Error ? error.message : String(error)}`);
      enhancedContent = article.content || article.description || '';
    }
    console.log(` ❌¨ Final content length: ${enhancedContent.length} chars`);
  } else {
    enhancedContent = article.content || '';
    console.log(` ❌… Using original content: ${enhancedContent.length} chars`);
  }
  // Add media to content
  const contentWithMedia = await addMediaToContent(enhancedContent, article, media);
  // Calculate reading time
  const wordCount = enhancedContent.split(' ').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  // Generate unique slug
  const baseSlug = createSlug(article.title);
  const timestamp = Date.now().toString().slice(-6);
  const uniqueSlug = `${baseSlug}-${timestamp}`;
  // Create excerpt
  const excerpt = article.description.substring(0, 300);
  // Source information
  const sourceName = article.source.name || 'News Source';
  const sourceId = article.source.id || createSlug(sourceName);
  const authorName = article.author || sourceName;
  return {
    title: article.title,
    slug: uniqueSlug,
    content: contentWithMedia,
    excerpt,
    metaDescription: article.description.substring(0, 160),
    metaKeywords: keywords.slice(0, 10),
    ogImage: article.urlToImage || (media.images.length > 0 ? media.images[0].url : undefined),
    author: `${authorName} via NeuraPress`,
    publishedAt: new Date(article.publishedAt), // Use REAL publication date
    updatedAt: new Date(),
    tags: keywords.slice(0, 8),
    category,
    readingTime,
    featured: Math.random() > 0.85, // 15% chance of being featured
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
      publishedAt: article.publishedAt, // REAL original date
    },
  };
}
/**
 * Enhance short or truncated content using AI
 */
/**
 * Enhanced content extension with multiple AI strategies and fallbacks
 */
async function enhanceShortContent(article: NewsAPIArticle): Promise<string> {
  const originalContent = article.content || '';
  const cleanContent = originalContent.replace(/\[\+\d+\s+chars?\]/g, '').trim();
  console.log(`🤔 Starting AI content extension for: "${article.title.substring(0, 50)}..."`);
  console.log(`📝 Original: ${originalContent.length} chars  ←’ Target: 1000-1500 chars`);
  // Strategy 1: Primary OpenAI Enhancement
  try {
    const enhanced = await enhanceWithOpenAI(article, cleanContent);
    if (enhanced && enhanced.length >= 800) { // Increased threshold
      console.log(` ❌… OpenAI enhancement successful: ${enhanced.length} chars`);
      return enhanced;
    }
  } catch (error) {
    console.log(`âš ï¸ OpenAI failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  // Strategy 2: Alternative AI Enhancement (if OpenAI fails)
  try {
    const enhanced = await enhanceWithAlternativeAI(article, cleanContent);
    if (enhanced && enhanced.length >= 800) { // Increased threshold
      console.log(` ❌… Alternative AI enhancement successful: ${enhanced.length} chars`);
      return enhanced;
    }
  } catch (error) {
    console.log(`âš ï¸ Alternative AI failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  // Strategy 3: Template-based Extension (fallback when all AI fails)
  try {
    const enhanced = await enhanceWithTemplate(article, cleanContent);
    console.log(` ❌… Template enhancement successful: ${enhanced.length} chars`);
    return enhanced;
  } catch (error) {
    console.log(`âŒ All enhancement methods failed: ${error instanceof Error ? error.message : String(error)}`);
    return originalContent;
  }
}
/**
 * Primary OpenAI enhancement strategy
 */
async function enhanceWithOpenAI(article: NewsAPIArticle, cleanContent: string): Promise<string> {
  const prompt = `You are a professional news writer expanding a truncated article from ${article.source?.name || 'a news source'}.
ARTICLE TO EXPAND:
Title: ${article.title}
Description: ${article.description}
Partial Content: ${cleanContent}
Published: ${article.publishedAt}
TASK: Expand this into a comprehensive 800-1200 word news article with detailed analysis and context.
STRUCTURE YOUR EXPANSION:
1. Introduction - Expand on the existing content with proper context
2. Background - Provide relevant industry/topic background
3. Analysis - Discuss implications and significance
4. Expert Perspectives - Add analytical insights (without fabricated quotes)
5. Market/Industry Impact - Discuss broader effects
6. Future Outlook - What this means going forward
7. Conclusion - Tie everything together
RULES:
1. Use the existing content as your foundation - don't contradict it
2. Expand naturally with rich context and background information
3. Maintain professional journalism tone throughout
4. Add substantial paragraphs (100-150 words each)
5. Include industry context, implications, and related developments
6. NO fabricated quotes, specific dates, or unverifiable claims
7. Focus on expanding themes and context from title/description
8. Write 800-1200 words total - be comprehensive and detailed
9. Use varied paragraph structure and engaging transitions
10. Provide valuable insights and analysis throughout
Write the expanded article now:`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: "You are an expert senior journalist who specializes in creating comprehensive, in-depth news articles from truncated content. Your articles are known for their thorough analysis, rich context, and professional depth. Always aim for 800-1200 words with substantial, informative content."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.6,
    max_tokens: 3000, // Increased for longer content
  });
  return completion.choices[0].message.content || cleanContent;
}
/**
 * Alternative AI enhancement (placeholder for future implementation)
 */
async function enhanceWithAlternativeAI(article: NewsAPIArticle, cleanContent: string): Promise<string> {
  // Future: Implement Gemini, Claude, or other AI providers here
  throw new Error("Alternative AI provider not configured");
}
/**
 * Template-based content enhancement (last resort fallback)
 */
async function enhanceWithTemplate(article: NewsAPIArticle, cleanContent: string): Promise<string> {
  console.log(`🛠️ Using template-based enhancement as last resort`);
  const sourceName = article.source?.name || 'the news source';
  const publishDate = new Date(article.publishedAt).toLocaleDateString();
  const publishTime = new Date(article.publishedAt).toLocaleTimeString();
  // Extract key elements for expansion
  const titleWords = article.title.split(' ');
  const keyTopics = titleWords.filter(word => word.length > 5);
  const mainTopic = keyTopics[0] || titleWords[0];
  let expandedContent = cleanContent;
  // Add comprehensive introduction paragraph
  if (expandedContent.length < 400) {
    expandedContent += `\n\nThis significant development, first reported by ${sourceName} on ${publishDate} at ${publishTime}, has immediately captured widespread attention across multiple sectors. The announcement has prompted extensive discussion among industry experts, stakeholders, and analysts who are closely examining the potential ramifications of these developments.`;
  }
  // Add detailed context and background
  if (expandedContent.length < 600) {
    expandedContent += `\n\nThe timing of this ${mainTopic.toLowerCase()}-related news comes at a particularly crucial moment in the industry landscape. Market observers have been anticipating such developments, and the implications are expected to extend far beyond the immediate scope of the announcement. Industry veterans suggest that this could mark a significant turning point in how similar situations are handled going forward.`;
  }
  // Add analysis and implications section
  if (expandedContent.length < 800) {
    expandedContent += `\n\nAnalysts are already beginning to assess the broader implications of these developments. The ripple effects are likely to be felt across multiple interconnected sectors, with various stakeholders needing to reassess their strategies and approaches. This announcement represents more than just an isolated incidentâ€”it reflects larger trends and shifts that have been building momentum in recent months.`;
  }
  // Add market/industry response section
  if (expandedContent.length < 1000) {
    expandedContent += `\n\nThe immediate response from industry professionals has been notably mixed, with some expressing cautious optimism while others are taking a more measured approach to understanding the full scope of the situation. Market indicators have begun reflecting the uncertainty and anticipation surrounding these developments, with trading volumes and activity patterns showing noticeable changes since the news broke.`;
  }
  // Add expert perspectives and quotes section
  if (expandedContent.length < 1200) {
    expandedContent += `\n\nIndustry experts are weighing in with their perspectives on what these developments might mean for the future landscape. While specific details continue to emerge, the consensus among professionals is that this represents a noteworthy shift that will require careful monitoring and analysis. The long-term implications are still being evaluated, but early assessments suggest significant potential for both challenges and opportunities.`;
  }
  // Add regulatory and compliance considerations
  if (expandedContent.length < 1400) {
    expandedContent += `\n\nRegulatory bodies and oversight agencies are expected to closely monitor the situation as it continues to develop. The announcement has raised important questions about compliance, industry standards, and best practices that will likely need to be addressed in the coming weeks and months. Stakeholders are preparing for potential regulatory responses and are actively engaging with relevant authorities to ensure proper protocol adherence.`;
  }
  // Add future outlook and developments section
  if (expandedContent.length < 1600) {
    expandedContent += `\n\nLooking ahead, industry watchers are preparing for a series of follow-up announcements and developments that are expected to provide additional clarity and context. The situation is evolving rapidly, with new information and updates anticipated in the near future. Organizations across the sector are adjusting their strategies and preparations to accommodate the changing landscape that these developments have created.`;
  }
  // Add comprehensive conclusion
  if (expandedContent.length < 1800) {
    expandedContent += `\n\nAs this story continues to unfold, the full impact and significance of these developments will become clearer. The initial announcement from ${sourceName} has set in motion a chain of events that will likely have lasting effects on the industry and its various participants. Stakeholders, analysts, and observers will be watching closely as additional information becomes available and as the various implications of this news begin to materialize in concrete ways.`;
  }
  // Final comprehensive wrap-up
  if (expandedContent.length < 2000) {
    expandedContent += `\n\nThis developing story represents a significant moment in the ongoing evolution of the industry landscape. The comprehensive coverage and analysis of these developments will continue as more details emerge and as the various stakeholders respond to the changing circumstances. For the most current and detailed information, readers are encouraged to follow ongoing coverage from ${sourceName} and other reliable industry sources, as this story is expected to see continued developments and updates in the days and weeks ahead.`;
  }
  console.log(`📈 Template expansion complete: ${cleanContent.length}  ←’ ${expandedContent.length} chars`);
  return expandedContent;
}
/**
 * Add media to content at strategic points
 */
async function addMediaToContent(content: string, article: NewsAPIArticle, media: { images: MediaItem[]; videos: MediaItem[] }): Promise<string> {
  const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
  const enhanced: string[] = [];
  paragraphs.forEach((paragraph, index) => {
    enhanced.push(paragraph.trim());
    // Add original image first
    if (index === 0 && article.urlToImage) {
      enhanced.push(`\n![${article.title}](${article.urlToImage})\n`);
    }
    // Add additional media at strategic points
    else if (index === Math.floor(paragraphs.length / 3) && media.images[0] && media.images[0].url !== article.urlToImage) {
      enhanced.push(`\n![Related news](${media.images[0].url})\n`);
    }
    else if (index === Math.floor(paragraphs.length * 2 / 3) && media.videos[0]) {
      enhanced.push(`\n<div class="video-container mb-4">
  <p class="text-gray-600 text-sm mb-2">Related Video: ${media.videos[0].title || 'News Video'}</p>
  <a href="${media.videos[0].url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
    Watch Video
  </a>
</div>\n`);
    }
  });
  return enhanced.join('\n\n');
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
    'these', 'those', 'said', 'says', 'new', 'first', 'last', 'also', 'more'
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
    .slice(0, 12)
    .map(([word]) => word);
}
/**
 * Search for relevant media
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
      category,
      type: 'both',
      limit: 6,
      uniqueId: `realtime_news_${title.substring(0, 20)}`
    };
    const relevantMedia = await mediaManager.searchRelevantMedia(mediaOptions);
    return {
      images: relevantMedia.filter(item => item.type === 'image'),
      videos: relevantMedia.filter(item => item.type === 'video'),
      tweets: []
    };
  } catch (error) {
    console.error('Error searching for media:', error);
    return { images: [], videos: [], tweets: [] };
  }
}
/**
 * Save real-time articles to database
 */
async function saveRealTimeArticles(articles: ProcessedRealTimeArticle[]): Promise<{
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
      // Check if article already exists by URL or similar title
      const existingArticle = await Article.findOne({
        $or: [
          { 'originalSource.url': articleData.originalSource.url },
          { slug: articleData.slug },
          { title: articleData.title }
        ]
      });
      if (existingArticle) {
        console.log(`â­ï¸ Skipping existing article: "${articleData.title.substring(0, 50)}..."`);
        results.skipped++;
        continue;
      }
      const article = new Article(articleData);
      await article.save();
      console.log(` ❌… Saved REAL article: "${articleData.title.substring(0, 50)}..."`);
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
 * Main function to generate real-time news articles
 */
export async function generateRealTimeNewsArticles(options: {
  categories?: string[];
  limit?: number;
  country?: string;
  hours?: number;
  autoSave?: boolean;
} = {}): Promise<{
  processed: ProcessedRealTimeArticle[];
  saved?: number;
  skipped?: number;
  errors?: string[];
}> {
  const { 
    categories = ['technology', 'business', 'health', 'science', 'sports'],
    limit = 10,
    country = 'us',
    hours = 24,
    autoSave = true 
  } = options;
  try {
  console.log(`🚀 Fetching ${limit} REAL current news articles...`);
    console.log(`Settings: categories=${categories.join(',')}, hours=${hours}, country=${country}`);
    // Fetch real current news
    const newsArticles = await fetchRealTimeNews({ 
      categories, 
      limit, 
      country, 
      hours 
    });
    if (newsArticles.length === 0) {
      return { processed: [] };
    }
    // Process each real article
    const processedArticles: ProcessedRealTimeArticle[] = [];
    for (const { article, category } of newsArticles) {
      try {
        const processed = await processRealNewsArticle(article, category);
        processedArticles.push(processed);
        // Small delay between processing
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`âŒ Error processing article "${article.title}":`, error);
        continue;
      }
    }
  console.log(`📝 Processed ${processedArticles.length} REAL articles`);
    let saveResults;
    if (autoSave) {
      saveResults = await saveRealTimeArticles(processedArticles);
  console.log(`💾 Save results: ${saveResults.saved} saved, ${saveResults.skipped} skipped, ${saveResults.errors.length} errors`);
    }
    return {
      processed: processedArticles,
      ...saveResults
    };
  } catch (error) {
    console.error('âŒ Error in generateRealTimeNewsArticles:', error);
    throw error;
  }
}