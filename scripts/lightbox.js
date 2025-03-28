// Lightbox functionality for screenshots
document.addEventListener('DOMContentLoaded', () => {
  // Create the lightbox elements
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox-overlay';
  
  const lightboxContainer = document.createElement('div');
  lightboxContainer.className = 'lightbox-container';
  
  const lightboxImage = document.createElement('img');
  lightboxImage.className = 'lightbox-image';
  
  const lightboxClose = document.createElement('button');
  lightboxClose.className = 'lightbox-close';
  lightboxClose.innerHTML = '&times;';
  
  // Add elements to DOM
  lightboxContainer.appendChild(lightboxImage);
  lightboxContainer.appendChild(lightboxClose);
  lightboxOverlay.appendChild(lightboxContainer);
  document.body.appendChild(lightboxOverlay);
  
  // Find all screenshots
  const screenshots = document.querySelectorAll('.screenshot');
  
  // Add click event to screenshots
  screenshots.forEach(screenshot => {
    screenshot.style.cursor = 'pointer';
    screenshot.addEventListener('click', () => {
      // Set the image source
      lightboxImage.src = screenshot.src;
      lightboxImage.alt = screenshot.alt;
      
      // Show the lightbox
      lightboxOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
  });
  
  // Close lightbox when clicking the close button
  lightboxClose.addEventListener('click', closeLightbox);
  
  // Close lightbox when clicking outside the image
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      closeLightbox();
    }
  });
  
  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
      closeLightbox();
    }
  });
  
  // Function to close the lightbox
  function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
});