const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDb } = require('../db');

function getUserCount() {
  return getDb().prepare('SELECT COUNT(*) as count FROM users').get().count;
}

function createUser(username, password) {
  const hash = bcrypt.hashSync(password, 12);
  const result = getDb().prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
  return { id: result.lastInsertRowid, username };
}

function findUserByUsername(username) {
  return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, { expiresIn: config.jwtExpiry });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { getUserCount, createUser, findUserByUsername, verifyPassword, generateToken, verifyToken };
