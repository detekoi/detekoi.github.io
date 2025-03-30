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
        density: 0.8,       // Base density for normal mode (increased to match default background)
        baseAlpha: 0.85,    // Base alpha for normal mode (increased slightly)
        alphaVariance: 0.25, // Alpha variance for normal mode

        // Color ranges (0-255) - Enhanced contrast
        darkIntensityMin: 30,  // Brighter dots on dark bg
        darkIntensityMax: 100, // Wider range for better visibility
        lightIntensityMin: 135, // Darker dots on light bg (increased contrast)
        lightIntensityMax: 200, // Wider range for better visibility
        
        // Frame timing
        frameInterval: 45, // Milliseconds between frames (~20fps)
        
        // Effect state tracking
        effectState: 'normal', // Can be 'normal', 'intensifying', 'intense', 'fading'
        
        // Intense mode parameters (what we transition to)
        intenseDensity: 1.8,    // Higher density for intense mode (increased for more contrast)
        intenseColor: [200, 120, 255], // More vibrant purple magic color
        
        // Transition parameters
        transitionProgress: 0,   // Progress from 0-1
        transitionSpeed: 0.012,  // How much to increment per frame (lower = smoother)
        
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
        
        // APPROACH: Draw two layers of static
        // 1. Base layer - always present (regular static)
        // 2. Effect layer - varies with transitions (colored static)
        
        // BASE LAYER: Always draw the normal static first
        const baseStaticDots = Math.floor((canvas.width * canvas.height) / 50 * config.density);
        for (let i = 0; i < baseStaticDots; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            // Always use the normal static appearance for the base layer
            let intensity;
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
        
        // EFFECT LAYER: Only if we're not in normal state
        if (config.effectState !== 'normal' && config.transitionProgress > 0) {
            // Calculate intensity dots - these have color and vary with transition
            // Significantly increased dot count for more intense visual effect
            const effectDots = Math.floor((canvas.width * canvas.height) / 30 * 
                (config.intenseDensity - config.density) * config.transitionProgress);
                
            // Draw more and bigger dots for enhanced visual effect
            for (let i = 0; i < effectDots; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                
                // Get special effect color (purple/magic)
                const { r, g, b, alpha } = calculateEffectColor();
                
                // Draw the effect dot - occasionally make some dots larger for more visual impact
                const dotSize = Math.random() > 0.9 ? config.pixelSize * 2 : config.pixelSize;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fillRect(x, y, dotSize, dotSize);
            }
            
            // Add some extra bright sparkles for additional visual impact
            const sparkleCount = Math.floor((canvas.width * canvas.height) / 2000 * config.transitionProgress);
            for (let i = 0; i < sparkleCount; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                
                // Always use white for these special sparkles
                ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * config.transitionProgress})`;
                ctx.fillRect(x, y, config.pixelSize * 2, config.pixelSize * 2);
            }
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
        // Interpolate between normal and intense parameters with easing
        // Use a quadratic easing function for smoother transitions at beginning and end
        const easeInOut = config.transitionProgress < 0.5 ? 
            2 * config.transitionProgress * config.transitionProgress : 
            1 - Math.pow(-2 * config.transitionProgress + 2, 2) / 2;
            
        // Set minimum density to never go below 90% of normal density
        // This ensures we never have a completely empty screen
        const minDensity = config.density * 0.9;
        
        // Calculate current density with easing and minimum
        config.currentDensity = Math.max(
            minDensity,
            config.density + (config.intenseDensity - config.density) * easeInOut
        );
            
        // Color mix can use the same easing for smooth transitions
        config.currentColorMix = easeInOut;
    }
    
    // Helper function to calculate the special effect color (used for magic/intense state)
    function calculateEffectColor() {
        // Calculate the intense color with some variation
        // Use less variation to maintain more consistent vibrant colors
        const intenseR = config.intenseColor[0] + (Math.random() * 40 - 20);
        const intenseG = config.intenseColor[1] + (Math.random() * 30 - 15);
        const intenseB = config.intenseColor[2] + (Math.random() * 20 - 10); // Less variation for blue to keep purple vibrant
        
        let r, g, b, alpha;
        
        // Add some colorful variation
        const colorRoll = Math.random();
        
        // White sparkles (10% chance)
        if (colorRoll > 0.9) {
            r = g = b = 255;
            alpha = Math.random() * 0.95 * config.transitionProgress; // Brighter white sparkles
        }
        // Cyan accent sparkles (5% chance) - complementary to purple
        else if (colorRoll > 0.85) {
            r = 100 + Math.random() * 50;
            g = 220 + Math.random() * 35;
            b = 255;
            alpha = (0.8 + Math.random() * 0.2) * config.transitionProgress; // Brighter cyan sparkles
        }
        // Main purple/magic color (85% chance)
        else {
            // Use the intense colors with enhanced alpha
            r = intenseR;
            g = intenseG;
            b = intenseB;
            // Use higher base alpha for more vibrant appearance
            alpha = (0.9 + (Math.random() * 0.1 - 0.05)) * config.transitionProgress;
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
        }, 4000); // Keep intense for 4 seconds before starting to fade
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

    // Initialize system to normal state
    config.effectState = 'normal';
    config.transitionProgress = 0;
    
    // Initialize current parameters (density, etc.)
    updateCurrentParameters();
    
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