document.addEventListener('DOMContentLoaded', () => {
  const styleInspirationLink = document.getElementById('style-inspiration-link');
  const mascotContainer = document.querySelector('.mascot-container');

  // Maximum number of AI-generated images to keep
  const MAX_AI_IMAGES = 5;
  
  // Storage key for carousel images
  const STORAGE_KEY = 'mascot_carousel_images';

  // Store reference to the loading card if it exists
  let loadingCardElement = null;

  if (!styleInspirationLink || !mascotContainer) {
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
        // Insert the new card at the front
        mascotContainer.insertBefore(newCard, mascotContainer.firstChild);
      } else {
        mascotContainer.appendChild(newCard);
      }
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
        storedCard.dataset.card = (mascotContainer.querySelectorAll('.card.mascot-card:not(.loading-card)').length + 1).toString();
        
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
          
          // Position each card correctly based on its order
          // Call resetCardPositions after all cards are added to ensure correct positioning
          setTimeout(() => {
            if (typeof window.resetCardPositions === 'function') {
              window.resetCardPositions();
            }
          }, 50);
          
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
      
      // Update carousel controls and positions after loading all images
      setTimeout(() => {
        // Show/hide controls based on card count
        if (typeof window.updateCarouselControls === 'function') {
          window.updateCarouselControls();
        }
        
        // Ensure all cards have proper positioning
        if (typeof window.resetCardPositions === 'function') {
          window.resetCardPositions();
        }
      }, 200); // Increased timeout to ensure images are loaded
    }
  }

  // Initialize and load stored images
  loadStoredCarouselImages();
  
  // Prompt for the Gemini API
  const prompt = "Zoom out full body head-to-toe to reveal that Polar Bear has been fully outfitted by a professional stylist in tasteful designer/vintage outfits, drawn from menswear and womenswear. Black background. Inform your choices with subculture/fashion aesthetics. Couture and casual, avant-garde and average. Also, quietly change or remove the neckerchief and dark gray waistline as needed. In brief 140 characters max markdown, as if you have the information at hand, confidently attribute specific designers or brands, even obscure ones (or just 'vintage').";

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

    // Create and prepend the loading card
    const loadingCardHTML = `
      <div class="card mascot-card loading-card" data-card="loading">
        <div class="image loading-image-placeholder">
          <div class="loading-spinner-inline"></div> 
        </div>
        <div class="detail loading-detail">
          <p>Creating style inspiration...</p>
        </div>
      </div>
    `;
    mascotContainer.insertAdjacentHTML('afterbegin', loadingCardHTML);
    loadingCardElement = mascotContainer.firstChild; // Store reference

    // Reset positions to show the loading card
    if (typeof window.resetCardPositions === 'function') {
      window.resetCardPositions();
    }

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
        // Add detailed logging of the received data
        console.log('Data received:', data);

        // --- Process New Image and Text ---
        const newImageSrc = data.imageDataUri;
        const newDescription = data.textResponse || "Generated a new style!";

        // Preload the new image to get its dimensions
        const tempImg = new Image();
        tempImg.onload = () => {
          console.log(`New image loaded: ${tempImg.width}x${tempImg.height}`);
          
          // Ensure loading card still exists before trying to replace it
          if (loadingCardElement && loadingCardElement.parentNode === mascotContainer) {
            console.log('Loading card found. Replacing content...'); // Added log
            // Format description
            let formattedDescription = newDescription;
            try {
              if (newDescription && (newDescription.includes('*') || newDescription.includes('#') || newDescription.includes('_') || newDescription.includes('`') || newDescription.includes('[') || newDescription.includes('>'))) {
                formattedDescription = marked.parse(newDescription);
              }
            } catch (e) {
              console.log('Error parsing markdown for new image, using plain text', e);
            }

            // ---- COMPLETELY REWRITTEN CARD REPLACEMENT APPROACH ----
            try { 
              console.log('Using new approach: Creating a completely new card');
              
              // Create a brand new card with final content
              const newCard = document.createElement('div');
              newCard.classList.add('card', 'mascot-card');
              // Assign new card number 
              newCard.dataset.card = (mascotContainer.querySelectorAll('.card.mascot-card').length).toString();
              
              // Set the inner HTML directly
              newCard.innerHTML = `
                <div class="image">
                  <img src="${newImageSrc}" alt="AI-generated polar bear mascot: ${newDescription}" class="mascot">
                </div>
                <div class="detail">
                  ${formattedDescription}
                </div>
              `;
              
              // Add click listener for lightbox
              const newImg = newCard.querySelector('.mascot');
              if (newImg && window.showLightbox) {
                newImg.style.cursor = 'pointer';
                newImg.addEventListener('click', () => {
                  window.showLightbox(newImg.src, newImg.alt, newDescription);
                });
              }
              
              // Replace the loading card with the new card
              if (loadingCardElement && loadingCardElement.parentNode === mascotContainer) {
                console.log('Replacing entire loading card element with new card');
                mascotContainer.replaceChild(newCard, loadingCardElement);
              } else {
                // Fallback: Just add the new card to the front
                console.log('Loading card not found, prepending new card');
                mascotContainer.insertBefore(newCard, mascotContainer.firstChild);
              }
              
              loadingCardElement = null; // Clear the reference
              console.log('Card replacement complete');
            
              // Store the image data
              carouselImages.unshift({
                imageDataUri: newImageSrc,
                description: newDescription,
                timestamp: Date.now()
              });
              
              // Trim data array
              while (carouselImages.length > MAX_AI_IMAGES) {
                carouselImages.pop();
              }
              
              // Save to localStorage
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(carouselImages));
              } catch (error) {
                console.error('Error saving AI images to localStorage:', error);
              }
              
              // Update controls
              if (typeof window.updateCarouselControls === 'function') {
                window.updateCarouselControls();
              }
              
              // Reset card positions with a safe timeout
              if (typeof window.resetCardPositions === 'function') {
                console.log('Scheduling resetCardPositions with 150ms timeout');
                setTimeout(() => {
                  try {
                    console.log('Calling resetCardPositions');
                    window.resetCardPositions();
                    console.log('resetCardPositions completed');
                  } catch (e) {
                    console.error('Error in resetCardPositions:', e);
                  }
                }, 150);
              }
              
              // Reset button state
              isGeneratingImage = false;
              styleInspirationLink.style.pointerEvents = 'auto';
              styleInspirationLink.style.opacity = '1';
              
            } catch (error) {
              console.error('Error during card replacement:', error);
              // Even if card replacement fails, at least reset UI state
              isGeneratingImage = false;
              styleInspirationLink.style.pointerEvents = 'auto';
              styleInspirationLink.style.opacity = '1';
            }
            // ---- END COMPLETELY REWRITTEN CARD REPLACEMENT APPROACH ----

          } else {
            // Loading card was removed or doesn't exist - maybe handle differently?
            console.warn("Loading card not found when trying to replace content.");
            // For now, just reset state
            isGeneratingImage = false;
            styleInspirationLink.style.pointerEvents = 'auto';
            styleInspirationLink.style.opacity = '1';
          }
        };

        tempImg.onerror = () => {
          console.error('Failed to load the received image data URI:', newImageSrc); // Log the problematic URI
          // Pass a more specific error message
          handleGenerationError(new Error('Failed to preload generated image.'));
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
    // Remove the loading card if it exists
    if (loadingCardElement && loadingCardElement.parentNode === mascotContainer) {
      loadingCardElement.remove();
      loadingCardElement = null; // Clear reference
      // Reset positions after removing card
      if (typeof window.resetCardPositions === 'function') {
        window.resetCardPositions();
      }
    }

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
          // Reset positions after removing error card
          if (typeof window.resetCardPositions === 'function') {
             window.resetCardPositions();
          }
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
