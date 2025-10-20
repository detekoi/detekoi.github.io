/**
 * Test script for Gemini image generation API
 * 
 * This is a standalone script to test the Gemini API for image generation.
 * Run with: node scripts/test-image-generation.js
 */

require('dotenv').config();
const fs = require('fs');
const { GoogleGenAI } = require("@google/genai");

// Set up the API key (from .env file)
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY environment variable not set!");
  process.exit(1);
}

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generateImage() {
  // Read the original bear image from file system
  const imagePath = 'assets/images/PolarBearTransparent4K.png';
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  
  // Set up the prompt
  const prompt = "Zoom out full body head-to-toe to reveal that the bear is wearing fashion garments and accessories, make it a cohesive theme. Also, change his blue neckerchief into any vibrant color.";

  console.log("Sending image editing request to Gemini API...");
  console.log(`Prompt: ${prompt}`);

  try {
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        responseModalities: ['Text', 'Image']
      },
    });

    console.log("Response received from Gemini API.");
    
    // Check for candidates in the response
    if (!response.candidates || !response.candidates.length) {
      console.error("No candidates in response:", JSON.stringify(response, null, 2));
      return;
    }

    // Process the response parts
    const parts = response.candidates[0].content.parts;
    console.log(`Found ${parts.length} parts in the response.`);

    for (const part of parts) {
      if (part.text) {
        console.log("Text response:", part.text);
      } else if (part.inlineData) {
        console.log(`Image data found (MIME type: ${part.inlineData.mimeType})`);
        // Save the image to a file
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        const outputPath = 'gemini-test-image.png';
        
        fs.writeFileSync(outputPath, buffer);
        console.log(`Image saved to ${outputPath}`);
      } else {
        console.log("Unknown part type:", Object.keys(part));
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error.response) {
      console.error("API Error Response:", error.response);
    }
  }
}

// Run the image generation function
generateImage().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
