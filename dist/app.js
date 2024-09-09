var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
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
(_a = document.getElementById('logoutButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
});
document.addEventListener('DOMContentLoaded', () => {
    var _a;
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
    generateTab === null || generateTab === void 0 ? void 0 : generateTab.addEventListener('click', () => {
        generateSection.style.display = 'block';
        inputSection.style.display = 'block';
        viewSection.style.display = 'none';
        generateTab.classList.add('active');
        viewTab === null || viewTab === void 0 ? void 0 : viewTab.classList.remove('active');
    });
    viewTab === null || viewTab === void 0 ? void 0 : viewTab.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        document.getElementById('searchInput').value = '';
        generateSection.style.display = 'none';
        inputSection.style.display = 'none';
        viewSection.style.display = 'block';
        viewTab.classList.add('active');
        generateTab === null || generateTab === void 0 ? void 0 : generateTab.classList.remove('active');
        try {
            const response = yield fetch('/get-pictograms', {
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
                document.getElementById('imageGrid').innerHTML = '<p>No hay pictogramas guardados.</p>';
                return;
            }
            if (!response.ok) {
                throw new Error('Error al obtener los pictogramas guardados.');
            }
            const pictograms = yield response.json();
            // Cargar las imágenes en la cuadrícula
            imageGrid.innerHTML = pictograms.map((pictogram) => `                        
                <div class="pictogram-item">
                    <img src="${pictogram.url_imagen}" alt="${pictogram.prompt}" data-toggle="modal" data-target="#imageModal" data-url="${pictogram.url_imagen}">
                    <div class="delete-icon" data-id="${pictogram.id}"><i class="fas fa-times"></i></div>
                </div>
            `).join('');
            // Configurar eventos para las imágenes
            document.querySelectorAll('.image-grid img').forEach(img => {
                img.addEventListener('click', () => {
                    const imgUrl = img.getAttribute('data-url');
                    const modalImage = document.getElementById('modalImage');
                    const downloadButton = document.getElementById('downloadButton');
                    modalImage.src = imgUrl;
                    downloadButton.href = imgUrl;
                });
            });
            // Llamar a setupDeleteListeners después de cargar los pictogramas
            setupDeleteListeners();
        }
        catch (error) {
            console.error('Error:', error);
            imageGrid.innerHTML = '<h4>No hay pictogramas guardados.</h4>';
        }
    }));
    // Event listener para cerrar sesión
    (_a = document.getElementById('logoutButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        localStorage.removeItem('authToken'); // Eliminar el token de autenticación
        window.location.href = 'index.html'; // Redirigir al usuario a la página de inicio de sesión
    });
});
function setupDeleteListeners() {
    document.querySelectorAll('.delete-icon').forEach(button => {
        button.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
            const viewTab = document.getElementById('viewTab');
            const id = event.currentTarget.getAttribute('data-id');
            if (!confirm('¿Estás seguro que deseas eliminar el pictograma?')) {
                return false;
            }
            if (id) {
                try {
                    const response = yield fetch('/delete-pictogram', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id })
                    });
                    if (!response.ok) {
                        throw new Error('Error al eliminar el pictograma');
                    }
                    alert('Pictograma eliminado correctamente.');
                }
                catch (error) {
                    console.error('Error: desde app.ts');
                    console.error('Error:', error);
                    alert('Hubo un error al eliminar el pictograma.');
                }
            }
            if (viewTab) {
                viewTab.click();
            }
        }));
    });
}
