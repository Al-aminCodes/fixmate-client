import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URL!;

if (!uri) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
};

const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

export const mongoClient = client;
export const db = mongoClient.db(process.env.MONGODB_DB || "fixmate");
