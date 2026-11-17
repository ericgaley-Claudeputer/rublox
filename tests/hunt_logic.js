const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const H = require('../dev/t297/hunt_logic.js');

describe('treasure trail', () => {
  test('the daily map is deterministic for a local date and different the next day', () => {
    const a = H.huntMap('2026-11-16');
    const b = H.huntMap('2026-11-16');
    const c = H.huntMap('2026-11-20');
    assert.equal(a.steps.length, 4);
    assert.deepEqual(a.steps.map(s => s.id), b.steps.map(s => s.id));
    assert.notDeepEqual(a.steps.map(s => s.id), c.steps.map(s => s.id));
    const uniq = new Set();
    for (let i = 1; i <= 14; i++){
      const d = '2026-11-' + String(i).padStart(2,'0');
      uniq.add(H.huntMap(d).steps.map(s => s.id).join(','));
    }
    assert.ok(uniq.size >= 8);
  });

  test('only the current clue spot pays, empty digs are safe, and a new day starts a new map', () => {
    const day = '2026-11-16T12:00:00';
    const map = H.huntMap(H.huntDay(day));
    const first = map.steps[0];
    const wrong = H.huntDig({}, 'nope', day);
    assert.equal(wrong.ok, false);
    const hit = H.huntDig(wrong.state, first.id, day);
    assert.equal(hit.ok, true);
    assert.ok(hit.coins >= 8);
    assert.equal(hit.state.step, 1);
    // next day resets steps but keeps maps/earned
    hit.state.maps = 2;
    const later = H.huntLoad(hit.state, '2026-11-17T12:00:00');
    assert.equal(later.step, 0);
    assert.equal(later.maps, 2);
    assert.equal(later.day, '2026-11-17');
  });
});
