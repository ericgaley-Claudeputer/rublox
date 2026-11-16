'use strict';
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const Q = require('../dev/quests/quests_logic.js');

const DAY_A = '2026-11-16T10:00:00'; // local-ish
const DAY_B = '2026-11-17T10:00:00';
const DAY_C = '2026-11-18T10:00:00';

describe('daily quests', () => {
  test('picks 3 unique quests per local day, same seed for the same day', () => {
    const a = Q.qPickForDay(Q.qToday(DAY_A));
    const b = Q.qPickForDay(Q.qToday(DAY_A));
    assert.equal(a.length, 3);
    assert.deepEqual(a.map(q => q.id), b.map(q => q.id));
    const ids = new Set(a.map(q => q.id));
    assert.equal(ids.size, 3);
    for (const q of a){
      assert.equal(q.progress, 0);
      assert.equal(q.claimed, false);
      assert.ok(q.reward > 0 && q.goal >= 1);
    }
  });

  test('a new day draws a fresh set and clears in-progress claims', () => {
    let s = Q.qLoad(null, DAY_A);
    const firstIds = s.quests.map(q => q.id).join(',');
    const ev = s.quests[0].ev;
    s = Q.qNote(s, ev, 99, DAY_A).state;
    const claimed = Q.qClaim(s, s.quests[0].id, DAY_A);
    assert.equal(claimed.ok, true);
    const next = Q.qLoad(claimed.state, DAY_B);
    assert.equal(next.day, Q.qToday(DAY_B));
    assert.equal(next.quests.every(q => q.progress === 0 && !q.claimed), true);
    assert.equal(next.bonusClaimed, false);
    assert.equal(next.totalClaimed, 1);
    // Days may coincidentally share a quest id, but the day's set is re-drawn from the seed.
    assert.equal(next.quests.length, 3);
    const later = Q.qPickForDay(Q.qToday(DAY_C));
    assert.equal(later.length, 3);
    assert.ok(firstIds);
  });

  test('progress caps at the goal and claim pays only once', () => {
    let s = Q.qLoad(null, DAY_A);
    const q = s.quests[0];
    s = Q.qNote(s, q.ev, q.goal + 5, DAY_A).state;
    assert.equal(s.quests[0].progress, q.goal);
    const a = Q.qClaim(s, q.id, DAY_A);
    assert.equal(a.ok, true);
    assert.equal(a.coins, q.reward);
    const b = Q.qClaim(a.state, q.id, DAY_A);
    assert.equal(b.ok, false);
    assert.equal(b.coins, 0);
    const early = Q.qClaim(Q.qLoad(null, DAY_A), q.id, DAY_A);
    assert.equal(early.ok, false);
    assert.equal(early.why, 'progress');
  });

  test('all-three bonus and a 7-day streak', () => {
    function finishAll(state, now){
      let s = state;
      for (const q of s.quests){
        s = Q.qNote(s, q.ev, q.goal, now).state;
        const r = Q.qClaim(s, q.id, now);
        assert.equal(r.ok, true);
        s = r.state;
      }
      const bonus = Q.qClaimBonus(s, now);
      assert.equal(bonus.ok, true);
      assert.equal(bonus.coins, Q.Q_BONUS);
      const again = Q.qClaimBonus(bonus.state, now);
      assert.equal(again.ok, false);
      return bonus.state;
    }
    let s = Q.qLoad(null, DAY_A);
    s = finishAll(s, DAY_A);
    assert.equal(s.streak, 1);
    // Roll 6 more local midnights
    let t = new Date(DAY_A);
    for (let i = 1; i <= 6; i++){
      t = new Date(t.getTime() + 24 * 3600 * 1000);
      s = Q.qLoad(s, t);
      s = finishAll(s, t);
    }
    assert.equal(s.streak, 7);
    assert.equal(s.totalClaimed, 21);
  });

  test('missing a day resets the streak', () => {
    let s = Q.qLoad(null, DAY_A);
    for (const q of s.quests){
      s = Q.qNote(s, q.ev, q.goal, DAY_A).state;
      s = Q.qClaim(s, q.id, DAY_A).state;
    }
    assert.equal(s.streak, 1);
    s = Q.qLoad(s, DAY_C); // skipped DAY_B
    assert.equal(s.streak, 0);
  });

  test('corrupt or partial saves fall back safely and keep totals', () => {
    const s = Q.qLoad({ver: 99, day: 'nope', quests: [{id: '???'}], totalClaimed: 4, streak: -3}, DAY_A);
    assert.equal(s.quests.length, 3);
    assert.equal(s.totalClaimed, 4);
    assert.equal(s.streak, 0);
    const empty = Q.qLoad(null, DAY_A);
    assert.equal(empty.day, Q.qToday(DAY_A));
  });

  test('qView exposes claim / bonus flags', () => {
    let s = Q.qLoad(null, DAY_A);
    let v = Q.qView(s, DAY_A);
    assert.equal(v.done, 0);
    assert.equal(v.canBonus, false);
    s = Q.qNote(s, s.quests[0].ev, 99, DAY_A).state;
    s = Q.qClaim(s, s.quests[0].id, DAY_A).state;
    v = Q.qView(s, DAY_A);
    assert.equal(v.done, 1);
    assert.equal(v.quests[0].claimed, true);
  });
});
