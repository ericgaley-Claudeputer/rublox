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
  assert.ok(src.includes("const BUILD = '2026.11.12-15'"));
  const v = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
  assert.strictEqual(v.build, '2026.11.12-15');
  assert.ok(src.includes("const DH_KEY = 'rubloxDreamHouse'") || dhSrc.includes("DH_KEY = 'rubloxDreamHouse'"));
});

test('first-person HUD, concrete steps, and Reset Dream House are in the page', () => {
  assert.ok(src.includes('id="dhGoal"') && src.includes('id="dhSteps"') && src.includes('id="dhTip"') && src.includes('id="dhSpotHint"') && src.includes('Q: show spots') && src.includes('Tab: show spots') && src.includes('id="dhSpotBtn"'));
  assert.ok(src.includes('Reset Dream House') && src.includes('Are you sure? This starts your house over') && src.includes('id="dhResetYes"') && src.includes('id="setDhReset"') && src.includes('id="dhResetBtn"'));
  assert.ok(dhSrc.includes('function dhResetProgress') && dhSrc.includes("Grab Cement + Sand at the Supply Yard") && dhSrc.includes('Foundation spots poured') && dhSrc.includes('function dhAimBrickSlot') && dhSrc.includes('InstancedMesh'));
  assert.ok(dhSrc.includes('function dhAimFootCell') && dhSrc.includes('window.dhResetProgress') && dhSrc.includes('dhInvCount') && src.includes('id="dhHand"') && src.includes('#dhResetModal{z-index:10000') && src.includes('Always on in Dream House'));
  assert.ok(src.includes('document.body.appendChild(m)') && src.includes('aria-label="Yes, reset Dream House"') && src.includes('body.dhreset-open') && src.includes('dhWalkSpeed') && src.includes('function dhWalkSpeed') && dhSrc.includes('function dhLookWithKeys') && dhSrc.includes('function dhAimCone'));
});

