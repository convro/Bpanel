const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { spawn } = require('child_process');
const fs = require('fs');

const router = Router();
router.use(requireAuth);

// Available log sources
const LOG_SOURCES = {
  nginx_access: { type: 'file', path: '/var/log/nginx/access.log', label: 'Nginx Access' },
  nginx_error: { type: 'file', path: '/var/log/nginx/error.log', label: 'Nginx Error' },
  syslog: { type: 'journald', unit: 'syslog', label: 'Syslog' },
  nginx: { type: 'journald', unit: 'nginx', label: 'Nginx Service' },
  bpanel: { type: 'journald', unit: 'bpanel', label: 'Bpanel Service' },
};

// Get list of available sources
router.get('/sources', (req, res) => {
  const available = [];
  for (const [key, src] of Object.entries(LOG_SOURCES)) {
    if (src.type === 'file') {
      available.push({ key, label: src.label, available: fs.existsSync(src.path) });
    } else {
      available.push({ key, label: src.label, available: true });
    }
  }
  res.json(available);
});

// Tail a log source via SSE
router.get('/stream/:source', (req, res) => {
  const sourceKey = req.params.source;
  const src = LOG_SOURCES[sourceKey];
  if (!src) return res.status(404).json({ error: 'Unknown log source' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let child;

  if (src.type === 'file') {
    if (!fs.existsSync(src.path)) {
      res.write(`data: ${JSON.stringify({ line: `[Log file not found: ${src.path}]`, ts: new Date().toISOString() })}\n\n`);
      res.end();
      return;
    }
    child = spawn('tail', ['-n', '100', '-f', src.path], { stdio: ['ignore', 'pipe', 'pipe'] });
  } else {
    child = spawn('journalctl', ['-u', src.unit, '-n', '100', '-f', '--no-pager', '--output=short-iso'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }

  const send = (line) => {
    if (line.trim()) {
      res.write(`data: ${JSON.stringify({ line: line.trim(), ts: new Date().toISOString() })}\n\n`);
    }
  };

  child.stdout.on('data', (data) => {
    data.toString().split('\n').forEach(send);
  });

  child.stderr.on('data', (data) => {
    data.toString().split('\n').forEach(send);
  });

  req.on('close', () => {
    try { child.kill(); } catch {}
  });
});

// Get last N lines of a log
router.get('/tail/:source', (req, res) => {
  const sourceKey = req.params.source;
  const src = LOG_SOURCES[sourceKey];
  const lines = Math.min(parseInt(req.query.lines) || 200, 1000);
  if (!src) return res.status(404).json({ error: 'Unknown log source' });

  let child;
  if (src.type === 'file') {
    if (!fs.existsSync(src.path)) return res.json({ lines: [] });
    child = spawn('tail', ['-n', String(lines), src.path], { encoding: 'utf-8' });
  } else {
    child = spawn('journalctl', ['-u', src.unit, '-n', String(lines), '--no-pager', '--output=short-iso'], {
      encoding: 'utf-8'
    });
  }

  let output = '';
  child.stdout.on('data', d => { output += d; });
  child.stderr.on('data', d => { output += d; });
  child.on('close', () => {
    res.json({ lines: output.split('\n').filter(l => l.trim()) });
  });
  child.on('error', (err) => {
    res.json({ lines: [], error: err.message });
  });
});

module.exports = router;
