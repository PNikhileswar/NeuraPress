import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/auth/check-session-validity - Check if current session is still valid
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { valid: false, reason: 'no_session' },
        { status: 401 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    // Check if user's session has been invalidated
    const sessionInvalidationCollection = db.collection('session_invalidations');
    const invalidation = await sessionInvalidationCollection.findOne({
      email: session.user.email
    });
    // Get current user data from database
    const usersCollection = db.collection('app_users');
    const currentUserData = await usersCollection.findOne({ 
      email: session.user.email 
    });
    await client.close();
    // If session was invalidated, it's invalid
    if (invalidation) {
      return NextResponse.json({
        valid: false,
        reason: 'session_invalidated',
        invalidatedAt: invalidation.invalidatedAt,
        shouldRefresh: true
      });
    }
    // If user not found in database, session is invalid
    if (!currentUserData) {
      return NextResponse.json({
        valid: false,
        reason: 'user_not_found'
      });
    }
    // Check if admin status has changed
    const sessionIsAdmin = (session.user as any).isAdmin || false;
    const dbIsAdmin = currentUserData.isAdmin || false;
    if (sessionIsAdmin !== dbIsAdmin) {
      return NextResponse.json({
        valid: false,
        reason: 'admin_status_changed',
        currentAdminStatus: dbIsAdmin,
        shouldRefresh: true
      });
    }
    // Session is valid
    return NextResponse.json({
      valid: true,
      currentAdminStatus: dbIsAdmin,
      userData: {
        name: currentUserData.name,
        email: currentUserData.email,
        image: currentUserData.image,
        isAdmin: dbIsAdmin
      }
    });
  } catch (error) {
    console.error('Error checking session validity:', error);
    return NextResponse.json(
      { valid: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}