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
});
