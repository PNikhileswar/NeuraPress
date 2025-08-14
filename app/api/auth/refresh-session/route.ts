import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';
// POST /api/auth/refresh-session - Force refresh user's session with current DB data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const usersCollection = db.collection('app_users');
    // Get current user data from database
    const currentUserData = await usersCollection.findOne({ 
      email: session.user.email 
    });
    await client.close();
    if (!currentUserData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }
    // Return the fresh data that should be used to update the session
    return NextResponse.json({
      success: true,
      isAdmin: currentUserData.isAdmin || false,
      email: currentUserData.email,
      name: currentUserData.name,
      image: currentUserData.image,
      message: 'Session data refreshed',
      forceRefresh: true // Flag to trigger database refresh in JWT callback
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}