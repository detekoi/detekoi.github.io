document.addEventListener('DOMContentLoaded', () => {
  const geminiButton = document.getElementById('gemini-button');
  const mascotImage = document.querySelector('.mascot');
  const originalMascotSrc = mascotImage.src; // Store the original image source
  const targetMascotSrc = 'assets/images/PolarBearTransparent4K.png'; // Image to send to API

  if (!geminiButton || !mascotImage) {
    console.error('Required elements (button or mascot image) not found.');
    return;
  }

  // --- Gemini API Configuration ---
  // WARNING: Never hardcode your API key in client-side code for production.
  // Use a backend proxy or secure method to handle the key.
  const API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your actual key for testing ONLY
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent'; // Adjust if using a different model/version

  const prompt = "zoom out full body head to toe to reveal the bear is wearing fashion garments and accessories, make it a cohesive theme. also, change his blue neckerchief into a different color.";

  // Function to fetch image and convert to base64
  async function getImageBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get base64 part
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching or converting image:', error);
      throw error; // Re-throw to be caught by the caller
    }
  }

  // Function to call Gemini API
  async function callGeminiAPI(base64ImageData) {
    if (API_KEY === 'YOUR_GEMINI_API_KEY') {
       alert("Please replace 'YOUR_GEMINI_API_KEY' in scripts/gemini-mascot.js with your actual Gemini API key.");
       throw new Error("API Key not set.");
    }

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/png', // Assuming the transparent image is PNG
              data: base64ImageData
            }
          }
        ]
      }],
      // Add generationConfig if needed (e.g., temperature, max output tokens)
      // generationConfig: {
      //   "temperature": 0.4,
      //   "topK": 32,
      //   "topP": 1,
      //   "maxOutputTokens": 4096,
      //   "stopSequences": []
      // },
    };

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error Response:', errorData);
        throw new Error(`Gemini API error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      // Extract the image data from the response (structure might vary based on model/task)
      // This assumes the response format includes the generated image data directly.
      // Adjust based on the actual Gemini API response structure for image generation/editing.
      // It's more likely Gemini Vision API describes images or answers questions about them,
      // rather than editing and returning a new image directly in this flow.
      // Let's assume for now it *could* return base64 data in a specific part.
      // You WILL likely need to adjust this response parsing logic.
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
         const imagePart = data.candidates[0].content.parts.find(part => part.inline_data && part.inline_data.mime_type.startsWith('image/'));
         if (imagePart) {
            return `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`;
         } else {
            // If no image part, maybe it returned text? Log it.
            console.warn("Gemini API did not return an image part. Response:", data.candidates[0].content.parts);
            const textPart = data.candidates[0].content.parts.find(part => part.text);
             alert(`Gemini response (no image found): ${textPart ? textPart.text : 'Check console for details.'}`);
            return null; // Indicate no image was returned
         }
      } else {
         console.error('Unexpected Gemini API response structure:', data);
         throw new Error('Could not find generated image data in the API response.');
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      alert(`Failed to get response from Gemini: ${error.message}`);
      throw error; // Re-throw
    }
  }

  // Event listener for the button
  geminiButton.addEventListener('click', async () => {
    // Indicate processing started (e.g., disable button, show spinner)
    geminiButton.disabled = true;
    geminiButton.textContent = '🪄'; // Change icon or text

    try {
      console.log('Fetching base image...');
      const base64Image = await getImageBase64(targetMascotSrc);
      console.log('Calling Gemini API...');
      const newImageDataUri = await callGeminiAPI(base64Image);

      if (newImageDataUri) {
        console.log('Updating mascot image...');
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
