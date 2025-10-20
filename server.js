require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const fs = require('fs'); // Add fs module for reading image files
// Import the necessary class from the library
const { GoogleGenAI } = require("@google/genai");
const path = require('path');

const app = express();
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
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image data

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
// Serve files from the root directory where index.html is located
app.use(express.static(path.join(__dirname, '.')));

// Serve index.html for the root path specifically
// This ensures that navigating to '/' serves the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API Endpoint for Image Generation ---
app.post('/api/generate-image', async (req, res) => {
  // Read the original bear image from file system
  try {
    const imagePath = 'assets/images/PolarBearTransparent4K.png';
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    
    // Get prompt from the request, or use default
    const prompt = req.body.prompt || "Zoom out full body head-to-toe to reveal that the subject has been styled by a professional stylist, make it a cohesive theme.";
    
    console.log(`Using prompt: ${prompt.substring(0, 50)}...`);
    console.log('Using SDK with gemini-2.5-flash-image model');

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

    // Call the Gemini image generation model
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        responseModalities: ['Text', 'Image']
      },
    });
    
    // Extract response data
    let imageDataUri = null;
    let textResponse = null;
    
    if (response && response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.text) {
          console.log('Text response received');
          textResponse = part.text;
        } else if (part.inlineData) {
          console.log(`Image generated (MIME type: ${part.inlineData.mimeType})`);
          imageDataUri = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
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
