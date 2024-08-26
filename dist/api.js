var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function generateImage(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return data.url;
    });
}
export function savePictogram(prompt, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('/save-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, url })
        });
        if (!response.ok) {
            throw new Error('Error al guardar la imagen.');
        }
        yield response.json();
    });
}
export function loadPictograms() {
    return __awaiter(this, arguments, void 0, function* (keyword = '') {
        const response = yield fetch(`/search-pictograms?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok)
            throw new Error('Error en la búsqueda');
        return yield response.json();
    });
}
