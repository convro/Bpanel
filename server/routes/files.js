const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const fileService = require('../services/file.service');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const archiver = require('archiver');
const config = require('../config');

const router = Router();
router.use(requireAuth);

// Multer storage - save to temp upload dir
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(config.uploadDir, { recursive: true });
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

// Validate path - no traversal, must be absolute
function safePath(p) {
  if (!p) throw new Error('Path required');
  const resolved = path.resolve(p);
  // Block access to bpanel's own data directory
  const dataDir = path.resolve(config.dataDir);
  if (resolved.startsWith(dataDir)) {
    throw new Error('Access denied to this path');
  }
  return resolved;
}

// List directory
router.get('/list', (req, res) => {
  try {
    const dirPath = safePath(req.query.path || '/');
    const entries = fileService.listDirectory(dirPath);
    res.json({ path: dirPath, entries });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read file
router.get('/read', (req, res) => {
  try {
    const filePath = safePath(req.query.path);
    const stat = fs.statSync(filePath);
    if (stat.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large to edit (>10MB)' });
    }
    const content = fileService.readFile(filePath);
    const stats = fileService.getStats(filePath);
    res.json({ path: filePath, content, stats });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Download file
router.get('/download', (req, res) => {
  try {
    const filePath = safePath(req.query.path);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Zip directory
      const name = path.basename(filePath);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${name}.zip"`);
      const archive = archiver('zip', { zlib: { level: 6 } });
      archive.on('error', (err) => { if (!res.headersSent) res.status(500).json({ error: err.message }); });
      archive.pipe(res);
      archive.directory(filePath, name);
      archive.finalize();
    } else {
      res.download(filePath, path.basename(filePath));
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Save file
router.post('/save', (req, res) => {
  try {
    const filePath = safePath(req.body.path);
    fileService.writeFile(filePath, req.body.content || '');
    res.json({ ok: true, path: filePath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload files
router.post('/upload', upload.array('files', 50), (req, res) => {
  try {
    const destDir = safePath(req.body.path || '/tmp');
    if (!fs.existsSync(destDir)) {
      return res.status(400).json({ error: 'Destination directory does not exist' });
    }

    const results = [];
    for (const file of req.files || []) {
      const destPath = path.join(destDir, file.originalname.replace(/[^a-zA-Z0-9._\-\s]/g, '_'));
      fs.renameSync(file.path, destPath);
      results.push({ name: file.originalname, size: file.size, path: destPath });
    }

    res.json({ ok: true, uploaded: results });
  } catch (err) {
    // Clean up temp files on error
    for (const file of req.files || []) {
      try { fs.unlinkSync(file.path); } catch {}
    }
    res.status(400).json({ error: err.message });
  }
});

// Create directory
router.post('/mkdir', (req, res) => {
  try {
    const dirPath = safePath(req.body.path);
    fileService.createDirectory(dirPath);
    res.json({ ok: true, path: dirPath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete file/directory
router.delete('/', (req, res) => {
  try {
    const entryPath = safePath(req.query.path);
    fileService.deleteEntry(entryPath);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rename/move
router.post('/rename', (req, res) => {
  try {
    const oldPath = safePath(req.body.oldPath);
    const newPath = safePath(req.body.newPath);
    fileService.renameEntry(oldPath, newPath);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get file/dir stats
router.get('/stats', (req, res) => {
  try {
    const filePath = safePath(req.query.path);
    res.json(fileService.getStats(filePath));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
