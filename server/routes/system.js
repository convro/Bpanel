const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const os = require('os');
const { execSync } = require('child_process');

const router = Router();
router.use(requireAuth);

router.get('/info', (req, res) => {
  let diskUsage = { total: 0, used: 0, free: 0 };
  try {
    const df = execSync("df -B1 / | tail -1").toString().trim().split(/\s+/);
    diskUsage = { total: +df[1], used: +df[2], free: +df[3] };
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
  });
});

module.exports = router;
