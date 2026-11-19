const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dev/t302/camp_logic.js');

function tickFor(run, seconds, opt){
  let left = seconds;
  while (left > 0){
    const s = Math.min(0.1, left);
    C.campTick(run, s, opt || {lessScary:false, px:0, pz:8});
    left -= s;
  }
  return run;
}

describe('Campfire Grove', () => {
  test('uses the rubloxCamp save key, has no fighting or gore, and only offers a buddy in solo', () => {
    assert.equal(C.CAMP_KEY, 'rubloxCamp');
    assert.equal(C.campNoFight(), true);
    assert.equal(C.campNoGore(), true);
    assert.equal(C.campEveryoneOkay(), true);
    assert.equal(C.campBuddyAllowed(false), true);
    assert.equal(C.campBuddyAllowed(true), false);
  });

  test('there are no free sticks at camp; logs are picked or chopped, carried, stashed, and they respawn', () => {
    let {state, run} = C.campStartRun(C.campFresh(), 0, false);
    assert.equal(state.sticks, 0);
    assert.equal(run.carry, 0);
    const fallen = run.logs.find(l => l.kind === 'fallen' && l.value === 1);
    const stump = run.logs.find(l => l.kind === 'stump');
    const heart = run.logs.find(l => l.kind === 'heart');
    assert.ok(fallen && stump && heart);
    assert.equal(C.campChopLog(state, run, fallen.id, 0.1).why, 'ok');
    assert.equal(run.carry, 1);
    const needChop = C.campPickLog(state, run, stump.id);
    assert.equal(needChop.why, 'chop');
    let r = C.campChopLog(state, run, stump.id, 0.4);
    assert.equal(r.why, 'chopping');
    r = C.campChopLog(r.state, r.run, stump.id, C.CAMP_CHOP);
    assert.equal(r.ok, true);
    assert.equal(r.run.carry, 2);
    const stash = C.campStash(r.state, r.run);
    assert.equal(stash.stashed, 2);
    assert.equal(stash.state.sticks, 2);
    assert.equal(stash.run.carry, 0);
    const empty = C.campPickLog(stash.state, stash.run, fallen.id);
    assert.equal(empty.why, 'empty');
    stash.run.clock = fallen.regenAt + 1;
    C.campTick(stash.run, 0.1, {lessScary:false, px:0, pz:0});
    assert.equal(C.campLog(stash.run, fallen.id).left, 1);
    let carry = C.campStartRun(C.campFresh(), 0, false);
    carry.run.carry = C.CAMP_CARRY;
    const full = C.campPickLog(carry.state, carry.run, carry.run.logs.find(l => l.kind === 'fallen').id);
    assert.equal(full.why, 'full');
  });

  test('deep-woods logs are worth more, and the map has trails, a cabin, a lake, and a compass back to camp', () => {
    const heart = C.CAMP_LOG_SPOTS.find(l => l.kind === 'heart');
    assert.equal(heart.zone, 'deep');
    assert.ok(heart.value >= 2);
    assert.equal(C.campZone(0, 0), 'camp');
    assert.equal(C.campZone(48, -32), 'cabin');
    assert.equal(C.campInDeep(52, 48), true);
    assert.ok(C.campInWater(-40, 36));
    const c = C.campCompass(30, 0);
    assert.ok(c.dist > 20);
    assert.ok(Math.abs(c.ang) > 1);
    assert.ok(C.CAMP_SIZE >= 120);
    assert.ok(C.CAMP_LANDMARKS.some(l => l.id === 'cabin'));
    assert.ok(C.CAMP_TRAILS.length >= 8);
  });

  test('day is calm for gathering; night brings the Gloam; five kept nights win the run', () => {
    let {state, run} = C.campStartRun(C.campFresh(), 0, false);
    assert.equal(run.phase, 'day');
    assert.equal(run.day, 1);
    run.gx = 20; run.gz = 0;
    tickFor(run, 2, {lessScary:false, px:0, pz:8});
    assert.equal(run.gmode, 'hidden');
    assert.equal(run.phase, 'day');
    tickFor(run, C.CAMP_DAY, {lessScary:false, px:0, pz:8});
    assert.equal(run.phase, 'night');
    assert.ok(run.gmode !== 'hidden');
    for (let n = 0; n < C.CAMP_WIN_NIGHTS; n++){
      if (run.phase !== 'night') tickFor(run, C.CAMP_DAY + 1, {lessScary:false, px:0, pz:8});
      run.fire = 1;
      run.wantCatch = false;
      tickFor(run, C.CAMP_NIGHT + 0.2, {lessScary:false, px:0, pz:8, blanket:true});
    }
    assert.equal(run.won, true);
    assert.ok(run.survived >= C.CAMP_WIN_NIGHTS);
    const fin = C.campFinish(state, run);
    assert.equal(fin.why, 'sunrise');
    assert.equal(fin.state.sunrises, 1);
    assert.ok(C.campReward(run) >= 40);
  });

  test('a night with a cold fire does not count, but the run continues into the next day', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, true);
    assert.equal(run.buddy, false);
    run.fire = 0.05;
    tickFor(run, C.CAMP_NIGHT + 0.2, {lessScary:false, px:0, pz:0});
    assert.equal(run.won, false);
    assert.equal(run.survived, 0);
    assert.equal(run.phase, 'day');
    assert.equal(run.day, 2);
    const fin = C.campFinish(state, run);
    assert.equal(fin.why, 'ember');
    state.sticks = 3;
    const blanket = C.campCraft(state, 'blanket');
    assert.equal(blanket.ok, true);
  });

  test('friends can add a stick to a shared fire without taking your inventory', () => {
    let {state, run} = C.campStartRun(C.campFresh(), 0, true);
    state.sticks = 0;
    const net = C.campAddStick(state, run, true);
    assert.equal(net.ok, true);
    assert.equal(net.state.sticks, 0);
  });

  test('the Gloam creeps and chases in the dark, and flees from a bright fire or lantern', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, false);
    run.fire = 0.12;
    run.gx = 16; run.gz = 0; run.gmode = 'stalk';
    C.campTick(run, 1.0, {lessScary:false, px:20, pz:0});
    assert.equal(run.chase, true);
    run.fire = 1;
    run.gmode = 'chase';
    C.campTick(run, 0.5, {lessScary:false, px:0, pz:0});
    assert.ok(run.gmode === 'retreat' || C.campLightAt(run, 0, 0, {px:0,pz:0}) > 0.5);
    state = C.campCraft(C.campLoad({sticks:8}), 'lantern').state;
    const shine = C.campShine(state, run);
    assert.equal(shine.ok, true);
    assert.ok(shine.run.lantern > 0);
    assert.ok(C.campGloamTarget(shine.run, false) > C.campGloamTarget({fire:0.12, lantern:0}, false));
  });

  test('Less scary keeps the Gloam farther away and does not jump-scare as quickly', () => {
    const spooky = C.campGloamTarget({fire:0.2, lantern:0, phase:'night'}, false);
    const soft = C.campGloamTarget({fire:0.2, lantern:0, phase:'night'}, true);
    assert.ok(soft > spooky);
    let {run} = C.campStartNight(C.campSetLessScary(C.campFresh(), true), 0, false);
    run.fire = 0.1;
    run.gx = 8; run.gz = 0;
    C.campTick(run, 1.5, {lessScary:true, px:0, pz:0});
    assert.equal(run.won, false);
    assert.equal(C.campSetLessScary(C.campFresh(), true).lessScary, true);
  });

  test('getting caught respawns at camp, drops sticks, and everyone is okay — it is never a fight', () => {
    let {state, run} = C.campStartNight(C.campFresh(), 0, false);
    state.sticks = 5;
    run.carry = 2;
    const hit = C.campCaught(state, run);
    assert.equal(hit.ok, true);
    assert.equal(hit.everyoneOkay, true);
    assert.equal(C.campEveryoneOkay(), true);
    assert.equal(hit.run.carry, 0);
    assert.equal(hit.run.respawn, true);
    assert.equal(hit.run.failed, false);
    assert.equal(hit.run.won, false);
    assert.ok(hit.state.sticks < 5);
    assert.equal(hit.lostCarry, 2);
    assert.equal(C.campNoFight(), true);
    const fin = C.campFinish(hit.state, hit.run);
    assert.equal(fin.why, 'ember');
  });

  test('old camp saves stay compatible and new fields are optional', () => {
    const loaded = C.campLoad({ver:2, sticks:4, gathered:2, crafted:['blanket'], sunrises:1, lessScary:true});
    assert.equal(loaded.sticks, 4);
    assert.equal(loaded.sunrises, 1);
    assert.equal(loaded.lessScary, true);
    assert.ok(loaded.crafted.includes('blanket'));
    assert.equal(loaded.ver, C.CAMP_VER);
  });
});
