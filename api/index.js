const serverless = require('serverless-http');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// ---- (copie ton code serveur ici, sans app.listen !) ----

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ... Middleware, infos, users, routes GET/POST/DELETE, etc.
// (Tout ton ancien code de server.js SAUF app.listen !)

// Exemple : route test GET
app.get('/api/infos', (req, res) => {
  res.json([{ lieu: 'Carcassonne', type: 'Test', description: 'Démo', date: new Date().toISOString() }]);
});

// ---------------------------------------------------------

module.exports = serverless(app);
