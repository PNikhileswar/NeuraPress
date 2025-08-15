import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
export async function GET(request: NextRequest) {
  // Skip database operations during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      message: 'Build time mode - database test skipped',
      buildTime: true
    });
  }

  try {
    console.log('Testing MongoDB connection...');
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ 
        error: 'MONGODB_URI not configured',
        hasUri: false
      });
    }
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    const db = client.db('neurapress');
    const usersCollection = db.collection('app_users');
    // Get user count
    const userCount = await usersCollection.countDocuments();
    console.log('User count:', userCount);
    // Get all users (limited to first 5)
    const users = await usersCollection.find({}).limit(5).toArray();
    console.log('Sample users:', users.length);
    await client.close();
    return NextResponse.json({
      success: true,
      userCount,
      sampleUsers: users.map(user => ({
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    return NextResponse.json({
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}