const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const F = require(path.join(__dirname, '..', 'dev/fieldtrip/fieldtrip_logic.js'));

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Pebblebrook Field Trip rules: yard bus, nook finds, ride home, old saves load', () => {
  assert.equal(F.FT_KEY, 'rubloxFieldTrip');
  assert.equal(F.FT_FINDS.length, 5);
  F.FT_FINDS.forEach(f => {
    assert.ok(f.id && f.name && f.emoji && Number.isFinite(f.x) && Number.isFinite(f.z));
    assert.doesNotMatch(f.blurb, /blood|wound|gore|kill/i);
  });
  const fresh = F.ftFresh();
  assert.deepEqual(fresh.found, []);
  assert.equal(fresh.won, false);
  assert.deepEqual(F.ftLoad({found:['pebble','unknown']}).found, ['pebble']);
  const visit = F.ftNewVisit({found:[], visits:2, won:false});
  assert.deepEqual(visit.state.found, []);
  assert.equal(visit.state.visits, 3);
  assert.equal(visit.run.phase, 'yard');

  const bus = F.ftNear(F.FT_BUS.x, F.FT_BUS.z, visit.state, visit.run);
  assert.equal(bus.kind, 'bus');
  const talk = F.ftNear(F.FT_TEACHER.x, F.FT_TEACHER.z, visit.state, visit.run);
  assert.equal(talk.kind, 'talk');
  assert.match(talk.text, /Pebblebrook Nature Nook/);

  assert.equal(F.ftBoardBus(visit.run).ok, true);
  assert.equal(visit.run.phase, 'ride');
  F.ftTickRide(visit.run, 0.2);
  assert.equal(visit.run.phase, 'ride');
  const mid = F.ftRidePose(visit.run);
  assert.ok(Number.isFinite(mid.x) && Number.isFinite(mid.z));
  for (let i = 0; i < 50; i++) F.ftTickRide(visit.run, 0.2);
  assert.equal(visit.run.phase, 'nook');
  const startPose = F.ftRidePose({phase:'ride', rideT:0});
  assert.ok(Math.hypot(startPose.x - F.FT_BUS.x, startPose.z - F.FT_BUS.z) < 0.3);
  const endPose = F.ftRidePose({phase:'ride', rideT:F.FT_RIDE_T});
  assert.ok(Math.hypot(endPose.x - F.FT_ARRIVE.x, endPose.z - F.FT_ARRIVE.z) < 5);
  assert.ok(Math.hypot(F.FT_GUIDE.x - F.FT_ARRIVE.x, F.FT_GUIDE.z - F.FT_ARRIVE.z) > 8, 'Fern stands clear of the arrival spot');
  assert.equal(F.FT_DEST_DZ, -560);
  assert.equal(F.FT_VIEW_FAR, 400);
  assert.ok(F.ftDestClearOfSchool(F.FT_ARRIVE.x, F.FT_ARRIVE.z), 'arrival is beyond school draw distance');
  assert.ok(F.ftDestClearOfSchool(F.FT_NOOK.x, F.FT_NOOK.z));
  assert.ok(F.ftDestClearOfSchool(F.FT_HOME_BUS.x, F.FT_HOME_BUS.z));
  assert.ok(F.ftDestClearOfSchool(F.FT_GUIDE.x, F.FT_GUIDE.z));
  F.FT_FINDS.forEach(f => assert.ok(F.ftDestClearOfSchool(f.x, f.z), f.id + ' is beyond school draw distance'));
  assert.ok(F.ftPathLen(F.FT_RIDE_PATH) > F.FT_VIEW_FAR, 'the bus ride covers more than the view distance');
  assert.equal(F.ftDestClearOfSchool(0, 18), false);


  let st = visit.state;
  const earlyHome = F.ftBoardHome(visit.run, st);
  assert.equal(earlyHome.ok, false);
  assert.equal(earlyHome.why, 'finds');

  for (const f of F.FT_FINDS){
    const r = F.ftPick(st, f.id);
    assert.equal(r.ok, true, f.id);
    st = r.state;
  }
  assert.equal(F.ftAll(st), true);
  const again = F.ftPick(st, 'pebble');
  assert.equal(again.ok, false);
  const homeHit = F.ftNear(F.FT_HOME_BUS.x, F.FT_HOME_BUS.z, st, visit.run);
  assert.equal(homeHit.kind, 'home');
  const done = F.ftBoardHome(visit.run, st);
  assert.equal(done.ok, true);
  assert.equal(done.coins, F.FT_REWARD);
  assert.equal(done.state.won, true);
  assert.equal(visit.run.phase, 'done');
  const twice = F.ftBoardHome({phase:'nook'}, done.state);
  assert.equal(twice.already, true);
  assert.equal(twice.coins, 0);
  assert.match(F.ftGoal(done.state, {phase:'done'}), /complete/i);
});

test('Field trip is wired into the hub, reset list, and build dispatch', () => {
  assert.match(html, /id:'fieldtrip'/);
  assert.match(html, /function drawFieldTrip/);
  assert.match(html, /function buildFieldTrip\s*\(/);
  assert.match(html, /else if \(mode === 'fieldtrip'\) buildFieldTrip\(\);/);
  assert.match(html, /id="ftBox"/);
  assert.match(html, /id="ftAct"/);
  assert.match(html, /rubloxFieldTrip/);
  assert.match(html, /function fieldTripStop/);
  assert.match(html, /Pebblebrook Nature Nook/);
  assert.match(html, /Ms\. Bramble/);
  assert.match(html, /FT_ARRIVE/);
  assert.match(html, /ftRidePose/);
  assert.match(html, /ftApplyDaySky/);
  assert.match(html, /WX_SKIP = \[[^\]]*'fieldtrip'[^\]]*\]/);
  assert.match(html, /Yard bench/);
  // Bench sits in front of the spawn and in from the left edge, so the label is not clipped.
  assert.match(html, /ftLab\('🪑 Yard bench', -4\.6, 2\.3, 13\.4\)/);
  assert.doesNotMatch(html, /ftLab\('🪑 Yard bench', -8,/);
  assert.match(html, /function ftNookBuilding/);
  assert.match(html, /PointLight\('#ffe0b0'/);
  assert.doesNotMatch(html, /BoxGeometry\(14, 5\.2, 10\)/);
  assert.match(html, /MeshBasicMaterial\(\{color:'#f3d56a'\}\)/);
  assert.match(html, /inside\(\)\{ if \(!ft\)/);
  assert.match(html, /function ftApplyZones/);
  assert.match(html, /FT_DEST_DZ/);
  assert.match(html, /lookBack\(\)/);
  assert.doesNotMatch(html.slice(html.indexOf('function buildFieldTrip'), html.indexOf('function buildFieldTrip') + 14000), /blood|gore|kill the/i);
});
