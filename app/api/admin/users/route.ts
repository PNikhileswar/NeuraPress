import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';
// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Check if user is authenticated and is admin
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const usersCollection = db.collection('app_users');
    // Fetch all users, excluding sensitive data
    const users = await usersCollection.find(
      {},
      { 
        projection: { 
          _id: 1,
          name: 1, 
          email: 1, 
          image: 1, 
          isAdmin: 1, 
          createdAt: 1 
        } 
      }
    ).sort({ createdAt: -1 }).toArray();
    await client.close();
    return NextResponse.json({ 
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin || false,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
// PUT /api/admin/users - Update user admin status (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    const { userId, isAdmin } = await request.json();
    if (!userId || typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. userId and isAdmin boolean are required.' },
        { status: 400 }
      );
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const usersCollection = db.collection('app_users');
    // Check if user exists
    const { ObjectId } = require('mongodb');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      await client.close();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    // Prevent admin from removing their own admin status
    if (user.email === session.user.email && !isAdmin) {
      await client.close();
      return NextResponse.json(
        { error: 'You cannot remove your own admin privileges' },
        { status: 400 }
      );
    }
    // Update user admin status
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          isAdmin: isAdmin,
          updatedAt: new Date()
        } 
      }
    );
    await client.close();
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    // Invalidate the target user's session so they need to refresh
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/auth/invalidate-user-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });
    } catch (error) {
      console.warn('Failed to invalidate user session:', error);
      // Continue even if session invalidation fails
    }
    return NextResponse.json({ 
      success: true,
      message: `User ${isAdmin ? 'granted' : 'revoked'} admin access successfully`,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        isAdmin: isAdmin
      },
      targetUserEmail: user.email, // Include target user email for client-side handling
      refreshSession: true // Flag to indicate session should be refreshed
    });
  } catch (error) {
    console.error('Error updating user admin status:', error);
    return NextResponse.json(
      { error: 'Failed to update user admin status' },
      { status: 500 }
    );
  }
}