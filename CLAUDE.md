# Development Guide for Henry's Portfolio Website

## Commands
- `npm install` - Install dependencies
- `npm start` - Start the server in production mode
- `npm run dev` - Start server with hot reloading for development
- `node scripts/test-image-generation.js` - Test Gemini API image generation

## Code Style
- **JavaScript**: Use ES6+ features, arrow functions, and template literals
- **CSS**: Follow BEM naming for classes (block__element--modifier)
- **HTML**: Use semantic elements, include alt text for images
- **Variables**: camelCase for variables and functions, PascalCase for classes
- **Error Handling**: Always include try/catch for API calls and async operations
- **Comments**: Include JSDoc-style comments for functions, explain complex logic
- **Imports**: Group imports: built-in modules first, then external packages, then local modules
- **Responsive Design**: Mobile-first approach with media queries for larger screens

## Project Structure
- `/assets` - Static assets (images, fonts)
- `/scripts` - Client-side JavaScript files
- `/styles` - CSS stylesheets
- `server.js` - Express server for Gemini API integration
- `index.html` - Main entry point

## Git Conventions
- Commit messages should only describe code changes with no author information
- Use "main" as the primary git branch