export function setupVoiceRecognition() {
    const startButton = document.getElementById('startButton');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const promptInput = document.getElementById('prompt');
        promptInput.value = transcript;
    };
    startButton.addEventListener('click', () => {
        recognition.start();
    });
}
