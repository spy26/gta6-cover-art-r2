// SPDX-License-Identifier: MIT
// Leonida Cover Studio — tiny static server for local testing only.
// Serves app/ at http://localhost:8080. Run: node serve.ts

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const APP = new URL('./app/', import.meta.url).pathname;
const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = join(APP, path === '/' ? 'index.html' : path);
  if (!file.startsWith(APP) || !existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

server.listen(8080, '127.0.0.1', () => {
  console.log('Leonida Cover Studio at http://localhost:8080');
});
