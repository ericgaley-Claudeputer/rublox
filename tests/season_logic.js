'use strict';
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dev/season/season_logic.js');

describe('seasonal events', () => {
  test('Snow Festival is on Dec 1–Jan 15 by local date, off in mid-February', () => {
    assert.equal(E.evIsOn('snow', '2026-12-01T12:00:00'), true);
    assert.equal(E.evIsOn('snow', '2026-12-25T12:00:00'), true);
    assert.equal(E.evIsOn('snow', '2027-01-15T23:00:00'), true);
    assert.equal(E.evIsOn('snow', '2026-11-30T12:00:00'), false);
    assert.equal(E.evIsOn('snow', '2027-01-16T12:00:00'), false);
    assert.equal(E.evIsOn('snow', '2026-02-10T12:00:00'), false);
    const on = E.evActive('2026-12-10T10:00:00');
    assert.ok(on && on.id === 'snow' && on.name === 'Snow Festival');
    assert.equal(E.evActive('2026-06-01T10:00:00'), null);
  });

  test('a hash or settings force turns the festival on before December', () => {
    assert.equal(E.evIsOn('snow', '2026-11-16T12:00:00'), false);
    assert.equal(E.evIsOn('snow', '2026-11-16T12:00:00', {hash: '#snowfest=1'}), true);
    assert.equal(E.evIsOn('snow', '2026-11-16T12:00:00', {hash: '#evtest=snow'}), true);
    assert.equal(E.evIsOn('snow', '2026-11-16T12:00:00', {state: {force: 'snow'}}), true);
    assert.equal(E.evHashForce('#games'), '');
    assert.equal(E.evHashForce('#snowfest=0'), '');
  });

  test('Bloom Picnic is a later-season placeholder and is not auto-started', () => {
    const bloom = E.evSeasonById('bloom');
    assert.ok(bloom && bloom.placeholder);
    assert.equal(E.evIsOn('bloom', '2027-03-25T12:00:00'), false);
    const next = E.evNext('2026-11-16T12:00:00');
    assert.ok(next && (next.id === 'snow' || next.id === 'bloom'));
  });

  test('snowflakes can be earned and spent, never going negative, and saves migrate safely', () => {
    let s = E.evLoad({flakes: 'nope', inv: {junk: 1}, force: '???', spent: -4});
    assert.equal(s.flakes, 0);
    assert.equal(s.force, '');
    assert.equal(s.spent, 0);
    s = E.evAward(s, 40, 'toss').state;
    assert.equal(s.flakes, 40);
    const no = E.evBuy(s, 'ev-snow-skates'); // costs 50
    assert.equal(no.ok, false);
    assert.equal(no.why, 'flakes');
    assert.equal(no.state.flakes, 40);
    const yes = E.evBuy(s, 'ev-snow-scarf');
    assert.equal(yes.ok, true);
    assert.equal(yes.state.flakes, 10);
    assert.equal(!!yes.state.inv['ev-snow-scarf'], true);
    const again = E.evBuy(yes.state, 'ev-snow-scarf');
    assert.equal(again.ok, false);
    assert.equal(again.why, 'owned');
  });

  test('daily flake bonus is once per local day, and best scores keep the better value', () => {
    let s = E.evFresh();
    const a = E.evDaily(s, '2026-12-05T10:00:00');
    assert.equal(a.ok !== false || a.add > 0, true);
    assert.ok(a.add > 0);
    const b = E.evDaily(a.state, '2026-12-05T18:00:00');
    assert.equal(b.ok, false);
    const c = E.evDaily(a.state, '2026-12-06T08:00:00');
    assert.ok(c.add > 0);
    let t = E.evNoteBest(E.evFresh(), 'toss', 8, true);
    t = E.evNoteBest(t.state, 'toss', 5, true);
    assert.equal(t.state.best.toss, 8);
    t = E.evNoteBest(t.state, 'toss', 12, true);
    assert.equal(t.state.best.toss, 12);
    let sl = E.evNoteBest(E.evFresh(), 'sled', 22.4, false);
    sl = E.evNoteBest(sl.state, 'sled', 30, false);
    assert.equal(sl.better, false);
    sl = E.evNoteBest(sl.state, 'sled', 19.1, false);
    assert.equal(sl.better, true);
    assert.equal(sl.state.best.sled, 19.1);
  });
});
