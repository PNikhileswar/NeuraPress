// Enhanced media management system for NeuraPress - YouTube functionality removed
import fetch from 'node-fetch';
export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  source: 'unsplash' | 'pexels' | 'vimeo';
  type: 'image' | 'video';
  tags: string[];
  relevanceScore: number;
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for videos
    photographer?: string;
    photographerUrl?: string; // URL to photographer's profile
    unsplashUrl?: string; // Original Unsplash image URL for attribution
    downloadLocation?: string; // For tracking downloads with Unsplash API
    publishedAt?: string;
    license?: string;
  };
}
export interface MediaSearchOptions {
  query: string;
  keywords: string[];
  category: string;
  type?: 'image' | 'video' | 'both';
  limit?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  uniqueId?: string; // Add unique identifier for per-article uniqueness
}
class MediaManager {
  private readonly UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  private readonly PEXELS_API_KEY = process.env.PEXELS_API_KEY;
  /**
   * Search for relevant media based on article content
   */
  async searchRelevantMedia(options: MediaSearchOptions): Promise<MediaItem[]> {
    const { query, keywords, category, type = 'both', limit = 10, uniqueId } = options;
    const results: MediaItem[] = [];
    try {
      // Create search terms based on content analysis with more variety
      const searchTerms = this.extractSearchTerms(query, keywords, category);
      if (type === 'image' || type === 'both') {
        // Prioritize Unsplash for high-quality, diverse images
        const unsplashResults = await this.searchUnsplashWithVariety(searchTerms, limit, options.orientation, uniqueId);
        results.push(...unsplashResults);
        // Only use Pexels if we don't have enough results from Unsplash
        if (results.length < limit) {
          const remainingLimit = limit - results.length;
          const pexelsResults = await this.searchPexels(searchTerms, remainingLimit);
          results.push(...pexelsResults);
        }
      }
      if (type === 'video' || type === 'both') {
        // Video support limited to vimeo and other sources
        // YouTube functionality removed
      }
      // Score and sort results by relevance
      const scoredResults = this.scoreRelevance(results, query, keywords);
      const finalResults = scoredResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
      // If we don't have enough results, add fallback media
      if (finalResults.length < limit) {
        console.log('ðŸ”„ Adding fallback media due to insufficient results...');
        const fallbackMedia = this.getFallbackMedia(category, type, limit - finalResults.length, uniqueId);
        finalResults.push(...fallbackMedia);
      }
      return finalResults.slice(0, limit);
    } catch (error) {
      console.error('Error searching for media:', error);
      // Return fallback media if API calls fail
      return this.getFallbackMedia(category, type, limit, uniqueId);
    }
  }
  /**
   * Extract meaningful search terms from content
   */
  private extractSearchTerms(query: string, keywords: string[], category: string): string[] {
    const terms = new Set<string>();
    // Add main category-specific terms
    const categoryTerms = this.getCategorySearchTerms(category);
    categoryTerms.forEach(term => terms.add(term));
    // Add keywords
    keywords.forEach(keyword => terms.add(keyword.toLowerCase()));
    // Extract key terms from query (simple approach)
    const queryWords = query.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
    queryWords.forEach(word => terms.add(word));
    return Array.from(terms).slice(0, 5);
  }
  /**
   * Enhanced Unsplash search with better variety and duplicate prevention
   */
  private async searchUnsplashWithVariety(searchTerms: string[], limit: number, orientation?: string, uniqueId?: string): Promise<MediaItem[]> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not provided');
      return [];
    }
    const results: MediaItem[] = [];
    const usedImageIds = new Set<string>();
    // Create multiple diverse search queries
    const searchQueries = this.createDiverseSearchQueries(searchTerms, uniqueId);
    const resultsPerQuery = Math.ceil(limit / searchQueries.length);
    try {
      for (const query of searchQueries) {
        const orientationParam = orientation ? `&orientation=${orientation}` : '';
        // Add randomness to page selection for variety
        const randomPage = Math.floor(Math.random() * 3) + 1; // Pages 1-3
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${resultsPerQuery}&page=${randomPage}&order_by=relevant${orientationParam}`,
          {
            headers: {
              'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
              'Accept-Version': 'v1'
            }
          }
        );
        if (response.ok) {
          const data = await response.json() as any;
          for (const photo of data.results || []) {
            // Skip if we've already used this image
            if (usedImageIds.has(photo.id)) {
              continue;
            }
            usedImageIds.add(photo.id);
            results.push({
              id: photo.id,
              url: photo.urls.regular,
              thumbnailUrl: photo.urls.thumb,
              title: photo.description || photo.alt_description || '',
              description: photo.alt_description || '',
              source: 'unsplash',
              type: 'image',
              tags: photo.tags?.map((tag: any) => tag.title) || [],
              relevanceScore: 0,
              metadata: {
                width: photo.width,
                height: photo.height,
                photographer: photo.user.name,
                photographerUrl: photo.user.links.html,
                unsplashUrl: photo.links.html,
                downloadLocation: photo.links.download_location,
                license: 'Unsplash License',
              },
            });
            // Stop if we have enough results
            if (results.length >= limit) {
              break;
            }
          }
        }
        // Stop if we have enough results
        if (results.length >= limit) {
          break;
        }
        // Add a small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.log(`ðŸ–¼ï¸ Found ${results.length} unique Unsplash images from ${searchQueries.length} diverse queries`);
      return results;
    } catch (error) {
      console.error('Error searching Unsplash with variety:', error);
      return [];
    }
  }
  /**
   * Create diverse search queries to avoid duplicate images
   */
  private createDiverseSearchQueries(searchTerms: string[], uniqueId?: string): string[] {
    const baseTerms = searchTerms.slice(0, 3); // Use first 3 terms as base
    const queries: string[] = [];
    // Base query
    queries.push(baseTerms.join(' '));
    // Individual term queries for variety
    baseTerms.forEach(term => {
      if (term.length > 3) { // Skip very short terms
        queries.push(term);
      }
    });
    // Combined variations
    if (baseTerms.length >= 2) {
      queries.push(`${baseTerms[0]} ${baseTerms[1]}`);
    }
    if (baseTerms.length >= 3) {
      queries.push(`${baseTerms[0]} ${baseTerms[2]}`);
      queries.push(`${baseTerms[1]} ${baseTerms[2]}`);
    }
    // Add some randomized modifiers to increase variety
    const modifiers = ['modern', 'abstract', 'professional', 'clean', 'creative', 'minimal'];
    const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    queries.push(`${baseTerms[0]} ${randomModifier}`);
    // Remove duplicates and limit to 4 queries max for performance
    const uniqueQueries = Array.from(new Set(queries)).slice(0, 4);
    console.log(`ðŸ” Created ${uniqueQueries.length} diverse search queries:`, uniqueQueries);
    return uniqueQueries;
  }
  /**
   * Search Unsplash for high-quality images
   */
  private async searchUnsplash(searchTerms: string[], limit: number, orientation?: string): Promise<MediaItem[]> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not provided');
      return [];
    }
    const results: MediaItem[] = [];
    const query = searchTerms.join(' ');
    try {
      const orientationParam = orientation ? `&orientation=${orientation}` : '';
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&order_by=relevant${orientationParam}`,
        {
          headers: {
            'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
            'Accept-Version': 'v1'
          }
        }
      );
      if (response.ok) {
        const data = await response.json() as any;
        for (const photo of data.results || []) {
          results.push({
            id: photo.id,
            url: photo.urls.regular,
            thumbnailUrl: photo.urls.thumb,
            title: photo.description || photo.alt_description || '',
            description: photo.alt_description || '',
            source: 'unsplash',
            type: 'image',
            tags: photo.tags?.map((tag: any) => tag.title) || [],
            relevanceScore: 0,
            metadata: {
              width: photo.width,
              height: photo.height,
              photographer: photo.user.name,
              photographerUrl: photo.user.links.html,
              unsplashUrl: photo.links.html,
              downloadLocation: photo.links.download_location,
              license: 'Unsplash License',
            },
          });
        }
        // Track download for Unsplash API compliance
        for (const photo of data.results || []) {
          try {
            await fetch(photo.links.download_location, {
              headers: {
                'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
              }
            });
          } catch (trackingError) {
            console.warn('Failed to track Unsplash download:', trackingError);
          }
        }
      }
    } catch (error) {
      console.error('Error searching Unsplash:', error);
    }
    return results;
  }
  /**
   * Search Pexels for additional image variety
   */
  private async searchPexels(searchTerms: string[], limit: number): Promise<MediaItem[]> {
    if (!this.PEXELS_API_KEY) {
      console.warn('Pexels API key not provided');
      return [];
    }
    const results: MediaItem[] = [];
    const query = searchTerms.join(' ');
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`,
        {
          headers: {
            'Authorization': this.PEXELS_API_KEY,
          }
        }
      );
      if (response.ok) {
        const data = await response.json() as any;
        for (const photo of data.photos || []) {
          results.push({
            id: photo.id.toString(),
            url: photo.src.large,
            thumbnailUrl: photo.src.medium,
            title: photo.alt || '',
            description: photo.alt || '',
            source: 'pexels',
            type: 'image',
            tags: [],
            relevanceScore: 0,
            metadata: {
              width: photo.width,
              height: photo.height,
              photographer: photo.photographer,
              photographerUrl: photo.photographer_url,
              license: 'Pexels License',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error searching Pexels:', error);
    }
    return results;
  }
  /**
   * Score media relevance based on content matching
   */
  private scoreRelevance(items: MediaItem[], query: string, keywords: string[]): MediaItem[] {
    const queryLower = query.toLowerCase();
    const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
    return items.map(item => {
      let score = 0;
      // Score based on title/description match
      const textContent = `${item.title} ${item.description}`.toLowerCase();
      if (textContent.includes(queryLower.substring(0, 20))) score += 10;
      // Score based on keyword matches
      keywords.forEach(keyword => {
        if (textContent.includes(keyword.toLowerCase())) score += 5;
      });
      // Score based on tag matches
      item.tags.forEach(tag => {
        if (keywordSet.has(tag.toLowerCase())) score += 8;
      });
      // Boost Unsplash quality
      if (item.source === 'unsplash') score += 2;
      return { ...item, relevanceScore: score };
    });
  }
  /**
   * Get fallback media when APIs fail
   */
  private getFallbackMedia(category: string, type: 'image' | 'video' | 'both', limit: number, uniqueId?: string): MediaItem[] {
    const fallbackImages = this.getFallbackImages(category);
    const results: MediaItem[] = [];
    if (type === 'image' || type === 'both') {
      // Create unique selection based on article identifier and timestamp
      const articleSeed = uniqueId ? this.hashString(uniqueId) : Date.now();
      const shuffledImages = this.shuffleArrayWithSeed([...fallbackImages], articleSeed);
      // Use a unique starting point for each article to ensure different image sets
      const startIndex = (articleSeed % Math.max(1, fallbackImages.length - limit)) || 0;
      const selectedImages = shuffledImages.slice(startIndex, startIndex + limit);
      selectedImages.forEach((url, index) => {
        results.push({
          id: `fallback-${category}-${articleSeed}-${index}`,
          url,
          source: 'unsplash',
          type: 'image',
          tags: [category],
          relevanceScore: 1,
          metadata: { license: 'Unsplash License' },
        });
      });
    }
    if (type === 'video' || type === 'both') {
      // Video functionality currently limited - YouTube removed
      console.log('Video fallback functionality disabled (YouTube removed)');
    }
    return results;
  }
  /**
   * Utility function to create hash from string for consistent uniqueness
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  /**
   * Utility function to shuffle array with seed for consistency
   */
  private shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    // Use seed-based random for consistent shuffling per article
    let currentSeed = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Simple seed-based random number generation
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const j = Math.floor((currentSeed / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  /**
   * Utility function to shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  /**
   * Category-specific search terms for better results
   */
  private getCategorySearchTerms(category: string): string[] {
    const categoryTerms: Record<string, string[]> = {
      technology: ['innovation', 'digital', 'software', 'computer', 'tech', 'artificial intelligence', 'coding', 'startup', 'cloud computing', 'mobile'],
      health: ['medical', 'healthcare', 'wellness', 'medicine', 'fitness', 'hospital', 'doctor', 'nutrition', 'mental health', 'surgery'],
      business: ['corporate', 'office', 'meeting', 'strategy', 'finance', 'entrepreneurship', 'teamwork', 'leadership', 'marketing', 'productivity'],
      science: ['research', 'laboratory', 'experiment', 'discovery', 'analysis', 'microscope', 'data', 'physics', 'chemistry', 'biology'],
      environment: ['nature', 'green', 'sustainability', 'ecology', 'climate', 'renewable energy', 'conservation', 'forest', 'ocean', 'wildlife'],
      lifestyle: ['people', 'lifestyle', 'daily', 'modern', 'living', 'travel', 'food', 'culture', 'family', 'recreation'],
      finance: ['money', 'investment', 'banking', 'stock market', 'economy', 'financial planning', 'cryptocurrency', 'trading', 'business', 'growth'],
    };
    return categoryTerms[category] || ['professional', 'modern'];
  }
  /**
   * Fallback image pools by category with more variety
   */
  private getFallbackImages(category: string): string[] {
    const imageMap: Record<string, string[]> = {
      technology: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop&crop=center',
      ],
      health: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1550831107-1553507196-07d1deb3b2ca?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=800&fit=crop&crop=center',
      ],
      business: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=800&fit=crop&crop=center',
      ],
      science: [
        'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1569091491742-de909b6e1963?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1200&h=800&fit=crop&crop=center',
      ],
      environment: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1552083375-1447ce886485?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572041501062-9b90f4c9b1e7?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&crop=center',
      ],
      lifestyle: [
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1495521821757-a0bd0c3f3e0d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1519750157634-b3532d739619?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop&crop=center',
      ]
    };
    return imageMap[category] || imageMap.lifestyle;
  }
  /**
   * Track Unsplash download to comply with API terms
   */
  async trackUnsplashDownload(photoId: string): Promise<void> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash Access Key not available for download tracking');
      return;
    }
    try {
      const response = await fetch(`https://api.unsplash.com/photos/${photoId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to track download: ${response.statusText}`);
      }
      console.log(`Successfully tracked download for photo ${photoId}`);
    } catch (error) {
      console.error('Error tracking Unsplash download:', error);
      throw error;
    }
  }
}
export { MediaManager };
export default MediaManager;