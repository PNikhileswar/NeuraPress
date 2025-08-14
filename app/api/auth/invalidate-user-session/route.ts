import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
// POST /api/auth/invalidate-user-session - Invalidate sessions for a specific user
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const sessionInvalidationCollection = db.collection('session_invalidations');
    // Add an entry to invalidate all sessions for this user
    await sessionInvalidationCollection.insertOne({
      email: email,
      invalidatedAt: new Date(),
      reason: 'admin_status_changed'
    });
    // Clean up old invalidation records (older than 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    await sessionInvalidationCollection.deleteMany({
      invalidatedAt: { $lt: weekAgo }
    });
    await client.close();
    return NextResponse.json({ 
      success: true,
      message: 'User sessions invalidated'
    });
  } catch (error) {
    console.error('Error invalidating user session:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate user session' },
      { status: 500 }
    );
  }
}