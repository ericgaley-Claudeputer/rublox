const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const M = require('../dev/t302/meadow_logic.js');

describe('Chow Chuck Meadow', () => {
  test('uses the rubloxMeadow save key and keeps collections personal', () => {
    assert.equal(M.MEADOW_KEY, 'rubloxMeadow');
    const s = M.meadowLoad({found:['puddle', 'nope', 'puddle'], trained:99});
    assert.deepEqual(s.found, ['puddle']);
    assert.equal(s.trained, M.MEADOW_MAX_TRAIN);
    assert.ok(s.xp >= M.meadowXpToReach(M.MEADOW_MAX_TRAIN));
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
    let t = M.meadowGrantXp(mid.state, M.meadowXpToReach(8)).state;
    assert.ok(M.meadowLevel(t) >= 8);
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

  test('training grants XP, and empty snacks fail', () => {
    let s = M.meadowFresh();
    const t = M.meadowTrain(s);
    assert.equal(t.ok, true);
    assert.ok(t.state.xp > 0);
    assert.equal(t.xp, M.MEADOW_XP_TRAIN);
    s.snacks = 0;
    assert.equal(M.meadowThrow(s, 1).why, 'snacks');
  });

  test('an aimed toss only records an animal when the snack lands near that field', () => {
    const fields = [
      {id:'patch', x:0, z:10, animal:'puddle'},
      {id:'hill', x:0, z:20, animal:'clover'}
    ];
    const hit = M.meadowThrowTo(M.meadowFresh(), 1, 0, 0, 0, 1, fields, 'me');
    assert.equal(hit.ok, true);
    assert.equal(hit.missed, false);
    assert.equal(hit.animal.id, 'puddle');
    assert.equal(hit.foundNew, true);
    const miss = M.meadowThrowTo(M.meadowFresh(), 1, 0, 0, 1, 0, fields, 'me');
    assert.equal(miss.ok, true);
    assert.equal(miss.missed, true);
    assert.equal(miss.animal, null);
    assert.deepEqual(miss.state.found, []);
  });

  test('leveling takes a long time and rebirth resets level but speeds up later XP', () => {
    const toTen = M.meadowXpToReach(M.MEADOW_REBIRTH_LEVEL);
    assert.ok(toTen > M.MEADOW_XP_TRAIN * 20, 'many training sessions should still be short of a rebirth');
    const early = M.meadowRebirth(M.meadowFresh());
    assert.equal(early.ok, false);
    assert.equal(early.why, 'level');
    let s = M.meadowGrantXp(M.meadowFresh(), toTen).state;
    assert.equal(M.meadowLevel(s), M.MEADOW_REBIRTH_LEVEL);
    assert.equal(M.meadowCanRebirth(s), true);
    const powerBefore = M.meadowPower(s);
    const rb = M.meadowRebirth(s);
    assert.equal(rb.ok, true);
    assert.equal(rb.rebirths, 1);
    assert.equal(M.meadowLevel(rb.state), 0);
    assert.ok(M.meadowPower(rb.state) < powerBefore);
    assert.ok(M.meadowXpMul(rb.state) > 1);
    assert.equal(rb.badge.id, 'born');
    const gained = M.meadowGrantXp(rb.state, 10);
    assert.ok(gained.gained > 10);
    assert.equal(M.meadowCard(rb.state).badge.emoji, '♻️');
  });

  test('farther fields hold rarer pals, including a secret, and the book shows rarity', () => {
    assert.equal(M.meadowAnimal('puddle').rarity, 'common');
    assert.equal(M.meadowAnimal('clover').rarity, 'uncommon');
    assert.equal(M.meadowAnimal('berry').rarity, 'rare');
    assert.equal(M.meadowAnimal('moss').rarity, 'epic');
    assert.equal(M.meadowAnimal('starlit').rarity, 'legendary');
    assert.equal(M.meadowAnimal('wisp').rarity, 'secret');
    const book = M.meadowBook(M.meadowFresh());
    const wisp = book.find(a => a.id === 'wisp');
    assert.equal(wisp.rarity, 'secret');
    assert.equal(wisp.found, false);
    assert.equal(wisp.field.id, 'glade');
    const fields = [{id:'glade', x:0, z:45, animal:'starlit', secret:'wisp', secretChance:0.1, r:8}];
    let s = M.meadowGrantXp(M.meadowFresh(), M.meadowXpToReach(12)).state;
    const vis = M.meadowThrowTo(s, 1, 0, 0, 0, 1, fields, 'me', null, () => 0.99);
    assert.equal(vis.animal.id, 'starlit');
    const hid = M.meadowThrowTo(vis.state, 1, 0, 0, 0, 1, fields, 'me', null, () => 0);
    assert.equal(hid.animal.id, 'wisp');
    assert.equal(hid.foundNew, true);
    assert.ok(M.meadowBook(hid.state).find(a => a.id === 'wisp').found);
  });
});
