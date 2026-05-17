import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.FRONTEND_PORT || process.env.PORT || 5173);
const HOST = process.env.FRONTEND_HOST || '0.0.0.0';
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.createReadStream(filePath)
    .on('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
    })
    .on('error', () => {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    })
    .pipe(res);
}

function proxyBackend(req, res) {
  const target = new URL(req.url, INTERNAL_API_URL);

  const proxyReq = http.request(
    target,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    },
  );

  proxyReq.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ detail: `Backend is unavailable: ${error.message}` }));
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname === '/health') {
    proxyBackend(req, res);
    return;
  }

  const requestedPath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^\/+/, '');
  const staticPath = path.join(DIST_DIR, requestedPath);
  const safePath = staticPath.startsWith(DIST_DIR) ? staticPath : DIST_DIR;

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    sendFile(res, safePath);
    return;
  }

  sendFile(res, path.join(DIST_DIR, 'index.html'));
});

server.listen(PORT, HOST, () => {
  console.log(`Frontend is available on http://${HOST}:${PORT}`);
  console.log(`Proxying /api/* and /health to ${INTERNAL_API_URL}`);
});
