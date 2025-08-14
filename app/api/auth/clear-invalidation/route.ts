import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const invalidationsCollection = db.collection('session_invalidations');
    // Clear invalidation records for this email
    await invalidationsCollection.deleteMany({ email });
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