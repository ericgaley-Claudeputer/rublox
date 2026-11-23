const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const A = require(path.join(__dirname, '..', 'dev/aquarium/aquarium_logic.js'));
const R = require(path.join(__dirname, '..', 'dev/reset/reset_logic.js'));

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Tideglass Aquarium rules: coastal bus ride, five exhibits, touch pool, ride home', () => {
  assert.equal(A.AQ_KEY, 'rubloxAquarium');
  assert.equal(A.AQ_FINDS.length, 5);
  A.AQ_FINDS.forEach(f => {
    assert.ok(f.id && f.name && f.emoji && Number.isFinite(f.x) && Number.isFinite(f.z));
    assert.doesNotMatch(f.blurb, /blood|wound|gore|kill/i);
  });
  const fresh = A.aqFresh();
  assert.deepEqual(fresh.found, []);
  assert.equal(fresh.won, false);
  assert.equal(fresh.touched, false);
  assert.deepEqual(A.aqLoad({found:['jelly','unknown']}).found, ['jelly']);

  const visit = A.aqNewVisit({found:[], visits:1, won:false});
  assert.deepEqual(visit.state.found, []);
  assert.equal(visit.state.visits, 2);
  assert.equal(visit.run.phase, 'yard');

  const bus = A.aqNear(A.AQ_BUS.x, A.AQ_BUS.z, visit.state, visit.run);
  assert.equal(bus.kind, 'bus');
  const talk = A.aqNear(A.AQ_TEACHER.x, A.AQ_TEACHER.z, visit.state, visit.run);
  assert.equal(talk.kind, 'talk');
  assert.match(talk.text, /Tideglass Aquarium/);

  assert.equal(A.aqBoardBus(visit.run).ok, true);
  assert.equal(visit.run.phase, 'ride');
  A.aqTickRide(visit.run, 0.2);
  assert.equal(visit.run.phase, 'ride');
  const mid = A.aqRidePose(visit.run);
  assert.ok(Number.isFinite(mid.x) && Number.isFinite(mid.z));
  for (let i = 0; i < 50; i++) A.aqTickRide(visit.run, 0.2);
  assert.equal(visit.run.phase, 'hall');
  const startPose = A.aqRidePose({phase:'ride', rideT:0});
  assert.ok(Math.hypot(startPose.x - A.AQ_BUS.x, startPose.z - A.AQ_BUS.z) < 0.3);
  const endPose = A.aqRidePose({phase:'ride', rideT:A.AQ_RIDE_T});
  assert.ok(Math.hypot(endPose.x - A.AQ_ARRIVE.x, endPose.z - A.AQ_ARRIVE.z) < 5);
  assert.ok(Math.hypot(A.AQ_GUIDE.x - A.AQ_ARRIVE.x, A.AQ_GUIDE.z - A.AQ_ARRIVE.z) > 8, 'Marin stands clear of the arrival spot');

  let st = visit.state;
  const earlyHome = A.aqBoardHome(visit.run, st);
  assert.equal(earlyHome.ok, false);
  assert.equal(earlyHome.why, 'finds');

  const pool = A.aqNear(A.AQ_POOL.x, A.AQ_POOL.z, st, visit.run);
  assert.equal(pool.kind, 'pool');
  const touch = A.aqTouch(st);
  assert.equal(touch.ok, true);
  assert.equal(touch.coins, 4);
  st = touch.state;
  assert.equal(st.touched, true);
  const againTouch = A.aqTouch(st);
  assert.equal(againTouch.already, true);
  assert.equal(againTouch.coins, 0);

  for (const f of A.AQ_FINDS){
    const r = A.aqPick(st, f.id);
    assert.equal(r.ok, true, f.id);
    st = r.state;
  }
  assert.equal(A.aqAll(st), true);
  const again = A.aqPick(st, 'jelly');
  assert.equal(again.ok, false);
  const homeHit = A.aqNear(A.AQ_HOME_BUS.x, A.AQ_HOME_BUS.z, st, visit.run);
  assert.equal(homeHit.kind, 'home');
  const done = A.aqBoardHome(visit.run, st);
  assert.equal(done.ok, true);
  assert.equal(done.coins, A.AQ_REWARD);
  assert.equal(done.state.won, true);
  assert.equal(visit.run.phase, 'done');
  const twice = A.aqBoardHome({phase:'hall'}, done.state);
  assert.equal(twice.already, true);
  assert.equal(twice.coins, 0);
  assert.match(A.aqGoal(done.state, {phase:'done'}), /home|complete|visited/i);
});

test('Tideglass Aquarium is wired into the hub, reset list, controls, and weather skip', () => {
  assert.match(html, /id:'aquarium'/);
  assert.match(html, /function drawAquarium/);
  assert.match(html, /function buildAquarium\s*\(/);
  assert.match(html, /else if \(mode === 'aquarium'\) buildAquarium\(\);/);
  assert.match(html, /id="aqBox"/);
  assert.match(html, /id="aqAct"/);
  assert.match(html, /rubloxAquarium/);
  assert.match(html, /function aquariumStop/);
  assert.match(html, /Tideglass Aquarium/);
  assert.match(html, /Pebblecrab/);
  assert.match(html, /aquarium: \{kb:/);
  assert.match(html, /WX_SKIP = \[[^\]]*'aquarium'[^\]]*\]/);
  assert.match(html, /function aqHallBuilding/);
  assert.match(html, /facade window-tanks/);
  assert.match(html, /1\.7, 2\.0, -36\.0/);
  assert.match(html, /inside\(\)\{ if \(!aq\)/);
  const g = R.resetGame('aquarium');
  assert.ok(g);
  assert.ok(g.keys.includes('rubloxAquarium'));
  assert.doesNotMatch(html.slice(html.indexOf('function buildAquarium'), html.indexOf('function buildAquarium') + 9000), /blood|gore|kill the/i);
});
