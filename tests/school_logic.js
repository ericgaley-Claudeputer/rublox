'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const S = require(path.join(__dirname, '..', 'dev/school/school_logic.js'));
const Reset = require(path.join(__dirname, '..', 'dev/reset/reset_logic.js'));
const D = require(path.join(__dirname, '..', 'dev/doors/door_logic.js'));
const G = require(path.join(__dirname, '..', 'dev/gore/gore_logic.js'));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('old school saves load as a fresh Afterbell run, and getting caught is okay', () => {
  assert.equal(S.SC_KEY, 'rubloxSchool');
  const s = S.scLoad(null);
  assert.equal(s.lessScary, false);
  assert.equal(s.pass, false);
  assert.equal(s.won, false);
  assert.equal(S.scEveryoneOkay(), true);
  assert.equal(S.scFriendsOnly(), true);
  assert.equal(S.scNoFight(), true);
  assert.equal(S.SC_WARDEN.name, 'the Hush Warden');
});

test('locker, chalkboard, and hall-pass puzzles unlock a safe escape', () => {
  let st = S.scFresh();
  assert.equal(S.scSolveRiddle(st, 'bell').ok, false);
  st = S.scSolveRiddle(st, 'Book').state;
  assert.equal(st.riddle, true);
  assert.equal(S.scOpenLocker(st, '000').ok, false);
  st = S.scOpenLocker(st, '418').state;
  assert.equal(st.pass, true);
  assert.equal(S.scCanExit(st), true);
  const esc = S.scEscape(st);
  assert.equal(esc.ok, true);
  assert.ok(esc.reward > 0);
});

test('the Hush Warden never chases into a catch that is not okay, and Less scary is gentler', () => {
  const run = S.scFreshRun(S.scFresh());
  S.scTickWarden(run, 0.1, {px: run.wx, pz: run.wz, lessScary:false});
  assert.equal(run.caught, true);
  assert.equal(run.okay, true);
  assert.ok(run.respawn);
  const soft = S.scFreshRun(S.scFresh());
  S.scTickWarden(soft, 0.1, {px: soft.wx, pz: soft.wz, hidden:true, lessScary:true});
  assert.equal(soft.caught, false);
  assert.ok(S.scWardenSpeed(true) < S.scWardenSpeed(false));
  assert.ok(S.scCatchRadius(true) < S.scCatchRadius(false));
  const walk = S.scFreshRun(S.scFresh());
  const startZ = walk.wz;
  for (let i = 0; i < 40; i++) S.scTickWarden(walk, 0.1, {px: 40, pz: 40, lessScary:false});
  assert.ok(Math.hypot(walk.wx, walk.wz - startZ) > 1, 'the Warden should leave its first patrol post instead of standing still');
  const hallHides = S.SC_HIDES.filter(h => h.room === 'hall' || h.room === 'lobby');
  assert.ok(hallHides.length >= 2, 'the hall and lobby need hiding spots, because that is where the Warden can catch you');
  hallHides.forEach(h => {
    assert.ok(S.scNearHide(h.x, h.z), h.id);
    const r = S.scFreshRun(S.scFresh());
    r.wx = h.x; r.wz = h.z;
    S.scTickWarden(r, 0.1, {px: h.x, pz: h.z, hidden: !!S.scNearHide(h.x, h.z), lessScary:false});
    assert.equal(r.caught, false, h.id + ' should hide you from the Warden');
  });
  assert.match(html, /hall-plant/);
  assert.match(html, /🙈 Hide/);
});

test('school doorways fit a max player, Gore is environmental only, and the mode is wired', () => {
  S.SC_DOORS.forEach(d => {
    assert.ok(d.h >= D.DOOR_MIN_H && d.w >= D.DOOR_MIN_W, d.id);
    assert.equal(D.doorWalk(d, D.doorMaxPlayer()).ok, true, d.id);
  });
  assert.equal(G.goreAllowedIn('school'), true);
  assert.equal(G.goreDecalsFor('school', 'off').length, 0);
  const mild = G.goreDecalsFor('school', 'mild');
  const spooky = G.goreDecalsFor('school', 'spooky');
  assert.ok(mild.length > 0);
  assert.ok(spooky.length > mild.length);
  assert.equal(G.goreDecalsFor('school', 'spooky', {lessScary:true}).length, mild.length);
  assert.ok(Reset.RESET_GAMES.some(g => g.id === 'school' && g.keys.includes('rubloxSchool')));
  assert.match(html, /id:'school'/);
  assert.match(html, /function buildSchool\(/);
  assert.match(html, /function scUpdate\(/);
  assert.match(html, /function schoolStop\(/);
  assert.match(html, /Afterbell School/);
  assert.match(html, /id="t302LessBtn"|id="scLessBtn"/);
  assert.match(html, /rubloxSchool/);
});
