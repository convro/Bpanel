const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { spawnSync } = require('child_process');
const fs = require('fs');

const router = Router();
router.use(requireAuth);

// Validate domain name
function isValidDomain(domain) {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}[a-zA-Z0-9]$/.test(domain) && domain.includes('.');
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isCertbotInstalled() {
  const result = spawnSync('which', ['certbot'], { encoding: 'utf-8', timeout: 5000 });
  return result.status === 0;
}

// List certificates
router.get('/', (req, res) => {
  if (!isCertbotInstalled()) {
    return res.json({ installed: false, certs: [] });
  }

  const result = spawnSync('certbot', ['certificates'], { encoding: 'utf-8', timeout: 15000 });
  const output = (result.stdout || '') + (result.stderr || '');

  if (result.status !== 0 && !output.includes('Certificate Name')) {
    return res.json({ installed: true, certs: [], error: output.trim() });
  }

  const certs = [];
  const blocks = output.split('Certificate Name:').slice(1);
  for (const block of blocks) {
    const name = block.split('\n')[0].trim();
    const domains = block.match(/Domains:\s*(.+)/);
    const expiry = block.match(/Expiry Date:\s*(.+?)(\s*\(|$)/);
    const certPath = block.match(/Certificate Path:\s*(.+)/);
    const valid = block.includes('VALID') && !block.includes('INVALID');

    certs.push({
      name,
      domains: domains ? domains[1].trim().split(/\s+/) : [],
      expiry: expiry ? expiry[1].trim() : null,
      path: certPath ? certPath[1].trim() : null,
      valid,
    });
  }

  res.json({ installed: true, certs });
});

// Issue certificate
router.post('/issue', (req, res) => {
  const { domain, email } = req.body;

  if (!domain) return res.status(400).json({ error: 'Domain required' });
  if (!isValidDomain(domain)) return res.status(400).json({ error: 'Invalid domain name' });
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address' });

  if (!isCertbotInstalled()) {
    return res.status(400).json({ error: 'Certbot is not installed. Install it first.' });
  }

  const args = ['--nginx', '-d', domain, '--agree-tos', '--non-interactive', '--redirect'];
  if (email) {
    args.push('--email', email);
  } else {
    args.push('--register-unsafely-without-email');
  }

  const result = spawnSync('certbot', args, { encoding: 'utf-8', timeout: 120000 });
  const output = (result.stdout || '') + (result.stderr || '');

  if (result.status !== 0) {
    return res.status(500).json({ error: output.trim() || 'Certbot failed' });
  }

  res.json({ ok: true, output: output.trim() });
});

// Renew all certificates
router.post('/renew', (req, res) => {
  const result = spawnSync('certbot', ['renew'], { encoding: 'utf-8', timeout: 120000 });
  const output = (result.stdout || '') + (result.stderr || '');

  if (result.status !== 0) {
    return res.status(500).json({ error: output.trim() || 'Renewal failed' });
  }

  res.json({ ok: true, output: output.trim() });
});

// Revoke certificate
router.delete('/:domain', (req, res) => {
  const domain = req.params.domain;
  if (!isValidDomain(domain) && !/^[a-zA-Z0-9_.-]+$/.test(domain)) {
    return res.status(400).json({ error: 'Invalid certificate name' });
  }

  const result = spawnSync('certbot', [
    'delete', '--cert-name', domain, '--non-interactive'
  ], { encoding: 'utf-8', timeout: 30000 });

  const output = (result.stdout || '') + (result.stderr || '');

  if (result.status !== 0) {
    return res.status(500).json({ error: output.trim() || 'Revoke failed' });
  }

  res.json({ ok: true });
});

// Install certbot
router.post('/install-certbot', (req, res) => {
  const update = spawnSync('apt-get', ['update', '-qq'], { encoding: 'utf-8', timeout: 120000 });
  if (update.status !== 0) {
    return res.status(500).json({ error: 'apt-get update failed: ' + (update.stderr || '') });
  }

  const install = spawnSync('apt-get', ['install', '-y', '-qq', 'certbot', 'python3-certbot-nginx'], {
    encoding: 'utf-8', timeout: 180000
  });

  if (install.status !== 0) {
    return res.status(500).json({ error: 'Installation failed: ' + (install.stderr || '') });
  }

  res.json({ ok: true });
});

module.exports = router;
