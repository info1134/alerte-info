const express = require('express');
const path = require('path');

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Sert les fichiers statiques dans le dossier public (ex : index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Exemple d’API simple (optionnel)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Bonjour depuis le serveur Express!' });
});

// Le serveur écoute sur le port indiqué par Railway, sinon 3000 par défaut
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { ... });