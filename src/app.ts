import { setupEventListeners } from './ui.js';
import { setupVoiceRecognition } from './voiceRecognition.js';

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupVoiceRecognition();
});

document.addEventListener('DOMContentLoaded', () => {
    const isAuthenticated = localStorage.getItem('authToken') !== null;

    if (!isAuthenticated) {
        alert('Por favor, inicie sesión para continuar.');
        window.location.href = 'index.html';
        return;
    }

    // El resto de la lógica para manejar las pestañas y secciones
    // ...
});

document.getElementById('logoutButton')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
});

document.addEventListener('DOMContentLoaded', () => {
    const generateTab = document.getElementById('generateTab');
    const viewTab = document.getElementById('viewTab');
    const generateSection = document.getElementById('generateSection');
    const viewSection = document.getElementById('viewSection');
    const inputSection = document.getElementById('inputSection');
    const imageGrid = document.getElementById('imageGrid');
    const modalImage = document.getElementById('modalImage');
    const downloadButton = document.getElementById('downloadButton');

    // Verificación de autenticación
    const isAuthenticated = localStorage.getItem('authToken') !== null;

    if (!isAuthenticated) {        
        alert('Por favor, inicie sesión para continuar.');
        window.location.href = 'index.html';
        return;
    }

    // Lógica para manejar las pestañas y secciones
    generateTab?.addEventListener('click', () => {
        generateSection!.style.display = 'block';
        inputSection!.style.display = 'block';
        viewSection!.style.display = 'none';
        generateTab.classList.add('active');
        viewTab?.classList.remove('active');
    });

    viewTab?.addEventListener('click', async () => {

        (document.getElementById('searchInput') as HTMLInputElement).value = '';
        generateSection!.style.display = 'none';
        inputSection!.style.display = 'none';
        viewSection!.style.display = 'block';
        viewTab.classList.add('active');
        generateTab?.classList.remove('active');

        try {
            const response = await fetch('/get-pictograms', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                // Manejo del caso en que no hay pictogramas guardados
                alert("Es necesario iniciar sesión.");
                return;
            }

            if (response.status === 404) {
                // Manejo del caso en que no hay pictogramas guardados
                document.getElementById('imageGrid')!.innerHTML = '<p>No hay pictogramas guardados.</p>';
                return;
            }

            if (!response.ok) {
                throw new Error('Error al obtener los pictogramas guardados.');
            }

            const pictograms = await response.json();

            // Cargar las imágenes en la cuadrícula
            imageGrid!.innerHTML = pictograms.map((pictogram: any) => `                        
                <div class="pictogram-item">
                    <img src="${pictogram.url_imagen}" alt="${pictogram.prompt}" data-toggle="modal" data-target="#imageModal" data-url="${pictogram.url_imagen}">
                    <div class="delete-icon" data-id="${pictogram.id}"><i class="fas fa-times"></i></div>
                </div>
            `).join('');

            // Configurar eventos para las imágenes
            document.querySelectorAll('.image-grid img').forEach(img => {
                img.addEventListener('click', () => {
                    const imgUrl = (img as HTMLImageElement).getAttribute('data-url') as string;
                    const modalImage = document.getElementById('modalImage') as HTMLImageElement;
                    const downloadButton = document.getElementById('downloadButton') as HTMLAnchorElement;

                    modalImage.src = imgUrl;
                    downloadButton.href = imgUrl;

                });
            });

        } catch (error) {
            console.error('Error:', error);
            imageGrid!.innerHTML = '<h4>No hay pictogramas guardados.</h4>';
        }
    });

    // Event listener para cerrar sesión
    document.getElementById('logoutButton')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');  // Eliminar el token de autenticación
        window.location.href = 'index.html';  // Redirigir al usuario a la página de inicio de sesión
    });
});


