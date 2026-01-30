const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config');
const { init: initDb } = require('./db');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const fileRoutes = require('./routes/files');
const systemRoutes = require('./routes/system');
const domainRoutes = require('./routes/domains');
const sslRoutes = require('./routes/ssl');
const databaseRoutes = require('./routes/databases');
const { setupTerminalSocket } = require('./socket/terminal');

function createServer() {
  initDb();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/system', systemRoutes);
  app.use('/api/domains', domainRoutes);
  app.use('/api/ssl', sslRoutes);
  app.use('/api/databases', databaseRoutes);

  // Static files
  app.use(express.static(config.publicDir));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(config.publicDir, 'index.html'));
  });

  // WebSocket
  setupTerminalSocket(io);

  return { app, server, io };
}

module.exports = { createServer };
