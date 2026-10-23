// src/setupProxy.js — Local development proxy for Vercel Serverless Functions in Create React App
const express = require('express');
const path = require('path');

let chatHandler;
try {
  chatHandler = require(path.resolve(__dirname, '../api/chat.js'));
} catch (e) {
  console.warn('[setupProxy] Warning: Could not load api/chat.js:', e.message);
}

module.exports = function (app) {
  // Ensure JSON bodies are parsed for /api routes
  app.use('/api', express.json());

  app.all('/api/chat', async (req, res) => {
    if (!chatHandler) {
      return res.status(500).json({ error: 'Serverless function api/chat is not available.' });
    }
    try {
      await chatHandler(req, res);
    } catch (err) {
      console.error('[setupProxy] Error executing api/chat handler:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
      }
    }
  });
};
