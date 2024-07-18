const API_KEY = 'sk-proj-qVTXKyMEOBsdTqJbwFcNT3BlbkFJfHmVfzHTrp3i1omL6KTF';
const API_URL = 'https://api.openai.com/v1/images/generations';

async function generateImage(prompt: string): Promise<string> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: '512x512'
      })
    });
  
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.data[0].url;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm') as HTMLFormElement | null;
    const promptInput = document.getElementById('prompt') as HTMLInputElement | null;
    const imageContainer = document.getElementById('imageContainer') as HTMLDivElement | null;
  
    if (form && promptInput && imageContainer) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const prompt = promptInput.value;
  
        try {
          const imageUrl = await generateImage(prompt);
          imageContainer.innerHTML = `<img src="${imageUrl}" alt="Generated Image">`;
        } catch (error) {
          console.error('Error generating image:', error);
        }
      });
    } else {
      console.error('Form or input elements not found.');
    }
  });