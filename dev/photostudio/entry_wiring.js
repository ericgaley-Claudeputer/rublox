// Real entry-point regression test: loads the BUILT page's game script (stubbed DOM/WebGL), clicks through Obby.play(id) —
// exactly what a game card's onclick calls — runs real game-loop frames, and checks each addition actually starts.
// Catches launch-dispatch / mode-whitelist / lifecycle bugs (e.g. Photo Studio throwing in start() because it had no spawn checkpoint).
const fs = require('fs'), vm = require('vm'), path = require('path');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const HTML = fs.readFileSync(process.env.PS_HTML || path.join(__dirname, '../../index.html'), 'utf8');
const scripts = [...HTML.matchAll(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/three|peerjs/i.test(m[1])).map(m => m[2]);
const U = () => { const f = function(){}; return new Proxy(f, {get: (t, k) => { if (k === Symbol.toPrimitive) return () => 0; if (k === 'length') return 0; if (k === Symbol.iterator) return function*(){}; if (k in t && k !== 'prototype') return t[k]; return t[k] = U(); }, set: (t, k, v) => { t[k] = v; return true; }, apply: () => U(), construct: () => U()}); };
function page(){
  const store = {}, rafs = [], errs = []; let now = 1e6;
  const ctx = {console: {log(){}, warn(){}, error(){}, info(){}}, Math, JSON, Date, Object, Array, Number, String, Set, Map, WeakMap, Promise, RegExp, Error, TypeError, Symbol, parseInt, parseFloat, isNaN, isFinite, Proxy, Reflect, Uint8Array, Float32Array, encodeURIComponent, decodeURIComponent,
    localStorage: {getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }},
    performance: {now: () => now}, requestAnimationFrame: f => (rafs.push(f), rafs.length), cancelAnimationFrame(){}, setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    matchMedia: () => ({matches: false, addEventListener(){}}), addEventListener(){}, removeEventListener(){}, innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    navigator: {maxTouchPoints: 0, getGamepads: () => [], userAgent: 'node'}, location: {search: '', hash: '', href: 'https://example.test/', protocol: 'https:'}, history: {replaceState(){}},
    fetch: () => new Promise(() => {}), scrollTo(){}, scrollBy(){}, getComputedStyle: () => U(), URLSearchParams, THREE: U(), Peer: U(), AudioContext: U(), IntersectionObserver: U(), ResizeObserver: U(), document: U()};
  ctx.window = ctx.self = ctx.globalThis = ctx; vm.createContext(ctx);
  scripts.forEach((s, i) => { try { vm.runInContext(s, ctx, {filename: 'script' + i}); } catch (e){ errs.push('load ' + i + ': ' + e.message); } });
  const run = js => vm.runInContext(js, ctx);
  const frames = n => { for (let i = 0; i < n; i++){ const f = rafs.shift(); if (!f) return i; now += 16; f(now); } return n; };
  return {ctx, run, frames, errs, store};
}
const P0 = page();
chk('built page game script loads', P0.errs.filter(e => !/IntersectionObserver|ResizeObserver/.test(e)).length === 0 && P0.run('typeof Obby') === 'object', P0.errs);
// every playable card must be a mode start() accepts (no silent fallback to obby)
const cards = [...HTML.matchAll(/\{id:'([a-z]+)', name:'[^']*'[^\n]*playable: true/g)].map(m => m[1]);
const wl = (HTML.match(/mode = \[([^\]]+)\]\.includes\(m\) \? m : 'obby'/) || [])[1] || '';
const missing = cards.filter(id => id !== 'obby' && !wl.includes("'" + id + "'"));
chk('every playable card id is in the start() mode whitelist', cards.length > 6 && missing.length === 0, {cards, missing});
chk('card click dispatches Obby.play(card id)', /card\.onclick = \(\) => g\.playable \? Obby\.play\(g\.id\)/.test(HTML));
const MODES = [['petisland', 'island'], ['bakery', 'bakery'], ['waterpark', 'waterpark'], ['photostudio', 'photo'], ['fashion', 'fashion']];
for (const [id, dbg] of MODES){
  const W = page(); let err = null, n = 0;
  try { W.run("Obby.play('" + id + "')"); n = W.frames(90); } catch (e){ err = e.message; }
  const st = err ? null : W.run('JSON.stringify(obbyDebug.' + dbg + '())');
  chk(id + ': card launch starts its own mode and runs 90 frames', !err && n === 90 && W.run('Obby.running') === true && st && st !== 'null' && st !== 'false', err || st);
}
// Photo Studio lifecycle through the real loop: camera on → pose/backdrop → countdown → leave → other mode → back
const S = page(); let e2 = null;
try {
  S.run("Obby.play('photostudio')"); S.frames(10);
  S.run('obbyDebug.psCam(true)'); S.frames(10);
  const a = JSON.parse(S.run('JSON.stringify(obbyDebug.photo())'));
  chk('studio: camera mode on through the live loop (held on the mark)', a.cam === true && a.near === false);
  S.run("obbyDebug.psCycle('pose', 1); obbyDebug.psCycle('bg', 1)"); const b = JSON.parse(S.run('JSON.stringify(obbyDebug.photo())'));
  chk('studio: pose + backdrop change', b.s.pose === 1 && b.s.bg === 1);
  S.run('obbyDebug.psSnap()'); S.frames(5); chk('studio: snap countdown runs in the loop', JSON.parse(S.run('JSON.stringify(obbyDebug.photo())')).count > 2);
  S.frames(200); chk('studio: countdown finishes without errors', JSON.parse(S.run('JSON.stringify(obbyDebug.photo())')).count === 0);
  S.run('Obby.stop()'); chk('studio: stop clears studio state', S.run('obbyDebug.photo()') == null);
  S.run("Obby.play('waterpark')"); S.frames(20); chk('switch studio → water park works', S.run('JSON.stringify(obbyDebug.waterpark())') !== 'null' && S.run('obbyDebug.photo()') == null);
  S.run('Obby.stop()'); S.run("Obby.play('photostudio')"); S.frames(20); chk('back to studio again (replay) works', S.run('JSON.stringify(obbyDebug.photo())') !== 'null');
} catch (e){ e2 = e.message; }
chk('studio lifecycle threw nothing', !e2, e2);
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
