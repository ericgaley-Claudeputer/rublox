const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const F = require(path.join(__dirname, '..', 'dev/farm/farm_logic.js'));
const R = require(path.join(__dirname, '..', 'dev/reset/reset_logic.js'));

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Honeymeadow Farm rules: bus ride, chores, hay wagon, ride home, old saves load', () => {
  assert.equal(F.FM_KEY, 'rubloxFarm');
  assert.equal(F.FM_FEEDS.length, 3);
  assert.equal(F.FM_EGGS.length, 3);
  assert.equal(F.FM_APPLES.length, 3);
  assert.equal(F.FM_PUMPS.length, 3);
  F.FM_FEEDS.concat(F.FM_EGGS, F.FM_APPLES, F.FM_PUMPS).forEach(f => {
    assert.ok(f.id && f.name && f.emoji && Number.isFinite(f.x) && Number.isFinite(f.z));
    assert.doesNotMatch(f.name + (f.blurb || ''), /blood|wound|gore|kill/i);
  });
  const fresh = F.fmFresh();
  assert.deepEqual(fresh.fed, []);
  assert.equal(fresh.hay, false);
  assert.equal(fresh.won, false);
  assert.deepEqual(F.fmLoad({fed:['hens','nope'], hay:true}).fed, ['hens']);
  assert.equal(F.fmLoad({fed:['hens'], hay:true}).hay, true);

  const visit = F.fmNewVisit({fed:[], visits:1, won:false});
  assert.equal(visit.state.visits, 2);
  assert.equal(visit.run.phase, 'yard');
  const bus = F.fmNear(F.FM_BUS.x, F.FM_BUS.z, visit.state, visit.run);
  assert.equal(bus.kind, 'bus');
  const talk = F.fmNear(F.FM_TEACHER.x, F.FM_TEACHER.z, visit.state, visit.run);
  assert.equal(talk.kind, 'talk');
  assert.match(talk.text, /Honeymeadow Farm/);

  assert.equal(F.fmBoardBus(visit.run).ok, true);
  assert.equal(visit.run.phase, 'ride');
  F.fmTickRide(visit.run, 0.2);
  assert.equal(visit.run.phase, 'ride');
  const mid = F.fmRidePose(visit.run);
  assert.ok(Number.isFinite(mid.x) && Number.isFinite(mid.z));
  for (let i = 0; i < 50; i++) F.fmTickRide(visit.run, 0.2);
  assert.equal(visit.run.phase, 'farm');
  const startPose = F.fmRidePose({phase:'ride', rideT:0});
  assert.ok(Math.hypot(startPose.x - F.FM_BUS.x, startPose.z - F.FM_BUS.z) < 0.3);
  const endPose = F.fmRidePose({phase:'ride', rideT:F.FM_RIDE_T});
  assert.ok(Math.hypot(endPose.x - F.FM_ARRIVE.x, endPose.z - F.FM_ARRIVE.z) < 5);
  assert.ok(Math.hypot(F.FM_GUIDE.x - F.FM_ARRIVE.x, F.FM_GUIDE.z - F.FM_ARRIVE.z) > 8, 'Farmer Nettie stands clear of the arrival spot');
  assert.equal(F.FM_DEST_DZ, -560);
  assert.equal(F.FM_VIEW_FAR, 400);
  assert.ok(F.fmDestClearOfSchool(F.FM_ARRIVE.x, F.FM_ARRIVE.z), 'arrival is beyond school draw distance');
  ['FM_HOME_BUS','FM_GUIDE','FM_BARN','FM_WAGON'].forEach(k => assert.ok(F.fmDestClearOfSchool(F[k].x, F[k].z), k));
  F.FM_FEEDS.concat(F.FM_EGGS, F.FM_APPLES, F.FM_PUMPS).forEach(f => assert.ok(F.fmDestClearOfSchool(f.x, f.z), f.id));
  assert.ok(F.fmPathLen(F.FM_RIDE_PATH) > F.FM_VIEW_FAR, 'the bus ride covers more than the view distance');
  assert.equal(F.fmDestClearOfSchool(0, 18), false);

  let st = visit.state;
  const earlyHome = F.fmBoardHome(visit.run, st);
  assert.equal(earlyHome.ok, false);
  assert.equal(earlyHome.why, 'chores');

  F.FM_FEEDS.forEach(f => { const r = F.fmFeed(st, f.id); assert.equal(r.ok, true, f.id); st = r.state; });
  F.FM_EGGS.forEach(f => { const r = F.fmPickEgg(st, f.id); assert.equal(r.ok, true, f.id); st = r.state; });
  F.FM_APPLES.forEach(f => { const r = F.fmPickApple(st, f.id); assert.equal(r.ok, true, f.id); st = r.state; });
  F.FM_PUMPS.forEach(f => { const r = F.fmPickPump(st, f.id); assert.equal(r.ok, true, f.id); st = r.state; });
  assert.equal(F.fmFeed(st, 'hens').already, true);
  assert.equal(F.fmStartHay(visit.run, st).ok, true);
  assert.equal(visit.run.haying, true);
  let doneHay = false;
  for (let i = 0; i < 40; i++){
    const r = F.fmTickHay(visit.run, st, 0.2);
    st = r.state;
    if (r.done){ doneHay = true; break; }
  }
  assert.equal(doneHay, true);
  assert.equal(st.hay, true);
  assert.equal(F.fmAllDone(st), true);
  const homeHit = F.fmNear(F.FM_HOME_BUS.x, F.FM_HOME_BUS.z, st, visit.run);
  assert.equal(homeHit.kind, 'home');
  const done = F.fmBoardHome(visit.run, st);
  assert.equal(done.ok, true);
  assert.equal(done.coins, F.FM_REWARD);
  assert.equal(done.state.won, true);
  assert.equal(visit.run.phase, 'done');
  const twice = F.fmBoardHome({phase:'farm'}, done.state);
  assert.equal(twice.already, true);
  assert.equal(twice.coins, 0);
  assert.match(F.fmGoal(done.state, {phase:'done'}), /complete|Farm day/i);
});

test('Honeymeadow Farm is wired into the hub, reset list, controls, and weather skip', () => {
  assert.match(html, /id:'farm'/);
  assert.match(html, /function drawFarm/);
  assert.match(html, /function buildFarm\s*\(/);
  assert.match(html, /else if \(mode === 'farm'\) buildFarm\(\);/);
  assert.match(html, /id="fmBox"/);
  assert.match(html, /id="fmAct"/);
  assert.match(html, /rubloxFarm/);
  assert.match(html, /function farmStop/);
  assert.match(html, /Honeymeadow Farm/);
  assert.match(html, /Farmer Nettie/);
  assert.match(html, /farm: \{kb:/);
  assert.match(html, /WX_SKIP = \[[^\]]*'farm'[^\]]*\]/);
  assert.ok(/WX_SKIP = \[[^\]]*'farm', 'winter'\]/.test(html), 'farm sits in WX_SKIP immediately before winter');
  assert.match(html, /function fmHorizonLand/);
  assert.match(html, /function fmApplyZones/);
  assert.match(html, /FM_DEST_DZ/);
  assert.match(html, /lookBack\(\)/);
  assert.match(html, /mode === 'farm' \|\| mode === 'hunt' \|\| mode === 'elevator'\)\{ \/\/ pull the camera/);
  const g = R.resetGame('farm');
  assert.ok(g);
  assert.ok(g.keys.includes('rubloxFarm'));
  assert.doesNotMatch(html.slice(html.indexOf('function buildFarm'), html.indexOf('function buildFarm') + 20000), /blood|gore|kill the/i);
});
