#!/usr/bin/env node

// Copies vendor dependencies from node_modules to public/vendor
const fs = require('fs');
const path = require('path');

const copies = [
  {
    src: 'node_modules/xterm/css/xterm.css',
    dest: 'public/vendor/xterm/xterm.css',
  },
  {
    src: 'node_modules/xterm/lib/xterm.js',
    dest: 'public/vendor/xterm/xterm.js',
  },
  {
    src: 'node_modules/@xterm/addon-fit/lib/addon-fit.js',
    dest: 'public/vendor/xterm/xterm-addon-fit.js',
  },
  {
    src: 'node_modules/socket.io/client-dist/socket.io.min.js',
    dest: 'public/vendor/socket.io/socket.io.min.js',
  },
];

const root = path.join(__dirname, '..');

for (const { src, dest } of copies) {
  const srcPath = path.join(root, src);
  const destPath = path.join(root, dest);

  // Try alternate paths
  let actualSrc = srcPath;
  if (!fs.existsSync(actualSrc)) {
    // xterm v5 uses different path
    const alt = srcPath.replace('xterm/lib/', 'xterm/');
    if (fs.existsSync(alt)) actualSrc = alt;
  }

  if (!fs.existsSync(actualSrc)) {
    console.warn(`⚠ Not found: ${src} - skipping`);
    continue;
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(actualSrc, destPath);
  console.log(`✓ ${src} → ${dest}`);
}

console.log('\nVendor files ready.');
