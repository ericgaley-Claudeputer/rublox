const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));
const reset = require('../dev/reset/reset_logic.js');
const board = require('../dev/board/board_logic.js');
const E = require('../dev/elevator/elev_logic.js');

const BANNED = [
  'Regretevator', 'Pest', 'Poob', 'PartyNoob', 'Split', 'Bive', 'Lampert', 'Prototype',
  'Reddy', 'Melanie', 'Scag', 'Gregoriah', 'Gnarpy', 'Voomba', 'FleshCousin', 'Floppy Shoppy',
  'Axolotl Sun'
];

describe('Wobblevator wiring', () => {
  test('BUILD is 2026.11.19-6 and matches version.json', () => {
    assert.ok(html.includes("const BUILD = '2026.11.19-6'"));
    assert.equal(version.build, '2026.11.19-6');
  });

  test('the mode is a playable menu game with an original name and save key', () => {
    assert.ok(html.includes("id:'elevator'"));
    assert.ok(html.includes('Wobblevator'));
    assert.ok(html.includes('rubloxElevator'));
    assert.ok(html.includes('function drawElevator('));
    assert.ok(html.includes('function buildElevator('));
    assert.ok(html.includes("if (mode === 'elevator') elevEnter();"));
    assert.match(html, /'camp', 'elevator'\]\.includes\(m\)/);
    assert.match(html, /classList\.toggle\('elevmode', mode === 'elevator'\)/);
  });

  test('update, key, pad, and stop hooks are actually in the game loop', () => {
    const loopIdx = html.indexOf('if (evg) snowfestUpdate(dt)');
    const defIdx = html.indexOf('function elevUpdate(dt)');
    assert.ok(loopIdx > 0 && html.slice(loopIdx, loopIdx + 280).includes('elevUpdate(dt)'));
    assert.ok(defIdx > 0 && loopIdx !== defIdx);
    assert.match(html, /if \(mode === 'elevator' && typeof elevKey === 'function' && elevKey\(e\)\) return;/);
    assert.match(html, /if \(mode === 'elevator' && typeof elevPadEdge === 'function' && elevPadEdge\(jp\)\) return;/);
    assert.match(html, /if \(typeof elevStop === 'function'\) elevStop\(\);/);
    assert.match(html, /if \(mode === 'elevator'\) buildElevator\(\)/);
  });

  test('help popup uses the shared close path and works on mobile and Xbox', () => {
    assert.ok(html.includes('id="elevHelp"'));
    assert.ok(html.includes("class=\"t297overlay\""));
    assert.match(html, /campWin', 'elevHelp'/);
    assert.match(html, /mode === 'elevator' \? '🎮 Left stick move · Ⓐ jump · Ⓧ act · Ⓑ close popups · ☰ menu'/);
    assert.ok(html.includes('id="elevAct"'));
    assert.ok(html.includes('id="elevHelpBtn"'));
    const runtime = html.slice(html.indexOf('function elevKey'), html.indexOf('function elevKey') + 1200);
    assert.equal(/Digit[0-9]/.test(runtime), false, 'elevator keys must not bind number keys used by emotes');
    const esc = html.indexOf("if (typeof t297OverlayOpen === 'function' && t297OverlayOpen()){ t297OverlayClose();");
    const pause = html.indexOf("if (e.code === 'Escape' || e.code === 'KeyP'){ if (!won && !over && !choosing) setPause");
    assert.ok(esc > 0 && pause > esc, 'Escape must close popups before it pauses');
  });

  test('passengers are solo-only and names stay original', () => {
    assert.equal(E.elevBuddyAllowed(false), true);
    assert.equal(E.elevBuddyAllowed(true), false);
    assert.match(html, /elevBuddyAllowed/);
    assert.match(html, /Bingle the Bellhop/);
    const blob = html.slice(html.indexOf('const ELEV_KEY'), html.indexOf('function drawElevator('))
      + html.slice(html.indexOf('/* ---------- Wobblevator'), html.indexOf('function stop(){'));
    BANNED.forEach(n => assert.equal(blob.toLowerCase().includes(n.toLowerCase()), false, 'must not include ' + n));
  });

  test('achievements, board, weather skip, and Reset a game all hook the mode', () => {
    for (const id of ['elev-ride', 'elev-five', 'elev-twelve', 'elev-creepy', 'elev-find']){
      assert.ok(html.includes("id:'" + id + "'"), id);
    }
    assert.match(html, /snap\.elevator = L\('rubloxElevator'/);
    assert.ok(board.LB_ROWS.some(r => r.id === 'elev-best'));
    assert.match(html, /id: 'elev-best'/);
    const g = reset.resetGame('elevator');
    assert.ok(g);
    assert.equal(g.name, 'Wobblevator');
    assert.ok(g.keys.includes('rubloxElevator'));
    assert.match(html, /WX_SKIP = \[[^\]]*elevator/);
  });
});
