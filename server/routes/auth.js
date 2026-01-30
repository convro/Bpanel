const { Router } = require('express');
const authService = require('../services/auth.service');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Check if setup is needed (no users yet)
router.get('/status', (req, res) => {
  const userCount = authService.getUserCount();
  const needsSetup = userCount === 0;

  // Check if current user is authenticated
  let user = null;
  const token = req.cookies.bpanel_token;
  if (token) {
    try {
      user = authService.verifyToken(token);
    } catch {}
  }

  res.json({ needsSetup, user });
});

router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Only allow registration if no users exist (first setup) or user is authenticated
  const userCount = authService.getUserCount();
  if (userCount > 0) {
    const token = req.cookies.bpanel_token;
    if (!token) {
      return res.status(403).json({ error: 'Registration is closed' });
    }
    try {
      authService.verifyToken(token);
    } catch {
      return res.status(403).json({ error: 'Registration is closed' });
    }
  }

  const existing = authService.findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const user = authService.createUser(username, password);
  const token = authService.generateToken(user);

  res.cookie('bpanel_token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });

  res.json({ user: { id: user.id, username: user.username } });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = authService.findUserByUsername(username);
  if (!user || !authService.verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = authService.generateToken(user);

  res.cookie('bpanel_token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });

  res.json({ user: { id: user.id, username: user.username } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('bpanel_token');
  res.json({ ok: true });
});

module.exports = router;
