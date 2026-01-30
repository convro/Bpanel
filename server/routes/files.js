const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const fileService = require('../services/file.service');
const path = require('path');

const router = Router();
router.use(requireAuth);

// List directory
router.get('/list', (req, res) => {
  const dirPath = req.query.path || '/';
  try {
    const entries = fileService.listDirectory(dirPath);
    res.json({ path: path.resolve(dirPath), entries });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read file
router.get('/read', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Path required' });

  try {
    const content = fileService.readFile(filePath);
    const stats = fileService.getStats(filePath);
    res.json({ path: filePath, content, stats });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Save file
router.post('/save', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Path required' });

  try {
    fileService.writeFile(filePath, content);
    res.json({ ok: true, path: filePath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create directory
router.post('/mkdir', (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) return res.status(400).json({ error: 'Path required' });

  try {
    fileService.createDirectory(dirPath);
    res.json({ ok: true, path: dirPath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete file/directory
router.delete('/', (req, res) => {
  const entryPath = req.query.path;
  if (!entryPath) return res.status(400).json({ error: 'Path required' });

  try {
    fileService.deleteEntry(entryPath);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rename/move
router.post('/rename', (req, res) => {
  const { oldPath, newPath } = req.body;
  if (!oldPath || !newPath) return res.status(400).json({ error: 'oldPath and newPath required' });

  try {
    fileService.renameEntry(oldPath, newPath);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get file/dir stats
router.get('/stats', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Path required' });

  try {
    const stats = fileService.getStats(filePath);
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
