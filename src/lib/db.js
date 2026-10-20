import mongoose from "mongoose";

const globalForMongoose = globalThis;

export async function connectDb() {
  if (!process.env.DATABASE_URI) {
    throw new Error("DATABASE_URI is missing.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!globalForMongoose.mongooseConnect) {
    globalForMongoose.mongooseConnect = mongoose.connect(
      process.env.DATABASE_URI,
    );
  }

  await globalForMongoose.mongooseConnect;
  return mongoose.connection;
}
