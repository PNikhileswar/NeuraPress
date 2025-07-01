import { NextResponse } from 'next/server';
import { getAllTrendingTopics } from '@/lib/trending';

// GET /api/trending - Get trending topics
export async function GET() {
  try {
    const trendingTopics = await getAllTrendingTopics();
    return NextResponse.json(trendingTopics);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending topics' },
      { status: 500 }
    );
  }
}
