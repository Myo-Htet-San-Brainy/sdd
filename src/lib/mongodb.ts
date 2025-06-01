// lib/mongodb.ts
import { MongoClient, MongoClientOptions, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "SDD";

// Connection options
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
};

// Global variable to store the MongoDB client connection across multiple invocations
let cachedClient: MongoClient | null = null;
let cachedDb: null | Db = null;

export async function connectToDatabase() {
  // If the connection already exists, reuse it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new connection
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, options);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);

  return { client: cachedClient, db: cachedDb };
}

// Export a function to get collections
export async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}
