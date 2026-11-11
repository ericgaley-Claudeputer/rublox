'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));

let passed = 0, failed = 0;
function test(name, fn){
  try { fn(); passed++; console.log('ok  ' + name); }
  catch (e){ failed++; console.log('not ok  ' + name); console.log('  ' + (e.stack || e.message)); }
}

function extractInlineScripts(html){
  const out = [];
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) out.push({ attrs: m[1] || '', code: m[2] });
  return out;
}

function classList(init){
  const s = new Set(init || []);
  return {
    add(...cs){ cs.forEach(c => s.add(c)); },
    remove(...cs){ cs.forEach(c => s.delete(c)); },
    contains(c){ return s.has(c); },
    toggle(c, on){ if (on === true) s.add(c); else if (on === false) s.delete(c); else if (s.has(c)) s.delete(c); else s.add(c); return s.has(c); },
    _s: s,
    toString(){ return [...s].join(' '); }
  };
}

function makeEl(id){
  const el = {
    id: id || '',
    tagName: 'DIV',
    style: {},
    className: id === 'obby' ? 'obby' : '',
    classList: classList(id === 'obby' ? [] : []),
    textContent: '',
    innerHTML: '',
    hidden: false,
    onclick: null,
    children: [],
    parentElement: null,
    dataset: {},
    appendChild(c){ c.parentElement = this; this.children.push(c); return c; },
    querySelector(){ return makeEl('q'); },
    querySelectorAll(){ return []; },
    addEventListener(){},
    removeEventListener(){},
    getContext(){ return { fillRect(){}, clearRect(){}, beginPath(){}, arc(){}, fill(){}, stroke(){}, moveTo(){}, lineTo(){} }; },
    getAttribute(k){ return this[k]; },
    setAttribute(k, v){ this[k] = v; },
    focus(){},
    blur(){},
  };
  el.parentElement = { style: {}, classList: classList(), appendChild(){}, removeChild(){} };
  return el;
}

test('BUILD is 2026.11.11-20 and matches version.json', () => {
  assert.ok(src.includes("const BUILD = '2026.11.11-20'"));
  assert.strictEqual(version.build, '2026.11.11-20');
});

test('every inline script in index.html parses (a syntax error would make every Play button do nothing)', () => {
  const scripts = extractInlineScripts(src);
  assert.ok(scripts.length >= 1, 'expected inline scripts');
  scripts.forEach((s, i) => {
    try { new vm.Script(s.code, { filename: 'index.html inline script ' + i }); }
    catch (e){ assert.fail('inline script ' + i + ' has a SyntaxError: ' + e.message); }
  });
});

test('start() has a single else for non-Dream-House chrome (no leftover second else)', () => {
  const i = src.indexOf("function start(m = 'obby'");
  assert.ok(i >= 0);
  const j = src.indexOf('\n  function stop(', i);
  const startSrc = src.slice(i, j);
  assert.ok(!/box\.style\.display = 'none'; \}\s*else\s*\{/.test(startSrc), 'start() must not have two else blocks in a row after hiding #dhBox');
  assert.ok(startSrc.includes("if (mode === 'dreamhouse')") && startSrc.includes('dreamhouseEnter()'));
});

test('home-page CSS does not leave a click-eating overlay over the game cards', () => {
  const obby = src.match(/\.obby\{[^}]+\}/);
  assert.ok(obby && /position:fixed/.test(obby[0]) && /inset:0/.test(obby[0]) && /display:none/.test(obby[0]), obby && obby[0]);
  assert.ok(/\.obby\.show\{display:block\}/.test(src));
  const toast = src.match(/\.toast\{[^}]+\}/);
  assert.ok(toast && /visibility:hidden/.test(toast[0]) && /position:fixed/.test(toast[0]));
  assert.ok(!/inset:\s*0/.test(toast[0]));
  const toastTop = src.match(/\.toast\.toast-top\{[^}]+\}/);
  if (toastTop){
    assert.ok(!/inset:\s*0/.test(toastTop[0]), 'toast-top must not be a full-screen overlay: ' + toastTop[0]);
    assert.ok(!/width:\s*100%/.test(toastTop[0]) && !/height:\s*100%/.test(toastTop[0]));
  }
  const dialog = src.match(/<dialog[^>]*id="dhResetModal"[^>]*>/);
  assert.ok(dialog, 'reset dialog exists');
  assert.ok(!/\bopen\b/.test(dialog[0]), 'reset dialog must not start open');
});

