// Lightbox functionality for screenshots and mascot
document.addEventListener('DOMContentLoaded', () => {
  // Create the lightbox elements
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox-overlay';
  
  const lightboxImage = document.createElement('img');
  lightboxImage.className = 'lightbox-image';
  
  const lightboxDescription = document.createElement('div');
  lightboxDescription.className = 'lightbox-description';
  
  const lightboxClose = document.createElement('button');
  lightboxClose.className = 'lightbox-close';
  lightboxClose.innerHTML = '&times;';

  const lightboxContainer = document.createElement('div');
  lightboxContainer.className = 'lightbox-container';
  lightboxContainer.appendChild(lightboxImage);
  lightboxContainer.appendChild(lightboxDescription); // Add description inside container
  lightboxContainer.appendChild(lightboxClose); // Close button inside or outside? Let's keep inside container
  lightboxOverlay.appendChild(lightboxContainer);
  document.body.appendChild(lightboxOverlay);

  // Function to open the lightbox
  function openLightbox(imageSrc, imageAlt, descriptionText = null) {
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt;

    if (descriptionText && descriptionText.trim() !== '') {
        lightboxDescription.textContent = descriptionText;
        lightboxDescription.style.display = 'block';
    } else {
        lightboxDescription.textContent = '';
        lightboxDescription.style.display = 'none';
    }

    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  // Function to close the lightbox
  function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Add click event to screenshots
  const screenshots = document.querySelectorAll('.screenshot');
  screenshots.forEach(screenshot => {
    screenshot.style.cursor = 'pointer';
    screenshot.addEventListener('click', () => {
      openLightbox(screenshot.src, screenshot.alt, screenshot.alt); // Use alt as description for screenshots
    });
  });

  // Add click event to the main mascot image
  const mascot = document.querySelector('.mascot');
  if (mascot) {
    mascot.style.cursor = 'pointer';
    mascot.addEventListener('click', () => {
        const descriptionEl = document.getElementById('mascot-ai-description');
        let descriptionText = mascot.alt; // Default to alt text
        // If the AI description is visible, use its text instead
        if (descriptionEl && descriptionEl.classList.contains('visible') && descriptionEl.textContent.trim() !== '') {
            descriptionText = descriptionEl.textContent;
        }
        openLightbox(mascot.src, mascot.alt, descriptionText);
    });
  }

  // Close lightbox event listeners
  lightboxClose.addEventListener('click', closeLightbox);
  
  // Close when clicking anywhere except the image itself
  lightboxOverlay.addEventListener('click', (e) => {
    // Only prevent closing if the click was directly on the image
    if (e.target !== lightboxImage) {
      closeLightbox();
    }
  });
  
  // Prevent clicks on the image from closing the lightbox
  lightboxImage.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop click from propagating to container/overlay
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Expose the open function to be used by other scripts
  window.showLightbox = openLightbox;
});