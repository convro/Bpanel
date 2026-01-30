const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { execSync } = require('child_process');

const router = Router();
router.use(requireAuth);

// List certificates
router.get('/', (req, res) => {
  try {
    const output = execSync('certbot certificates 2>&1', { timeout: 15000 }).toString();
    const certs = [];
    const blocks = output.split('Certificate Name:').slice(1);

    for (const block of blocks) {
      const name = block.split('\n')[0].trim();
      const domains = block.match(/Domains:\s*(.+)/);
      const expiry = block.match(/Expiry Date:\s*(.+?)(\s*\(|$)/);
      const path = block.match(/Certificate Path:\s*(.+)/);
      const valid = block.includes('VALID');

      certs.push({
        name,
        domains: domains ? domains[1].trim().split(/\s+/) : [],
        expiry: expiry ? expiry[1].trim() : null,
        path: path ? path[1].trim() : null,
        valid,
      });
    }

    res.json({ installed: true, certs });
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('not found') || msg.includes('No such')) {
      res.json({ installed: false, certs: [] });
    } else {
      res.json({ installed: true, certs: [], error: msg });
    }
  }
});

// Issue certificate
router.post('/issue', (req, res) => {
  const { domain, email } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });

  try {
    // Check certbot is installed
    execSync('which certbot', { timeout: 5000 });
  } catch {
    return res.status(400).json({ error: 'Certbot is not installed. Run: apt install certbot python3-certbot-nginx' });
  }

  try {
    const emailFlag = email ? `--email ${email}` : '--register-unsafely-without-email';
    const cmd = `certbot --nginx -d ${domain} ${emailFlag} --agree-tos --non-interactive --redirect 2>&1`;
    const output = execSync(cmd, { timeout: 120000 }).toString();
    res.json({ ok: true, output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Renew all certificates
router.post('/renew', (req, res) => {
  try {
    const output = execSync('certbot renew 2>&1', { timeout: 120000 }).toString();
    res.json({ ok: true, output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revoke certificate
router.delete('/:domain', (req, res) => {
  const { domain } = req.params;
  try {
    execSync(`certbot revoke --cert-name ${domain} --non-interactive --delete-after-revoke 2>&1`, { timeout: 30000 });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Install certbot
router.post('/install-certbot', (req, res) => {
  try {
    execSync('apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx 2>&1', { timeout: 120000 });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
