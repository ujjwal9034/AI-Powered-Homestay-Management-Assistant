/**
 * Gemini AI Service Config
 * Handles integration with Google's Gemini API for generating review suggestions.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
const MODEL_NAME = 'gemini-flash-latest';
const FALLBACK_MODEL = 'gemini-2.0-flash';

// Initialize genAI client if API key exists
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI service initialized (model:', MODEL_NAME, ')');
} else {
  console.log('⚠️ Gemini AI service not configured: GEMINI_API_KEY missing in .env');
}

/**
 * Retry a Gemini API call with fast failure on quota errors.
 * Only retries on 503 (server overload). 429 (quota) errors fail fast.
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts (default: 1)
 * @returns {Promise<any>} Result of fn()
 */
const withRetry = async (fn, maxRetries = 1) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const is503 = error.message && error.message.includes('503');
      const is429 = error.message && error.message.includes('429');
      // Only retry on 503 (transient server error), not on 429 (quota — pointless to retry quickly)
      if (is503 && attempt < maxRetries) {
        const delayMs = (attempt + 1) * 1000; // 1s, 2s
        console.log(`[Gemini AI] Server overload (503), retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else if (is429) {
        // Fail fast on quota errors — retrying won't help within seconds
        throw error;
      } else {
        throw error;
      }
    }
  }
};

/**
 * Try generating content with the primary model, fall back to secondary on 429.
 * @param {string} prompt - The prompt text
 * @param {Object} opts - Optional: { systemInstruction }
 * @returns {Promise<string>} Generated text
 */
const generateWithFallback = async (prompt, opts = {}) => {
  const models = [MODEL_NAME, FALLBACK_MODEL];
  for (const modelName of models) {
    try {
      const modelOpts = { model: modelName };
      if (opts.systemInstruction) modelOpts.systemInstruction = opts.systemInstruction;
      const model = genAI.getGenerativeModel(modelOpts);
      const result = await withRetry(() => model.generateContent(prompt));
      return result.response.text().trim();
    } catch (error) {
      const is429 = error.message && error.message.includes('429');
      if (is429 && modelName !== FALLBACK_MODEL) {
        console.log(`[Gemini AI] Primary model (${modelName}) rate-limited, trying fallback (${FALLBACK_MODEL})...`);
        continue;
      }
      throw error;
    }
  }
};


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

    return await generateWithFallback(prompt);
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

  const models = [MODEL_NAME, FALLBACK_MODEL];
  let lastError = null;

  for (const modelName of models) {
    try {
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

      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction,
      });

      const formattedHistory = (chatHistory || []).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await withRetry(() => chat.sendMessage(userMessage));
      return result.response.text().trim();
    } catch (error) {
      lastError = error;
      const is429 = error.message && error.message.includes('429');
      if (is429 && modelName !== FALLBACK_MODEL) {
        console.log(`[Gemini AI] Primary model (${modelName}) rate-limited for chat, trying fallback (${FALLBACK_MODEL})...`);
        continue;
      }
      break;
    }
  }

  console.error('[Gemini AI] Chat generation failed:', lastError.message);
  return 'Sorry, I am having trouble connecting to my local guide services right now.';
};

/**
 * Generate a professional, highly attractive property description for a homestay listing.
 *
 * @param {string} name - Homestay name
 * @param {string} location - Homestay location
 * @param {Array} amenities - Array of amenities
 * @param {string} keywords - Key terms / vibes (e.g. cozy, rustic, fireplace)
 * @returns {Promise<string>} Generated description paragraph
 */
const generateEnhancedDescription = async (name, location, amenities, keywords) => {
  if (!genAI) {
    return 'Gemini AI key is not configured. Please add GEMINI_API_KEY to your backend .env file.';
  }

  try {
    const prompt = `You are a professional copywriting assistant for StayWise, a premium homestay management assistant.
Generate an engaging, warm, and highly appealing property description paragraph for a homestay listing.

Property Details:
- Name: ${name}
- Location: ${location}
- Amenities: ${(amenities || []).join(', ') || 'Standard local amenities'}
- Additional Vibe / Key Words: ${keywords || 'none specified'}

Strict guidelines:
1. Write a compelling description paragraph (around 4-5 sentences, max 100-120 words).
2. Highlight the location, guest comfort, unique highlights (like views or specific amenities), and host warmth.
3. Make it sound premium, inviting, and professional.
4. Do NOT include any placeholder text (e.g., "[Host Name]", "[Your Name]").
5. Return ONLY the description paragraph. No introductory or closing remarks, no markdown headings, no lists.`;

    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('[Gemini AI] Description enhancement failed:', error.message);
    return 'Could not generate AI description at this time.';
  }
};

/**
 * Generate a qualitative summary of guest reviews for a property owner.
 *
 * @param {Array} reviews - Array of review objects containing { text, rating }
 * @returns {Promise<string>} Summary of positive highlights and areas of improvement
 */
const generateHostInsights = async (reviews) => {
  if (!genAI) {
    return 'Gemini AI key is not configured. Please add GEMINI_API_KEY to your .env file.';
  }

  if (!reviews || reviews.length === 0) {
    return 'No guest reviews received yet. Host guest stays and collect reviews to display AI insights!';
  }

  try {
    const reviewSnippets = reviews.map((r) => `- [${r.rating}/5 stars] "${r.text}"`).join('\n');

    const prompt = `You are a professional business consultant for StayWise, a homestay property management platform.
Analyze the following list of reviews submitted by guests for a host's properties.
Generate a concise, insightful review summary (3-4 sentences, max 80 words) addressed to the host.

Guest reviews:
${reviewSnippets}

Strict guidelines:
1. Summarize the major strengths guests loved (e.g. hospitality, location, cleanliness).
2. Constructively point out any suggestions or areas for improvement highlighted by critical feedback.
3. Keep it warm, professional, encouraging, and highly concise.
4. Answer with ONLY the summary paragraph. No greetings, introductions, or placeholder formatting.`;

    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('[Gemini AI] Review analysis failed:', error.message);
    return 'Could not generate AI review summary at this time.';
  }
};

/**
 * Generate a dynamic pricing suggestion based on occupancy and seasonality keywords.
 * Returns { suggestedPrice: Number, rationale: String }
 */
const generateDynamicPricingRecommendation = async (homestay, occupancy, seasonality) => {
  if (!genAI) {
    throw new Error('Gemini AI key is not configured.');
  }

  try {
    const prompt = `You are a pricing analyst for StayWise, a premium homestay management assistant.
Recommend an optimized room rate per night based on the homestay details and owner inputs.

Homestay Details:
- Name: ${homestay.name}
- Location: ${homestay.location}
- Current Base Price: ₹${homestay.pricePerNight}
- Average Rating: ${homestay.rating}/5
- Total Reviews: ${homestay.totalReviews}

Current Owner Inputs:
- Expected Occupancy: ${occupancy}%
- Seasonality / Special Events: ${seasonality}

Strict output format:
SUGGESTED_PRICE: <only a single number representing recommended price in INR, e.g. 2700>
RATIONALE: <2-3 sentences explaining why this price is recommended based on occupancy level and seasonality factors, no placeholders>`;

    const text = await generateWithFallback(prompt);

    // Parse the output
    const priceMatch = text.match(/SUGGESTED_PRICE:\s*(\d+)/i);
    const rationaleMatch = text.match(/RATIONALE:\s*([\s\S]+)/i);

    const suggestedPrice = priceMatch ? Number(priceMatch[1]) : Math.round(homestay.pricePerNight);
    const rationale = rationaleMatch ? rationaleMatch[1].trim() : 'Based on current seasonality demand and occupancy.';

    return { suggestedPrice, rationale };
  } catch (error) {
    console.error('[Gemini AI] Pricing recommendation failed:', error.message);
    throw error;
  }
};

/**
 * Generate a personalized check-in/out message draft for a booking.
 */
const generateHostBookingMessage = async (booking, messageType) => {
  if (!genAI) {
    throw new Error('Gemini AI key is not configured.');
  }

  try {
    const checkInStr = new Date(booking.checkIn).toLocaleDateString('en-IN', { dateStyle: 'medium' });
    const checkOutStr = new Date(booking.checkOut).toLocaleDateString('en-IN', { dateStyle: 'medium' });

    const prompt = `You are a warm, hospitable homestay owner. Draft a highly personalized and friendly ${messageType} message for your guest.

Booking Details:
- Guest Name: ${booking.customer?.name || 'Guest'}
- Check-in Date: ${checkInStr}
- Check-out Date: ${checkOutStr}
- Number of Nights: ${booking.nights}
- Property: ${booking.homestay?.name || 'our property'} in ${booking.homestay?.location || 'our location'}

Guidelines:
1. If this is a 'checkin' message: Welcome them warmly, mention their check-in date of ${checkInStr}, express excitement for their arrival, offer help with directions or check-in instructions, and sign off warmly as their host.
2. If this is a 'checkout' message: Thank them for staying with us, hope they had a pleasant journey home, ask them to kindly write a review on StayWise if they enjoyed their stay, and sign off warmly as their host.
3. Keep the message friendly, professional, and under 4-5 sentences. Do NOT include any bracketed placeholder text (like [Host Name], [Your Name], [Link]). Use actual details or sign off simply as "Your Host Team".`;

    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('[Gemini AI] Message generation failed:', error.message);
    throw error;
  }
};

/**
 * Generate a personalized travel itinerary for a homestay location using Gemini AI.
 *
 * @param {Object} params - Trip planning parameters
 * @param {string} params.location - Destination location
 * @param {number} params.days - Number of days for the trip
 * @param {number} params.budget - Total budget in INR
 * @param {Array<string>} params.interests - Array of interest categories
 * @param {string} params.travelStyle - Budget, Standard, or Luxury
 * @returns {Promise<string>} Generated itinerary text
 */
const generateTripItinerary = async ({ location, days, budget, interests, travelStyle }) => {
  if (!genAI) {
    throw new Error('Gemini AI key is not configured. Please add GEMINI_API_KEY to your backend .env file.');
  }

  try {
    const prompt = `You are a professional travel planner and local expert for StayWise, an AI-powered homestay management platform.
Create a detailed, personalized travel itinerary for a guest visiting ${location}.

Trip Details:
- Destination: ${location}
- Duration: ${days} day(s)
- Total Budget: ₹${budget?.toLocaleString() || budget}
- Interests: ${(interests || []).join(', ') || 'General sightseeing'}
- Travel Style: ${travelStyle || 'Standard'}

Generate the itinerary in this EXACT format (use plain text, NO markdown, NO asterisks, NO bold/italic formatting):

===== DAY-WISE ITINERARY =====

For each day from Day 1 to Day ${days}:
Day X: [Theme for the day]
Morning:
[Activity description with specific place names, timings, and brief details]
Afternoon:
[Activity description with specific place names, timings, and brief details]
Evening:
[Activity description with specific place names, timings, and brief details]

===== PLACES TO VISIT =====
[List the top must-visit places in ${location} with one-line descriptions]

===== FOOD RECOMMENDATIONS =====
[List 4-6 local food items and restaurants/eateries to try, suitable for ${travelStyle} style]

===== ESTIMATED DAILY BUDGET =====
[Break down ₹${budget?.toLocaleString() || budget} across ${days} days]
Accommodation: ₹___/day
Food: ₹___/day
Transport: ₹___/day
Activities: ₹___/day
Miscellaneous: ₹___/day
Total per day: ₹___

===== TRAVEL TIPS =====
[5-6 practical travel tips specific to ${location}]

===== BEST TIME TO VISIT =====
[Best months/seasons to visit ${location} and why]

===== PACKING SUGGESTIONS =====
[6-8 essential items to pack based on ${location} weather and planned activities]

Strict guidelines:
1. Be specific with real place names, timings, and local details for ${location}.
2. Keep budget estimates realistic for ${travelStyle} travel style in India.
3. Tailor activities to the guest's interests: ${(interests || []).join(', ')}.
4. Do NOT use any markdown formatting (no *, **, #, ##, -, etc). Use plain text only.
5. Do NOT include any introductory remarks or closing notes. Start directly with the itinerary.
6. Make the plan feel exciting, actionable, and locally authentic.`;

    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('[Gemini AI] Trip itinerary generation failed:', error.message);
    throw error;
  }
};

module.exports = {
  generateReviewReply,
  generateTouristChatResponse,
  generateEnhancedDescription,
  generateHostInsights,
  generateDynamicPricingRecommendation,
  generateHostBookingMessage,
  generateTripItinerary
};
