const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

module.exports = {
  port: process.env.BPANEL_PORT || 9390,
  jwtSecret: process.env.BPANEL_JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  jwtExpiry: '7d',
  dbPath: path.join(DATA_DIR, 'bpanel.db'),
  dataDir: DATA_DIR,
  publicDir: path.join(__dirname, '..', 'public'),
};
