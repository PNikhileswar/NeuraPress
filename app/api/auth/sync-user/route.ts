import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/auth';
import { MongoClient } from 'mongodb';
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const body = await request.json();
    const { email } = body;
    // Verify the email matches the session
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('neurapress');
    const usersCollection = db.collection('app_users');
    try {
      // Fetch the latest user data from database
      const dbUser = await usersCollection.findOne({ email });
      if (!dbUser) {
        // User doesn't exist in database yet, create them
        const userCount = await usersCollection.countDocuments();
        const isFirstUser = userCount === 0;
        const newUser = {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || '',
          isAdmin: isFirstUser, // First user becomes admin
          createdAt: new Date(),
          lastSignIn: new Date(),
          lastSync: new Date()
        };
        const newUserResult = await usersCollection.insertOne(newUser);
        return NextResponse.json({
          success: true,
          user: {
            id: newUserResult.insertedId.toString(),
            email: newUser.email,
            name: newUser.name,
            image: newUser.image,
            isAdmin: newUser.isAdmin
          },
          created: true
        });
      }
      // Update last sync time
      await usersCollection.updateOne(
        { email },
        { $set: { lastSync: new Date() } }
      );
      return NextResponse.json({
        success: true,
        user: {
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
          isAdmin: dbUser.isAdmin || false
        },
        updated: true
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error syncing user data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync user data', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}