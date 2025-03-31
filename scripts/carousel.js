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
    function rotate() {
        var $firstCard = $('.container.mascot-container .card.mascot-card:first-child');
        var $container = $('.container.mascot-container');

        // Disable transitions temporarily on the card being animated out
        // to avoid conflicting with the jQuery animation.
        $firstCard.addClass('no-transition');

        // 1. Animate the first card out (e.g., slightly up/left and fade)
        $firstCard.animate({
            top: '-=20px',
            left: '-=20px',
            opacity: 0
        }, 400, 'swing', function() {
            // Animation complete callback:
            // 2. Move the card to the end of the container in the DOM
            $(this).appendTo($container);

            // 3. Remove all inline styles from ALL cards. This allows CSS
            //    :nth-child rules and transitions to take over for repositioning.
            $('.container.mascot-container .card.mascot-card').removeAttr('style');
            // Re-enable transitions on the card that just moved (now last)
            $container.find('.card.mascot-card:last-child').removeClass('no-transition');
        });
    }

    // Rotate backward (Prev button - brings previous card to front)
    function rotatePrev() {
        var $lastCard = $('.container.mascot-container .card.mascot-card:last-child');
        var $container = $('.container.mascot-container');

        // Disable transitions temporarily on the card being animated out.
        $lastCard.addClass('no-transition');

        // 1. Animate the last card out (e.g., slightly down/right and fade)
        //    This assumes it's coming from the back-right position.
        $lastCard.animate({
            top: '+=20px', 
            left: '+=20px',
            opacity: 0
        }, 400, 'swing', function() {
            // Animation complete callback:
            // 2. Move the card to the beginning of the container in the DOM
            $(this).prependTo($container);

            // 3. Remove all inline styles from ALL cards. CSS :nth-child rules
            //    and transitions will handle repositioning.
            $('.container.mascot-container .card.mascot-card').removeAttr('style');
             // Re-enable transitions on the card that just moved (now first)
            $container.find('.card.mascot-card:first-child').removeClass('no-transition');
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
        // Add no-transition class immediately to prevent flicker during resize
        $('.container.mascot-container').addClass('no-transition');
        resizeTimer = setTimeout(function() {
            resetCardPositions(); 
            // Remove the class after a short delay to re-enable transitions
            // Use a slightly longer delay to ensure styles are applied
            setTimeout(() => $('.container.mascot-container').removeClass('no-transition'), 100); 
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
