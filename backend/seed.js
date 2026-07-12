/**
 * Database Seeder — Multi-Role
 * Populates MongoDB with initial data for all three roles.
 *
 * Creates:
 *   - 6 Users:    1 Admin, 2 Owners, 3 Customers (all with password: password123)
 *   - 5 Homestays distributed among the owners
 *   - 12 Reviews distributed among the homestays, some with replies
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
const Booking = require('./models/Booking');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...\n');

    // Clear existing collections
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Homestay.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing database collections.\n');

    if (process.argv.includes('--clear')) {
      console.log('🗑️  All data cleared. Exiting.');
      process.exit(0);
    }

    // ─── Create Users ────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@staywise.com',
      password: 'password123',
      role: 'admin',
    });

    const owner1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'owner@staywise.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98765 43210',
    });

    const owner2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@staywise.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98123 45678',
    });

    const customer1 = await User.create({
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

    const customer3 = await User.create({
      name: 'Aarav Mehta',
      email: 'aarav@example.com',
      password: 'password123',
      role: 'customer',
    });

    console.log('👤 Users created successfully.');

    // ─── Create Homestays ────────────────────────────────────────────────
    const homestaysData = [
      {
        name: 'Mountain View Retreat',
        location: 'Manali, Himachal Pradesh',
        description: 'A serene mountain retreat with breathtaking valley views, cozy rooms with a stone fireplace, and authentic Himachali cuisine. Perfect for couples and solo travelers seeking peace in the Himalayas.',
        owner: owner1._id,
        amenities: ['WiFi', 'Breakfast', 'Fireplace', 'Mountain View', 'Parking', 'Hot Water', 'Heater'],
        pricePerNight: 2500,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Riverside Heritage Villa',
        location: 'Rishikesh, Uttarakhand',
        description: 'Heritage villa on the banks of the Ganges. Features peaceful morning yoga sessions, pure organic farm-to-table meals, and thrilling white-water rafting access.',
        owner: owner1._id,
        amenities: ['WiFi', 'Yoga Studio', 'Organic Meals', 'River View', 'Rafting Access', 'Garden', 'AC'],
        pricePerNight: 3200,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Casa De Sol Beachfront',
        location: 'Anjuna, Goa',
        description: 'Boutique beachfront villa featuring stunning sunset pool decks, private sandy pathways, and direct access to Goa\'s popular shacks. An ideal sun-drenched holiday getaway.',
        owner: owner2._id,
        amenities: ['WiFi', 'Swimming Pool', 'Beach Access', 'Barbecue', 'Sea View', 'AC', 'Kitchen'],
        pricePerNight: 4500,
        image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Royal Haveli Heritage Suite',
        location: 'Jaipur, Rajasthan',
        description: 'Step back in time at this authentic 18th-century royal haveli. Built with stunning arches, traditional courtyards, local artwork, and classic Rajasthani hospitality.',
        owner: owner2._id,
        amenities: ['WiFi', 'Breakfast', 'Traditional Courtyard', 'AC', 'Cultural Shows', 'Lounge'],
        pricePerNight: 3800,
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Backwater Whispers Lake Resort',
        location: 'Kumarakom, Kerala',
        description: 'Cozy cottage rooms right on the edge of Vembanad Lake. Includes traditional Keralite houseboat rides, authentic Ayurvedic massage therapy, and delicious local seafood.',
        owner: owner1._id,
        amenities: ['WiFi', 'Ayurvedic Spa', 'Lake View', 'Houseboat Tour', 'AC', 'Infinity Pool'],
        pricePerNight: 4000,
        image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop&q=80',
      }
    ];

    const seededHomestays = await Homestay.create(homestaysData);
    console.log('🏡 5 Homestays created successfully.');

    // ─── Create Reviews ──────────────────────────────────────────────────
    const reviewsData = [
      {
        customer: customer1._id,
        homestay: seededHomestays[0]._id, // Manali
        rating: 5,
        text: 'Absolutely magical stay! The mountain views from the cozy rooms were breathtaking. The fireplace kept us warm, and Rajesh\'s home-cooked local meals were exceptional.',
        status: 'replied',
        ownerReply: {
          text: 'Thank you so much, Sarah! It was a pleasure hosting you. The mountains are even more beautiful in winter — we hope to welcome you back soon! 🏔️',
          repliedAt: new Date(),
        },
        aiSuggestion: 'We are thrilled that you loved the mountain views and the fireplace. It was a pleasure hosting you!',
      },
      {
        customer: customer2._id,
        homestay: seededHomestays[0]._id, // Manali
        rating: 4,
        text: 'Beautiful property and great food. The fireplace was a huge highlight. Subtracting one star because the WiFi was a bit spotty on the top floor.',
        status: 'replied',
        ownerReply: {
          text: 'Thank you for your feedback, Michael! We have installed a WiFi repeater on the top floor now to ensure seamless connectivity.',
          repliedAt: new Date(),
        },
        aiSuggestion: 'Thank you for your review. We are working to resolve the top-floor WiFi issue immediately.',
      },
      {
        customer: customer3._id,
        homestay: seededHomestays[0]._id, // Manali
        rating: 5,
        text: 'The best getaway from city life! Loved the Himachali hospitality. Rooms were spotless and very cozy. Highly recommended.',
        status: 'pending',
        aiSuggestion: 'Thank you Aarav! We take pride in offering a peaceful getaway and authentic local hospitality.',
      },
      {
        customer: customer1._id,
        homestay: seededHomestays[1]._id, // Rishikesh
        rating: 5,
        text: 'The riverside location is spectacular. Morning yoga right by the Ganges was a life-changing experience. Highly recommend the white-water rafting they arranged.',
        status: 'replied',
        ownerReply: {
          text: 'Namaste Sarah! Your words fill us with joy. We are happy you found peace by the river and hope it stays with you. 🙏',
          repliedAt: new Date(),
        },
        aiSuggestion: 'Namaste Sarah! We are so glad you enjoyed our yoga by the river and the rafting experience.',
      },
      {
        customer: customer2._id,
        homestay: seededHomestays[1]._id, // Rishikesh
        rating: 3,
        text: 'Great views, but the road access to the property was muddy and difficult during the monsoon rain. Best to visit in dry months.',
        status: 'pending',
        aiSuggestion: 'We appreciate your feedback. Yes, we advise guests to plan travel during October-March for optimal road conditions.',
      },
      {
        customer: customer2._id,
        homestay: seededHomestays[2]._id, // Goa
        rating: 5,
        text: 'Wow, Casa De Sol is right on the beach! The pool is amazing, sunset views are stunning, and Priya was an exceptional host. Excellent amenities and AC was freezing cold.',
        status: 'replied',
        ownerReply: {
          text: 'Thanks Michael! The sunset by the pool is our favorite spot too. Glad you had a great beach vacation!',
          repliedAt: new Date(),
        },
        aiSuggestion: 'Thank you Michael! We are glad you enjoyed the beachfront access and the pool.',
      },
      {
        customer: customer3._id,
        homestay: seededHomestays[2]._id, // Goa
        rating: 4,
        text: 'Very cute villa and close to all the popular Anjuna shacks. A bit noisy at night due to clubs nearby, but the private beach path was wonderful.',
        status: 'pending',
        aiSuggestion: 'Thank you Aarav! We appreciate your review. We provide sound-dampening curtains for light sleepers.',
      },
      {
        customer: customer1._id,
        homestay: seededHomestays[3]._id, // Jaipur
        rating: 5,
        text: 'Stunning royal decor and beautiful inner courtyard. The heritage walk arranged by Priya was informative and the staff treated us like royalty.',
        status: 'replied',
        ownerReply: {
          text: 'Padharo Mhare Des, Sarah! We are delighted that you enjoyed the historical haveli experience and heritage walk.',
          repliedAt: new Date(),
        },
        aiSuggestion: 'Thank you Sarah! We are happy to share our rich Rajasthani heritage with guests.',
      },
      {
        customer: customer3._id,
        homestay: seededHomestays[3]._id, // Jaipur
        rating: 4,
        text: 'A beautifully preserved historical house. Rooms are large and cool even without AC on. Breakfast had limited continental items but the Indian options were great.',
        status: 'pending',
        aiSuggestion: 'We appreciate your feedback! We will expand our breakfast selection to include more options soon.',
      },
      {
        customer: customer1._id,
        homestay: seededHomestays[4]._id, // Kerala
        rating: 5,
        text: 'An absolute paradise! The lake views are serene. The houseboat cruise was beautiful, and the Ayurvedic spa session left me completely refreshed.',
        status: 'replied',
        ownerReply: {
          text: 'Thank you, Sarah! The spa and houseboat are designed for complete relaxation. Hope to host you again!',
          repliedAt: new Date(),
        },
        aiSuggestion: 'Thank you for the kind words! We are glad you enjoyed the Ayurvedic spa and lake cruise.',
      },
      {
        customer: customer2._id,
        homestay: seededHomestays[4]._id, // Kerala
        rating: 4,
        text: 'Excellent lakeside resort. Very peaceful. Mosquitoes can be a minor issue in the evening, but the host provided nets and repellent.',
        status: 'pending',
        aiSuggestion: 'Thank you Michael! Yes, being close to the water means we take mosquito protection seriously for guests.',
      }
    ];

    const seededReviews = await Review.insertMany(reviewsData);
    console.log(`⭐ ${seededReviews.length} Reviews seeded.`);

    // ─── Update Homestay Averages and Counts ─────────────────────────────
    for (const h of seededHomestays) {
      const hReviews = seededReviews.filter((r) => r.homestay.toString() === h._id.toString());
      if (hReviews.length > 0) {
        const total = hReviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = Math.round((total / hReviews.length) * 10) / 10;
        await Homestay.findByIdAndUpdate(h._id, {
          rating: avg,
          totalReviews: hReviews.length,
        });
      }
    }
    console.log('📈 Re-calculated and updated homestay average ratings.');

    // ─── Add a couple of realistic simulated bookings ───────────────────
    const checkIn1 = new Date();
    checkIn1.setDate(checkIn1.getDate() + 5);
    const checkOut1 = new Date();
    checkOut1.setDate(checkOut1.getDate() + 8);

    const checkIn2 = new Date();
    checkIn2.setDate(checkIn2.getDate() - 10);
    const checkOut2 = new Date();
    checkOut2.setDate(checkOut2.getDate() - 6);

    const bookingData = [
      {
        customer: customer1._id,
        homestay: seededHomestays[0]._id, // Manali
        checkIn: checkIn1,
        checkOut: checkOut1,
        guestsCount: 2,
        nights: 3,
        basePrice: 7500,
        serviceFee: 375,
        tax: 900,
        totalPrice: 8775,
        status: 'confirmed',
      },
      {
        customer: customer2._id,
        homestay: seededHomestays[2]._id, // Goa
        checkIn: checkIn2,
        checkOut: checkOut2,
        guestsCount: 3,
        nights: 4,
        basePrice: 18000,
        serviceFee: 900,
        tax: 2160,
        totalPrice: 21060,
        status: 'confirmed',
      }
    ];

    await Booking.create(bookingData);
    console.log('📅 Seeded booking reservations.');

    console.log('\n=========================================');
    console.log('🎉 Seeding successfully completed!');
    console.log('=========================================');
    console.log('Login credentials (all use password "password123"):');
    console.log('  👑 Admin:    admin@staywise.com');
    console.log('  🏠 Owners:   owner@staywise.com (Rajesh Kumar)');
    console.log('               priya@staywise.com (Priya Sharma)');
    console.log('  👤 Customers:customer@staywise.com (Sarah Johnson)');
    console.log('               michael@example.com (Michael Chen)');
    console.log('               aarav@example.com (Aarav Mehta)');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Seeding failed: ${error.message}\n`);
    process.exit(1);
  }
};

seedDB();
