import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ isInvalidated: false });
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const invalidationsCollection = db.collection('session_invalidations');
    // Check if there's an invalidation record for this user
    const invalidation = await invalidationsCollection.findOne({ 
      email: session.user.email,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });
    await client.close();
    if (invalidation) {
      return NextResponse.json({ 
        isInvalidated: true,
        reason: invalidation.reason || 'Admin status changed',
        timestamp: invalidation.createdAt
      });
    }
    return NextResponse.json({ isInvalidated: false });
  } catch (error) {
    console.error('Error checking session invalidation:', error);
    return NextResponse.json(
      { error: 'Failed to check session status' },
      { status: 500 }
    );
  }
}