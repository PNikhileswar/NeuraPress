// Enhanced media management system for TrendWise
import fetch from 'node-fetch';

export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  source: 'unsplash' | 'pexels' | 'youtube' | 'vimeo';
  type: 'image' | 'video';
  tags: string[];
  relevanceScore: number;
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for videos
    photographer?: string;
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
}

class MediaManager {
  private readonly UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  private readonly PEXELS_API_KEY = process.env.PEXELS_API_KEY;
  private readonly YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  /**
   * Search for relevant media based on article content
   */
  async searchRelevantMedia(options: MediaSearchOptions): Promise<MediaItem[]> {
    const { query, keywords, category, type = 'both', limit = 10 } = options;
    
    const results: MediaItem[] = [];
    
    try {
      // Create search terms based on content analysis
      const searchTerms = this.generateSearchTerms(query, keywords, category);
      
      if (type === 'image' || type === 'both') {
        // Search Unsplash
        const unsplashResults = await this.searchUnsplash(searchTerms, Math.ceil(limit * 0.6));
        results.push(...unsplashResults);
        
        // Search Pexels as backup/additional source
        const pexelsResults = await this.searchPexels(searchTerms, Math.ceil(limit * 0.4));
        results.push(...pexelsResults);
      }
      
      if (type === 'video' || type === 'both') {
        // Search YouTube for educational/news videos
        const youtubeResults = await this.searchYouTube(searchTerms, Math.min(3, limit));
        results.push(...youtubeResults);
      }
      
      // Score and sort results by relevance
      const scoredResults = this.scoreRelevance(results, query, keywords);
      
      return scoredResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error searching for media:', error);
      // Return fallback media if API calls fail
      return this.getFallbackMedia(category, type, limit);
    }
  }

  /**
   * Generate intelligent search terms from article content
   */
  private generateSearchTerms(query: string, keywords: string[], category: string): string[] {
    const terms = new Set<string>();
    
    // Add main topic words (clean and filter)
    const queryWords = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isStopWord(word));
    
    queryWords.slice(0, 3).forEach(word => terms.add(word));
    
    // Add relevant keywords
    keywords.slice(0, 5).forEach(keyword => {
      const cleanKeyword = keyword.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
      if (cleanKeyword.length > 3 && !this.isStopWord(cleanKeyword)) {
        terms.add(cleanKeyword);
      }
    });
    
    // Add category-specific terms
    const categoryTerms = this.getCategorySearchTerms(category);
    categoryTerms.forEach(term => terms.add(term));
    
