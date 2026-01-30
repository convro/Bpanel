const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { execSync } = require('child_process');

const router = Router();
router.use(requireAuth);

// Check which engines are installed
router.get('/status', (req, res) => {
  const engines = {};

  // PostgreSQL
  try {
    const ver = execSync('psql --version 2>&1').toString().trim();
    const running = isServiceRunning('postgresql');
    engines.postgresql = { installed: true, version: ver, running };
  } catch {
    engines.postgresql = { installed: false };
  }

  // MariaDB / MySQL
  try {
    const ver = execSync('mysql --version 2>&1').toString().trim();
    const running = isServiceRunning('mariadb') || isServiceRunning('mysql');
    engines.mariadb = { installed: true, version: ver, running };
  } catch {
    engines.mariadb = { installed: false };
  }

  res.json(engines);
});

// Install engine
router.post('/install/:engine', (req, res) => {
  const { engine } = req.params;
  try {
    if (engine === 'postgresql') {
      execSync('apt-get update && apt-get install -y postgresql postgresql-contrib', { timeout: 120000 });
      execSync('systemctl enable postgresql && systemctl start postgresql', { timeout: 15000 });
    } else if (engine === 'mariadb') {
      execSync('apt-get update && apt-get install -y mariadb-server mariadb-client', { timeout: 120000 });
      execSync('systemctl enable mariadb && systemctl start mariadb', { timeout: 15000 });
    } else {
      return res.status(400).json({ error: 'Unknown engine' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List databases
router.get('/', (req, res) => {
  const databases = [];

  // PostgreSQL databases
  try {
    const output = execSync("sudo -u postgres psql -t -A -c \"SELECT datname FROM pg_database WHERE datistemplate = false;\" 2>/dev/null", { timeout: 10000 }).toString().trim();
    if (output) {
      output.split('\n').forEach(name => {
        if (name.trim()) databases.push({ name: name.trim(), engine: 'postgresql' });
      });
    }
  } catch {}

  // MariaDB/MySQL databases
  try {
    const output = execSync("mysql -N -e \"SHOW DATABASES;\" 2>/dev/null", { timeout: 10000 }).toString().trim();
    if (output) {
      const systemDBs = ['information_schema', 'mysql', 'performance_schema', 'sys'];
      output.split('\n').forEach(name => {
        if (name.trim() && !systemDBs.includes(name.trim())) {
          databases.push({ name: name.trim(), engine: 'mariadb' });
        }
      });
    }
  } catch {}

  res.json(databases);
});

// Create database with user
router.post('/', (req, res) => {
  const { engine, dbName, username, password } = req.body;
  if (!engine || !dbName || !username || !password) {
    return res.status(400).json({ error: 'All fields required: engine, dbName, username, password' });
  }

  const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, '');
  const safeUser = username.replace(/[^a-zA-Z0-9_]/g, '');

  try {
    if (engine === 'postgresql') {
      // Create user and database
      try {
        execSync(`sudo -u postgres psql -c "CREATE USER ${safeUser} WITH PASSWORD '${password.replace(/'/g, "''")}'"`, { timeout: 10000 });
      } catch {} // user might exist
      execSync(`sudo -u postgres psql -c "CREATE DATABASE ${safeName} OWNER ${safeUser}"`, { timeout: 10000 });
      execSync(`sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${safeName} TO ${safeUser}"`, { timeout: 10000 });

      res.json({
        ok: true,
        connection: {
          host: 'localhost',
          port: 5432,
          database: safeName,
          username: safeUser,
          string: `postgresql://${safeUser}:${password}@localhost:5432/${safeName}`,
        },
      });
    } else if (engine === 'mariadb') {
      execSync(`mysql -e "CREATE DATABASE IF NOT EXISTS \\\`${safeName}\\\`"`, { timeout: 10000 });
      execSync(`mysql -e "CREATE USER IF NOT EXISTS '${safeUser}'@'localhost' IDENTIFIED BY '${password.replace(/'/g, "\\'")}';"`, { timeout: 10000 });
      execSync(`mysql -e "GRANT ALL PRIVILEGES ON \\\`${safeName}\\\`.* TO '${safeUser}'@'localhost'; FLUSH PRIVILEGES;"`, { timeout: 10000 });

      res.json({
        ok: true,
        connection: {
          host: 'localhost',
          port: 3306,
          database: safeName,
          username: safeUser,
          string: `mysql://${safeUser}:${password}@localhost:3306/${safeName}`,
        },
      });
    } else {
      res.status(400).json({ error: 'Unknown engine' });
    }
  } catch (err) {
    res.status(500).json({ error: err.stderr ? err.stderr.toString() : err.message });
  }
});

// Delete database
router.delete('/:engine/:name', (req, res) => {
  const { engine, name } = req.params;
  const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');

  try {
    if (engine === 'postgresql') {
      execSync(`sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${safeName}"`, { timeout: 10000 });
    } else if (engine === 'mariadb') {
      execSync(`mysql -e "DROP DATABASE IF EXISTS \\\`${safeName}\\\`"`, { timeout: 10000 });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List users for an engine
router.get('/users/:engine', (req, res) => {
  const { engine } = req.params;
  const users = [];

  try {
    if (engine === 'postgresql') {
      const output = execSync("sudo -u postgres psql -t -A -c \"SELECT usename FROM pg_user WHERE usename != 'postgres';\" 2>/dev/null", { timeout: 10000 }).toString().trim();
      if (output) output.split('\n').forEach(u => { if (u.trim()) users.push(u.trim()); });
    } else if (engine === 'mariadb') {
      const output = execSync("mysql -N -e \"SELECT User FROM mysql.user WHERE User NOT IN ('root','mysql','mariadb','debian-sys-maint');\" 2>/dev/null", { timeout: 10000 }).toString().trim();
      if (output) output.split('\n').forEach(u => { if (u.trim()) users.push(u.trim()); });
    }
  } catch {}

  res.json(users);
});

function isServiceRunning(name) {
  try {
    const status = execSync(`systemctl is-active ${name} 2>/dev/null`).toString().trim();
    return status === 'active';
  } catch { return false; }
}

module.exports = router;
