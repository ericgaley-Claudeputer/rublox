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

test('BUILD is 2026.11.11-26 and matches version.json', () => {
  assert.ok(html.includes("const BUILD = '2026.11.11-26'"));
  assert.strictEqual(version.build, '2026.11.11-26');
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

test('#dhtest=v6furnish still never writes rubloxDreamHouse during the loop', () => {
  // The boot() localStorage starts empty; the fixture must not create a real save key.
  const raw = ctx.localStorage.getItem('rubloxDreamHouse');
  assert.ok(raw == null || raw === 'null' || raw === '', 'fixture wrote rubloxDreamHouse: ' + raw);
});

console.log('RESULT', passed, '/', passed + failed);
process.exit(failed ? 1 : 0);
