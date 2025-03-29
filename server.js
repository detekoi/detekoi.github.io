require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/genai"); // Import the library
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use port from env var or default to 3000

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image data

// --- Gemini API Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash-exp"; // Multimodal model suitable for text + image input

if (!API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
  process.exit(1); // Exit if API key is missing
}

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// --- API Endpoint for Gemini Mascot Generation ---
app.post('/api/gemini-mascot', async (req, res) => {
  const { prompt, base64ImageData, mimeType } = req.body;

  if (!prompt || !base64ImageData || !mimeType) {
    return res.status(400).json({ error: 'Missing required fields: prompt, base64ImageData, mimeType' });
  }

  // Prepare the parts for the generateContent call
  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };
  const textPart = { text: prompt };

  // Define generation config (optional, adjust as needed)
  const generationConfig = {
    temperature: 0.4, // Example: Adjust creativity
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096, // Example: Limit output size
    // responseMimeType: "image/png" // Request image output if model supports it explicitly
  };

  // Define safety settings (optional, adjust as needed)
   const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];


  try {
    console.log(`Sending request to Gemini API via @google/genai library (Model: ${MODEL_NAME})...`);

    // Call the Gemini API using the library
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [textPart, imagePart] }], // Pass both text and image parts
        generationConfig,
        safetySettings
    });

    const response = result.response; // Get the response object from the result

    console.log('Received response from Gemini API.');
    // console.log('Full API Response:', JSON.stringify(response, null, 2)); // Optional: Log full response for debugging

    // --- Extract image data from the library's response structure ---
    let newImageDataUri = null;
    if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      const parts = response.candidates[0].content.parts;
      // Find the first part that contains image data
      const generatedImagePart = parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));

      if (generatedImagePart) {
        newImageDataUri = `data:${generatedImagePart.inlineData.mimeType};base64,${generatedImagePart.inlineData.data}`;
        console.log('Extracted image data from response.');
      } else {
        // Log if no image part found, maybe return text part?
        const textPart = parts.find(part => part.text);
        console.warn("Gemini API did not return an image part. Text response:", textPart?.text);
        // Optionally, you could send the text response back to the client if helpful
        // res.json({ textResponse: textPart?.text }); return;
      }
    } else {
      console.error('Unexpected Gemini API response structure or no candidates found:', response);
      // Log safety feedback if available
       if (response && response.promptFeedback) {
           console.error('Prompt Feedback:', response.promptFeedback);
       }
       if (response && response.candidates && response.candidates[0] && response.candidates[0].finishReason) {
           console.error('Finish Reason:', response.candidates[0].finishReason);
           if (response.candidates[0].safetyRatings) {
               console.error('Safety Ratings:', response.candidates[0].safetyRatings);
           }
       }
    }
    // --- End of response parsing ---

    // Send the data URI (or null if no image found) back to the client
    res.json({ newImageDataUri: newImageDataUri });

  } catch (error) {
    console.error('Error calling Gemini API via @google/genai library:', error);
    // Send an appropriate error response to the client
    res.status(500).json({
       error: 'Failed to process request with Gemini API',
       details: error.message // Provide the error message from the library
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
