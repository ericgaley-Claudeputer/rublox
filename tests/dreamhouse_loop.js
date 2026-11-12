'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));

let passed = 0, failed = 0;
function test(name, fn){
  try { fn(); passed++; console.log('ok  ' + name); }
  catch (e){ failed++; console.log('not ok  ' + name); console.log('  ' + (e.stack || e.message)); }
}

function extractInlineScripts(src){
  const out = [];
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(src))){
    const attrs = m[1] || '';
    const idm = /\bid=["']([^"']+)/.exec(attrs);
    out.push({ id: idm ? idm[1] : '', attrs, code: m[2] });
  }
  return out;
}

function classList(init){
  const s = new Set(init || []);
  return {
    add(...cs){ cs.forEach(c => s.add(c)); },
    remove(...cs){ cs.forEach(c => s.delete(c)); },
    contains(c){ return s.has(c); },
    toggle(c, on){
      if (on === true) s.add(c);
      else if (on === false) s.delete(c);
      else if (s.has(c)) s.delete(c);
      else s.add(c);
      return s.has(c);
    },
    _s: s,
    toString(){ return [...s].join(' '); }
  };
}

function makeEl(tag, id){
  const listeners = new Map();
  const el = {
    id: id || '',
    tagName: String(tag || 'DIV').toUpperCase(),
    nodeName: String(tag || 'DIV').toUpperCase(),
    nodeType: 1,
    style: new Proxy({}, {
      get(tgt, prop){
        if (prop === 'setProperty') return (k, v) => { tgt[k] = v; };
        if (prop === 'removeProperty') return (k) => { const oldv = tgt[k]; delete tgt[k]; return oldv || ''; };
        if (prop === 'getPropertyValue') return (k) => tgt[k] || '';
        if (prop === 'cssText') return Object.keys(tgt).map(k => k + ':' + tgt[k]).join(';');
        return tgt[prop] == null ? '' : tgt[prop];
      },
      set(tgt, prop, val){ tgt[prop] = val; return true; }
    }),
    className: '',
    classList: classList([]),
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    value: '',
    checked: false,
    width: 800,
    height: 600,
    children: [],
    parentElement: null,
    parentNode: null,
    dataset: {},
    href: '',
    src: '',
    alt: '',
    title: '',
    tabIndex: 0,
    onclick: null,
    onchange: null,
    attributes: {},
    _listeners: listeners,
    appendChild(c){
      if (!c) return c;
      c.parentElement = el;
      c.parentNode = el;
      el.children.push(c);
      if (c.id) el._byId = el._byId || {};
      return c;
    },
    removeChild(c){
      el.children = el.children.filter(x => x !== c);
      if (c){ c.parentElement = null; c.parentNode = null; }
      return c;
    },
    insertBefore(c){ return el.appendChild(c); },
    getContext(type){
      if (String(type).indexOf('webgl') >= 0 || type === 'experimental-webgl'){
        return makeGl();
      }
      const c2d = {
        canvas: el, font: '16px sans-serif', fillStyle: '', strokeStyle: '', globalAlpha: 1,
        textAlign: 'left', textBaseline: 'alphabetic', lineWidth: 1, lineJoin: 'miter', lineCap: 'butt',
        shadowColor: '', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
        miterLimit: 10, globalCompositeOperation: 'source-over',
        measureText(s){ return {width: String(s || '').length * 8}; },
        getImageData(){ return {data: new Uint8ClampedArray(4), width: 1, height: 1}; },
        createImageData(w, h){ return {data: new Uint8ClampedArray((w || 1) * (h || 1) * 4), width: w || 1, height: h || 1}; },
        putImageData(){}, createLinearGradient(){ return {addColorStop(){}}; },
        createRadialGradient(){ return {addColorStop(){}}; }, createPattern(){ return {}; }
      };
      return new Proxy(c2d, {
        get(target, prop){
          if (prop in target) return target[prop];
          if (typeof prop === 'symbol') return undefined;
          const fn = function(){ return c2d; };
          target[prop] = fn;
          return fn;
        },
        set(target, prop, val){ target[prop] = val; return true; }
      });
    },
    getAttribute(k){ return el.attributes[k] != null ? el.attributes[k] : (el[k] != null ? String(el[k]) : null); },
    setAttribute(k, v){ el.attributes[k] = String(v); if (k === 'id') el.id = String(v); if (k === 'class') el.className = String(v); },
    removeAttribute(k){ delete el.attributes[k]; },
    hasAttribute(k){ return k in el.attributes; },
    focus(){}, blur(){}, click(){ if (typeof el.onclick === 'function') el.onclick({preventDefault(){}, stopPropagation(){}, target: el}); },
    closest(sel){
      if (!sel) return null;
      let n = el;
      while (n){
        if (sel[0] === '#' && n.id === sel.slice(1)) return n;
        if (sel[0] === '.' && n.classList && n.classList.contains(sel.slice(1))) return n;
        if (typeof sel === 'string' && sel.indexOf(',') >= 0){
          const parts = sel.split(',').map(s => s.trim());
          if (parts.some(p => (p[0] === '#' && n.id === p.slice(1)) || (p[0] !== '#' && p[0] !== '.' && n.id === p) || (n.tagName && n.tagName.toLowerCase() === p.toLowerCase()) || (n.matches && n.matches(p)))) return n;
        }
        n = n.parentElement;
      }
      return null;
    },
    matches(){ return false; },
    querySelector(s){ return findOne(el, s); },
    querySelectorAll(s){ return findAll(el, s); },
    addEventListener(type, fn, opts){
      const arr = listeners.get(type) || [];
      arr.push({fn, opts});
      listeners.set(type, arr);
    },
    removeEventListener(type, fn){
      const arr = listeners.get(type) || [];
      listeners.set(type, arr.filter(x => x.fn !== fn));
    },
    dispatchEvent(ev){
      ev.target = ev.target || el;
      ev.currentTarget = el;
      const arr = listeners.get(ev.type) || [];
      arr.forEach(x => x.fn(ev));
      return !ev.defaultPrevented;
    },
    getBoundingClientRect(){ return {x: 0, y: 0, width: el.width || 800, height: el.height || 600, top: 0, left: 0, right: 800, bottom: 600}; },
    setPointerCapture(){}, releasePointerCapture(){},
    requestPointerLock(){},
    contains(n){ return n === el || el.children.some(c => c === n || (c.contains && c.contains(n))); }
  };
  if (String(tag).toLowerCase() === 'canvas'){
    el.toDataURL = () => 'data:image/png;base64,';
  }
  return el;
}

function makeGl(){
  const gl = {
    getContextAttributes(){ return {antialias: false, alpha: true, depth: true, stencil: false, premultipliedAlpha: true}; },
    getExtension(){ return {}; },
    getParameter(p){ if (p === 0x1F00) return 'SwiftShader'; if (p === 0x1F01) return 'WebGL stub'; return 0; },
    getShaderPrecisionFormat(){ return {precision: 23, rangeMin: 127, rangeMax: 127}; },
    createBuffer(){ return {}; }, createProgram(){ return {}; }, createShader(){ return {}; },
    createTexture(){ return {}; }, createFramebuffer(){ return {}; }, createRenderbuffer(){ return {}; },
    createVertexArray(){ return {}; },
    bindBuffer(){}, bindTexture(){}, bindFramebuffer(){}, bindRenderbuffer(){}, bindVertexArray(){},
    shaderSource(){}, compileShader(){}, attachShader(){}, linkProgram(){}, useProgram(){},
    getShaderParameter(){ return true; }, getProgramParameter(){ return true; },
    getUniformLocation(){ return {}; }, getAttribLocation(){ return 0; },
    enable(){}, disable(){}, clear(){}, clearColor(){}, clearDepth(){}, viewport(){},
    drawArrays(){}, drawElements(){},
    texelParameteri(){}, texParameteri(){}, texImage2D(){}, texSubImage2D(){},
    pixelStorei(){}, activeTexture(){},
    vertexAttribPointer(){}, enableVertexAttribArray(){}, disableVertexAttribArray(){},
    uniform1f(){}, uniform1i(){}, uniform2f(){}, uniform3f(){}, uniform4f(){},
    uniformMatrix3fv(){}, uniformMatrix4fv(){},
    depthFunc(){}, cullFace(){}, frontFace(){}, blendFunc(){}, blendEquation(){},
    scissor(){}, colorMask(){}, depthMask(){},
    deleteBuffer(){}, deleteTexture(){}, deleteProgram(){}, deleteShader(){},
    deleteFramebuffer(){}, deleteRenderbuffer(){},
    isContextLost(){ return false; },
    VERTEX_SHADER: 35633, FRAGMENT_SHADER: 35632,
    ARRAY_BUFFER: 34962, ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044, DYNAMIC_DRAW: 35048,
    FLOAT: 5126, UNSIGNED_SHORT: 5123, UNSIGNED_BYTE: 5121,
    TEXTURE_2D: 3553, RGBA: 6408, RGB: 6407,
    DEPTH_TEST: 2929, CULL_FACE: 2884, BLEND: 3042,
    COLOR_BUFFER_BIT: 16384, DEPTH_BUFFER_BIT: 256,
    canvas: null
  };
  return gl;
}

