/**
 * AI Controller
 * Handles AI-powered features like Trip Planning using Gemini API.
 */

const { generateTripItinerary, generateGeneralChatResponse } = require('../config/gemini');

/**
 * POST /api/ai/trip-planner
 * Protected — Generate a personalized travel itinerary for a homestay location.
 */
const planTrip = async (req, res) => {
  try {
    const { location, days, budget, interests, travelStyle } = req.body;

    // Validate required fields
    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }
    if (!days || days < 1 || days > 14) {
      return res.status(400).json({ success: false, message: 'Days must be between 1 and 14' });
    }
    if (!budget || budget < 1) {
      return res.status(400).json({ success: false, message: 'Budget must be a positive number' });
    }
    if (!travelStyle || !['Budget', 'Standard', 'Luxury'].includes(travelStyle)) {
      return res.status(400).json({ success: false, message: 'Travel style must be Budget, Standard, or Luxury' });
    }

    const itinerary = await generateTripItinerary({
      location: location.trim(),
      days,
      budget,
      interests: interests || [],
      travelStyle,
    });

    res.status(200).json({
      success: true,
      itinerary,
    });
  } catch (error) {
    console.error('[planTrip] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate trip itinerary. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/chat
 * Protected — Chat with the global AI concierge bot.
 */
const chatGeneral = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const responseText = await generateGeneralChatResponse(history || [], message.trim());
    res.status(200).json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    console.error('[chatGeneral] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate response. Please try again later.',
      error: error.message,
    });
  }
};

module.exports = { planTrip, chatGeneral };
