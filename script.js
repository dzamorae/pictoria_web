var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var API_KEY = '';
var API_URL = 'https://api.openai.com/v1/images/generations';
//const MODEL = 'gpt-4'; // Especifica el modelo DALL-E 3
function generateImage(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer ".concat(API_KEY)
                        },
                        body: JSON.stringify({
                            model: 'dall-e-3', // Incluye el modelo en la solicitud
                            //role: 'system', 
                            //content: 'Eres un experto en Comunicación Aumentativa y Alternativa (CAA). Genera pictogramas simples y explícitos sin fondos.',
                            prompt: 'Genera un pictograma de acuerdo al contexto ' + prompt + ' para niños de edad de 5 a 10 años',
                            n: 1,
                            size: '512x512' // Cambia el tamaño de la imagen aquí si es necesario
                        })
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.log(response);
                        throw new Error("Error en la solicitud: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data.data[0].url];
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('imageForm');
    var promptInput = document.getElementById('prompt');
    var imageContainer = document.getElementById('imageContainer');
    var voiceButton = document.getElementById('voiceButton');
    if (form && promptInput && imageContainer) {
        form.addEventListener('submit', function (event) { return __awaiter(_this, void 0, void 0, function () {
            var prompt, imageUrl, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        prompt = promptInput.value;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, generateImage(prompt)];
                    case 2:
                        imageUrl = _a.sent();
                        imageContainer.innerHTML = "<img src=\"".concat(imageUrl, "\" alt=\"Generated Image\">");
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error generating image:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    }
    else {
        console.error('Form or input elements not found.');
    }
    if (voiceButton && promptInput) {
        var recognition_1 = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition_1.lang = 'es-ES';
        recognition_1.interimResults = false;
        recognition_1.maxAlternatives = 1;
        voiceButton.addEventListener('click', function () {
            recognition_1.start();
        });
        recognition_1.addEventListener('result', function (event) {
            var lastResultIndex = event.results.length - 1;
            var transcript = event.results[lastResultIndex][0].transcript;
            promptInput.value = transcript;
        });
        recognition_1.addEventListener('speechend', function () {
            recognition_1.stop();
        });
        recognition_1.addEventListener('error', function (event) {
            console.error('Speech recognition error', event.error);
        });
    }
});
