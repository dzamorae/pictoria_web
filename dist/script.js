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
document.addEventListener('DOMContentLoaded', () => {
    function generateImage(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }
            const data = yield response.json();
            return data.url;
        });
    }
    const form = document.getElementById('imageForm');
    form.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        const promptInput = document.getElementById('prompt');
        const resultDiv = document.getElementById('result');
        try {
            const imageUrl = yield generateImage(promptInput.value);
            resultDiv.innerHTML = `<img src="${imageUrl}" alt="Generated Image" class="img-fluid"/>`;
        }
        catch (error) {
            if (error instanceof Error) {
                resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
            }
            else {
                resultDiv.innerHTML = `<p>Unexpected error</p>`;
            }
        }
    }));
    const micButton = document.getElementById('micButton');
    micButton.addEventListener('click', () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('prompt').value = transcript;
        };
        recognition.start();
    });
});
