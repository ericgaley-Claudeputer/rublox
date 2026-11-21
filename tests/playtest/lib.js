// Shared helpers for the manual Playwright playtest (not part of `node --test`).
const http = require('http');
const fs = require('fs');
const path = require('path');
const PW = process.env.PLAYWRIGHT_CORE || '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core';
const { chromium, devices } = require(PW);
const ROOT = path.resolve(__dirname, '..', '..');
function serve(){
  return new Promise(res => {
    const s = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ rsp.writeHead(404); return rsp.end(); }
      const ext = path.extname(f); rsp.writeHead(200, {'content-type': ext === '.html' ? 'text/html' : ext === '.json' ? 'application/json' : 'application/octet-stream'});
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res({ server: s, url: 'http://127.0.0.1:' + s.address().port + '/index.html' }));
  });
}
async function launch(){
  return chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true,
    args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'] });
}
// External network noise (fonts/CDN/peer services) is not a game bug.
const IGNORE = [/Failed to load resource/i, /net::ERR_/i, /favicon/i, /WebSocket/i, /peerjs/i, /GPU stall/i, /GroupMarkerNotSet/i, /Automatic fallback to software WebGL/i];
function watch(page, sink){
  page.on('pageerror', e => sink.push({ kind: 'pageerror', text: String(e && e.stack || e) }));
  page.on('console', m => { if (m.type() !== 'error') return; const t = m.text(); if (IGNORE.some(r => r.test(t))) return; sink.push({ kind: 'console', text: t }); });
}
module.exports = { serve, launch, watch, devices, ROOT };
