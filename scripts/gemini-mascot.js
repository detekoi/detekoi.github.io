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

  // --- Loading Card Static Effect ---
  let loadingStaticAnimationId = null;
  const loadingStaticConfig = {
      pixelSize: 1,       // Larger pixels
      density: 3,       // Increased density for card
      baseAlpha: 1,     // Increased alpha
      alphaVariance: 0.15,
      darkIntensityMin: 50,
      darkIntensityMax: 110,
      lightIntensityMin: 120,
      lightIntensityMax: 210,
      frameInterval: 35, // Faster frame rate (~28fps)
  };
  let lastLoadingFrameTime = 0;
  let drawLogCounter = 0; // Add a counter

  function drawLoadingStatic(ctx, canvas, isDarkMode) {
      const now = performance.now();
      // Frame rate limiting
      if (now - lastLoadingFrameTime < loadingStaticConfig.frameInterval) {
          loadingStaticAnimationId = requestAnimationFrame(() => drawLoadingStatic(ctx, canvas, isDarkMode));
          return;
      }
      lastLoadingFrameTime = now;
      if (drawLogCounter % 60 === 0) { // Log roughly once per second
          // console.log(`[drawLoadingStatic] Loop running... Canvas internal: ${canvas.width}x${canvas.height}, Client: ${canvas.clientWidth}x${canvas.clientHeight}`);
      }
      drawLogCounter++;

      // --- Check and Sync Canvas Dimensions ---
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      // Check if the internal size matches the display size.
      // Also check if display size is valid (> 0)
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          if (displayWidth > 0 && displayHeight > 0) {
              canvas.width = displayWidth;
              canvas.height = displayHeight;
              // console.log(`[drawLoadingStatic] Synced canvas internal size to: ${canvas.width}x${canvas.height}`);
          } else {
              // Still no valid display size, skip drawing this frame
              // console.warn(`[drawLoadingStatic] Invalid display dimensions (${displayWidth}x${displayHeight}), skipping frame.`);
              loadingStaticAnimationId = requestAnimationFrame(() => drawLoadingStatic(ctx, canvas, isDarkMode));
              return;
          }
      }
      // If dimensions are still 0 after sync attempt, skip.
      if (canvas.width === 0 || canvas.height === 0) {
         // console.warn(`[drawLoadingStatic] Zero dimensions after sync check, skipping frame.`);
         loadingStaticAnimationId = requestAnimationFrame(() => drawLoadingStatic(ctx, canvas, isDarkMode));
         return;
      }
      // ---------------------------------------

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simplified static drawing - only base layer needed
      // Adjusted divisor for smaller area
      const baseStaticDots = Math.floor((canvas.width * canvas.height) / 80 * loadingStaticConfig.density);

      for (let i = 0; i < baseStaticDots; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;

          let intensity;
          if (isDarkMode) {
              intensity = loadingStaticConfig.darkIntensityMin + Math.random() * (loadingStaticConfig.darkIntensityMax - loadingStaticConfig.darkIntensityMin);
          } else {
              intensity = loadingStaticConfig.lightIntensityMin + Math.random() * (loadingStaticConfig.lightIntensityMax - loadingStaticConfig.lightIntensityMin);
          }
          intensity = Math.floor(intensity);

          const alpha = loadingStaticConfig.baseAlpha + (Math.random() - 0.5) * loadingStaticConfig.alphaVariance;

          ctx.fillStyle = `rgba(${intensity}, ${intensity}, ${intensity}, ${alpha})`;
           // Ensure drawing happens *within* the canvas bounds
           if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
              ctx.fillRect(x, y, loadingStaticConfig.pixelSize, loadingStaticConfig.pixelSize);
           }
      }

      loadingStaticAnimationId = requestAnimationFrame(() => drawLoadingStatic(ctx, canvas, isDarkMode));
  }

  function startLoadingStatic(canvasElement) {
      if (!canvasElement) {
          // console.error("[startLoadingStatic] No canvas element provided.");
          return;
      }
      // console.log('[startLoadingStatic] Found canvas element:', canvasElement);
      // console.log(`[startLoadingStatic] Initial offset dimensions: ${canvasElement.offsetWidth}x${canvasElement.offsetHeight}`);

      // Delay getting context slightly to ensure dimensions might be available
      setTimeout(() => {
          let ctx;
          try { // Add try-catch as canvas might be gone by now
              ctx = canvasElement.getContext('2d');
          } catch (e) {
              console.error("Could not get 2D context for loading static canvas (maybe removed?).", e);
              return;
          }

          if (!ctx) {
             // console.error("Could not get 2D context for loading static canvas.");
             return;
          }
          // console.log('[startLoadingStatic] Got 2D context (inside timeout).');

          const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          let isDarkMode = darkModeMediaQuery.matches;

          const updateMode = (event) => {
              isDarkMode = event.matches;
          };
          darkModeMediaQuery.addEventListener('change', updateMode);

          // Clear any previous animation frame
          if (loadingStaticAnimationId) {
              cancelAnimationFrame(loadingStaticAnimationId);
          }

          // Start the drawing loop
          lastLoadingFrameTime = 0; // Reset frame timer
          loadingStaticAnimationId = requestAnimationFrame(() => drawLoadingStatic(ctx, canvasElement, isDarkMode));
          // console.log('[startLoadingStatic] requestAnimationFrame scheduled (inside timeout).');

          // Store cleanup logic associated with this canvas instance
          canvasElement.stopAnimation = () => {
              // console.log('[stopLoadingStatic] Running stopAnimation for canvas:', canvasElement); // Add log
              if (loadingStaticAnimationId) {
                  cancelAnimationFrame(loadingStaticAnimationId);
                  loadingStaticAnimationId = null;
              }
              darkModeMediaQuery.removeEventListener('change', updateMode);
               // Clear the canvas when stopped
               if(ctx && canvasElement && canvasElement.width > 0 && canvasElement.height > 0) {
                   try { // Add try-catch as canvas might be gone
                       ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                   } catch (e) {
                       console.warn("Could not clear loading canvas, possibly already removed.");
                   }
               }
          };
      }, 50); // Reinstate 50ms delay
  }

  function stopLoadingStatic(canvasElement) {
       if (canvasElement && typeof canvasElement.stopAnimation === 'function') {
           canvasElement.stopAnimation();
       } else if (loadingStaticAnimationId) {
           // Fallback if the specific stop function isn't found but an ID exists
           cancelAnimationFrame(loadingStaticAnimationId);
           loadingStaticAnimationId = null;
           console.warn("Stopped loading static using fallback ID clear.");
       } else {
           // console.log("stopLoadingStatic called but no active animation or element found.");
       }
  }
  // --- End Loading Card Static Effect ---

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

  // --- Helper: Get AI cards (excluding original and loading) ---
  function getAiCards() {
    return Array.from(mascotContainer.querySelectorAll('.card.mascot-card:not(.original-mascot):not(.loading-card)'));
  }
  // ----------------------------------------------------------

  // Load the existing carousel images from localStorage
  function loadStoredCarouselImages() {
    // Find the original mascot card defined in HTML
    const originalCard = mascotContainer.querySelector('.card.mascot-card.original-mascot');
    if (!originalCard) {
        console.warn("Original mascot card not found in HTML. Cannot load stored images correctly.");
        // Decide how to handle this - maybe just load AI images normally?
        // For now, let's proceed but log the warning.
    }

    // Clear any existing non-original, non-loading AI cards first to prevent duplication
    getAiCards().forEach(card => card.remove());

    // If we have stored AI images, add them
    if (carouselImages.length > 0) {
        // Sort images by timestamp (newest first) - already happens when loading from storage
        carouselImages.sort((a, b) => b.timestamp - a.timestamp);

        // Keep only up to MAX_AI_IMAGES
        carouselImages = carouselImages.slice(0, MAX_AI_IMAGES);

        console.log(`Loading max ${MAX_AI_IMAGES} AI images into carousel...`);

        // Add AI images sequentially before the original card
        const addImageWithDelay = (index) => {
            if (index >= carouselImages.length) {
                // All AI images loaded, finalize setup
                finalizeCarouselSetup();
                return;
            }

            const imageData = carouselImages[index];

            // Create a new card for the stored AI image
            const storedCard = document.createElement('div');
            storedCard.classList.add('card', 'mascot-card'); // No 'original-mascot' class
            // Note: data-card attribute might become inconsistent, relying on order mostly.

            let formattedDescription = imageData.description;
            try {
                if (imageData.description && (imageData.description.includes('*') || imageData.description.includes('#') || imageData.description.includes('_') || imageData.description.includes('`') || imageData.description.includes('[') || imageData.description.includes('>'))) {
                    formattedDescription = marked.parse(imageData.description);
                }
            } catch (e) {
                console.log('Error parsing markdown for stored image, using plain text', e);
            }

            storedCard.innerHTML = `
                <div class="image">
                    <img src="${imageData.imageDataUri}" alt="AI-generated polar bear mascot: ${imageData.description}" class="mascot">
                </div>
                <div class="detail">
                    ${formattedDescription}
                </div>
            `;

            // Add click listener for lightbox
            const img = storedCard.querySelector('.mascot');
            if (img && window.showLightbox) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    window.showLightbox(img.src, img.alt, imageData.description);
                });
            }

            // Insert the AI card BEFORE the original card (or at the beginning if original isn't found)
            if (originalCard && originalCard.parentNode === mascotContainer) {
                mascotContainer.insertBefore(storedCard, originalCard);
            } else {
                mascotContainer.appendChild(storedCard); // Fallback: add to end if original missing
            }

            // Schedule the next image
            setTimeout(() => addImageWithDelay(index + 1), 20); // Keep delay
        };

        // Start adding AI images
        addImageWithDelay(0);

    } else {
        console.log("No stored AI images found to load.");
        // If no AI images, just finalize with potentially only the original card
        finalizeCarouselSetup();
    }
  }

  // --- Helper function to call after images are loaded/or if none exist ---
  function finalizeCarouselSetup() {
      console.log("Finalizing carousel setup...");
      // Update carousel controls and positions after loading all images
      setTimeout(() => {
          // Show/hide controls based on total card count (including original)
          if (typeof window.updateCarouselControls === 'function') {
              window.updateCarouselControls();
          }

          // Ensure all cards have proper positioning
          if (typeof window.resetCardPositions === 'function') {
              window.resetCardPositions();
          }
      }, 200); // Keep timeout
  }

  // Initialize and load stored images
  loadStoredCarouselImages(); // Call the modified loading function
  
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
    console.log('[Event Listener] Creating loading card HTML...');

    // Create and prepend the loading card - UPDATED HTML
    const loadingCardHTML = `
      <div class="card mascot-card loading-card" data-card="loading">
        <div class="image loading-image-placeholder">
          <canvas class="loading-static-canvas"></canvas> <!-- Use canvas -->
        </div>
        <div class="detail loading-detail">
          <p>Creating style inspiration...</p>
        </div>
      </div>
    `;
    mascotContainer.insertAdjacentHTML('afterbegin', loadingCardHTML);
    loadingCardElement = mascotContainer.querySelector('.loading-card'); // Store reference using class
    console.log('[Event Listener] Loading card added to DOM:', loadingCardElement);

    // --- Start Static Effect ---
    const loadingCanvas = loadingCardElement.querySelector('.loading-static-canvas');
    if (loadingCanvas) {
        startLoadingStatic(loadingCanvas);
    } else {
        console.error("Could not find loading canvas element after adding loading card.");
    }
    // -------------------------

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
              
              // Find the loading card *before* trying to stop its animation or replace it
              const currentLoadingCard = mascotContainer.querySelector('.card.mascot-card.loading-card'); // Find it now

              // --- Stop Static Effect ---
              const canvasToStop = currentLoadingCard ? currentLoadingCard.querySelector('.loading-static-canvas') : null;
              if (canvasToStop) {
                  stopLoadingStatic(canvasToStop);
              } else {
                 // Fallback: try finding any loading canvas if the specific reference failed
                 const fallbackCanvas = mascotContainer.querySelector('.loading-card .loading-static-canvas');
                 if (fallbackCanvas) stopLoadingStatic(fallbackCanvas);
                 else console.warn('Could not find loading canvas to stop before replacement.');
              }
              // -------------------------

              // Replace the loading card with the new card
              if (currentLoadingCard) { // Check if we found it
                console.log('Replacing found loading card element with new card', currentLoadingCard);
                mascotContainer.replaceChild(newCard, currentLoadingCard);
                loadingCardElement = null; // Clear reference after successful replacement
              } else {
                // Fallback: Just add the new card to the front if loading card wasn't found
                console.warn('Could not find loading card element to replace, prepending new card instead.');
                mascotContainer.insertBefore(newCard, mascotContainer.firstChild);
                loadingCardElement = null; // Clear reference here too
              }
              
              // --- Manage AI Images & Local Storage ---
              // Add new image data to the START of the tracked AI images
              carouselImages.unshift({
                imageDataUri: newImageSrc,
                description: newDescription,
                timestamp: Date.now()
              });

              // Keep only the allowed number of AI images in the array
              while (carouselImages.length > MAX_AI_IMAGES) {
                carouselImages.pop(); // Remove the oldest from the array
              }

              // Remove the oldest AI card from the DOM if necessary
              const aiCardsInDom = getAiCards();
              if (aiCardsInDom.length > MAX_AI_IMAGES) {
                  // Find the last AI card in the DOM (oldest visually, assuming prepend)
                  const oldestAiCardInDom = aiCardsInDom[aiCardsInDom.length - 1];
                  if (oldestAiCardInDom) {
                      console.log("Removing oldest AI card from DOM:", oldestAiCardInDom);
                      oldestAiCardInDom.remove();
                  }
              }
              // ------------------------------------------

              // Save the updated AI images array to localStorage
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
    // --- Stop Static Effect ---
    // Find the loading card *specifically* to stop its canvas
    const currentLoadingCard = mascotContainer.querySelector('.loading-card'); // Re-find it here
    const canvasToStop = currentLoadingCard ? currentLoadingCard.querySelector('.loading-static-canvas') : null;
     if (canvasToStop) {
         stopLoadingStatic(canvasToStop);
     } else {
         // Fallback if specific loading card/canvas not found
         const fallbackCanvas = mascotContainer.querySelector('.loading-card .loading-static-canvas');
         if (fallbackCanvas) stopLoadingStatic(fallbackCanvas);
         else console.warn('Could not find loading canvas to stop in error handler.');
     }
    // -------------------------

    // Remove the loading card if it exists
    if (currentLoadingCard && currentLoadingCard.parentNode === mascotContainer) {
      currentLoadingCard.remove();
      // Don't nullify loadingCardElement here, it might be needed elsewhere if error handling changes
    }
    loadingCardElement = null; // Clear the global reference AFTER attempting removal

    // Reset positions if needed AFTER removing card
    if (typeof window.resetCardPositions === 'function') {
        setTimeout(() => window.resetCardPositions(), 50); // Add small delay
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
    
    // Add the error card to the front if no cards exist OR only the original exists
    const existingCards = mascotContainer.querySelectorAll('.card.mascot-card:not(.error-card)');
    if (existingCards.length === 0 || (existingCards.length === 1 && existingCards[0].classList.contains('original-mascot'))) {
      mascotContainer.appendChild(errorCard);
    } else {
      // Add as the first child (before potentially existing AI cards or original)
      mascotContainer.insertBefore(errorCard, mascotContainer.firstChild);

      // Remove after 5 seconds
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

    // Reset state after animation/timeout
    setTimeout(() => {
      isGeneratingImage = false;
      styleInspirationLink.style.pointerEvents = 'auto';
      styleInspirationLink.style.opacity = '1';
    }, 800); // Keep existing timeout
  }
});
