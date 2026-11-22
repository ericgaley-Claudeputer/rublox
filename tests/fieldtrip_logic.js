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
  for (let i = 0; i < 30; i++) F.ftTickRide(visit.run, 0.2);
  assert.equal(visit.run.phase, 'nook');

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
  assert.doesNotMatch(html.slice(html.indexOf('function buildFieldTrip'), html.indexOf('function buildFieldTrip') + 8000), /blood|gore|kill the/i);
});
