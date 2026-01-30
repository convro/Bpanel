const pty = require('node-pty');

const terminals = new Map();

function spawn(sessionId, cwd, cols = 80, rows = 24) {
  kill(sessionId);

  const shell = process.env.SHELL || '/bin/bash';
  const term = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
    },
  });

  terminals.set(sessionId, term);
  return term;
}

function get(sessionId) {
  return terminals.get(sessionId);
}

function kill(sessionId) {
  const term = terminals.get(sessionId);
  if (term) {
    try { term.kill(); } catch {}
    terminals.delete(sessionId);
  }
}

function resize(sessionId, cols, rows) {
  const term = terminals.get(sessionId);
  if (term) {
    try { term.resize(cols, rows); } catch {}
  }
}

module.exports = { spawn, get, kill, resize };
