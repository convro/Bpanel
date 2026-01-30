const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { execSync } = require('child_process');
const os = require('os');

const router = Router();
router.use(requireAuth);

router.get('/info', (req, res) => {
  let diskUsage = { total: 0, used: 0, free: 0 };
  try {
    const df = execSync("df -B1 / | tail -1").toString().trim().split(/\s+/);
    diskUsage = { total: +df[1], used: +df[2], free: +df[3] };
  } catch {}

  // Detect installed software versions
  const versions = {};
  const checks = {
    node: 'node -v',
    npm: 'npm -v',
    nginx: 'nginx -v 2>&1',
    apache2: 'apache2 -v 2>&1 | head -1',
    php: 'php -v 2>&1 | head -1',
    python3: 'python3 --version 2>&1',
    python: 'python --version 2>&1',
    git: 'git --version',
    docker: 'docker --version 2>&1',
    'docker-compose': 'docker-compose --version 2>&1 || docker compose version 2>&1',
    mysql: 'mysql --version 2>&1',
    psql: 'psql --version 2>&1',
    redis: 'redis-server --version 2>&1',
    mongod: 'mongod --version 2>&1 | head -1',
    certbot: 'certbot --version 2>&1',
    ufw: 'ufw version 2>&1',
    curl: 'curl --version 2>&1 | head -1',
    wget: 'wget --version 2>&1 | head -1',
    gcc: 'gcc --version 2>&1 | head -1',
    make: 'make --version 2>&1 | head -1',
    go: 'go version 2>&1',
    rustc: 'rustc --version 2>&1',
    java: 'java --version 2>&1 | head -1',
    ruby: 'ruby --version 2>&1',
    composer: 'composer --version 2>&1',
    yarn: 'yarn --version 2>&1',
    pm2: 'pm2 --version 2>&1',
  };

  for (const [name, cmd] of Object.entries(checks)) {
    try {
      const output = execSync(cmd, { timeout: 5000 }).toString().trim();
      if (output && !output.toLowerCase().includes('not found') && !output.toLowerCase().includes('no such')) {
        versions[name] = output.split('\n')[0].trim();
      }
    } catch {}
  }

  // Nginx config info
  let nginxInfo = null;
  try {
    const sites = execSync('ls /etc/nginx/sites-enabled/ 2>/dev/null').toString().trim().split('\n').filter(Boolean);
    const confPath = execSync('nginx -t 2>&1 | head -1').toString().trim();
    nginxInfo = { sites, configTest: confPath };
  } catch {}

  // Get OS info from /etc/os-release
  let osInfo = {};
  try {
    const release = execSync('cat /etc/os-release 2>/dev/null').toString();
    const lines = release.split('\n');
    for (const line of lines) {
      const [key, ...val] = line.split('=');
      if (key && val.length) osInfo[key] = val.join('=').replace(/"/g, '');
    }
  } catch {}

  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    },
    disk: diskUsage,
    cpus: os.cpus().length,
    osInfo,
    versions,
    nginxInfo,
  });
});

module.exports = router;
