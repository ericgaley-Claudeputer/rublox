'use strict';
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const t297 = fs.readFileSync(path.join(ROOT, 'dev/t297/runtime.js'), 'utf8');

function lastFn(src, name){
  let last = -1, m;
  const re = new RegExp('function\\s+' + name + '\\s*\\(', 'g');
  while ((m = re.exec(src))) last = m.index;
  return last;
}

describe('Star Snaps Photo Studio hooks are not stolen by Pet Show', () => {
  test('index.html has one psAct, psKey, and psPad, and they are the studio versions', () => {
    const photoAct = html.indexOf('function psAct(){ if (!psx)');
    const photoKey = html.indexOf('function psKey(e){ if (!psx || e.repeat || paused)');
    const photoPad = html.indexOf('function psPad(jp){ if (!psx)');
    assert.ok(photoAct >= 0, 'studio psAct is present');
    assert.ok(photoKey >= 0, 'studio psKey is present');
    assert.ok(photoPad >= 0, 'studio psPad is present');
    // A later function declaration in the same scope (Pet Show used to ship a
    // second psAct/psKey/psPad) is hoisted and silently replaces these, so
    // Take Photo, E, and Ⓧ do nothing in Star Snaps.
    assert.equal(lastFn(html, 'psAct'), photoAct, 'psAct must not be shadowed later in index.html');
    assert.equal(lastFn(html, 'psKey'), photoKey, 'psKey must not be shadowed later in index.html');
    assert.equal(lastFn(html, 'psPad'), photoPad, 'psPad must not be shadowed later in index.html');
  });

  test('Pet Show uses its own pshowAct/pshowKey/pshowPad names in index and dev', () => {
    assert.match(html, /function pshowAct\(/);
    assert.match(html, /function pshowKey\(/);
    assert.match(html, /function pshowPad\(/);
    assert.match(html, /if \(mode === 'petshow'\) return pshowAct\(\);/);
    assert.match(html, /if \(mode === 'petshow'\) return pshowKey\(e\);/);
    assert.match(html, /if \(mode === 'petshow'\) return pshowPad\(jp\);/);
    assert.match(t297, /function pshowAct\(/);
    assert.match(t297, /function pshowKey\(/);
    assert.match(t297, /function pshowPad\(/);
    assert.doesNotMatch(t297, /function psAct\(/);
    assert.doesNotMatch(t297, /function psKey\(/);
    assert.doesNotMatch(t297, /function psPad\(/);
  });

  test('Take Photo and the camera bar still call the studio functions', () => {
    assert.match(html, /\$\('#psCamBtn'\)\.onclick = \(\) => psAct\(\)/);
    assert.match(html, /\$\('#psSnap'\)\.onclick = \(\) => psSnap\(\)/);
    assert.match(html, /\$\('#psDone'\)\.onclick = \(\) => psCamOn\(false\)/);
    assert.match(html, /mode === 'photostudio' && psx && psPad\(jp\)/);
    assert.match(html, /mode === 'photostudio' && psx && psKey\(e\)/);
  });
});
