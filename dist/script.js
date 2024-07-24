"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const form = document.getElementById('imageForm');
const resultDiv = document.getElementById('result');
const startButton = document.getElementById('startButton');
form.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value;
    // Mostrar el GIF de espera
    resultDiv.innerHTML = '<div class="loader"></div>';
    try {
        const response = yield fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        if (!response.ok) {
            throw new Error('Error en la solicitud al servidor.');
        }
        const data = yield response.json();
        const imageUrl = data.url;
        resultDiv.innerHTML = `<img src="${imageUrl}" alt="Generated Image" class="img-fluid result-image" width="512px">`;
        promptInput.value = ``;
    }
    catch (error) {
        console.error('Error:', error);
        resultDiv.textContent = 'Hubo un error al generar la imagen.';
    }
}));
// Añadir reconocimiento de voz
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';
const startRecognition = () => {
    recognition.start();
};
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const promptInput = document.getElementById('prompt');
    promptInput.value = transcript;
};
startButton.addEventListener('click', startRecognition);