function playHarness(){
  const els = {};
  const get = (sel) => {
    const id = String(sel).startsWith('#') ? String(sel).slice(1) : String(sel);
    if (!els[id]) els[id] = makeEl(id);
    if (id === 'obby' && !els[id].classList) els[id].classList = classList();
    return els[id];
  };
  const document = {
    getElementById: (id) => get('#' + id),
    querySelector: (sel) => get(sel),
    querySelectorAll: () => [],
    documentElement: { classList: classList(), style: {} },
    body: { style: {}, classList: classList(), appendChild(){}, className: '' },
    pointerLockElement: null,
    addEventListener(){},
  };
  const started = [];
  const auto = {};
  const sandbox = {
    console,
    Math, JSON, Object, Array, Set, Number, String, Date, isFinite, parseInt, parseFloat,
    document,
    window: null,
    navigator: { maxTouchPoints: 0, userAgent: 'test' },
    matchMedia: () => ({ matches: false, addListener(){}, addEventListener(){}, removeEventListener(){} }),
    devicePixelRatio: 1,
    performance: { now(){ return 0; } },
    requestAnimationFrame(fn){ return 0; },
    cancelAnimationFrame(){},
    localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){}, clear(){} },
    sessionStorage: { getItem(){ return null; }, setItem(){}, removeItem(){}, clear(){} },
    location: { protocol: 'http:', href: 'http://localhost/', search: '', pathname: '/', hash: '' },
    innerWidth: 1024, innerHeight: 768,
    setTimeout(){ return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
    URL: { createObjectURL(){ return 'blob:x'; }, revokeObjectURL(){} },
    Image: function(){ this.src=''; },
    Audio: function(){ this.play = function(){ return Promise.resolve(); }; this.pause = function(){}; },
    THREE: { WebGLRenderer: function(){ this.setPixelRatio = function(){}; this.domElement = makeEl('canvas'); } },
    $: get,
    $$: () => [],
    recordRecentGame(m){ sandbox._recent = m; },
    setHomeInert(){},
    showMsg(){ throw new Error('showMsg should not run when THREE is present'); },
    toast(){},
    mpGuest(){ return false; },
    openLevels(){ sandbox._openLevels = true; },
    gameName(id){ return id; },
    started,
    els,
    get,
  };
  sandbox.window = sandbox;
  const playSrc = src.match(/function play\(id\)\{[\s\S]*?\n    start\(id\);\n  \}/);
  if (!playSrc) throw new Error('could not extract function play(id)');
  const startAt = src.indexOf("function start(m = 'obby'");
  const stopAt = src.indexOf('\n  function stop(', startAt);
  if (startAt < 0 || stopAt < 0) throw new Error('could not extract function start');
  const startSrc = src.slice(startAt, stopAt);
  function makeStub(){
    const bag = Object.create(null);
    bag.style = {};
    bag.classList = classList();
    bag.className = '';
    const fn = function(){ return makeStub(); };
    return new Proxy(fn, {
      get(target, p){
        if (p === Symbol.unscopables) return undefined;
        if (p === 'then') return undefined; // not a Promise
        if (Object.prototype.hasOwnProperty.call(bag, p)) return bag[p];
        if (p === 'length') return bag.length == null ? 0 : bag.length;
        if (p === 'name' || p === 'prototype' || p === 'arguments' || p === 'caller') return target[p];
        return bag[p];
      },
      set(target, p, v){ bag[p] = v; return true; },
      apply(){ return makeStub(); }
    });
  }
  // Auto-stub any undeclared name so start() can run without the rest of the engine.
  const stubs = new Proxy(auto, {
    has: (_, k) => k !== Symbol.unscopables,
    get(t, k){
      if (k === Symbol.unscopables) return undefined;
      if (k in sandbox) return sandbox[k];
      if (Object.prototype.hasOwnProperty.call(t, k) || k in t) return t[k];
      if (typeof k !== 'string') return undefined;
      return t[k] = makeStub();
    },
    set(t, k, v){ t[k] = v; sandbox[k] = v; return true; }
  });
  vm.createContext(sandbox);
  vm.runInContext(`
    const auto = this.__auto;
    with (auto) {
      ${startSrc}
      ${playSrc[0]}
      this.__start = start;
      this.__play = play;
    }
  `, Object.assign(sandbox, { __auto: stubs }));
  return sandbox;
}

