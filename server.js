require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const axios = require('axios'); // Using axios for HTTP requests
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use port from env var or default to 3000

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image data

// --- Gemini API Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;
// Using gemini-1.5-flash as requested initially, ensure this model supports image input/output as needed.
// Vision models like gemini-pro-vision are typically for analysis. Image generation models might be different.
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'; // Adjusted model

if (!API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
  process.exit(1); // Exit if API key is missing
}

// --- API Endpoint for Gemini Mascot Generation ---
app.post('/api/gemini-mascot', async (req, res) => {
  const { prompt, base64ImageData, mimeType } = req.body;

  if (!prompt || !base64ImageData || !mimeType) {
    return res.status(400).json({ error: 'Missing required fields: prompt, base64ImageData, mimeType' });
  }

  // Construct the request body for the Gemini API
  // Ensure the model you use (gemini-1.5-flash-latest) accepts this format.
  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: mimeType,
            data: base64ImageData
          }
        }
      ]
    }],
    // Add generationConfig if needed (e.g., for image generation models)
    // generationConfig: {
    //   "response_mime_type": "image/png", // Example: Request PNG output if supported
    // }
  };

  try {
    console.log(`Forwarding request to Gemini API (${API_URL})...`);
    const geminiResponse = await axios.post(`${API_URL}?key=${API_KEY}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Ensure axios handles large responses if needed, though base64 shouldn't exceed defaults usually
    });

    console.log('Received response from Gemini API.');

    // --- IMPORTANT: Adapt this based on ACTUAL Gemini response structure ---
    // This part extracts the *first* image found in the response.
    // The structure might differ significantly based on the model (flash vs pro-vision)
    // and whether it's generating, editing, or describing an image.
    let newImageDataUri = null;
    if (geminiResponse.data.candidates && geminiResponse.data.candidates[0].content && geminiResponse.data.candidates[0].content.parts) {
       // Look for an image part in the response
       const imagePart = geminiResponse.data.candidates[0].content.parts.find(part => part.inline_data && part.inline_data.mime_type.startsWith('image/'));
       if (imagePart) {
          newImageDataUri = `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`;
          console.log('Extracted image data from response.');
       } else {
          // Log if no image part found, maybe return text part?
          const textPart = geminiResponse.data.candidates[0].content.parts.find(part => part.text);
          console.warn("Gemini API did not return an image part. Text response:", textPart?.text);
          // Decide how to handle non-image responses (e.g., return the text)
       }
    } else {
       console.error('Unexpected Gemini API response structure:', geminiResponse.data);
       // It's possible the response is valid but doesn't contain an image candidate as expected.
    }
    // --- End of response parsing ---

    // Send the data URI (or null if no image found) back to the client
    res.json({ newImageDataUri: newImageDataUri });

  } catch (error) {
    // Log detailed error information
    console.error('Error calling Gemini API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }
    console.error('Config:', error.config);

    // Send an appropriate error response to the client
    res.status(error.response?.status || 500).json({
       error: 'Failed to call Gemini API',
       details: error.response?.data?.error?.message || error.message
    });
  }
});

// --- Serve Static Files (HTML, CSS, JS, Images) ---
// Serve files from the root directory where index.html is located
app.use(express.static(path.join(__dirname, '.')));

// Serve index.html for the root path specifically
// This ensures that navigating to '/' serves the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Start the server ---
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log("Ensure the GEMINI_API_KEY environment variable is set (e.g., via a .env file).");
});
