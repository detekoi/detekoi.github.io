(function() {
    var rotate, rotatePrev;

    rotate = function() {
        // Move the first card to the end with a slide-out animation
        var $firstCard = $('.card:first-child');
        
        // 1. Animate slide out with shadow transition matching portfolio aesthetic
        $firstCard.animate({
            top: '-=50px', // Move up
            opacity: 0, // Fade out while sliding
            boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)' // Remove shadow during transition
        }, 400, 'swing', function() {
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
                    boxShadow: isDarkMode() ? 
                              '8px 8px 0 rgba(255, 255, 255, 0.33)' : // Dark mode shadow
                              '8px 8px 0 #333333'                      // Light mode shadow
                }, 400, 'swing', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    $(this).removeAttr('style');
                });
        });
    };

    rotatePrev = function() {
        var $lastCard = $('.card:last-child');

        // 1. Animate slide out upwards
        $lastCard.animate({
            top: '-=50px', // Move up
            opacity: 0,    // Fade out
            boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)' // Remove shadow during transition
        }, 400, 'swing', function() {
            // Animation complete for slide-out

            // 2. Move to beginning, set initial position for slide-in from top
            $(this)
                .prependTo('.container')
                .css({
                    'left': '25px',  // Target left for 1st card
                    'top': '-50px',  // Start above the final position
                    'z-index': 11,   // Higher z-index initially
                    'opacity': 0,    // Keep hidden initially
                    'box-shadow': '0px 0px 0px rgba(0, 0, 0, 0)' // Start with no shadow
                })
                // 3. Animate slide-in to the 1st card position
                .animate({
                    top: '0px',      // Target top for 1st card
                    opacity: 1,      // Target opacity for 1st card
                    boxShadow: isDarkMode() ? 
                              '8px 8px 0 rgba(255, 255, 255, 0.33)' : // Dark mode shadow
                              '8px 8px 0 #333333'                      // Light mode shadow
                }, 400, 'swing', function() {
                    // 4. Animation complete: remove inline styles so CSS takes over
                    $(this).removeAttr('style');
                });
        });
    };

    // Helper function to detect dark mode
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Listen for dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Ensure the current card has the right shadow style if needed
        $('.card:first-child').removeAttr('style');
    });

    // Button event listeners
    $('.next-btn').click(function() {
        return rotate();
    });

    $('.prev-btn').click(function() {
        return rotatePrev();
    });

    // Optional: Add keyboard navigation
    $(document).keydown(function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            rotatePrev();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            rotate();
        }
    });

}).call(this);
