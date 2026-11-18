const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

describe('t302 five play modes wiring', () => {
  test('BUILD is 2026.11.18-1 and matches version.json', () => {
    assert.ok(html.includes("const BUILD = '2026.11.18-1'"));
    assert.equal(version.build, '2026.11.18-1');
  });

  test('all five modes are playable menu games with original names and save keys', () => {
    const want = {
      garden: ['Sunny Patch Garden', 'rubloxGarden', 'function buildGarden(', 'gardenEnter'],
      meadow: ['Chow Chuck Meadow', 'rubloxMeadow', 'function buildMeadow(', 'meadowEnter'],
      rides: ['Rideland Workshop', 'rubloxRides', 'function buildRides(', 'ridesEnter'],
      hive: ['Honeyhill Hive', 'rubloxHive', 'function buildHive(', 'hiveEnter'],
      camp: ['Campfire Grove', 'rubloxCamp', 'function buildCamp(', 'campEnter']
    };
    for (const [id, bits] of Object.entries(want)){
      assert.ok(html.includes("id:'" + id + "'"), id + ' card');
      bits.forEach(bit => assert.ok(html.includes(bit), id + ' ' + bit));
    }
    assert.match(html, /'garden', 'meadow', 'rides', 'hive', 'camp'\]\.includes\(m\)/);
  });

  test('update, key, pad, and stop hooks are actually in the game loop', () => {
    const loopIdx = html.indexOf('if (evg) snowfestUpdate(dt)');
    const defIdx = html.indexOf('function t302Update(dt)');
    assert.ok(loopIdx > 0 && html.slice(loopIdx, loopIdx + 280).includes('t302Update(dt)'));
    assert.ok(defIdx > 0 && loopIdx !== defIdx);
    assert.match(html, /if \(\['garden','meadow','rides','hive','camp'\]\.includes\(mode\) && typeof t302Key === 'function' && t302Key\(e\)\) return;/);
    assert.match(html, /if \(\['garden','meadow','rides','hive','camp'\]\.includes\(mode\) && typeof t302Pad === 'function' && t302Pad\(jp, s\)\) return;/);
    assert.match(html, /if \(typeof t302Stop === 'function'\) t302Stop\(\);/);
    assert.match(html, /if \(mode === 'garden'\) buildGarden\(\)/);
  });

  test('new popups join the shared close path and do not steal emote number keys', () => {
    for (const id of ['gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft']){
      assert.ok(html.includes('id="' + id + '"'), id);
      assert.ok(html.includes("'" + id + "'") || html.includes('"' + id + '"'));
    }
    assert.match(html, /gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft'/);
    const runtime = html.slice(html.indexOf('function t302Key'), html.indexOf('function t302Key') + 2500);
    assert.equal(/Digit[0-9]/.test(runtime), false, 't302 keys must not bind number keys used by emotes');
    assert.match(html, /function t297OverlayClose/);
    const esc = html.indexOf("if (typeof t297OverlayOpen === 'function' && t297OverlayOpen()){ t297OverlayClose();");
    const pause = html.indexOf("if (e.code === 'Escape' || e.code === 'KeyP'){ if (!won && !over && !choosing) setPause");
    assert.ok(esc > 0 && pause > esc, 'Escape must close popups before it pauses');
  });

  test('multiplayer is real players only and NPCs stay in single-player', () => {
    assert.match(html, /hv\.solo = !t302MpOn\(\)/);
    assert.match(html, /if \(hv\.solo\)\{/);
    assert.match(html, /campBuddyAllowed/);
    assert.match(html, /d\.t === 't302'/);
    assert.match(html, /hiveFight\(\)/);
    assert.match(html, /campNoMonsters/);
  });

  test('achievements and daily quests hook the new modes', () => {
    for (const id of ['garden-plant', 'garden-harvest', 'meadow-throw', 'rides-ride', 'hive-honey', 'camp-sunrise']){
      assert.ok(html.includes("id:'" + id + "'") || html.includes("id: '" + id + "'"), id);
    }
    assert.match(html, /ev: 'garden-harvest'/);
    assert.match(html, /ev: 'camp-sunrise'/);
    assert.match(html, /snap\.garden = L\('rubloxGarden'/);
  });
});
