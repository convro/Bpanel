#!/usr/bin/env node

// Copies vendor dependencies from node_modules to public/vendor
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const copies = [
  {
    candidates: [
      'node_modules/xterm/css/xterm.css',
    ],
    dest: 'public/vendor/xterm/xterm.css',
  },
  {
    candidates: [
      'node_modules/xterm/lib/xterm.js',
      'node_modules/xterm/lib/xterm.mjs',
    ],
    dest: 'public/vendor/xterm/xterm.js',
  },
  {
    candidates: [
      'node_modules/@xterm/addon-fit/lib/addon-fit.js',
      'node_modules/@xterm/addon-fit/lib/addon-fit.mjs',
      'node_modules/xterm-addon-fit/lib/xterm-addon-fit.js',
    ],
    dest: 'public/vendor/xterm/xterm-addon-fit.js',
  },
  {
    candidates: [
      'node_modules/socket.io/client-dist/socket.io.min.js',
      'node_modules/socket.io-client/dist/socket.io.min.js',
      'node_modules/socket.io-client/dist/socket.io.js',
    ],
    dest: 'public/vendor/socket.io/socket.io.min.js',
  },
];

let missing = [];

for (const { candidates, dest } of copies) {
  const destPath = path.join(root, dest);
  let found = false;

  for (const src of candidates) {
    const srcPath = path.join(root, src);
    if (fs.existsSync(srcPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ ${src} → ${dest}`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.warn(`⚠ Not found: ${dest} (tried: ${candidates.join(', ')})`);
    missing.push(dest);
  }
}

if (missing.length > 0) {
  console.error(`\n✗ ${missing.length} vendor file(s) missing. Check your node_modules.`);
} else {
  console.log('\n✓ All vendor files ready.');
}
