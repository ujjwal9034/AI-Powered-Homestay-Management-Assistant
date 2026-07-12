require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is missing in backend/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const candidateModels = [
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-1.5-pro',
  'gemini-2.5-pro',
  'gemini-2.0-flash'
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const res = await model.generateContent('Say hello in one word.');
    console.log(`✅ Success for ${modelName}! Response:`, res.response.text().trim());
    return true;
  } catch (err) {
    console.log(`❌ Failed for ${modelName}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('Testing all candidates to see all working models...');
  for (const model of candidateModels) {
    await testModel(model);
  }
}

run();
