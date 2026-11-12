'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dhSrc = fs.readFileSync(path.join(root, 'dev/dreamhouse/dreamhouse.js'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));

let passed = 0, failed = 0;
function test(name, fn){
  try { fn(); passed++; console.log('ok  ' + name); }
  catch (e){ failed++; console.log('not ok  ' + name); console.log('  ' + (e.stack || e.message)); }
}

test('BUILD is 2026.11.11-34 and matches version.json', () => {
  assert.ok(src.includes("const BUILD = '2026.11.11-34'"));
  assert.strictEqual(version.build, '2026.11.11-34');
});

test('only one game RAF loop can run: armGameLoop cancels and bumps loopId', () => {
  assert.ok(/function armGameLoop\(\)\{/.test(src));
  assert.ok(src.includes('loopId++'));
  assert.ok(/const my = loopId/.test(src));
  assert.ok(/if \(!running \|\| my !== loopId\) return/.test(src));
  const startAt = src.indexOf("function start(m = 'obby'");
  const stopAt = src.indexOf('\n  function stop(', startAt);
  const startSrc = src.slice(startAt, stopAt);
  assert.ok(startSrc.includes('armGameLoop()'));
  assert.ok(!/raf = requestAnimationFrame\(loop\)/.test(startSrc), 'start() must schedule only through armGameLoop');
  const stopSrc = src.slice(stopAt, src.indexOf('\n  function ', stopAt + 20));
  assert.ok(/loopId\+\+/.test(src.slice(stopAt, stopAt + 500)));
  assert.ok(/cancelAnimationFrame\(raf\)/.test(src.slice(stopAt, stopAt + 500)));
});

test('double start() without stop() still runs a single loop body per frame', () => {
  let raf = 0, loopId = 0, running = false;
  let nextId = 1;
  const pending = new Map();
  function requestAnimationFrame(cb){
    const id = nextId++;
    pending.set(id, cb);
    return id;
  }
  function cancelAnimationFrame(id){ pending.delete(id); }
  function armGameLoop(){
    if (raf){ try { cancelAnimationFrame(raf); } catch (e){} raf = 0; }
    loopId++;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  let bodies = 0;
  function loop(){
    if (!running) return;
    const my = loopId;
    raf = requestAnimationFrame(function(next){ if (!running || my !== loopId) return; loop(next); });
    bodies++;
  }
  function stop(){
    running = false;
    loopId++;
    if (raf){ try { cancelAnimationFrame(raf); } catch (e){} raf = 0; }
  }
  function pump(){
    const batch = [...pending.entries()];
    pending.clear();
    batch.forEach(([, cb]) => cb(0));
  }
  armGameLoop();
  armGameLoop();
  armGameLoop();
  pump();
  assert.strictEqual(bodies, 1, 'three stacked starts must still tick once');
  pump();
  assert.strictEqual(bodies, 2);
  assert.strictEqual(pending.size, 1);
  stop();
  const after = bodies;
  pump();
  pump();
  assert.strictEqual(bodies, after, 'stopped loops must not keep ticking');
  assert.strictEqual(pending.size, 0);
  armGameLoop();
  pump();
  assert.strictEqual(bodies, after + 1);
});

test('bind() listeners are added once and stay bound across start/stop cycles', () => {
  const startAt = src.indexOf("function start(m = 'obby'");
  const startSrc = src.slice(startAt, src.indexOf('\n  function stop(', startAt));
  assert.ok(startSrc.includes('if (!bound) bind()'));
  const bindAt = src.indexOf('  function bind(){');
  assert.ok(bindAt >= 0);
  const bindSrc = src.slice(bindAt, bindAt + 200);
  assert.ok(bindSrc.includes('bound = true'));
  const stopAt = src.indexOf('\n  function stop(');
  const stopSrc = src.slice(stopAt, src.indexOf('\n  function resize(', stopAt) > 0 ? src.indexOf('\n  function resize(', stopAt) : stopAt + 2000);
  // stop must not clear the bind guard (listeners would stack on the next start)
  assert.ok(!/bound\s*=\s*false/.test(src.slice(stopAt, stopAt + 800)), 'stop() must not reset bound');
  assert.ok(dhSrc.includes('if (window.__dhBound6) return') && dhSrc.includes('window.__dhBound6 = true'));

  let bound = false, dhBound = false, binds = 0, dhBinds = 0;
  function bind(){ binds++; }
  function dhBindUI(){ if (dhBound) return; dhBound = true; dhBinds++; }
  function start(){ if (!bound) bind(); bound = true; dhBindUI(); }
  function stop(){ /* bound and __dhBound stay true */ }
  start(); stop(); start(); stop(); start();
  assert.strictEqual(binds, 1);
  assert.strictEqual(dhBinds, 1);
});

test('Settings offers Graphics Auto/Low/High (default Auto) and Show FPS, saved in localStorage', () => {
  assert.ok(src.includes('id="setGfx"'));
  assert.ok(src.includes('<option value="auto">Auto</option>'));
  assert.ok(src.includes('<option value="low">Low</option>'));
  assert.ok(src.includes('<option value="high">High</option>'));
  assert.ok(src.includes('id="setShowFps"') && /Show FPS/i.test(src));
  assert.ok(src.includes("save('rubloxGraphics'"));
  assert.ok(src.includes("save('rubloxShowFps'"));
  assert.ok(src.includes("load('rubloxGraphics', 'auto')"));
  assert.ok(src.includes('id="oFps"'));
});

function gfxSandbox(nav, stored, rendererName){
  const store = Object.assign({}, stored || {});
  const counts = {webgl: 0, lose: 0};
  const gl = {
    getExtension(name){
      if (name === 'WEBGL_debug_renderer_info') return {UNMASKED_RENDERER_WEBGL: 0x9246};
      if (name === 'WEBGL_lose_context') return {loseContext(){ counts.lose++; }};
      return null;
    },
    getParameter(){ return rendererName == null ? 'NVIDIA GeForce' : rendererName; },
    RENDERER: 0x1F01,
  };
  const document = {
    createElement(){ return { width: 0, height: 0, getContext(type){
      if (type === 'webgl' || type === 'experimental-webgl'){ counts.webgl++; return gl; }
      return null;
    } }; },
    getElementById(){ return null; },
  };
  const sandbox = {
    window: null,
    navigator: nav || {hardwareConcurrency: 8, deviceMemory: 8},
    document,
    devicePixelRatio: 2,
    load: (k, d) => (k in store ? store[k] : d),
    save: (k, v) => { store[k] = v; },
    localStorage: { getItem(k){ return k in store ? String(store[k]) : null; }, setItem(k,v){ store[k]=v; } },
    console,
    Math, Number, String, Object,
  };
  sandbox.window = sandbox;
  const start = src.indexOf('function detectWeakGpu(){');
  const end = src.indexOf("const setGfx = document.getElementById('setGfx');");
  assert.ok(start >= 0 && end > start, 'gfx helpers must be present');
  vm.createContext(sandbox);
  vm.runInContext(src.slice(start, end), sandbox);
  sandbox._store = store;
  sandbox._counts = counts;
  return sandbox;
}

test('Auto starts at Low on weak hardware (cores, memory, Intel HD/GMA, SwiftShader)', () => {
  let s = gfxSandbox({hardwareConcurrency: 4, deviceMemory: 8});
  assert.strictEqual(s.detectWeakGpu(), true);
  assert.strictEqual(s.gfxIsLow(), true);

  s = gfxSandbox({hardwareConcurrency: 8, deviceMemory: 4});
  assert.strictEqual(s.detectWeakGpu(), true);

  s = gfxSandbox({hardwareConcurrency: 8}); // deviceMemory undefined must not count as <= 4
  assert.strictEqual(s.detectWeakGpu(), false);
  assert.strictEqual(s.gfxIsLow(), false);

  s = gfxSandbox({hardwareConcurrency: 8, deviceMemory: 8}, {}, 'Intel HD Graphics 4000');
  assert.strictEqual(s.detectWeakGpu(), true);

  s = gfxSandbox({hardwareConcurrency: 8, deviceMemory: 8}, {}, 'Intel GMA 4500');
  assert.strictEqual(s.detectWeakGpu(), true);

  s = gfxSandbox({hardwareConcurrency: 8, deviceMemory: 8}, {}, 'Google SwiftShader');
  assert.strictEqual(s.detectWeakGpu(), true);

  s = gfxSandbox({hardwareConcurrency: 8, deviceMemory: 16}, {}, 'ANGLE (NVIDIA GeForce GTX 1060)');
  assert.strictEqual(s.detectWeakGpu(), false);
  assert.strictEqual(s.gfxChoice(), 'auto');
  assert.strictEqual(s.gfxIsLow(), false);
});

test('Graphics choice is saved and Low/High override Auto hardware detection', () => {
  const weak = gfxSandbox({hardwareConcurrency: 2, deviceMemory: 2}, {rubloxGraphics: 'high'});
  assert.strictEqual(weak.gfxChoice(), 'high');
  assert.strictEqual(weak.gfxIsLow(), false, 'High stays High even on a weak GPU');

  const strong = gfxSandbox({hardwareConcurrency: 16, deviceMemory: 16}, {rubloxGraphics: 'low'});
  assert.strictEqual(strong.gfxChoice(), 'low');
  assert.strictEqual(strong.gfxIsLow(), true);

  const def = gfxSandbox({hardwareConcurrency: 16, deviceMemory: 16});
  assert.strictEqual(def.gfxChoice(), 'auto');
});

test('Low caps pixel ratio at 0.75-1, disables AA, and HUD updates at 5 Hz', () => {
  const low = gfxSandbox({hardwareConcurrency: 2, deviceMemory: 2});
  assert.ok(low.gfxIsLow());
  const pr = low.gfxPixelRatio();
  assert.ok(pr >= 0.75 && pr <= 1, 'low pixel ratio was ' + pr);
  assert.strictEqual(low.gfxAntialias(), false);
  assert.strictEqual(low.gfxHudInterval(), 0.2);

  const high = gfxSandbox({hardwareConcurrency: 16, deviceMemory: 16}, {rubloxGraphics: 'high'});
  high.devicePixelRatio = 3;
  assert.strictEqual(high.gfxPixelRatio(), 1.5);
  assert.strictEqual(high.gfxAntialias(), true);
  assert.strictEqual(high.gfxHudInterval(), 0.1);
});

test('Auto drops to Low after fps stays under 40 for 3 seconds', () => {
  const s = gfxSandbox({hardwareConcurrency: 16, deviceMemory: 16});
  assert.strictEqual(s.gfxIsLow(), false);
  const tickStart = src.indexOf('function tickGfxFps(dt){');
  const tickEnd = src.indexOf('\n  function ensureRenderer()', tickStart);
  assert.ok(tickStart >= 0 && tickEnd > tickStart);
  let applied = 0;
  s.applyObbyQuality = function(){ applied++; };
  vm.runInContext(src.slice(tickStart, tickEnd), s);
  // 0.25s buckets at ~32 fps for 3 seconds
  for (let i = 0; i < 12; i++){
    for (let f = 0; f < 8; f++) s.tickGfxFps(0.25 / 8);
  }
  assert.ok(s.window.gfx.autoLow, 'autoLow should trip after 3s of <40 fps');
  assert.strictEqual(s.gfxIsLow(), true);
  assert.ok(applied >= 1);

  const ok = gfxSandbox({hardwareConcurrency: 16, deviceMemory: 16});
  ok.applyObbyQuality = function(){ throw new Error('must not drop when fps is fine'); };
  vm.runInContext(src.slice(tickStart, tickEnd), ok);
  for (let i = 0; i < 16; i++){
    for (let f = 0; f < 15; f++) ok.tickGfxFps(0.25 / 15); // 60 fps
  }
  assert.ok(!ok.window.gfx.autoLow);
  assert.strictEqual(ok.gfxIsLow(), false);
});

test('Dream House low path: shared leaf mats, pooled beacons, throttled HUD, sprite beacons, dispose on stop', () => {
  assert.ok(dhSrc.includes('function dhGfxLow()'));
  assert.ok(dhSrc.includes('MeshBasicMaterial'));
  assert.ok(dhSrc.includes('dh._leafMats'));
  assert.ok(dhSrc.includes('dhGfxLow() ? 8 : 16'));
  assert.ok(dhSrc.includes('function dhDisposeBeaconPool'));
  assert.ok(dhSrc.includes('function dhAllocBeacon'));
  assert.ok(dhSrc.includes('new THREE.Sprite'));
  assert.ok(dhSrc.includes('dhSetHtml'));
  assert.ok(/gfxHudInterval/.test(dhSrc));
  assert.ok(dhSrc.includes('dhNeedRetarget'));
  assert.ok(dhSrc.includes('dhDisposeBeaconPool(true)'));
  assert.ok(!/scene\.remove\(dh\.outlines\);\s*dh\.outlines = new THREE\.Group/.test(dhSrc), 'must not recreate outline group from scratch every frame without pooling');
});


test('GPU probe opens at most one WebGL context and then loses it, even if gfxIsLow is called every frame', () => {
  const s = gfxSandbox({hardwareConcurrency: 8, deviceMemory: 8}, {}, 'NVIDIA GeForce GTX 1060');
  assert.ok(s._counts.webgl <= 2, 'home/init probe should be 0-1 contexts, got ' + s._counts.webgl);
  const afterInit = s._counts.webgl;
  for (let i = 0; i < 200; i++) s.gfxIsLow();
  for (let i = 0; i < 50; i++) s.detectWeakGpu();
  s.gfxRecompute();
  s.gfxPixelRatio();
  s.gfxAntialias();
  s.gfxHudInterval();
  assert.strictEqual(s._counts.webgl, afterInit, 'must not create another WebGL context after the cached probe');
  assert.ok(afterInit <= 1);
  assert.ok(s._counts.lose >= 1, 'throwaway probe must call loseContext()');
});

test('weak CPU/RAM Auto path does not open a WebGL probe at all', () => {
  const s = gfxSandbox({hardwareConcurrency: 4, deviceMemory: 2});
  assert.strictEqual(s.detectWeakGpu(), true);
  assert.strictEqual(s._counts.webgl, 0);
  for (let i = 0; i < 50; i++) s.gfxIsLow();
  assert.strictEqual(s._counts.webgl, 0);
});

test('the game loop still renders while unpaused (not only on the pause path)', () => {
  const loopAt = src.indexOf('  function loop(t){');
  const loopSrc = src.slice(loopAt, src.indexOf('\n  function armGameLoop', loopAt) > loopAt ? src.indexOf('\n  function tickGfxFps', loopAt) : src.indexOf('function tickGfxFps', loopAt) + 1);
  // Safer: take until tickGfxFps definition after the render line
  const body = src.slice(loopAt, src.indexOf('function tickGfxFps(dt){', loopAt));
  assert.ok(body.includes('renderer.render(scene, camera)'));
  // render must not be gated on paused
  assert.ok(!/if\s*\(\s*paused[\s\S]{0,80}renderer\.render/.test(body));
  const renderLine = body.split('\n').find(l => l.includes('renderer.render(scene, camera)'));
  assert.ok(renderLine, 'missing render call');
  assert.ok(!/paused/.test(renderLine) || /paused \? 0 : (dt|frameDt)/.test(renderLine), renderLine);
});

test('no opaque full-screen overlay covers the canvas during Dream House play, and the FPS badge is not over Exit', () => {
  assert.ok(/id="dhCut"[^>]*style="display:none"/.test(src));
  const fade = src.match(/\.dhfade\{[^}]+\}/);
  assert.ok(fade && /opacity:\s*0/.test(fade[0]) && /background:#000/.test(fade[0]), fade && fade[0]);
  const ofps = src.match(/\.ofps\{[^}]+\}/);
  assert.ok(ofps, 'missing .ofps rule');
  assert.ok(/left:\s*max\(10px/.test(ofps[0]) && /bottom:/.test(ofps[0]), 'FPS badge should sit bottom-left, not over 🚪 Exit: ' + ofps[0]);
  assert.ok(/top:\s*auto/.test(ofps[0]) && /right:\s*auto/.test(ofps[0]), ofps[0]);
  // Exit is in the top-right .obtns cluster
  assert.ok(src.includes('id="oExit"') && src.includes('🚪'));
  assert.ok(src.includes('#obby.dhouse .ofps') && src.includes('--dhbar-clear'));
});

test('detectWeakGpu cache and WEBGL_lose_context are in the page source', () => {
  assert.ok(src.includes('window.gfx._probeDone') || src.includes('gfx._probeDone'));
  assert.ok(src.includes('WEBGL_lose_context') && src.includes('loseContext'));
  assert.ok(src.includes('forceContextLoss'));
});

console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
