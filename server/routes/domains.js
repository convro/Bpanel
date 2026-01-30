const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = Router();
router.use(requireAuth);

const SITES_AVAILABLE = '/etc/nginx/sites-available';
const SITES_ENABLED = '/etc/nginx/sites-enabled';

// List domains
router.get('/', (req, res) => {
  try {
    const domains = [];
    if (fs.existsSync(SITES_AVAILABLE)) {
      const files = fs.readdirSync(SITES_AVAILABLE).filter(f => f !== 'default');
      for (const file of files) {
        const content = fs.readFileSync(path.join(SITES_AVAILABLE, file), 'utf-8');
        const serverName = content.match(/server_name\s+([^;]+);/);
        const root = content.match(/root\s+([^;]+);/);
        const enabled = fs.existsSync(path.join(SITES_ENABLED, file));
        const hasSSL = content.includes('ssl_certificate') || content.includes('listen 443');
        domains.push({
          file,
          domain: serverName ? serverName[1].trim() : file,
          root: root ? root[1].trim() : null,
          enabled,
          hasSSL,
        });
      }
    }
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add domain
router.post('/', (req, res) => {
  const { domain, rootDir, proxyPort } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });

  const safeName = domain.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Create web root if static site
  let webRoot = rootDir || `/var/www/${safeName}`;
  let config;

  if (proxyPort) {
    // Reverse proxy config
    config = `server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://127.0.0.1:${proxyPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;
  } else {
    // Static site config
    fs.mkdirSync(webRoot, { recursive: true });

    // Create default index.html
    const indexPath = path.join(webRoot, 'index.html');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, `<!DOCTYPE html>
<html>
<head><title>${domain}</title></head>
<body>
<h1>${domain}</h1>
<p>Site is live. Replace this file at ${webRoot}/index.html</p>
</body>
</html>
`);
    }

    config = `server {
    listen 80;
    server_name ${domain};
    root ${webRoot};
    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
    }
}
`;
  }

  try {
    fs.writeFileSync(path.join(SITES_AVAILABLE, safeName), config);
    // Enable site
    const enabledPath = path.join(SITES_ENABLED, safeName);
    if (!fs.existsSync(enabledPath)) {
      fs.symlinkSync(path.join(SITES_AVAILABLE, safeName), enabledPath);
    }
    // Test and reload nginx
    execSync('nginx -t 2>&1', { timeout: 10000 });
    execSync('systemctl reload nginx', { timeout: 10000 });

    res.json({
      ok: true,
      domain,
      root: proxyPort ? null : webRoot,
      proxyPort: proxyPort || null,
      file: safeName,
      dnsRecord: {
        type: 'A',
        name: domain,
        value: getServerIP(),
        ttl: 3600,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Nginx config error: ' + err.message });
  }
});

// Toggle enable/disable
router.post('/:name/toggle', (req, res) => {
  const { name } = req.params;
  const enabledPath = path.join(SITES_ENABLED, name);
  const availPath = path.join(SITES_AVAILABLE, name);

  if (!fs.existsSync(availPath)) {
    return res.status(404).json({ error: 'Domain config not found' });
  }

  try {
    if (fs.existsSync(enabledPath)) {
      fs.unlinkSync(enabledPath);
    } else {
      fs.symlinkSync(availPath, enabledPath);
    }
    execSync('nginx -t 2>&1', { timeout: 10000 });
    execSync('systemctl reload nginx', { timeout: 10000 });
    res.json({ ok: true, enabled: fs.existsSync(enabledPath) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete domain
router.delete('/:name', (req, res) => {
  const { name } = req.params;
  try {
    const enabledPath = path.join(SITES_ENABLED, name);
    const availPath = path.join(SITES_AVAILABLE, name);
    if (fs.existsSync(enabledPath)) fs.unlinkSync(enabledPath);
    if (fs.existsSync(availPath)) fs.unlinkSync(availPath);
    try {
      execSync('systemctl reload nginx', { timeout: 10000 });
    } catch {}
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getServerIP() {
  try {
    return execSync("hostname -I 2>/dev/null | awk '{print $1}'").toString().trim() ||
           execSync("curl -s ifconfig.me 2>/dev/null").toString().trim() ||
           '0.0.0.0';
  } catch { return '0.0.0.0'; }
}

module.exports = router;
