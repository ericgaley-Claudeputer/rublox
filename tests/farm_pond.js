// GB-7: Pondripple Pond at Honeymeadow Farm — ducks to feed, a dock to fish from, and a fuller far view.
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const F = require('../dev/farm/farm_logic.js');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const farm = {phase: 'farm'};

describe('Pondripple Pond', () => {
  test('sits past the far side of the hay loop, clear of the loop and the barn', () => {
    const farZ = Math.min(...F.FM_HAY_PATH.map(p => p.z));
    assert.ok(F.FM_POND.z + F.FM_POND.rz < farZ - 4, 'pond is beyond the hay loop');
    F.FM_HAY_PATH.forEach(p => assert.ok(!F.fmInPond(p.x, p.z, 2), 'hay path stays dry at ' + p.x + ',' + p.z));
    assert.ok(!F.fmInPond(F.FM_DUCK_FEED.x, F.FM_DUCK_FEED.z), 'feeding spot is on the shore');
    assert.ok(F.fmOnDock(F.FM_DOCK.end.x, F.FM_DOCK.end.z) && F.fmInPond(F.FM_DOCK.end.x, F.FM_DOCK.end.z), 'dock end is over the water');
  });

  test('walkers are kept out of the water but can walk the dock', () => {
    const s = F.fmPondPush(F.FM_POND.x, F.FM_POND.z);
    assert.ok(s, 'pushed out of the middle');
    assert.ok(!F.fmInPond(s.x, s.z, -0.6));
    assert.equal(F.fmPondPush(F.FM_DOCK.end.x, F.FM_DOCK.end.z), null);
    assert.equal(F.fmPondPush(F.FM_DUCK_FEED.x, F.FM_DUCK_FEED.z), null);
  });

  test('feeding the Pondripple ducks works once and saves a new optional field', () => {
    const hit = F.fmNear(F.FM_DUCK_FEED.x, F.FM_DUCK_FEED.z, F.fmFresh(), farm);
    assert.equal(hit.kind, 'ducks');
    const r = F.fmFeedDucks(F.fmFresh());
    assert.equal(r.ok, true); assert.equal(r.state.ducks, true);
    assert.equal(F.fmFeedDucks(r.state).ok, false);
    assert.equal(F.fmNear(F.FM_DUCK_FEED.x, F.FM_DUCK_FEED.z, r.state, farm).kind, 'talk');
    assert.equal(F.fmAllDone(r.state), false, 'ducks are a bonus, not a new chore');
  });

  test('fishing pays a few coins once per new kind of fish — never infinite', () => {
    assert.equal(F.fmNear(F.FM_DOCK.end.x, F.FM_DOCK.end.z, F.fmFresh(), farm).kind, 'fish');
    let st = F.fmFresh(), total = 0;
    for (let i = 0; i < 200; i++){ const r = F.fmFish(st, (i * 0.137) % 1); st = r.state; total += r.coins; }
    assert.equal(total, F.FM_POND_FISH.length * F.FM_FISH_COINS);
    assert.equal(st.fish.length, F.FM_POND_FISH.length);
    const again = F.fmFish(st, 0.1); assert.equal(again.coins, 0); assert.equal(again.first, false);
  });

  test('old farm saves load unchanged, junk fish ids are dropped', () => {
    const old = {fed: ['hens'], adopted: ['chick'], visits: 3};
    const s = F.fmLoad(old);
    assert.equal(s.ducks, false); assert.deepEqual(s.fish, []);
    assert.deepEqual(s.fed, ['hens']); assert.deepEqual(s.adopted, ['chick']);
    assert.deepEqual(F.fmLoad({fish: ['minnowmint', 'shark', 'minnowmint']}).fish, ['minnowmint']);
  });

  test('the farm page builds the pond, ducks, dock, lily pads and far fields, and handles both actions', () => {
    for (const src of [html, fs.readFileSync(path.join(root, 'dev/farm/runtime.js'), 'utf8')]){
      assert.match(src, /function fmBuildPond\(\)\{/);
      assert.match(src, /function fmMakeDuck\(\)\{/);
      assert.match(src, /fmBuildPond\(\);\n/);
      assert.match(src, /fmPondTick\(dt \|\| 0\);/);
      assert.match(src, /if \(hit\.kind === 'ducks'\)\{/);
      assert.match(src, /if \(hit\.kind === 'fish'\)\{\n      if \(fm\.fishT > 0\) return;/);
      assert.match(src, /fm\.lily = \[\];/);
      assert.match(src, /Honeymeadow windmill/);
    }
    assert.ok(html.includes(fs.readFileSync(path.join(root, 'dev/farm/farm_logic.js'), 'utf8').trim()));
    assert.ok(html.includes(fs.readFileSync(path.join(root, 'dev/farm/runtime.js'), 'utf8').trim()));
  });
});
