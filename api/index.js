const serverless = require('serverless-http');
const express = require('express');
const path = require('path');

const app = express();

// ...copie TOUT ton code express classique ICI
// (middlewares, routes, infos etc.)

module.exports = serverless(app);
