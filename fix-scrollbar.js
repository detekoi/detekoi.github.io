/* 
 * Script to fix scrollbars in detail elements
 * This runs after all other scripts to ensure overrides
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initial fix
  fixScrollbars();
  
  // Watch for DOM changes and fix scrollbars when needed
  const observer = new MutationObserver(function(mutations) {
    fixScrollbars();
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Function to fix scrollbars
  function fixScrollbars() {
    // Find all .detail elements
    const detailElements = document.querySelectorAll('.card .detail');
    
    detailElements.forEach(function(detail) {
      // Ensure the detail has correct styles
      detail.style.overflowY = 'visible';
      detail.style.height = '80px';
      detail.style.display = 'block';
      
      // Check if it already has a force-overflow container
      let forceOverflow = detail.querySelector('.force-overflow');
      
      if (\!forceOverflow) {
        // No force-overflow container, create one
        forceOverflow = document.createElement('div');
        forceOverflow.className = 'force-overflow';
        
        // Move all detail's children into force-overflow
        while (detail.firstChild) {
          forceOverflow.appendChild(detail.firstChild);
        }
        
        // Add force-overflow to detail
        detail.appendChild(forceOverflow);
      }
      
      // Ensure force-overflow has correct styles
      forceOverflow.style.overflowY = 'scroll';
      forceOverflow.style.height = '100%';
      
      // Make sure content is tall enough to cause scrolling
      if (forceOverflow.scrollHeight <= forceOverflow.clientHeight) {
        // Add invisible content to force scrollbar
        let spacer = forceOverflow.querySelector('.scrollbar-spacer');
        if (\!spacer) {
          spacer = document.createElement('div');
          spacer.className = 'scrollbar-spacer';
          spacer.style.height = '150px';
          spacer.style.color = 'transparent';
          spacer.textContent = '.';
          forceOverflow.appendChild(spacer);
        }
      }
    });
  }
});
