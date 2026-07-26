import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'dist');
const startPort = 4317;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error('未找到应用构建文件，请确认 dist 文件夹完整。');
  process.exit(1);
}

const server = createServer((request, response) => {
  let rawPath;
  try {
    rawPath = decodeURIComponent((request.url ?? '/').split('?')[0]);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  const relativePath = rawPath === '/' ? 'index.html' : rawPath.replace(/^[/\\]+/, '');
  const requestedPath = resolve(root, relativePath);
  const isInsideRoot = requestedPath === root || requestedPath.startsWith(`${root}${sep}`);
  const safePath = isInsideRoot ? requestedPath : join(root, 'index.html');
  const filePath = existsSync(safePath) && statSync(safePath).isFile() ? safePath : join(root, 'index.html');

  response.setHeader('Content-Type', mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  createReadStream(filePath).pipe(response);
});

const listen = (port) => {
  const onError = (error) => {
    server.off('listening', onListening);
    if (error.code === 'EADDRINUSE' && port < startPort + 20) {
      listen(port + 1);
      return;
    }
    console.error(`启动失败：${error.message}`);
    process.exit(1);
  };

  const onListening = () => {
    server.off('error', onError);
    const url = `http://127.0.0.1:${port}`;
    console.log('');
    console.log('纸舟 Studio 已启动');
    console.log(`访问地址：${url}`);
    console.log('关闭此窗口即可停止应用。');
    console.log('');

    if (process.env.PAPERFLOW_NO_OPEN !== '1') {
      const browser = spawn('cmd.exe', ['/c', 'start', '', url], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      });
      browser.unref();
    }
  };

  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port, '127.0.0.1');
};

listen(startPort);
