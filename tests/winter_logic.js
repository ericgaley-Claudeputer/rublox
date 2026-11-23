const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const W = require('../dev/winter/winter_logic.js');
const R = require('../dev/reset/reset_logic.js');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('Pinebell Village', () => {
  test('uses a new rubloxWinter save key and keeps other saves untouched', () => {
    assert.equal(W.WN_KEY, 'rubloxWinter');
    const s = W.wnLoad(null);
    assert.equal(s.sledRuns, 0);
    const keep = W.wnLoad({coinsEarned: 12, sledBest: 7.5});
    assert.equal(keep.coinsEarned, 12);
    assert.equal(keep.sledBest, 7.5);
    const g = R.resetGame('winter');
    assert.ok(g);
    assert.ok(g.keys.includes('rubloxWinter'));
    assert.equal(g.name, 'Pinebell Village');
  });

  test('a timed sled run can be steered, jumped, and cashed in for coins', () => {
    const started = W.wnNewVisit(null, 1000);
    let run = started.run;
    assert.equal(W.wnSledStart(run, 1000).ok, true);
    W.wnSledSteer(run, 1, 0.05);
    assert.ok(run.sled.yaw > 0);
    assert.equal(W.wnSledJump(run).ok, true);
    for (let i = 0; i < 200 && !run.sled.done; i++) W.wnSledTick(run, 0.08);
    assert.equal(run.sled.done, true);
    const fin = W.wnSledFinish(run, started.state);
    assert.equal(fin.ok, true);
    assert.ok(fin.coins > 0);
    assert.equal(fin.state.sledRuns, 1);
    assert.ok(fin.state.sledBest > 0);
  });

  test('snowball fights only work against real players, and practice posts never pretend to be rivals', () => {
    const started = W.wnNewVisit(null, 1);
    const run = started.run;
    const npc = W.wnThrowSnowball(run, started.state, 'p1', 'npc-bot', [{id:'p1'}, {id:'npc-bot', npc:true}]);
    assert.equal(npc.ok, false);
    assert.equal(npc.why, 'npc');
    const prac = W.wnThrowSnowball(run, started.state, 'p1', 'practice', [{id:'p1'}]);
    assert.equal(prac.ok, true);
    assert.equal(prac.fight, false);
    run.snowball.cool = 0;
    const hit = W.wnThrowSnowball(run, started.state, 'p1', 'p2', [{id:'p1', name:'Tessa'}, {id:'p2', name:'Rio'}]);
    assert.equal(hit.ok, true);
    assert.equal(hit.fight, true);
    assert.ok(hit.coins > 0);
    const race = W.wnSledRace(
      [{id:'p1', time:8.2}, {id:'npc-1', time:3, npc:true}, {id:'p2', time:7.4}],
      [{id:'p1'}, {id:'p2'}, {id:'npc-1', npc:true}]
    );
    assert.equal(race.ok, true);
    assert.equal(race.winner.id, 'p2');
    assert.equal(race.ranked.every(e => !e.npc), true);
  });

  test('snowman parts, skating laps, and the cocoa shop all earn coins', () => {
    const started = W.wnNewVisit(null, 1);
    let run = started.run;
    let state = started.state;
    W.WN_SNOWMAN.forEach(part => {
      const r = W.wnAddSnowmanPart(run, part);
      assert.equal(r.ok, true);
    });
    const pal = W.wnFinishSnowman(run, state);
    assert.equal(pal.ok, true);
    assert.ok(pal.coins > 0);
    state = pal.state;
    W.wnSkateStart(run);
    // spin two laps
    for (let i = 0; i < 80; i++){
      const a = (i / 10) * Math.PI;
      W.wnSkateTick(run, Math.cos(a), Math.sin(a), 0.05);
    }
    assert.ok(run.skate.laps >= 1);
    const laps = W.wnSkateBank(run, state);
    assert.equal(laps.ok, true);
    state = laps.state;
    const mug = W.wnBuyCocoa(state, 20);
    assert.equal(mug.ok, true);
    assert.equal(mug.coins, 15);
    const served = W.wnServeCocoa(run, mug.state);
    assert.equal(served.ok, true);
    assert.ok(served.coins > 0);
    assert.ok(served.state.cocoaServed >= 1);
  });

  test('Snugmug Cart sells topped cocoa and a warmth bonus without breaking Mugsy\'s shop', () => {
    const started = W.wnNewVisit(null, 1);
    const poor = W.wnSnugBuy(started.state, 2, 'mallow');
    assert.equal(poor.ok, false);
    assert.equal(poor.why, 'coins');
    const mug = W.wnBuyCocoa(started.state, 20);
    assert.equal(mug.ok, true);
    const buy = W.wnSnugBuy(mug.state, mug.coins, 'peppermint');
    assert.equal(buy.ok, true);
    assert.equal(buy.coins, mug.coins - W.WN_SNUG_COST);
    assert.ok(buy.warm > 14);
    assert.equal(buy.topping.id, 'peppermint');
    assert.equal(buy.state.snugBought, 1);
    assert.ok(buy.state.snugToppings.includes('peppermint'));
    const served = W.wnSnugServe(started.run, buy.state, 'peppermint');
    assert.equal(served.ok, true);
    assert.equal(served.coins, 3);
    assert.equal(served.state.snugServed, 1);
    assert.match(served.message, /skater/i);
    assert.equal(W.WN_SNUG.name, 'Snugmug Cart');
  });

  test('aimed snowballs hit real players or practice targets, never fake player bots', () => {
    const started = W.wnNewVisit(null, 1);
    const run = started.run;
    const can = W.WN_TARGETS.find(t => t.id === 'can-1');
    const atCan = W.wnThrowAimed(run, started.state, 'p1', {x:can.x, z:can.z - 4}, {x:0, z:1}, [{id:'p1'}], W.WN_TARGETS);
    assert.equal(atCan.ok, true);
    assert.equal(atCan.why, 'target');
    assert.equal(atCan.fight, false);
    assert.equal(atCan.giggle, true);
    assert.equal(atCan.coins, 1);
    assert.match(atCan.message, /Poof|giggle/i);
    assert.doesNotMatch(atCan.message, /hurt|wound|blood/i);
    assert.equal(run.snowball.targetHits, 1);
    const cool = W.wnThrowAimed(run, atCan.state, 'p1', {x:can.x, z:can.z - 4}, {x:0, z:1}, [{id:'p1'}], W.WN_TARGETS);
    assert.equal(cool.ok, false);
    assert.equal(cool.why, 'cool');
    run.snowball.cool = 0;
    const miss = W.wnThrowAimed(run, atCan.state, 'p1', {x:0, z:0}, {x:0, z:-1}, [{id:'p1'}], W.WN_TARGETS);
    assert.equal(miss.ok, true);
    assert.equal(miss.why, 'miss');
    assert.equal(miss.giggle, false);
    run.snowball.cool = 0;
    const friend = W.wnThrowAimed(run, miss.state, 'p1', {x:0, z:0}, {x:0, z:-1}, [{id:'p1', name:'Tessa', x:0, z:0}, {id:'p2', name:'Rio', x:0, z:-5}], W.WN_TARGETS);
    assert.equal(friend.ok, true);
    assert.equal(friend.fight, true);
    assert.equal(friend.why, 'hit');
    assert.equal(friend.giggle, true);
    assert.equal(friend.state.snowHits, 1);
    assert.match(friend.message, /giggle/i);
    run.snowball.cool = 0;
    const npc = W.wnThrowAimed(run, friend.state, 'p1', {x:0, z:0}, {x:1, z:0}, [{id:'p1', x:0, z:0}, {id:'npc-bot', npc:true, name:'Bot', x:4, z:0}], []);
    assert.equal(npc.ok, true);
    assert.equal(npc.why, 'miss');
    assert.equal(npc.fight, false);
  });

  test('the winter village is wired as a playable game and listed under Reset a game', () => {
    assert.match(html, /id:'winter'/);
    assert.match(html, /Pinebell Village/);
    assert.match(html, /rubloxWinter/);
    assert.match(html, /function drawWinter\(/);
    assert.match(html, /function buildWinter\(/);
    assert.match(html, /function wnUpdate\(/);
    assert.match(html, /'winter'/);
    assert.match(html, /id="wnBox"/);
    assert.match(html, /Snugmug Cart/);
    assert.match(html, /wnThrowAimed/);
    assert.match(html, /id="wnSnowBtn"/);
    assert.match(html, /id="wnTopBtn"/);
  });
});
