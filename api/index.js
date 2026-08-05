/**
 * Vercel Serverless Function Entry Point
 * 
 * This file wraps the existing Express app for Vercel's serverless runtime.
 * MongoDB connection is established once per cold start and reused across invocations.
 */

const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  // Connect to MongoDB (idempotent helper will return immediately if already active)
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }

  // Import the Express app (after DB connection)
  const app = require('../backend/server');
  return app(req, res);
};
