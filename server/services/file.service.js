const fs = require('fs');
const path = require('path');

function listDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirs = entries
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = entries
    .filter(e => !e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...dirs, ...files].map(e => {
    const fullPath = path.join(dirPath, e.name);
    let size = 0;
    let mtime = null;
    try {
      const stat = fs.statSync(fullPath);
      size = stat.size;
      mtime = stat.mtime.toISOString();
    } catch {}
    return {
      name: e.name,
      isDirectory: e.isDirectory(),
      path: fullPath,
      size,
      mtime,
    };
  });
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function createDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function deleteEntry(entryPath) {
  const stat = fs.statSync(entryPath);
  if (stat.isDirectory()) {
    fs.rmSync(entryPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(entryPath);
  }
}

function renameEntry(oldPath, newPath) {
  fs.renameSync(oldPath, newPath);
}

function getStats(filePath) {
  const stat = fs.statSync(filePath);
  return {
    size: stat.size,
    mtime: stat.mtime.toISOString(),
    isDirectory: stat.isDirectory(),
    isFile: stat.isFile(),
    permissions: (stat.mode & 0o777).toString(8),
  };
}

module.exports = { listDirectory, readFile, writeFile, createDirectory, deleteEntry, renameEntry, getStats };
