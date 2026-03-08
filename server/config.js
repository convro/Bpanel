const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Persist JWT secret so sessions survive server restarts
function getOrCreateJwtSecret() {
  const secretFile = path.join(DATA_DIR, '.jwt_secret');
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(secretFile)) {
      return fs.readFileSync(secretFile, 'utf-8').trim();
    }
    const secret = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync(secretFile, secret, { mode: 0o600 });
    return secret;
  } catch {
    return crypto.randomBytes(64).toString('hex');
  }
}

module.exports = {
  port: parseInt(process.env.BPANEL_PORT) || 9390,
  jwtSecret: process.env.BPANEL_JWT_SECRET || getOrCreateJwtSecret(),
  jwtExpiry: '7d',
  dbPath: path.join(DATA_DIR, 'bpanel.db'),
  dataDir: DATA_DIR,
  publicDir: path.join(__dirname, '..', 'public'),
  uploadDir: path.join(DATA_DIR, 'uploads'),
};
