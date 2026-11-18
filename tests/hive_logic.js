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
    while (s.pollen < H.HIVE_PER) s = H.hiveCollect(s, 'blue').state;
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
});
