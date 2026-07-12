/**
 * Gemini AI Service Config
 * Handles integration with Google's Gemini API for generating review suggestions.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

// Initialize genAI client if API key exists
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI service initialized');
} else {
  console.log('⚠️ Gemini AI service not configured: GEMINI_API_KEY missing in .env');
}

/**
 * Generate a reply suggestion for a guest review.
 *
 * @param {string} homestayName - Name of the property
 * @param {string} guestName - Name of the guest who reviewed
 * @param {number} rating - Rating score (1-5)
 * @param {string} reviewText - Content of the review
 * @returns {Promise<string>} Generated response text
 */
const generateReviewReply = async (homestayName, guestName, rating, reviewText) => {
  if (!genAI) {
    return 'Gemini AI key is not configured. Please add GEMINI_API_KEY to your backend .env file.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a helpful AI assistant for StayWise, an AI-powered homestay management assistant.
Generate a professional, warm, and appropriate response suggestion to a guest review.

Homestay Property: ${homestayName}
Guest Name: ${guestName}
Rating: ${rating} / 5 stars
Review Content: "${reviewText}"

Strict guidelines:
1. Keep it concise (2-4 sentences max).
2. If the review is positive (4 or 5 stars), thank the guest warmly and express excitement to host them again.
3. If the review is critical (1, 2, or 3 stars), apologize sincerely for any inconvenience, address their specific concern with empathy, and state that the host is taking steps to correct it.
4. Do NOT include any placeholder text like "[Your Name]", "[Host]", or "[Homestay Name]".
5. Sign off simply as "The Host Team".
6. Respond with ONLY the reply text, no introductory or concluding chat remarks.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini AI] Generation failed:', error.message);
    return 'Could not generate AI reply suggestion at this time.';
  }
};

module.exports = { generateReviewReply };
