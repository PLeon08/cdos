import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { load } from './store.js';

const contentType = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

export async function startDashboard({ cwd, host = '127.0.0.1', port = 4173, log = console.log }) {
  const publicDir = join(cwd, 'dashboard');
  const server = createServer(async (request, response) => {
    try {
      if (request.url === '/api/state') {
        response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(await load(cwd)));
        return;
      }
      const requested = request.url === '/' ? 'index.html' : request.url.slice(1);
      if (!['index.html', 'app.js', 'styles.css'].includes(requested)) {
        response.writeHead(404).end('Not found');
        return;
      }
      const extension = requested.slice(requested.lastIndexOf('.'));
      response.writeHead(200, { 'content-type': contentType[extension] });
      response.end(await readFile(join(publicDir, requested)));
    } catch (error) {
      response.writeHead(error.message.includes('not initialized') ? 409 : 500, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: error.message }));
    }
  });
  await new Promise((resolve) => server.listen(port, host, resolve));
  log(`CDOS dashboard: http://${host}:${port}`);
  return server;
}
