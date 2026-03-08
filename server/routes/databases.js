const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { spawnSync } = require('child_process');

const router = Router();
router.use(requireAuth);

function isValidIdentifier(name) {
  return /^[a-zA-Z0-9_]{1,64}$/.test(name);
}

function isServiceRunning(name) {
  const result = spawnSync('systemctl', ['is-active', name], { encoding: 'utf-8', timeout: 5000 });
  return (result.stdout || '').trim() === 'active';
}

// Check which engines are installed
router.get('/status', (req, res) => {
  const engines = {};

  const pgResult = spawnSync('psql', ['--version'], { encoding: 'utf-8', timeout: 5000 });
  engines.postgresql = {
    installed: pgResult.status === 0,
    version: pgResult.status === 0 ? (pgResult.stdout || '').trim() : null,
    running: isServiceRunning('postgresql'),
  };

  const myResult = spawnSync('mysql', ['--version'], { encoding: 'utf-8', timeout: 5000 });
  engines.mariadb = {
    installed: myResult.status === 0,
    version: myResult.status === 0 ? (myResult.stdout || '').trim() : null,
    running: isServiceRunning('mariadb') || isServiceRunning('mysql'),
  };

  res.json(engines);
});

// Install engine
router.post('/install/:engine', (req, res) => {
  const { engine } = req.params;
  let pkg;
  let enable;

  if (engine === 'postgresql') {
    pkg = ['postgresql', 'postgresql-contrib'];
    enable = 'postgresql';
  } else if (engine === 'mariadb') {
    pkg = ['mariadb-server', 'mariadb-client'];
    enable = 'mariadb';
  } else {
    return res.status(400).json({ error: 'Unknown engine' });
  }

  const update = spawnSync('apt-get', ['update', '-qq'], { encoding: 'utf-8', timeout: 120000 });
  if (update.status !== 0) return res.status(500).json({ error: 'apt-get update failed' });

  const install = spawnSync('apt-get', ['install', '-y', ...pkg], { encoding: 'utf-8', timeout: 300000 });
  if (install.status !== 0) return res.status(500).json({ error: (install.stderr || install.stdout || '').trim() });

  spawnSync('systemctl', ['enable', enable], { timeout: 10000 });
  spawnSync('systemctl', ['start', enable], { timeout: 15000 });

  res.json({ ok: true });
});

// List databases
router.get('/', (req, res) => {
  const databases = [];

  // PostgreSQL databases
  const pgResult = spawnSync('sudo', ['-u', 'postgres', 'psql', '-t', '-A', '-c',
    'SELECT datname FROM pg_database WHERE datistemplate = false;'
  ], { encoding: 'utf-8', timeout: 10000 });

  if (pgResult.status === 0 && pgResult.stdout) {
    pgResult.stdout.split('\n').forEach(name => {
      if (name.trim()) databases.push({ name: name.trim(), engine: 'postgresql' });
    });
  }

  // MariaDB/MySQL databases
  const myResult = spawnSync('mysql', ['-N', '-e', 'SHOW DATABASES;'], { encoding: 'utf-8', timeout: 10000 });
  if (myResult.status === 0 && myResult.stdout) {
    const systemDBs = ['information_schema', 'mysql', 'performance_schema', 'sys'];
    myResult.stdout.split('\n').forEach(name => {
      if (name.trim() && !systemDBs.includes(name.trim())) {
        databases.push({ name: name.trim(), engine: 'mariadb' });
      }
    });
  }

  res.json(databases);
});

