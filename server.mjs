import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de dotenv
dotenv.config();

// Obtener el nombre de archivo y directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para servir archivos estáticos
app.use(express.static('dist'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Función para descargar una imagen y guardarla localmente
const downloadImage = async (url, filepath) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const buffer = await response.buffer();
  fs.writeFileSync(filepath, buffer);
};

app.post('/generate-image', async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    console.error('Prompt is required');
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: '1024x1024',  // Cambia el tamaño de la imagen a uno compatible
        model: 'dall-e-3'
      })
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(`Error in API request: ${response.status} ${response.statusText}`);
      console.error(`API response: ${errorMessage}`);
      throw new Error(`Error in API request: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error(`Error generating image: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/save-image', async (req, res) => {
  const { prompt, url } = req.body;

  if (!prompt || !url) {
    console.error('Prompt and URL are required');
    return res.status(400).json({ error: 'Prompt and URL are required' });
  }

  const usuarioId = 1; // Debes obtener esto de la sesión o del request
  const fechaCreacion = new Date().toISOString().split('T')[0];
  const imagePath = path.join(__dirname, 'images', `${Date.now()}.png`);

  try {
    await downloadImage(url, imagePath);
    const localUrl = `/images/${path.basename(imagePath)}`;

    await db.run(
      'INSERT INTO Pictograma (usuario_id, prompt, url_imagen, fecha_creacion) VALUES (?, ?, ?, ?)',
      [usuarioId, prompt, localUrl, fechaCreacion]
    );

    res.json({ message: 'Image saved successfully', url: localUrl });
  } catch (error) {
    console.error(`Error saving image: ${error.message}`);
    res.status(500).json({ error: 'Failed to save image locally' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
