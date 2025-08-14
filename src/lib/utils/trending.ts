import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
export interface TrendingTopic {
  topic: string;
  category: string;
  keywords: string[];
  popularity: number;
  source: 'google' | 'twitter' | 'news_api' | 'manual';
  publishedAt?: string;
  url?: string;
}
export interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: {
    article_id: string;
    title: string;
    content: string;
    description: string;
    link: string;
    pubDate: string;
    source_id: string;
    category: string[];
    country: string[];
    language: string;
    keywords?: string[];
  }[];
}
export async function scrapeGoogleTrends(): Promise<TrendingTopic[]> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    // Navigate to Google Trends
    await page.goto('https://trends.google.com/trends/trendingsearches/daily', {
      waitUntil: 'networkidle',
    });
    // Wait for content to load
    await page.waitForTimeout(3000);
    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);
    const trends: TrendingTopic[] = [];
    // Extract trending topics (this is a simplified version)
    $('.feed-item').each((index, element) => {
      const topic = $(element).find('.title').text().trim();
      const searches = $(element).find('.search-count').text().trim();
      if (topic && index < 10) { // Limit to top 10
        trends.push({
          topic,
          category: 'general',
          keywords: topic.split(' ').filter(word => word.length > 2),
          popularity: extractPopularityScore(searches),
          source: 'google',
        });
      }
    });
    return trends;
  } catch (error) {
    console.error('Error scraping Google Trends:', error);
    return getEnhancedRandomTrends();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
export async function fetchRealTimeNews(): Promise<TrendingTopic[]> {
  const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;
  if (!NEWSDATA_API_KEY) {
    console.warn('NEWSDATA_API_KEY not found. Using fallback trending topics.');
    return getEnhancedRandomTrends();
  }
  try {
    // newsdata.io supports multiple categories in a single request and has better rate limits
    const categories = [
      'technology', 'business', 'health', 'science', 'sports', 
      'entertainment', 'politics', 'environment', 'lifestyle'
    ];
    const allTopics: TrendingTopic[] = [];
    // Fetch latest news from all categories
    for (const category of categories) {
      try {
        const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&category=${category}&language=en&size=10`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const data: NewsDataResponse = await response.json();
        if (data.status === 'success' && data.results) {
          data.results.forEach((article) => {
            const detectedCategory = article.category && article.category.length > 0 
              ? article.category[0] 
              : determineCategoryFromContent(article.title, article.description);
            allTopics.push({
              topic: article.title,
              category: detectedCategory,
              keywords: article.keywords || extractKeywords(article.title, article.description),
              popularity: Math.floor(Math.random() * 80000) + 20000,
              source: 'news_api',
              publishedAt: article.pubDate,
              url: article.link,
            });
          });
        }
        // Add delay between API calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching ${category} news:`, error);
        continue;
      }
    }
    // Also fetch trending/breaking news
    try {
      const trendingUrl = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=trending OR breaking OR viral&language=en&size=15`;
      const response = await fetch(trendingUrl);
      if (response.ok) {
        const data: NewsDataResponse = await response.json();
        if (data.status === 'success' && data.results) {
          data.results.forEach((article) => {
            const detectedCategory = determineCategoryFromContent(article.title, article.description);
            allTopics.push({
              topic: article.title,
              category: detectedCategory,
              keywords: article.keywords || extractKeywords(article.title, article.description),
              popularity: Math.floor(Math.random() * 100000) + 50000, // Higher popularity for trending
              source: 'news_api',
              publishedAt: article.pubDate,
              url: article.link,
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching trending news:', error);
    }
    // Remove duplicates and sort by recency and popularity
    const uniqueTopics = removeDuplicateTopics(allTopics);
    return uniqueTopics.slice(0, 25);
  } catch (error) {
    console.error('Error fetching real-time news:', error);
    return getEnhancedRandomTrends();
  }
}
function determineCategoryFromContent(title: string, description: string = ''): string {
  const content = `${title} ${description}`.toLowerCase();
  // Technology keywords
  if (/\b(ai|artificial intelligence|tech|software|app|digital|cyber|robot|automation|blockchain|crypto|startup|innovation|gadget)\b/i.test(content)) {
    return 'technology';
  }
  // Business keywords
  if (/\b(business|market|economy|finance|stock|investment|company|corporate|trade|sales|profit|revenue|ceo|startup)\b/i.test(content)) {
    return 'business';
  }
  // Health keywords
  if (/\b(health|medical|doctor|hospital|disease|treatment|medicine|vaccine|wellness|fitness|mental health|nutrition)\b/i.test(content)) {
    return 'health';
  }
  // Science keywords
  if (/\b(science|research|study|discovery|space|nasa|climate|environment|physics|chemistry|biology|lab|experiment)\b/i.test(content)) {
    return 'science';
  }
  // Sports keywords
  if (/\b(sport|football|basketball|baseball|soccer|tennis|golf|olympics|athlete|team|game|championship|tournament)\b/i.test(content)) {
    return 'sports';
  }
  // Politics keywords
  if (/\b(politic|government|president|congress|senate|election|vote|policy|law|democrat|republican|biden|trump|washington)\b/i.test(content)) {
    return 'politics';
  }
  // Entertainment keywords
  if (/\b(movie|film|actor|actress|celebrity|music|song|album|tv|show|netflix|hollywood|entertainment|concert)\b/i.test(content)) {
    return 'entertainment';
  }
  // Environment keywords
  if (/\b(environment|climate|green|sustainable|renewable|energy|pollution|carbon|eco|conservation|recycling)\b/i.test(content)) {
    return 'environment';
  }
  // Finance keywords
  if (/\b(finance|bank|loan|credit|debt|savings|investment|currency|bitcoin|crypto|financial|money|economic)\b/i.test(content)) {
    return 'finance';
  }
  // Lifestyle keywords
  if (/\b(lifestyle|travel|food|fashion|home|family|relationship|culture|art|hobby|recipe|style|living)\b/i.test(content)) {
    return 'lifestyle';
  }
  return 'general';
}
function extractKeywords(title: string, description: string = ''): string[] {
  const content = `${title} ${description}`.toLowerCase();
  // Remove common words and extract meaningful keywords
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'a', 'an', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  const words = content
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  // Get unique words and limit to most important ones
  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.slice(0, 8);
}
function removeDuplicateTopics(topics: TrendingTopic[]): TrendingTopic[] {
  const seen = new Set<string>();
  const unique: TrendingTopic[] = [];
  topics.forEach(topic => {
    // Create a normalized key for duplicate detection
    const normalizedTopic = topic.topic.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
    const key = normalizedTopic.substring(0, 50); // Use first 50 characters as key
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(topic);
    }
  });
  return unique.sort((a, b) => {
    // Sort by recency first (if available), then popularity
    if (a.publishedAt && b.publishedAt) {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      if (dateA !== dateB) return dateB - dateA; // Most recent first
    }
    return b.popularity - a.popularity;
  });
}
function extractPopularityScore(searches: string): number {
  // Extract number from strings like "100K+ searches"
  const match = searches.match(/(\d+)/);
  if (match) {
    const number = parseInt(match[1]);
    if (searches.includes('K')) return number * 1000;
    if (searches.includes('M')) return number * 1000000;
    return number;
  }
  return Math.floor(Math.random() * 100000); // Random fallback
}
function getEnhancedRandomTrends(): TrendingTopic[] {
  const currentDate = new Date();
  const topics = [
    // Technology
    {
      topic: `AI Breakthrough ${currentDate.getFullYear()}: Latest Developments in Machine Learning`,
      category: 'technology',
      keywords: ['AI', 'artificial intelligence', 'machine learning', 'technology', 'breakthrough'],
      popularity: Math.floor(Math.random() * 50000) + 80000,
      source: 'google' as const,
    },
    {
      topic: `Quantum Computing Revolution: IBM's New Breakthrough`,
      category: 'technology',
      keywords: ['quantum computing', 'IBM', 'quantum technology', 'computing innovation'],
      popularity: Math.floor(Math.random() * 40000) + 70000,
      source: 'twitter' as const,
    },
    {
      topic: `5G Network Expansion Reaches Rural Areas`,
      category: 'technology',
      keywords: ['5G', 'telecommunications', 'network technology', 'rural internet'],
      popularity: Math.floor(Math.random() * 35000) + 65000,
      source: 'news_api' as const,
    },
    // Business & Finance
    {
      topic: `Stock Market Volatility: Tech Stocks See Major Shifts`,
      category: 'finance',
      keywords: ['stock market', 'tech stocks', 'investment', 'financial markets'],
      popularity: Math.floor(Math.random() * 60000) + 90000,
      source: 'news_api' as const,
    },
    {
      topic: `Cryptocurrency Regulation: New Federal Guidelines Released`,
      category: 'finance',
      keywords: ['cryptocurrency', 'bitcoin', 'regulation', 'federal guidelines', 'crypto'],
      popularity: Math.floor(Math.random() * 55000) + 85000,
      source: 'google' as const,
    },
    {
      topic: `Small Business Recovery: Post-Pandemic Growth Strategies`,
      category: 'business',
      keywords: ['small business', 'recovery', 'pandemic', 'growth strategies'],
      popularity: Math.floor(Math.random() * 40000) + 60000,
      source: 'twitter' as const,
    },
    // Health
    {
      topic: `Mental Health Crisis: New Treatment Options Available`,
      category: 'health',
      keywords: ['mental health', 'treatment', 'depression', 'anxiety', 'therapy'],
      popularity: Math.floor(Math.random() * 50000) + 75000,
      source: 'news_api' as const,
    },
    {
      topic: `Revolutionary Cancer Treatment Shows Promise in Clinical Trials`,
      category: 'health',
      keywords: ['cancer treatment', 'clinical trials', 'medical breakthrough', 'oncology'],
      popularity: Math.floor(Math.random() * 45000) + 80000,
      source: 'google' as const,
    },
    // Science
    {
      topic: `NASA Mars Mission: New Discoveries About Water on Red Planet`,
      category: 'science',
      keywords: ['NASA', 'Mars', 'space exploration', 'water', 'red planet'],
      popularity: Math.floor(Math.random() * 70000) + 95000,
      source: 'news_api' as const,
    },
    {
      topic: `Climate Change: Antarctic Ice Sheet Melting Accelerates`,
      category: 'science',
      keywords: ['climate change', 'antarctic', 'ice sheet', 'global warming'],
      popularity: Math.floor(Math.random() * 65000) + 85000,
      source: 'twitter' as const,
    },
    // Sports
    {
      topic: `NFL Season Kickoff: Predictions and Team Analysis`,
      category: 'sports',
      keywords: ['NFL', 'football', 'season', 'sports', 'team analysis'],
      popularity: Math.floor(Math.random() * 80000) + 100000,
      source: 'news_api' as const,
    },
    {
      topic: `Olympic Games: Athletes Breaking World Records`,
      category: 'sports',
      keywords: ['olympics', 'world records', 'athletes', 'sports competition'],
      popularity: Math.floor(Math.random() * 75000) + 90000,
      source: 'google' as const,
    },
    // Politics
    {
      topic: `Presidential Election 2024: Latest Campaign Updates`,
      category: 'politics',
      keywords: ['presidential election', '2024 election', 'campaign', 'politics'],
      popularity: Math.floor(Math.random() * 90000) + 120000,
      source: 'news_api' as const,
    },
    {
      topic: `Supreme Court Ruling: Impact on Healthcare Policy`,
      category: 'politics',
      keywords: ['supreme court', 'healthcare policy', 'legal ruling', 'government'],
      popularity: Math.floor(Math.random() * 70000) + 95000,
      source: 'twitter' as const,
    },
    // Environment
    {
      topic: `Renewable Energy Milestone: Solar Power Reaches New Efficiency`,
      category: 'environment',
      keywords: ['renewable energy', 'solar power', 'clean energy', 'sustainability'],
      popularity: Math.floor(Math.random() * 50000) + 75000,
      source: 'google' as const,
    },
    {
      topic: `Ocean Conservation: New Marine Protected Areas Established`,
      category: 'environment',
      keywords: ['ocean conservation', 'marine protected areas', 'environmental protection'],
      popularity: Math.floor(Math.random() * 40000) + 65000,
      source: 'news_api' as const,
    },
    // Lifestyle
    {
      topic: `Work From Home Trends: Productivity Tips for Remote Workers`,
      category: 'lifestyle',
      keywords: ['work from home', 'remote work', 'productivity', 'lifestyle'],
      popularity: Math.floor(Math.random() * 35000) + 55000,
      source: 'twitter' as const,
    },
    {
      topic: `Travel Industry Recovery: Top Destinations for 2024`,
      category: 'lifestyle',
      keywords: ['travel', 'tourism', 'destinations', 'vacation', 'recovery'],
      popularity: Math.floor(Math.random() * 45000) + 65000,
      source: 'google' as const,
    },
    // Entertainment
    {
      topic: `Hollywood Strike Resolution: Impact on Film Industry`,
      category: 'entertainment',
      keywords: ['hollywood', 'strike', 'film industry', 'entertainment', 'movies'],
      popularity: Math.floor(Math.random() * 60000) + 80000,
      source: 'news_api' as const,
    },
    {
      topic: `Streaming Wars: New Platform Changes Entertainment Landscape`,
      category: 'entertainment',
      keywords: ['streaming', 'netflix', 'entertainment', 'tv shows', 'movies'],
      popularity: Math.floor(Math.random() * 55000) + 75000,
      source: 'twitter' as const,
    }
  ];
  // Shuffle and return selection with current timestamp
  const shuffled = topics.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 20).map(topic => ({
    ...topic,
    publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Within last 24 hours
  }));
}
export async function getAllTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const [realTimeNews, googleTrends] = await Promise.all([
      fetchRealTimeNews(),
      scrapeGoogleTrends(),
    ]);
    // Combine all sources and remove duplicates
    const allTopics = [...realTimeNews, ...googleTrends];
    const uniqueTopics = removeDuplicateTopics(allTopics);
    return uniqueTopics
      .sort((a, b) => {
        // Prioritize recent and popular content
        const scoreA = calculateTopicScore(a);
        const scoreB = calculateTopicScore(b);
        return scoreB - scoreA;
      })
      .slice(0, 25); // Return top 25 trending topics
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return getEnhancedRandomTrends();
  }
}
function calculateTopicScore(topic: TrendingTopic): number {
  let score = topic.popularity;
  // Boost score for recent content
  if (topic.publishedAt) {
    const hoursAgo = (Date.now() - new Date(topic.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 6) score *= 1.5; // 6 hours or less
    else if (hoursAgo < 24) score *= 1.2; // 24 hours or less
  }
  // Boost score for certain high-interest categories
  const highInterestCategories = ['politics', 'sports', 'science', 'technology'];
  if (highInterestCategories.includes(topic.category)) {
    score *= 1.1;
  }
  return score;
}
// New function to add manual topics
export async function addManualTopic(topic: string, category: string, keywords: string[]): Promise<TrendingTopic> {
  return {
    topic,
    category,
    keywords,
    popularity: 100000, // High priority for manual topics
    source: 'manual',
    publishedAt: new Date().toISOString(),
  };
}