require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs'); // Add fs module for reading image files
// Import the necessary classes from the library
const { GoogleGenAI, Modality } = require("@google/genai");
const path = require('path');

const app = express();
// Cloud Run sits behind one proxy hop; trust it so rate limits see the visitor's IP
app.set('trust proxy', 1);
const port = process.env.PORT || 3000; // Use port from env var or default to 3000

// Ensure CORS is allowed if your frontend will be hosted separately
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://detekoi.github.io');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware to parse JSON bodies
app.use(express.json({ limit: '16kb' })); // Requests only carry a text prompt

// --- Gemini API Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
  process.exit(1); // Exit if API key is missing
}

// Add a check to ensure API_KEY is valid before initializing
if (typeof API_KEY !== 'string' || API_KEY.trim() === '') {
    console.error("FATAL ERROR: GEMINI_API_KEY is not a valid string.");
    process.exit(1);
}

// Initialize the GoogleGenAI client
const genAI = new GoogleGenAI({ apiKey: API_KEY });
// Note: With GoogleGenAI we access models directly through genAI.models

// --- Serve Static Files (HTML, CSS, JS, Images) ---
// Serve files from the parent directory where index.html is located
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html for the root path specifically
// This ensures that navigating to '/' serves the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// --- Debug endpoint to list available models ---
app.get('/api/list-models', async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`REST API Error: ${response.status} - ${errorData}`);
    }
    
    const modelsData = await response.json();
    console.log('Available models:', modelsData);
    res.json(modelsData);
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({
      error: 'Failed to list models',
      details: error.message
    });
  }
});

// --- Image generation settings ---
// Nano Banana 2. Output is sized for the ~420px mascot frame: the 512 tier
// (424x632 at 2:3) costs fewer output tokens than the 1K default and keeps
// each image small enough that the page can store several in localStorage.
const IMAGE_MODEL = 'gemini-3.1-flash-image';
const IMAGE_CONFIG = { aspectRatio: '2:3', imageSize: '512' };
const MAX_PROMPT_LENGTH = 4000;

/**
 * Generate an outfit image with Nano Banana 2.
 * @param {Array} contents - Prompt and reference image parts
 * @param {Array} responseModalities - Requested output modalities
 * @returns {Promise<{imageDataUri: ?string, textResponse: ?string}>}
 */
async function generateOutfitImage(contents, responseModalities) {
  const response = await genAI.models.generateContent({
    model: IMAGE_MODEL,
    contents,
    config: {
      responseModalities,
      imageConfig: IMAGE_CONFIG
      // thinkingLevel defaults to minimal, the lowest-latency, lowest-cost option
    }
  });

  let imageDataUri = null;
  let textResponse = null;
  const parts = response?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    // Gemini 3 image models may return interim "thought" parts; skip them
    if (part.thought) {
      continue;
    }
    if (part.text) {
      textResponse = part.text;
    } else if (part.inlineData) {
      console.log(`Image generated (MIME type: ${part.inlineData.mimeType})`);
      imageDataUri = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  return { imageDataUri, textResponse };
}

// --- Rate limiting ---
// Counters live in memory, so the Cloud Run service runs a single instance
// (see --max-instances in .github/workflows/deploy.yml).
const PER_IP_LIMIT = Number(process.env.RATE_LIMIT_PER_IP) || 5;
const PER_IP_WINDOW_MINUTES = Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15;
const DAILY_LIMIT = Number(process.env.DAILY_GENERATION_LIMIT) || 100;

/**
 * Build a JSON 429 handler with a friendly retry hint.
 * @param {string} message - Short message shown to the visitor
 * @returns {Function} express-rate-limit handler
 */
const rateLimitHandler = (message) => (req, res) => {
  const resetTime = req.rateLimit?.resetTime;
  const minutes = resetTime ? Math.max(1, Math.ceil((resetTime - Date.now()) / 60000)) : null;
  let details = 'Try again later.';
  if (minutes && minutes > 90) {
    const hours = Math.round(minutes / 60);
    details = `Try again in about ${hours} hour${hours === 1 ? '' : 's'}.`;
  } else if (minutes) {
    details = `Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }
  res.status(429).json({ error: message, details });
};

const perIpLimiter = rateLimit({
  windowMs: PER_IP_WINDOW_MINUTES * 60 * 1000,
  limit: PER_IP_LIMIT,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler('The polar bear needs a breather')
});

const dailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: DAILY_LIMIT,
  keyGenerator: () => 'all-visitors',
  standardHeaders: false,
  legacyHeaders: false,
  handler: rateLimitHandler("The polar bear's wardrobe is closed for today")
});

// --- API Endpoint for Image Generation ---
app.post('/api/generate-image', perIpLimiter, dailyLimiter, async (req, res) => {
  // Read the original bear image from file system
  try {
    const imagePath = path.join(__dirname, '..', 'assets/images/PolarBearTransparent4K.png');
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    
    // Get prompt from the request, or use default
    const prompt = req.body.prompt || "Zoom out full body head-to-toe to reveal that the subject has been styled by a professional stylist, make it a cohesive theme.";
    
    if (typeof prompt !== 'string' || prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    console.log(`Using prompt: ${prompt.substring(0, 50)}...`);
    // Prepare the content parts for the API call
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image
        }
      }
    ];

    const { imageDataUri, textResponse } = await generateOutfitImage(contents, [Modality.TEXT, Modality.IMAGE]);

    res.json({
      imageDataUri,
      textResponse
    });
    
  } catch (error) {
    console.error('Error generating/editing image with Gemini API:', error);
    res.status(500).json({
      error: 'Failed to generate/edit image',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log("Ensure the GEMINI_API_KEY environment variable is set (e.g., via a .env file).");
});
