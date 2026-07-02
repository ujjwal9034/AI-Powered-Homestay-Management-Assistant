/**
 * Database Seeder
 * Populates MongoDB with initial review data from the static reviews.json file.
 *
 * Usage:
 *   node seed.js          — Seeds the database (clears existing reviews first)
 *   node seed.js --clear  — Only clears all reviews from the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Review = require('./models/Review');

// Load the static review data
const dataPath = path.join(__dirname, 'data', 'reviews.json');
const reviewsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...\n');

    // Check if user wants to clear only
    if (process.argv.includes('--clear')) {
      await Review.deleteMany({});
      console.log('🗑️  All reviews deleted from database.');
      process.exit(0);
    }

    // Clear existing reviews before seeding
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing reviews.');

    // Remove the numeric `id` field from static data (MongoDB uses _id)
    const cleanedData = reviewsData.map(({ id, ...rest }) => rest);

    // Insert seed data
    const inserted = await Review.insertMany(cleanedData);
    console.log(`🌱 Seeded ${inserted.length} reviews into MongoDB.\n`);

    // Show what was inserted
    inserted.forEach((review, i) => {
      console.log(`   ${i + 1}. ${review.guest} (${review.platform}) — ⭐ ${review.rating}`);
    });

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Seeding failed: ${error.message}\n`);
    process.exit(1);
  }
};

seedDB();
