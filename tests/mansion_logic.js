const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const M = require('../dev/mansion/mansion_logic.js');

describe('Mallowmist Manor', () => {
  test('uses a new save key and keeps old saves compatible', () => {
    assert.equal(M.MN_KEY, 'rubloxMansion');
    const s = M.mnLoad({lessScary: true, escapes: 2});
    assert.equal(s.lessScary, true);
    assert.equal(s.escapes, 2);
    assert.equal(M.mnLoad(null).escapes, 0);
    assert.equal(M.mnNoGore(), true);
  });

  test('puzzles open rooms in order: note, lever, pictures, key, hidden note', () => {
    const started = M.mnNewRun(null, 1000);
    const run = started.run;
    assert.equal(M.mnFlipLever(run).ok, false);
    assert.equal(M.mnReadNote(run, 1).ok, true);
    assert.equal(M.mnFlipLever(run).ok, true);
    assert.equal(M.mnCanEnter(run, 'parlor'), true);
    M.mnSetRoom(run, 'parlor');
    M.MN_PICTURE.forEach((tile, slot) => M.mnPlacePicture(run, slot, tile));
    assert.equal(run.pictureDone, true);
    assert.equal(M.mnCanEnter(run, 'kitchen'), true);
    assert.equal(M.mnTakeKey(run).ok, true);
    assert.equal(M.mnReadNote(run, 2).ok, true);
    assert.equal(M.mnCanEnter(run, 'attic'), true);
  });

  test('getting caught says everyone is okay and respawns at the last room', () => {
    const started = M.mnNewRun(null, 1000);
    const run = started.run;
    M.mnReadNote(run, 1);
    M.mnFlipLever(run);
    M.mnSetRoom(run, 'parlor');
    const r = M.mnCatch(run, started.state);
    assert.equal(r.ok, true);
    assert.match(r.message, /okay/i);
    assert.equal(run.room, 'parlor');
    assert.equal(r.spawn.z, M.mnRoom('parlor').spawn.z);
    assert.equal(r.state.caught, 1);
  });

  test('Nimble is slower and sees less when Less scary is on, and escape pays coins', () => {
    assert.ok(M.mnNimbleSpeed(true) < M.mnNimbleSpeed(false));
    assert.ok(M.mnNimbleSee(true) < M.mnNimbleSee(false));
    const started = M.mnNewRun({lessScary:true}, 1000);
    const run = started.run;
    assert.equal(run.lessScary, true);
    run.room = 'attic';
    run.key = true;
    const win = M.mnEscape(run, started.state, 5000);
    assert.equal(win.ok, true);
    assert.ok(win.coins >= 20);
    assert.equal(win.state.escapes, 1);
    const again = M.mnEscape(run, win.state, 6000);
    assert.equal(again.ok, true);
    assert.equal(again.already, true);
    assert.equal(again.coins, 0);
    assert.equal(again.state.escapes, 1);
    const snap = M.mnWire(run);
    const other = M.mnNewRun(null, 1).run;
    M.mnApplyWire(other, snap);
    assert.equal(other.escaped, true);
    assert.equal(other.key, true);
  });
});

  test('old mansion saves still load, and new rooms plus the secret attic are optional', () => {
    const s = M.mnLoad({lessScary: true, escapes: 2});
    assert.equal(s.escapes, 2);
    assert.equal(s.starCharm, undefined);
    assert.equal(s.secretAttic, undefined);
    const started = M.mnNewRun(s, 1000);
    const run = started.run;
    assert.equal(M.mnCanEnter(run, 'conservatory'), false);
    M.mnReadNote(run, 1);
    M.mnFlipLever(run);
    assert.equal(M.mnCanEnter(run, 'conservatory'), true);
    M.MN_FERNS.forEach(slot => {
      const r = M.mnWaterFern(run, slot);
      assert.equal(r.ok, true);
    });
    assert.equal(run.fernsDone, true);
    M.MN_PICTURE.forEach((tile, slot) => M.mnPlacePicture(run, slot, tile));
    assert.equal(M.mnTakeKey(run).ok, true);
    assert.equal(M.mnCanEnter(run, 'cellar'), true);
    assert.equal(M.mnCanEnter(run, 'chime'), true);
    assert.equal(M.mnReadScrap(run).ok, false);
    assert.equal(M.mnTurnCrank(run).ok, true);
    assert.match(M.mnReadScrap(run).text, /pull-string/i);
    assert.equal(M.mnPullString(run).ok, true);
    assert.equal(M.mnCanEnter(run, 'secret'), false);
    M.MN_MELODY.forEach(bell => M.mnPlayChime(run, bell));
    assert.equal(run.melodyDone, true);
    assert.equal(M.mnCanEnter(run, 'secret'), true);
    M.mnSetRoom(run, 'secret');
    M.MN_STARS.forEach((tile, slot) => M.mnPlaceStar(run, slot, tile));
    assert.equal(run.starDone, true);
    const reward = M.mnClaimSecret(run, started.state);
    assert.equal(reward.ok, true);
    assert.ok(reward.coins > 0);
    assert.equal(reward.state.starCharm, true);
    assert.equal(reward.state.moonLantern, true);
    assert.equal(reward.state.secretAttic, 1);
    assert.equal(reward.state.escapes, 2);
  });

  test('the secret attic Dustmoth is slower when Less scary is on, and a catch still says everyone is okay', () => {
    assert.ok(M.mnMothSpeed(true) < M.mnMothSpeed(false));
    assert.ok(M.mnMothSee(true) < M.mnMothSee(false));
    const started = M.mnNewRun({lessScary:true}, 1);
    const run = started.run;
    run.secretOpen = true;
    M.mnSetRoom(run, 'secret');
    const r = M.mnCatch(run, started.state);
    assert.match(r.message, /okay/i);
    assert.equal(run.room, 'secret');
    assert.equal(r.state.caught, 1);
  });
