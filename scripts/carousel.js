// Adapted from 3D-Card-Carousel-master/main.js
// Note: This uses jQuery, similar to previous attempts, not a pure CSS 3D transform.

(function() {
    // Helper function to set initial positions based on CSS
    // This function is NOT part of the original example, but needed
    // because the example relied purely on CSS for initial state.
    function resetCardPositions() {
        // Remove any inline styles from previous animations
        $('.container.mascot-container .card.mascot-card').removeAttr('style');
        // The CSS :nth-child rules will now apply automatically.
    }

    // Rotate forward (Next button)
    function rotate() {
        var $firstCard = $('.container.mascot-container .card.mascot-card:first-child');
        var $container = $('.container.mascot-container');
        
        // Get target CSS values for the *last* visible position (e.g., 5th)
        // These need to match the CSS :nth-child(5) rule or highest visible number
        const targetTop = '-40px'; 
        const targetLeft = '-15px';
        const targetOpacity = 0.5; // Example opacity, adjust if CSS is different
        const targetZIndex = 6;    // Example z-index, adjust if CSS is different

        // 1. Animate slide out upwards (adjust values as needed)
        $firstCard.animate({
            top: '-=50px',
            opacity: 0
        }, 400, 'swing', function() {
            // 2. Move to end, set initial position for slide-in from above
            $(this)
                .appendTo($container) // Ensure it's appended to the correct container
                .css({
                    // Start above the final position
                    'top': (parseInt(targetTop) - 50) + 'px', 
                    'left': targetLeft,
                    'z-index': targetZIndex -1, // Start behind final z-index
                    'opacity': 0
                })
                // 3. Animate slide-in to the last visible position
                .animate({
                    top: targetTop,
                    opacity: targetOpacity
                }, 400, 'swing', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    $(this).removeAttr('style');
                    // Optional: A final reset might be needed if CSS transitions interfere
                    // resetCardPositions(); 
                });
            
            // Update the positions of the remaining cards using CSS transitions
            // by briefly removing and re-adding a class, or triggering reflow.
            // Simplest: Remove inline styles, let CSS :nth-child re-apply.
            $('.container.mascot-container .card.mascot-card:not(:last-child)').removeAttr('style');
        });
    }

    // Rotate backward (Prev button)
    function rotatePrev() {
        var $lastCard = $('.container.mascot-container .card.mascot-card:last-child');
        var $container = $('.container.mascot-container');

        // Get target CSS values for the *first* position (from :nth-child(1))
        const targetTop = '0px';
        const targetLeft = '25px';
        const targetOpacity = 1;
        const targetZIndex = 10;

        // 1. Prepare the last card: Set its z-index high and initial position
        // Move instantly to a starting position slightly above and behind final left
        $lastCard.css({
            'top': '-50px',
            'left': (parseInt(targetLeft) - 10) + 'px',
            'z-index': targetZIndex + 1, // Ensure it's above others during move
            'opacity': 0
        });

        // 2. Move to beginning of DOM order
        $lastCard.prependTo($container);

        // 3. Update styles of other cards so they transition back
        // Remove inline styles, let CSS :nth-child re-apply.
        $('.container.mascot-container .card.mascot-card:not(:first-child)').removeAttr('style');

        // 4. Animate the new first card into place
        $lastCard.animate({
            top: targetTop,
            left: targetLeft,
            opacity: targetOpacity
        }, 400, 'swing', function() {
            // 5. Animation complete: remove inline styles so CSS takes over
            $(this).removeAttr('style');
            // Optional: Final reset
            // resetCardPositions();
        });
    }

    // Initial setup
    $(document).ready(function() {
        resetCardPositions(); // Apply initial CSS positions
        // You might need to update controls visibility based on card count here
    });

    // Button event listeners
    $('.next-btn').click(function(e) {
        e.preventDefault(); // Prevent default link behavior
        rotate();
    });

    $('.prev-btn').click(function(e) {
        e.preventDefault(); // Prevent default link behavior
        rotatePrev();
    });

    // Add resize handling if necessary (using resetCardPositions)
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Temporarily disable transitions for instant repositioning
            $('.container.mascot-container').addClass('no-transition'); 
            resetCardPositions();
            // Restore transitions after a short delay
            // Use a slightly longer delay to ensure styles are applied
            setTimeout(() => $('.container.mascot-container').removeClass('no-transition'), 100); 
        }, 250); // Debounce resize event
    });

})();