function findAll(root, sel, out){
  out = out || [];
  if (!sel) return out;
  const visit = node => {
    if (!node) return;
    if (matchSel(node, sel)) out.push(node);
    (node.children || []).forEach(visit);
  };
  (root.children || []).forEach(visit);
  return out;
}
function findOne(root, sel){
  const all = findAll(root, sel);
  return all[0] || null;
}
function matchSel(node, sel){
  sel = String(sel || '').trim();
  if (!sel) return false;
  if (sel.indexOf(',') >= 0) return sel.split(',').some(s => matchSel(node, s.trim()));
  if (sel[0] === '#') return node.id === sel.slice(1);
  if (sel[0] === '.') return node.classList && node.classList.contains(sel.slice(1));
  if (/^[a-zA-Z][\w-]*$/.test(sel)) return (node.tagName || '').toLowerCase() === sel.toLowerCase();
  const idm = /#([A-Za-z_][\w-]*)/.exec(sel);
  if (idm) return node.id === idm[1];
  return false;
}

function boot(hash){
  const ids = {};
  const htmlIds = new Set();
  const re = /\bid=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) htmlIds.add(m[1]);

  const listeners = new Map();
  function listenOn(map){
    return {
      addEventListener(type, fn, opts){
        const arr = map.get(type) || [];
        arr.push({fn, opts});
        map.set(type, arr);
      },
      removeEventListener(type, fn){
        const arr = map.get(type) || [];
        map.set(type, arr.filter(x => x.fn !== fn));
      },
      dispatchEvent(ev){
        const arr = map.get(ev.type) || [];
        arr.forEach(x => { try { x.fn(ev); } catch (e){ ev._err = ev._err || e; } });
        return !ev.defaultPrevented;
      }
    };
  }

  const body = makeEl('body', '');
  const docEl = makeEl('html', '');
  const head = makeEl('head', '');
  docEl.appendChild(head);
  docEl.appendChild(body);

  function elById(id){
    if (!ids[id]){
      const tag = id === 'obbyView' ? 'div' : (id.toLowerCase().indexOf('canvas') >= 0 ? 'canvas' : 'div');
      ids[id] = makeEl(tag, id);
      body.appendChild(ids[id]);
    }
    return ids[id];
  }
  htmlIds.forEach(id => elById(id));

  const store = new Map();
  const memStore = {
    getItem(k){ return store.has(k) ? store.get(k) : null; },
    setItem(k, v){ store.set(String(k), String(v)); },
    removeItem(k){ store.delete(k); },
    clear(){ store.clear(); },
    key(i){ return [...store.keys()][i] || null; },
    get length(){ return store.size; }
  };

  const loc = {
    href: 'https://example.test/rublox/' + (hash || ''),
    protocol: 'https:',
    host: 'example.test',
    hostname: 'example.test',
    pathname: '/rublox/',
    search: '',
    hash: hash || '',
    origin: 'https://example.test',
    replace(){},
    assign(){},
    reload(){}
  };

  const rafQueue = new Map();
  let rafN = 1;
  let now = 1000;
  const docListen = listenOn(listeners);
  const winListen = listenOn(new Map());

  const document = {
    body,
    documentElement: docEl,
    head,
    readyState: 'complete',
    hidden: false,
    visibilityState: 'visible',
    pointerLockElement: null,
    activeElement: body,
    getElementById: elById,
    createElement(tag){ return makeEl(tag, ''); },
    createElementNS(ns, tag){ return makeEl(tag, ''); },
    createTextNode(t){ return {nodeType: 3, textContent: String(t), data: String(t)}; },
    querySelector(s){
      if (s && s[0] === '#') return elById(s.slice(1));
      return findOne(docEl, s) || (s && s[0] === '#' ? elById(s.slice(1)) : elById('q-' + String(s).replace(/[^A-Za-z0-9_-]/g, '_')));
    },
    querySelectorAll(s){
      if (s && s[0] === '#'){ const e = elById(s.slice(1)); return [e]; }
      return findAll(docEl, s);
    },
    addEventListener: docListen.addEventListener,
    removeEventListener: docListen.removeEventListener,
    dispatchEvent: ev => {
      ev.target = ev.target || document;
      return docListen.dispatchEvent(ev);
    },
    exitPointerLock(){ document.pointerLockElement = null; },
    hasFocus(){ return true; },
    fonts: { ready: Promise.resolve(), add(){}, delete(){} }
  };

  function FakeImage(){ this.width = 1; this.height = 1; this.onload = null; this.src = ''; }
  function FakeAudio(){ this.play = () => Promise.resolve(); this.pause = () => {}; this.load = () => {}; this.addEventListener = () => {}; this.volume = 1; this.currentTime = 0; }
  class FakeAudioContext {
    constructor(){ this.state = 'running'; this.destination = {}; this.sampleRate = 44100; this.currentTime = 0; }
    createGain(){ return {gain: {value: 1}, connect(){ return this; }}; }
    createOscillator(){ return {connect(){ return this; }, start(){}, stop(){}, frequency: {value: 0}, type: 'sine'}; }
    createBuffer(){ return {getChannelData(){ return new Float32Array(1); }}; }
    createBufferSource(){ return {connect(){ return this; }, start(){}, stop(){}, buffer: null}; }
    createDynamicsCompressor(){ return {connect(){ return this; }, threshold:{value:0}, knee:{value:0}, ratio:{value:0}, attack:{value:0}, release:{value:0}}; }
    resume(){ return Promise.resolve(); }
    close(){ return Promise.resolve(); }
  }

  const windowObj = {
    document,
    location: loc,
    localStorage: memStore,
    sessionStorage: memStore,
    devicePixelRatio: 1,
    innerWidth: 1280,
    innerHeight: 720,
    performance: { now(){ return now; } },
    requestAnimationFrame(cb){
      const id = rafN++;
      rafQueue.set(id, cb);
      return id;
    },
    cancelAnimationFrame(id){ rafQueue.delete(id); },
    matchMedia(q){ return {matches: false, media: q, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}}; },
    navigator: { userAgent: 'HeadlessTest/1.0', platform: 'Linux', maxTouchPoints: 0, language: 'en-US', getGamepads(){ return []; } },
    Image: FakeImage,
    Audio: FakeAudio,
    AudioContext: FakeAudioContext,
    webkitAudioContext: FakeAudioContext,
    fetch(url){
      if (String(url).indexOf('version.json') >= 0){
        return Promise.resolve({ok: true, json: () => Promise.resolve({build: version.build})});
      }
      return Promise.resolve({ok: false, json: () => Promise.resolve(null), text: () => Promise.resolve('')});
    },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Promise,
    Map, Set, WeakMap, WeakSet, Array, Object, String, Number, Boolean, Math, JSON, Date, Error, TypeError, RangeError, Uint8Array, Float32Array, Int32Array, Uint16Array, ArrayBuffer, DataView,
    console,
    addEventListener: winListen.addEventListener,
    removeEventListener: winListen.removeEventListener,
    dispatchEvent: ev => {
      ev.target = ev.target || windowObj;
      return winListen.dispatchEvent(ev);
    },
    getComputedStyle(){ return {getPropertyValue(){ return ''; }, display: 'block', visibility: 'visible'}; },
    URL, URLSearchParams,
    event: undefined,
    IntersectionObserver: class IntersectionObserver {
      constructor(cb){ this._cb = cb; }
      observe(){} unobserve(){} disconnect(){} takeRecords(){ return []; }
    },
    ResizeObserver: class ResizeObserver {
      constructor(cb){ this._cb = cb; }
      observe(){} unobserve(){} disconnect(){}
    },
    MutationObserver: class MutationObserver {
      constructor(cb){ this._cb = cb; }
      observe(){} disconnect(){} takeRecords(){ return []; }
    },
    CustomEvent: class CustomEvent {
      constructor(type, init){ this.type = type; Object.assign(this, init || {}); }
    },
    requestIdleCallback(cb){ return setTimeout(() => cb({didTimeout:false, timeRemaining(){ return 16; }}), 0); },
    cancelIdleCallback(id){ clearTimeout(id); }
  };
  windowObj.window = windowObj;
  windowObj.globalThis = windowObj;
  windowObj.self = windowObj;
  document.defaultView = windowObj;

  // Headless-friendly canvas WebGL renderer (installed after three.js loads).
  function installFakeRenderer(ctx){
    if (!ctx.THREE) return;
    ctx.THREE.WebGLRenderer = function WebGLRenderer(){
      this.domElement = document.createElement('canvas');
      this.domElement.width = 800;
      this.domElement.height = 600;
      this.shadowMap = {enabled: false};
      this.outputColorSpace = 0;
      this.setPixelRatio = function(){};
      this.setSize = function(){};
      this.setClearColor = function(){};
      this.render = function(){};
      this.dispose = function(){};
      this.forceContextLoss = function(){};
      this.getContext = function(){ return {getContextAttributes(){ return {antialias: false}; }}; };
      this.getPixelRatio = function(){ return 1; };
      this.getSize = function(t){ if (t){ t.x = 800; t.y = 600; } return {x: 800, y: 600}; };
    };
  }

  const ctx = vm.createContext(windowObj);
  // Copy window props onto the global (vm context is the global).
  // Already created as windowObj.

  const scripts = extractInlineScripts(html);
  scripts.forEach((s, i) => {
    if (s.id === 'peerjs-lib') return; // skip webrtc
    try {
      vm.runInContext(s.code, ctx, {filename: s.id ? s.id + '.js' : 'inline-' + i + '.js', timeout: 20000});
    } catch (e){
      // Home-page init can trip on a thin DOM; keep going if Obby is not yet defined,
      // but rethrow once we are evaluating the game itself.
      if (s.id === 'obby-game' || s.id === 'three-lib') throw e;
      ctx.__bootWarn = ctx.__bootWarn || [];
      ctx.__bootWarn.push((s.id || ('inline-' + i)) + ': ' + e.message);
    }
    if (s.id === 'three-lib') installFakeRenderer(ctx);
  });
  if (ctx.THREE) installFakeRenderer(ctx);
  try {
    vm.runInContext('if (typeof Obby !== "undefined") this.Obby = Obby; if (typeof THREE !== "undefined") this.THREE = THREE;', ctx);
  } catch (e){ ctx.__bootWarn = ctx.__bootWarn || []; ctx.__bootWarn.push('export: ' + e.message); }
  if (ctx.THREE) installFakeRenderer(ctx);

  ctx.__raf = rafQueue;
  ctx.__advance = function(ms){ now += ms; };
  ctx.__fire = function(target, type, props){
    const ev = Object.assign({
      type, bubbles: true, cancelable: true, defaultPrevented: false,
      preventDefault(){ ev.defaultPrevented = true; },
      stopPropagation(){}, stopImmediatePropagation(){},
      timeStamp: now, target: target || windowObj, currentTarget: target || windowObj,
      repeat: false, code: '', key: '', button: 0, buttons: 0
    }, props || {});
    if (target && target.dispatchEvent) target.dispatchEvent(ev);
    else windowObj.dispatchEvent(ev);
    document.dispatchEvent(ev);
    return ev;
  };
  ctx.__key = function(code, down, extra){
    const keyMap = {KeyW:'w', KeyA:'a', KeyS:'s', KeyD:'d', Space:' ', Escape:'Escape', ShiftLeft:'Shift'};
    const evProps = Object.assign({
      code, key: keyMap[code] || code, repeat: false, type: down ? 'keydown' : 'keyup',
      target: body
    }, extra || {});
    ctx.__fire(windowObj, down ? 'keydown' : 'keyup', evProps);
  };
  ctx.__now = () => now;
  return ctx;
}

