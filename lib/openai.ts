import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContentGenerationRequest {
  topic: string;
  keywords: string[];
  category: string;
  mediaUrls?: string[];
}

interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  metaKeywords: string[];
  excerpt: string;
  tags: string[];
  readingTime: number;
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Fallback content generator when OpenAI is not available
function generateFallbackContent(request: ContentGenerationRequest): GeneratedContent {
  const { topic, keywords, category } = request;
  
  // Generate category-appropriate placeholder images
  const getPlaceholderImages = (category: string, topic: string) => {
    const categoryImages: Record<string, string[]> = {
      technology: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&h=400&fit=crop&crop=center',
      ],
      health: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center',
      ],
      finance: [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop&crop=center',
      ],
      business: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&crop=center',
      ],
      environment: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center',
      ],
      science: [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&h=400&fit=crop&crop=center',
      ],
      lifestyle: [
        'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop&crop=center',
      ],
    };
    
    return categoryImages[category] || categoryImages.technology;
  };
  
  const title = `${topic}: A Comprehensive Guide`;
  const images = getPlaceholderImages(category, topic);
  
  const content = `# ${title}

![${topic}](${images[0]})

## Introduction

${topic} has become increasingly important in today's digital landscape. This comprehensive guide explores the latest trends, insights, and practical applications related to ${topic}.

## Key Insights

Understanding ${topic} requires a deep dive into several key areas:

### 1. Current Trends
The landscape of ${topic} is constantly evolving. Recent developments show significant growth and innovation in this space.

![Trends in ${topic}](${images[1]})

### 2. Best Practices
When working with ${topic}, it's essential to follow industry best practices to ensure optimal results.

### 3. Future Outlook
Looking ahead, ${topic} is expected to continue growing and evolving, presenting new opportunities and challenges.

## Keywords and Related Topics

This article covers important aspects related to: ${keywords.join(', ')}.

![${topic} Applications](${images[2]})

## Conclusion

${topic} represents a significant opportunity for businesses and individuals alike. By understanding the key concepts and staying updated with the latest trends, you can leverage ${topic} to achieve your goals.

*This article was generated using TrendWise's content generation system.*`;

  return {
    title,
    content,
    metaDescription: `Discover everything you need to know about ${topic}. Expert insights, trends, and practical guidance.`,
    metaKeywords: keywords,
    excerpt: `A comprehensive guide to ${topic}, covering the latest trends, best practices, and future outlook.`,
    tags: keywords.slice(0, 5),
    readingTime: 5,
    seoData: {
      title,
      description: `Learn about ${topic} with this comprehensive guide covering trends, insights, and best practices.`,
      keywords: keywords,
    },
  };
}

export async function generateArticleContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const { topic, keywords, category, mediaUrls = [] } = request;

  const prompt = `
    Write a comprehensive, SEO-optimized blog article about "${topic}" in the ${category} category.
    
    Requirements:
    - Include primary keywords: ${keywords.join(', ')}
    - Structure with H1, H2, H3 headings
    - Include engaging introduction and conclusion
    - Add relevant subheadings and bullet points
    - Write in a professional, engaging tone
    - Optimize for search engines
    - Include actionable insights
    - Make it approximately 1500-2000 words
    
    Format the response as a JSON object with the following structure:
    {
      "title": "SEO-optimized title (max 60 characters)",
      "content": "Full article content in markdown format with proper headings",
      "metaDescription": "SEO meta description (max 160 characters)",
      "metaKeywords": ["keyword1", "keyword2", "keyword3"],
      "excerpt": "Article excerpt (max 200 characters)",
      "tags": ["tag1", "tag2", "tag3"],
      "seoData": {
        "title": "SEO title for meta tags",
        "description": "SEO description for meta tags",
        "keywords": ["seo-keyword1", "seo-keyword2"]
      }
    }
    
    Make sure the content is original, informative, and engaging.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert content writer and SEO specialist. You create high-quality, engaging blog articles that rank well in search engines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content generated');
    }

    const parsedContent = JSON.parse(responseContent);
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = parsedContent.content.split(' ').length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      ...parsedContent,
      readingTime,
    };
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    
    // Check if it's a quota/billing issue
    if (error instanceof Error && (
      error.message.includes('insufficient_quota') ||
      error.message.includes('quota') ||
      error.message.includes('billing')
    )) {
      console.log('OpenAI quota exceeded, using fallback content generation');
      return generateFallbackContent(request);
    }
    
    throw new Error('Failed to generate article content');
  }
}

export async function generateSEOMetadata(title: string, content: string): Promise<{
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
}> {
  const prompt = `
    Generate SEO metadata for the following article:
    Title: ${title}
    Content: ${content.substring(0, 1000)}...
    
    Provide a JSON response with:
    {
      "metaDescription": "SEO meta description (max 160 characters)",
      "metaKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "ogTitle": "Open Graph title (max 60 characters)",
      "ogDescription": "Open Graph description (max 120 characters)"
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Generate optimized metadata for better search engine visibility."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No metadata generated');
    }

    return JSON.parse(responseContent);
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    throw new Error('Failed to generate SEO metadata');
  }
}
