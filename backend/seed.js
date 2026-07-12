/**
 * Database Seeder — Multi-Role
 * Populates MongoDB with initial data for all three roles.
 *
 * Creates:
 *   - 3 Users:    admin, owner, customer (all with password: password123)
 *   - 2 Homestays owned by the owner user
 *   - 6 Reviews  written by the customer user, some with owner replies
 *
 * Usage:
 *   node seed.js          — Seeds the database (clears existing data first)
 *   node seed.js --clear  — Only clears all data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Homestay = require('./models/Homestay');
const Review = require('./models/Review');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...\n');

    // Check if user wants to clear only
    if (process.argv.includes('--clear')) {
      await Review.deleteMany({});
      await Homestay.deleteMany({});
      await User.deleteMany({});
      console.log('🗑️  All data cleared from database.');
      process.exit(0);
    }

    // ─── Clear existing data ─────────────────────────────────────────────
    await Review.deleteMany({});
    await Homestay.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data.\n');

    // ─── Create Users ────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@staywise.com',
      password: 'password123',
      role: 'admin',
    });

    const owner = await User.create({
      name: 'Rajesh Kumar',
      email: 'owner@staywise.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98765 43210',
    });

    const customer = await User.create({
      name: 'Sarah Johnson',
      email: 'customer@staywise.com',
      password: 'password123',
      role: 'customer',
    });

    const customer2 = await User.create({
      name: 'Michael Chen',
      email: 'michael@example.com',
      password: 'password123',
      role: 'customer',
    });

    console.log('👤 Users created:');
    console.log(`   1. ${admin.name} (${admin.email}) — ${admin.role}`);
    console.log(`   2. ${owner.name} (${owner.email}) — ${owner.role}`);
    console.log(`   3. ${customer.name} (${customer.email}) — ${customer.role}`);
    console.log(`   4. ${customer2.name} (${customer2.email}) — ${customer2.role}\n`);

    // ─── Create Homestays ────────────────────────────────────────────────
    const homestay1 = await Homestay.create({
      name: 'Mountain View Retreat',
      location: 'Manali, Himachal Pradesh',
      description: 'A serene mountain retreat with breathtaking valley views, cozy rooms with fireplace, and authentic Himachali cuisine. Perfect for couples and solo travelers seeking peace.',
      owner: owner._id,
      amenities: ['WiFi', 'Breakfast', 'Fireplace', 'Mountain View', 'Parking', 'Hot Water'],
      pricePerNight: 2500,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    });

    const homestay2 = await Homestay.create({
      name: 'Riverside Heritage Villa',
      location: 'Rishikesh, Uttarakhand',
      description: 'Heritage villa on the banks of the Ganges with yoga sessions, organic meals, and rafting access. An unforgettable spiritual and adventure experience.',
      owner: owner._id,
      amenities: ['WiFi', 'Yoga', 'Organic Meals', 'River View', 'Rafting Access', 'Garden'],
      pricePerNight: 3200,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    });

    console.log('🏡 Homestays created:');
    console.log(`   1. ${homestay1.name} — ${homestay1.location}`);
    console.log(`   2. ${homestay2.name} — ${homestay2.location}\n`);

    // ─── Create Reviews ──────────────────────────────────────────────────
    const reviews = await Review.insertMany([
      {
        customer: customer._id,
        homestay: homestay1._id,
        rating: 5,
        text: 'Absolutely magical place! The mountain views from the room were breathtaking. The host was incredibly warm and the local food was amazing. Will definitely come back!',
        status: 'replied',
        ownerReply: {
          text: 'Thank you so much, Sarah! It was a pleasure hosting you. The mountains are even more beautiful in winter — hope to see you again! 🏔️',
          repliedAt: new Date('2025-12-20'),
        },
        aiSuggestion: 'Thank you for your wonderful review! We are thrilled you enjoyed the mountain views and our hospitality.',
      },
      {
        customer: customer._id,
        homestay: homestay1._id,
        rating: 4,
        text: 'Great stay overall. The rooms were clean and comfortable. Only suggestion would be to improve the WiFi connectivity in the upper floor rooms.',
        status: 'replied',
        ownerReply: {
          text: 'Thank you for the feedback! We have upgraded our WiFi router and added a repeater for the upper floor. Looking forward to your next visit!',
          repliedAt: new Date('2025-12-22'),
        },
        aiSuggestion: 'We appreciate your feedback about the WiFi. We are working on improving connectivity across all rooms.',
      },
      {
        customer: customer2._id,
        homestay: homestay1._id,
        rating: 5,
        text: 'Perfect getaway from city life. The fireplace in winter was so cozy. The breakfast spread was the best I have had at any homestay. Highly recommend!',
        status: 'pending',
        aiSuggestion: 'Thank you for choosing Mountain View Retreat! Our breakfast menu features local Himachali recipes that we take great pride in.',
      },
      {
        customer: customer._id,
        homestay: homestay2._id,
        rating: 5,
        text: 'The riverside location is unbeatable. Morning yoga by the Ganges was a life-changing experience. The organic food was delicious and the staff was very helpful.',
        status: 'replied',
        ownerReply: {
          text: 'Namaste Sarah! Your kind words mean the world to us. The Ganges has a way of touching everyone\'s soul. We hope the peace you found here stays with you! 🙏',
          repliedAt: new Date('2025-12-25'),
        },
      },
      {
        customer: customer2._id,
        homestay: homestay2._id,
        rating: 4,
        text: 'Excellent location and beautiful property. The rafting experience arranged by the host was thrilling. Would love slightly more variety in the meal options.',
        status: 'pending',
        aiSuggestion: 'Thank you for your review! We are constantly updating our menu with new organic recipes. We hope to serve you again soon!',
      },
      {
        customer: customer._id,
        homestay: homestay2._id,
        rating: 3,
        text: 'Nice place but the road access was a bit difficult during monsoon season. The property itself is beautiful once you get there. Recommend visiting in October-March.',
        status: 'pending',
        aiSuggestion: 'We appreciate your honest feedback about road access. We recommend visitors plan their trip during October to March for the best experience.',
      },
    ]);

    // Update homestay ratings
    for (const homestay of [homestay1, homestay2]) {
      const homestayReviews = reviews.filter((r) => r.homestay.toString() === homestay._id.toString());
      const avgRating = homestayReviews.reduce((sum, r) => sum + r.rating, 0) / homestayReviews.length;
      await Homestay.findByIdAndUpdate(homestay._id, {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: homestayReviews.length,
      });
    }

    console.log(`⭐ ${reviews.length} Reviews created.\n`);

    reviews.forEach((review, i) => {
      console.log(`   ${i + 1}. ⭐${review.rating} — ${review.status} ${review.ownerReply?.text ? '(has reply)' : ''}`);
    });

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Login credentials (all use password: password123):');
    console.log('   👑 Admin:    admin@staywise.com');
    console.log('   🏠 Owner:    owner@staywise.com');
    console.log('   👤 Customer: customer@staywise.com');
    console.log('   👤 Customer: michael@example.com\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Seeding failed: ${error.message}\n`);
    process.exit(1);
  }
};

seedDB();
