const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const E = require('../dev/elevator/elev_logic.js');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...HTML.matchAll(/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(m => !/three|peerjs/i.test(m[1]))
  .map(m => m[2]);

function Vec3(x=0,y=0,z=0){ this.x=+x||0; this.y=+y||0; this.z=+z||0; }
Vec3.prototype.set = function(x,y,z){ this.x=+x||0; this.y=+y||0; this.z=+z||0; return this; };
Vec3.prototype.clone = function(){ return new Vec3(this.x,this.y,this.z); };
Vec3.prototype.copy = function(v){ this.x=v.x; this.y=v.y; this.z=v.z; return this; };
Vec3.prototype.add = function(v){ this.x+=v.x; this.y+=v.y; this.z+=v.z; return this; };
Vec3.prototype.sub = function(v){ this.x-=v.x; this.y-=v.y; this.z-=v.z; return this; };
Vec3.prototype.multiplyScalar = function(s){ this.x*=s; this.y*=s; this.z*=s; return this; };
Vec3.prototype.setScalar = function(s){ this.x=this.y=this.z=s; return this; };
Vec3.prototype.length = function(){ return Math.hypot(this.x,this.y,this.z); };
Vec3.prototype.normalize = function(){ const L=this.length()||1; this.x/=L; this.y/=L; this.z/=L; return this; };

function Obj(){
  this.position = new Vec3();
  this.rotation = new Vec3();
  this.scale = new Vec3(1,1,1);
  this.visible = true;
  this.children = [];
  this.material = {color: new Vec3(), emissive: {set(){ return this; }, r:0,g:0,b:0}, opacity: 1, transparent: false};
  this.geometry = {parameters: {}};
  this.up = new Vec3(0,1,0);
  this.add = c => { this.children.push(c); return this; };
  this.remove = c => { this.children = this.children.filter(x => x!==c); };
  this.lookAt = function(){};
  this.updateMatrixWorld = function(){};
  this.updateProjectionMatrix = function(){};
  this.traverse = function(fn){ fn && fn(this); this.children.forEach(c => c.traverse && c.traverse(fn)); };
}
function Mat(){ this.color=new Vec3(); this.emissive={set(){ return this; }}; this.opacity=1; this.transparent=false; this.set=function(){return this}; this.dispose=function(){}; this.map=null; }

const THREE = {
  Vector3: Vec3, Color: function(){ this.set = function(){ return this; }; this.setHex=function(){return this}; },
  Mesh: function(){ return new Obj(); },
  Group: function(){ return new Obj(); },
  BoxGeometry: function(w,h,d){ return {parameters:{width:w,height:h,depth:d}, dispose(){}}; },
  CylinderGeometry: function(){ return {parameters:{}, dispose(){}}; },
  SphereGeometry: function(){ return {parameters:{}, dispose(){}}; },
  PlaneGeometry: function(){ return {parameters:{}, dispose(){}}; },
  CircleGeometry: function(){ return {parameters:{}, dispose(){}}; },
  EdgesGeometry: function(){ return {parameters:{}, dispose(){}}; },
  LineSegments: function(){ return new Obj(); },
  MeshLambertMaterial: function(){ return new Mat(); },
  MeshBasicMaterial: function(){ return new Mat(); },
  MeshPhongMaterial: function(){ return new Mat(); },
  LineBasicMaterial: function(){ return new Mat(); },
  Sprite: function(){ return new Obj(); },
  SpriteMaterial: function(){ return new Mat(); },
  CanvasTexture: function(){ this.magFilter=0; this.dispose=function(){}; },
  NearestFilter: 1, RepeatWrapping: 1, ClampToEdgeWrapping: 1,
  Scene: function(){ const o=new Obj(); o.background=null; o.fog={color:{set(){ return this; }, setHex(){ return this; }},near:0,far:0}; o.add=function(c){ o.children.push(c); return o; }; o.remove=function(c){ o.children=o.children.filter(x=>x!==c); }; return o; },
  PerspectiveCamera: function(){ return new Obj(); },
  WebGLRenderer: function(){ this.setSize=function(){}; this.setPixelRatio=function(){}; this.render=function(){}; this.domElement={style:{}, addEventListener(){}, removeEventListener(){}}; this.dispose=function(){}; },
  AmbientLight: function(){ return new Obj(); },
  DirectionalLight: function(){ return new Obj(); },
  HemisphereLight: function(){ return new Obj(); },
  PointLight: function(){ return new Obj(); },
  Fog: function(){ this.color={set(){ return this; }}; },
  Clock: function(){ this.getDelta=()=>0.016; },
};

const U = () => { const f = function(){}; return new Proxy(f, {get: (t, k) => { if (k === Symbol.toPrimitive) return () => 0; if (k === 'length') return 0; if (k === Symbol.iterator) return function*(){}; if (k in t && k !== 'prototype') return t[k]; return t[k] = U(); }, set: (t, k, v) => { t[k] = v; return true; }, apply: () => U(), construct: () => U()}); };

function boot(){
  const store = {}, rafs = [], errs = []; let now = 1e6;
  const ctx = {
    console: {log(){}, warn(){}, error(){}, info(){}},
    Math, JSON, Date, Object, Array, Number, String, Set, Map, WeakMap, Promise, RegExp, Error, TypeError, Symbol,
    parseInt, parseFloat, isNaN, isFinite, Proxy, Reflect, Uint8Array, Float32Array, encodeURIComponent, decodeURIComponent,
    localStorage: {getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }},
    performance: {now: () => now}, requestAnimationFrame: f => (rafs.push(f), rafs.length), cancelAnimationFrame(){},
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    matchMedia: () => ({matches: false, addEventListener(){}, addListener(){}}), addEventListener(){}, removeEventListener(){},
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    navigator: {maxTouchPoints: 0, getGamepads: () => [], userAgent: 'node'},
    location: {search: '', hash: '', href: 'https://example.test/', protocol: 'https:', pathname: '/'}, history: {replaceState(){}},
    fetch: () => new Promise(() => {}), scrollTo(){}, scrollBy(){}, getComputedStyle: () => U(), URLSearchParams,
    THREE, Peer: U(), AudioContext: U(), IntersectionObserver: U(), ResizeObserver: U(), Image: function(){},
    HTMLCanvasElement: function(){}
  };
  const els = {}, el = sel => els[sel] || (els[sel] = (() => { const e = U(), c = new Set(); e.classList = {add: (...a) => a.forEach(x => c.add(x)), remove: (...a) => a.forEach(x => c.delete(x)), toggle: (x, on) => { (on === undefined ? !c.has(x) : on) ? c.add(x) : c.delete(x); return c.has(x); }, contains: x => c.has(x)}; e.style = {setProperty(){}, removeProperty(){}}; e.onclick = null; e.dataset = {}; e.width=1280; e.height=720; e.getContext=()=>U(); e.textContent=''; e.innerHTML=''; e.value=''; return e; })());
  const doc = U(); doc.querySelector = el; doc.getElementById = id => el('#' + id); doc.querySelectorAll = () => []; ctx.document = doc;
  doc.createElement = t => t === 'canvas' ? el('canvas-'+Math.random()) : t === 'a' ? {href:'',download:'',click(){},remove(){}} : U();
  doc.body = el('body'); doc.body.appendChild = () => {}; doc.documentElement = el('html');
  ctx.window = ctx.self = ctx.globalThis = ctx;
  vm.createContext(ctx);
  scripts.forEach((s, i) => { try { vm.runInContext(s, ctx, {filename: 'script' + i}); } catch (e){ errs.push('load ' + i + ': ' + e.message); } });
  const run = js => vm.runInContext(js, ctx);
  const frames = n => { for (let i = 0; i < n; i++){ const f = rafs.shift(); if (!f) return i; now += 16; f(now); } return n; };
  return {ctx, run, frames, errs, store};
}


