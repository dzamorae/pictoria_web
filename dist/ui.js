var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { generateImage, savePictogram, loadPictograms } from './api.js';
export function setupEventListeners() {
    const form = document.getElementById('imageForm');
    const resultDiv = document.getElementById('result');
    const acceptButton = document.getElementById('acceptButton');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const imageGrid = document.getElementById('imageGrid');
    const modalImage = document.getElementById('modalImage');
    const maximizeButton = document.getElementById('maximizeButton');
    let isMaximized = false;
    if (form) {
        form.addEventListener('submit', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const promptInput = document.getElementById('prompt');
            const prompt = promptInput.value;
            resultDiv.innerHTML = '<div class="loader"></div>';
            acceptButton.style.display = 'none';
            try {
                const imageUrl = yield generateImage(prompt);
                resultDiv.innerHTML = `<img src="${imageUrl}" alt="Imagen Generada" class="img-fluid result-image">`;
                acceptButton.style.display = 'inline-block';
            }
            catch (error) {
                console.error('Error:', error);
                resultDiv.textContent = 'Hubo un error al generar la imagen.';
            }
        }));
    }
    if (acceptButton) {
        acceptButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const promptInput = document.getElementById('prompt');
                yield savePictogram(promptInput.value, ((_a = resultDiv.querySelector('img')) === null || _a === void 0 ? void 0 : _a.src) || '');
                resultDiv.innerHTML = `Genial que te haya gustado la imagen, la he guardado para ti.`;
                acceptButton.style.display = 'none';
                promptInput.value = '';
            }
            catch (error) {
                console.error('Error:', error);
                alert('Hubo un error guardando la imagen.');
            }
        }));
    }
    if (searchButton && imageGrid) {
        searchButton.addEventListener('click', () => {
            const keyword = searchInput.value.trim();
            if (keyword) {
                loadPictograms(keyword).then((pictograms) => {
                    const filteredPictograms = pictograms.filter((pictogram) => pictogram.estado === 'V');
                    imageGrid.innerHTML = filteredPictograms.map((pictogram) => `
                        <div class="pictogram-item">
                            <img src="${pictogram.url_imagen}" alt="${pictogram.prompt}" data-toggle="modal" data-target="#imageModal" data-url="${pictogram.url_imagen}">
                            <div class="delete-icon" data-id="${pictogram.id}"><i class="fas fa-times"></i></div>
                        </div>
                    `).join('');
                    document.querySelectorAll('.image-grid img').forEach(img => {
                        img.addEventListener('click', () => {
                            const imgUrl = img.getAttribute('data-url');
                            if (modalImage) {
                                modalImage.src = imgUrl;
                                isMaximized = false; // Reset maximized state
                                modalImage.style.maxWidth = '100%';
                                modalImage.style.maxHeight = '100vh';
                                modalImage.style.width = 'auto';
                                modalImage.style.height = 'auto';
                            }
                            const downloadButton = document.getElementById('downloadButton');
                            modalImage.src = imgUrl;
                            downloadButton.href = imgUrl;
                        });
                    });
                    document.querySelectorAll('.delete-icon').forEach(button => {
                        button.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
                            if (!confirm('¿Estás seguro que deseas eliminar el pictograma?')) {
                                return false;
                            }
                            const id = event.currentTarget.getAttribute('data-id');
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
                                    // Recargar la lista de pictogramas después de la eliminación
                                    loadPictograms(keyword).then((updatedPictograms) => {
                                        const updatedFilteredPictograms = updatedPictograms.filter((pictogram) => pictogram.estado === 'V');
                                        imageGrid.innerHTML = updatedFilteredPictograms.map((pictogram) => `
                                            <div class="pictogram-item">
                                                <img src="${pictogram.url_imagen}" alt="${pictogram.prompt}" data-toggle="modal" data-target="#imageModal" data-url="${pictogram.url_imagen}">
                                                <div class="delete-icon" data-id="${pictogram.id}"><i class="fas fa-times"></i></div>
                                            </div>
                                        `).join('');
                                        // Volver a agregar los event listeners para los botones y las imágenes
                                        document.querySelectorAll('.image-grid img').forEach(img => {
                                            img.addEventListener('click', () => {
                                                const imgUrl = img.getAttribute('data-url');
                                                if (modalImage) {
                                                    modalImage.src = imgUrl;
                                                    isMaximized = false;
                                                    modalImage.style.maxWidth = '100%';
                                                    modalImage.style.maxHeight = '100vh';
                                                    modalImage.style.width = 'auto';
                                                    modalImage.style.height = 'auto';
                                                }
                                                const downloadButton = document.getElementById('downloadButton');
                                                modalImage.src = imgUrl;
                                                downloadButton.href = imgUrl;
                                            });
                                        });
                                    });
                                    //(event.currentTarget as HTMLElement).parentElement?.remove(); // Remover el pictograma del DOM
                                }
                                catch (error) {
                                    console.error('Error:', error);
                                    alert('Hubo un error al eliminar el pictograma.');
                                }
                            }
                        }));
                    });
                });
            }
        });
    }
    if (maximizeButton && modalImage) {
        maximizeButton.addEventListener('click', () => {
            if (isMaximized) {
                modalImage.style.maxWidth = '100%';
                modalImage.style.maxHeight = '100vh';
                modalImage.style.width = 'auto';
                modalImage.style.height = 'auto';
                maximizeButton.textContent = 'Maximizar';
            }
            else {
                modalImage.style.maxWidth = 'none';
                modalImage.style.maxHeight = 'none';
                modalImage.style.width = '100vw'; // Maximizar al ancho de la ventana
                modalImage.style.height = '100vh'; // Maximizar al alto de la ventana
                maximizeButton.textContent = 'Restaurar';
            }
            isMaximized = !isMaximized;
        });
    }
}
/*
document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (event) => {
        const id = (event.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
            try {
                const response = await fetch('/delete-pictogram', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                });

                if (!response.ok) {
                    throw new Error('Error al anular el pictograma');
                }

                alert('Pictograma anulado con éxito');
                // Opcional: Puedes recargar la lista de pictogramas o eliminar el elemento del DOM
                (event.currentTarget as HTMLElement).parentElement?.remove();
            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un error al anular el pictograma.');
            }
        }
    });
});
*/
