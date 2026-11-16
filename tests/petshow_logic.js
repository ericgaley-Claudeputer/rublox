const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const P = require('../dev/t297/petshow_logic.js');

describe('pet talent show', () => {
  test('tricks are taught only on a good attempt and stay on that pet', () => {
    const miss = P.psTeach({}, 'p1', 'sit', 0.2);
    assert.equal(miss.ok, false);
    const ok = P.psTeach({}, 'p1', 'sit', 0.8);
    assert.equal(ok.ok, true);
    assert.deepEqual(P.psKnown(ok.state, 'p1'), ['sit']);
    assert.deepEqual(P.psKnown(ok.state, 'p2'), []);
  });

  test('judges and numeric votes award ribbons, and free-text votes are ignored', () => {
    const r = P.psJudge(['sit','spin','jump'], [1,1,1], [10, 9]);
    assert.equal(r.ok, true);
    assert.ok(r.score >= 9);
    assert.equal(r.ribbon.id, 'gold');
    const rec = P.psRecord({}, r);
    assert.equal(rec.ok, true);
    assert.ok(rec.coins > 0);
    assert.equal(P.psCleanVote('hello'), null);
    assert.equal(P.psCleanVote(11), null);
    assert.equal(P.psCleanVote(8), 8);
  });
});
