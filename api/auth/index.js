import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { initAuth } from "../../modules/auth/index.js";
import { env } from "../../lib/env.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
// cache the connection across invocations
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGO_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

await connectDB();
initAuth({ app, db: mongoose });

export default app;