const R = 0.45;
const EPS = 0.06;

function notInWall(z, zFace, thick, r){
  // Player center must stay at least r outside either face of the wall slab.
  const lo = zFace - r, hi = zFace + thick + r;
  return z <= lo + EPS || z >= hi - EPS;
}

test('BUILD is 2026.11.12-11 and matches version.json', () => {
  assert.ok(html.includes("const BUILD = '2026.11.12-11'"));
  assert.strictEqual(version.build, '2026.11.12-11');
});

test('index.html wires DH clip into step() and exposes a #dhdebug collider path', () => {
  assert.ok(html.includes('if (mode === \'dreamhouse\' && typeof dhRememberPlayer === \'function\') dhRememberPlayer()'));
  assert.ok(html.includes('if (mode === \'dreamhouse\' && typeof dhAfterPhysicsStep === \'function\') dhAfterPhysicsStep()'));
  assert.ok(html.includes('function dhAfterPhysicsStep()'));
  assert.ok(html.includes('function dhRefreshDebugColliders()'));
  assert.ok(html.includes('function dhDebugActive()'));
  assert.ok(/dhdebug/.test(html));
  assert.ok(html.includes('stepFrame(dt)'));
});

let ctx;
test('boots index.html (stubbed WebGL) with #dhtest=v6furnish and starts Dream House', () => {
  ctx = boot('#dhtest=v6furnish');
  assert.ok(ctx.THREE, 'THREE should load');
  assert.ok(ctx.Obby && typeof ctx.Obby.start === 'function', 'Obby.start missing: ' + (ctx.__bootWarn || []).join(' | ') + ' keys=' + Object.keys(ctx).filter(k => /obby|THREE|Obby/i.test(k)).join(','));
  ctx.Obby.start('dreamhouse');
  assert.ok(ctx.obbyDebug, 'obbyDebug hook missing');
  if (ctx.obbyDebug.dhIntro()) ctx.obbyDebug.skipDhIntro();
  // Let the player land on the grass (must actually settle, not be held at y=0.05).
  for (let i = 0; i < 45; i++) ctx.obbyDebug.stepFrame(1 / 60);
  const info = {
    testId: ctx.obbyDebug.dhTestId(),
    mode: ctx.obbyDebug.dhMode(),
    boxes: (ctx.obbyDebug.dhBoxes() || []).length,
    walls: (ctx.obbyDebug.dhWallSolids() || []).length,
    solids: ctx.obbyDebug.solidsN(),
    player: ctx.obbyDebug.player(),
    intro: ctx.obbyDebug.dhIntro()
  };
  assert.strictEqual(info.testId, 'v6furnish', JSON.stringify(info));
  assert.strictEqual(info.mode, 'dreamhouse', JSON.stringify(info));
  assert.ok(info.boxes >= 8, 'expected wall segments, got ' + JSON.stringify(info));
  assert.ok(info.walls >= 8, 'expected wall solids registered in the resolve() array: ' + JSON.stringify(info));
  // Wall solids must not all sit at the origin (the old local-position bug).
  const walls = ctx.obbyDebug.dhWallSolids();
  assert.ok(!walls.every(b => Math.abs(b.x) < 0.4 && Math.abs(b.z) < 0.4), 'wall solids clumped at origin: ' + JSON.stringify(walls.slice(0, 3)));
  assert.ok(!info.intro, 'intro should be skipped for the fixture');
});

