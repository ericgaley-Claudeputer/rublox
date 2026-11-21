// QA t332u (Tessa): "every time i go to the ambulance and get in, it immedeatly gets out".
// One E press hopped in on keydown and straight back out on keyup, because the global keyup handler routes to vtKey too.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function fnSource(name){
  const i = html.indexOf('  function ' + name + '(');
  assert.ok(i >= 0, name + ' not found');
  return html.slice(i, html.indexOf('\n  }\n', i) + 4);
}

test('E acts on a fresh keydown only: keyup and auto-repeat never toggle the ambulance', () => {
  let acts = 0;
  const vtKey = new Function('vt', 'vtAct', fnSource('vtKey') + '\nreturn vtKey;')({run: {}}, () => { acts++; });
  vtKey({type: 'keydown', code: 'KeyE'});
  assert.equal(acts, 1);
  vtKey({type: 'keyup', code: 'KeyE'});
  vtKey({type: 'keydown', code: 'KeyE', repeat: true});
  vtKey({type: 'keydown', code: 'KeyE', repeat: true});
  assert.equal(acts, 1, 'keyup / repeat must not act again');
  assert.equal(vtKey({type: 'keyup', code: 'KeyE'}), false, 'keyup falls through so the held-key map is cleared');
  vtKey({type: 'keydown', code: 'KeyE'});
  assert.equal(acts, 2, 'a second real press acts');
});

test('hopping in then out within the cooldown is ignored, a later press gets out', () => {
  const at = html.indexOf('  const VT_TOGGLE_MS = ');
  assert.ok(at > 0);
  const ms = +html.slice(at).match(/VT_TOGGLE_MS = (\d+)/)[1];
  assert.ok(ms >= 400 && ms <= 600);
  let now = 1000;
  const vt = {run: {drive: {on: false}}};
  const rules = {
    vtMountAmbulance(run){ run.drive.on = true; run.drive.x = 0; run.drive.z = 22.5; return {ok: true, message: 'in'}; },
    vtDismountAmbulance(run){ if (!run.drive.on) return {ok: false}; run.drive.on = false; return {ok: true, message: 'out'}; }
  };
  const src = 'const VT_TOGGLE_MS = ' + ms + ';\n' + fnSource('vtToggleReady') + fnSource('vtDoMount') + fnSource('vtDoDismount') + '\nreturn {vtDoMount, vtDoDismount};';
  const P = {x: 0, z: 20};
  const f = new Function('vt', 'VetRules', 'P', 'vtHideFpToggle', 'vtPlaceAmbulance', 'vtToast', 'Date', src)(vt, rules, P, () => {}, () => {}, () => {}, {now: () => now});
  f.vtDoMount();
  assert.equal(vt.run.drive.on, true);
  now += 60; f.vtDoDismount();
  assert.equal(vt.run.drive.on, true, 'stays in right after hopping in');
  now += ms; f.vtDoDismount();
  assert.equal(vt.run.drive.on, false, 'second press after the cooldown gets out');
});

test('a refused hop-out (not in the bay) does not start the cooldown', () => {
  const src = fnSource('vtDoDismount');
  assert.ok(src.indexOf("if (!res.ok){ vtToast(res.message); return; }") < src.indexOf('vt.toggleAt = Date.now();'));
});

test('other keyup-routed / toggle games ignore keyup and held-key repeats', () => {
  assert.match(fnSource('mmKey'), /if \(e\.type === 'keyup' \|\| e\.repeat\) return/);
  assert.match(fnSource('elevKey'), /if \(e\.repeat && \(c === 'KeyE' \|\| c === 'KeyF'\)\) return true;/);
  assert.match(fnSource('wnKey'), /if \(e\.repeat && \(c === 'KeyE' \|\| c === 'KeyF'\)\) return true;/);
  ['mnKey', 'shKey', 'thKey', 'scKey'].forEach(n => assert.match(fnSource(n), /if \(e\.type === 'keyup'\) return false;/));
  assert.match(fnSource('t302Key'), /if \(e\.type === 'keyup'\)\{\s*if \(e\.code === 'KeyE'/);
  assert.match(fnSource('t302Key'), /campHold\(false\)/);
});

test('the drive hint tells you how to get out', () => {
  assert.ok(html.includes('Drive back to the 🅿️ bay to hop out.'));
  assert.ok(html.includes("label:'E / Ⓑ  Park and hop out'"));
});
