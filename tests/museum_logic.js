// GB-6: Brightwhistle Museum of Wonders field trip.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../dev/museum/museum_logic.js');
const R = require('../dev/reset/reset_logic.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('original museum: five exhibits (dino, gems, space, art), kid-friendly text', () => {
  assert.equal(M.MU_KEY, 'rubloxMuseum');
  const ids = M.MU_FINDS.map(f => f.id);
  for (const id of ['dino', 'gem', 'space', 'art']) assert.ok(ids.includes(id));
  M.MU_FINDS.forEach(f => {
    assert.ok(f.name && f.emoji && Number.isFinite(f.x) && Number.isFinite(f.z));
    assert.ok(M.muInHall(f.x, f.z), f.id + ' is inside the hall');
    assert.doesNotMatch(f.blurb, /blood|wound|gore|kill|dead/i);
  });
  assert.ok(M.muDestClearOfSchool(M.MU_HALL.x, M.MU_HALL.z));
  assert.equal(M.muInHall(M.MU_ARRIVE.x, M.MU_ARRIVE.z), false);
});

test('bus ride there, see every exhibit, ride home pays once', () => {
  const v = M.muNewVisit(null);
  assert.equal(v.run.phase, 'yard');
  assert.equal(M.muNear(M.MU_BUS.x, M.MU_BUS.z, v.state, v.run).kind, 'bus');
  assert.equal(M.muBoardBus(v.run).ok, true);
  assert.equal(M.muBoardBus(v.run).ok, false);
  for (let i = 0; i < 200 && v.run.phase === 'ride'; i++) M.muTickRide(v.run, 0.2);
  assert.equal(v.run.phase, 'hall');
  let st = v.state;
  assert.equal(M.muBoardHome(v.run, st).why, 'finds');
  for (const f of M.MU_FINDS){
    assert.equal(M.muNear(f.x, f.z, st, v.run).kind, 'find');
    const r = M.muPick(st, f.id); assert.equal(r.ok, true); st = r.state;
    assert.equal(M.muPick(st, f.id).why, 'have');
  }
  assert.equal(M.muAll(st), true);
  const home = M.muBoardHome(v.run, st);
  assert.equal(home.coins, M.MU_REWARD); st = home.state;
  assert.equal(v.run.phase, 'done');
  // a second trip still works but pays nothing for the ride home
  const v2 = M.muNewVisit(st);
  M.muBoardBus(v2.run); for (let i = 0; i < 200 && v2.run.phase === 'ride'; i++) M.muTickRide(v2.run, 0.2);
  const again = M.muBoardHome(v2.run, v2.state);
  assert.equal(again.ok, true); assert.equal(again.coins, 0); assert.equal(v2.run.phase, 'done');
});

test('owl-token scavenger hunt: each token pays once, plus a one-time bonus', () => {
  let st = M.muLoad(null), total = 0;
  for (const t of M.MU_TOKENS){
    const r = M.muTakeToken(st, t.id); assert.equal(r.ok, true); total += r.coins; st = r.state;
    assert.equal(M.muTakeToken(st, t.id).coins, 0);
  }
  assert.equal(total, M.MU_TOKENS.length * M.MU_TOKEN_COINS + M.MU_HUNT_BONUS);
  assert.equal(st.huntDone, true);
  const reload = M.muLoad(JSON.parse(JSON.stringify(st)));
  M.MU_TOKENS.forEach(t => assert.equal(M.muTakeToken(reload, t.id).coins, 0));
  assert.equal(M.muTakeToken(st, 'nope').why, 'unknown');
  M.MU_TOKENS.forEach(t => assert.ok(t.hint && t.hint.length > 5));
});

test('gift corner sells original items, once each, and needs enough coins', () => {
  assert.ok(M.MU_GIFTS.length >= 4);
  assert.equal(M.muGiftsOverlap(), false);
  const hats = M.MU_GIFTS.filter(g => g.kind === 'hat').map(g => g.val).sort();
  assert.deepEqual(hats, ['dinocap', 'starcap']);
  const g = M.MU_GIFTS[0];
  assert.equal(M.muBuyGift(null, g.id, g.price - 1).why, 'coins');
  const r = M.muBuyGift(null, g.id, g.price + 5);
  assert.equal(r.ok, true); assert.equal(r.coins, 5);
  assert.equal(M.muBuyGift(r.state, g.id, 999).why, 'have');
  assert.equal(M.muNear(g.x, g.z, r.state, {phase:'hall'}).kind, 'talk');
});

test('saves only use the new rubloxMuseum key and junk is cleaned', () => {
  const s = M.muLoad({found:['dino', 'dino', 'nope'], tokens:['owl-dino', 'x'], gifts:['zzz'], coins:-3});
  assert.deepEqual(s.found, ['dino']); assert.deepEqual(s.tokens, ['owl-dino']); assert.deepEqual(s.gifts, []); assert.equal(s.coins, 0);
  const g = R.resetGame('museum');
  assert.ok(g); assert.deepEqual(g.keys, ['rubloxMuseum']);
});

test('museum is wired into index.html with controls for keyboard, pad and touch', () => {
  assert.match(html, /\{id:'museum', name:'Brightwhistle Museum'/);
  assert.match(html, /else if \(mode === 'museum'\) buildMuseum\(\);/);
  assert.match(html, /id="muBox"/); assert.match(html, /id="muAct"/);
  assert.match(html, /museumStop\(/);
  assert.match(html, /museum: \{kb:/);
  assert.match(html, /WX_SKIP[^\n]*'museum'/);
  assert.match(html, /mode === 'aquarium' \|\| mode === 'museum'/);
  assert.match(html, /Brightwhistle Museum of Wonders/);
  for (const f of ['dev/museum/museum_logic.js', 'dev/museum/runtime.js']){
    const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8').replace(/\n$/, '');
    assert.ok(html.includes(src), f + ' is in index.html verbatim');
  }
});
