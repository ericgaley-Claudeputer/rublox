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

test('the cab sits inside the lobby building bounds', () => {
  assert.equal(E.elevCabInsideBuilding(), true);
  const B = E.ELEV_BUILDING;
  const hw = E.ELEV_CAB_W / 2, hd = E.ELEV_CAB_D / 2;
  assert.ok(B.minX < -hw && B.maxX > hw);
  assert.ok(B.minZ < -hd && B.maxZ > hd);
  assert.ok(B.maxY > 5, 'lobby ceiling is above the cab');
  assert.ok(B.shaftTop > B.maxY, 'the shaft rises through the lobby roof');
});

test('camera distance clamps when a wall sits between the player and the camera', () => {
  const eye = {x: 0, y: 2.2, z: 0};
  const wall = {x: 5.2, y: 4, z: 0, hw: 0.2, hh: 8, hd: 5.2};
  const want = 14;
  const got = E.elevClipOrbit(eye.x, eye.y, eye.z, Math.PI / 2, 0.28, want, 0.6, [wall]);
  assert.ok(got < 5.5, 'should pull in before the cab side wall, got ' + got);
  assert.ok(got >= 0.6, 'should not collapse through the player, got ' + got);
  const clear = E.elevClipOrbit(eye.x, eye.y, eye.z, 0, 0.28, want, 0.6, [wall]);
  assert.ok(clear > 10, 'an open look down the cab should keep more distance, got ' + clear);
  const none = E.elevClipOrbit(eye.x, eye.y, eye.z, Math.PI / 2, 0.28, want, 0.6, []);
  assert.equal(none, want);
});

test('index.html wires opaque walls, orbit clip, and first-person camOnly skips', () => {
  assert.match(HTML, /function elevBuildShell\(/);
  assert.match(HTML, /function elevWall\(/);
  assert.match(HTML, /function elevCamSolid\(/);
  assert.match(HTML, /const side = \(typeof THREE !== 'undefined' && THREE\.DoubleSide != null\) \? THREE\.DoubleSide : 2/);
  assert.match(HTML, /mode === 'hunt' \|\| mode === 'elevator'\)\{ \/\/ pull the camera/);
  assert.match(HTML, /if \(b && b\.camOnly\) continue;/);
  assert.match(HTML, /b\.floorOnly \|\| b\.camOnly \|\| !b\.mesh/);
  assert.ok(HTML.includes('id="elevAct"'));
  assert.match(HTML, /function elevBeginBoard\(/);
  assert.match(HTML, /function elevCatchFall\(/);
  assert.match(HTML, /elevShowPals/);
});

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
function Mat(opts){
  opts = opts || {};
  this.color=new Vec3();
  this.emissive={set(){ return this; }};
  this.opacity=opts.opacity == null ? 1 : opts.opacity;
  this.transparent=!!opts.transparent;
  this.side=opts.side;
  this.set=function(){return this};
  this.dispose=function(){};
  this.map=null;
}

const THREE = {
  Vector3: Vec3, Color: function(){ this.set = function(){ return this; }; this.setHex=function(){return this}; },
  Mesh: function(geo, mat){ const o = new Obj(); if (mat) o.material = mat; return o; },
  Group: function(){ return new Obj(); },
  BoxGeometry: function(w,h,d){ return {parameters:{width:w,height:h,depth:d}, dispose(){}}; },
  CylinderGeometry: function(){ return {parameters:{}, dispose(){}}; },
  SphereGeometry: function(){ return {parameters:{}, dispose(){}}; },
  PlaneGeometry: function(){ return {parameters:{}, dispose(){}}; },
  CircleGeometry: function(){ return {parameters:{}, dispose(){}}; },
  EdgesGeometry: function(){ return {parameters:{}, dispose(){}}; },
  LineSegments: function(){ return new Obj(); },
  MeshLambertMaterial: function(opts){ return new Mat(opts); },
  MeshBasicMaterial: function(opts){ return new Mat(opts); },
  MeshPhongMaterial: function(opts){ return new Mat(opts); },
  LineBasicMaterial: function(opts){ return new Mat(opts); },
  Sprite: function(){ return new Obj(); },
  SpriteMaterial: function(opts){ return new Mat(opts); },
  CanvasTexture: function(){ this.magFilter=0; this.dispose=function(){}; },
  NearestFilter: 1, RepeatWrapping: 1, ClampToEdgeWrapping: 1, DoubleSide: 2, FrontSide: 0,
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

test('live cab walls clamp the third-person camera and stay inside the building', () => {
  const W = boot();
  const fatal = W.errs.filter(e => !/IntersectionObserver|ResizeObserver/.test(e));
  assert.equal(fatal.length, 0, fatal.slice(0, 6).join(' | '));
  W.run("Obby.play('elevator')");
  W.frames(6);
  const built = JSON.parse(W.run('JSON.stringify(elevDebug.building())'));
  assert.ok(built && built.walls >= 12, 'expected a building of walls around the cab, got ' + JSON.stringify(built));
  assert.equal(built.cabInside, true);
  assert.ok(built.camOnly >= 4, 'sliding doors should be camera solids, got ' + built.camOnly);

  W.run("elevDebug.to(0, 0.5, 0);");
  const side = JSON.parse(W.run('JSON.stringify(elevDebug.clip(14, Math.PI / 2, 0.28))'));
  assert.ok(side && side.dist < 5.6, 'camera should stop at the cab wall, got ' + JSON.stringify(side));
  assert.ok(side.dist >= 0.6, 'camera should not jump into the player, got ' + side.dist);

  W.run("elevDebug.to(0, 0.5, 11);");
  const lobby = JSON.parse(W.run('JSON.stringify(elevDebug.clip(24, 0, 0.28))'));
  assert.ok(lobby && lobby.dist < 18, 'lobby camera should pull in before the back wall, got ' + JSON.stringify(lobby));
});