function clickPlay(sandbox, gameId){
  const started = [];
  const realStart = sandbox.__start;
  sandbox.__start = function(m, d){
    started.push(m);
    return realStart(m, d);
  };
  // Re-bind play to the wrapped start by re-evaluating play in the same context is hard;
  // call the same play() body: play uses start from the with-scope. So invoke realStart via play
  // after patching the closure... play already closed over original start.
  // Call play() then also ensure we invoke start ourselves if needed — use the extracted play
  // which calls start() in the with-scope. We'll just call __play which is the original play
  // bound to original start. That's fine: we record via mode / #obby after.
  const before = sandbox.els.obby && sandbox.els.obby.classList.contains('show');
  sandbox.__play(gameId);
  const obby = sandbox.get('#obby');
  return { started, obby, mode: sandbox.mode || (sandbox.__auto && sandbox.__auto.mode) };
}

test('clicking Play on Dream House Builders calls start and shows #obby without throwing', () => {
  const h = playHarness();
  const card = makeEl('card');
  card.dataset.game = 'dreamhouse';
  card.onclick = () => h.__play('dreamhouse');
  assert.doesNotThrow(() => card.onclick());
  const obby = h.get('#obby');
  assert.ok(obby.classList.contains('show'), 'expected #obby.show after Dream House Play');
  assert.ok((h.mode === 'dreamhouse') || (h._recent === 'dreamhouse') || (h.__auto && h.__auto.mode === 'dreamhouse'), 'start should set mode to dreamhouse, mode=' + h.mode + ' recent=' + h._recent);
});

test('clicking Play on Bossa Beat Dance Battle calls start and shows #obby without throwing', () => {
  const h = playHarness();
  const card = makeEl('card');
  card.dataset.game = 'dance';
  card.onclick = () => h.__play('dance');
  assert.doesNotThrow(() => card.onclick());
  const obby = h.get('#obby');
  assert.ok(obby.classList.contains('show'), 'expected #obby.show after Dance Play');
  assert.ok((h.mode === 'dance') || (h._recent === 'dance') || (h.__auto && h.__auto.mode === 'dance'), 'start should set mode to dance, mode=' + h.mode + ' recent=' + h._recent);
});

test('buildGames wires home Play buttons to Obby.play for Dream House and Dance', () => {
  const played = [];
  const cards = [];
  const grid = {
    innerHTML: '',
    children: [],
    appendChild(c){ this.children.push(c); cards.push(c); return c; }
  };
  const GAMES = [
    {id:'dreamhouse', name:'Dream House Builders', emoji:'🏡', tag:'t', draw(){}, playable: true, isNew: true},
    {id:'dance', name:'Bossa Beat Dance Battle', emoji:'💃', tag:'t', draw(){}, playable: true, isNew: true},
  ];
  const Obby = { play(id){ played.push(id); } };
  function comingSoon(){ throw new Error('comingSoon should not run for playable games'); }
  const $ = (sel) => sel === '#grid' ? grid : makeEl(sel);
  const ctx = { GAMES, Obby, comingSoon, $, document: { createElement(tag){
    const el = makeEl(tag);
    el.querySelector = (s) => { if (s === 'canvas' || s === 'button'){ const b = makeEl(s); b.getContext = () => ({}); return b; } return makeEl('q'); };
    return el;
  } } };
  const fn = src.match(/function buildGames\(\)\{[\s\S]*?\n\}/);
  assert.ok(fn, 'buildGames missing');
  vm.createContext(ctx);
  vm.runInContext(fn[0] + '\nbuildGames();', ctx);
  const ids = cards.map(c => c.dataset.game);
  assert.deepStrictEqual(ids, ['dreamhouse', 'dance']);
  cards[0].onclick();
  cards[1].onclick();
  assert.deepStrictEqual(played, ['dreamhouse', 'dance']);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
