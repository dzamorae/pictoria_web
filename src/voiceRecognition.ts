export function setupVoiceRecognition() {
    const startButton = document.getElementById('startButton') as HTMLButtonElement;
    const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
    recognition.lang = 'es-ES';

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const promptInput = document.getElementById('prompt') as HTMLInputElement;
        promptInput.value = transcript;
    };

    startButton.addEventListener('click', () => {
        recognition.start();
    });
}
