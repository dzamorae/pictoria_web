import { setupEventListeners } from './ui.js';
import { setupVoiceRecognition } from './voiceRecognition.js';

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupVoiceRecognition();
});
