import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}
interface Cached {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}
declare global {
  var mongoose: Cached | undefined;
}
let cached: Cached = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) {
  global.mongoose = cached;
}
async function connectDB(): Promise<mongoose.Connection> {
  // Skip database connection during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping MongoDB connection during build phase');
    throw new Error('Database connection skipped during build');
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'neurapress', // Explicitly use neurapress database
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10,
      minPoolSize: 5,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB (neurapress database)');
      return mongoose.connection;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
export default connectDB;