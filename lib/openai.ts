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
      model: "gpt-4",
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
    console.error('Error generating content:', error);
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
