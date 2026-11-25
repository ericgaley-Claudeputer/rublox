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
  assert.equal(A.AQ_DEST_DZ, -560);
  assert.equal(A.AQ_VIEW_FAR, 400);
  assert.ok(A.aqDestClearOfSchool(A.AQ_ARRIVE.x, A.AQ_ARRIVE.z), 'arrival is beyond school draw distance');
  assert.ok(A.aqDestClearOfSchool(A.AQ_HALL.x, A.AQ_HALL.z));
  assert.ok(A.aqDestClearOfSchool(A.AQ_HOME_BUS.x, A.AQ_HOME_BUS.z));
  assert.ok(A.aqDestClearOfSchool(A.AQ_GUIDE.x, A.AQ_GUIDE.z));
  assert.ok(A.aqDestClearOfSchool(A.AQ_POOL.x, A.AQ_POOL.z));
  A.AQ_FINDS.forEach(f => assert.ok(A.aqDestClearOfSchool(f.x, f.z), f.id + ' is beyond school draw distance'));
  let rideLen = 0;
  const path = A.AQ_RIDE_PATH;
  for (let i = 0; i < path.length - 1; i++) rideLen += Math.hypot(path[i+1].x - path[i].x, path[i+1].z - path[i].z);
  assert.ok(rideLen > A.AQ_VIEW_FAR, 'the coastal ride covers more than the view distance');
  assert.equal(A.aqDestClearOfSchool(0, 18), false);


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
  assert.match(html, /function aqApplyZones/);
  assert.match(html, /AQ_DEST_DZ/);
  assert.match(html, /lookBack\(\)/);
  assert.match(html, /function aqHorizonLand/);
  assert.match(html, /function aqGiftShop/);
  assert.match(html, /Tideglass Gift Nook/);
  assert.match(html, /hat-jellycap/);
  assert.match(html, /hat-tidecap/);
  assert.match(html, /land: true/);
  const g = R.resetGame('aquarium');
  assert.ok(g);
  assert.ok(g.keys.includes('rubloxAquarium'));
  assert.doesNotMatch(html.slice(html.indexOf('function buildAquarium'), html.indexOf('function buildAquarium') + 20000), /blood|gore|kill the/i);
});

test('Tideglass Gift Nook sells original souvenirs with optional gift saves', () => {
  const fresh = A.aqFresh();
  assert.deepEqual(fresh.gifts, []);
  const loaded = A.aqLoad({found:['jelly'], gifts:['jelly-plush','nope']});
  assert.deepEqual(loaded.found, ['jelly']);
  assert.deepEqual(loaded.gifts, ['jelly-plush']);
  assert.ok(A.AQ_SHOP && Number.isFinite(A.AQ_SHOP.x));
  assert.ok(A.aqDestClearOfSchool(A.AQ_SHOP.x, A.AQ_SHOP.z));
  A.AQ_GIFTS.forEach(g => {
    assert.ok(g.id && g.name && Number.isFinite(g.price) && g.price > 0, g.id);
    assert.doesNotMatch(g.name, /disney|pokemon|barbie|mario|nintendo/i);
    assert.ok(A.aqDestClearOfSchool(g.x, g.z), g.id + ' is beyond school draw distance');
  });
  const hats = A.AQ_GIFTS.filter(g => g.kind === 'hat');
  assert.ok(hats.length >= 2);
  hats.forEach(g => assert.ok(g.val && g.slot === 'hat'));
  const broke = A.aqBuyGift(fresh, 'jelly-plush', 0);
  assert.equal(broke.ok, false);
  assert.equal(broke.why, 'coins');
  const buy = A.aqBuyGift(fresh, 'jelly-plush', 40);
  assert.equal(buy.ok, true);
  assert.equal(buy.coins, 40 - A.aqGift('jelly-plush').price);
  assert.ok(A.aqHasGift(buy.state, 'jelly-plush'));
  const again = A.aqBuyGift(buy.state, 'jelly-plush', 99);
  assert.equal(again.already, true);
  const hat = A.aqBuyGift(buy.state, 'hat-jellycap', 80);
  assert.equal(hat.ok, true);
  assert.equal(hat.item.kind, 'hat');
  assert.equal(hat.item.val, 'jellycap');
  const visit = A.aqNewVisit(hat.state);
  visit.run.phase = 'hall';
  const nearShop = A.aqNear(A.AQ_SHOP.x, A.AQ_SHOP.z, hat.state, visit.run);
  assert.equal(nearShop.kind, 'talk');
  const stand = A.AQ_GIFTS.find(g => g.id === 'turtle-plush');
  const nearStand = A.aqNear(stand.x, stand.z, hat.state, visit.run);
  assert.equal(nearStand.kind, 'gift');
});

test('Tideglass Gift Nook price tags do not overlap, even in the aisle', () => {
  assert.equal(A.aqGiftsOverlap(2.4), false);
  const labs = A.AQ_GIFTS.map(g => A.aqGiftLabel(g));
  labs.forEach(l => {
    assert.ok(Number.isFinite(l.x) && Number.isFinite(l.z));
    assert.ok(Math.abs(l.x - 14) >= 2.2, 'tags sit on the side walls, not in the aisle');
  });
  assert.match(html, /aqGiftLabel/);
});
