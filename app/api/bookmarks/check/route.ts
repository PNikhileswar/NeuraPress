import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/bookmarks/check - Check if an article is bookmarked
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ isBookmarked: false });
    }
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const bookmarksCollection = db.collection('bookmarks');
    const bookmark = await bookmarksCollection.findOne({
      userEmail: session.user.email,
      articleId: articleId
    });
    await client.close();
    return NextResponse.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json({ isBookmarked: false });
  }
}