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

  test('every pet species, including dogs, can learn every trick when standing on a practice pad', () => {
    const kinds = ['dog', 'cat', 'bunny', 'fox', 'bear', 'mouse'];
    for (const kind of kinds){
      let state = {};
      const pet = {k: kind, n: kind + '-pal'};
      assert.equal(P.psPetKind(pet), kind);
      const pid = P.psPetId(pet);
      for (const trick of P.PS_TRICKS){
        assert.equal(P.psSpeciesCanTrick(kind, trick.id), true);
        const r = P.psTeach(state, pid, trick.id, 0.8);
        assert.equal(r.ok, true, kind + ' should learn ' + trick.id);
        state = r.state;
      }
      assert.deepEqual(P.psKnown(state, pid).sort(), P.PS_TRICKS.map(t => t.id).sort());
    }
    const sit = {id:'sit', x: -8, z: 8};
    assert.equal(P.psOnMat(-8, 8, [sit]).id, 'sit');
    assert.equal(P.psOnMat(-8 + 1.0, 8, [sit]).id, 'sit');
    assert.equal(P.psOnMat(-8, 8 + 1.5, [sit]).id, 'sit');
    assert.equal(P.psOnMat(-8 + 3, 8, [sit]), null);
    const spin = P.psTrickPose('spin', 1.8, 1.8);
    assert.ok(Math.abs(spin.yaw - Math.PI * 2) < 1e-9);
    assert.equal(P.psTrickPose('sit', 0.5, 1.8).act, 3);
    assert.equal(P.psTrickPose('high', 0.5, 1.8).act, 5);
    assert.ok(P.psTrickPose('jump', 0.9, 1.8).hop > 0.3);
  });
});