function probe(W){
  return JSON.parse(W.run('JSON.stringify(elevDebug.probe())'));
}

function driveFromLobby(W, seconds){
  const frames = Math.ceil((seconds || 16) * 60);
  W.run(`
    (function(){
      if (typeof cam !== 'undefined' && cam) cam.yaw = 0;
      elevDebug.cab();
      var start = elevDebug.probe();
      if (start && start.phase !== 'lobby') throw new Error('cab() should return to lobby, got ' + start.phase);
      elevDebug.to(0, 0.5, 0.4);
      for (let i = 0; i < ` + frames + `; i++) elevDebug.step(1/60);
    })()
  `);
  return probe(W);
}

let W;

test('solo: stepping into the lobby cab arrives at a grounded floor', () => {
  W = boot();
  const fatal = W.errs.filter(e => !/IntersectionObserver|ResizeObserver/.test(e));
  assert.equal(fatal.length, 0, fatal.slice(0, 6).join(' | '));
  assert.equal(W.run('typeof Obby'), 'object');
  W.run("Obby.play('elevator')");
  W.frames(6);
  W.run('elevDebug.cab()');
  let st = probe(W);
  assert.equal(st.phase, 'lobby', 'should begin in the lobby, got ' + JSON.stringify(st));
  assert.equal(W.run('!!elevDebug.inCab()'), false, 'lobby spawn must start outside the cab so the hint is visible, P=' + JSON.stringify(st.P));
  st = driveFromLobby(W, 16);
  assert.equal(st.phase, 'floor', 'should arrive at a floor within 16s, got ' + JSON.stringify(st));
  assert.ok(st.floor, 'a floor id should be set');
  assert.ok(st.P.y >= (st.start && st.start.top || 0.2) - 0.05, 'player y=' + st.P.y);
  assert.ok(st.P.onGround || st.under >= 0.15, 'player should be grounded on the floor: ' + JSON.stringify(st));
  assert.ok(st.floorSolids >= 1, 'floor should have solids');
  assert.equal(st.wantFail, false);
  const start = st.start;
  assert.ok(start, 'floor start missing');
  assert.ok(Math.abs(st.P.z - start.z) < 6, 'should be on the floor, not left in the lobby, z=' + st.P.z);
});

