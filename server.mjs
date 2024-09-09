import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import openDb from './database.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import session from 'express-session';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar express-session
app.use(session({
  secret: 'K/n3o85TUZbp', // Cambia esto por una clave secreta segura
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambiar a true si usas HTTPS
}));

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
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    console.log('Id Usuario ', userId);
    try {
        const db = await openDb();
        const pictograms = await db.all(
          'SELECT * FROM Pictograma WHERE usuario_id = ? and estado = "V" ORDER BY fecha_creacion', [userId]);

        if (pictograms.length === 0) {
            console.log('No se encontraron pictogramas.');
            return res.status(404).json({ error: 'No hay pictogramas guardados.' });
        }

        res.status(200).json(pictograms);
    } catch (error) {
        console.error('Error al obtener los pictogramas:', error);
        res.status(500).json({ error: 'Error al obtener los pictogramas.' });
    }
});

app.post('/save-image', async (req, res) => {
    const { prompt, url } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!prompt || !url) {
      console.error('Prompt and URL are required');
      return res.status(400).json({ error: 'Prompt and URL are required' });
    }

    const usuarioId = userId; // Debes obtener esto de la sesión o del request
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
  const userId = req.session.userId;
  console.log("serach-pictograms ", "userId: ", userId);
    if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

  try {
      const db = await openDb();
      const query = `
          SELECT * FROM Pictograma WHERE prompt LIKE ? and estado = 'V' and usuario_id = ?
      `;
      const pictograms = await db.all(query, [`%${keyword}%`, userId]);

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

app.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
      const db = await openDb();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.run('INSERT INTO Usuario (nombre, email, password, fecha_registro) VALUES (?, ?, ?, current_date)', [nombre, email, hashedPassword]);

      res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ error: 'Error en el registro de usuario' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const db = await openDb();
      const user = await db.get('SELECT * FROM Usuario WHERE email = ?', [email]);

      if (user && await bcrypt.compare(password, user.password)) {
          // Aquí podrías generar un token de sesión o JWT si es necesario
          // Guardar el ID del usuario en la sesión
          req.session.userId = user.id;
          res.status(200).json({ message: 'Inicio de sesión exitoso', token: '' });
      } else {
          res.status(401).json({ error: 'Credenciales inválidas' });
      }
  } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
