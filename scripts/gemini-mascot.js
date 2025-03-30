document.addEventListener('DOMContentLoaded', () => {
  const styleInspirationLink = document.getElementById('style-inspiration-link');
  const mascotContainer = document.querySelector('.mascot-container');
  const mascotLoading = document.querySelector('.mascot-loading');
  const mascotAiDescription = document.getElementById('mascot-ai-description');

  // Maximum number of AI-generated images to keep
  const MAX_AI_IMAGES = 5;
  
  // Storage key for carousel images
  const STORAGE_KEY = 'mascot_carousel_images';

  if (!styleInspirationLink || !mascotContainer || !mascotLoading || !mascotAiDescription) {
    console.error('Required mascot elements not found.');
    return;
  }

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
    
    // Structure the card with just the image component
    newCard.innerHTML = `
      <div class="image">
        <img src="${imageDataUri}" alt="AI-generated polar bear mascot: ${description}" class="mascot">
      </div>
    `;
    
    // Add the new card to the container (either at front or end)
    if (addAsFront) {
      // Add as the first child
      if (mascotContainer.firstChild) {
        mascotContainer.insertBefore(newCard, mascotContainer.firstChild);
      } else {
        mascotContainer.appendChild(newCard);
      }
      
      // Update description immediately to match the first card
      mascotAiDescription.textContent = description;
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
      
      // Update description with the newest image description
      if (carouselImages[0] && carouselImages[0].description) {
        mascotAiDescription.textContent = carouselImages[0].description;
        mascotAiDescription.style.display = 'block';
        mascotAiDescription.classList.add('visible');
      }
      
      // Add images with a small delay between each one to improve performance
      const addImageWithDelay = (index) => {
        if (index >= carouselImages.length) return;
        
        const imageData = carouselImages[index];
        
        // Create a new card for each stored image
        const storedCard = document.createElement('div');
        storedCard.classList.add('card', 'mascot-card');
        storedCard.dataset.card = ($('.card').length + 1).toString();
        
        // Structure the card with just the image component
        storedCard.innerHTML = `
          <div class="image">
            <img src="${imageData.imageDataUri}" alt="AI-generated polar bear mascot: ${imageData.description}" class="mascot">
          </div>
        `;
        
        // Add the card to the container (prepend to ensure newest first)
        // For the first image, overwrite the existing card
        if (index === 0 && $('.card').length === 1 && carouselImages.length > 0) {
          // Replace the first card rather than adding a new one
          const firstCard = $('.card:first-child')[0];
          if (firstCard) {
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
  const prompt = "Zoom out full body head-to-toe to reveal that Polar Bear has been fully outfitted by a professional stylist in tasteful designer/vintage outfits, drawn from menswear and womenswear. Inform your choices with subculture/fashion aesthetics. Couture and casual, avant-garde and average. Also, change or remove the neckerchief and dark gray waistline as needed. In a short description, you have the information at hand, so confidently attribute specific designers or brands, even obscure ones (or just 'vintage'). No language like 'possibly,' 'likely,' 'perhaps,' or 'reminiscent of.'";

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
    mascotAiDescription.classList.remove('visible'); // Hide previous description
    mascotAiDescription.style.display = 'none'; // Ensure it's hidden
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
              
              // Then update the description text
              setTimeout(() => {
                // Update the description text below the container
                mascotAiDescription.textContent = newDescription;
                mascotAiDescription.style.display = 'block';
                
                // Hide loading indicator
                mascotLoading.style.display = 'none';
                
                // Finally, add the visible class and reset state
                setTimeout(() => {
                  mascotAiDescription.classList.add('visible');
                  
                  // Reset state after animation likely finishes
                  setTimeout(() => {
                    isGeneratingImage = false;
                    styleInspirationLink.style.pointerEvents = 'auto';
                    styleInspirationLink.style.opacity = '1';
                  }, 300);
                }, 50);
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

    // Display error message in the description area
    mascotAiDescription.textContent = `Failed to generate style: ${error.message}`;
    mascotAiDescription.style.display = 'block';
    setTimeout(() => {
      mascotAiDescription.classList.add('visible');
    }, 10);

    // Reset state after animation
    setTimeout(() => {
      isGeneratingImage = false;
      styleInspirationLink.style.pointerEvents = 'auto';
      styleInspirationLink.style.opacity = '1';
    }, 800);
  }
});
