import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://neurapress-rho-eight.vercel.app';
  
  try {
    // Direct database query instead of fetch to avoid circular dependency
    await connectDB();
    const articles = await Article.find({})
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();
    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NeuraPress - AI-Powered Content</title>
    <description>Discover trending topics and AI-generated content on NeuraPress</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    ${articles.map((article: any) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.excerpt || article.content?.substring(0, 200) + '...'}]]></description>
      <link>${baseUrl}/article/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/article/${article.slug}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <category>${article.category}</category>
    </item>`).join('')}
  </channel>
</rss>`;
    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}