interface Pictogram {
    id: number;
    usuario_id: number;
    prompt: string;
    url_imagen: string;
    fecha_creacion: string;
}

const form = document.getElementById('imageForm') as HTMLFormElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const acceptButton = document.getElementById('acceptButton') as HTMLButtonElement;
const viewPictogramsButton = document.getElementById('viewPictogramsButton') as HTMLButtonElement;
const savedPictogramsDiv = document.getElementById('savedPictograms') as HTMLDivElement;

let currentImageUrl = '';
let currentPrompt = '';

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const promptInput = document.getElementById('prompt') as HTMLInputElement;
    const prompt = promptInput.value;

    // Mostrar el GIF de espera
    resultDiv.innerHTML = '<div class="loader"></div>';
    acceptButton.style.display = 'none';

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
        currentImageUrl = data.url;
        currentPrompt = prompt;
        resultDiv.innerHTML = `<img src="${currentImageUrl}" alt="Imagen Generada" class="img-fluid result-image">`;
        acceptButton.style.display = 'inline-block';
    } catch (error) {
        console.error('Error:', error);
        resultDiv.textContent = 'Hubo un error al generar la imagen.';
    }
});

acceptButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/save-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: currentPrompt, url: currentImageUrl })
        });

        if (!response.ok) {
            throw new Error('Error al guardar la imagen.');
        }

        const data = await response.json();
        alert('Imagen guardada exitosamente. URL: ' + data.url);
        acceptButton.style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error guardando la imagen.');
    }
});

viewPictogramsButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/get-pictograms', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error obteniendo los pictogramas guardados.');
        }

        const pictograms: Pictogram[] = await response.json();
        console.log('Resultado:', pictograms);

        // Chequear si el array está vacío
        if (pictograms.length === 0) {
            savedPictogramsDiv.textContent = 'No se encontraron pictogramas guardados.';
            savedPictogramsDiv.style.display = 'block';
            return;
        }

        if (!Array.isArray(pictograms)) {
            throw new Error('La respuesta no es un array.');
        }

        savedPictogramsDiv.innerHTML = pictograms.map(pictogram => `
            <div class="pictogram-item">
                <p><strong>Prompt:</strong> ${pictogram.prompt}</p>
                <img src="${pictogram.url_imagen}" alt="Saved Image" class="img-fluid result-image">
            </div>
        `).join('');
        savedPictogramsDiv.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        savedPictogramsDiv.textContent = 'Hubo un error obteniendo los pictogramas guardados.';
        savedPictogramsDiv.style.display = 'block';
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
