import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';
// GET /api/bookmarks - Get user's bookmarks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const bookmarksCollection = db.collection('bookmarks');
    const bookmarks = await bookmarksCollection
      .find({ userEmail: session.user.email })
      .sort({ bookmarkedAt: -1 })
      .toArray();
    await client.close();
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}
// POST /api/bookmarks - Add a bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { articleId, articleTitle, articleSlug, articleExcerpt, articleCategory, articleImage } = body;
    if (!articleId || !articleTitle || !articleSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const bookmarksCollection = db.collection('bookmarks');
    // Check if bookmark already exists
    const existingBookmark = await bookmarksCollection.findOne({
      userEmail: session.user.email,
      articleId: articleId
    });
    if (existingBookmark) {
      await client.close();
      return NextResponse.json(
        { error: 'Article already bookmarked' },
        { status: 409 }
      );
    }
    // Add new bookmark
    const bookmark = {
      userId: (session.user as any).id || session.user.email,
      userEmail: session.user.email,
      articleId,
      articleTitle,
      articleSlug,
      articleExcerpt: articleExcerpt || '',
      articleCategory: articleCategory || 'Uncategorized',
      articleImage: articleImage || null,
      bookmarkedAt: new Date()
    };
    const result = await bookmarksCollection.insertOne(bookmark);
    await client.close();
    return NextResponse.json({ 
      message: 'Bookmark added successfully',
      bookmarkId: result.insertedId 
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to add bookmark' },
      { status: 500 }
    );
  }
}
// DELETE /api/bookmarks - Remove a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
    const result = await bookmarksCollection.deleteOne({
      userEmail: session.user.email,
      articleId: articleId
    });
    await client.close();
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}