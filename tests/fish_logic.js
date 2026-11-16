const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const F = require('../dev/t297/fish_logic.js');

describe('fishing', () => {
  test('timing quality is highest in the sweet spot and misses outside it', () => {
    assert.equal(F.fishQuality(0.5, 0.5, 0.16), 1);
    assert.equal(F.fishQuality(0.9, 0.5, 0.16), 0);
    assert.ok(F.fishQuality(0.55, 0.5, 0.16) > 0.5);
  });

  test('catches fill a collection, keep the biggest size, and ice fish are seasonal only', () => {
    const minnow = F.FISH_LIST.find(f => f.id === 'minnow');
    const frost = F.FISH_LIST.find(f => f.id === 'frost');
    let s = F.fishFresh();
    const a = F.fishCatch(s, minnow, 12);
    assert.equal(a.first, true);
    s = a.state;
    const b = F.fishCatch(s, minnow, 15);
    assert.equal(b.state.caught.minnow, 2);
    assert.equal(b.state.best.minnow, 15);
    assert.equal(F.fishKinds(b.state), 1);
    const summer = F.fishPool(false).map(f => f.id);
    const winter = F.fishPool(true).map(f => f.id);
    assert.ok(!summer.includes('frost') && winter.includes('frost'));
    assert.equal(!!frost.ice, true);
    const idx = F.fishIndex(b.state, false);
    assert.ok(idx.find(x => x.id === 'minnow').found);
    assert.ok(!idx.find(x => x.id === 'frost'));
  });

  test('corrupt saves fall back safely and do not invent fish', () => {
    const s = F.fishLoad({caught:{nope:4, minnow:'2'}, best:{minnow:'11.5'}, total:'-3'});
    assert.equal(s.caught.minnow, 2);
    assert.equal(s.caught.nope, undefined);
    assert.equal(s.best.minnow, 11.5);
    assert.equal(s.total, 0);
  });
});
