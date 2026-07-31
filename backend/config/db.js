/**
 * Database Configuration
 * Connects to MongoDB Atlas using the MONGO_URI from environment variables.
 * Exports a function that server.js calls before starting the Express server.
 * 
 * Idempotent: skips connection if already connected (important for serverless).
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  // Skip if already connected (serverless functions may reuse connections)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`\n✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database Name:    ${conn.connection.name}\n`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed: ${error.message}\n`);
    throw error; // Let the caller handle it (serverless or local)
  }
};

module.exports = connectDB;

