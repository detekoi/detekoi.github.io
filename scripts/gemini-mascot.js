document.addEventListener('DOMContentLoaded', () => {
  const geminiButton = document.getElementById('gemini-button');
  const mascotImage = document.querySelector('.mascot');
  const originalMascotSrc = mascotImage.src; // Store the original image source

  if (!geminiButton || !mascotImage) {
    console.error('Required elements (button or mascot image) not found.');
    return;
  }

  // Prompt for the Gemini API - customized to edit the existing bear image
  const prompt = "Zoom out full body head-to-toe to reveal that the bear is wearing fashion garments and accessories, make it a cohesive theme. Also, change his blue neckerchief into any vibrant color.";

  // Backend API endpoint URL - now using the working image generation endpoint
  const BACKEND_API_URL = '/api/generate-image'; // Use the working endpoint

  // Event listener for the button
  geminiButton.addEventListener('click', async () => {
    // Indicate processing started
    geminiButton.disabled = true;
    geminiButton.textContent = '🪄'; // Change icon to magic wand

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
        // Handle error response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error || 'Unknown error'}${errorData.details ? ': ' + errorData.details : ''}`;
        } catch (e) {
          errorMessage += ` - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Received response from server:', data);

      // Update the mascot image if we received an image
      if (data.imageDataUri) {
        console.log('Received new image data URI from backend. Updating mascot image...');
        mascotImage.src = data.imageDataUri;
        mascotImage.alt = "AI-generated polar bear mascot."; // Update alt text
      } else {
        console.log('No image data received from API.');
        alert('The AI could not generate a new mascot image. Please try again.');
      }

    } catch (error) {
      console.error('Error generating mascot image:', error);
      alert(`Failed to generate new mascot: ${error.message}`);
      geminiButton.textContent = '❌'; // Indicate error state
      
      // Re-enable after a delay if error
      setTimeout(() => {
        geminiButton.disabled = false;
        geminiButton.textContent = '✨';
      }, 2000);

    } finally {
      // Re-enable button unless it was set to error state
      if (geminiButton.textContent !== '❌') {
        geminiButton.disabled = false;
        geminiButton.textContent = '✨'; // Restore original icon
      }
    }
  });

});
