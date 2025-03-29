document.addEventListener('DOMContentLoaded', () => {
  const geminiButton = document.getElementById('gemini-button');
  const mascotImage = document.querySelector('.mascot');
  const originalMascotSrc = mascotImage.src; // Store the original image source
  const targetMascotSrc = 'assets/images/PolarBearTransparent4K.png'; // Image to send to API

  if (!geminiButton || !mascotImage) {
    console.error('Required elements (button or mascot image) not found.');
    return;
  }

  // Prompt for the Gemini API
  const prompt = "zoom out full body head to toe to reveal the bear is wearing fashion garments and accessories, make it a cohesive theme. also, change his blue neckerchief into a different color.";

  // Backend API endpoint URL
  const BACKEND_API_URL = '/api/gemini-mascot'; // Calls our own server

  // Function to fetch image, get its MIME type, and convert to base64
  async function getImageBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const mimeType = blob.type; // Get the MIME type from the blob
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(',')[1]; // Get base64 part
          resolve({ base64Data, mimeType }); // Resolve with both data and type
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching, getting MIME type, or converting image:', error);
      throw error; // Re-throw to be caught by the caller
    }
  }


  // Function to call our backend API
  async function callBackendAPI(prompt, base64ImageData, mimeType) {
    const requestBody = {
      prompt: prompt,
      base64ImageData: base64ImageData,
      mimeType: mimeType
    };

    try {
      console.log('Sending request to backend endpoint:', BACKEND_API_URL);
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Try to parse error response from backend
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Backend API Error Response:', errorData);
          errorDetails += ` - ${errorData.error || 'Unknown backend error'}${errorData.details ? ': ' + errorData.details : ''}`;
        } catch (e) {
          // If response is not JSON, use status text
          errorDetails += ` - ${response.statusText}`;
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log('Received response from backend:', data);

      // The backend now returns the image data URI directly, or null
      return data.newImageDataUri;

    } catch (error) {
      console.error('Error calling backend API:', error);
      alert(`Failed to get response from backend: ${error.message}`);
      throw error; // Re-throw
    }
  }

  // Event listener for the button
  geminiButton.addEventListener('click', async () => {
    // Indicate processing started (e.g., disable button, show spinner)
    geminiButton.disabled = true;
    geminiButton.textContent = '🪄'; // Change icon or text

    try {
      console.log('Fetching base image and converting to base64...');
      const { base64Data, mimeType } = await getImageBase64(targetMascotSrc);

      console.log(`Image fetched (MIME type: ${mimeType}), calling backend API...`);
      const newImageDataUri = await callBackendAPI(prompt, base64Data, mimeType);

      if (newImageDataUri) {
        console.log('Received new image data URI from backend. Updating mascot image...');
        mascotImage.src = newImageDataUri;
        mascotImage.alt = "AI-generated version of the mascot based on user prompt."; // Update alt text
      } else {
         console.log('No new image data received from API.');
         // Optionally revert button text if no image was generated
         geminiButton.textContent = '✨';
      }

    } catch (error) {
      // Error already logged in helper functions
      // Optionally revert to original image on failure?
      // mascotImage.src = originalMascotSrc;
      alert('An error occurred. Please check the console for details.');
       geminiButton.textContent = '❌'; // Indicate error state
       // Re-enable after a delay or keep disabled if error is persistent
       setTimeout(() => {
           geminiButton.disabled = false;
           geminiButton.textContent = '✨';
       }, 2000);


    } finally {
      // Re-enable button unless it was set to error state above
       if (geminiButton.textContent !== '❌') {
           geminiButton.disabled = false;
           geminiButton.textContent = '✨'; // Restore original icon/text
       }
    }
  });

});
