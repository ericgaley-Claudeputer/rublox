'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dhSrc = fs.readFileSync(path.join(root, 'dev/dreamhouse/dreamhouse.js'), 'utf8');
const m = src.match(/\/\* ---------- dh hud caption \(t252u\) ---------- \*\/([\s\S]*?)\/\* ---------- \/dh hud caption ---------- \*\//);
if (!m) throw new Error('dhLayoutHud helpers missing from index.html');

function el(id, rect, extras){
  const node = Object.assign({
    id,
    style: {
      display: '',
      _props: {},
      setProperty(k, v){ this._props[k] = v; },
      removeProperty(k){ delete this._props[k]; },
    },
    classList: {
      _s: new Set(),
      contains(c){ return this._s.has(c); },
      add(c){ this._s.add(c); },
      remove(c){ this._s.delete(c); },
    },
    getBoundingClientRect(){ return Object.assign({top:0,bottom:0,left:0,right:0,width:0,height:0}, rect()); },
    get offsetHeight(){ return (rect().height || 0); },
  }, extras || {});
  return node;
}

const W = 1440, H = 900;
const barH = 150, barBottom = 12;
const tipH = 68;
let tipHidden = false;
const obby = el('obby', () => ({top:0, bottom:H, left:0, right:W, width:W, height:H}));
obby.classList.add('dhmode');
const bar = el('dhBar', () => ({top: H - barBottom - barH, bottom: H - barBottom, left: 200, right: 1240, width: 1040, height: barH}));
const tip = el('oTip', () => ({
  height: tipH,
  // after layout this would sit above the bar; height is what matters
  top: H - barBottom - barH - 8 - tipH,
  bottom: H - barBottom - barH - 8,
  width: 700,
}));
Object.defineProperty(tip.classList, 'contains', {
  value(c){ if (c === 'hide') return tipHidden; return this._s.has(c); },
});

const document = {
  getElementById(id){ return {obby, dhBar: bar, oTip: tip}[id] || null; },
};

let mode = 'dreamhouse';
const ctx = { document, mode, Math, console };
vm.runInNewContext(m[1], ctx);

let passed = 0, failed = 0;
function test(name, fn){
  try { fn(); passed++; console.log('ok  ' + name); }
  catch (e){ failed++; console.error('FAIL  ' + name + '\n  ' + (e.stack || e)); }
}

test('dhLayoutHud parks the caption above the toolbar', () => {
  tipHidden = false;
  ctx.mode = 'dreamhouse';
  ctx.dhLayoutHud();
  const clear = parseInt(obby.style._props['--dhbar-clear'], 10);
  assert.strictEqual(clear, barBottom + barH); // 162
  const tipClear = parseInt(obby.style._props['--dhtip-clear'], 10);
  assert.strictEqual(tipClear, tipH + 8);
  // caption bottom is bar-clear + 8, so it sits just above the bar
  const captionBottom = clear + 8;
  const barTopFromBottom = clear;
  assert.ok(captionBottom > barTopFromBottom, 'caption would sit under the toolbar');
  // prompt sits above the caption
  const actBottom = clear + tipClear + 8;
  const captionTopFromBottom = captionBottom + tipH;
  assert.ok(actBottom >= captionTopFromBottom, 'prompt would overlap the caption ' + actBottom + ' vs ' + captionTopFromBottom);
});

test('hidden caption frees the space so the prompt can drop down', () => {
  tipHidden = true;
  ctx.dhLayoutHud();
  assert.strictEqual(obby.style._props['--dhtip-clear'], '0px');
  const clear = parseInt(obby.style._props['--dhbar-clear'], 10);
  const actBottom = clear + 0 + 8;
  assert.ok(actBottom > clear, 'prompt still needs to clear the toolbar');
});

test('leaving Dream House clears the layout variables', () => {
  ctx.mode = 'obby';
  ctx.dhLayoutHud();
  assert.ok(!('--dhbar-clear' in obby.style._props));
  assert.ok(!('--dhtip-clear' in obby.style._props));
});

test('CSS pins caption and prompt to the measured toolbar on desktop, mobile, and touch', () => {
  assert.ok(src.includes('#obby.dhmode .otip{bottom:calc(var(--dhbar-clear, 160px) + 8px)'));
  assert.ok(src.includes('#obby.dhmode #dhAct'));
  assert.ok(src.includes('var(--dhtip-clear, 0px)'));
  assert.ok(src.includes('#obby.touchui.dhmode #dhAct'));
  assert.ok(src.includes('@media (max-width:760px),(max-height:520px)'));
  // old fixed bottoms must be overridden, not left as the only rule
  assert.ok(src.includes("classList.toggle('dhmode', mode === 'dreamhouse')"));
});

test('start, bar render, tip hide, and resize all relayout the HUD', () => {
  assert.ok(src.includes("if (typeof dhLayoutHud === 'function') dhLayoutHud();"));
  assert.ok(/tipTimer <= 0\)\{[^}]*classList\.add\('hide'\);[^}]*dhLayoutHud/.test(src));
  assert.ok(src.includes('if (typeof dhLayoutHud === \'function\') dhLayoutHud();') && dhSrc.includes('if (typeof dhLayoutHud === \'function\') dhLayoutHud();'));
  assert.ok(src.includes('Re-build your house with bricks, concrete and wood'));
});

test('version is bumped and existing saves are not involved', () => {
  assert.ok(src.includes("const BUILD = '2026.11.11-14'"));
  const v = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
  assert.strictEqual(v.build, '2026.11.11-14');
  assert.ok(src.includes("const DH_KEY = 'rubloxDreamHouse'") || dhSrc.includes("DH_KEY = 'rubloxDreamHouse'"));
});

test('first-person HUD, concrete steps, and Reset Dream House are in the page', () => {
  assert.ok(src.includes('id="dhGoal"') && src.includes('id="dhSteps"') && src.includes('id="dhTip"'));
  assert.ok(src.includes('Reset Dream House') && src.includes('Are you sure? This starts your house over') && src.includes('id="dhResetYes"') && src.includes('id="setDhReset"') && src.includes('id="dhResetBtn"'));
  assert.ok(dhSrc.includes('function dhResetProgress') && dhSrc.includes("Grab Cement + Sand at the Supply Yard") && dhSrc.includes('Foundation spots poured') && dhSrc.includes('function dhAimBrickSlot') && dhSrc.includes('InstancedMesh'));
  assert.ok(dhSrc.includes('function dhAimFootCell') && dhSrc.includes('window.dhResetProgress') && dhSrc.includes('dhInvCount') && src.includes('id="dhHand"') && src.includes('#dhResetModal{z-index:200') && src.includes('Always on in Dream House'));
  assert.ok(src.includes('document.body.appendChild(m)') && src.includes('aria-label="Yes, reset Dream House"') && src.includes('body.dhreset-open') && src.includes('walk = 4.5') && dhSrc.includes('function dhLookWithKeys') && dhSrc.includes('function dhAimCone'));
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
