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

/**
 * Generate a chat response for the local tourist guide assistant.
 *
 * @param {Object} homestay - Homestay details from DB
 * @param {Array} chatHistory - Array of past messages: [{ role: 'user'|'model', text: string }]
 * @param {string} userMessage - Latest message from the user
 * @returns {Promise<string>} Response text from Gemini
 */
const generateTouristChatResponse = async (homestay, chatHistory, userMessage) => {
  if (!genAI) {
    return 'Gemini AI key is not configured. Please add GEMINI_API_KEY to your backend .env file.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format reviews context
    const reviewsText = homestay.reviews && homestay.reviews.length > 0
      ? homestay.reviews.slice(0, 5).map((r) => `- Guest: "${r.text}" (Rating: ${r.rating}/5)`).join('\n')
      : 'No reviews submitted yet.';

    const systemInstruction = `You are "StayWise AI Assistant", a friendly, warm, and highly knowledgeable local concierge for the homestay "${homestay.name}" located in "${homestay.location}".
Your goal is to answer questions for potential guests browsing this property.

Property Details:
- Name: ${homestay.name}
- Location: ${homestay.location}
- Price per Night: ₹${homestay.pricePerNight}
- Description: ${homestay.description || 'A lovely local homestay.'}
- Amenities: ${(homestay.amenities || []).join(', ') || 'Standard amenities.'}
- Host Name: ${homestay.owner?.name || 'The Host'}
- Rating: ${homestay.rating} / 5 stars (${homestay.totalReviews} reviews)

Guest Reviews context:
${reviewsText}

Strict guidelines:
1. Provide accurate answers based on the property details provided. If the information isn't mentioned, give a helpful, polite estimate or suggest asking host ${homestay.owner?.name || 'the host'} directly, but prioritize using available details.
2. Provide exceptional local recommendations for the area (${homestay.location}). Suggest cafes, trekking spots, local sights, transit, or weather tips with enthusiasm.
3. Keep answers concise, helpful, and under 4-5 sentences.
4. Maintain a warm, inviting, and professional hospitality tone.
5. Answer questions in the same language they are asked (default to English).
6. Do NOT include any meta-talk or introductory greetings unless the guest is saying hello.`;

    // Format history for Gemini API
    const formattedHistory = (chatHistory || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: systemInstruction,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini AI] Chat generation failed:', error.message);
    return 'Sorry, I am having trouble connecting to my local guide services right now.';
  }
};

module.exports = { generateReviewReply, generateTouristChatResponse };
