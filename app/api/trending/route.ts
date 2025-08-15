import { NextResponse } from 'next/server';
import { getAllTrendingTopics } from '@/lib/utils/trending';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/trending - Get trending topics
export async function GET() {
  try {
    // Skip trending topics during build or in serverless environments where Playwright is not available
    if (process.env.VERCEL || process.env.NODE_ENV !== 'development') {
      console.log('Trending API: Skipping Playwright-dependent trending topics in production');
      return NextResponse.json([]);
    }
    
    const trendingTopics = await getAllTrendingTopics();
    return NextResponse.json(trendingTopics);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    // Return empty array instead of error to prevent build failure
    return NextResponse.json([]);
  }
}