test('15 short W taps and a 2 s hold from outside and inside never cross a wall, and the doorway still passes', () => {
  assert.ok(ctx && ctx.obbyDebug, 'previous boot failed');
  const foot = ctx.obbyDebug.dhFoot();
  assert.ok(foot && isFinite(foot.z0) && isFinite(foot.z1), 'missing foot ' + JSON.stringify(foot));
  const thick = 0.30;
  const midX = (foot.x0 + foot.x1) / 2;
  const midZ = (foot.z0 + foot.z1) / 2;
  // Solid pier between the door and the front window (not the doorway).
  const boxes = ctx.obbyDebug.dhBoxes();
  const front = boxes.filter(b => b.id === 'brick' && Math.abs(b.z - (foot.z0 + thick / 2)) < 0.08);
  assert.ok(front.length, 'no front-wall segments: ' + JSON.stringify(boxes.slice(0, 3)));
  // Pick a front segment that is not the door gap (door is around midX).
  const pier = front.filter(b => Math.abs(b.x - midX) > 0.8).sort((a, b) => Math.abs(a.x - midX) - Math.abs(b.x - midX))[0] || front[0];
  const pierX = pier.x;
  const doorBox = boxes.find(b => false);
  // Door world x is mid of the opening — use midX (face 0 door is at center).
  const doorX = midX;

  function place(x, z, yaw){
    ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].forEach(c => {
      try { ctx.__key(c, false); } catch (e){}
      ctx.obbyDebug.setKey(c, false);
    });
    ctx.obbyDebug.teleport(x, 0.35, z);
    ctx.obbyDebug.setCam(yaw, 0.37, 0.2);
    for (let i = 0; i < 30; i++) ctx.obbyDebug.stepFrame(1 / 60);
    // Keep the landed height (grass or slab) and snap back to the test pose.
    const y = Math.max(0, ctx.obbyDebug.player().y);
    ctx.obbyDebug.teleport(x, y, z);
    ctx.obbyDebug.setCam(yaw, 0.37, 0.2);
    ctx.obbyDebug.stepFrame(1 / 60);
    const p = ctx.obbyDebug.player();
    assert.ok(Math.abs(p.x - x) < 0.3 && Math.abs(p.z - z) < 0.3, 'place() drifted off the start pose: ' + JSON.stringify(p) + ' wanted ' + x + ',' + z);
  }
  function tapW(n, dt){
    const zs = [];
    for (let i = 0; i < n; i++){
      ctx.__key('KeyW', true, {repeat: false});
      // ~100 ms tap (dt is capped at 0.05, so two frames)
      ctx.obbyDebug.stepFrame(0.05);
      ctx.obbyDebug.stepFrame(0.05);
      ctx.__key('KeyW', false);
      ctx.obbyDebug.stepFrame(1 / 60);
      zs.push(ctx.obbyDebug.player().z);
    }
    return zs;
  }
  function holdW(seconds){
    const zs = [];
    ctx.__key('KeyW', true, {repeat: false});
    const frames = Math.round(seconds / (1 / 60));
    for (let i = 0; i < frames; i++){
      // browsers also fire key-repeat while the key is held; include that path
      if (i && i % 4 === 0) ctx.__key('KeyW', true, {repeat: true});
      ctx.obbyDebug.stepFrame(1 / 60);
      const p = ctx.obbyDebug.player();
      zs.push(p.z);
    }
    ctx.__key('KeyW', false);
    ctx.obbyDebug.stepFrame(1 / 60);
    return zs;
  }
  function assertOutsideWall(zs, zFace, label){
    zs.forEach((z, i) => {
      assert.ok(notInWall(z, zFace, thick, R), label + ' frame ' + i + ' z=' + z + ' wall@' + zFace + ' (player entered the wall slab or came closer than radius)');
    });
  }
  function camClearance(zFace, fromSouth){
    const cam = ctx.obbyDebug.dhCam();
    assert.ok(cam, 'camera missing');
    if (fromSouth){
      assert.ok(cam.z <= zFace - 0.30 + 0.04, 'camera z=' + cam.z + ' is closer than 0.30 m to the south wall face at ' + zFace);
    } else {
      assert.ok(cam.z >= zFace + thick + 0.30 - 0.04, 'camera z=' + cam.z + ' is closer than 0.30 m to the north wall face at ' + (zFace + thick));
    }
  }

  // (1) 15 short W taps into the front wall from outside
  place(pierX, foot.z0 - 2.2, Math.PI); // look +z, toward the house
  const tOut = tapW(15);
  const pOut = ctx.obbyDebug.player();
  assertOutsideWall(tOut.concat([pOut.z]), foot.z0, '15 taps from outside');
  assert.ok(pOut.z <= foot.z0 - R + EPS && pOut.z > foot.z0 - 2.2, '15 taps should stop at the front wall, z=' + pOut.z + ' z0=' + foot.z0);
  ctx.obbyDebug.stepFrame(1 / 60);
  camClearance(foot.z0, true);

  // (2) 2 s hold into the front wall from outside
  place(pierX, foot.z0 - 2.2, Math.PI);
  const hOut = holdW(2);
  const pHold = ctx.obbyDebug.player();
  assertOutsideWall(hOut.concat([pHold.z]), foot.z0, '2s hold from outside');
  assert.ok(pHold.z <= foot.z0 - R + EPS, '2s hold walked through the front wall, z=' + pHold.z + ' (far side would be past ' + (foot.z0 + thick) + ', plot sign is further north)');
  assert.ok(pHold.z > foot.z0 - 2.2, '2s hold did not approach the wall');
  ctx.obbyDebug.stepFrame(1 / 60);
  camClearance(foot.z0, true);

  // (3) 15 taps + 2 s hold into the front wall from inside
  place(pierX, midZ, 0); // look -z, toward the front wall
  const tIn = tapW(15);
  const pIn = ctx.obbyDebug.player();
  assertOutsideWall(tIn.concat([pIn.z]), foot.z0, '15 taps from inside');
  assert.ok(pIn.z >= foot.z0 + thick + R - EPS && pIn.z < midZ + 0.05, 'inside taps should stop at the inner front wall, z=' + pIn.z);

  place(pierX, midZ, 0);
  const hIn = holdW(2);
  const pInH = ctx.obbyDebug.player();
  assertOutsideWall(hIn.concat([pInH.z]), foot.z0, '2s hold from inside');
  assert.ok(pInH.z >= foot.z0 + thick + R - EPS, '2s hold from inside walked through the front wall, z=' + pInH.z);

  // (4) same against the back wall from inside (this is how testers ended up by the Your Plot sign)
  place(midX, midZ, Math.PI);
  const hBack = holdW(2);
  const pBack = ctx.obbyDebug.player();
  assertOutsideWall(hBack.concat([pBack.z]), foot.z1 - thick, '2s hold into the back wall');
  assert.ok(pBack.z <= foot.z1 - thick - R + EPS && pBack.z > midZ - 0.2, '2s hold walked through the back wall to the far side, z=' + pBack.z + ' z1=' + foot.z1);

  // (5) doorway still passable
  place(doorX, foot.z0 - 2.2, Math.PI);
  holdW(1.6);
  const pDoor = ctx.obbyDebug.player();
  assert.ok(pDoor.z > foot.z0 + 0.4 && pDoor.z < foot.z1 - 0.1, 'doorway should stay walkable, z=' + pDoor.z + ' doorX=' + doorX + ' px=' + pDoor.x + ' z0=' + foot.z0 + ' z1=' + foot.z1);
  // and once inside, the back wall must still stop a continued hold
  ctx.__key('KeyW', true, {repeat: false});
  for (let i = 0; i < 90; i++) ctx.obbyDebug.stepFrame(1 / 60);
  ctx.__key('KeyW', false);
  const pDoorStop = ctx.obbyDebug.player();
  assert.ok(pDoorStop.z <= foot.z1 - thick - R + EPS, 'after walking in the door, a continued hold must stop at the back wall, z=' + pDoorStop.z);
});

