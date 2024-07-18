// Importa y configura dotenv para cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Declaraciones de tipo para SpeechRecognition
interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

const API_KEY = process.env.API_KEY;
const API_URL = 'https://api.openai.com/v1/images/generations';
//const MODEL = 'gpt-4'; // Especifica el modelo DALL-E 3
  
  async function generateImage(prompt: string): Promise<string> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3', // Incluye el modelo en la solicitud
        //role: 'system', 
        //content: 'Eres un experto en Comunicación Aumentativa y Alternativa (CAA). Genera pictogramas simples y explícitos sin fondos.',
        prompt: 'Genera un pictograma de acuerdo al contexto '+prompt+' para niños de edad de 5 a 10 años',
        n: 1,
        size: '512x512' // Cambia el tamaño de la imagen aquí si es necesario

      })
    });
  
    if (!response.ok) {
      console.log(response);
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.data[0].url;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm') as HTMLFormElement | null;
    const promptInput = document.getElementById('prompt') as HTMLInputElement | null;
    const imageContainer = document.getElementById('imageContainer') as HTMLDivElement | null;
    const voiceButton = document.getElementById('voiceButton') as HTMLButtonElement | null;
  
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
  
    if (voiceButton && promptInput) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
  
      voiceButton.addEventListener('click', () => {
        recognition.start();
      });
  
      recognition.addEventListener('result', (event: { results: string | any[]; }) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        promptInput.value = transcript;
      });
  
      recognition.addEventListener('speechend', () => {
        recognition.stop();
      });
  
      recognition.addEventListener('error', (event: { error: any; }) => {
        console.error('Speech recognition error', event.error);
      });
    }
  });
  