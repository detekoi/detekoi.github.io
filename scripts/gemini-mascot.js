document.addEventListener('DOMContentLoaded', () => {
  const styleInspirationLink = document.getElementById('style-inspiration-link');
  const mascotContainer = document.querySelector('.mascot-container');
  const mascotCard = document.querySelector('.mascot-card');
  const mascotImage = document.querySelector('.mascot'); // The main image on the front
  const mascotLoading = document.querySelector('.mascot-loading');
  const mascotAiDescription = document.getElementById('mascot-ai-description'); // The description div below container

  if (!styleInspirationLink || !mascotContainer || !mascotCard || !mascotImage || !mascotLoading || !mascotAiDescription) {
    console.error('Required mascot elements not found.');
    return;
  }

  // Set initial container height based on image dimensions
  function setInitialHeight() {
    if (mascotImage.complete) {
      adjustContainerHeight();
    } else {
      mascotImage.addEventListener('load', adjustContainerHeight);
    }
  }

  function adjustContainerHeight() {
    const containerWidth = mascotContainer.offsetWidth;
    const aspectRatio = mascotImage.naturalHeight / mascotImage.naturalWidth;
    const newHeight = Math.round(containerWidth * aspectRatio);
    
    // Apply minimum height to ensure visibility
    const minHeight = 250;
    const maxHeight = 600;
    mascotContainer.style.height = `${Math.min(Math.max(newHeight, minHeight), maxHeight)}px`;
  }

  // Initialize container height
  setInitialHeight();
  
  // Handle browser resize
  window.addEventListener('resize', adjustContainerHeight);

  // Store the original image source and alt text for error recovery
  const originalMascotSrc = mascotImage.src;
  const originalMascotAlt = mascotImage.alt;
  const originalContainerHeight = mascotContainer.offsetHeight; // Store height after initialization

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
    mascotLoading.style.display = 'flex'; // Explicitly show loading spinner on the back face
    mascotContainer.classList.add('flipped'); // Flip the CONTAINER

    // Activate magical background effect if available
    // This will smoothly transition to the intense state and automatically fade back
    if (window.staticBackground && typeof window.staticBackground.enableMagicMode === 'function') {
      // Just calling enableMagicMode will trigger the entire sequence:
      // 1. Smooth fade to intense state
      // 2. Hold at intense state for a moment
      // 3. Automatically fade back to normal state
      window.staticBackground.enableMagicMode();
      
      // No need for additional timeouts as the background effect now handles
      // the complete cycle internally
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
          
          // Calculate new height based on container's current width and new image aspect ratio
          const containerWidth = mascotContainer.offsetWidth;
          const aspectRatio = tempImg.height / tempImg.width;
          let newHeight = Math.round(containerWidth * aspectRatio);

          // Optional: Clamp height to avoid excessively tall images
          const maxHeight = 600; // Example max height
          newHeight = Math.min(newHeight, maxHeight);

          console.log(`Adjusting container height to: ${newHeight}px`);

          // Set the container height BEFORE updating the image source
          // Use requestAnimationFrame to ensure layout is updated before transition
          requestAnimationFrame(() => {
            mascotContainer.style.height = `${newHeight}px`;

            // Update the main mascot image (on the front, while card is flipped)
            mascotImage.src = newImageSrc;
            mascotImage.alt = "AI-generated polar bear mascot in a new style: " + newDescription.substring(0, 50) + "..."; // Update alt text

            // Update the description text below the container
            mascotAiDescription.textContent = newDescription;
            mascotAiDescription.style.display = 'block'; // Make it display block first
            
            // Use a tiny timeout to allow display:block to apply before adding class for transition
            setTimeout(() => {
              mascotAiDescription.classList.add('visible');
            }, 10);

            // Hide loading indicator BEFORE flipping back
            mascotLoading.style.display = 'none';

            // --- Flip Back ---
            mascotContainer.classList.remove('flipped'); // This triggers the animation on the CONTAINER
            
            // No need to explicitly deactivate magic background
            // The background effect will automatically fade back to normal

            // Reset state after animation likely finishes
            setTimeout(() => {
              isGeneratingImage = false;
              styleInspirationLink.style.pointerEvents = 'auto';
              styleInspirationLink.style.opacity = '1';
            }, 800); // Corresponds to flip duration
          });
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
    // Hide loading indicator BEFORE flipping back
    mascotLoading.style.display = 'none';

    // Display error message in the description area
    mascotAiDescription.textContent = `Failed to generate style: ${error.message}`;
    mascotAiDescription.style.display = 'block';
    setTimeout(() => {
      mascotAiDescription.classList.add('visible');
    }, 10);

    // Reset image to original
    mascotImage.src = originalMascotSrc;
    mascotImage.alt = originalMascotAlt;

    // Reset container height
    requestAnimationFrame(() => {
      mascotContainer.style.height = `${originalContainerHeight}px`; // Or 'auto' if preferred

      // Flip back
      mascotContainer.classList.remove('flipped'); // Flip the CONTAINER back

      // No need to explicitly deactivate magic background
      // The background effect will automatically fade back to normal

      // Reset state after animation
      setTimeout(() => {
        isGeneratingImage = false;
        styleInspirationLink.style.pointerEvents = 'auto';
        styleInspirationLink.style.opacity = '1';
      }, 800);
    });
  }

  // Add click listener to mascot image for lightbox if window.showLightbox is available
  if (mascotImage && window.showLightbox) {
    mascotImage.style.cursor = 'pointer';
    mascotImage.addEventListener('click', () => {
      const descriptionText = mascotAiDescription.classList.contains('visible') ? 
        mascotAiDescription.textContent : mascotImage.alt;
      window.showLightbox(mascotImage.src, mascotImage.alt, descriptionText);
    });
  }
});
