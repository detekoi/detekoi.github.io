## Commands

*   **Start server:** `npm start` or `node server.js`
*   **Start server (dev mode):** `npm run dev` or `nodemon server.js`
*   **Test image generation:** `node scripts/test-image-generation.js`
*   **Install dependencies:** `npm install`

## Code Style

*   **General:** Follow standard JavaScript conventions.
*   **Imports:** Use `require` for imports in Node.js files (`server.js`, `scripts/*.js`). Use standard HTML script tags for frontend JavaScript.
*   **Formatting:** Use Prettier defaults (implied, no config found). Aim for 2-space indentation.
*   **Naming:** Use camelCase for variables and functions. Use PascalCase for classes (if any).
*   **Types:** This project does not use TypeScript. Add types via JSDoc where helpful.
*   **Error Handling:** Use standard try/catch blocks for asynchronous operations, especially API calls. Provide informative error messages.
*   **Dependencies:** Keep dependencies updated using `npm update`. Prefer minimal dependencies.
*   **Frontend:** Vanilla HTML, CSS, and JavaScript. No specific frontend framework is used.
*   **Backend:** Node.js with Express.
*   **API Keys:** Use `.env` file for API keys (e.g., `GEMINI_API_KEY`). Do not commit `.env`.
*   **Comments:** Add comments to explain complex logic or non-obvious code sections.
