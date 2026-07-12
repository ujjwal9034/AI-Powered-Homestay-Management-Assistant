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
const { generateTouristChatResponse } = require('../config/gemini');

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

module.exports = { 
  getAllHomestays, 
  getMyHomestays, 
  getHomestayById, 
  createHomestay, 
  updateHomestay, 
  deleteHomestay, 
  chatWithLocalGuide 
};
