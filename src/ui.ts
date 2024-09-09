import { generateImage, savePictogram, loadPictograms } from './api.js';
import { Pictogram } from './pictogram.js';
import * as bootstrap from 'bootstrap';

export function setupEventListeners() {
    const form = document.getElementById('imageForm') as HTMLFormElement;
    const resultDiv = document.getElementById('result') as HTMLDivElement;
    const acceptButton = document.getElementById('acceptButton') as HTMLButtonElement;
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const searchButton = document.getElementById('searchButton') as HTMLButtonElement;
    const imageGrid = document.getElementById('imageGrid') as HTMLDivElement;
    const modalImage = document.getElementById('modalImage') as HTMLImageElement;
    const maximizeButton = document.getElementById('maximizeButton') as HTMLButtonElement;

    let isMaximized = false;

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const promptInput = document.getElementById('prompt') as HTMLInputElement;
            const prompt = promptInput.value;

            resultDiv.innerHTML = '<div class="loader"></div>';
            acceptButton.style.display = 'none';

            try {
                const imageUrl = await generateImage(prompt);
                resultDiv.innerHTML = `<img src="${imageUrl}" alt="Imagen Generada" class="img-fluid result-image">`;
                acceptButton.style.display = 'inline-block';
            } catch (error) {
                console.error('Error:', error);
                resultDiv.textContent = 'Hubo un error al generar la imagen.';
            }
        });
    }

    if (acceptButton) {
        acceptButton.addEventListener('click', async () => {
            try {
                const promptInput = document.getElementById('prompt') as HTMLInputElement;
                await savePictogram(promptInput.value, resultDiv.querySelector('img')?.src || '');
                resultDiv.innerHTML = `Genial que te haya gustado la imagen, la he guardado para ti.`;
                acceptButton.style.display = 'none';
                promptInput.value = '';
            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un error guardando la imagen.');
            }
        });
    }

    if (searchButton && imageGrid) {
        searchButton.addEventListener('click', () => {
            const keyword = searchInput.value.trim();
            if (keyword) {
                loadPictograms(keyword).then((pictograms: Pictogram[]) => {
                    const filteredPictograms = pictograms.filter((pictogram: Pictogram) => pictogram.estado === 'V');

                    imageGrid.innerHTML = filteredPictograms.map((pictogram: Pictogram) => `
                        <div class="pictogram-item">
                            <img src="${pictogram.url_imagen}" alt="${pictogram.prompt}" data-toggle="modal" data-target="#imageModal" data-url="${pictogram.url_imagen}">
                            <div class="delete-icon" data-id="${pictogram.id}"><i class="fas fa-times"></i></div>
                        </div>
                    `).join('');

                    document.querySelectorAll('.image-grid img').forEach(img => {
                        img.addEventListener('click', () => {
                            const imgUrl = (img as HTMLImageElement).getAttribute('data-url') as string;
                            if (modalImage) {
                                modalImage.src = imgUrl;
                                isMaximized = false;  // Reset maximized state
                                modalImage.style.maxWidth = '100%';
                                modalImage.style.maxHeight = '100vh';
                                modalImage.style.width = 'auto';
                                modalImage.style.height = 'auto';
                            }
                            const downloadButton = document.getElementById('downloadButton') as HTMLAnchorElement;
                            modalImage.src = imgUrl;
                            downloadButton.href = imgUrl;
                        });
                    });

                    document.querySelectorAll('.delete-icon').forEach(button => {
                        button.addEventListener('click', async (event) => {
                            if (!confirm('¿Estás seguro que deseas eliminar el pictograma?')) {
                                return false;
                            }
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
                                        throw new Error('Error al eliminar el pictograma');
                                    }
                
                                    alert('Pictograma eliminado correctamente.');
                                    // Recargar la lista de pictogramas después de la eliminación
                                    loadPictograms(keyword).then((updatedPictograms: Pictogram[]) => {
                                        const updatedFilteredPictograms = updatedPictograms.filter((pictogram: Pictogram) => pictogram.estado === 'V');
                                        imageGrid.innerHTML = updatedFilteredPictograms.map((pictogram: Pictogram) => `
                                            <div class="pictogram-item">
                                                <img src="${pictogram.url_imagen}" alt="${pictogram.prompt}" data-toggle="modal" data-target="#imageModal" data-url="${pictogram.url_imagen}">
                                                <div class="delete-icon" data-id="${pictogram.id}"><i class="fas fa-times"></i></div>
                                            </div>
                                        `).join('');
                                        // Volver a agregar los event listeners para los botones y las imágenes
                                        document.querySelectorAll('.image-grid img').forEach(img => {
                                            img.addEventListener('click', () => {
                                                const imgUrl = (img as HTMLImageElement).getAttribute('data-url') as string;
                                                if (modalImage) {
                                                    modalImage.src = imgUrl;
                                                    isMaximized = false;
                                                    modalImage.style.maxWidth = '100%';
                                                    modalImage.style.maxHeight = '100vh';
                                                    modalImage.style.width = 'auto';
                                                    modalImage.style.height = 'auto';
                                                }
                                                const downloadButton = document.getElementById('downloadButton') as HTMLAnchorElement;
                                                modalImage.src = imgUrl;
                                                downloadButton.href = imgUrl;
                                            });
                                        });
                                    });
                                    
                                    //(event.currentTarget as HTMLElement).parentElement?.remove(); // Remover el pictograma del DOM
                                } catch (error) {
                                    console.error('Error:', error);
                                    alert('Hubo un error al eliminar el pictograma.');
                                }



                                
                            }
                        });
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
            } else {
                modalImage.style.maxWidth = 'none';
                modalImage.style.maxHeight = 'none';
                modalImage.style.width = '100vw';  // Maximizar al ancho de la ventana
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
