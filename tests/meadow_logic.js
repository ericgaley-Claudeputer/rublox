const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const M = require('../dev/t302/meadow_logic.js');

describe('Chow Chuck Meadow', () => {
  test('uses the rubloxMeadow save key and keeps collections personal', () => {
    assert.equal(M.MEADOW_KEY, 'rubloxMeadow');
    const s = M.meadowLoad({found:['puddle', 'nope', 'puddle'], trained:99});
    assert.deepEqual(s.found, ['puddle']);
    assert.equal(s.trained, M.MEADOW_MAX_TRAIN);
    assert.equal(M.meadowCanTake('me', 'you'), false);
    assert.equal(M.meadowCanTake('me', 'me'), true);
    assert.equal(M.meadowCanTake('me', null), true);
  });

  test('power meter charge scales distance and unlocks farther original animals', () => {
    let s = M.meadowFresh();
    const weak = M.meadowThrow(s, 0.2, 'me');
    assert.equal(weak.ok, true);
    assert.ok(weak.dist < 8);
    assert.equal(weak.animal, null);
    const mid = M.meadowThrow(weak.state, 0.7, 'me');
    assert.ok(mid.dist >= 8);
    assert.equal(mid.animal.id, 'puddle');
    assert.equal(mid.foundNew, true);
    // farther field needs training or a full charge after training
    let t = mid.state;
    for (let i = 0; i < 8; i++) t = M.meadowTrain(t).state;
    const far = M.meadowThrow(t, 1, 'me');
    assert.ok(far.dist >= 24);
    assert.ok(far.animal);
    assert.equal(M.meadowBook(far.state).filter(a => a.found).length >= 2, true);
  });

  test('nobody can collect an animal that already belongs to a friend', () => {
    const stolen = M.meadowThrow(M.meadowFresh(), 1, 'me', 'friend');
    assert.equal(stolen.ok, false);
    assert.equal(stolen.why, 'owned');
    assert.equal(stolen.state.found.length, 0);
  });

  test('training raises throw power up to a cap, and empty snacks fail', () => {
    let s = M.meadowFresh();
    const p0 = M.meadowPower(s);
    const t = M.meadowTrain(s);
    assert.equal(t.ok, true);
    assert.equal(M.meadowPower(t.state), p0 + M.MEADOW_STEP);
    s.snacks = 0;
    assert.equal(M.meadowThrow(s, 1).why, 'snacks');
  });
});
