import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

if (!MONGODB_DB) {
  throw new Error('MONGODB_DB is not defined');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI as string);

  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}