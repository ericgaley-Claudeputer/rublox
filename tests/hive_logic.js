const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const H = require('../dev/t302/hive_logic.js');

describe('Honeyhill Hive', () => {
  test('uses the rubloxHive save key, collects pollen, and makes honey at the hive', () => {
    assert.equal(H.HIVE_KEY, 'rubloxHive');
    let s = H.hiveFresh();
    const c = H.hiveCollect(s, 'sun');
    assert.equal(c.ok, true);
    assert.equal(c.state.pollen, 2);
    const early = H.hiveMakeHoney(c.state);
    assert.equal(early.ok, false);
    s = c.state;
    let now = 1000;
    while (s.pollen < H.HIVE_PER){
      const n = H.hiveCollect(s, 'blue', now);
      assert.equal(n.ok, true, n.why);
      s = n.state;
      now += H.HIVE_REGEN;
    }
    const pot = H.hiveMakeHoney(s);
    assert.equal(pot.ok, true);
    assert.ok(pot.pots >= 1);
    assert.ok(pot.state.honey >= 1);
  });

  test('bear quests award stickers and unlock new flower trails, with no fighting', () => {
    assert.equal(H.hiveFight(), false);
    let s = H.hiveFresh();
    s.honey = 2;
    const start = H.hiveStartQuest(s, 'berry-bear');
    assert.equal(start.ok, true);
    const done = H.hiveTurnIn(start.state, 'berry-bear');
    assert.equal(done.ok, true);
    assert.ok(done.state.stickers.includes('berry-badge'));
    assert.ok(done.state.trails.includes('brook'));
    const locked = H.hiveCollect(H.hiveFresh(), 'dusk');
    assert.equal(locked.why, 'locked');
    const visit = H.hiveVisit(done.state, 'brook');
    const clover = H.hiveTurnIn(H.hiveStartQuest(visit.state, 'clover-bear').state, 'clover-bear');
    assert.equal(clover.ok, true);
    assert.ok(clover.state.trails.includes('glade'));
  });

  test('unknown fields are ignored so older saves stay intact', () => {
    const s = H.hiveLoad({pollen:4, extra:'nope', trails:['meadow', 'fake'], stickers:['berry-badge', 'x']});
    assert.equal(s.pollen, 4);
    assert.equal(s.extra, undefined);
    assert.deepEqual(s.trails, ['meadow']);
    assert.deepEqual(s.stickers, ['berry-badge']);
  });

  test('pollen regenerates on a flower over time after it is collected', () => {
    let now = 5000;
    const a = H.hiveCollect(H.hiveFresh(), 'sun', now);
    assert.equal(a.ok, true);
    const soon = H.hiveCollect(a.state, 'sun', now + 200);
    assert.equal(soon.ok, false);
    assert.equal(soon.why, 'empty');
    assert.ok(H.hiveBloom(a.state, 'sun', now + 200) < 1);
    assert.ok(H.hiveBloomLeft(a.state, 'sun', now + 200) > 0);
    const mid = now + Math.floor(H.HIVE_REGEN / 2);
    const half = H.hiveBloom(a.state, 'sun', mid);
    assert.ok(half > 0.4 && half < 0.7);
    const ready = H.hiveCollect(a.state, 'sun', now + H.HIVE_REGEN);
    assert.equal(ready.ok, true);
    assert.equal(ready.state.collected, 2);
  });

  test('Clover Trail is a walkable signed path toward the clover flowers and Berry Bear', () => {
    const path = H.hiveCloverPath();
    assert.ok(path.length >= 6);
    const signs = path.filter(p => p.sign);
    assert.ok(signs.length >= 3);
    assert.ok(signs.some(p => /Clover Trail/i.test(p.sign)));
    const bear = {x:-12, z:2};
    const flowers = {x:-8, z:6};
    const nearBear = path.some(p => Math.hypot(p.x - bear.x, p.z - bear.z) <= 3);
    const nearFlowers = path.some(p => Math.hypot(p.x - flowers.x, p.z - flowers.z) <= 3);
    assert.equal(nearBear, true);
    assert.equal(nearFlowers, true);
  });
});
