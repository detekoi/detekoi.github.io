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
    // Basic static effect configuration
    const config = {
        pixelSize: 1,       // Minimum pixel size for finest static
        density: 0.9,       // Base density for normal mode (increased to match default background)
        baseAlpha: 0.85,    // Base alpha for normal mode (increased slightly)
        alphaVariance: 0.25, // Alpha variance for normal mode

        // Color ranges (0-255) - Enhanced contrast
        darkIntensityMin: 30,  // Brighter dots on dark bg
        darkIntensityMax: 100, // Wider range for better visibility
        lightIntensityMin: 125, // Darker dots on light bg (increased contrast)
        lightIntensityMax: 200, // Wider range for better visibility
        
        // Frame timing
        frameInterval: 45, // Milliseconds between frames (~20fps)
        
        // Effect state tracking
        effectState: 'normal', // Can be 'normal', 'intensifying', 'intense', 'fading'
        
        // Intense mode parameters (what we transition to)
        intenseDensity: 1.5,    // Higher density for intense mode (increased for more contrast)
        intenseColor: [180, 130, 255], // Purple-ish magic color
        
        // Transition parameters
        transitionProgress: 0,   // Progress from 0-1
        transitionSpeed: 0.015,  // How much to increment per frame (lower = smoother)
        
        // Effect parameters that will be dynamically calculated
        currentDensity: 0.66,   // Will be updated during transitions
        currentColorMix: 0      // 0 = normal colors, 1 = intense colors
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
        
        // Update the effect state and transition progress
        updateEffectState();
        
        // Calculate the actual number of dots based on current density
        const numDots = Math.floor((canvas.width * canvas.height) / 50 * config.currentDensity);
        
        // Draw the static dots
        for (let i = 0; i < numDots; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            // Determine the dot appearance
            const { r, g, b, alpha } = calculateDotColor();
            
            // Draw the dot
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fillRect(x, y, config.pixelSize, config.pixelSize);
        }
        
        // Request the next frame
        animationFrameId = requestAnimationFrame(drawStatic);
    }
    
    // Helper function to update the effect state and transition progress
    function updateEffectState() {
        // Handle state transitions
        switch(config.effectState) {
            case 'intensifying':
                // Increase the transition progress
                config.transitionProgress += config.transitionSpeed;
                
                // If we've reached the maximum intensity
                if (config.transitionProgress >= 1) {
                    config.transitionProgress = 1;
                    config.effectState = 'intense'; // Switch to intense state
                }
                break;
                
            case 'fading':
                // Decrease the transition progress
                config.transitionProgress -= config.transitionSpeed;
                
                // If we've reached the normal state
                if (config.transitionProgress <= 0) {
                    config.transitionProgress = 0;
                    config.effectState = 'normal'; // Switch to normal state
                }
                break;
                
            // For 'normal' and 'intense' states, no progress updates needed
            // They are stable states representing the two extremes
        }
        
        // Update the current parameters based on transition progress
        updateCurrentParameters();
    }
    
    // Helper function to update current parameters based on transition progress
    function updateCurrentParameters() {
        // Interpolate between normal and intense parameters
        config.currentDensity = config.density + 
            (config.intenseDensity - config.density) * config.transitionProgress;
            
        config.currentColorMix = config.transitionProgress;
    }
    
    // Helper function to calculate the color for a single dot
    function calculateDotColor() {
        // Get the base intensity based on theme
        let intensity;
        if (isDarkMode) {
            intensity = config.darkIntensityMin + 
                Math.random() * (config.darkIntensityMax - config.darkIntensityMin);
        } else {
            intensity = config.lightIntensityMin + 
                Math.random() * (config.lightIntensityMax - config.lightIntensityMin);
        }
        intensity = Math.floor(intensity);
        
        // Calculate the color and alpha
        let r, g, b, alpha;
        
        // Determine if we need to blend in intense colors
        if (config.currentColorMix > 0) {
            // Calculate the intense color with some variation
            const intenseR = config.intenseColor[0] + (Math.random() * 50 - 25);
            const intenseG = config.intenseColor[1] + (Math.random() * 50 - 25);
            const intenseB = config.intenseColor[2] + (Math.random() * 50 - 25);
            
            // Add some white sparkles occasionally
            if (Math.random() > 0.95 * config.currentColorMix) {
                r = g = b = 255;
                alpha = Math.random() * 0.9 * config.currentColorMix;
            } else {
                // Blend between normal and intense colors
                r = intensity * (1 - config.currentColorMix) + intenseR * config.currentColorMix;
                g = intensity * (1 - config.currentColorMix) + intenseG * config.currentColorMix;
                b = intensity * (1 - config.currentColorMix) + intenseB * config.currentColorMix;
                alpha = config.baseAlpha + 
                    (Math.random() - 0.5) * config.alphaVariance;
            }
        } else {
            // Normal mode - grayscale static
            r = g = b = intensity;
            alpha = config.baseAlpha + (Math.random() - 0.5) * config.alphaVariance;
        }
        
        // Ensure values are in valid range
        r = Math.min(255, Math.max(0, Math.floor(r)));
        g = Math.min(255, Math.max(0, Math.floor(g)));
        b = Math.min(255, Math.max(0, Math.floor(b)));
        
        return { r, g, b, alpha };
    }

    // Function to update the mode based on the media query
    function updateMode(event) {
        isDarkMode = event.matches;
        // No need to redraw immediately, the animation loop will pick it up.
    }
    
    // Keep track of automatic state changes
    let autoChangeTimeout = null;
    
    // Function to start enhancing the static (transition to intense)
    function enableMagicMode() {
        // Clear any existing auto-timeout to avoid conflicts
        if (autoChangeTimeout) {
            clearTimeout(autoChangeTimeout);
            autoChangeTimeout = null;
        }
        
        // Set initial values for smooth starting transition
        if (config.effectState === 'normal' || config.effectState === 'fading') {
            config.transitionProgress = 0;
            config.currentDensity = config.density;
            config.currentColorMix = 0;
        }
        
        // Change state to intensifying
        config.effectState = 'intensifying';
        
        // Set a timeout to automatically start fading after reaching intense state
        autoChangeTimeout = setTimeout(() => {
            // Start fading back to normal
            disableMagicMode();
        }, 2000); // Keep intense for 2 seconds before starting to fade
    }
    
    // Function to start fading back to normal
    function disableMagicMode() {
        // Clear any existing auto-timeout to avoid conflicts
        if (autoChangeTimeout) {
            clearTimeout(autoChangeTimeout);
            autoChangeTimeout = null;
        }
        
        // Set to fading state (the animation loop will handle the actual transition)
        config.effectState = 'fading';
    }

    // Initial Setup
    resizeCanvas(); // Set initial size

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);

    // Initialize current parameters to match normal state
    config.currentDensity = config.density;
    config.currentColorMix = 0;
    
    // Start the animation
    animationFrameId = requestAnimationFrame(drawStatic);
    
    // Expose functions to window for other scripts to use
    window.staticBackground = {
        enableMagicMode,    // Transition to intense state
        disableMagicMode,   // Transition back to normal state
        
        // Add some utility functions for direct state control if needed
        setIntense: function() {
            config.effectState = 'intense';
            config.transitionProgress = 1;
            updateCurrentParameters();
        },
        setNormal: function() {
            config.effectState = 'normal';
            config.transitionProgress = 0;
            updateCurrentParameters();
        }
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