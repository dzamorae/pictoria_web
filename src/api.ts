import { Pictogram } from './pictogram.js';

export async function generateImage(prompt: string): Promise<string> {
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
    return data.url;
}

export async function savePictogram(prompt: string, url: string): Promise<void> {
    const response = await fetch('/save-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, url })
    });

    if (!response.ok) {
        throw new Error('Error al guardar la imagen.');
    }

    await response.json();
}

export async function loadPictograms(keyword: string = ''): Promise<Pictogram[]> {
    const response = await fetch(`/search-pictograms?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error('Error en la búsqueda');

    return await response.json();
}
