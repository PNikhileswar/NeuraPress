import { NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    
    const articleCount = await Article.countDocuments();
    const featuredCount = await Article.countDocuments({ featured: true });
    
    console.log(`Found ${articleCount} articles, ${featuredCount} featured`);
    
    return NextResponse.json({
      success: true,
      articleCount,
      featuredCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}
