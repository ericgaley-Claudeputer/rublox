'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const C = require(path.join(__dirname, '..', 'dev/t302/camp_logic.js'));

function night(less){
  const started = C.campStartNight(C.campFresh(), 1, false);
  if (less) started.state.lessScary = true;
  return started.run;
}

test('watcher rules: less-scary toggle reduces count and keeps them farther', () => {
  const scare = C.campWatchRules(false);
  const soft = C.campWatchRules(true);
  assert.ok(soft.max < scare.max, 'fewer watchers when less scary');
  assert.ok(soft.spawnMin > scare.spawnMin, 'less-scary spawn stays farther');
  assert.ok(soft.spawnMax > scare.spawnMax, 'less-scary max range is farther');
  assert.ok(soft.despawn > scare.despawn, 'less-scary vanish sooner, stay farther');
  assert.equal(scare.collide, false);
  assert.equal(soft.collide, false);
  assert.equal(C.campWatchCollides(), false);
  assert.ok(scare.glowEyes);
  assert.equal(soft.glowEyes, false);
  assert.ok(scare.behind);
  assert.equal(soft.behind, false);
  soft.kinds.forEach(k => assert.ok(['owl', 'glow'].includes(k)));
  scare.kinds.forEach(k => assert.ok(['thin', 'pale', 'lake', 'cabin'].includes(k)));
});

test('watchers spawn beyond the min distance', () => {
  const scare = C.campWatchRules(false);
  const soft = C.campWatchRules(true);
  for (const less of [false, true]){
    const rules = less ? soft : scare;
    const run = night(less);
    for (let i = 0; i < 8; i++){
      C.campTickWatchers(run, 0.12, {lessScary:less, px:0, pz:8, face:0, rand:() => (i * 0.11) % 1, forceSpawn:true});
    }
    assert.ok(run.watchers.length >= 1, 'should spawn at least one');
    assert.ok(run.watchers.length <= rules.max);
    run.watchers.forEach(w => {
      const d = C.campWatchMinDist(w, [{x:0, z:8}]);
      assert.ok(d >= rules.spawnMin - 1e-6, 'spawned too close: ' + d + ' kind=' + w.kind);
      assert.ok(d <= rules.spawnMax + 1e-6, 'spawned too far: ' + d);
      assert.equal(w.collide, false);
    });
  }
});

test('watchers never decrease their distance to any player', () => {
  const run = night(false);
  const players = [{x:0, z:8}, {x:-6, z:14}];
  const w = C.campPlaceWatch(run, {kind:'thin', force:true, x:40, z:-20}, {lessScary:false, players, px:0, pz:8});
  assert.ok(w);
  const before = players.map(p => C.campWatchDist(w, p.x, p.z));
  const x0 = w.x, z0 = w.z;
  for (let i = 0; i < 40; i++){
    C.campTickWatchers(run, 0.1, {lessScary:false, players, px:0, pz:8, face:0, rand:() => 1});
  }
  const still = run.watchers.find(x => x.id === w.id);
  assert.ok(still, 'far watcher should still be standing');
  assert.equal(still.x, x0);
  assert.equal(still.z, z0);
  players.forEach((p, i) => {
    const d = C.campWatchDist(still, p.x, p.z);
    assert.ok(d >= before[i] - 1e-9, 'distance to player ' + i + ' dropped ' + before[i] + ' -> ' + d);
  });
});

test('watchers despawn under the distance threshold', () => {
  const scare = C.campWatchRules(false);
  const run = night(false);
  C.campPlaceWatch(run, {kind:'pale', force:true, x:0, z:8 + 12}, {lessScary:false, px:0, pz:8, force:true});
  assert.equal(run.watchers.length, 1);
  assert.ok(C.campWatchDist(run.watchers[0], 0, 8) < scare.despawn);
  C.campTickWatchers(run, 0.08, {lessScary:false, px:0, pz:8, face:0, rand:() => 1});
  assert.equal(run.watchers.length, 0);
  assert.equal(run.watchEvents[0] && run.watchEvents[0].reason, 'close');
});

test('watchers have no collision and never block paths', () => {
  assert.equal(C.campWatchCollides(), false);
  const run = night(false);
  const w = C.campPlaceWatch(run, {kind:'cabin', force:true, x:51.15, z:-30.6}, {lessScary:false, px:0, pz:8, force:true});
  assert.ok(w);
  assert.equal(w.collide, false);
  C.campTickWatchers(run, 0.1, {lessScary:false, px:0, pz:8, face:0, rand:() => 1});
  const still = run.watchers[0];
  if (still) assert.equal(still.collide, false);
});

test('looking at a watcher long enough makes it vanish', () => {
  const run = night(false);
  // Stand in front of the player (same facing +z), far enough not to trip the close threshold.
  C.campPlaceWatch(run, {kind:'thin', force:true, x:0, z:8 + 40}, {lessScary:false, px:0, pz:8, force:true});
  assert.equal(run.watchers.length, 1);
  const face = 0; // looking +z, toward the watcher
  assert.ok(C.campWatchFacing(run.watchers[0], 0, 8, face));
  let reason = null;
  for (let i = 0; i < 30; i++){
    C.campTickWatchers(run, 0.1, {lessScary:false, px:0, pz:8, face, rand:() => 1});
    const ev = (run.watchEvents || []).find(e => e.reason === 'look');
    if (ev) reason = ev.reason;
  }
  assert.equal(run.watchers.length, 0);
  assert.equal(reason, 'look');
});

test('less-scary cap drops extras and uses softer kinds only', () => {
  const run = night(true);
  for (let i = 0; i < 4; i++){
    C.campPlaceWatch(run, {kind:'owl', force:true, x:60, z:8 + i * 2}, {lessScary:true, px:0, pz:8, force:true});
  }
  assert.equal(run.watchers.length, 4);
  C.campTickWatchers(run, 0.05, {lessScary:true, px:0, pz:8, face:0, rand:() => 1});
  assert.equal(run.watchers.length, C.campWatchRules(true).max);
  run.watchers.forEach(w => assert.ok(w.soft));
});

test('campTick hooks watchers without letting them walk closer', () => {
  const started = C.campStartNight(C.campFresh(), 1, false);
  const run = started.run;
  const w = C.campPlaceWatch(run, {kind:'lake', force:true, x:-50, z:42}, {lessScary:false, px:0, pz:8, force:true});
  const d0 = C.campWatchDist(w, 0, 8);
  C.campTick(run, 0.1, {lessScary:false, px:0, pz:8, face:0, rand:() => 1, blanket:true});
  const still = run.watchers.find(x => x.id === w.id);
  assert.ok(still);
  assert.equal(still.x, w.x);
  assert.equal(still.z, w.z);
  assert.ok(C.campWatchDist(still, 0, 8) >= d0 - 1e-9);
});
