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
    const snap = M.mnWire(run);
    const other = M.mnNewRun(null, 1).run;
    M.mnApplyWire(other, snap);
    assert.equal(other.escaped, true);
    assert.equal(other.key, true);
  });
});
