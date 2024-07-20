import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para servir archivos estáticos
app.use(express.static('dist'));

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
        prompt: 'Genera pictograma igual a @PictorIA con el contexto: ' + prompt,
        n: 1,
        size: '512x512',
        model: 'dall-e-2'
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
