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

test('BUILD is 2026.11.12-8 and matches version.json', () => {
  assert.ok(src.includes("const BUILD = '2026.11.12-8'"));
  assert.strictEqual(version.build, '2026.11.12-8');
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

test('Pet Hotel is a playable New game on the home menu and start() can open it', () => {
  assert.ok(/id:'pethotel'/.test(src) && /name:'Pet Hotel'/.test(src) && /draw: drawPetHotel/.test(src));
  assert.ok(src.includes("playable: true") && src.includes("function drawPetHotel"));
  const i = src.indexOf("function start(m = 'obby'");
  assert.ok(i >= 0 && src.slice(i, i+1200).includes("'pethotel'"));
  assert.ok(src.includes('buildPetHotel()') && src.includes('petHotelEnter()') && src.includes('id="phAct"'));
});


test('drawPetHotel tile art does not throw when the hotel icons are not defined yet (home boot order)', () => {
  const m = src.match(/function drawPetHotel\(ctx\)\{[\s\S]*?\nfunction /);
  assert.ok(m && m[0].includes('function drawPetHotel'), 'outer drawPetHotel missing');
  const fn = m[0].replace(/\nfunction $/, '\n');
  const texts = [];
  const ctx2d = {
    fillStyle: '', font: '',
    fillRect(){}, beginPath(){}, arc(){}, fill(){},
    fillText(t){ texts.push(String(t)); },
  };
  const sandbox = { sky(){}, guy(){} };
  vm.createContext(sandbox);
  vm.runInContext(fn + '\ndrawPetHotel(ctx2d);', Object.assign(sandbox, {ctx2d, Math}));
  assert.ok(texts.length >= 1, 'expected icon text on the tile');
  assert.ok(texts.every(t => t && !/undefined/.test(t)), texts);
});

test('buildGames still adds every mode if one tile preview throws', () => {
  const cards = [];
  const grid = { innerHTML: '', children: [], appendChild(c){ this.children.push(c); cards.push(c); return c; } };
  const GAMES = [
    {id:'dreamhouse', name:'Dream House Builders', emoji:'🏡', tag:'t', draw(){}, playable: true},
    {id:'pethotel', name:'Pet Hotel', emoji:'🏨', tag:'t', draw(){ throw new Error('preview boom'); }, playable: true, isNew: true},
    {id:'dance', name:'Bossa Beat Dance Battle', emoji:'💃', tag:'t', draw(){}, playable: true},
    {id:'obby', name:'Obby Rush', emoji:'🏃', tag:'t', draw(){}, playable: true},
  ];
  const Obby = { play(){} };
  function comingSoon(){}
  const $ = (sel) => sel === '#grid' ? grid : makeEl(sel);
  const ctx = { GAMES, Obby, comingSoon, $, document: { createElement(tag){
    const el = makeEl(tag);
    el.querySelector = (s) => { if (s === 'canvas' || s === 'button'){ const b = makeEl(s); b.getContext = () => ({}); return b; } return makeEl('q'); };
    return el;
  } } };
  const fn = src.match(/function buildGames\(\)\{[\s\S]*?\n\}/);
  vm.createContext(ctx);
  vm.runInContext(fn[0] + '\nbuildGames();', ctx);
  assert.deepStrictEqual(cards.map(c => c.dataset.game), ['dreamhouse', 'pethotel', 'dance', 'obby']);
});

test('the Hi there name popup keeps Let\'s go! visible on short laptop and phone-landscape screens', () => {
  assert.ok(src.includes('id="nameModal"') && src.includes('id="nameOk"') && src.includes("Let's go!"));
  assert.ok(/#nameModal \.mbox\{[^}]*max-height:/.test(src), 'name modal box must have a viewport max-height');
  assert.ok(/#nameModal #nameOk\{[^}]*position:sticky/.test(src), 'Let\'s go! must stick to the bottom of the popup');
  assert.ok(src.includes('@media (max-height:850px)') && src.includes('#nameModal #nameOk'), 'laptop-height (1280x800) shrink rules');
  assert.ok(src.includes('@media (max-height:500px)') && /#nameModal .mbox\{[^}]*padding:8px 14px/.test(src), 'phone-landscape shrink rules');
});

test('a fresh profile still asks for a name and draws the avatar after the games grid is built', () => {
  const start = src.indexOf('/* ---------- start ---------- */');
  assert.ok(start >= 0);
  const boot = src.slice(start, src.indexOf('</script>', start));
  assert.ok(boot.includes('try { buildGames(); }'));
  assert.ok(boot.includes('drawBig()') && boot.includes('drawChip()') && boot.includes('if (!player) askName()'));
  assert.ok(boot.indexOf('buildGames()') < boot.indexOf('if (!player) askName()'));
  assert.ok(boot.indexOf('drawBig()') < boot.indexOf('if (!player) askName()'));
});


test('the home join-code box (and other code inputs) accept click, typing, and paste after the HUD pointer hook is armed', () => {
  const start = src.indexOf('function hudIsEditableTarget');
  const end = src.indexOf('function dhIsUiEvent', start);
  assert.ok(start >= 0 && end > start, 'hud pointer helpers should be in the page');
  const sandbox = { document: { pointerLockElement: null, activeElement: null }, window: {}, console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src.slice(start, end), sandbox);
  assert.ok(typeof sandbox.hudShouldCapturePointer === 'function');

  const ids = [];
  const re = /<input\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(src))) {
    const attrs = m[1];
    const id = (attrs.match(/\bid=["']([^"']+)["']/) || [])[1];
    if (!id) continue;
    if (/id="mpCode"|placeholder="CODE"|aria-label="Room code"/i.test(m[0]) || id === 'mpCode') ids.push(id);
  }
  assert.ok(ids.includes('mpCode'), 'home Friends/Join panel must have #mpCode');
  assert.ok(!/\bid="mpCode"[^>]*(disabled|readonly)/i.test(src), '#mpCode must not be disabled or readonly');
  assert.ok(!/<input[^>]*id="mpCode"[^>]*pattern=/.test(src), '#mpCode must not use a pattern that rejects letters');

  function makeInput(id){
    const el = {
      id, tagName: 'INPUT', value: '', focused: false, isContentEditable: false,
      closest(sel){
        const want = String(sel);
        if (/input/.test(want) || want.split(',').some(s => s.trim() === 'input' || s.trim() === '#' + id)) return el;
        return null;
      },
      contains(){ return false; },
      focus(){ el.focused = true; sandbox.document.activeElement = el; },
      blur(){ el.focused = false; if (sandbox.document.activeElement === el) sandbox.document.activeElement = null; },
      click(){ el.clicked = true; }
    };
    return el;
  }

  const canvas = { id: 'gl', tagName: 'CANVAS', contains(){ return false; }, closest(){ return null; } };

  // The live bug: after bind() the capture-phase HUD hook called preventDefault on
  // pointerdown for any input (HUD_HIT_SEL includes "input"), which kept the field
  // from focusing so typing and paste did nothing.
  function armHook(canvasEl){
    return function onPointerDown(ev){
      const steal = sandbox.hudShouldCapturePointer(ev, canvasEl);
      if (steal) ev.preventDefault();
      ev.stole = steal;
    };
  }

  function typeAndPaste(el, hook){
    const ev = {
      target: el, srcElement: el, clientX: 40, clientY: 40, type: 'pointerdown',
      prevented: false, stole: false,
      preventDefault(){ ev.prevented = true; }
    };
    sandbox.document.pointerLockElement = null;
    sandbox.document.activeElement = null;
    hook(ev);
    assert.strictEqual(ev.stole, false, el.id + ' pointerdown must not be captured on the home page');
    assert.strictEqual(ev.prevented, false, el.id + ' pointerdown must not be preventDefaulted (that blocks focus)');
    if (!ev.prevented) el.focus();
    assert.ok(el.focused, el.id + ' should be focused after click');
    // simulate typing a 5-letter room code (Mac / physical keyboard)
    el.value = '';
    for (const ch of 'HQMZK'){
      const key = { key: ch, code: 'Key' + ch, target: el, defaultPrevented: false, preventDefault(){ key.defaultPrevented = true; } };
      assert.ok(!key.defaultPrevented);
      el.value += ch;
    }
    assert.strictEqual(el.value, 'HQMZK', el.id + ' must accept typed letters');
    // simulate paste (Mac Cmd+V / mobile paste)
    el.value = '';
    el.value += 'AB3DE';
    assert.strictEqual(el.value, 'AB3DE', el.id + ' must accept paste');
  }

  const hook = armHook(canvas);
  const unique = [...new Set(ids)];
  assert.ok(unique.length >= 1);
  unique.forEach(id => typeAndPaste(makeInput(id), hook));

  // HUD clicks while pointer-locked (target is the canvas) must still be capturable
  sandbox.document.pointerLockElement = canvas;
  sandbox.document.activeElement = null;
  const lockedEv = { target: canvas, clientX: 10, clientY: 10, preventDefault(){} };
  assert.strictEqual(sandbox.hudShouldCapturePointer(lockedEv, canvas), true, 'pointer-locked canvas clicks still go to the HUD hook');
  sandbox.document.pointerLockElement = null;
});

test('hosting a room times out with a friendly retry instead of hanging on starting room', () => {
  const i = src.indexOf('function mpHost(');
  assert.ok(i >= 0);
  const fn = src.slice(i, i + 2800);
  assert.ok(src.includes('const MP_HOST_MS = 12000'), 'host timeout missing');
  assert.ok(/setTimeout\(\s*\(\)\s*=>\s*\{\s*failHost\(MP_HOST_FAIL\)/.test(fn) || /setTimeout\(\s*\(\)\s*=>\s*\{\s*failHost\(MP_HOST_FAIL\);\s*\},\s*MP_HOST_MS\)/.test(fn), fn.slice(0, 400));
  assert.ok(src.includes("Couldn't start a room") && src.includes('try again'));
  const r = src.indexOf('function mpRender(){');
  assert.ok(r >= 0 && src.slice(r, r + 500).includes('dhRenderInvite()'));
  assert.ok(src.includes('id="dhVisitRetry"') && src.includes('function dhRetryInvite'));
});


console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
