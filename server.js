const express = require('express');
const path = require('path');

const app = express();

// On ne fixe pas PORT à 3000 fixe, on utilise process.env.PORT pour les plateformes comme Railway
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Stockage temporaire en mémoire (à remplacer par une base en prod)
let infos = [];

// API pour récupérer les infos
app.get('/api/infos', (req, res) => {
  res.json(infos);
});

// API pour poster une info
app.post('/api/infos', (req, res) => {
  const { lieu, type, description } = req.body;

  if (!lieu || !type) {
    return res.status(400).json({ error: 'Lieu et type sont requis' });
  }

  const newInfo = {
    id: Date.now(),
    lieu,
    type,
    description: description || '',
    date: new Date().toISOString(),
  };

  infos.unshift(newInfo);
  res.status(201).json(newInfo);
});

// Lancement du serveur sur port défini, avec message dans la console
app.listen(PORT, () => {
  console.log('Serveur démarré sur le port ' + PORT);
});


