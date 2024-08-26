import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import openDb from './database.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

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
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
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
        prompt: 'Descripción del Pictograma: ' + prompt + ' Estilo Visual: "Colores vivos y contrastantes, estilo simple y claro." Comprensión: "Para niños de 5 a 15 años de edad."',
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

app.get('/get-pictograms', async (req, res) => {

    const { keyword } = req.query;

    try {
        const db = await openDb();
        const pictograms = await db.all(
          'SELECT prompt, url_imagen, estado FROM Pictograma WHERE usuario_id = ? ORDER BY fecha_creacion', [1]);

        if (pictograms.length === 0) {
            console.log('No se encontraron pictogramas.');
            return res.status(404).json({ error: 'No se encontraron pictogramas.' });
        }

        console.log('Pictogramas encontrados:', pictograms);
        res.status(200).json(pictograms);
    } catch (error) {
        console.error('Error al obtener los pictogramas:', error);
        res.status(500).json({ error: 'Error al obtener los pictogramas.' });
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

        const db = await openDb();
        await db.run('INSERT INTO Pictograma (usuario_id, prompt, url_imagen, fecha_creacion, estado) VALUES (?, ?, ?, ? , "V")', [usuarioId, prompt, localUrl, fechaCreacion]);

        res.status(201).json({ message: 'Pictograma guardado con éxito', url: localUrl });
    } catch (error) {
        console.error('Error al guardar el pictograma:', error);
        res.status(500).json({ error: 'Error al guardar el pictograma.' });
    }
});

app.get('/search-pictograms', async (req, res) => {
  const { keyword } = req.query;

  try {
      const db = await openDb();
      const query = `
          SELECT * FROM Pictograma WHERE prompt LIKE ? 
      `;
      const pictograms = await db.all(query, [`%${keyword}%`]);

      res.json(pictograms);
  } catch (error) {
      console.error('Error al buscar pictogramas:', error);
      res.status(500).json({ error: 'Error al buscar pictogramas' });
  }
});

app.post('/delete-pictogram', async (req, res) => {
  const { id } = req.body;

  try {
      const db = await openDb();
      await db.run('UPDATE Pictograma SET estado = "A" WHERE id = ?', [id]);
      res.status(200).json({ message: 'Pictograma anulado con éxito' });
  } catch (error) {
      console.error('Error al anular pictograma:', error);
      res.status(500).json({ error: 'Error al anular el pictograma' });
  }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
