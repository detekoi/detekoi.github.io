document.addEventListener('DOMContentLoaded', () => {
  const styleInspirationLink = document.getElementById('style-inspiration-link');
  const mascotContainer = document.querySelector('.mascot-container');
  const mascotLoading = document.querySelector('.mascot-loading');

  // Maximum number of AI-generated images to keep
  const MAX_AI_IMAGES = 5;
  
  // Storage key for carousel images
  const STORAGE_KEY = 'mascot_carousel_images';

  if (!styleInspirationLink || !mascotContainer || !mascotLoading) {
    console.error('Required mascot elements not found.');
    return;
  }
  
  // We no longer need the mascotAiDescription element

  // Initialize the local storage for carousel images if it doesn't exist
  let carouselImages = [];
  try {
    const storedImages = localStorage.getItem(STORAGE_KEY);
    if (storedImages) {
      carouselImages = JSON.parse(storedImages);
      console.log(`Loaded ${carouselImages.length} stored AI images`);
    }
  } catch (error) {
    console.error('Error loading stored AI images:', error);
    // Continue with empty array if there's an error
  }

  // Function to add a new image to the carousel
  function addImageToCarousel(imageDataUri, description, addAsFront = false) {
    // Create a new card element
    const newCard = document.createElement('div');
    newCard.classList.add('card', 'mascot-card');
    newCard.dataset.card = ($('.card').length + 1).toString();
    
    // Attempt to parse description as markdown if it contains markdown syntax
    let formattedDescription = description;
    try {
      // Check if the text has markdown-like syntax
      if (description && 
          (description.includes('*') || 
           description.includes('#') || 
           description.includes('_') || 
           description.includes('`') ||
           description.includes('[') ||
           description.includes('>'))) {
        formattedDescription = marked.parse(description);
      }
    } catch (e) {
      console.log('Error parsing markdown, using plain text', e);
      formattedDescription = description;
    }
    
    // Structure the card with both image and description components
    newCard.innerHTML = `
      <div class="image">
        <img src="${imageDataUri}" alt="AI-generated polar bear mascot: ${description}" class="mascot">
      </div>
      <div class="detail">
        ${formattedDescription}
      </div>
    `;
    
    // Add the new card to the container (either at front or end)
    if (addAsFront) {
      // Add as the first child
      if (mascotContainer.firstChild) {
        // First, shift all existing cards back one position
        const existingCards = $('.card').toArray();
        existingCards.forEach((card, index) => {
          // Update position of each card to match the nth-child positions in CSS
          // This ensures cards maintain the cascading effect
          const $card = $(card);
          
          // Apply inline styles that match the CSS nth-child rules but shifted by one
          if (index === 0) {
            // First existing card becomes second
            $card.css({
              'z-index': '9',
              'top': '-10px', 
              'left': '40px',
              'opacity': '0.9'
            });
          } else if (index === 1) {
            // Second existing card becomes third
            $card.css({
              'z-index': '8',
              'top': '-20px',
              'left': '30px', 
              'opacity': '0.8'
            });
          } else if (index === 2) {
            // Third existing card becomes fourth
            $card.css({
              'z-index': '7',
              'top': '-30px',
              'left': '20px',
              'opacity': '0.7'
            });
          } else if (index === 3) {
            // Fourth existing card becomes fifth
            $card.css({
              'z-index': '6',
              'top': '-40px',
              'left': '10px',
              'opacity': '0.5'
            });
          }
        });
        
        mascotContainer.insertBefore(newCard, mascotContainer.firstChild);
      } else {
        mascotContainer.appendChild(newCard);
      }
      
      // No need to update separate description element anymore as it's in the card
    } else {
      // Add at the end
      mascotContainer.appendChild(newCard);
    }
    
    // Add click listener for lightbox if available
    const newImg = newCard.querySelector('.mascot');
    if (newImg && window.showLightbox) {
      newImg.style.cursor = 'pointer';
      newImg.addEventListener('click', () => {
        window.showLightbox(newImg.src, newImg.alt, description);
      });
    }
    
    // Store the image data in local storage
    carouselImages.push({
      imageDataUri,
      description,
      timestamp: Date.now()
    });
    
    // Keep only the MAX_AI_IMAGES most recent images
    if (carouselImages.length > MAX_AI_IMAGES) {
      // Remove the oldest image
      carouselImages.shift();
      
      // Use setTimeout to delay DOM manipulation for better performance
      setTimeout(() => {
        // Also remove the oldest card in the DOM if there are more than MAX_AI_IMAGES
        if ($('.card').length > MAX_AI_IMAGES) {
          $('.card:last-child').remove();
        }
      }, 100);
    }
    
    // Call updateCarouselControls to show controls if more than one card
    if (typeof window.updateCarouselControls === 'function') {
      window.updateCarouselControls();
    }
    
    // Save to localStorage - use timeout to not block UI
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carouselImages));
      } catch (error) {
        console.error('Error saving AI images to localStorage:', error);
      }
    }, 50);
  }

  // Load the existing carousel images from localStorage
  function loadStoredCarouselImages() {
    // If we have stored images, add them to the carousel
    if (carouselImages.length > 0) {
      // Sort images by timestamp (newest first)
      carouselImages.sort((a, b) => b.timestamp - a.timestamp);
      
      // No need to update standalone description anymore since descriptions will be in cards
      
      // Add images with a small delay between each one to improve performance
      const addImageWithDelay = (index) => {
        if (index >= carouselImages.length) return;
        
        const imageData = carouselImages[index];
        
        // Create a new card for each stored image
        const storedCard = document.createElement('div');
        storedCard.classList.add('card', 'mascot-card');
        storedCard.dataset.card = ($('.card').length + 1).toString();
        
        // Attempt to parse description as markdown if it contains markdown syntax
        let formattedDescription = imageData.description;
        try {
          // Check if the text has markdown-like syntax
          if (imageData.description && 
              (imageData.description.includes('*') || 
               imageData.description.includes('#') || 
               imageData.description.includes('_') || 
               imageData.description.includes('`') ||
               imageData.description.includes('[') ||
               imageData.description.includes('>'))) {
            formattedDescription = marked.parse(imageData.description);
          }
        } catch (e) {
          console.log('Error parsing markdown for stored image, using plain text', e);
          formattedDescription = imageData.description;
        }
        
        // Structure the card with both image and description components
        storedCard.innerHTML = `
          <div class="image">
            <img src="${imageData.imageDataUri}" alt="AI-generated polar bear mascot: ${imageData.description}" class="mascot">
          </div>
          <div class="detail">
            ${formattedDescription}
          </div>
        `;
        
        // Add the card to the container (prepend to ensure newest first)
        // For the first image, overwrite the existing card
        if (index === 0 && $('.card').length === 1 && carouselImages.length > 0) {
          // Replace the first card rather than adding a new one
          const firstCard = $('.card:first-child')[0];
          if (firstCard) {
            // Remove the original-mascot class if it exists
            firstCard.classList.remove('original-mascot');
            
            firstCard.innerHTML = storedCard.innerHTML;
            
            // Add click listener for lightbox if available
            const img = firstCard.querySelector('.mascot');
            if (img && window.showLightbox) {
              img.style.cursor = 'pointer';
              img.addEventListener('click', () => {
                window.showLightbox(img.src, img.alt, imageData.description);
              });
            }
          }
        } else {
          // For subsequent images, add new cards
          mascotContainer.insertBefore(storedCard, mascotContainer.firstChild);
          
          // Add click listener for lightbox if available
          const img = storedCard.querySelector('.mascot');
          if (img && window.showLightbox) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
              window.showLightbox(img.src, img.alt, imageData.description);
            });
          }
        }
        
        // Schedule the next image to be added
        setTimeout(() => {
          addImageWithDelay(index + 1);
        }, 20);
      };
      
      // Start the sequential process
      addImageWithDelay(0);
      
      // Update carousel controls after loading all images
      setTimeout(() => {
        if (typeof window.updateCarouselControls === 'function') {
          window.updateCarouselControls();
        }
      }, 100);
    }
  }

  // Set initial container height adjustment function
  function adjustContainerHeight() {
    const firstMascotImg = document.querySelector('.card:first-child .mascot');
    const firstCard = document.querySelector('.card:first-child'); // Get the card element
    
    // Ensure we have the card, the image, and the image's natural dimensions
    if (!firstCard || !firstMascotImg || !firstMascotImg.naturalWidth || !firstMascotImg.naturalHeight) {
      // Exit if we can't calculate; CSS should provide a fallback height
      return; 
    }
    
    // Get the current actual width of the card element
    const currentCardWidth = firstCard.offsetWidth; 

    // Calculate height based on the image's natural aspect ratio and the card's current width
    const aspectRatio = firstMascotImg.naturalHeight / firstMascotImg.naturalWidth;
    const newHeight = Math.round(currentCardWidth * aspectRatio);

    // Apply minimum height constraint
    const minHeight = 150; // Further reduced minimum height
    // Removed maxHeight constraint to allow natural aspect ratio scaling
    
    // Calculate the final height, respecting only the minimum constraint
    const calculatedHeight = Math.max(newHeight, minHeight);
    
    // Set the inline style for the container
    mascotContainer.style.height = `${calculatedHeight}px`; 
  }

  // Store the original container height after initialization (optional, might not be needed anymore)
  let originalContainerHeight;
  
  // Set initial container height
  function setInitialHeight() {
    const firstMascotImg = document.querySelector('.card:first-child .mascot');
    if (!firstMascotImg) return;
    
    if (firstMascotImg.complete) {
      adjustContainerHeight();
      originalContainerHeight = mascotContainer.offsetHeight;
    } else {
      firstMascotImg.addEventListener('load', () => {
        adjustContainerHeight();
        originalContainerHeight = mascotContainer.offsetHeight;
      });
    }
  }

  // Initialize height and load stored images
  setInitialHeight();
  loadStoredCarouselImages();
  
  // Handle browser resize
  window.addEventListener('resize', adjustContainerHeight);

  // Prompt for the Gemini API
  const prompt = "Zoom out full body head-to-toe to reveal that Polar Bear has been fully outfitted by a professional stylist in tasteful designer/vintage outfits, drawn from menswear and womenswear. Inform your choices with subculture/fashion aesthetics. Couture and casual, avant-garde and average. Also, change or remove the neckerchief and dark gray waistline as needed. In brief 140 characters max markdown, as if you have the information at hand, confidently attribute specific designers or brands, even obscure ones (or just 'vintage').";

  // Backend API endpoint URL
  const BACKEND_API_URL = 'api/generate-image';

  // Keep track of image generation state
  let isGeneratingImage = false;

  // Event listener for the style inspiration link
  styleInspirationLink.addEventListener('click', async (e) => {
    e.preventDefault();

    if (isGeneratingImage) return;
    isGeneratingImage = true;

    // --- Start Loading State ---
    styleInspirationLink.style.pointerEvents = 'none'; // Disable further clicks
    styleInspirationLink.style.opacity = '0.7'; // Visual feedback
    mascotLoading.style.display = 'flex'; // Show loading indicator

    // Activate magical background effect if available
    if (window.staticBackground && typeof window.staticBackground.enableMagicMode === 'function') {
      window.staticBackground.enableMagicMode();
    }

    try {
      console.log('Sending image generation request to server...');
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        // Handle error response gracefully
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error || 'Unknown error'}${errorData.details ? ': ' + errorData.details : ''}`;
        } catch (e) {
          errorMessage += ` - ${response.statusText}`;
        }
        throw new Error(errorMessage); // Throw to be caught by the catch block
      }

      const data = await response.json();
      console.log('Received response from server');

      if (data.imageDataUri) {
        console.log('Received new image data URI. Preparing display...');

        // --- Process New Image and Text ---
        const newImageSrc = data.imageDataUri;
        const newDescription = data.textResponse || "Generated a new style!";

        // Preload the new image to get its dimensions
        const tempImg = new Image();
        tempImg.onload = () => {
          console.log(`New image loaded: ${tempImg.width}x${tempImg.height}`);
          
          // Use a series of timeouts to space out the DOM operations
          // First, add the new image to the carousel - adding as the first child
          setTimeout(() => {
            addImageToCarousel(newImageSrc, newDescription, true);
            
            // No need to rotate when adding as first child
            // But we'll force a repaint in case needed
            setTimeout(() => {
              // Force a repaint
              if ($('.card').length > 0) {
                $('.card:first-child').css('opacity', '0.99');
                setTimeout(() => {
                  $('.card:first-child').css('opacity', '1');
                }, 50);
              }
              
              // No need to update separate description since it's in the card
              setTimeout(() => {
                // Hide loading indicator
                mascotLoading.style.display = 'none';
                
                // Reset state after animation finishes
                setTimeout(() => {
                  isGeneratingImage = false;
                  styleInspirationLink.style.pointerEvents = 'auto';
                  styleInspirationLink.style.opacity = '1';
                }, 300);
              }, 200);
            }, 100);
          }, 0);
        };

        tempImg.onerror = () => {
          console.error('Failed to load the received image data URI.');
          handleGenerationError(new Error('Failed to load generated image.'));
        }

        tempImg.src = newImageSrc; // Start loading the image

      } else {
        console.log('No image data received from API.');
        handleGenerationError(new Error("No image data received. Please try again."));
      }
    } catch (error) {
      console.error('Error during mascot generation process:', error);
      handleGenerationError(error);
    }
  });

  // Helper function to handle errors consistently
  function handleGenerationError(error) {
    // Hide loading indicator
    mascotLoading.style.display = 'none';

    // Create an error card instead of using the separate description area
    const errorCard = document.createElement('div');
    errorCard.classList.add('card', 'mascot-card', 'error-card');
    errorCard.dataset.card = "error";
    
    // Use a warning/error icon or placeholder image
    errorCard.innerHTML = `
      <div class="image error-image">
        <div class="error-icon">⚠️</div>
      </div>
      <div class="detail error-detail">
        <p>Failed to generate style: ${error.message}</p>
      </div>
    `;
    
    // Add the error card to the front if no cards exist
    if (mascotContainer.children.length === 0) {
      mascotContainer.appendChild(errorCard);
    } else {
      // Add as the first child
      mascotContainer.insertBefore(errorCard, mascotContainer.firstChild);
      
      // Remove after 5 seconds if there are other cards
      setTimeout(() => {
        if (errorCard.parentNode === mascotContainer) {
          errorCard.remove();
        }
      }, 5000);
    }

    // Reset state after animation
    setTimeout(() => {
      isGeneratingImage = false;
      styleInspirationLink.style.pointerEvents = 'auto';
      styleInspirationLink.style.opacity = '1';
    }, 800);
  }
});
