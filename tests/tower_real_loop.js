const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

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
  this.material = {color: new Vec3(), emissive: new Vec3(), opacity: 1, transparent: false};
  this.geometry = {parameters: {}};
  this.up = new Vec3(0,1,0);
  this.add = c => { this.children.push(c); return this; };
  this.remove = c => { this.children = this.children.filter(x => x!==c); };
  this.lookAt = function(){};
  this.updateMatrixWorld = function(){};
  this.updateProjectionMatrix = function(){};
  this.traverse = function(){};
}
function Mat(){ this.color=new Vec3(); this.emissive=new Vec3(); this.opacity=1; this.transparent=false; this.set=function(){return this}; }

const THREE = {
  Vector3: Vec3, Color: function(){ this.set = function(){ return this; }; },
  Mesh: function(){ return new Obj(); },
  Group: function(){ return new Obj(); },
  BoxGeometry: function(w,h,d){ return {parameters:{width:w,height:h,depth:d}}; },
  CylinderGeometry: function(){ return {parameters:{}}; },
  SphereGeometry: function(){ return {parameters:{}}; },
  PlaneGeometry: function(){ return {parameters:{}}; },
  EdgesGeometry: function(){ return {parameters:{}}; },
  LineSegments: function(){ return new Obj(); },
  MeshLambertMaterial: function(){ return new Mat(); },
  MeshBasicMaterial: function(){ return new Mat(); },
  MeshPhongMaterial: function(){ return new Mat(); },
  LineBasicMaterial: function(){ return new Mat(); },
  CanvasTexture: function(){ this.magFilter=0; },
  NearestFilter: 1, RepeatWrapping: 1, ClampToEdgeWrapping: 1,
  Scene: function(){ const o=new Obj(); o.background=null; o.fog={color:new Vec3(),near:0,far:0}; return o; },
  PerspectiveCamera: function(){ return new Obj(); },
  WebGLRenderer: function(){ this.setSize=function(){}; this.setPixelRatio=function(){}; this.render=function(){}; this.domElement={style:{}, addEventListener(){}, removeEventListener(){}}; this.dispose=function(){}; },
  AmbientLight: function(){ return new Obj(); },
  DirectionalLight: function(){ return new Obj(); },
  HemisphereLight: function(){ return new Obj(); },
  PointLight: function(){ return new Obj(); },
  Fog: function(){ this.color=new Vec3(); },
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
    matchMedia: () => ({matches: false, addEventListener(){}}), addEventListener(){}, removeEventListener(){},
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    navigator: {maxTouchPoints: 0, getGamepads: () => [], userAgent: 'node'},
    location: {search: '', hash: '', href: 'https://example.test/', protocol: 'https:'}, history: {replaceState(){}},
    fetch: () => new Promise(() => {}), scrollTo(){}, scrollBy(){}, getComputedStyle: () => U(), URLSearchParams,
    THREE, Peer: U(), AudioContext: U(), IntersectionObserver: U(), ResizeObserver: U(), Image: function(){}
  };
  const els = {}, el = sel => els[sel] || (els[sel] = (() => { const e = U(), c = new Set(); e.classList = {add: (...a) => a.forEach(x => c.add(x)), remove: (...a) => a.forEach(x => c.delete(x)), toggle: (x, on) => { (on === undefined ? !c.has(x) : on) ? c.add(x) : c.delete(x); return c.has(x); }, contains: x => c.has(x)}; e.style = {setProperty(){}, removeProperty(){}}; e.onclick = null; e.dataset = {}; e.width=1280; e.height=720; e.getContext=()=>U(); return e; })());
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
test('boots the real game loop and plays Tower of Doom headlessly', () => {
  W = boot();
  const fatal = W.errs.filter(e => !/IntersectionObserver|ResizeObserver/.test(e));
  assert.equal(fatal.length, 0, fatal.slice(0, 4).join(' | '));
  assert.equal(W.run('typeof Obby'), 'object');
  assert.equal(W.run('typeof obbyDebug.measureJump'), 'function');
  assert.equal(W.run('typeof obbyDebug.physTick'), 'function');
  assert.equal(W.run('typeof obbyDebug.edgeHop'), 'function');
  assert.equal(W.run('typeof obbyDebug.tdWalkClimb'), 'function');
  W.run('__tdSeed = 7');
  W.run("Obby.play('tower')");
  W.frames(8);
  const tw = JSON.parse(W.run('JSON.stringify(obbyDebug.tower && obbyDebug.tower())'));
  assert.ok(tw && tw.kind && tw.kind.length >= 12, 'tower did not start: ' + JSON.stringify(tw));
});

