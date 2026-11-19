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

let W;

test('boots Wobblevator and keeps the player grounded on every floor', () => {
  W = boot();
  const fatal = W.errs.filter(e => !/IntersectionObserver|ResizeObserver/.test(e));
  assert.equal(fatal.length, 0, fatal.slice(0, 6).join(' | '));
  assert.equal(W.run('typeof Obby'), 'object');
  assert.equal(W.run('typeof elevDebug'), 'object');
  W.run("Obby.play('elevator')");
  W.frames(6);
  assert.equal(W.run('typeof elevDebug.probe'), 'function');

  const ids = JSON.parse(W.run('JSON.stringify(elevDebug.floors())'));
  assert.ok(ids.length >= 45, 'expected 45+ floors, got ' + ids.length);
  const failed = [];
  for (const id of ids){
    W.run('elevDebug.floor(' + JSON.stringify(id) + ')');
    const room = E.elevRoomOf(id);
    // step a few seconds of live physics
    W.run('for (let i = 0; i < 150; i++) obbyDebug.physTick(1/60);');
    const probe = JSON.parse(W.run('JSON.stringify(elevDebug.probe())'));
    const y = probe && probe.P && probe.P.y;
    const minOk = room.top - 0.05;
    const on = !!(probe && (probe.P.onGround || (probe.under >= room.top - 0.02)));
    if (!(probe && probe.floorSolids >= 1)) failed.push(id + ' no floor solids ' + JSON.stringify(probe));
    else if (!(y >= minOk)) failed.push(id + ' y=' + y + ' under floor ' + room.top + ' probe=' + JSON.stringify(probe));
    else if (!on) failed.push(id + ' not grounded ' + JSON.stringify(probe));
    else if (probe.wantFail) failed.push(id + ' wantFail after standing');
  }
  assert.equal(failed.length, 0, failed.slice(0, 8).join(' | '));
});

test('walking around a floor and falling off both stay safe', () => {
  assert.ok(W, 'boot failed');
  W.run("elevDebug.floor('snackstop')");
  W.run(`
    obbyDebug.keysSet({KeyW:true});
    for (let i = 0; i < 180; i++) obbyDebug.physTick(1/60);
    obbyDebug.keysSet({KeyW:false});
  `);
  const walked = JSON.parse(W.run('JSON.stringify(elevDebug.probe())'));
  assert.ok(walked.P.y >= 0.15, 'walked off the map: y=' + walked.P.y + ' z=' + walked.P.z);
  assert.ok(walked.P.onGround || walked.under >= 0.15, 'not grounded after walking: ' + JSON.stringify(walked));

  // drop into the void; the safety net should scoop back to the floor start
  W.run(`
    elevDebug.to(0, 2, -80);
    for (let i = 0; i < 180; i++) obbyDebug.physTick(1/60);
  `);
  const caught = JSON.parse(W.run('JSON.stringify(elevDebug.probe())'));
  const start = caught.start;
  assert.ok(start, 'missing floor start');
  assert.ok(caught.P.y >= (start.top || 0.2) - 0.05, 'fall was not scooped back, y=' + caught.P.y);
  assert.ok(Math.abs(caught.P.z - start.z) < 3, 'should respawn at the floor start, z=' + caught.P.z);
  assert.equal(caught.wantFail, false);
  assert.equal(caught.phase, 'floor');
});
