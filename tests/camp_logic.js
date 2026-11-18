const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dev/t302/camp_logic.js');

describe('Campfire Grove', () => {
  test('uses the rubloxCamp save key, has no monsters, and only offers a buddy in solo', () => {
    assert.equal(C.CAMP_KEY, 'rubloxCamp');
    assert.equal(C.campNoMonsters(), true);
    assert.equal(C.campBuddyAllowed(false), true);
    assert.equal(C.campBuddyAllowed(true), false);
  });

  test('sticks keep the fire bright and a kept fire reaches sunrise', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, false);
    assert.equal(run.buddy, true);
    const g = C.campGather(state, run, 0);
    assert.equal(g.ok, true);
    const add = C.campAddStick(g.state, g.run);
    assert.equal(add.ok, true);
    assert.ok(add.run.fire > 0.78);
    // tick almost to sunrise, then keep the fire bright for the last seconds
    add.run.fire = 1;
    C.campTick(add.run, C.CAMP_NIGHT - 1);
    assert.equal(add.run.won, false);
    add.run.fire = 1;
    C.campTick(add.run, 2);
    assert.equal(add.run.won, true);
    const fin = C.campFinish(add.state, add.run);
    assert.equal(fin.why, 'sunrise');
    assert.equal(fin.state.sunrises, 1);
  });

  test('a fire that goes out before sunrise does not count, and craft spends sticks', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, true);
    assert.equal(run.buddy, false);
    run.fire = 0.01;
    C.campTick(run, C.CAMP_NIGHT);
    assert.equal(run.failed, true);
    const fin = C.campFinish(state, run);
    assert.equal(fin.why, 'ember');
    assert.equal(fin.state.sunrises, 0);
    state.sticks = 3;
    const blanket = C.campCraft(state, 'blanket');
    assert.equal(blanket.ok, true);
    assert.ok(blanket.state.crafted.includes('blanket'));
    assert.equal(C.campCraft(blanket.state, 'lantern').why, 'sticks');
  });

  test('friends can add a stick to a shared fire without taking your inventory', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, true);
    state.sticks = 0;
    const net = C.campAddStick(state, run, true);
    assert.equal(net.ok, true);
    assert.equal(net.state.sticks, 0);
  });
});
