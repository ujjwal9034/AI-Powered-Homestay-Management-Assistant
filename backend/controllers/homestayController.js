/**
 * Homestay Controller
 * CRUD operations for homestay properties.
 *
 * - Public: browse all, view single
 * - Owner: create, update, delete (own only)
 * - Admin: update, delete (any)
 */

const Homestay = require('../models/Homestay');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { generateTouristChatResponse, generateEnhancedDescription, generateHostInsights, generateDynamicPricingRecommendation } = require('../config/gemini');

/**
 * GET /api/homestays
 * Public — list all homestays.
 */
const getAllHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find()
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: homestays.length,
      data: homestays,
    });
  } catch (error) {
    console.error('[getAllHomestays] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch homestays', error: error.message });
  }
};

/**
 * GET /api/homestays/mine
 * Owner only — list homestays owned by current user.
 */
const getMyHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: homestays.length,
      data: homestays,
    });
  } catch (error) {
    console.error('[getMyHomestays] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch your homestays', error: error.message });
  }
};

/**
 * GET /api/homestays/:id
 * Public — single homestay with its reviews.
 */
const getHomestayById = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.id)
      .populate('owner', 'name email avatar');

    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Fetch reviews for this homestay
    const reviews = await Review.find({ homestay: homestay._id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { ...homestay.toObject(), reviews },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid homestay ID format' });
    }
    console.error('[getHomestayById] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch homestay', error: error.message });
  }
};

/**
 * POST /api/homestays
 * Owner only — create a new homestay.
 */
const createHomestay = async (req, res) => {
  try {
    const { name, location, description, amenities, pricePerNight, image } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Name and location are required' });
    }

    const homestay = await Homestay.create({
      name,
      location,
      description: description || '',
      owner: req.user._id,
      amenities: amenities || [],
      pricePerNight: pricePerNight || 0,
      image: image || null,
    });

    res.status(201).json({
      success: true,
      message: 'Homestay created successfully',
      data: homestay,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    console.error('[createHomestay] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create homestay', error: error.message });
  }
};

/**
 * PUT /api/homestays/:id
 * Owner (own) or Admin — update a homestay.
 */
const updateHomestay = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.id);

    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Only the owner or admin can update
    if (homestay.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own homestays' });
    }

    const { name, location, description, amenities, pricePerNight, image } = req.body;

    homestay.name = name || homestay.name;
    homestay.location = location || homestay.location;
    homestay.description = description !== undefined ? description : homestay.description;
    homestay.amenities = amenities || homestay.amenities;
    homestay.pricePerNight = pricePerNight !== undefined ? pricePerNight : homestay.pricePerNight;
    homestay.image = image !== undefined ? image : homestay.image;

    await homestay.save();

    res.status(200).json({
      success: true,
      message: 'Homestay updated successfully',
      data: homestay,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid homestay ID format' });
    }
    console.error('[updateHomestay] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update homestay', error: error.message });
  }
};

/**
 * DELETE /api/homestays/:id
 * Owner (own) or Admin — delete a homestay and its reviews.
 */
const deleteHomestay = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.id);

    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Only the owner or admin can delete
    if (homestay.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own homestays' });
    }

    // Delete all reviews for this homestay
    await Review.deleteMany({ homestay: homestay._id });

    await Homestay.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Homestay and its reviews deleted successfully',
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid homestay ID format' });
    }
    console.error('[deleteHomestay] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete homestay', error: error.message });
  }
};

/**
 * POST /api/homestays/:id/chat
 * Public/Protected — Interactive chat session with Gemini AI assistant as a local guide.
 */
const chatWithLocalGuide = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const homestay = await Homestay.findById(req.params.id)
      .populate('owner', 'name');

    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Fetch reviews for context
    const reviews = await Review.find({ homestay: homestay._id })
      .populate('customer', 'name')
      .limit(5);

    const homestayWithReviews = {
      ...homestay.toObject(),
      reviews,
    };

    const reply = await generateTouristChatResponse(homestayWithReviews, history || [], message.trim());

    res.status(200).json({
      success: true,
      response: reply,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid homestay ID format' });
    }
    console.error('[chatWithLocalGuide] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to communicate with AI guide', error: error.message });
  }
};

