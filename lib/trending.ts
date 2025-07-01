import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export interface TrendingTopic {
  topic: string;
  category: string;
  keywords: string[];
  popularity: number;
  source: 'google' | 'twitter';
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
    return getFallbackTrends();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function scrapeTwitterTrends(): Promise<TrendingTopic[]> {
  // For this demo, we'll return mock Twitter trends
  // In production, you'd use Twitter API or scraping
  return [
    {
      topic: 'AI Technology Updates',
      category: 'technology',
      keywords: ['AI', 'artificial intelligence', 'machine learning', 'technology'],
      popularity: 95,
      source: 'twitter',
    },
    {
      topic: 'Sustainable Living Tips',
      category: 'lifestyle',
      keywords: ['sustainability', 'eco-friendly', 'green living', 'environment'],
      popularity: 87,
      source: 'twitter',
    },
    {
      topic: 'Digital Marketing Trends',
      category: 'business',
      keywords: ['digital marketing', 'SEO', 'social media', 'content marketing'],
      popularity: 92,
      source: 'twitter',
    },
  ];
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

function getFallbackTrends(): TrendingTopic[] {
  return [
    {
      topic: 'Latest Technology Innovations',
      category: 'technology',
      keywords: ['technology', 'innovation', 'digital transformation', 'tech trends'],
      popularity: 89000,
      source: 'google',
    },
    {
      topic: 'Health and Wellness Tips',
      category: 'health',
      keywords: ['health', 'wellness', 'fitness', 'nutrition', 'mental health'],
      popularity: 76000,
      source: 'google',
    },
    {
      topic: 'Financial Planning Strategies',
      category: 'finance',
      keywords: ['finance', 'investment', 'savings', 'financial planning'],
      popularity: 65000,
      source: 'google',
    },
    {
      topic: 'Sustainable Business Practices',
      category: 'business',
      keywords: ['sustainability', 'business', 'corporate responsibility', 'green business'],
      popularity: 58000,
      source: 'google',
    },
    {
      topic: 'Remote Work Best Practices',
      category: 'business',
      keywords: ['remote work', 'work from home', 'productivity', 'team collaboration'],
      popularity: 71000,
      source: 'google',
    },
  ];
}

export async function getAllTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const [googleTrends, twitterTrends] = await Promise.all([
      scrapeGoogleTrends(),
      scrapeTwitterTrends(),
    ]);

    return [...googleTrends, ...twitterTrends]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 15); // Return top 15 trending topics
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return getFallbackTrends();
  }
}
