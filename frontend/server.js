const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const BACKEND_URL = 'http://localhost:3000';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// Proxy dla API
async function proxyRequest(req, res) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
        console.error('Proxy error:', error);
        res.writeHead(500);
        res.end('Backend connection error');
    });

    req.pipe(proxyReq);
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Proxy dla API
    if (req.url.startsWith('/api/') || req.url === '/health') {
        return proxyRequest(req, res);
    }

    // Serwowanie plików statycznych
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    // Sprawdź czy plik istnieje
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }

        // Określ typ MIME
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Wczytaj i wyślij plik
        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end('500 Internal Server Error');
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🌐 Frontend serwer działa na http://localhost:${PORT}`);
    console.log(`🔗 Backend API: ${BACKEND_URL}`);
    console.log(`\n✅ Otwórz http://localhost:${PORT} w przeglądarce!`);
});