// Create database with user
router.post('/', (req, res) => {
  const { engine, dbName, username, password } = req.body;
  if (!engine || !dbName || !username || !password) {
    return res.status(400).json({ error: 'All fields required: engine, dbName, username, password' });
  }
  if (!isValidIdentifier(dbName)) return res.status(400).json({ error: 'Invalid database name (letters, numbers, underscores only)' });
  if (!isValidIdentifier(username)) return res.status(400).json({ error: 'Invalid username (letters, numbers, underscores only)' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    if (engine === 'postgresql') {
      // Use -c flag with properly escaped values via spawnSync (no shell injection)
      spawnSync('sudo', ['-u', 'postgres', 'psql', '-c',
        `CREATE USER ${username} WITH PASSWORD '${password.replace(/'/g, "''")}'`
      ], { timeout: 10000 });

      const createDb = spawnSync('sudo', ['-u', 'postgres', 'psql', '-c',
        `CREATE DATABASE ${dbName} OWNER ${username}`
      ], { encoding: 'utf-8', timeout: 10000 });

      if (createDb.status !== 0) {
        const err = (createDb.stderr || '').trim();
        if (!err.includes('already exists')) {
          return res.status(500).json({ error: err });
        }
      }

      spawnSync('sudo', ['-u', 'postgres', 'psql', '-c',
        `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${username}`
      ], { timeout: 10000 });

      res.json({
        ok: true,
        connection: {
          host: 'localhost', port: 5432,
          database: dbName, username,
          string: `postgresql://${username}:****@localhost:5432/${dbName}`,
        },
      });
    } else if (engine === 'mariadb') {
      const esc = s => s.replace(/`/g, '').replace(/'/g, "\\'");

      spawnSync('mysql', ['-e', `CREATE DATABASE IF NOT EXISTS \`${esc(dbName)}\``], { timeout: 10000 });
      spawnSync('mysql', ['-e',
        `CREATE USER IF NOT EXISTS '${esc(username)}'@'localhost' IDENTIFIED BY '${esc(password)}'`
      ], { timeout: 10000 });

      const grant = spawnSync('mysql', ['-e',
        `GRANT ALL PRIVILEGES ON \`${esc(dbName)}\`.* TO '${esc(username)}'@'localhost'; FLUSH PRIVILEGES;`
      ], { encoding: 'utf-8', timeout: 10000 });

      if (grant.status !== 0) {
        return res.status(500).json({ error: (grant.stderr || grant.stdout || 'Grant failed').trim() });
      }

      res.json({
        ok: true,
        connection: {
          host: 'localhost', port: 3306,
          database: dbName, username,
          string: `mysql://${username}:****@localhost:3306/${dbName}`,
        },
      });
    } else {
      res.status(400).json({ error: 'Unknown engine' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete database
router.delete('/:engine/:name', (req, res) => {
  const { engine, name } = req.params;
  if (!isValidIdentifier(name)) return res.status(400).json({ error: 'Invalid database name' });

  if (engine === 'postgresql') {
    const result = spawnSync('sudo', ['-u', 'postgres', 'psql', '-c',
      `DROP DATABASE IF EXISTS ${name}`
    ], { encoding: 'utf-8', timeout: 10000 });
    if (result.status !== 0) return res.status(500).json({ error: (result.stderr || '').trim() });
  } else if (engine === 'mariadb') {
    const result = spawnSync('mysql', ['-e', `DROP DATABASE IF EXISTS \`${name}\``], {
      encoding: 'utf-8', timeout: 10000
    });
    if (result.status !== 0) return res.status(500).json({ error: (result.stderr || '').trim() });
  } else {
    return res.status(400).json({ error: 'Unknown engine' });
  }

  res.json({ ok: true });
});

// List users
router.get('/users/:engine', (req, res) => {
  const { engine } = req.params;
  const users = [];

  if (engine === 'postgresql') {
    const result = spawnSync('sudo', ['-u', 'postgres', 'psql', '-t', '-A', '-c',
      `SELECT usename FROM pg_user WHERE usename != 'postgres';`
    ], { encoding: 'utf-8', timeout: 10000 });
    if (result.status === 0) {
      result.stdout.split('\n').forEach(u => { if (u.trim()) users.push(u.trim()); });
    }
  } else if (engine === 'mariadb') {
    const result = spawnSync('mysql', ['-N', '-e',
      `SELECT User FROM mysql.user WHERE User NOT IN ('root','mysql','mariadb','debian-sys-maint');`
    ], { encoding: 'utf-8', timeout: 10000 });
    if (result.status === 0) {
      result.stdout.split('\n').forEach(u => { if (u.trim()) users.push(u.trim()); });
    }
  }

  res.json(users);
});

// Run SQL query (basic - for trusted admin use)
router.post('/query', (req, res) => {
  const { engine, database, query } = req.body;
  if (!engine || !query) return res.status(400).json({ error: 'engine and query required' });

  // Limit query size
  if (query.length > 10000) return res.status(400).json({ error: 'Query too long' });

  if (engine === 'postgresql') {
    const args = ['-t', '-A', '--csv', '-c', query];
    if (database && isValidIdentifier(database)) args.unshift('-d', database);
    const result = spawnSync('sudo', ['-u', 'postgres', 'psql', ...args], {
      encoding: 'utf-8', timeout: 30000
    });
    if (result.status !== 0) return res.status(400).json({ error: (result.stderr || result.stdout || '').trim() });
    const rows = parseCSV(result.stdout || '');
    res.json({ ok: true, rows, raw: result.stdout });
  } else if (engine === 'mariadb') {
    const args = ['-t', '-e', query];
    if (database && isValidIdentifier(database)) args.push(database);
    const result = spawnSync('mysql', args, { encoding: 'utf-8', timeout: 30000 });
    if (result.status !== 0) return res.status(400).json({ error: (result.stderr || result.stdout || '').trim() });
    res.json({ ok: true, rows: [], raw: result.stdout });
  } else {
    res.status(400).json({ error: 'Unknown engine' });
  }
});

function parseCSV(text) {
  return text.trim().split('\n').filter(Boolean).map(line => line.split(','));
}

module.exports = router;