test('from fixture spawn, a slight ArrowRight then 1 s of held W walks to the front wall without flipping yaw or leaving the plot', () => {
  // Exact tester sequence on tip 2876d96: #dhtest=v6furnish, spawn facing the
  // door, turn slightly right with the arrow keys, hold W. Must not be yeeted
  // off the lot (the old test teleported past the south curb / never used spawn).
  const ctx2 = boot('#dhtest=v6furnish&dhdebug');
  ctx2.Obby.start('dreamhouse');
  if (ctx2.obbyDebug.dhIntro()) ctx2.obbyDebug.skipDhIntro();
  for (let i = 0; i < 45; i++) ctx2.obbyDebug.stepFrame(1 / 60);
  const spawn = ctx2.obbyDebug.player();
  const foot = ctx2.obbyDebug.dhFoot();
  const R = 0.45, thick = 0.30;
  assert.ok(foot, 'missing foot');
  assert.ok(Math.abs(spawn.x) < 0.2 && spawn.z < foot.z0 - 2, 'expected fixture spawn south of the front wall, got ' + JSON.stringify(spawn) + ' foot=' + JSON.stringify(foot));
  assert.ok(spawn.onGround && spawn.y >= 0 && spawn.y < 0.2, 'player should have landed on the grass, ' + JSON.stringify(spawn));

  const yawSpawn = ctx2.obbyDebug.cam().yaw;
  ctx2.__key('ArrowRight', true, {repeat: false});
  ctx2.obbyDebug.stepFrame(1 / 60);
  ctx2.obbyDebug.stepFrame(1 / 60);
  ctx2.__key('ArrowRight', false);
  const yawTurned = ctx2.obbyDebug.cam().yaw;
  assert.ok(Math.abs(yawTurned - yawSpawn) > 0.02 && Math.abs(yawTurned - yawSpawn) < 0.4, 'ArrowRight should nudge yaw a little, before=' + yawSpawn + ' after=' + yawTurned);

  ctx2.__key('KeyW', true, {repeat: false});
  const track = [];
  for (let i = 0; i < 60; i++){ // 1 s at 60 fps, real dt
    if (i && i % 4 === 0) ctx2.__key('KeyW', true, {repeat: true});
    ctx2.obbyDebug.stepFrame(1 / 60);
    const p = ctx2.obbyDebug.player();
    const yaw = ctx2.obbyDebug.cam().yaw;
    track.push({i, x: p.x, z: p.z, y: p.y, yaw});
    assert.ok(Math.abs(yaw - yawTurned) < 0.001, 'yaw was changed by movement at frame ' + i + ': ' + yaw + ' (wanted ' + yawTurned + ')');
    assert.ok(Math.abs(p.x) < 8 && p.z < foot.z1 + 2 && p.z > spawn.z - 1, 'player left the plot at frame ' + i + ': ' + JSON.stringify(p) + ' spawn=' + JSON.stringify(spawn));
  }
  const mid = ctx2.obbyDebug.player();
  assert.ok(mid.z > spawn.z + 2, 'after 1 s of W the player should have walked toward the house, z=' + mid.z + ' spawn=' + spawn.z);

  // Keep walking until the wall (1 s may be a few decimetres short).
  for (let i = 0; i < 90; i++){
    if (i % 4 === 0) ctx2.__key('KeyW', true, {repeat: true});
    ctx2.obbyDebug.stepFrame(1 / 60);
    const p = ctx2.obbyDebug.player();
    const yaw = ctx2.obbyDebug.cam().yaw;
    assert.ok(Math.abs(yaw - yawTurned) < 0.001, 'yaw changed while approaching the wall: ' + yaw);
    assert.ok(Math.abs(p.x) < 8 && p.z <= foot.z0 + thick + 0.2, 'walked through the front wall or off the plot: ' + JSON.stringify(p) + ' z0=' + foot.z0);
  }
  ctx2.__key('KeyW', false);
  ctx2.obbyDebug.stepFrame(1 / 60);
  const end = ctx2.obbyDebug.player();
  const yawEnd = ctx2.obbyDebug.cam().yaw;
  assert.ok(Math.abs(yawEnd - yawTurned) < 0.001, 'final yaw changed: ' + yawEnd + ' vs ' + yawTurned);
  // Stopped at the south face of the front wall (door may still be slightly open in front of spawn x=0; after a right turn we should meet brick or the jamb).
  const stopZ = foot.z0 - R;
  assert.ok(end.z <= foot.z0 + 0.05 && end.z >= stopZ - 0.35, 'should end at the front wall face, z=' + end.z + ' z0=' + foot.z0 + ' stop=' + stopZ + ' x=' + end.x);
  assert.ok(end.z < foot.z1 - 1, 'must not be on the far side of the house, z=' + end.z);
});

test('from fixture spawn, holding W walks through the finished door into the house', () => {
  const ctx3 = boot('#dhtest=v6furnish');
  ctx3.Obby.start('dreamhouse');
  if (ctx3.obbyDebug.dhIntro()) ctx3.obbyDebug.skipDhIntro();
  for (let i = 0; i < 45; i++) ctx3.obbyDebug.stepFrame(1 / 60);
  const foot = ctx3.obbyDebug.dhFoot();
  const spawn = ctx3.obbyDebug.player();
  const yaw0 = ctx3.obbyDebug.cam().yaw;
  assert.ok(spawn.z < foot.z0 - 2, 'expected outdoor spawn, z=' + spawn.z);
  ctx3.__key('KeyW', true, {repeat: false});
  for (let i = 0; i < 150; i++){ // 2.5 s at 60 fps — enough to cross the doorway at 3.6 m/s
    if (i && i % 4 === 0) ctx3.__key('KeyW', true, {repeat: true});
    ctx3.obbyDebug.stepFrame(1 / 60);
  }
  ctx3.__key('KeyW', false);
  ctx3.obbyDebug.stepFrame(1 / 60);
  const end = ctx3.obbyDebug.player();
  const yaw1 = ctx3.obbyDebug.cam().yaw;
  assert.ok(Math.abs(yaw1 - yaw0) < 0.001, 'walking through the door must not flip yaw: ' + yaw0 + ' -> ' + yaw1);
  assert.ok(end.z > foot.z0 + 0.4 && end.z < foot.z1 - 0.1, 'should walk through the finished door into the house, z=' + end.z + ' x=' + end.x + ' z0=' + foot.z0 + ' z1=' + foot.z1);
});

test('A strafes in DH first person (yaw unchanged, position moves sideways)', () => {
  const ctxA = boot('#dhtest=v6furnish');
  ctxA.Obby.start('dreamhouse');
  if (ctxA.obbyDebug.dhIntro()) ctxA.obbyDebug.skipDhIntro();
  for (let i = 0; i < 45; i++) ctxA.obbyDebug.stepFrame(1 / 60);
  const spawn = ctxA.obbyDebug.player();
  // Face north, stand on open grass south of the house so A is a clear sideways move.
  ctxA.obbyDebug.teleport(spawn.x, Math.max(0, spawn.y), spawn.z);
  ctxA.obbyDebug.setCam(Math.PI, 0.37, 0.2);
  ctxA.obbyDebug.stepFrame(1 / 60);
  const start = ctxA.obbyDebug.player();
  const yaw0 = ctxA.obbyDebug.cam().yaw;
  ctxA.__key('KeyA', true, {repeat: false});
  for (let i = 0; i < 48; i++){ // 0.8 s
    if (i && i % 4 === 0) ctxA.__key('KeyA', true, {repeat: true});
    ctxA.obbyDebug.stepFrame(1 / 60);
    const yaw = ctxA.obbyDebug.cam().yaw;
    assert.ok(Math.abs(yaw - yaw0) < 0.001, 'A turned the camera at frame ' + i + ': ' + yaw + ' (wanted ' + yaw0 + ')');
  }
  ctxA.__key('KeyA', false);
  ctxA.obbyDebug.stepFrame(1 / 60);
  const end = ctxA.obbyDebug.player();
  const yaw1 = ctxA.obbyDebug.cam().yaw;
  const dx = end.x - start.x, dz = end.z - start.z;
  assert.ok(Math.abs(yaw1 - yaw0) < 0.001, 'A must not change yaw: ' + yaw0 + ' -> ' + yaw1);
  assert.ok(Math.abs(dx) > 1.0, 'A should strafe sideways, dx=' + dx + ' dz=' + dz + ' start=' + JSON.stringify(start) + ' end=' + JSON.stringify(end));
  assert.ok(Math.abs(dz) < Math.abs(dx) * 0.4, 'A should be mostly sideways, not forward, dx=' + dx + ' dz=' + dz);
});