test('reset confirm is a top-layer dialog and Exit/Esc/buttons close it', () => {
  assert.ok(src.includes('<dialog') && src.includes('id="dhResetModal"') && src.includes('m.showModal()'));
  assert.ok(src.includes('function dhCloseReset') && src.includes('function stop()'));
  assert.ok(/function stop\(\)\{[\s\S]{0,200}dhCloseReset/.test(src));
  assert.ok(src.includes("if (e.code === 'Escape' && typeof dhOnResetKey === 'function' && dhOnResetKey(e)) return"));
  assert.ok(src.includes('dhOnResetKey') && src.includes('dhOnResetClick') && src.includes("addEventListener('cancel'"));
  assert.ok(src.includes('Skip ▶') && src.includes('id="dhCutCap"') && src.includes('id="dhLookHint"'));
  assert.ok(src.includes('Click the view to look around'));
  assert.ok(dhSrc.includes('Math.PI / 2') && dhSrc.includes('dh._lookHold') && dhSrc.includes('dhGrantStarterStock') && dhSrc.includes('dhClipFpCamera') && dhSrc.includes('dhShowLookHint'));
});

test('opening a modal exits pointer lock and click-to-lock ignores UI targets', () => {
  assert.ok(src.includes('function dhExitPointerLock') && src.includes('dhExitPointerLock()') && src.includes('function setPause(p)'));
  assert.ok(src.includes("if (typeof dhIsUiEvent === 'function' && dhIsUiEvent(e)) return") && src.includes('requestPointerLock()'));
  assert.ok(src.includes('z-index:40') && src.includes('z-index:41'));
  assert.ok((src.includes('#obbyView,#obbyView canvas') || (src.includes('#obbyView{') && src.includes('#obbyView canvas{'))) && src.includes('z-index:0'));
});

test('Yes, Cancel, and Esc close the reset confirm while Dream House is running, and UI clicks are not consumed by the game', () => {
  const block = src.match(/\/\* ---------- dh ui events \(t253u\) ---------- \*\/([\s\S]*?)\nfunction dhConfirmReset/);
  assert.ok(block, 'dh ui events block missing from index.html');
  function classList(){
    const s = new Set();
    return { add(c){ s.add(c); }, remove(c){ s.delete(c); }, contains(c){ return s.has(c); } };
  }
  function node(id, tag, cls){
    return {
      id, tagName: (tag || 'DIV').toUpperCase(), className: cls || '',
      classList: classList(), style: {}, open: false, parentElement: null, parentNode: null,
      attrs: {},
      getAttribute(n){ return this.attrs[n] || null; },
      closest(sel){
        let n = this;
        const ids = [], tags = [], classes = [];
        String(sel).split(',').forEach(part => {
          part = part.trim();
          if (part.startsWith('#')) ids.push(part.slice(1));
          else if (part.startsWith('.')) classes.push(part.slice(1));
          else tags.push(part.toLowerCase());
        });
        while (n){
          if (ids.includes(n.id)) return n;
          if (tags.includes((n.tagName || '').toLowerCase())) return n;
          const cn = ' ' + (n.className || '') + ' ';
          if (classes.some(c => cn.includes(' ' + c + ' '))) return n;
          n = n.parentElement;
        }
        return null;
      },
      focus(){},
      showModal(){ this.open = true; this.classList.add('show'); },
      close(){ this.open = false; this.classList.remove('show'); },
    };
  }
  const body = node('', 'BODY', '');
  body.classList = classList();
  const modal = node('dhResetModal', 'DIALOG', 'modal dhresetbox');
  modal.parentElement = body;
  const yes = node('dhResetYes', 'BUTTON', 'big red');
  yes.attrs = {'aria-label': 'Yes, reset Dream House'};
  yes.parentElement = modal;
  const no = node('dhResetNo', 'BUTTON', 'big gray');
  no.attrs = {'aria-label': 'Cancel reset'};
  no.parentElement = modal;
  const bar = node('dhBar', 'DIV', 'dhbar');
  const barBtn = node('dhJobMark', 'BUTTON', '');
  barBtn.parentElement = bar;
  const canvas = node('', 'CANVAS', '');
  const document = {
    body,
    pointerLockElement: canvas,
    exitPointerLock(){ this.pointerLockElement = null; this.exited = true; },
    getElementById(id){
      return {dhResetModal: modal, dhResetYes: yes, dhResetNo: no, dhBar: bar}[id] || null;
    },
  };
  const $ = sel => document.getElementById(String(sel).replace('#',''));
  const ctx = { document, $, console, confirmed: 0 };
  vm.runInNewContext(block[1] + '\nfunction dhConfirmReset(){ confirmed++; dhCloseReset(); }\n', ctx);
  // Simulate DH running: pointer is locked, confirm is opened from the pause menu.
  document.pointerLockElement = canvas;
  ctx.dhOpenReset();
  // Simulate start(): every body child except #obby is marked inert. The confirm must be exempt.
  modal.attrs = modal.attrs || {};
  modal.setAttribute = function(n, v){ this.attrs[n] = v == null ? '' : String(v); if (n === 'inert') this.inert = true; };
  modal.removeAttribute = function(n){ delete this.attrs[n]; if (n === 'inert') this.inert = false; };
  modal.getAttribute = function(n){ return this.attrs[n] != null ? this.attrs[n] : null; };
  modal.attrs['inert'] = '';
  modal.attrs['aria-hidden'] = 'true';
  modal.inert = true;
  ctx.dhClearDialogInert(modal);
  ctx.dhOpenReset();
  assert.ok(ctx.dhResetModalIsOpen(), 'open should show the dialog');
  assert.ok(modal.open || modal.classList.contains('show'), 'showModal or .show');
  assert.strictEqual(document.pointerLockElement, null, 'opening the confirm must exit pointer lock');
  assert.ok(!modal.inert && !modal.getAttribute('inert') && modal.getAttribute('aria-hidden') !== 'true', 'open confirm must not be inert or aria-hidden');
  assert.ok(ctx.dhInertExempt(modal) === true && ctx.dhInertExempt({id:'obby'}) === true, 'confirm and #obby are inert-exempt');
  assert.ok(ctx.dhInertExempt({id:'home', tagName:'DIV', classList:{contains(){ return false; }}}) === false);
  assert.ok(ctx.dhIsUiEvent({target: yes}), 'Yes is a UI target');
  assert.ok(ctx.dhIsUiEvent({target: no}), 'Cancel is a UI target');
  assert.ok(ctx.dhIsUiEvent({target: barBtn}), 'toolbar button is a UI target');
  assert.ok(!ctx.dhIsUiEvent({target: canvas}), 'the 3D canvas is not a UI target');
  // Cancel while DH would still be "running"
  let mode = 'dreamhouse';
  ctx.dhOnResetClick({target: no, preventDefault(){}, stopPropagation(){}});
  assert.ok(!ctx.dhResetModalIsOpen(), 'Cancel closes the confirm');
  // Re-open and Esc
  ctx.dhOpenReset();
  assert.ok(ctx.dhResetModalIsOpen());
  const escHandled = ctx.dhOnResetKey({code: 'Escape', preventDefault(){}, stopPropagation(){}, stopImmediatePropagation(){}});
  assert.strictEqual(escHandled, true);
  assert.ok(!ctx.dhResetModalIsOpen(), 'Esc closes the confirm first');
  // Re-open and Yes
  ctx.dhOpenReset();
  ctx.dhOnResetClick({target: yes, preventDefault(){}, stopPropagation(){}});
  assert.ok(!ctx.dhResetModalIsOpen(), 'Yes closes the confirm');
  assert.strictEqual(ctx.confirmed, 1, 'Yes ran the reset');
});


test('pause buttons stay clickable and the DH toolbar is hidden while paused', () => {
  assert.ok(/#oPausePanel\.show|\.opanel\.show\{display:grid;pointer-events:auto/.test(src));
  assert.ok(src.includes('.opanel{') && src.includes('z-index:60'));
  assert.ok(src.includes('padding-bottom:56px') || src.includes('padding-bottom: 56px'));
  assert.ok(src.includes('#obby.paused .dhbar') && src.includes('display:none !important'));
  assert.ok(src.includes("classList.toggle('paused'") && src.includes('dhSyncPauseHud'));
  assert.ok(src.includes('z-index:120') && src.includes('id="oExit2"') && src.includes('id="dhResetBtn"'));
  assert.ok(src.includes("e.target.closest('#oPausePanel, #oExit, #oExit2"));
  assert.ok(src.includes('function setHomeInert') && src.includes('dhInertExempt'));
});

test('arrow look records e.key and e.code even when a button is focused', () => {
  assert.ok(dhSrc.includes('function dhNoteLookKey') && dhSrc.includes("e.key") && dhSrc.includes('ArrowRight'));
  assert.ok(src.includes('dhNoteLookKey(e, true)') && src.includes('dhNoteLookKey(e, false)'));
  assert.ok(dhSrc.includes("kind === 'key'") && dhSrc.includes('not merely because a leftover button'));
});



test('Esc unlocks first, then the next Esc pauses (no 400 ms swallow)', () => {
  assert.ok(src.includes('fp.eatEsc = true'));
  assert.ok(src.includes('fp.eatEsc') && src.includes('unlockT < 80'));
  assert.ok(!src.includes("performance.now() - fp.unlockT < 400"));
  assert.ok(src.includes("if (e.code === 'Escape' || e.code === 'KeyP'){ if (!won && !over && !choosing) setPause"));
});

test('pause menu sits above Quick Tips, and tips are not shown while paused', () => {
  assert.ok(src.includes('.dhtip{') && /z-index:40/.test(src.match(/\.dhtip\{[^}]+\}/)[0]));
  assert.ok(src.includes('.opanel{') && src.includes('z-index:60'));
  assert.ok(src.includes('#obby.paused .dhtip') || src.includes('#obby.paused #dhTip'));
  assert.ok(dhSrc.includes('dh._tipQueue') && dhSrc.includes('function dhFlushTips'));
  assert.ok(src.includes('window.setPause = setPause') || src.includes('window.setPause=setPause'));
});

test('Yes, reset closes the pause menu and start/stop clear lingering paused classes', () => {
  assert.ok(dhSrc.includes('function dhClosePauseMenus') && src.includes('dhClosePauseMenus()'));
  assert.ok(src.includes("classList.remove('fpv', 'paused', 'dh-paused', 'dh-intro')") || src.includes("remove('paused', 'dh-paused', 'dh-intro')"));
  assert.ok(src.includes("function dhConfirmReset()") && /dhConfirmReset\(\)\{[\s\S]*?dhClosePauseMenus/.test(src));
  assert.ok(dhSrc.includes('dh-intro') && src.includes('#obby.dh-intro #dhBar'));
});


test('updateDhChrome restores the toolbar after a menu close', () => {
  assert.ok(dhSrc.includes('function updateDhChrome') && dhSrc.includes('function dhStatusBits'));
  assert.ok(dhSrc.includes('if (dh.yardOpen) dhRenderYard();') && dhSrc.includes('updateDhChrome();'));
  assert.ok(src.includes('function dhCloseReset()') && src.includes('updateDhChrome()'));
  assert.ok(src.includes('function dhDismissTip') && dhSrc.includes('updateDhChrome();'));
});

test('top-left status bar drops empty segments, stays in its corner, and sits below the pause menu', () => {
  assert.ok(src.includes('id="dhBox"') && src.includes('class="dhbox"'));
  assert.ok(!src.includes('id="dhInv">no stock') && !src.includes('id="dhCarry">Hands empty'));
  assert.ok(src.includes('#dhBox{') && src.includes('overflow:hidden') && (src.includes('max-width:min(42vw,280px)') || src.includes('max-width:min(42vw,360px)') || src.includes('#dhBox{') && src.includes('max-width:100%')));
  assert.ok(src.includes('.dhstack{') && src.includes('max-width:min(42vw,280px)'));
  assert.ok(/#dhBox\{[^}]*z-index:40/.test(src) || src.includes('#dhBox{') && src.includes('z-index:40'));
  assert.ok(src.includes('#obby.paused #dhBox') && src.includes('#obby.dh-intro #dhBox'));
  assert.ok(src.includes('.obtns{') && src.includes('z-index:120'));
  assert.ok(src.includes('.toast.toast-top{') && src.includes('top:max(88px') && src.includes("classList.toggle('toast-top'"));
  assert.ok(src.includes('#obby.dh-intro #oCross') || src.includes('#obby.dh-intro .ocross'));
});

test('top-left stack keeps the coin badge off the House Steps heading', () => {
  assert.ok(src.includes('id="dhStack"') && src.includes('class="dhstack"'));
  assert.ok(src.includes('.dhstack{') && src.includes('flex-direction:column') && src.includes('gap:10px'));
  assert.ok(src.includes('id="dhBox"') && src.includes('id="dhSteps"'));
  const stack = src.match(/<div class="dhstack"[^>]*>[\s\S]*?<\/div>\s*<\/div>/);
  assert.ok(stack && stack[0].includes('id="dhBox"') && stack[0].includes('id="dhSteps"'), 'dhBox and dhSteps share #dhStack');
  assert.ok(/\.dhsteps\{[^}]*position:relative/.test(src));
});

test('Escape closes the settings dialog', () => {
  assert.ok(/setModal[\s\S]{0,200}classList\.remove\('show'\)/.test(src), 'settings modal can be closed');
  const closes = src.includes("if (sm && sm.classList.contains('show')){ sm.classList.remove('show')")
    || src.includes('setModal') && src.includes("e.code === 'Escape'") && src.includes("sm.classList.remove('show')");
  assert.ok(closes, 'Escape closes #setModal');
  assert.ok(src.includes("e.code === 'Escape'") && src.includes("getElementById('setModal')"));
});


test('cut-scene hides the build bar and Skip sits above it', () => {
  assert.ok(src.includes('#obby.dh-intro #dhBar') && src.includes('#obby.dh-intro .dhbar') && src.includes('#obby.dh-intro #oBuild'), 'dh-intro must hide the tool / build HUD');
  assert.ok(/\.dhskip\{[^}]*z-index:230/.test(src) || src.includes('z-index:230') && src.includes('.dhskip'), 'Skip must have a z-index above the z-index:200 toolbar');
  assert.ok(src.includes('const intro = !!(dh && (dh.intro || dh.celebrate))') || (dhSrc.includes('dh.intro || dh.celebrate') && dhSrc.includes('function updateDhChrome')), 'updateDhChrome must treat the completion cut-scene like the intro');
  assert.ok(src.includes("dhCutPlaying()") && src.includes('dhSkipCut()') && src.includes("if (e.code === 'Escape' || e.code === 'KeyP'){ if (!won && !over && !choosing) setPause"), 'Esc must skip the cut-scene before opening pause');
  assert.ok(src.includes('#obby.paused .dhcut') && src.includes('body:has(#oPausePanel.show) #dhCut'), 'cut-scene bubbles must hide while a menu is open');
  assert.ok(src.includes('cutting') && (dhSrc.includes('pausedNow || cutting') || dhSrc.includes('if (pausedNow || cutting)')), 'Quick Tips are queued during the cut-scene');
  assert.ok(src.includes('@keyframes rubloxConfetti') && src.includes('z-index:10050'), 'confetti must use a CSS fallback and a z-index above the game overlay');
});

test('the Dream House toolbar sits above the canvas and keeps pointer events', () => {
  const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const bar = src.match(/#obby\.dhmode \.dhbar,#obby\.dhmode #dhBar[^{]*\{[^}]+\}/) || src.match(/\.dhbar\{[^}]+\}/);
  assert.ok(bar, 'dhbar css present');
  assert.ok(/z-index:\s*(8[0-9]|[9-9][0-9]|[1-9][0-9]{2,})/.test(bar[0]) || /z-index:\s*80/.test(src), 'toolbar z-index is above the canvas (0)');
  assert.ok(/#obby\.dhmode \.dhbar/.test(src) && /pointer-events:\s*auto/.test(src));
  assert.ok(/#obbyView\{[^}]*pointer-events:\s*none/.test(src) || /#obby\.dhmode #obbyView\{[^}]*pointer-events:\s*none/.test(src), 'view wrapper does not steal clicks from the toolbar');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
