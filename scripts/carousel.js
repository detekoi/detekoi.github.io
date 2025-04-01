// Adapted from 3D-Card-Carousel-master/main.js
// Note: This uses jQuery, similar to previous attempts, not a pure CSS 3D transform.
// Updated animation logic to match horizontal cascade (rightwards stack)

(function() {
    // Helper function to set initial positions based on CSS
    function resetCardPositions() {
        // Remove any inline styles from previous animations/JS manipulations
        $('.container.mascot-container .card.mascot-card').removeAttr('style');
        // The CSS :nth-child rules will now apply automatically.
    }

    // Rotate forward (Next button - brings next card to front)
    // Adapted from 3D-Card-Carousel-master/main.js logic
    function rotate() {
        var $firstCard = $('.container.mascot-container .card.mascot-card:first-child');
        var $container = $('.container.mascot-container');

        // Target CSS values for the 5th card (resting place for the card moving back)
        const targetLeft = '105px';
        const targetTop = '10px';
        const targetOpacity = 0.6;
        const targetScale = 'scale(0.8)';
        const targetZIndex = 6; // z-index for 5th card
        const slideUpOffset = 50; // How much to slide up (px)

        // 1. Animate slide out upwards and fade
        $firstCard.animate({
            top: `-=${slideUpOffset}px`, // Move up
            opacity: 0
        }, 400, 'swing', function() {
            // Animation complete for slide-out

            // 2. Move to end, set initial position for slide-in from above
            $(this)
                .appendTo($container)
                .css({
                    'left': targetLeft,
                    'top': `${parseInt(targetTop) - slideUpOffset}px`, // Start above target
                    'transform': targetScale,
                    'z-index': targetZIndex, // Set z-index immediately
                    'opacity': 0 // Keep hidden initially
                })
                // 3. Animate slide-in to the target (5th card) position
                .animate({
                    top: targetTop,
                    opacity: targetOpacity
                }, 400, 'swing', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    // This allows other cards to transition smoothly via CSS rules
                    $('.container.mascot-container .card.mascot-card').removeAttr('style');
                    // Note: Removing styles from ALL cards ensures CSS :nth-child takes priority
                });
        });
    }

    // Rotate backward (Prev button - brings previous card to front)
    // Adapted from 3D-Card-Carousel-master/main.js logic
    function rotatePrev() {
        var $lastCard = $('.container.mascot-container .card.mascot-card:last-child');
        var $container = $('.container.mascot-container');

        // Target CSS values for the 1st card (resting place for the card moving front)
        const targetLeft = '25px';
        const targetTop = '0px';
        const targetOpacity = 1;
        const targetScale = 'scale(1)';
        const targetZIndex = 10; // z-index for 1st card
        const frontZIndexDuring = 11; // Slightly higher z-index during transition
        const slideUpOffset = 50; // How much to slide up (px)

        // 1. Animate slide out upwards and fade
        // We need to temporarily give it a higher z-index so it slides OUT over others
        $lastCard.css('z-index', frontZIndexDuring).animate({
            top: `-=${slideUpOffset}px`, // Move up
            opacity: 0
        }, 400, 'swing', function() {
            // Animation complete for slide-out

            // 2. Move to beginning, set initial position for slide-in from top
            $(this)
                .prependTo($container)
                .css({
                    'left': targetLeft,
                    'top': `${parseInt(targetTop) - slideUpOffset}px`, // Start above target
                    'transform': targetScale,
                    'z-index': frontZIndexDuring, // Keep high z-index
                    'opacity': 0 // Keep hidden initially
                })
                // 3. Animate slide-in to the target (1st card) position
                .animate({
                    top: targetTop,
                    opacity: targetOpacity
                }, 400, 'swing', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    $('.container.mascot-container .card.mascot-card').removeAttr('style');
                });
        });
    }

    // Initial setup
    $(document).ready(function() {
        resetCardPositions(); // Apply initial CSS positions
        // Update controls visibility based on card count if needed
        if (typeof window.updateCarouselControls === 'function') {
            window.updateCarouselControls(); 
        }
    });

    // Button event listeners
    $('.next-btn').click(function(e) {
        e.preventDefault(); // Prevent default link behavior
        // Add debounce/throttling if needed to prevent rapid clicks
        rotate();
    });

    $('.prev-btn').click(function(e) {
        e.preventDefault(); // Prevent default link behavior
        // Add debounce/throttling if needed
        rotatePrev();
    });

    // Add resize handling
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            resetCardPositions(); 
        }, 250); // Debounce resize event
    });

    // Expose resetCardPositions globally if needed by other scripts (like gemini-mascot.js)
    window.resetCardPositions = resetCardPositions;

    // Function to update carousel control visibility (Example)
    window.updateCarouselControls = function() {
        const cardCount = $('.container.mascot-container .card.mascot-card').length;
        const controls = $('.carousel-controls');
        if (cardCount > 1) {
            controls.show();
        } else {
            controls.hide();
        }
    };

})();