test('real loop jump height and walk reach at 30 fps and 60 fps (holding jump for height, tap for reach)', () => {
  assert.ok(W, 'boot failed');
  const h60 = JSON.parse(W.run('JSON.stringify(obbyDebug.measureJump({fps:60, walk:false, hold:true}))'));
  const h30 = JSON.parse(W.run('JSON.stringify(obbyDebug.measureJump({fps:30, walk:false, hold:true}))'));
  const r60 = JSON.parse(W.run('JSON.stringify(obbyDebug.measureJump({fps:60, walk:true, hold:false}))'));
  const r30 = JSON.parse(W.run('JSON.stringify(obbyDebug.measureJump({fps:30, walk:true, hold:false}))'));
  assert.ok(h60.settled && h30.settled, 'did not land on the measure pad: ' + JSON.stringify({h60, h30}));
  // Discrete integrator is slightly *stronger* than v^2/2g (2.844), not weaker.
  assert.ok(Math.abs(h60.height - 2.8875) < 0.04, '60 fps height ' + h60.height);
  assert.ok(Math.abs(h30.height - 2.9333) < 0.04, '30 fps height ' + h30.height);
  assert.ok(h30.height >= h60.height, '30 fps should not be a weaker jump');
  assert.ok(r60.landed && r30.landed, 'walk reach did not land');
  assert.ok(Math.abs(r60.reach - 7.0) < 0.2, '60 fps walk reach ' + r60.reach);
  assert.ok(Math.abs(r30.reach - 7.0) < 0.2, '30 fps walk reach ' + r30.reach);
});

test('official simPair: a 0-gap tall hop is an unlandable overhang, walk-ups and gapped hops work', () => {
  assert.ok(W, 'boot failed');
  const overhang = JSON.parse(W.run('JSON.stringify(obbyDebug.control(0, 1.2))'));
  const walkUp = JSON.parse(W.run('JSON.stringify(obbyDebug.control(0, 0.55))'));
  const gapped = JSON.parse(W.run('JSON.stringify(obbyDebug.control(0.5, 1.2))'));
  assert.equal(overhang.sim && overhang.sim.ok, false, '0-gap rise 1.2 should fail: ' + JSON.stringify(overhang));
  assert.equal(walkUp.sim && walkUp.sim.ok, true, '0-gap rise 0.55 walk-up should work: ' + JSON.stringify(walkUp));
  assert.equal(gapped.sim && gapped.sim.ok, true, '0.5-gap rise 1.2 should work: ' + JSON.stringify(gapped));
});

test('real update loop at 30 fps can climb sample generous gaps (walk speed, no sprint, tap jump)', () => {
  assert.ok(W, 'boot failed');
  const samples = [
    [0, 0.55],
    [0.5, 1.2],
    [1.0, 1.4],
    [3.5, 0],
    [2.0, 1.0]
  ];
  for (const [gap, rise] of samples){
    const r = JSON.parse(W.run('JSON.stringify(obbyDebug.edgeHop('+gap+','+rise+',{fps:30, padW:4.5, padD:4.5, hold:false}))'));
    assert.equal(r.ok, true, '30 fps hop gap='+gap+' rise='+rise+' failed: '+JSON.stringify(r));
  }
  // A 0-gap tall hop should still fail at 30 fps — that is the real lip/overhang bug.
  const bad = JSON.parse(W.run('JSON.stringify(obbyDebug.edgeHop(0, 1.2, {fps:30, padW:4.5, padD:4.5, hold:false}))'));
  assert.equal(bad.ok, false, '0-gap rise 1.2 unexpectedly succeeded at 30 fps: ' + JSON.stringify(bad));
});

test('real update loop at 30 fps climbs generated Tower of Doom layouts', () => {
  assert.ok(W, 'boot failed');
  for (const seed of [1, 7, 42]){
    W.run('__tdSeed = ' + seed);
    W.run("Obby.play('tower')");
    const r = JSON.parse(W.run('JSON.stringify(obbyDebug.tdWalkClimb(30))'));
    assert.equal(r.ok, true, 'seed '+seed+' 30 fps climb failed: '+JSON.stringify(r));
    assert.ok(r.maxY >= 80, 'seed '+seed+' only reached y='+r.maxY);
  }
});
