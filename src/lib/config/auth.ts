import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/database/mongodb';
import mongoose from 'mongoose';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins - this prevents OAuthAccountNotLinked errors
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      // Handle session update triggers (for manual refresh)
      if (trigger === 'update' && session) {
        // When session.update() is called, merge the new data
        if (session.isAdmin !== undefined) {
          token.isAdmin = session.isAdmin;
        }
        if (session.forceRefresh) {
          // Force refresh from database using Mongoose
          try {
            await connectDB();
            const db = mongoose.connection.db;
            if (db) {
              const customUsersCollection = db.collection('app_users');
              const currentUser = await customUsersCollection.findOne({ email: token.email });
              if (currentUser) {
                token.isAdmin = currentUser.isAdmin || false;
                token.name = currentUser.name;
                token.picture = currentUser.image;
                token.refreshedAt = Date.now(); // Add timestamp
              }
            }
          } catch (error) {
            console.error('Error refreshing token from database:', error);
          }
        }
        return token;
      }
      // Persist the OAuth access_token and/or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        // Clean up the Google image URL to remove size restrictions
        let imageUrl = user.image;
        if (imageUrl && imageUrl.includes('googleusercontent.com')) {
          // Remove size parameter from Google image URL
          imageUrl = imageUrl.replace(/=s\d+-c$/, '');
        }
        token.picture = imageUrl;
        // Check if this is the first user by checking our custom collection
        try {
          // Optimize: Only connect if we need to check/create user
          if (user && user.email) {
            await connectDB();
            const db = mongoose.connection.db;
            if (db) {
              const customUsersCollection = db.collection('app_users');
              // Use faster findOne with projection to only get isAdmin field
              let existingUser = await customUsersCollection.findOne(
                { email: user.email }, 
                { projection: { isAdmin: 1 } }
              );
              if (!existingUser) {
                // Only count if user doesn't exist (rare case)
                const userCount = await customUsersCollection.countDocuments();
                const isFirstUser = userCount === 0;
                // Create user in our custom collection
                await customUsersCollection.insertOne({
                  email: user.email,
                  name: user.name,
                  image: imageUrl,
                  isAdmin: isFirstUser,
                  createdAt: new Date()
                });
                token.isAdmin = isFirstUser;
              } else {
                token.isAdmin = existingUser.isAdmin || false;
              }
            } else {
              token.isAdmin = false;
            }
          }
        } catch (error) {
          console.error('Error in JWT callback:', error);
          token.isAdmin = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client (reduced logging)
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin || false;
        // Ensure user image is included in the session
        if (token.picture) {
          session.user.image = token.picture as string;
        }
        if (token.name) {
          session.user.name = token.name as string;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: 'jwt', // Use JWT instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
      }
    }
  },
  debug: false, // Disable debug logs to reduce console spam
};