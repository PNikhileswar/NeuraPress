import { NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';
export async function GET() {
  // Skip database operations during build time
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV === undefined) {
    return NextResponse.json({ 
      message: 'Debug API - Build time mode',
      count: 0,
      articles: [] 
    });
  }

  try {
    await connectDB();
    const articles = await Article.find({}).limit(5).lean();
    return NextResponse.json({
      count: articles.length,
      articles: articles.map(article => ({
        _id: article._id,
        title: article.title,
        ogImage: article.ogImage,
        hasOgImage: !!article.ogImage,
        ogImageType: typeof article.ogImage,
        keys: Object.keys(article),
      }))
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json({ error: 'Failed to debug articles' }, { status: 500 });
  }
}