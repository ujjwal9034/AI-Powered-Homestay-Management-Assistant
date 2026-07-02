/**
 * Database Configuration
 * Connects to MongoDB Atlas using the MONGO_URI from environment variables.
 * Exports a function that server.js calls before starting the Express server.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`\n✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database Name:    ${conn.connection.name}\n`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed: ${error.message}\n`);
    // Exit process with failure code so the developer knows something is wrong
    process.exit(1);
  }
};

module.exports = connectDB;
