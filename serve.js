const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Normalize URL
  let parsedUrl = req.url.split('?')[0];

  // --------------------------------------------------------------------------
  // Full-Stack REST API Endpoints
  // --------------------------------------------------------------------------
  if (parsedUrl.startsWith('/api/')) {
    // GET /api/health
    if (parsedUrl === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({
        status: 'online',
        service: 'FaunaScope Full-Stack REST API',
        uptime: `${process.uptime().toFixed(1)}s`,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // GET /api/species
    if (parsedUrl === '/api/species' && req.method === 'GET') {
      const speciesPath = path.join(ROOT, 'data', 'species.json');
      fs.readFile(speciesPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read species dataset' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(data);
      });
      return;
    }

    // GET /api/sightings
    if (parsedUrl === '/api/sightings' && req.method === 'GET') {
      const sightingsPath = path.join(ROOT, 'data', 'sightings.json');
      fs.readFile(sightingsPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end('[]');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(data);
      });
      return;
    }

    // POST /api/sightings
    if (parsedUrl === '/api/sightings' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 1e6) { // 1MB flood protection
          req.connection.destroy();
        }
      });

      req.on('end', () => {
        try {
          const newSighting = JSON.parse(body);
          
          // Server-side validation
          if (!newSighting.observerName || !newSighting.observerEmail || !newSighting.speciesObserved) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
            res.end(JSON.stringify({ error: 'Missing required field: observerName, observerEmail, or speciesObserved' }));
            return;
          }

          newSighting.id = `obs-${Date.now()}`;
          newSighting.createdAt = new Date().toISOString();

          const sightingsPath = path.join(ROOT, 'data', 'sightings.json');
          fs.readFile(sightingsPath, 'utf8', (readErr, fileData) => {
            let sightings = [];
            if (!readErr && fileData) {
              try {
                sightings = JSON.parse(fileData);
              } catch (e) {
                sightings = [];
              }
            }
            sightings.unshift(newSighting);

            fs.writeFile(sightingsPath, JSON.stringify(sightings, null, 2), 'utf8', writeErr => {
              if (writeErr) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
                res.end(JSON.stringify({ error: 'Failed to persist sighting to disk' }));
                return;
              }
              res.writeHead(201, { 'Content-Type': 'application/json; charset=UTF-8' });
              res.end(JSON.stringify({
                success: true,
                message: 'Field observation successfully recorded to FaunaScope database',
                sighting: newSighting
              }));
            });
          });
        } catch (jsonErr) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'Invalid JSON body payload' }));
        }
      });
      return;
    }

    // 404 for unknown /api route
    res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ error: 'API route not found' }));
    return;
  }

  // --------------------------------------------------------------------------
  // Static File Serving
  // --------------------------------------------------------------------------
  if (parsedUrl === '/') {
    parsedUrl = '/index.html';
  }

  const filePath = path.join(ROOT, parsedUrl);

  // Security check: ensure path stays within ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Open http://localhost:${PORT}/ in your browser to view AnimalGalaxy!`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(PORT) + 1;
    console.log(`Port ${PORT} is busy, retrying on port ${fallbackPort}...`);
    server.listen(fallbackPort);
  } else {
    console.error('Server error:', err);
  }
});

