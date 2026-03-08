const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = Router();
router.use(requireAuth);

const SITES_AVAILABLE = '/etc/nginx/sites-available';
const SITES_ENABLED = '/etc/nginx/sites-enabled';

function isValidDomain(domain) {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}[a-zA-Z0-9]$/.test(domain) && domain.includes('.');
}

function isValidPort(port) {
  const n = parseInt(port);
  return Number.isInteger(n) && n > 0 && n < 65536;
}

function nginxTest() {
  const result = spawnSync('nginx', ['-t'], { encoding: 'utf-8', timeout: 10000 });
  const output = (result.stdout || '') + (result.stderr || '');
  return { ok: result.status === 0, output: output.trim() };
}

function nginxReload() {
  spawnSync('systemctl', ['reload', 'nginx'], { timeout: 10000 });
}

function getServerIP() {
  try {
    const result = spawnSync('hostname', ['-I'], { encoding: 'utf-8', timeout: 5000 });
    const ip = (result.stdout || '').trim().split(/\s+/)[0];
    if (ip) return ip;
  } catch {}
  return '0.0.0.0';
}

router.get('/', (req, res) => {
  try {
    const domains = [];
    if (fs.existsSync(SITES_AVAILABLE)) {
      const files = fs.readdirSync(SITES_AVAILABLE).filter(f => f !== 'default');
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(SITES_AVAILABLE, file), 'utf-8');
          const serverName = content.match(/server_name\s+([^;]+);/);
          const root = content.match(/root\s+([^;]+);/);
          const proxyMatch = content.match(/proxy_pass\s+http:\/\/127\.0\.0\.1:(\d+)/);
          const enabled = fs.existsSync(path.join(SITES_ENABLED, file));
          const hasSSL = content.includes('ssl_certificate') || content.includes('listen 443');
          domains.push({
            file,
            domain: serverName ? serverName[1].trim() : file,
            root: root ? root[1].trim() : null,
            proxyPort: proxyMatch ? proxyMatch[1] : null,
            enabled,
            hasSSL,
          });
        } catch {}
      }
    }
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { domain, rootDir, proxyPort } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });
  if (!isValidDomain(domain)) return res.status(400).json({ error: 'Invalid domain name' });
  if (proxyPort && !isValidPort(proxyPort)) return res.status(400).json({ error: 'Invalid port number' });

  const safeName = domain.replace(/[^a-zA-Z0-9.-]/g, '_');
  const configPath = path.join(SITES_AVAILABLE, safeName);

  if (fs.existsSync(configPath)) {
    return res.status(409).json({ error: 'Domain already configured' });
  }

  let config;
  let webRoot = null;

  if (proxyPort) {
    const port = parseInt(proxyPort);
    config = `server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
`;
  } else {
    webRoot = rootDir || `/var/www/${safeName}`;
    if (!webRoot.startsWith('/')) webRoot = '/var/www/' + safeName;

    try {
      fs.mkdirSync(webRoot, { recursive: true });
    } catch (e) {
      return res.status(500).json({ error: 'Cannot create web root: ' + e.message });
    }

    const indexPath = path.join(webRoot, 'index.html');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${domain}</title>
  <style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#09090b;color:#fafafa}</style>
</head>
<body>
  <div style="text-align:center">
    <h1>${domain}</h1>
    <p style="color:#71717a">Site is live. Replace this file at <code>${webRoot}/index.html</code></p>
  </div>
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
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\\.ht {
        deny all;
    }
}
`;
  }

  try {
    fs.writeFileSync(configPath, config);
    const enabledPath = path.join(SITES_ENABLED, safeName);
    if (!fs.existsSync(enabledPath)) {
      fs.symlinkSync(configPath, enabledPath);
    }

    const test = nginxTest();
    if (!test.ok) {
      if (fs.existsSync(enabledPath)) fs.unlinkSync(enabledPath);
      fs.unlinkSync(configPath);
      return res.status(400).json({ error: 'Nginx config error:\n' + test.output });
    }

    nginxReload();
    res.json({ ok: true, domain, root: webRoot, proxyPort: proxyPort || null, file: safeName,
      dnsRecord: { type: 'A', name: domain, value: getServerIP(), ttl: 3600 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:name/config', (req, res) => {
  const name = path.basename(req.params.name);
  const filePath = path.join(SITES_AVAILABLE, name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Config not found' });
  try {
    res.json({ content: fs.readFileSync(filePath, 'utf-8'), path: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:name/config', (req, res) => {
  const name = path.basename(req.params.name);
  const { content } = req.body;
  const filePath = path.join(SITES_AVAILABLE, name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Config not found' });
  if (!content) return res.status(400).json({ error: 'Content required' });

  const backup = fs.readFileSync(filePath, 'utf-8');
  try {
    fs.writeFileSync(filePath, content);
    const test = nginxTest();
    if (!test.ok) {
      fs.writeFileSync(filePath, backup);
      return res.status(400).json({ error: test.output, restored: true });
    }
    nginxReload();
    res.json({ ok: true, testResult: test.output });
  } catch (err) {
    try { fs.writeFileSync(filePath, backup); } catch {}
    res.status(500).json({ error: err.message });
  }
});

router.post('/:name/toggle', (req, res) => {
  const name = path.basename(req.params.name);
  const enabledPath = path.join(SITES_ENABLED, name);
  const availPath = path.join(SITES_AVAILABLE, name);
  if (!fs.existsSync(availPath)) return res.status(404).json({ error: 'Domain config not found' });

  try {
    const wasEnabled = fs.existsSync(enabledPath);
    if (wasEnabled) {
      fs.unlinkSync(enabledPath);
    } else {
      fs.symlinkSync(availPath, enabledPath);
    }

    const test = nginxTest();
    if (!test.ok) {
      // Revert
      if (wasEnabled) { fs.symlinkSync(availPath, enabledPath); }
      else if (fs.existsSync(enabledPath)) { fs.unlinkSync(enabledPath); }
      return res.status(400).json({ error: 'Nginx test failed: ' + test.output });
    }

    nginxReload();
    res.json({ ok: true, enabled: fs.existsSync(enabledPath) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:name', (req, res) => {
  const name = path.basename(req.params.name);
  try {
    const enabledPath = path.join(SITES_ENABLED, name);
    const availPath = path.join(SITES_AVAILABLE, name);
    if (fs.existsSync(enabledPath)) fs.unlinkSync(enabledPath);
    if (fs.existsSync(availPath)) fs.unlinkSync(availPath);
    try { nginxReload(); } catch {}
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
