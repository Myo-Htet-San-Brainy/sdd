// lib/mongodb.ts
import { loadEnvConfig } from "@next/env";
import { MongoClient, MongoClientOptions, Db } from "mongodb";

// Load .env / .env.local for standalone scripts (e.g. tsx). Next.js already loads these in-app.
loadEnvConfig(process.cwd());

const mongodbUri = process.env.MONGODB_URI;
const dbName = "SDD";

if (!mongodbUri) {
  throw new Error("Missing MONGODB_URI in environment (.env)");
}
const MONGODB_URI: string = mongodbUri;

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
