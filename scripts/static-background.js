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
        frameInterval: 45, // Milliseconds between frames (~20fps). Lower = faster.
        
        // Magic effect parameters
        magicMode: false,   // Flag to enable magic effect
        magicDensity: 1.3,  // Increased density for magic effect
        magicColor: [180, 130, 255] // Purple-ish magic color
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

        // Adjust density based on magic mode
        const effectiveDensity = config.magicMode ? config.magicDensity : config.density;
        
        // Optimized calculation for number of dots 
        // Using a more efficient density calculation for better performance
        const numDots = Math.floor((canvas.width * canvas.height) / 50 * effectiveDensity);

        for (let i = 0; i < numDots; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            let r, g, b, alpha;
            
            if (config.magicMode) {
                // Use magic color with some variation
                r = config.magicColor[0] + (Math.random() * 50 - 25);
                g = config.magicColor[1] + (Math.random() * 50 - 25);
                b = config.magicColor[2] + (Math.random() * 50 - 25);
                alpha = config.baseAlpha + (Math.random() - 0.3) * config.alphaVariance;
                
                // Add some white sparkles
                if (Math.random() > 0.95) {
                    r = g = b = 255;
                    alpha = Math.random() * 0.9 + 0.1;
                }
            } else {
                // Regular static mode
                let intensity;
                // Use the isDarkMode flag determined by the media query
                if (isDarkMode) {
                    intensity = config.darkIntensityMin + Math.random() * (config.darkIntensityMax - config.darkIntensityMin);
                } else {
                    intensity = config.lightIntensityMin + Math.random() * (config.lightIntensityMax - config.lightIntensityMin);
                }
                intensity = Math.floor(intensity);
                r = g = b = intensity;
                alpha = config.baseAlpha + (Math.random() - 0.5) * config.alphaVariance;
            }
            
            // Ensure values are in valid range
            r = Math.min(255, Math.max(0, Math.floor(r)));
            g = Math.min(255, Math.max(0, Math.floor(g)));
            b = Math.min(255, Math.max(0, Math.floor(b)));

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fillRect(x, y, config.pixelSize, config.pixelSize);
        }

        // Request the next frame
        animationFrameId = requestAnimationFrame(drawStatic);
    }

    // Function to update the mode based on the media query
    function updateMode(event) {
        isDarkMode = event.matches;
        // No need to redraw immediately, the animation loop will pick it up.
    }
    
    // Function to enable magic effect mode
    function enableMagicMode() {
        config.magicMode = true;
        // The animation loop will pick it up
    }
    
    // Function to disable magic effect mode
    function disableMagicMode() {
        config.magicMode = false;
        // The animation loop will pick it up
    }

    // Initial Setup
    resizeCanvas(); // Set initial size

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);

    // Start the animation
    animationFrameId = requestAnimationFrame(drawStatic);
    
    // Expose functions to window for other scripts to use
    window.staticBackground = {
        enableMagicMode,
        disableMagicMode
    };

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
            animationFrameId = requestAnimationFrame(drawStatic);
        }
    });
    
    // Note: Magic mode is now explicitly controlled by gemini-mascot.js
    // so we've removed the automatic observer to avoid conflicts

}); // End DOMContentLoaded