(function() {
    // Helper function to detect dark mode
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Helper function to get calculated positions/styles for a card index
    function getCardStyle(index) {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 575;

        let leftPositions = [50, 40, 30, 20, 10]; // Desktop default
        let topPositions = [0, -10, -20, -30, -40]; // Top positions
        let opacities = [1, 0.9, 0.8, 0.7, 0.5]; // Opacity values
        
        if (isMobile) {
            leftPositions = [30, 20, 10, 0, -10]; // Tablet/Mobile
        }
        
        if (isSmallMobile) {
            leftPositions = [25, 15, 5, -5, -15]; // Small Mobile
        }

        const posIndex = Math.min(index, 4); // Cap at 4 (5th position)
        const zIndex = 10 - Math.min(index, 4);
        
        const boxShadow = index === 0 ? 
            'none' // Let CSS handle front card shadow for hover/active
            : (isDarkMode() ? 
               '8px 8px 0 var(--shadow-color)' : // Dark mode shadow for other cards
               '8px 8px 0 var(--color-border)'); // Light mode shadow for other cards

        return {
            'z-index': zIndex,
            'top': topPositions[posIndex] + 'px',
            'left': leftPositions[posIndex] + 'px',
            'opacity': opacities[posIndex],
            'box-shadow': boxShadow
        };
    }

    // Define rotate function to move card from front to back
    function rotate() {
        if ($('.card.animating').length > 0) {
            console.log('Animation in progress, skipping rotation');
            return;
        }

        var $firstCard = $('.card:first-child');
        if ($firstCard.length === 0) return; // No card to rotate
        $firstCard.addClass('animating'); 
        
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 575;
        
        let targetLeft = '10px'; 
        let targetTopInit = '-90px'; 
        let targetTopFinal = '-40px'; 
        
        if (isMobile) targetLeft = '-10px'; 
        if (isSmallMobile) targetLeft = '-15px'; 

        $firstCard.animate({
            top: '-=50px', 
            opacity: 0     
        }, 400, 'swing', function() {
            const $cardToAnimate = $(this); // Store reference

            $cardToAnimate
                .appendTo('.container')
                .css({
                    'left': targetLeft, 
                    'top': targetTopInit,
                    'z-index': '5',     
                    'opacity': '0'       
                });

            // Update stack styles for background cards NOW
            updateStackStyles(); 

            // Animate the moved card into its final position
            $cardToAnimate.animate({
                top: targetTopFinal, 
                opacity: 0.5        
            }, 400, 'swing', function() {
                // Animation complete
                $(this).removeAttr('style').removeClass('animating'); 
                // Final style update to ensure consistency
                updateStackStyles();
            });
        });
    }

    // Define rotatePrev function to move card from back to front
    function rotatePrev() {
        if ($('.card.animating').length > 0) {
            console.log('Animation in progress, skipping rotation');
            return;
        }
        
        var $lastCard = $('.card:last-child');
        if ($lastCard.length === 0 || $('.card').length <= 1) {
             console.log('Not enough cards or no last card found');
             return;
        }
        $lastCard.addClass('animating');
        
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 575;
        
        let targetLeft = '50px'; 
        let targetTopInit = '-50px'; 
        
        if (isMobile) targetLeft = '30px';
        if (isSmallMobile) targetLeft = '25px'; 
        
        // Get final style for the *new* front card position before animating out
        const finalFrontStyle = getCardStyle(0); 

        // Animate slide out upwards
        $lastCard.animate({
            top: '-=' + (50 + Math.abs(parseInt($lastCard.css('top') || '0'))) + 'px',
            opacity: 0     
        }, 400, 'swing', function() {
            const $cardToAnimate = $(this); // Store reference to the card
            
            // Move to beginning, set initial position for slide-in
            $cardToAnimate
                .prependTo('.container')
                .css({
                    'left': targetLeft,  
                    'top': targetTopInit,
                    'z-index': '11',
                    'opacity': '0'      
                });

            // Update positions for the rest of the stack NOW
            updateStackStyles();

            // Animate slide-in to the first card position (NO DELAY)
            $cardToAnimate.animate({
                top: finalFrontStyle.top,
                opacity: finalFrontStyle.opacity
            }, 400, 'swing', function() {
                // Animation complete: remove inline styles and animating class
                $(this).removeAttr('style').removeClass('animating'); 
                
                // Re-apply final styles after animation
                updateStackStyles();
            });
        });
    }

    // Function to apply calculated styles to the current card stack
    function updateStackStyles() {
        $('.card:not(.animating)').each(function(index) {
            const style = getCardStyle(index);
            $(this).css(style);
        });
    }

    // Function to reset card positions (used on load, resize, theme change)
    function resetCardPositions() {
        $('.card').removeClass('animating'); // Ensure no lingering animating class
        updateStackStyles(); // Apply styles based on current order
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
    window.resetCardPositions = resetCardPositions; // Keep exposed for resize/theme changes etc.

    // Call initially to set up controls visibility and positions
    $(document).ready(function() {
        updateCarouselControls();
        resetCardPositions(); // Use reset for initial full setup
        
        // Add resize listener to reposition cards
        let resizeTimer;
        $(window).on('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // Temporarily remove transition for instant repositioning on resize
                $('.container').addClass('no-transition'); 
                resetCardPositions();
                // Restore transition after a short delay
                setTimeout(() => $('.container').removeClass('no-transition'), 50); 
            }, 250); // Debounce resize event
        });
    });

    // Listen for dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Clear any inline styles that might conflict with theme change
        $('.card').each(function() {
            if ($(this).attr('style')) {
                $(this).removeAttr('style');
            }
        });
        // Re-apply positions based on the new theme
        resetCardPositions(); 
    });

    // Button event listeners
    $('.next-btn').click(function() {
        rotate();
        return false; 
    });

    $('.prev-btn').click(function() {
        rotatePrev();
        return false;
    });

    // Optional: Add keyboard navigation
    $(document).keydown(function(e) {
        if ($('.card').length > 1 && !$('.card.animating').length) { // Only if multiple cards and not animating
             if (e.key === 'ArrowRight') { 
                 rotate();
                 e.preventDefault(); // Prevent page scroll
             } else if (e.key === 'ArrowLeft') {
                 rotatePrev();
                 e.preventDefault(); // Prevent page scroll
             }
         }
    });

})();
