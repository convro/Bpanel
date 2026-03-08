const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { init: initDb } = require('./db');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const fileRoutes = require('./routes/files');
const systemRoutes = require('./routes/system');
const domainRoutes = require('./routes/domains');
const sslRoutes = require('./routes/ssl');
const databaseRoutes = require('./routes/databases');
const logRoutes = require('./routes/logs');
const gitRoutes = require('./routes/git');
const processRoutes = require('./routes/processes');
const { setupTerminalSocket } = require('./socket/terminal');

function createServer() {
  initDb();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  // Rate limiting for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // General API rate limit
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300,
    message: { error: 'Rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // API routes
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api', apiLimiter);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/system', systemRoutes);
  app.use('/api/domains', domainRoutes);
  app.use('/api/ssl', sslRoutes);
  app.use('/api/databases', databaseRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/git', gitRoutes);
  app.use('/api/processes', processRoutes);

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
