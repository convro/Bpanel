const Database = require('better-sqlite3');
const fs = require('fs');
const config = require('./config');

let db;

function init() {
  fs.mkdirSync(config.dataDir, { recursive: true });
  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      working_directory TEXT NOT NULL DEFAULT '/',
      created_at TEXT DEFAULT (datetime('now')),
      last_accessed TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

function getDb() {
  if (!db) init();
  return db;
}

module.exports = { init, getDb };
