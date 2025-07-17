import mongoose from 'mongoose';

import { config } from './config';

const uri = config.MONGODB_URI;

// Define the cache type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use module-level caching instead of global caching
const mongooseCache: MongooseCache = {
  conn: null,
  promise: null,
};

export async function getDatabase() {
  // Return existing connection if available
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  // Create new connection if no promise exists
  if (!mongooseCache.promise) {
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      family: 4, // Use IPv4, skip trying IPv6
    };

    mongooseCache.promise = mongoose
      .connect(uri, options)
      .then(mongoose => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch(error => {
        console.error('❌ MongoDB connection failed:', error);
        // Reset promise on error so we can retry
        mongooseCache.promise = null;
        throw error;
      });
  }

  try {
    mongooseCache.conn = await mongooseCache.promise;
    return mongooseCache.conn;
  } catch (error) {
    // Reset both connection and promise on error
    mongooseCache.promise = null;
    mongooseCache.conn = null;
    throw error;
  }
}

// Helper function to close the connection (useful for testing or cleanup)
export async function closeDatabase() {
  if (mongooseCache.conn) {
    await mongooseCache.conn.disconnect();
    mongooseCache.conn = null;
    mongooseCache.promise = null;
    console.log('🔒 MongoDB connection closed');
  }
}

// For backward compatibility, export a default promise
export default getDatabase();