/**
 * POST /api/homestays/enhance
 * Protected (Owner/Admin) — Enhance homestay description using Gemini AI.
 */
const enhanceHomestayDescription = async (req, res) => {
  try {
    const { name, location, amenities, keywords } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Name and location are required for AI description generation' });
    }

    const description = await generateEnhancedDescription(
      name,
      location,
      amenities || [],
      keywords || ''
    );

    res.status(200).json({
      success: true,
      description,
    });
  } catch (error) {
    console.error('[enhanceHomestayDescription] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to enhance description with AI', error: error.message });
  }
};

/**
 * GET /api/homestays/owner/analytics
 * Protected (Owner/Admin) — Retrieve property, bookings, and review sentiment analytics.
 */
const getHostAnalytics = async (req, res) => {
  try {
    const myHomestays = await Homestay.find({ owner: req.user._id });
    const homestayIds = myHomestays.map((h) => h._id);

    if (homestayIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: 0,
          totalBookings: 0,
          averageRating: 0.0,
          monthlyRevenue: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          aiSummary: 'No homestay listings created yet. Add properties to start seeing analytical insights!',
        },
      });
    }

    // 1. Gather all bookings on these homestays
    const bookings = await Booking.find({ homestay: { $in: homestayIds } });
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;

    // Calculate monthly breakdown
    const monthlyMap = {};
    confirmedBookings.forEach((b) => {
      const date = new Date(b.checkIn);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + b.totalPrice;
    });

    const monthlyRevenue = Object.keys(monthlyMap).map((key) => ({
      month: key,
      revenue: monthlyMap[key],
    }));

    // 2. Gather reviews
    const reviews = await Review.find({ homestay: { $in: homestayIds } });
    
    let avgRating = 0;
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    if (reviews.length > 0) {
      const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = Number((sumRating / reviews.length).toFixed(1));

      reviews.forEach((r) => {
        if (r.rating >= 4) positive++;
        else if (r.rating === 3) neutral++;
        else negative++;
      });
    }

    // Generate AI Summary insights
    const aiSummary = await generateHostInsights(reviews);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        averageRating: avgRating,
        monthlyRevenue,
        sentiment: {
          positive,
          neutral,
          negative,
          total: reviews.length,
        },
        aiSummary,
      },
    });
  } catch (error) {
    console.error('[getHostAnalytics] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve host analytics', error: error.message });
  }
};

/**
 * POST /api/homestays/:id/suggest-price
 * Protected (Owner/Admin) — Suggest dynamic pricing for a homestay based on occupancy and seasonality.
 */
const suggestHomestayPrice = async (req, res) => {
  try {
    const { occupancy, seasonality } = req.body;
    
    if (occupancy === undefined || !seasonality) {
      return res.status(400).json({ success: false, message: 'Occupancy and seasonality are required' });
    }

    const homestay = await Homestay.findById(req.params.id);
    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Only owner or admin can get pricing suggestions
    if (homestay.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this homestay' });
    }

    const result = await generateDynamicPricingRecommendation(homestay, occupancy, seasonality);

    res.status(200).json({
      success: true,
      recommendation: {
        recommendedPrice: result.suggestedPrice,
        justification: result.rationale
      }
    });
  } catch (error) {
    console.error('[suggestHomestayPrice] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to suggest price', error: error.message });
  }
};

module.exports = { 
  getAllHomestays, 
  getMyHomestays, 
  getHomestayById, 
  createHomestay, 
  updateHomestay, 
  deleteHomestay, 
  chatWithLocalGuide,
  enhanceHomestayDescription,
  getHostAnalytics,
  suggestHomestayPrice
};
