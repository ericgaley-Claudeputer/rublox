const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dev/elevator/elev_logic.js');

function runAt(survived, queued){
  const st = E.elevLoad(null);
  const started = E.elevStartRun(st, 1, false);
  const run = started.run;
  run.survived = survived | 0;
  run.phase = 'board';
  run.t = 0.01;
  if (queued) run.queued = queued;
  return run;
}

describe('Wobblevator floor votes', () => {
  test('solo play never starts a vote and still honors a ride ticket', () => {
    const run = runAt(5, 'lanternhall');
    assert.equal(E.elevVoteShouldStart(run, false), false);
    E.elevTick(run, 0.1, {mp:false});
    assert.equal(run.phase, 'ride');
    assert.equal(run.floor, 'lanternhall');
    assert.equal(run.queued, null);
  });

  test('multiplayer starts a vote every few floors or when a ticket is queued', () => {
    assert.equal(E.elevVoteShouldStart(runAt(0), true), false);
    assert.equal(E.elevVoteShouldStart(runAt(5), true), true);
    assert.equal(E.elevVoteShouldStart(runAt(4, 'lanternhall'), true), true);
    const run = runAt(5);
    E.elevTick(run, 0.1, {mp:true, rand: () => 0.2});
    assert.equal(run.phase, 'vote');
    assert.ok(run.vote.choices.length >= 2 && run.vote.choices.length <= 3);
    assert.ok(run.t > 0 && run.t <= E.ELEV_VOTE_T);
  });

  test('a ticket floor is always one of the vote choices and is kept if it loses', () => {
    const run = runAt(3, 'lanternhall');
    E.elevBeginVote(run, () => 0.4);
    assert.equal(run.vote.choices[0].id, 'lanternhall');
    assert.equal(run.vote.choices[0].ticket, true);
    assert.ok(run.vote.choices.length >= 2);
    E.elevCastVote(run, 'H', 1);
    E.elevCastVote(run, 'g1', 1);
    const win = E.elevTallyVote(run, () => 0);
    assert.equal(win.index, 1);
    assert.notEqual(win.id, 'lanternhall');
    E.elevFinishVote(run, () => 0);
    assert.equal(run.phase, 'ride');
    assert.equal(run.floor, win.id);
    assert.equal(run.queued, 'lanternhall', 'losing a vote must not spend the ticket');
  });

  test('votes tally, ties are random, and a winning ticket is spent', () => {
    const run = runAt(5, 'lanternhall');
    E.elevBeginVote(run, () => 0.1);
    E.elevCastVote(run, 'H', 0);
    E.elevCastVote(run, 'g1', 0);
    E.elevFinishVote(run, () => 0);
    assert.equal(run.floor, 'lanternhall');
    assert.equal(run.queued, null);

    const tie = runAt(5);
    E.elevBeginVote(tie, () => 0.3);
    E.elevCastVote(tie, 'H', 0);
    E.elevCastVote(tie, 'g1', 1);
    const a = E.elevTallyVote(tie, () => 0).index;
    const b = E.elevTallyVote(tie, () => 0.99).index;
    assert.ok(a === 0 || a === 1);
    assert.ok(b === 0 || b === 1);
    assert.notEqual(a, b, 'a tie should follow the random pick');
  });

  test('vote state syncs over the wire and keys 1-3 only apply during a vote', () => {
    const host = runAt(5);
    E.elevBeginVote(host, () => 0.2);
    E.elevCastVote(host, 'H', 1);
    const guest = runAt(0);
    E.elevApplyWire(guest, E.elevWire(host));
    assert.equal(guest.phase, 'vote');
    assert.equal(guest.vote.choices.length, host.vote.choices.length);
    assert.equal(guest.vote.votes.H, 1);
    const closed = E.elevCastVote(runAt(0), 'H', 1);
    assert.equal(closed.ok, false);
  });
});
