'use strict';
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const L = require('../dev/board/board_logic.js');

describe('leaderboards', () => {
  test('snapshots personal bests from existing saves without rewriting them', () => {
    const saves = {
      tower: {best: 42, wins: 2},
      obby: {done: {1:1, 2:1, 5:1}, best: {1: 12.4, 2: 20, 5: 9.5}},
      race: {best: {animal: 33.2, kart: 28.1}},
      splash: {best: {1: 40.5, 2: 55}},
      lava: 18,
      nds: 7,
      quests: {streak: 4},
      lantern: {tickets: 15},
      season: {best: {toss: 11, sled: 16.2}}
    };
    const snap = L.lbSnapshot(saves);
    assert.equal(snap['tower-best'], 42);
    assert.equal(snap['obby-done'], 3);
    assert.equal(snap['obby-time'], 9.5);
    assert.equal(snap['race-best'], 28.1);
    assert.equal(snap['splash-best'], 40.5);
    assert.equal(snap['lava-best'], 18);
    assert.equal(snap['nds-best'], 7);
    assert.equal(snap['quest-streak'], 4);
    assert.equal(snap['lh-tickets'], 15);
    assert.equal(snap['snow-toss'], 11);
    assert.equal(snap['snow-sled'], 16.2);
    assert.equal(saves.tower.best, 42); // source unchanged
    const view = L.lbView(snap);
    assert.ok(view.length >= 10);
    assert.ok(view.every(r => r.name && r.emoji && r.text !== '—'));
  });

  test('records a new optional fastest tower win without dropping a slower later time', () => {
    let s = L.lbLoad(null);
    s = L.lbNote(s, 'tower-time', 54.2).state;
    const worse = L.lbNote(s, 'tower-time', 80);
    assert.equal(worse.better, false);
    assert.equal(worse.state.best['tower-time'], 54.2);
    const better = L.lbNote(s, 'tower-time', 40);
    assert.equal(better.better, true);
    assert.equal(better.state.best['tower-time'], 40);
  });

  test('room board ranks real players only, using in-game names and no free-text fields', () => {
    const room = [
      {uid: 'me', name: 'Tessa', scores: {'tower-best': 20, 'obby-done': 5}},
      {uid: 'g1', name: 'Sam', scores: {'tower-best': 35, 'obby-done': 3}},
      {uid: 'g2', name: 'Riley', scores: {'obby-done': 9}}
    ];
    const tower = L.lbRoomTable(room, 'tower-best');
    assert.equal(tower[0].name, 'Sam');
    assert.equal(tower[0].rank, 1);
    assert.equal(tower[1].name, 'Tessa');
    assert.equal(tower.length, 2); // Riley has no tower score
    const times = L.lbRoomTable([
      {uid: 'a', name: 'Ann', scores: {'snow-sled': 22}},
      {uid: 'b', name: 'Bo', scores: {'snow-sled': 15.5}}
    ], 'snow-sled');
    assert.equal(times[0].name, 'Bo');
    const keys = Object.keys(times[0]).sort();
    assert.ok(keys.every(k => ['uid','name','value','rank','text'].includes(k)));
    const wire = L.lbWire({'tower-best': 3, junk: 1, 'not-a-row': 9});
    assert.equal(wire['tower-best'], 3);
    assert.equal(wire.junk, undefined);
  });

  test('corrupt board saves fall back safely', () => {
    const s = L.lbLoad({ver: 99, best: {oops: 'nope', 'tower-best': 8}, name: 12});
    assert.equal(s.best['tower-best'], 8);
    assert.equal(s.best.oops, undefined);
    assert.equal(s.name, '');
  });
});
