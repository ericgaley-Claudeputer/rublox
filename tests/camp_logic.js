const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dev/t302/camp_logic.js');

function tickFor(run, seconds, opt){
  let left = seconds;
  while (left > 0){
    const s = Math.min(0.1, left);
    C.campTick(run, s, opt);
    left -= s;
  }
  return run;
}

describe('Campfire Grove', () => {
  test('uses the rubloxCamp save key, has no fighting or gore, and only offers a buddy in solo', () => {
    assert.equal(C.CAMP_KEY, 'rubloxCamp');
    assert.equal(C.campNoFight(), true);
    assert.equal(C.campNoGore(), true);
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
    // Keep the fire bright the whole night so the Gloam stays away.
    let left = C.CAMP_NIGHT - 1;
    while (left > 0){
      add.run.fire = 1;
      add.run.gloam = C.CAMP_GLOAM_FAR;
      add.run.threat = 0;
      const s = Math.min(0.1, left);
      C.campTick(add.run, s, {lessScary:false});
      left -= s;
    }
    assert.equal(add.run.won, false);
    add.run.fire = 1;
    add.run.failed = false;
    add.run.gloam = C.CAMP_GLOAM_FAR;
    add.run.threat = 0;
    tickFor(add.run, 2, {lessScary:false});
    assert.equal(add.run.won, true);
    const fin = C.campFinish(add.state, add.run);
    assert.equal(fin.why, 'sunrise');
    assert.equal(fin.state.sunrises, 1);
    assert.ok(C.campReward(add.run) >= 20);
  });

  test('a fire that goes out before sunrise does not count, and craft spends sticks', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, true);
    assert.equal(run.buddy, false);
    run.fire = 0.01;
    run.gloam = 20;
    tickFor(run, C.CAMP_NIGHT, {lessScary:false});
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

  test('the Gloam creeps closer when the fire dims and flees when it is stoked or a lantern shines', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, false);
    run.gloam = 16;
    run.fire = 0.12;
    C.campTick(run, 1.0, {lessScary:false});
    const close = run.gloam;
    assert.ok(close < 16, 'should creep in');
    run.fire = 1;
    C.campTick(run, 1.0, {lessScary:false});
    assert.ok(run.gloam > close, 'should back off from a bright fire');
    state = C.campCraft(C.campLoad({sticks:8}), 'lantern').state;
    const shine = C.campShine(state, run);
    assert.equal(shine.ok, true);
    assert.ok(shine.run.lantern > 0);
    const tgt = C.campGloamTarget(shine.run, false);
    const dim = C.campGloamTarget({fire:0.12, lantern:0}, false);
    assert.ok(tgt > dim, 'a lantern keeps the Gloam farther back');
  });

  test('Less scary keeps the Gloam farther away and does not fail as quickly', () => {
    const spooky = C.campGloamTarget({fire:0.2, lantern:0}, false);
    const soft = C.campGloamTarget({fire:0.2, lantern:0}, true);
    assert.ok(soft > spooky);
    let {run} = C.campStartNight(C.campSetLessScary(C.campFresh(), true), 0, false);
    run.fire = 0.1;
    run.gloam = 5;
    C.campTick(run, 1.5, {lessScary:true});
    assert.equal(run.failed, false);
    assert.equal(C.campSetLessScary(C.campFresh(), true).lessScary, true);
  });

  test('if the Gloam stays in a dim camp the night is lost, but it is never a fight', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, false);
    run.fire = 0.05;
    run.gloam = 2;
    tickFor(run, 2.0, {lessScary:false});
    assert.equal(run.scarePop, true);
    assert.equal(run.failed, true);
    assert.equal(C.campNoFight(), true);
    const fin = C.campFinish(state, run);
    assert.equal(fin.why, 'ember');
  });
});
