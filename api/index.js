const serverless = require('serverless-http');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// --- Middleware ---

app.use(express.json());

// Sert les fichiers statiques dans /public (remonte d’un niveau car api/ est dans un sous-dossier)
app.use(express.static(path.join(__dirname, '../public')));

// Sessions (très basique, à sécuriser en prod)
app.use(
  session({
    secret: 'unePhraseSecreteAChanger', // change en variable d’env environement
    resave: false,
    saveUninitialized: false,
  })
);

// --- Données en mémoire (à remplacer par base de données en production) ---

const users = [
  // mot de passe hashé pour 'admin' ; exemple fourni ci-dessous
  {
    username: 'admin',
    passwordHash: '$2b$10$38KCF9WES5UaAOQkCCpB9u7JQhB6EEn1P2b5tmyt3.4IJO7ID1AmS',
    isAdmin: true,
  },
];

let infos = []; // alertes stockées en mémoire

// --- Middleware pour protéger les routes admin ---

function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Accès admin requis' });
}

// --- Routes API ---

// Get toutes les alertes
app.get('/api/infos', (req, res) => {
  res.json(infos);
});

// Poster une alerte
app.post('/api/infos', (req, res) => {
  const { lieu, type, description } = req.body;
  if (!lieu || !type) {
    return res.status(400).json({ error: 'Le lieu et le type sont obligatoires.' });
  }
  const alerte = {
    id: Date.now(),
    lieu,
    type,
    description: description || '',
    date: new Date().toISOString(),
  };
  infos.unshift(alerte);
  res.status(201).json(alerte);
});

// Connexion (authentification basique)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: 'Utilisateur inconnu' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

  req.session.user = { username: user.username, isAdmin: user.isAdmin };
  res.json({ username: user.username, isAdmin: user.isAdmin });
});

// Déconnexion
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Récupérer profil utilisateur connecté
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json(null);
  res.json({ username: req.session.user.username, isAdmin: req.session.user.isAdmin });
});

// Suppression d’une alerte (protégée admin)
app.delete('/api/infos/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = infos.findIndex((info) => info.id === id);
  if (index === -1) return res.status(404).json({ error: 'Alerte non trouvée' });
  infos.splice(index, 1);
  res.json({ success: true });
});

// Catch-all route 404 pour API inconnue
app.use((req, res) => res.status(404).json({ error: 'Endpoint inconnu' }));

// --- IMPORTANT : Pas de app.listen ici, serverless-http s’en charge ---

module.exports = serverless(app);
