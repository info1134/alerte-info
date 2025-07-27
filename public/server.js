const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Utilisateurs en mémoire (à remplacer par base de données en production)
const users = [
  // mot de passe = 'admin'
  { username: 'admin', passwordHash: '$2b$10$38KCF9WES5UaAOQkCCpB9u7JQhB6EEn1P2b5tmyt3.4IJO7ID1AmS', isAdmin: true }
];
let infos = []; // Alertes stockées en mémoire (remplaçable par BDD)

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session (simple, à sécuriser en prod)
app.use(session({
  secret: 'unePhraseSecreteAChanger', resave: false, saveUninitialized: false
}));

// Middleware auth admin
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) return next();
  res.status(403).json({ error: 'Accès admin requis' });
}

// --- ROUTES API PUBLIQUES ---

// Récupérer toutes les alertes
app.get('/api/infos', (req, res) => {
  res.json(infos);
});

// Publier une alerte
app.post('/api/infos', (req, res) => {
  const { lieu, type, description } = req.body;
  if (!lieu || !type) {
    return res.status(400).json({ error: "Le lieu et le type sont obligatoires." });
  }
  const alerte = {
    id: Date.now(),
    lieu,
    type,
    description: description || "",
    date: new Date().toISOString()
  };
  infos.unshift(alerte);
  res.status(201).json(alerte);
});

// --- AUTHENTIFICATION BASIQUE ---

// Connexion
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: "Utilisateur inconnu" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Mot de passe incorrect" });

  req.session.user = { username: user.username, isAdmin: user.isAdmin };
  res.json({ username: user.username, isAdmin: user.isAdmin });
});

// Déconnexion
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// --- ROUTES ADMIN ---

// Voir toutes les alertes (pour admin)
app.get('/admin/alerts', requireAdmin, (req, res) => {
  res.json(infos);
});

// Supprimer une alerte (DELETE)
app.delete('/api/infos/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = infos.findIndex(info => info.id === id);
  if (index === -1) return res.status(404).json({ error: 'Alerte non trouvée' });
  infos.splice(index, 1);
  res.json({ success: true });
});

// Récupérer profil user connecté
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json(null);
  res.json({ username: req.session.user.username, isAdmin: req.session.user.isAdmin });
});

// --- SECURITÉ ---
app.use((req, res) => res.status(404).json({ error: "Endpoint inconnu" }));

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