    return Array.from(terms);
  }

  /**
   * Search Unsplash for high-quality images
   */
  private async searchUnsplash(searchTerms: string[], limit: number): Promise<MediaItem[]> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not provided, using fallback images');
      return [];
    }

    const results: MediaItem[] = [];
    
    for (const term of searchTerms.slice(0, 3)) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=${Math.ceil(limit / 3)}&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json() as any;
          
          for (const photo of data.results || []) {
            results.push({
              id: photo.id,
              url: `${photo.urls.regular}?w=1200&h=800&fit=crop&crop=center`,
              thumbnailUrl: photo.urls.thumb,
              title: photo.description || photo.alt_description || term,
              description: photo.description,
              source: 'unsplash',
              type: 'image',
              tags: photo.tags?.map((tag: any) => tag.title) || [term],
              relevanceScore: 0, // Will be calculated later
              metadata: {
                width: photo.width,
                height: photo.height,
                photographer: photo.user.name,
                license: 'Unsplash License',
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error searching Unsplash for "${term}":`, error);
      }
    }
    
    return results;
  }

  /**
   * Search Pexels for additional images
   */
  private async searchPexels(searchTerms: string[], limit: number): Promise<MediaItem[]> {
    if (!this.PEXELS_API_KEY) {
      console.warn('Pexels API key not provided');
      return [];
    }

    const results: MediaItem[] = [];
    
    for (const term of searchTerms.slice(0, 2)) {
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(term)}&per_page=${Math.ceil(limit / 2)}&orientation=landscape`,
          {
            headers: {
              'Authorization': this.PEXELS_API_KEY,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json() as any;
          
          for (const photo of data.photos || []) {
            results.push({
              id: photo.id.toString(),
              url: photo.src.large,
              thumbnailUrl: photo.src.medium,
              title: photo.alt || term,
              description: photo.alt,
              source: 'pexels',
              type: 'image',
              tags: [term],
              relevanceScore: 0,
              metadata: {
                width: photo.width,
                height: photo.height,
                photographer: photo.photographer,
                license: 'Pexels License',
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error searching Pexels for "${term}":`, error);
      }
    }
    
    return results;
  }

  /**
   * Search YouTube for educational videos
   */
  private async searchYouTube(searchTerms: string[], limit: number): Promise<MediaItem[]> {
    if (!this.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not provided');
      return [];
    }

    const results: MediaItem[] = [];
    const mainTerm = searchTerms[0];
    
    try {
      // Search for educational/news content
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(mainTerm + ' explained')}&type=video&videoDuration=medium&videoDefinition=high&maxResults=${limit}&key=${this.YOUTUBE_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json() as any;
        
        for (const video of data.items || []) {
          results.push({
            id: video.id.videoId,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            thumbnailUrl: video.snippet.thumbnails.medium.url,
            title: video.snippet.title,
            description: video.snippet.description,
            source: 'youtube',
            type: 'video',
            tags: [mainTerm],
            relevanceScore: 0,
            metadata: {
              publishedAt: video.snippet.publishedAt,
              license: 'YouTube Standard License',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error searching YouTube:', error);
    }
    
    return results;
  }

  /**
   * Score media relevance based on content matching
   */
  private scoreRelevance(mediaItems: MediaItem[], query: string, keywords: string[]): MediaItem[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const keywordWords = keywords.map(k => k.toLowerCase());
    
    return mediaItems.map(item => {
      let score = 0;
      const itemText = `${item.title || ''} ${item.description || ''} ${item.tags.join(' ')}`.toLowerCase();
      
      // Score based on query word matches
      queryWords.forEach(word => {
        if (itemText.includes(word)) score += 10;
      });
      
      // Score based on keyword matches
      keywordWords.forEach(keyword => {
        if (itemText.includes(keyword)) score += 5;
      });
      
      // Bonus for Unsplash (higher quality typically)
      if (item.source === 'unsplash') score += 2;
      
      // Bonus for images with descriptions
      if (item.description && item.description.length > 20) score += 3;
      
      item.relevanceScore = score;
      return item;
    });
  }

  /**
   * Get fallback media when APIs fail
   */
  private getFallbackMedia(category: string, type: 'image' | 'video' | 'both', limit: number): MediaItem[] {
    const fallbackImages = this.getFallbackImages(category);
    const results: MediaItem[] = [];
    
    if (type === 'image' || type === 'both') {
      fallbackImages.slice(0, limit).forEach((url, index) => {
        results.push({
          id: `fallback-${category}-${index}`,
          url,
          source: 'unsplash',
          type: 'image',
          tags: [category],
          relevanceScore: 1,
          metadata: { license: 'Unsplash License' },
        });
      });
    }
    
    return results;
  }

  /**
   * Category-specific search terms for better results
   */
  private getCategorySearchTerms(category: string): string[] {
    const categoryTerms: Record<string, string[]> = {
      technology: ['innovation', 'digital', 'software', 'computer', 'tech'],
      health: ['medical', 'healthcare', 'wellness', 'medicine', 'fitness'],
      business: ['corporate', 'office', 'meeting', 'strategy', 'finance'],
      science: ['research', 'laboratory', 'experiment', 'discovery', 'analysis'],
      environment: ['nature', 'green', 'sustainability', 'ecology', 'climate'],
      lifestyle: ['people', 'lifestyle', 'daily', 'modern', 'living'],
    };
    
    return categoryTerms[category] || ['professional', 'modern'];
  }

  /**
   * Fallback image pools by category
   */
  private getFallbackImages(category: string): string[] {
    const imageMap: Record<string, string[]> = {
      technology: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&h=800&fit=crop&crop=center',
      ],
      health: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop&crop=center',
      ],
      business: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&crop=center',
      ],
    };
    
    return imageMap[category] || imageMap.technology;
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'a', 'an', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were',
      'comprehensive', 'guide', 'article', 'best', 'practices', 'future', 'latest'
    ]);
    return stopWords.has(word.toLowerCase());
  }
}

const mediaManager = new MediaManager();

export default mediaManager;
export { MediaManager };
