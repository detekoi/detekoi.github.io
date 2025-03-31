// Make rotate functions globally accessible while maintaining the original functionality
(function() {
    // Helper function to detect dark mode
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Define rotate function to move card from front to back
    function rotate() {
        // Move the first card to the end with a slide-out animation
        var $firstCard = $('.card:first-child');
        
        // 1. Animate slide out with shadow transition matching portfolio aesthetic
        $firstCard.animate({
            top: '-=50px', // Move up
            opacity: 0, // Fade out while sliding
            boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)' // Remove shadow during transition
        }, 400, 'linear', function() {
            // Animation complete for slide-out

            // 2. Move to end, set initial position for slide-in from above
            $(this)
                .appendTo('.container')
                .css({
                    'left': '-15px', // Target left for 5th card
                    'top': '-90px',  // Start above the final position
                    'z-index': 5,    // Lower z-index initially
                    'opacity': 0,    // Keep hidden initially
                    'box-shadow': '0px 0px 0px rgba(0, 0, 0, 0)' // Start with no shadow
                })
                // 3. Animate slide-in to the 5th card position with shadow
                .animate({
                    top: '-40px',    // Target top for 5th card
                    opacity: 0.5,    // Target opacity for 5th card
                    // Apply the SHARP shadow when animating to the 5th position
                    boxShadow: isDarkMode() ?
                              '8px 8px 0 rgba(255, 255, 255, 0.33)' : // Dark mode sharp shadow
                              '8px 8px 0 #333333'                      // Light mode sharp shadow
                }, 400, 'linear', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    // This ensures the :nth-child(5) CSS rule applies the sharp shadow correctly
                    $(this).removeAttr('style');
                });
        });
    }

    // Define rotatePrev function to move card from back to front
    function rotatePrev() {
        var $lastCard = $('.card:last-child');

        // Avoid animation if there's only one card
        if ($('.card').length <= 1) {
            console.log('Only one card present, no rotation needed');
            return;
        }

        // 1. Animate slide out upwards
        $lastCard.animate({
            top: '-=50px', // Move up
            opacity: 0,    // Fade out
            boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)' // Remove shadow during transition
        }, 400, 'linear', function() {
            // Animation complete for slide-out

            // 2. Move to beginning, set initial position for slide-in from top
            $(this)
                .prependTo('.container')
                .css({
                    'left': '50px',  // Target left for 1st card (moved right)
                    'top': '-50px',  // Start above the final position
                    'z-index': 11,   // Higher z-index initially
                    'opacity': 0,    // Keep hidden initially
                    // Start with the hover-like shadow
                    'box-shadow': isDarkMode() ?
                                  '11px 11px 1px rgba(255, 255, 255, 0.1)' : // Dark mode hover shadow
                                  '11px 11px 1px rgba(0, 0, 0, 0.6)'        // Light mode hover shadow
                })
                // 3. Animate slide-in to the 1st card position (animating shadow to final state)
                .animate({
                    top: '0px',      // Target top for 1st card
                    opacity: 1,      // Target opacity for 1st card
                    // Apply the UPDATED shadow when animating to the 1st position
                    boxShadow: isDarkMode() ?
                              '8px 8px 1px rgba(255, 255, 255, 0.3)' : // Dark mode updated shadow
                              '8px 8px 1px rgba(0, 0, 0, 0.8)'        // Light mode updated shadow
                }, 400, 'linear', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    // This ensures the :nth-child(1) CSS rule applies the updated shadow correctly
                    $(this).removeAttr('style');
                });
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

    // Call initially to set up controls visibility
    $(document).ready(function() {
        updateCarouselControls();
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
    });

    // Button event listeners
    $('.next-btn').click(function() {
        rotate();
        
        // Update the description to match the first card after rotation
        updateDescriptionFromFirstCard();
        
        return false; // Prevent default action
    });

    $('.prev-btn').click(function() {
        rotatePrev();
        
        // Update the description to match the first card after rotation
        updateDescriptionFromFirstCard();
        
        return false; // Prevent default action
    });
    
    // Function to update description from the first card
    // Now that descriptions are in the cards, we don't need to do anything
    function updateDescriptionFromFirstCard() {
        // No longer necessary as the description is part of the card
        // and rotates with it automatically
    }
    
    // Extract description from alt text
    function extractDescriptionFromAlt(altText) {
        if (!altText) return '';
        
        // If it's the format "AI-generated polar bear mascot: [description]..."
        if (altText.indexOf(': ') !== -1) {
            const parts = altText.split(': ');
            if (parts.length >= 2) {
                // Remove trailing ellipsis if present
                let desc = parts.slice(1).join(': ');
                if (desc.endsWith('...')) {
                    desc = desc.slice(0, -3);
                }
                return desc;
            }
        }
        
        return altText;
    }

    // Optional: Add keyboard navigation
    $(document).keydown(function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            rotatePrev();
            updateDescriptionFromFirstCard();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            rotate();
            updateDescriptionFromFirstCard();
        }
    });

})();
