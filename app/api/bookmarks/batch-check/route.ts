import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// POST /api/bookmarks/batch-check - Check multiple article bookmarks at once
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ bookmarks: {} });
    }

    const body = await request.json();
    const { articleIds } = body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: 'Article IDs array is required' },
        { status: 400 }
      );
    }

    // Limit the number of article IDs to prevent abuse
    if (articleIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 article IDs allowed per request' },
        { status: 400 }
      );
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const bookmarksCollection = db.collection('bookmarks');

    // Find all bookmarks for the user and the specified article IDs
    const bookmarks = await bookmarksCollection.find({
      userEmail: session.user.email,
      articleId: { $in: articleIds }
    }).toArray();

    await client.close();

    // Create a map of articleId -> isBookmarked
    const bookmarkMap: Record<string, boolean> = {};
    articleIds.forEach(articleId => {
      bookmarkMap[articleId] = bookmarks.some(bookmark => bookmark.articleId === articleId);
    });

    return NextResponse.json({ bookmarks: bookmarkMap });
  } catch (error) {
    console.error('Error checking batch bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to check bookmarks' },
      { status: 500 }
    );
  }
}
