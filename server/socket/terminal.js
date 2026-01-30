const cookie = require('cookie-parser');
const { verifyToken } = require('../services/auth.service');
const terminalService = require('../services/terminal.service');
const { getDb } = require('../db');
const config = require('../config');
const jwt = require('jsonwebtoken');

function setupTerminalSocket(io) {
  const termNs = io.of('/terminal');

  // Auth middleware for socket
  termNs.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || '');
      const token = cookies.bpanel_token;
      if (!token) return next(new Error('Authentication required'));

      const user = jwt.verify(token, config.jwtSecret);
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  termNs.on('connection', (socket) => {
    let currentSessionId = null;

    socket.on('spawn', (data) => {
      const { sessionId, cols, rows } = data;

      // Verify session belongs to user
      const session = getDb()
        .prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?')
        .get(sessionId, socket.user.id);

      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      currentSessionId = sessionId;

      const term = terminalService.spawn(sessionId, session.working_directory, cols || 80, rows || 24);

      term.onData((data) => {
        socket.emit('data', data);
      });

      term.onExit(({ exitCode }) => {
        socket.emit('exit', exitCode);
      });
    });

    socket.on('data', (data) => {
      if (currentSessionId) {
        const term = terminalService.get(currentSessionId);
        if (term) term.write(data);
      }
    });

    socket.on('resize', ({ cols, rows }) => {
      if (currentSessionId) {
        terminalService.resize(currentSessionId, cols, rows);
      }
    });

    socket.on('disconnect', () => {
      if (currentSessionId) {
        terminalService.kill(currentSessionId);
      }
    });
  });
}

function parseCookies(cookieStr) {
  const cookies = {};
  cookieStr.split(';').forEach(pair => {
    const [key, ...val] = pair.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(val.join('='));
  });
  return cookies;
}

module.exports = { setupTerminalSocket };
