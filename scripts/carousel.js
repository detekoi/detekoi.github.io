(function() {
    // Helper function to detect dark mode
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Define rotate function to move card from front to back
    function rotate() {
        // Prevent rotation if animation is in progress
        if ($('.card.animating').length > 0) {
            console.log('Animation in progress, skipping rotation');
            return;
        }

        // Get the first card
        var $firstCard = $('.card:first-child');
        $firstCard.addClass('animating'); // Mark as animating
        
        // Get appropriate position based on screen size
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 575;
        
        // Define target positions
        let targetLeft = '10px';  // Default desktop for last card
        let targetTopInit = '-90px';  // Initial top position
        let targetTopFinal = '-40px'; // Final top position
        
        if (isMobile) {
            targetLeft = '-10px'; // Tablet/mobile
        }
        
        if (isSmallMobile) {
            targetLeft = '-15px'; // Small mobile
        }
        
        // 1. Animate slide out upwards - exactly like the example
        $firstCard.animate({
            top: '-=50px', // Move up
            opacity: 0     // Fade out while sliding
        }, 400, 'swing', function() {
            // Animation complete for slide-out
            
            // 2. Move to end, set initial position for slide-in from above
            $(this)
                .appendTo('.container')
                .css({
                    'left': targetLeft,  // Target left for last card position
                    'top': targetTopInit, // Start above the final position
                    'z-index': '5',      // Lower z-index initially
                    'opacity': '0'       // Keep hidden initially
                })
                // 3. Animate slide-in to the last card position
                .animate({
                    top: targetTopFinal, // Target top for last card
                    opacity: 0.5        // Target opacity for last card
                }, 400, 'swing', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    $(this).removeAttr('style');
                    $(this).removeClass('animating'); // Remove animation marker
                    
                    // Ensure all cards are properly positioned
                    resetCardPositions();
                });
        });
    }

    // Define rotatePrev function to move card from back to front
    function rotatePrev() {
        // Prevent rotation if animation is in progress
        if ($('.card.animating').length > 0) {
            console.log('Animation in progress, skipping rotation');
            return;
        }
        
        // Avoid animation if there's only one card
        if ($('.card').length <= 1) {
            console.log('Only one card present, no rotation needed');
            return;
        }

        // Get the last card
        var $lastCard = $('.card:last-child');
        $lastCard.addClass('animating'); // Mark as animating
        
        // Get appropriate position based on screen size
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 575;
        
        // Define target positions
        let targetLeft = '50px';  // Default desktop for front card
        let targetTopInit = '-50px';  // Initial top position
        
        if (isMobile) {
            targetLeft = '30px'; // Tablet/mobile
        }
        
        if (isSmallMobile) {
            targetLeft = '25px'; // Small mobile
        }
        
        // 1. Animate slide out upwards - exactly like the example
        $lastCard.animate({
            top: '-=50px', // Move up
            opacity: 0     // Fade out
        }, 400, 'swing', function() {
            // Animation complete for slide-out
            
            // 2. Move to beginning, set initial position for slide-in from top
            $(this)
                .prependTo('.container')
                .css({
                    'left': targetLeft,  // Target left for first card position
                    'top': targetTopInit, // Start above the final position
                    'z-index': '11',     // Higher z-index initially
                    'opacity': '0'       // Keep hidden initially
                })
                // 3. Animate slide-in to the first card position
                .animate({
                    top: '0px',   // Target top for first card
                    opacity: 1    // Target opacity for first card
                }, 400, 'swing', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    $(this).removeAttr('style');
                    $(this).removeClass('animating'); // Remove animation marker
                    
                    // Apply class to denote this is the front card
                    $(this).addClass('front-card').siblings().removeClass('front-card');
                    
                    // Ensure all cards are properly positioned
                    resetCardPositions();
                });
        });
    }

    // Function to reset card positions based on their current order
    function resetCardPositions() {
        // Get screen width for responsive adjustments
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 575;
        
        // Remove the animating class from all cards
        $('.card').removeClass('animating');
        
        // Ensure the first card has the front-card class
        $('.card:first-child').addClass('front-card').siblings().removeClass('front-card');
        
        // Determine positions based on screen size
        let leftPositions = [50, 40, 30, 20, 10]; // Desktop default
        let topPositions = [0, -10, -20, -30, -40]; // Top positions
        let opacities = [1, 0.9, 0.8, 0.7, 0.5]; // Opacity values
        
        if (isMobile) {
            leftPositions = [30, 20, 10, 0, -10]; // Tablet/Mobile
        }
        
        if (isSmallMobile) {
            leftPositions = [25, 15, 5, -5, -15]; // Small Mobile
        }
        
        // Apply positions to all cards in a single batch to make them transition together
        $('.card').each(function(index) {
            const $card = $(this);
            
            // Get position values based on card position in stack
            const posIndex = Math.min(index, 4); // Cap at 4 (5th position)
            
            // Apply the z-index for proper stacking (10 for front card, down to 6)
            const zIndex = 10 - Math.min(index, 4);
            
            // Set shadow based on whether it's the front card
            const boxShadow = index === 0 ?
                (isDarkMode() ?
                    '8px 8px 1px rgba(255, 255, 255, 0.3)' : // Dark mode shadow for front card
                    '8px 8px 1px rgba(0, 0, 0, 0.8)')        // Light mode shadow for front card
                :
                (isDarkMode() ?
                    '8px 8px 0 var(--shadow-color)' :        // Dark mode shadow for other cards
                    '8px 8px 0 var(--color-border)');        // Light mode shadow for other cards
            
            // First card should retain the ability to get hover/active styles
            if (index === 0) {
                // Apply position but without box-shadow - let CSS handle it
                $card.css({
                    'z-index': zIndex,
                    'top': topPositions[posIndex] + 'px',
                    'left': leftPositions[posIndex] + 'px',
                    'opacity': opacities[posIndex]
                });
            } else {
                // Apply all styles for other cards
                $card.css({
                    'z-index': zIndex,
                    'top': topPositions[posIndex] + 'px',
                    'left': leftPositions[posIndex] + 'px',
                    'opacity': opacities[posIndex],
                    'box-shadow': boxShadow
                });
            }
        });
    }
    
    // Function to hide/show carousel controls based on number of cards
    function updateCarouselControls() {
        var cardCount = $('.card').length;
        if (cardCount <= 1) {
            $('.carousel-controls').hide();
        } else {
            $('.carousel-controls').show();
        }
    }

    // Expose functions globally
    window.rotate = rotate;
    window.rotatePrev = rotatePrev;
    window.updateCarouselControls = updateCarouselControls;
    window.resetCardPositions = resetCardPositions;

    // Call initially to set up controls visibility
    $(document).ready(function() {
        // Set up carousel controls
        updateCarouselControls();
        
        // Initial positioning of cards
        resetCardPositions();
    });

    // Listen for dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Re-apply the correct shadow based on the new mode if the card has inline styles
        // (e.g., if mode changes mid-animation). Otherwise, CSS handles it.
        $('.card').each(function() {
            // If the card has inline styles (likely from animation), clear them
            // so the CSS rules for the new color scheme take effect.
            if ($(this).attr('style')) {
                $(this).removeAttr('style');
            }
        });
        
        // Reset positions for all cards
        resetCardPositions();
    });

    // Button event listeners
    $('.next-btn').click(function() {
        rotate();
        return false; // Prevent default action
    });

    $('.prev-btn').click(function() {
        rotatePrev();
        return false; // Prevent default action
    });

    // Optional: Add keyboard navigation
    $(document).keydown(function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            rotatePrev();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            rotate();
        }
    });

})();
