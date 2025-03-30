# Personal Portfolio Website

This repository contains the code for my personal portfolio website.

## Features

- Responsive design
- Project showcase
- AI-powered mascot customization using Google's Gemini API
- Dynamic UI elements

## Running Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the server:
   ```
   node server.js
   ```
5. Open http://localhost:3000 in your browser

## Testing the Mascot Image Generation

You can test the mascot image generation/editing functionality using the test script:

```
node scripts/test-image-generation.js
```

This will read the polar bear image, send it to the Gemini API for editing, and save the result as `gemini-test-image.png` in the root directory.

## Using the Website

- Click on the Style Inspiration button a fashionable Polar Bear
- Browse projects in the project grid
- Click on screenshots to view them in a lightbox

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- APIs: Google Gemini API for AI-powered image generation
