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

        // Move the first card to the end with a smooth slide-out animation
        var $firstCard = $('.card:first-child');
        $firstCard.addClass('animating'); // Mark as animating
        
        // Get current position values for smoother transition
        var currentTop = parseInt($firstCard.css('top')) || 0;
        var currentLeft = parseInt($firstCard.css('left')) || 50;
        var currentOpacity = parseFloat($firstCard.css('opacity')) || 1;
        
        // 1. Smooth fade-out animation with gradual movement
        $firstCard.css({
            'transition': 'all 0.3s ease-in-out',
            'transform': 'translateY(-50px)',
            'opacity': '0'
        });
        
        // Use setTimeout to wait for the CSS transition to complete
        setTimeout(function() {
            // Remove transition to avoid interfering with next steps
            $firstCard.css('transition', 'none');
            
            // 2. Move to end, set initial position for slide-in from above
            // Get appropriate position based on screen size
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 575;
            
            let targetLeft = '10px';  // Default desktop
            
            if (isMobile) {
                targetLeft = '-10px'; // Tablet/mobile
            }
            
            if (isSmallMobile) {
                targetLeft = '-15px'; // Small mobile
            }
            
            $firstCard
                .appendTo('.container')
                .css({
                    'transform': 'none', // Reset transform
                    'left': targetLeft,   // Target left for last card based on device
                    'top': '-90px',      // Start above the final position
                    'z-index': '5',      // Lower z-index initially
                    'opacity': '0',      // Keep hidden initially
                    'box-shadow': isDarkMode() ?
                                  '8px 8px 0 rgba(255, 255, 255, 0.3)' : // Dark mode shadow
                                  '8px 8px 0 var(--color-border)'         // Light mode shadow
                });
            
            // Force a repaint before starting the next animation
            $firstCard[0].offsetHeight;
            
            // 3. Re-enable transitions for the second part of the animation
            $firstCard.css({
                'transition': 'all 0.3s ease-out',
                'top': '-40px',     // Target top for last card
                'opacity': '0.5'    // Target opacity for last card
            });
            
            // Use setTimeout to wait for the CSS transition to complete
            setTimeout(function() {
                // 4. Animation complete: remove inline styles so CSS takes over
                $firstCard.removeAttr('style');
                $firstCard.removeClass('animating'); // Remove animation marker
                
                // Ensure all cards are properly positioned
                resetCardPositions();
            }, 300); // Match the CSS transition duration
            
        }, 300); // Match the CSS transition duration
    }

    // Define rotatePrev function to move card from back to front
    function rotatePrev() {
        // Prevent rotation if animation is in progress
        if ($('.card.animating').length > 0) {
            console.log('Animation in progress, skipping rotation');
            return;
        }
        
        var $lastCard = $('.card:last-child');

        // Avoid animation if there's only one card
        if ($('.card').length <= 1) {
            console.log('Only one card present, no rotation needed');
            return;
        }

        $lastCard.addClass('animating'); // Mark as animating
        
        // 1. Smooth fade-out animation with gradual movement
        $lastCard.css({
            'transition': 'all 0.3s ease-in-out',
            'transform': 'translateY(-50px)',
            'opacity': '0'
        });
        
        // Use setTimeout to wait for the CSS transition to complete
        setTimeout(function() {
            // Remove transition to avoid interfering with next steps
            $lastCard.css('transition', 'none');
            
            // 2. Move to beginning, set initial position for slide-in from top
            // Get appropriate position based on screen size
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 575;
            
            let targetLeft = '50px';  // Default desktop
            
            if (isMobile) {
                targetLeft = '30px'; // Tablet/mobile
            }
            
            if (isSmallMobile) {
                targetLeft = '25px'; // Small mobile
            }
            
            $lastCard
                .prependTo('.container')
                .css({
                    'transform': 'none', // Reset transform
                    'left': targetLeft,   // Target left for 1st card based on device
                    'top': '-50px',      // Start above the final position
                    'z-index': '11',     // Higher z-index initially
                    'opacity': '0',      // Start invisible for better fade in
                    'box-shadow': isDarkMode() ?
                                  '8px 8px 1px rgba(255, 255, 255, 0.3)' : // Dark mode shadow
                                  '8px 8px 1px rgba(0, 0, 0, 0.8)'         // Light mode shadow
                });
            
            // Force a repaint before starting the next animation
            $lastCard[0].offsetHeight;
            
            // 3. Re-enable transitions for the second part of the animation
            $lastCard.css({
                'transition': 'all 0.3s ease-out',
                'top': '0px',       // Target top for 1st card
                'opacity': '1'      // Target opacity for 1st card
            });
            
            // Use setTimeout to wait for the CSS transition to complete
            setTimeout(function() {
                // 4. Animation complete: remove inline styles so CSS takes over
                $lastCard.removeAttr('style');
                $lastCard.removeClass('animating'); // Remove animation marker
                
                // Ensure all cards are properly positioned
                resetCardPositions();
            }, 300); // Match the CSS transition duration
            
        }, 300); // Match the CSS transition duration
    }

    // Function to reset card positions based on their current order
    function resetCardPositions() {
        // Get screen width for responsive adjustments
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 575;
        
        // Clear any inline styles that might be messing with the positions
        $('.card').each(function(index) {
            const $card = $(this);
            
            // Important: DO NOT remove or manipulate styles on the detail elements
            // Just remember the card positioning properties we want to manage
            const cardPosition = {
                top: $card.css('top'),
                left: $card.css('left'),
                zIndex: $card.css('z-index'),
                opacity: $card.css('opacity'),
                boxShadow: $card.css('box-shadow')
            };
            
            // Only remove the card's style attribute, not any of its children
            $card.removeAttr('style');

            // Determine positions based on screen size
            let leftPositions = [50, 40, 30, 20, 10]; // Desktop default
            
            if (isMobile) {
                leftPositions = [30, 20, 10, 0, -10]; // Tablet/Mobile
            }
            
            if (isSmallMobile) {
                leftPositions = [25, 15, 5, -5, -15]; // Small Mobile
            }

            // Then apply the appropriate position based on current index
            if (index === 0) {
                // First card (front)
                $card.css({
                    'z-index': '10',
                    'top': '0px',
                    'left': leftPositions[0] + 'px',
                    'opacity': '1',
                    'box-shadow': isDarkMode() ?
                                  '8px 8px 1px rgba(255, 255, 255, 0.3)' : // Dark mode shadow
                                  '8px 8px 1px rgba(0, 0, 0, 0.8)'         // Light mode shadow
                });
            } else if (index === 1) {
                // Second card
                $card.css({
                    'z-index': '9',
                    'top': '-10px',
                    'left': leftPositions[1] + 'px',
                    'opacity': '0.9'
                });
            } else if (index === 2) {
                // Third card
                $card.css({
                    'z-index': '8',
                    'top': '-20px',
                    'left': leftPositions[2] + 'px',
                    'opacity': '0.8'
                });
            } else if (index === 3) {
                // Fourth card
                $card.css({
                    'z-index': '7',
                    'top': '-30px',
                    'left': leftPositions[3] + 'px',
                    'opacity': '0.7'
                });
            } else if (index >= 4) {
                // Fifth card and beyond
                $card.css({
                    'z-index': '6',
                    'top': '-40px',
                    'left': leftPositions[4] + 'px',
                    'opacity': '0.5'
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
