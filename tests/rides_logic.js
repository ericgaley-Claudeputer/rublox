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
    [[0,0,0],[1,0,1],[1,1,2],[0,1,3]].forEach(([x,z,r]) => {
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
    assert.ok(ids.has('slope') && ids.has('loop'));
  });

  test('slope and loop pieces connect like track and can be placed on the lot', () => {
    let s = R.ridesFresh();
    const slope = R.ridesPlace(s, 'slope', 4, 4, 0, 'me');
    assert.equal(slope.ok, true, slope.why);
    const loop = R.ridesPlace(slope.state, 'loop', 4, 5, 1, 'me');
    assert.equal(loop.ok, true, loop.why);
    assert.equal(R.ridesIsTrack('slope'), true);
    assert.equal(R.ridesIsTrack('loop'), true);
    assert.equal(R.ridesIsTrack('carousel'), false);
  });

  test('the track tutorial steps through straight, curve, slope, loop, closing, and riding, and can be skipped or replayed', () => {
    let s = R.ridesFresh();
    const start = R.ridesTutStart(s);
    assert.equal(start.step.id, 'hi');
    s = R.ridesTutNext(start.state).state;
    assert.equal(R.ridesTutStep(s).id, 'track');
    const placed = R.ridesPlace(s, 'track', 2, 2, 0, 'me');
    const note = R.ridesTutNote(placed.state, 'place', 'track');
    assert.equal(note.advanced, true);
    assert.equal(note.step.id, 'curve');
    const skip = R.ridesTutSkip(note.state);
    assert.equal(skip.state.tutDone, true);
    assert.equal(skip.state.tut.on, false);
    const replay = R.ridesTutStart(skip.state);
    assert.equal(replay.step.id, 'hi');
    assert.equal(replay.state.tut.on, true);
    let t = R.ridesTutStart(R.ridesFresh()).state;
    t.tut.step = R.RIDES_TUT.findIndex(x => x.id === 'close');
    [[0,0,0],[1,0,1],[1,1,2],[0,1,3]].forEach(([x,z,r]) => { t = R.ridesPlace(t, 'curve', x, z, r, 'me').state; });
    const closed = R.ridesTutNote(t, 'place', 'curve');
    assert.equal(closed.advanced, true);
    assert.equal(closed.step.id, 'ride');
    const boarded = R.ridesBoard(closed.state, closed.state.pieces[0].id, 'me');
    const rode = R.ridesTutNote(boarded.state, 'board', 'curve');
    assert.equal(rode.advanced, true);
    assert.equal(rode.step.id, 'done');
  });

  test('track ends snap to the previous open end, including slope height, and stands snap to the grid', () => {
    let s = R.ridesFresh();
    const a = R.ridesPlace(s, 'track', 5, 5, 0, 'me');
    assert.equal(a.ok, true);
    const snap = R.ridesSnap(a.state, 'track', 6, 5, 1);
    assert.equal(snap.snapped, true, 'should snap even if the hinted rotation is wrong');
    assert.equal(snap.gx, 6);
    assert.equal(snap.gz, 5);
    assert.equal(snap.rot % 2, 0);
    const placed = R.ridesPlace(a.state, 'track', 6, 5, 1, 'me', {snap:true});
    assert.equal(placed.ok, true);
    assert.equal(placed.piece.gx, 6);
    assert.ok(R.ridesLinked(placed.state, a.piece.id, placed.piece.id));
    const opens = R.ridesOpenPorts(placed.state);
    assert.equal(opens.length, 2, 'a two-piece run still has two open ends');

    let sl = R.ridesPlace(R.ridesFresh(), 'slope', 4, 4, 0, 'me');
    const high = R.ridesSnap(sl.state, 'track', 5, 4, 0);
    assert.equal(high.snapped, true);
    assert.equal(high.elev, 1);
    const low = R.ridesSnap(sl.state, 'track', 3, 4, 0);
    assert.equal(low.snapped, true);
    assert.equal(low.elev, 0);

    const stand = R.ridesSnap(R.ridesFresh(), 'carousel', 3, 3, 0);
    assert.equal(stand.snapped, false);
    assert.equal(stand.why, 'grid');
    assert.equal(stand.gx, 3);
  });

  test('a snapped square of curves is a closed loop and yields a smooth ride path', () => {
    let s = R.ridesFresh();
    s = R.ridesPlace(s, 'curve', 6, 6, 0, 'me').state;
    s = R.ridesPlace(s, 'curve', 7, 6, 0, 'me', {snap:true}).state;
    s = R.ridesPlace(s, 'curve', 7, 7, 0, 'me', {snap:true}).state;
    const last = R.ridesPlace(s, 'curve', 6, 7, 0, 'me', {snap:true});
    assert.equal(last.ok, true);
    assert.equal(last.closed, true);
    const loop = R.ridesCoasterLoop(last.state);
    assert.equal(loop.ok, true, loop.why);
    const path = R.ridesPathPoints(last.state);
    assert.equal(path.ok, true);
    assert.ok(path.points.length >= 16);
    const a = path.points[0], b = path.points[1];
    assert.ok(Math.hypot(a.x - b.x, a.z - b.z) < R.RIDES_CELL);
  });

  test('delete removes a piece from the save, undo restores it, and only the owner can delete', () => {
    let s = R.ridesPlace(R.ridesFresh(), 'drop', 2, 2, 0, 'me').state;
    const id = s.pieces[0].id;
    const denied = R.ridesRemove(s, id, 'friend');
    assert.equal(denied.why, 'owned');
    assert.equal(denied.state.pieces.length, 1);
    const gone = R.ridesRemove(s, id, 'me');
    assert.equal(gone.ok, true);
    assert.equal(gone.state.pieces.length, 0);
    assert.equal(R.ridesAt(gone.state, 2, 2), null);
    const back = R.ridesUndo(gone.state, 'me');
    assert.equal(back.ok, true);
    assert.equal(back.state.pieces.length, 1);
    assert.equal(back.state.pieces[0].kind, 'drop');
    const placed = R.ridesPlace(R.ridesFresh(), 'track', 4, 4, 0, 'me');
    const undone = R.ridesUndo(placed.state, 'me');
    assert.equal(undone.ok, true);
    assert.equal(undone.state.pieces.length, 0);
    const del = R.ridesSetDelete(undone.state, true);
    assert.equal(del.del, true);
  });

  test('a bigger lot still loads an old 8x8 save in the center, and optional fields stay compatible', () => {
    assert.equal(R.RIDES_GRID, 12);
    const loaded = R.ridesLoad({ver:1, pieces:[{id:1, kind:'track', gx:0, gz:0, rot:0, owner:'me'}]});
    assert.equal(loaded.lot, 12);
    assert.equal(loaded.pieces[0].gx, 2);
    assert.equal(loaded.pieces[0].gz, 2);
    assert.equal(loaded.pieces[0].elev, 0);
  });
});
