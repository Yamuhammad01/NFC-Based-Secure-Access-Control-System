const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
  // Reuse the existing connection on serverless warm starts (Vercel reuses
  // the same process for multiple invocations — a fresh connect each time
  // adds latency and risks connection pool exhaustion).
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  cachedConnection = null;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    cachedConnection = null;
    if (!process.env.VERCEL) process.exit(1);
    // CRITICAL: never resolve without a live connection. Resolving here
   
    throw error;
  }
};

module.exports = connectDB;
