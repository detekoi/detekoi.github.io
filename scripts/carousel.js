/**
 * 3D Stacking Carousel Implementation
 * Modern vanilla JS with elegant 3D card stacking animations
 * Compatible with Gemini mascot generation
 */

document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.mascot-container');

  if (!container) return;

  // Get all cards (function to allow dynamic updates)
  function getCards() {
    return Array.from(container.querySelectorAll('.mascot-card'));
  }

  // Update card positions based on their index
  function updateCardPositions() {
    const cards = getCards();

    cards.forEach((card, index) => {
      // Remove any previous position classes
      card.classList.remove('card-pos-0', 'card-pos-1', 'card-pos-2', 'card-pos-3', 'card-pos-4');

      // Only first card is visible
      if (index === 0) {
        card.classList.add('card-pos-0');
      } else {
        card.classList.add(`card-pos-${Math.min(index, 4)}`);
      }
    });

    updateToggles();
  }

  // Update toggle squares
  function updateToggles() {
    const cards = getCards();
    const wrapper = document.querySelector('.carousel-wrapper');

    // Remove existing toggles container
    let togglesContainer = wrapper.querySelector('.carousel-toggles');
    if (togglesContainer) {
      togglesContainer.remove();
    }

    // Only show toggles if there's more than one card
    if (cards.length > 1) {
      togglesContainer = document.createElement('div');
      togglesContainer.className = 'carousel-toggles';

      cards.forEach((card, index) => {
        const toggle = document.createElement('button');
        toggle.className = 'carousel-toggle';
        if (index === 0) toggle.classList.add('active');

        // Get caption text from the card
        const detail = card.querySelector('.detail, .loading-detail');
        const captionText = detail ? detail.textContent.trim() : `Image ${index + 1}`;
        toggle.textContent = captionText;

        toggle.addEventListener('click', () => {
          // Move clicked card to front by rotating the needed number of times
          const currentCards = getCards();
          const targetIndex = currentCards.indexOf(card);

          if (targetIndex > 0) {
            for (let i = 0; i < targetIndex; i++) {
              rotateNext();
            }
          }
        });

        togglesContainer.appendChild(toggle);
      });

      // Insert toggles after mascot container (order: 2)
      const mascotContainer = wrapper.querySelector('.mascot-container');
      mascotContainer.insertAdjacentElement('afterend', togglesContainer);
    }
  }

  // Rotate forward (next button)
  function rotateNext() {
    const cards = getCards();
    if (cards.length <= 1) return;

    const firstCard = cards[0];

    // Move card to end
    container.appendChild(firstCard);

    // Update all card positions
    updateCardPositions();
  }

  // Rotate backward (prev button)
  function rotatePrev() {
    const cards = getCards();
    if (cards.length <= 1) return;

    const lastCard = cards[cards.length - 1];

    // Move to beginning
    container.insertBefore(lastCard, cards[0]);

    // Update positions
    updateCardPositions();
  }

  // Setup lightbox for mascot images
  function setupLightbox() {
    const cards = getCards();

    cards.forEach(card => {
      const img = card.querySelector('.image img');
      const detail = card.querySelector('.detail, .loading-detail');

      if (img) {
        // Remove old listeners by cloning
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);

        newImg.addEventListener('click', (e) => {
          e.stopPropagation();
          const descriptionText = detail ? detail.textContent.trim() : newImg.alt;
          if (window.showLightbox) {
            window.showLightbox(newImg.src, newImg.alt, descriptionText);
          }
        });
      }
    });
  }

  // Initialize positions and lightbox
  updateCardPositions();
  setupLightbox();

  // Re-setup lightbox when cards are updated (for Gemini integration)
  const originalUpdatePositions = updateCardPositions;
  updateCardPositions = function() {
    originalUpdatePositions();
    setupLightbox();
  };

  // Expose functions globally for Gemini mascot integration
  window.updateCarouselPositions = updateCardPositions;
  window.updateCarouselControls = updateCardPositions; // Alias for compatibility
  window.resetCardPositions = updateCardPositions; // Alias for compatibility
});
