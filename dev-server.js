import { createServer } from 'http';
import { URL } from 'url';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import API handlers
const importHandler = async (path) => {
    try {
        const module = await import(join(__dirname, path));
        return module.default;
    } catch (error) {
        console.error(`Failed to import ${path}:`, error);
        return null;
    }
};

const server = createServer(async (req, res) => {
    // Enable CORS for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Handle /api/clips/{id} routes
    if (url.pathname.match(/^\/api\/clips\/[^\/]+$/)) {
        const handler = await importHandler('./api/clips/[id].js');
        if (handler) {
            try {
                const request = new Request(`http://localhost:3001${req.url}`, {
                    method: req.method,
                    headers: req.headers,
                    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
                });

                const response = await handler(request);
                const data = await response.text();

                res.writeHead(response.status, {
                    'Content-Type': 'application/json',
                    ...Object.fromEntries(response.headers.entries())
                });
                res.end(data);
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        }
        return;
    }

    // Handle /api/clips route
    if (url.pathname === '/api/clips') {
        const handler = await importHandler('./api/clips.js');
        if (handler) {
            try {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const request = new Request(`http://localhost:3001${req.url}`, {
                        method: req.method,
                        headers: req.headers,
                        body: body || undefined,
                    });

                    const response = await handler(request);
                    const data = await response.text();

                    res.writeHead(response.status, {
                        'Content-Type': 'application/json',
                        ...Object.fromEntries(response.headers.entries())
                    });
                    res.end(data);
                });
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        }
        return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Development API server running on http://localhost:${PORT}`);
});