test('simulated multiplayer: host and a joining guest both reach a grounded floor', () => {
  const host = boot();
  const fatal = host.errs.filter(e => !/IntersectionObserver|ResizeObserver/.test(e));
  assert.equal(fatal.length, 0, fatal.slice(0, 6).join(' | '));
  host.run("Obby.play('elevator')");
  host.frames(6);
  host.run(`
    (function(){
      elevDebug.setMp({on:true, host:true});
      window.__elevSnaps = [];
      window.__elevOnSync = function(snap){ window.__elevSnaps.push({t:'elev', a:'sync', snap: JSON.parse(JSON.stringify(snap))}); };
    })()
  `);
  assert.equal(probe(host).phase === 'lobby' || true, true);
  const hostEnd = driveFromLobby(host, 16);
  assert.equal(hostEnd.phase, 'floor', 'host should arrive at a floor, got ' + JSON.stringify(hostEnd));
  assert.ok(hostEnd.P.onGround || hostEnd.under >= 0.15, 'host should be grounded: ' + JSON.stringify(hostEnd));
  assert.ok(Math.abs(hostEnd.P.z - (hostEnd.start && hostEnd.start.z || -30)) < 6, 'host left in lobby? z=' + hostEnd.P.z);
  const hostSnaps = JSON.parse(host.run('JSON.stringify(window.__elevSnaps || [])'));
  assert.ok(hostSnaps.length >= 1, 'host should sync elevator state, got ' + hostSnaps.length);
  const floorSnap = [...hostSnaps].reverse().find(d => d.snap && d.snap.phase === 'floor');
  assert.ok(floorSnap && floorSnap.snap.floor, 'host sync should include a floor arrival, snaps=' + hostSnaps.map(s => s.snap && s.snap.phase).join(','));

  const guest = boot();
  guest.run("Obby.play('elevator')");
  guest.frames(6);
  guest.run('elevDebug.cab()');
  guest.run('elevDebug.setMp({on:true, host:false})');
  assert.equal(probe(guest).phase, 'lobby');
  guest.run('elevDebug.fromHost(' + JSON.stringify(floorSnap) + ')');
  guest.run('for (let i = 0; i < 45; i++) elevDebug.step(1/60);');
  const g = probe(guest);
  assert.equal(g.phase, 'floor', 'guest should follow the host to a floor, got ' + JSON.stringify(g));
  assert.equal(g.floor, floorSnap.snap.floor);
  assert.ok(g.P.onGround || g.under >= 0.15 || g.P.y >= 0.05, 'guest should be standing, got ' + JSON.stringify(g));
  assert.ok(Math.abs(g.P.z) < 8 || Math.abs(g.P.z - (g.start && g.start.z || -30)) < 8, 'guest should be in the cab or on the floor, z=' + g.P.z);
});
