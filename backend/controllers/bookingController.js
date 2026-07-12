/**
 * Booking Controller
 * Manages reservations, calculations, and role-based booking views.
 */

const Booking = require('../models/Booking');
const Homestay = require('../models/Homestay');
const { generateHostBookingMessage } = require('../config/gemini');

/**
 * POST /api/bookings
 * Guest only — Create a new homestay booking reservation.
 */
const createBooking = async (req, res) => {
  try {
    const { homestayId, checkIn, checkOut, guestsCount } = req.body;

    if (!homestayId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'homestayId, checkIn, and checkOut are required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date format' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    // Verify homestay exists
    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Prevent owners from booking their own property
    if (homestay.owner.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot book your own homestay' });
    }

    // Calculate duration
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return res.status(400).json({ success: false, message: 'Minimum booking duration is 1 night' });
    }

    // Price breakdowns
    const basePrice = diffDays * homestay.pricePerNight;
    const serviceFee = Math.round(basePrice * 0.05); // 5% service charge
    const tax = Math.round(basePrice * 0.12); // 12% GST/Tax
    const totalPrice = basePrice + serviceFee + tax;

    const booking = await Booking.create({
      customer: req.user._id,
      homestay: homestayId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestsCount: guestsCount || 1,
      nights: diffDays,
      basePrice,
      serviceFee,
      tax,
      totalPrice,
      status: 'confirmed', // Instant confirmation simulator
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('homestay', 'name location image');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('[createBooking] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

/**
 * GET /api/bookings/mine
 * Guest only — View all bookings made by the current customer.
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('homestay', 'name location image pricePerNight')
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('[getMyBookings] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings', error: error.message });
  }
};

/**
 * GET /api/bookings/owner
 * Owner only — View bookings made on the owner's properties.
 */
const getOwnerBookings = async (req, res) => {
  try {
    // Get all homestay IDs owned by the current owner
    const myHomestays = await Homestay.find({ owner: req.user._id });
    const homestayIds = myHomestays.map((h) => h._id);

    const bookings = await Booking.find({ homestay: { $in: homestayIds } })
      .populate('customer', 'name email')
      .populate('homestay', 'name location')
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('[getOwnerBookings] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve owner bookings', error: error.message });
  }
};

/**
 * PATCH /api/bookings/:id/status
 * Owner/Admin only — Cancel or update reservation status.
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('homestay', 'owner');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only owner of the homestay or admin can change status
    if (booking.homestay.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking,
    });
  } catch (error) {
    console.error('[updateBookingStatus] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update booking status', error: error.message });
  }
};

/**
 * POST /api/bookings/:id/draft-message
 * Owner/Admin only — Draft a personalized check-in or check-out message for a booking.
 */
const draftBookingMessage = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type || !['checkin', 'checkout'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be "checkin" or "checkout"' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('homestay', 'name location owner');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only owner of the homestay or admin can draft messages
    if (booking.homestay.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    const messageText = await generateHostBookingMessage(booking, type);

    res.status(200).json({
      success: true,
      messageText,
    });
  } catch (error) {
    console.error('[draftBookingMessage] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to draft message', error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  draftBookingMessage,
};
