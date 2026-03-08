const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { spawnSync } = require('child_process');

const router = Router();
router.use(requireAuth);

// List processes
router.get('/', (req, res) => {
  const result = spawnSync('ps', ['aux', '--sort=-%cpu'], { encoding: 'utf-8', timeout: 10000 });
  if (result.status !== 0) return res.status(500).json({ error: 'Failed to list processes' });

  const lines = result.stdout.split('\n').filter(Boolean);
  const header = lines[0];
  const processes = lines.slice(1).map(line => {
    const cols = line.trim().split(/\s+/);
    return {
      user: cols[0],
      pid: parseInt(cols[1]),
      cpu: parseFloat(cols[2]),
      mem: parseFloat(cols[3]),
      vsz: parseInt(cols[4]),
      rss: parseInt(cols[5]),
      stat: cols[7],
      start: cols[8],
      time: cols[9],
      command: cols.slice(10).join(' '),
    };
  }).filter(p => p.pid && !isNaN(p.pid));

  res.json(processes);
});

// Kill a process
router.delete('/:pid', (req, res) => {
  const pid = parseInt(req.params.pid);
  if (!Number.isInteger(pid) || pid <= 0) return res.status(400).json({ error: 'Invalid PID' });

  // Don't allow killing init or bpanel itself
  if (pid === 1 || pid === process.pid) {
    return res.status(403).json({ error: 'Cannot kill this process' });
  }

  const signal = req.body?.signal || 'TERM';
  const validSignals = ['TERM', 'KILL', 'HUP', 'INT', 'QUIT', 'USR1', 'USR2'];
  if (!validSignals.includes(signal)) return res.status(400).json({ error: 'Invalid signal' });

  const result = spawnSync('kill', [`-${signal}`, String(pid)], { encoding: 'utf-8', timeout: 5000 });
  if (result.status !== 0) {
    return res.status(500).json({ error: (result.stderr || 'Kill failed').trim() });
  }
  res.json({ ok: true });
});

// PM2 list (if installed)
router.get('/pm2', (req, res) => {
  const result = spawnSync('pm2', ['jlist'], { encoding: 'utf-8', timeout: 10000 });
  if (result.status !== 0) {
    return res.json({ installed: false, processes: [] });
  }
  try {
    const list = JSON.parse(result.stdout);
    res.json({ installed: true, processes: list });
  } catch {
    res.json({ installed: true, processes: [], raw: result.stdout });
  }
});

// PM2 action (restart/stop/start/delete)
router.post('/pm2/:action/:name', (req, res) => {
  const { action, name } = req.params;
  const validActions = ['restart', 'stop', 'start', 'delete', 'reload'];
  if (!validActions.includes(action)) return res.status(400).json({ error: 'Invalid action' });
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) return res.status(400).json({ error: 'Invalid process name' });

  const result = spawnSync('pm2', [action, name], { encoding: 'utf-8', timeout: 15000 });
  const output = (result.stdout || '') + (result.stderr || '');
  if (result.status !== 0) return res.status(500).json({ error: output.trim() });
  res.json({ ok: true, output: output.trim() });
});

module.exports = router;
