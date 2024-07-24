const form = document.getElementById('imageForm') as HTMLFormElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const promptInput = document.getElementById('prompt') as HTMLInputElement;
    const prompt = promptInput.value;

    // Mostrar el GIF de espera
    resultDiv.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud al servidor.');
        }

        const data = await response.json();
        const imageUrl = data.url;
        resultDiv.innerHTML = `<img src="${imageUrl}" alt="Generated Image" class="img-fluid result-image" width="512px">`;
        promptInput.value = ``;
      } catch (error) {
        console.error('Error:', error);
        resultDiv.textContent = 'Hubo un error al generar la imagen.';
    }
});

// Añadir reconocimiento de voz
const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
recognition.lang = 'es-ES';

const startRecognition = () => {
    recognition.start();
};

recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    const promptInput = document.getElementById('prompt') as HTMLInputElement;
    promptInput.value = transcript;
};

startButton.addEventListener('click', startRecognition);
