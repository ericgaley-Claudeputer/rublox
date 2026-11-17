'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

function scriptById(id){
  const re = new RegExp('<script[^>]*id="' + id + '"[^>]*>([\\s\\S]*?)</script>');
  const m = html.match(re);
  assert.ok(m, 'missing script ' + id);
  return m[1];
}

test('BUILD is 2026.11.16-23 and matches version.json', () => {
  assert.ok(html.includes("const BUILD = '2026.11.16-23'"));
  assert.strictEqual(version.build, '2026.11.16-23');
});

test('start-fail overlay HTML and CSS are present', () => {
  assert.ok(html.includes('id="oStartFail"'));
  assert.ok(html.includes('id="oStartFailExit"'));
  assert.ok(html.includes('id="oStartFailText"'));
  assert.ok(/#oStartFail\{[^}]*z-index:\s*240/.test(html));
  assert.ok(html.includes('#oStartFail.show{display:grid}'));
});

test('ensureRenderer retries WebGL context creation with safer options', () => {
  const body = html.split('function ensureRenderer(){')[1].split('function applyObbyQuality')[0];
  assert.ok(body.includes('failIfMajorPerformanceCaveat: false'));
  assert.ok(body.includes("powerPreference: 'low-power'"));
  assert.match(body, /for\s*\(\s*let i = 0/);
  assert.ok(body.includes('new THREE.WebGLRenderer(attempts[i])'));
  assert.ok(body.includes('throw err') || body.includes('throw lastErr'));
});

test('start() wraps init in a safety net that calls startFail', () => {
  assert.ok(html.includes('function startFail('));
  assert.ok(html.includes('function startFailBindExit('));
  assert.ok(html.includes('function startFailExit('));
  assert.ok(html.includes('try { /* start-safety */'));
  assert.ok(html.includes('} catch (err) { try { startFail(err); }'));
  assert.ok(html.includes("oStartFailExit"));
  assert.ok(/needs 3D graphics/.test(html));
  assert.ok(/couldn't start/.test(html));
});

test('obby-game script still parses after the safety-net patch', () => {
  const src = scriptById('obby-game');
  assert.doesNotThrow(() => new vm.Script(src, {filename: 'obby-game.js'}));
});

test('a thrown WebGL error during start shows the overlay and wires Exit', () => {
  const scripts = [...html.matchAll(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m => !/three|peerjs/i.test(m[1]))
    .map(m => m[2]);
  const U = () => { const f = function(){}; return new Proxy(f, {
    get: (t, k) => {
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'length') return 0;
      if (k === Symbol.iterator) return function*(){};
      if (k in t && k !== 'prototype') return t[k];
      return t[k] = U();
    },
    set: (t, k, v) => { t[k] = v; return true; },
    apply: () => U(),
    construct: () => U()
  }); };
  const store = {};
  const els = {};
  const el = sel => els[sel] || (els[sel] = (() => {
    const e = U(), c = new Set();
    e.id = (sel && sel[0] === '#') ? sel.slice(1) : '';
    e.classList = {
      add: (...a) => a.forEach(x => c.add(x)),
      remove: (...a) => a.forEach(x => c.delete(x)),
      toggle: (x, on) => { (on === undefined ? !c.has(x) : on) ? c.add(x) : c.delete(x); return c.has(x); },
      contains: x => c.has(x)
    };
    e.style = {setProperty(){}, removeProperty(){}};
    e.onclick = null;
    e.dataset = {};
    e.textContent = '';
    e.getAttribute = () => null;
    e.setAttribute = () => {};
    e.removeAttribute = () => {};
    e.appendChild = () => {};
    e.removeChild = () => {};
    e.parentNode = null;
    e.children = [];
    return e;
  })());
  const three = U();
  three.WebGLRenderer = function(){ throw new Error('Error creating WebGL context.'); };
  const ctx = {
    console: {log(){}, warn(){}, error(){}, info(){}},
    Math, JSON, Date, Object, Array, Number, String, Set, Map, WeakMap, Promise, RegExp,
    Error, TypeError, Symbol, parseInt, parseFloat, isNaN, isFinite, Proxy, Reflect,
    Uint8Array, Float32Array, encodeURIComponent, decodeURIComponent,
    localStorage: {getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }},
    performance: {now: () => 1e6},
    requestAnimationFrame: () => 1, cancelAnimationFrame(){},
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    matchMedia: () => ({matches: false, addEventListener(){}}),
    addEventListener(){}, removeEventListener(){},
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    navigator: {maxTouchPoints: 0, getGamepads: () => [], userAgent: 'node', hardwareConcurrency: 8, deviceMemory: 8},
    location: {search: '', hash: '', href: 'https://example.test/', protocol: 'https:', hostname: 'example.test'},
    history: {replaceState(){}},
    fetch: () => new Promise(() => {}),
    scrollTo(){}, scrollBy(){},
    getComputedStyle: () => U(),
    URLSearchParams, THREE: three, Peer: U(), AudioContext: U(),
    IntersectionObserver: U(), ResizeObserver: U()
  };
  const doc = U();
  doc.querySelector = sel => el(sel);
  doc.querySelectorAll = () => [];
  doc.getElementById = id => el('#' + id);
  doc.createElement = () => U();
  doc.body = el('body');
  doc.body.children = [];
  doc.body.appendChild = () => {};
  doc.documentElement = el('html');
  ctx.document = doc;
  ctx.window = ctx.self = ctx.globalThis = ctx;
  vm.createContext(ctx);
  const errs = [];
  scripts.forEach((s, i) => { try { vm.runInContext(s, ctx, {filename: 'script' + i}); } catch (e){ errs.push('load ' + i + ': ' + e.message); } });
  const run = js => vm.runInContext(js, ctx);
  assert.equal(errs.filter(x => /startFail|ensureRenderer/.test(x)).length, 0, errs.join('; '));
  assert.equal(run('typeof Obby'), 'object', 'Obby missing: ' + errs.join('; '));
  // start should not throw out to the caller
  assert.doesNotThrow(() => run("Obby.start('lantern')"));
  const st = run(`({
    running: Obby.running,
    show: document.getElementById('obby').classList.contains('show'),
    fail: document.getElementById('oStartFail').classList.contains('show'),
    text: document.getElementById('oStartFailText').textContent,
    exitHook: typeof document.getElementById('oExit').onclick === 'function',
    failExitHook: typeof document.getElementById('oStartFailExit').onclick === 'function'
  })`);
  assert.equal(st.running, false);
  assert.equal(st.show, true);
  assert.equal(st.fail, true);
  assert.match(st.text, /3D graphics/);
  assert.equal(st.exitHook, true);
  assert.equal(st.failExitHook, true);
});
