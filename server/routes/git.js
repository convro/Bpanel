const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { spawnSync } = require('child_process');
const path = require('path');

const router = Router();
router.use(requireAuth);

function git(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf-8',
    timeout: 30000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    output: ((result.stdout || '') + (result.stderr || '')).trim(),
  };
}

function isGitRepo(dir) {
  const result = git(['rev-parse', '--git-dir'], dir);
  return result.ok;
}

// Status
router.get('/status', (req, res) => {
  const dir = req.query.path;
  if (!dir) return res.status(400).json({ error: 'path required' });

  if (!isGitRepo(dir)) {
    return res.json({ isGit: false });
  }

  const status = git(['status', '--porcelain', '-u'], dir);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], dir);
  const remote = git(['remote', 'get-url', 'origin'], dir);
  const log = git(['log', '--oneline', '-10'], dir);
  const ahead = git(['rev-list', 'HEAD..@{upstream}', '--count'], dir);
  const behind = git(['rev-list', '@{upstream}..HEAD', '--count'], dir);

  const files = (status.stdout || '').split('\n').filter(Boolean).map(line => ({
    status: line.substring(0, 2).trim(),
    path: line.substring(3),
  }));

  res.json({
    isGit: true,
    branch: branch.stdout,
    remote: remote.ok ? remote.stdout : null,
    files,
    log: log.stdout.split('\n').filter(Boolean),
    ahead: parseInt(ahead.stdout) || 0,
    behind: parseInt(behind.stdout) || 0,
  });
});

// Init repo
router.post('/init', (req, res) => {
  const { path: dir } = req.body;
  if (!dir) return res.status(400).json({ error: 'path required' });
  const result = git(['init'], dir);
  if (!result.ok) return res.status(500).json({ error: result.output });
  res.json({ ok: true, output: result.output });
});

// Pull
router.post('/pull', (req, res) => {
  const { path: dir } = req.body;
  if (!dir) return res.status(400).json({ error: 'path required' });
  const result = git(['pull'], dir);
  if (!result.ok) return res.status(500).json({ error: result.output });
  res.json({ ok: true, output: result.output });
});

// Commit
router.post('/commit', (req, res) => {
  const { path: dir, message, addAll } = req.body;
  if (!dir || !message) return res.status(400).json({ error: 'path and message required' });

  if (addAll) {
    const addResult = git(['add', '-A'], dir);
    if (!addResult.ok) return res.status(500).json({ error: addResult.output });
  }

  const result = git(['commit', '-m', message], dir);
  if (!result.ok && !result.output.includes('nothing to commit')) {
    return res.status(500).json({ error: result.output });
  }
  res.json({ ok: true, output: result.output });
});

// Push
router.post('/push', (req, res) => {
  const { path: dir, branch } = req.body;
  if (!dir) return res.status(400).json({ error: 'path required' });
  const args = ['push'];
  if (branch) args.push('origin', branch);
  const result = git(args, dir);
  if (!result.ok) return res.status(500).json({ error: result.output });
  res.json({ ok: true, output: result.output });
});

// Clone
router.post('/clone', (req, res) => {
  const { url, destDir } = req.body;
  if (!url || !destDir) return res.status(400).json({ error: 'url and destDir required' });
  // Basic URL validation - only allow git/https/ssh protocols
  if (!/^(https?:\/\/|git@|ssh:\/\/)/.test(url)) {
    return res.status(400).json({ error: 'Invalid repository URL' });
  }
  const result = git(['clone', url, destDir], '/tmp');
  if (!result.ok) return res.status(500).json({ error: result.output });
  res.json({ ok: true, output: result.output });
});

// Discard changes to a file
router.post('/discard', (req, res) => {
  const { path: dir, file } = req.body;
  if (!dir || !file) return res.status(400).json({ error: 'path and file required' });
  const result = git(['checkout', '--', file], dir);
  if (!result.ok) return res.status(500).json({ error: result.output });
  res.json({ ok: true });
});

module.exports = router;
