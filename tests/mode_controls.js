// t337u: every game must have its own controls page (keyboard, Xbox controller and touch) reachable from the pause menu.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const gi = html.indexOf('const GAMES = ['), ge = html.indexOf('\n];', gi);
const ids = [...html.slice(gi, ge).matchAll(/\{id:\s*'([a-z]+)'/g)].map(x => x[1]);

function load(src){ const c = vm.createContext({globalThis: {}}); vm.runInContext(src + '\nglobalThis.out = {MODE_CONTROLS, CTRL_WALK, modeControls};', c); return c.globalThis.out; }
const a = html.indexOf('const CTRL_WALK = {'), b = html.indexOf('\nif (typeof globalThis', a);
const built = load(html.slice(a, b));
const dev = load(fs.readFileSync(path.join(ROOT, 'dev/controls/mode_controls.js'), 'utf8').replace(/\nif \(typeof globalThis[^\n]*\n?$/, ''));

test('every game in GAMES (and mode_wiring) has a controls map with keyboard, controller and touch', () => {
  assert.ok(ids.length > 40, 'found ' + ids.length + ' games');
  for (const id of ids){
    const c = built.modeControls(id);
    assert.ok(c, id + ' has no controls map');
    for (const k of ['kb', 'pad', 'touch']){
      assert.ok(c[k].own.length + c[k].walk.length > 0, id + ' ' + k + ' is empty');
      c[k].own.concat(c[k].walk).forEach(t => assert.ok(typeof t === 'string' && t.length > 3 && t.length < 120, id + ' ' + k + ': ' + t));
    }
  }
  const extra = Object.keys(built.MODE_CONTROLS).filter(k => !ids.includes(k));
  assert.deepEqual(extra, [], 'controls for games that do not exist');
});

test('the built page and the dev source carry the same controls', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(built.MODE_CONTROLS)), JSON.parse(JSON.stringify(dev.MODE_CONTROLS)));
  assert.deepEqual(JSON.parse(JSON.stringify(built.CTRL_WALK)), JSON.parse(JSON.stringify(dev.CTRL_WALK)));
});

test('controller lines use controller buttons and keyboard lines never mention them', () => {
  for (const id of ids){
    const c = built.MODE_CONTROLS[id];
    c.kb.forEach(t => assert.ok(!/[ⒶⒷⓍⓎ]|\bRT\b|\bLB\b|\bRB\b/.test(t), id + ' keyboard line has a pad button: ' + t));
  }
  assert.ok(built.CTRL_WALK.pad.some(t => /Start/.test(t) && /Ⓨ/.test(t)), 'the pad lines say how to open these controls');
});

test('the pause menu has the controls button, Ⓨ toggles it, and Ⓑ closes it', () => {
  assert.match(html, /<button class="big" id="pCtrlBtn"[^>]*>🎮 Controls for this game<\/button>/);
  assert.match(html, /<div class="pctrl" id="pCtrl"/);
  assert.match(html, /function ctrlPaint\(\)\{/);
  assert.match(html, /\$\('#pCtrlBtn'\)\.onclick = \(\) => ctrlShow\(\);/);
  assert.match(html, /const pauseCtrl = c\.kind === 'panel' && c\.root && c\.root\.id === 'oPausePanel' \? document\.getElementById\('pCtrlBtn'\) : null;/);
  assert.match(html, /if \(pauseCtrl && s\.jp\[3\]\)\{ pauseCtrl\.click\(\); setFocus\(pauseCtrl\); return; \}/);
  assert.match(html, /if \(pauseCtrl && s\.jp\[1\] && document\.getElementById\('pCtrl'\)\.classList\.contains\('show'\)\)\{ pauseCtrl\.click\(\); setFocus\(pauseCtrl\); return; \}/);
});