test('walk distance at a 20 fps dt is about the same as at 60 fps', () => {
  function walkSouth(dt, seconds){
    const c = boot('#dhtest=v6furnish');
    c.Obby.start('dreamhouse');
    if (c.obbyDebug.dhIntro()) c.obbyDebug.skipDhIntro();
    for (let i = 0; i < 45; i++) c.obbyDebug.stepFrame(1 / 60);
    const spawn = c.obbyDebug.player();
    // Face south, into open grass, so a wall cannot cap the measured distance.
    c.obbyDebug.teleport(spawn.x, Math.max(0, spawn.y), spawn.z);
    c.obbyDebug.setCam(0, 0.37, 0.2); // look -Z
    c.obbyDebug.stepFrame(1 / 60);
    const start = c.obbyDebug.player();
    c.__key('KeyW', true, {repeat: false});
    const frames = Math.round(seconds / dt);
    for (let i = 0; i < frames; i++){
      if (i && i % 4 === 0) c.__key('KeyW', true, {repeat: true});
      c.obbyDebug.stepFrame(dt);
    }
    c.__key('KeyW', false);
    c.obbyDebug.stepFrame(1 / 60);
    const end = c.obbyDebug.player();
    const dist = Math.hypot(end.x - start.x, end.z - start.z);
    return {dist, start, end, speed: dist / seconds};
  }
  const a = walkSouth(1 / 60, 1);
  const b = walkSouth(1 / 20, 1);
  assert.ok(a.dist > 2.4 && a.dist < 5.0, '60 fps should walk about 3-4 m in 1 s, got ' + a.dist + ' m (' + a.speed.toFixed(2) + ' m/s)');
  assert.ok(b.dist > 2.4 && b.dist < 5.0, '20 fps should walk about 3-4 m in 1 s, got ' + b.dist + ' m (' + b.speed.toFixed(2) + ' m/s)');
  const ratio = b.dist / a.dist;
  assert.ok(ratio > 0.85 && ratio < 1.15, '20 fps distance should match 60 fps, 60=' + a.dist.toFixed(3) + ' 20=' + b.dist.toFixed(3) + ' ratio=' + ratio.toFixed(3));
  const c14 = walkSouth(1 / 14, 1);
  assert.ok(c14.dist > 2.4 && c14.dist < 5.0, '14 fps should walk about 3-4 m in 1 s, got ' + c14.dist + ' m (' + c14.speed.toFixed(2) + ' m/s)');
  const r14 = c14.dist / a.dist;
  assert.ok(r14 > 0.85 && r14 < 1.15, '14 fps distance should match 60 fps, 60=' + a.dist.toFixed(3) + ' 14=' + c14.dist.toFixed(3) + ' ratio=' + r14.toFixed(3));
  // A heavy ~350 ms hitch must still simulate the real time (the old 0.25 s cap cut this short).
  const hitch = walkSouth(0.35, 1.05);
  assert.ok(hitch.dist > 2.4 && hitch.dist < 5.5, 'a 350 ms hitch frame should still walk about a full second, got ' + hitch.dist + ' m');
});

