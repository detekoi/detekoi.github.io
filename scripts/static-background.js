document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('staticCanvas');
    // Important: Check if the canvas element actually exists before proceeding
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    // Use prefers-color-scheme to sync with your CSS :root variables
    let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // --- Configurable Parameters ---
    // Increased values for more visible static effect
    const config = {
        pixelSize: 1,       // Minimum pixel size for finest static
        density: 0.66,       // Increased density for more visible static
        baseAlpha: 0.8,    // Increased alpha for more visible effect
        alphaVariance: 0.25, // Slightly increased variance

        // Color ranges (0-255) - Enhanced contrast
        darkIntensityMin: 30,  // Brighter dots on dark bg
        darkIntensityMax: 100, // Wider range for better visibility
        lightIntensityMin: 125, // Darker dots on light bg (increased contrast)
        lightIntensityMax: 200, // Wider range for better visibility

        // Optional Frame Rate Limiting (uncomment interval logic below if needed)
         frameInterval: 45 // Milliseconds between frames (~20fps). Lower = faster.
    };
    // -----------------------------

     let lastFrameTime = 0; // Needed only if using frameInterval

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function drawStatic(timestamp) { // timestamp is only needed if using frameInterval

        // --- Optional Frame Rate Limiting ---
        
        if (timestamp - lastFrameTime < config.frameInterval) {
            animationFrameId = requestAnimationFrame(drawStatic);
            return;
        }
        lastFrameTime = timestamp;
        
        // --------------------------------------

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Optimized calculation for number of dots 
        // Using a more efficient density calculation for better performance
        const numDots = Math.floor((canvas.width * canvas.height) / 50 * config.density);

        for (let i = 0; i < numDots; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            let intensity;
            // Use the isDarkMode flag determined by the media query
            if (isDarkMode) {
                intensity = config.darkIntensityMin + Math.random() * (config.darkIntensityMax - config.darkIntensityMin);
            } else {
                intensity = config.lightIntensityMin + Math.random() * (config.lightIntensityMax - config.lightIntensityMin);
            }
            intensity = Math.floor(intensity);

            const alpha = config.baseAlpha + (Math.random() - 0.5) * config.alphaVariance;

            ctx.fillStyle = `rgba(${intensity}, ${intensity}, ${intensity}, ${alpha})`;
            ctx.fillRect(x, y, config.pixelSize, config.pixelSize);
        }

        // Request the next frame
        animationFrameId = requestAnimationFrame(drawStatic);
    }

    // Function to update the mode based on the media query
    function updateMode(event) {
        isDarkMode = event.matches;
        // No need to redraw immediately, the animation loop will pick it up.
        // If your theme.js adds/removes a class like 'dark-mode' to the body,
        // you could potentially sync using that instead of or in addition to the media query.
        // For now, relying on the media query directly is cleanest as your CSS uses it.
    }

    // Initial Setup
    resizeCanvas(); // Set initial size

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);

    // Start the animation
    // Use performance.now() if using frameInterval: drawStatic(performance.now());
    // Otherwise, just start it:
    animationFrameId = requestAnimationFrame(drawStatic);

    // Listen for system theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', updateMode);
     // Initialize isDarkMode based on current state
    isDarkMode = darkModeMediaQuery.matches;


    // Optional: Stop animation when tab is not visible (performance)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            // Restart the animation loop
            // if (using frame interval) lastFrameTime = performance.now();
            animationFrameId = requestAnimationFrame(drawStatic);
        }
    });

}); // End DOMContentLoaded