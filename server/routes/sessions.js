const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getDb } = require('../db');

const router = Router();
router.use(requireAuth);

// List sessions
router.get('/', (req, res) => {
  const sessions = getDb()
    .prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY last_accessed DESC')
    .all(req.user.id);
  res.json(sessions);
});

// Create session
router.post('/', (req, res) => {
  const { name, working_directory } = req.body;

  if (!name || !working_directory) {
    return res.status(400).json({ error: 'Name and working_directory required' });
  }

  const result = getDb()
    .prepare('INSERT INTO sessions (user_id, name, working_directory) VALUES (?, ?, ?)')
    .run(req.user.id, name, working_directory);

  const session = getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid);
  res.json(session);
});

// Get session
router.get('/:id', (req, res) => {
  const session = getDb()
    .prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Update last accessed
  getDb().prepare('UPDATE sessions SET last_accessed = datetime(\'now\') WHERE id = ?').run(session.id);

  res.json(session);
});

// Update session
router.put('/:id', (req, res) => {
  const { name, working_directory } = req.body;
  const session = getDb()
    .prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  getDb()
    .prepare('UPDATE sessions SET name = COALESCE(?, name), working_directory = COALESCE(?, working_directory), last_accessed = datetime(\'now\') WHERE id = ?')
    .run(name || null, working_directory || null, session.id);

  const updated = getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(session.id);
  res.json(updated);
});

// Delete session
router.delete('/:id', (req, res) => {
  const session = getDb()
    .prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  getDb().prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
  res.json({ ok: true });
});

module.exports = router;
