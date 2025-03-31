# Henry's Portfolio Website

This repository contains the code for my personal portfolio website.

## Table of Contents
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [Customization](#customization)
  - [Mascot](#customizing-the-mascot)
  - [Static Background](#static-background-customization)

## Features

- Responsive design
- Project showcase
- AI-powered mascot customization using Google's Gemini API
- Dynamic UI elements

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the server:
   ```bash
   node server.js
   ```
5. Open http://localhost:3000 in your browser

### Testing
To test the mascot image generation functionality:
```bash
node scripts/test-image-generation.js
```

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **AI Integration**: Google Gemini API
- **Deployment**: GitHub Actions, Google Cloud Run, GitHub Pages

## Deployment

This website uses a modern deployment setup leveraging GitHub Actions and Google Cloud Run for automated deployment and scalable hosting.

### Architecture Overview

- Static frontend files are deployed to GitHub Pages
- The Gemini API server runs on Google Cloud Run
- GitHub Actions automates both deployment processes

### GitHub Actions Workflow

The repository includes two GitHub Actions workflows:

1. Frontend Deployment (`frontend-deploy.yml`):
   ```yaml
   name: Deploy Frontend
   on:
     push:
       branches: [main]
       paths:
         - 'public/**'
         - 'index.html'
         - 'styles/**'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./
   ```

2. Backend Deployment (`backend-deploy.yml`):
   ```yaml
   name: Deploy Backend
   on:
     push:
       branches: [main]
       paths:
         - 'server/**'
         - 'package.json'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Set up Cloud SDK
           uses: google-github-actions/setup-gcloud@v0
           with:
             project_id: ${{ secrets.GCP_PROJECT_ID }}
             service_account_key: ${{ secrets.GCP_SA_KEY }}
             
         - name: Build and Deploy to Cloud Run
           run: |
             gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/gemini-server
             gcloud run deploy gemini-server \
               --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/gemini-server \
               --platform managed \
               --region us-central1 \
               --allow-unauthenticated
   ```

### Setup Requirements

1. GitHub Repository Settings:
   - Enable GitHub Pages in repository settings
   - Add required secrets:
     - `GCP_PROJECT_ID`: Your Google Cloud project ID
     - `GCP_SA_KEY`: Service account key JSON for Google Cloud authentication

2. Google Cloud Setup:
   - Create a new project
   - Enable Cloud Run and Container Registry APIs
   - Create a service account with required permissions:
     - Cloud Run Admin
     - Artifact Registry Admin
     - Storage Admin
     - Service Account User
     - Service Usage Consumer
   - Download service account key JSON

3. Environment Configuration:
   - Add `GEMINI_API_KEY` to Cloud Run environment variables
   - Update frontend API endpoint in `scripts/gemini-mascot.js` to point to your Cloud Run service

### Benefits of this Setup

- **Automated Deployments**: Changes to frontend or backend code automatically trigger deployments
- **Scalable Backend**: Cloud Run automatically scales based on demand
- **Cost-Effective**: Only pay for actual backend usage
- **Secure**: API keys and secrets are safely managed through GitHub Secrets and Cloud Run
- **Separated Concerns**: Frontend and backend can be deployed and scaled independently

This deployment setup provides a production-ready environment that's both scalable and maintainable. The separation of frontend and backend deployments allows for independent scaling and updates while maintaining a cohesive system through automated workflows.

## Customization

### Customizing the Mascot

### Changing the Prompt
To customize how the AI generates mascot outfits, modify the prompt in `scripts/gemini-mascot.js`. Look for the `prompt` constant:

```javascript
const prompt = "Your custom prompt here";
```

The prompt should describe:
- The mascot's base appearance
- Desired outfit style changes
- Any specific fashion elements or aesthetics
- How to handle existing elements (like accessories)

### Using Your Own Mascot Images
To use your own mascot, you'll need to update several files:

1. Prepare your mascot images:
   - Main display image (e.g., with background/scene)
   - Use clear, high-quality images
   - Recommended size: at least 512x512 pixels
   - Format: PNG or JPEG
   
2. Place your images in the `assets/images` directory:
   - Save your main display image (e.g., `YourMascot.jpg`)
   - Save your transparent version as `PolarBearTransparent4K.png` (or update the path in the files below)

3. Update the image paths in these files:
   - `index.html`: Update the main display image
     ```html
     <img src="assets/images/YourMascot.jpg" alt="Your Mascot Description" class="mascot">
     ```
   - `server.js`: Update the AI generation image path (around line 50)
     ```javascript
     const imagePath = 'assets/images/PolarBearTransparent4K.png';
     ```
   - `scripts/test-image-generation.js`: Update the test script image path
     ```javascript
     const imagePath = 'assets/images/PolarBearTransparent4K.png';
     ```

4. Adjust the prompt to match your mascot's characteristics

5. Test the image generation using the test script:
   ```
   node scripts/test-image-generation.js
   ```

### Gemini API Performance

1. **Image Size Considerations**
   - Keep mascot images at recommended size (512x512px)
   - Larger images increase API response time and costs
   - Smaller images may reduce generation quality

2. **Rate Limiting**
   - Default cooldown period between generations
   - Prevents API abuse and manages costs
   - Adjust in `server.js` if needed:
     ```javascript
     const RATE_LIMIT_MS = 5000; // 5 seconds between generations
     ```

3. **Caching Strategy**
   - Generated outfits are cached server-side
   - Reduces API calls and improves response times
   - Configure cache size in `server.js`:
     ```javascript
     const CACHE_SIZE = 10; // Number of recent generations to keep
     ```

4. **Error Handling**
   - Graceful fallbacks when API is unavailable
   - Automatic retries for failed generations
   - User feedback through UI state changes

### Static Background Customization

The website features a dynamic static noise background effect that can be customized by modifying parameters in `scripts/static-background.js`. The effect includes both a normal state and an enhanced "magic mode" that activates during certain interactions.

### Basic Parameters

To adjust the basic static effect, modify these parameters in the `config` object:

```javascript
const config = {
    pixelSize: 1,       // Size of each static pixel
    density: 0.8,       // Density of static dots
    baseAlpha: 0.85,    // Base opacity of static
    alphaVariance: 0.25 // Random variance in opacity
};
```

### Color Settings

The static effect automatically adapts to light/dark mode. Customize the intensity ranges:

```javascript
const config = {
    // Dark mode settings (bright dots on dark background)
    darkIntensityMin: 30,
    darkIntensityMax: 100,
    
    // Light mode settings (dark dots on light background)
    lightIntensityMin: 135,
    lightIntensityMax: 200
};
```

### Magic Mode Effects

When magic mode activates (during certain interactions), the static becomes more intense and colorful. Customize these effects:

```javascript
const config = {
    intenseDensity: 1.8,    // Density during magic mode
    intenseColor: [200, 120, 255], // Purple magic color [R,G,B]
    transitionSpeed: 0.012   // Speed of transition to/from magic mode
};
```

### Magic Mode and Gemini Integration

The static background's Magic Mode is designed to enhance the user experience during Gemini AI image generation. When you click the Style Inspiration button to generate a new outfit for the mascot:

1. Magic Mode automatically activates, creating a purple-tinted static effect
2. This visual feedback indicates that the AI is processing your request
3. The effect persists for four seconds
4. After four seconds, the effect smoothly fades back to normal

This creates a cohesive experience where the background responds to AI interactions, making the website feel more dynamic and interactive.

### Performance Settings

Adjust performance-related parameters:

```javascript
const config = {
    frameInterval: 45, // Milliseconds between frames (~20fps)
};
```

### Triggering Magic Mode Programmatically

You can trigger the enhanced static effect from your JavaScript code:

```javascript
// Enable magic mode
window.staticBackground.enableMagicMode();

// Disable magic mode
window.staticBackground.disableMagicMode();
```

### Static Background Performance

The static background effect is designed to be performant while maintaining visual quality. Here are key considerations:

1. **Frame Rate Control**
   - Default runs at ~20fps (45ms intervals) to balance smoothness and CPU usage
   - Automatically pauses when tab is not visible
   - Adjust `frameInterval` for different performance targets:
     ```javascript
     const config = {
         frameInterval: 45, // Increase for better performance, decrease for smoother animation
     };
     ```

2. **Density Scaling**
   - Static density automatically scales with screen size
   - Adjust `density` and `intenseDensity` for performance:
     ```javascript
     const config = {
         density: 0.8,        // Decrease for better performance
         intenseDensity: 1.8  // Decrease for better performance in magic mode
     };
     ```

3. **Pixel Size Optimization**
   - Larger `pixelSize` values improve performance but reduce quality
   - Consider increasing on lower-end devices:
     ```javascript
     const config = {
         pixelSize: 1, // Increase to 2 or 3 for better performance
     };
     ```

4. **Dark Mode Optimizations**
   - Automatically reduces effects intensity in dark mode
   - Fewer particles and lower opacity for better visibility and performance

### Browser Support

- Static effect uses `requestAnimationFrame` for optimal performance
- Fallback to simpler static effect on older browsers
- Automatically adjusts quality based on device capabilities
- Supports both mouse and touch interactions

### Network Optimization

1. **API Endpoint Location**
   - Deploy Cloud Run backend in regions close to your users
   - Use CDN for static assets
   - Configure CORS appropriately for your deployment

2. **Asset Loading**
   - Mascot images are lazy-loaded
   - Static effect starts immediately while assets load
   - Progressive enhancement approach