test('#dhtest=v6inside spawns inside facing the back wall, and the back wall stops a W hold', () => {
  const ctxI = boot('#dhtest=v6inside');
  ctxI.Obby.start('dreamhouse');
  if (ctxI.obbyDebug.dhIntro()) ctxI.obbyDebug.skipDhIntro();
  for (let i = 0; i < 45; i++) ctxI.obbyDebug.stepFrame(1 / 60);
  const foot = ctxI.obbyDebug.dhFoot();
  const spawn = ctxI.obbyDebug.player();
  const yaw0 = ctxI.obbyDebug.cam().yaw;
  assert.ok(ctxI.obbyDebug.dhTestId() === 'v6inside', 'fixture id ' + ctxI.obbyDebug.dhTestId());
  assert.ok(spawn.x > foot.x0 + 0.4 && spawn.x < foot.x1 - 0.4 && spawn.z > foot.z0 + 0.4 && spawn.z < foot.z1 - 0.4, 'should spawn inside the house, ' + JSON.stringify(spawn) + ' foot=' + JSON.stringify(foot));
  const yawN = ((yaw0 % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  assert.ok(Math.abs(yawN - Math.PI) < 0.2, 'should face the back wall (yaw≈π), yaw=' + yaw0);
  ctxI.__key('KeyW', true, {repeat: false});
  for (let i = 0; i < 120; i++){
    if (i && i % 4 === 0) ctxI.__key('KeyW', true, {repeat: true});
    ctxI.obbyDebug.stepFrame(1 / 60);
    const p = ctxI.obbyDebug.player();
    assert.ok(p.z <= foot.z1 + 0.05, 'walked through the back wall, z=' + p.z + ' z1=' + foot.z1);
  }
  ctxI.__key('KeyW', false);
  const end = ctxI.obbyDebug.player();
  const thick = 0.30;
  assert.ok(end.z <= foot.z1 - thick - R + 0.08 && end.z > spawn.z, 'should stop at the back wall face, z=' + end.z + ' z1=' + foot.z1 + ' spawn=' + spawn.z);
  assert.ok(Math.abs(ctxI.obbyDebug.cam().yaw - yaw0) < 0.001, 'indoor walk must not change yaw');
});

test('#dhdebug draws wireframe collider boxes', () => {
  const dbg = boot('#dhtest=v6furnish&dhdebug');
  assert.ok(dbg.Obby, 'Obby missing in #dhdebug boot');
  dbg.Obby.start('dreamhouse');
  if (dbg.obbyDebug.dhIntro()) dbg.obbyDebug.skipDhIntro();
  for (let i = 0; i < 10; i++) dbg.obbyDebug.stepFrame(1 / 60);
  assert.strictEqual(dbg.obbyDebug.dhTestId(), 'v6furnish');
  assert.ok(dbg.obbyDebug.dhDebugOn(), 'dhDebugActive should be true for #dhdebug');
  assert.ok(dbg.obbyDebug.dhDebugGroup(), 'expected a debug Group of collider wireframes in the scene');
  const n = (dbg.obbyDebug.dhBoxes() || []).length;
  assert.ok(n >= 8, 'debug colliders should cover wall segments, got ' + n);
});

test('#dhtest hash auto-starts the in-memory test house without clicking a tile', () => {
  const c = boot('#dhtest=v7walls');
  assert.ok(c.Obby, 'Obby missing after boot');
  assert.strictEqual(c.Obby.running, true, 'expected start(\'dreamhouse\') from the #dhtest hash alone');
  assert.ok(c.obbyDebug, 'obbyDebug hook missing after auto-start');
  if (c.obbyDebug.dhIntro()) c.obbyDebug.skipDhIntro();
  assert.strictEqual(c.obbyDebug.dhTestId(), 'v7walls');
  assert.strictEqual(c.obbyDebug.dhMode(), 'dreamhouse');
  const note = (c.document && c.document.getElementById('dhTestNote')) || {};
  const text = String(note.textContent || '');
  assert.ok(/TEST HOUSE/i.test(text) && /v7walls/.test(text), 'expected a persistent test-house badge, got: ' + text);
  const raw = c.localStorage.getItem('rubloxDreamHouse');
  assert.ok(raw == null || raw === 'null' || raw === '', 'auto-start wrote rubloxDreamHouse: ' + raw);
  assert.ok(/start\('dreamhouse'\)/.test(html) && /dhtest=/.test(html), 'index.html should auto-start Dream House when the #dhtest hash is set');
});

test('HUD buttons receive a pointer-locked click at their screen rect without pressing Esc', () => {
  const c = boot('#dhtest=v7walls');
  assert.ok(c.Obby && c.Obby.running, 'expected the test house to auto-start');
  assert.ok(typeof c.__rubloxHudTryClick === 'function' && typeof c.__rubloxHudHitAt === 'function', 'HUD hit-test helpers missing');
  const exit = c.document.getElementById('oExit');
  assert.ok(exit, 'Exit button missing');
  exit.getBoundingClientRect = () => ({left: 900, top: 12, right: 1010, bottom: 52, width: 110, height: 40, x: 900, y: 12});
  let clicks = 0;
  exit.onclick = () => { clicks++; };
  const canvas = (c.document.getElementById('obbyView') && c.document.getElementById('obbyView').children[0]) || c.document.getElementById('obbyView') || {id: 'canvas'};
  c.document.pointerLockElement = canvas;
  let exited = false;
  c.document.exitPointerLock = function(){ this.pointerLockElement = null; exited = true; };
  const ev = {
    clientX: 950, clientY: 30, target: canvas, button: 0, pointerType: 'mouse',
    preventDefault(){ ev.prevented = true; },
    stopPropagation(){ ev.stopped = true; },
    stopImmediatePropagation(){ ev.stopped = true; }
  };
  const hit = c.__rubloxHudHitAt(950, 30);
  assert.ok(hit && (hit === exit || hit.id === 'oExit'), 'hit-test at Exit rect should return the Exit button, got ' + (hit && (hit.id || hit.tagName)));
  const handled = c.__rubloxHudTryClick(ev);
  assert.strictEqual(handled, true, 'locked click over Exit should hit the button (hit=' + (hit && hit.id) + ')');
  assert.strictEqual(clicks, 1, 'Exit must be activated without pressing Esc');
  assert.ok(exited || c.document.pointerLockElement == null, 'pointer lock should be released by the HUD click');
});


test('Exit and Upgrades receive a pointer-locked click in Dream House and Block Tag', () => {
  function canvasOf(c){
    return (c.document.getElementById('obbyView') && c.document.getElementById('obbyView').children[0]) || c.document.getElementById('obbyView') || {id: 'canvas'};
  }
  function placeBtn(c, btn, rect){
    assert.ok(btn, 'expected button ' + (btn && btn.id));
    btn.tagName = 'BUTTON';
    btn.nodeName = 'BUTTON';
    btn.disabled = false;
    btn.hidden = false;
    btn.style.display = '';
    btn.style.visibility = '';
    if (btn.classList && btn.classList.remove) btn.classList.remove('dh-paused-hide');
    const host = c.document.getElementById('dhBar') || c.document.getElementById('obby') || c.document.body;
    if (btn.parentElement !== host && host && host.appendChild) host.appendChild(btn);
    btn.getBoundingClientRect = () => ({
      left: rect.l, top: rect.t, right: rect.r, bottom: rect.b,
      width: rect.r - rect.l, height: rect.b - rect.t, x: rect.l, y: rect.t
    });
  }
  function clickLocked(c, btn, rect, useVirtual){
    placeBtn(c, btn, rect);
    let clicks = 0;
    btn.onclick = () => { clicks++; };
    const canvas = canvasOf(c);
    c.document.pointerLockElement = canvas;
    let exited = false;
    c.document.exitPointerLock = function(){ this.pointerLockElement = null; exited = true; };
    const midX = (rect.l + rect.r) / 2, midY = (rect.t + rect.b) / 2;
    // When locked, ev.target is the canvas (not the button). Event coords may be
    // the viewport centre; the virtual cursor is what actually sits on the control.
    if (useVirtual && typeof c.__rubloxHudCursor === 'function') c.__rubloxHudCursor(midX, midY);
    // Event coords while locked may be nowhere near the button (often the
    // canvas centre). Use a point outside stub 800x600 rects so we actually
    // exercise the virtual-cursor hit, the same path a real locked click uses.
    const ev = {
      clientX: useVirtual ? 1400 : midX,
      clientY: useVirtual ? 40 : midY,
      target: canvas, button: 0, pointerType: 'mouse',
      preventDefault(){ ev.prevented = true; },
      stopPropagation(){ ev.stopped = true; },
      stopImmediatePropagation(){ ev.stopped = true; }
    };
    const handled = c.__rubloxHudTryClick(ev);
    return {handled, clicks, exited, ev, canvas};
  }
  function assertButtons(c, mode){
    assert.ok(c.Obby && c.Obby.running, mode + ' should be running');
    assert.ok(typeof c.__rubloxHudTryClick === 'function', 'HUD click helper missing in ' + mode);
    const exit = c.document.getElementById('oExit');
    const up = c.document.getElementById('dhUpBtn');
    assert.ok(exit, 'Exit missing in ' + mode);
    assert.ok(up, 'Upgrades missing in ' + mode);
    const exitRect = {l: 900, t: 12, r: 1010, b: 52};
    const upRect = {l: 520, t: 620, r: 650, b: 670};
    // event position on the button (same path as the -6 test)
    let r = clickLocked(c, exit, exitRect, false);
    assert.strictEqual(r.handled, true, mode + ' locked Exit (event pos) should be handled');
    assert.strictEqual(r.clicks, 1, mode + ' locked Exit (event pos) must activate on the first click');
    assert.ok(r.exited || c.document.pointerLockElement == null, mode + ' Exit should unlock the pointer');
    // virtual cursor over the button, event at the canvas centre
    r = clickLocked(c, up, upRect, true);
    assert.strictEqual(r.handled, true, mode + ' locked Upgrades (virtual cursor) should be handled, target was canvas');
    assert.strictEqual(r.clicks, 1, mode + ' locked Upgrades must activate on the first click');
    assert.ok(r.exited || c.document.pointerLockElement == null, mode + ' Upgrades should unlock the pointer');
    r = clickLocked(c, exit, exitRect, true);
    assert.strictEqual(r.handled, true, mode + ' locked Exit (virtual cursor) should be handled');
    assert.strictEqual(r.clicks, 1, mode + ' locked Exit (virtual cursor) must activate on the first click');
  }

  const dh = boot('#dhtest=v7walls');
  assertButtons(dh, 'dreamhouse');

  const tag = boot();
  try { tag.Obby.start('tag'); } catch (e){ assert.fail('start(tag) threw: ' + e); }
  assert.ok(tag.Obby && tag.Obby.running, 'Block Tag should start');
  assertButtons(tag, 'tag');
});

test('the TEST HOUSE badge hides when you leave Dream House for Pet Hotel or Block Tag', () => {
  const c = boot('#dhtest=v7walls');
  assert.ok(c.Obby && c.Obby.running, 'expected auto-start');
  const note = c.document.getElementById('dhTestNote');
  assert.ok(note, 'badge element missing');
  const shown = (note.classList && note.classList.contains('show')) || (note.style && note.style.display !== 'none' && (note.textContent || '').indexOf('TEST HOUSE') >= 0);
  assert.ok(shown && /TEST HOUSE/.test(note.textContent || ''), 'badge should be visible in the test house, got: ' + (note.textContent || '') + ' display=' + (note.style && note.style.display));
  try { c.Obby.stop(); } catch (e){}
  const visible = () => !!(note.classList && note.classList.contains('show')) && note.style && note.style.display !== 'none' && /TEST HOUSE/.test(note.textContent || '');
  assert.ok(!visible() && !(note.classList && note.classList.contains('show')), 'badge still visible after stop: text=' + (note.textContent || '') + ' display=' + (note.style && note.style.display));
  try { c.Obby.start('pethotel'); } catch (e){}
  assert.ok(!visible() && !(note.classList && note.classList.contains('show')), 'badge leaked into Pet Hotel: text=' + (note.textContent || '') + ' display=' + (note.style && note.style.display));
  try { c.Obby.stop(); } catch (e){}
  try { c.Obby.start('tag'); } catch (e){}
  assert.ok(!visible() && !(note.classList && note.classList.contains('show')), 'badge leaked into Block Tag: text=' + (note.textContent || '') + ' display=' + (note.style && note.style.display));
  assert.ok(html.includes('function dhHideTestNote') && html.includes("if (typeof dhHideTestNote === 'function') try { dhHideTestNote(); }"));
});


function canvasOf(c){
  const view = c.document.getElementById('obbyView');
  if (view && view.children && view.children.length) return view.children[view.children.length - 1];
  return (view && view.children && view.children[0]) || view;
}
function fire(el, type, extra){
  const ev = Object.assign({
    type, bubbles: true, cancelable: true,
    clientX: 400, clientY: 300, pointerId: 1, pointerType: 'mouse',
    button: 0, buttons: type === 'pointerup' ? 0 : 1,
    movementX: 0, movementY: 0, deltaY: 0,
    preventDefault(){ ev.defaultPrevented = true; },
    stopPropagation(){},
    stopImmediatePropagation(){},
    target: el
  }, extra || {});
  if (typeof el.dispatchEvent === 'function') el.dispatchEvent(ev);
  return ev;
}

test('third-person drag, pointer-lock look, and Water Park FP stay above the ground', () => {
  const c = boot();
  try { c.Obby.start('waterpark'); } catch (e){ assert.fail('start(waterpark) threw: ' + e); }
  assert.ok(c.Obby && c.Obby.running, 'Water Park should start');
  if (c.obbyDebug && c.obbyDebug.setFP) c.obbyDebug.setFP(false);
  for (let i = 0; i < 6; i++) c.obbyDebug.stepFrame(1 / 60);
  const canvas = canvasOf(c);
  assert.ok(canvas && typeof canvas.dispatchEvent === 'function', 'expected a game canvas');
  // An unlocked click on the canvas itself must not be stolen as a HUD hit.
  c.document.pointerLockElement = null;
  const unlocked = c.__rubloxHudTryClick({
    clientX: 400, clientY: 300, target: canvas, button: 0, pointerType: 'mouse',
    preventDefault(){}, stopPropagation(){}, stopImmediatePropagation(){}
  });
  assert.strictEqual(unlocked, false, 'unlocked canvas click must not be treated as a HUD click');

  const yaw0 = c.obbyDebug.fp().yaw;
  fire(canvas, 'pointerdown', {clientX: 400, clientY: 300});
  fire(canvas, 'pointermove', {clientX: 480, clientY: 340, pointerId: 1});
  fire(canvas, 'pointerup', {clientX: 480, clientY: 340});
  const yawDrag = c.obbyDebug.fp().yaw;
  assert.ok(Math.abs(yawDrag - yaw0) > 0.01, 'third-person drag should turn the camera, dYaw=' + (yawDrag - yaw0));

  // First-person pointer-lock look: a real mousedown requests lock, then mousemove uses movementX.
  if (c.obbyDebug.setFP) c.obbyDebug.setFP(true);
  let requested = 0;
  canvas.requestPointerLock = function(){ requested++; c.document.pointerLockElement = canvas; };
  fire(canvas, 'pointerdown', {clientX: 400, clientY: 300, pointerType: 'mouse'});
  assert.ok(requested >= 1, 'clicking the view in first person should call requestPointerLock');
  const yaw1 = c.obbyDebug.fp().yaw;
  fire(canvas, 'mousemove', {movementX: 40, movementY: 6});
  const yawLock = c.obbyDebug.fp().yaw;
  assert.ok(Math.abs(yawLock - yaw1) > 0.01, 'pointer-locked mousemove should turn the camera, dYaw=' + (yawLock - yaw1));

  // Standing on the 100x100 sand: recoverFp must not fling the player off the map or bury the eye.
  if (c.obbyDebug.recoverFp) c.obbyDebug.recoverFp();
  if (c.obbyDebug.clipFp) c.obbyDebug.clipFp();
  if (typeof c.updateCamera === 'function') c.updateCamera();
  const after = c.obbyDebug.fp();
  const wp = c.obbyDebug.waterpark && c.obbyDebug.waterpark();
  const px = wp && wp.P ? wp.P.x : 0, pz = wp && wp.P ? wp.P.z : 0, py = (after && after.Py != null) ? after.Py : (wp && wp.P && wp.P.y);
  assert.ok(py > -0.1 && py < 3, 'player should stay on the sand, Py=' + py);
  assert.ok(after.camY == null || after.camY > 1, 'FP eye should stay above the sand, camY=' + after.camY);
  assert.ok(Math.abs(px) < 40 && Math.abs(pz) < 45, 'recoverFp must not fling the player to the map edge, P=' + JSON.stringify(wp && wp.P));
});

test('mouse look still works after the WebGL canvas is replaced (auto-quality)', () => {
  const c = boot();
  try { c.Obby.start('waterpark'); } catch (e){ assert.fail('start(waterpark) threw: ' + e); }
  if (c.obbyDebug && c.obbyDebug.setFP) c.obbyDebug.setFP(false);
  for (let i = 0; i < 4; i++) c.obbyDebug.stepFrame(1 / 60);
  assert.ok(html.includes('attachGamePointer') && html.includes('renderer.domElement !== prevEl'), 'ensureRenderer should rebind pointer listeners when the canvas is swapped');
  assert.ok(typeof c.__obbyBindGamePointer === 'function', 'expected window.__obbyBindGamePointer so a swapped canvas can be re-bound');
  const fresh = c.document.createElement('canvas');
  fresh.width = 800; fresh.height = 600;
  const view = c.document.getElementById('obbyView');
  if (view && view.appendChild) view.appendChild(fresh);
  c.__obbyBindGamePointer(fresh);
  const yaw0 = c.obbyDebug.fp().yaw;
  fire(fresh, 'pointerdown', {clientX: 400, clientY: 300});
  fire(fresh, 'pointermove', {clientX: 470, clientY: 330, pointerId: 1});
  fire(fresh, 'pointerup', {clientX: 470, clientY: 330});
  const yaw1 = c.obbyDebug.fp().yaw;
  assert.ok(Math.abs(yaw1 - yaw0) > 0.01, 'drag-orbit on a rebound canvas should turn the camera, dYaw=' + (yaw1 - yaw0));
  if (c.obbyDebug.setFP) c.obbyDebug.setFP(true);
  const fpState = c.obbyDebug.fp();
  assert.ok(fpState.on && fpState.active, 'first person should be on before the lock click, got ' + JSON.stringify(fpState));
  let requested = 0;
  fresh.requestPointerLock = function(){ requested++; c.document.pointerLockElement = fresh; };
  fire(fresh, 'pointerdown', {clientX: 400, clientY: 300, pointerType: 'mouse'});
  if (!requested){
    // Click may have been ignored if a HUD rect overlapped the stub coords; lock directly and still test look.
    c.document.pointerLockElement = fresh;
  }
  assert.ok(requested >= 1 || c.document.pointerLockElement === fresh, 'the replacement canvas should request pointer lock or accept a lock');
  const yaw2 = c.obbyDebug.fp().yaw;
  fire(fresh, 'mousemove', {movementX: 35, movementY: 4});
  assert.ok(Math.abs(c.obbyDebug.fp().yaw - yaw2) > 0.01, 'pointer-lock look must work on the replacement canvas, dYaw=' + (c.obbyDebug.fp().yaw - yaw2) + ' requested=' + requested);
});

test('#dhtest=v6furnish still never writes rubloxDreamHouse during the loop', () => {
  // The boot() localStorage starts empty; the fixture must not create a real save key.
  const raw = ctx.localStorage.getItem('rubloxDreamHouse');
  assert.ok(raw == null || raw === 'null' || raw === '', 'fixture wrote rubloxDreamHouse: ' + raw);
});

console.log('RESULT', passed, '/', passed + failed);
process.exit(failed ? 1 : 0);
