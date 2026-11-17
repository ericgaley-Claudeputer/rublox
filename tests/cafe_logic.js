const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dev/t297/cafe_logic.js');

describe('cozy cafe', () => {
  test('tickets match a station and serving pays coins without going negative', () => {
    const t = C.cafeTicket(0, 'cocoa');
    assert.equal(t.id, 'cocoa');
    assert.equal(C.cafeMake(t, 'cocoa').ok, true);
    assert.equal(C.cafeMake(t, 'oven').ok, false);
    const r = C.cafeServe({}, t);
    assert.equal(r.ok, true);
    assert.equal(r.coins, 6);
    assert.equal(r.state.served, 1);
  });

  test('decor is bought with coins, never duplicated, and saves migrate safely', () => {
    const a = C.cafeBuyDecor({}, 'plant', 5);
    assert.equal(a.ok, false);
    const b = C.cafeBuyDecor({}, 'plant', 20);
    assert.equal(b.ok, true);
    assert.equal(b.coins, 0);
    const c = C.cafeBuyDecor(b.state, 'plant', 100);
    assert.equal(c.ok, false);
    const legacy = C.cafeLoad({served:'3', decor:['plant','nope']});
    assert.equal(legacy.served, 3);
    assert.deepEqual(legacy.decor, ['plant']);
  });

  test('decor popup closes on X, Esc, Xbox B, a tap, or walking away, and does not re-open from proximity', () => {
    const reasons = C.t297UiCloseReasons();
    for (const r of ['x', 'escape', 'xbox-b', 'tap', 'walk']) assert.ok(reasons.includes(r));
    assert.equal(C.t297UiWalkAway(0, 6, 0, 6), false);
    assert.equal(C.t297UiWalkAway(0, 6, 0, 7), false);
    assert.equal(C.t297UiWalkAway(0, 6, 0, 6 + 5), true);
    assert.equal(C.t297UiWalkAway(-3, -5, 6, 9), true);
    assert.equal(C.t297UiMayOpen(null, 1000), true);
    assert.equal(C.t297UiMayOpen(1000, 1200), false);
    assert.equal(C.t297UiMayOpen(1000, 1000 + C.T297_REOPEN_MS), true);
    assert.deepEqual(C.t297OverlayIds().slice(0, 2), ['cafeDecor', 'cafeBoard']);
  });
});
