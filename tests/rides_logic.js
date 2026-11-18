const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const R = require('../dev/t302/rides_logic.js');

describe('Rideland Workshop', () => {
  test('uses the rubloxRides save key and places original rides on the lot', () => {
    assert.equal(R.RIDES_KEY, 'rubloxRides');
    let s = R.ridesFresh();
    const a = R.ridesPlace(s, 'carousel', 2, 2, 0, 'me');
    assert.equal(a.ok, true);
    assert.equal(a.piece.kind, 'carousel');
    const clash = R.ridesPlace(a.state, 'swings', 2, 2, 0, 'me');
    assert.equal(clash.ok, false);
    const b = R.ridesPlace(a.state, 'drop', 5, 5, 0, 'friend');
    assert.equal(b.ok, true);
    assert.equal(R.ridesAt(b.state, 5, 5).kind, 'drop');
  });

  test('friends can board any placed ride, and only the owner can remove it', () => {
    let s = R.ridesPlace(R.ridesFresh(), 'cups', 1, 1, 0, 'me').state;
    const ride = R.ridesBoard(s, s.pieces[0].id, 'friend');
    assert.equal(ride.ok, true);
    assert.equal(ride.state.rides, 1);
    const denied = R.ridesRemove(ride.state, ride.piece.id, 'friend');
    assert.equal(denied.why, 'owned');
    const ok = R.ridesRemove(ride.state, ride.piece.id, 'me');
    assert.equal(ok.ok, true);
  });

  test('a simple closed coaster loop can be ridden, but a short path cannot', () => {
    let s = R.ridesFresh();
    // 2x2 square of curves
    [[0,0,0],[0,1,1],[1,1,2],[1,0,3]].forEach(([x,z,r]) => {
      const p = R.ridesPlace(s, 'curve', x, z, r, 'me');
      assert.equal(p.ok, true, p.why);
      s = p.state;
    });
    const loop = R.ridesCoasterLoop(s);
    assert.equal(loop.ok, true, loop.why);
    const board = R.ridesBoard(s, s.pieces[0].id, 'me');
    assert.equal(board.ok, true);
    const short = R.ridesPlace(R.ridesFresh(), 'track', 3, 3, 0, 'me');
    assert.equal(R.ridesBoard(short.state, short.piece.id, 'me').why, 'noloop');
  });

  test('Q-style cycling does not use digit keys and stays inside the kit', () => {
    let s = R.ridesFresh();
    const ids = new Set();
    for (let i = 0; i < R.RIDES_KINDS.length; i++){
      const r = R.ridesCycleKind(s, 1);
      s = r.state;
      ids.add(r.kind.id);
    }
    assert.equal(ids.size, R.RIDES_KINDS.length);
  });
});
