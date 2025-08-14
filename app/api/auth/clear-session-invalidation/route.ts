import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
// POST /api/auth/clear-session-invalidation - Clear invalidation record for a user
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
    // Remove invalidation record for this user
    await sessionInvalidationCollection.deleteMany({
      email: email
    });
    await client.close();
    return NextResponse.json({ 
      success: true,
      message: 'Session invalidation cleared'
    });
  } catch (error) {
    console.error('Error clearing session invalidation:', error);
    return NextResponse.json(
      { error: 'Failed to clear session invalidation' },
      { status: 500 }
    );
  }
}