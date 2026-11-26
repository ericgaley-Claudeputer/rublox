// GB-6: Frostlane Star Show — five skating moves, three judge NPCs, pays once per show and only a few shows a day.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const W = require('../dev/winter/winter_logic.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function show(state, kinds, opts, day){
  const run = W.wnNewVisit(null, 0).run;
  run.day = day || '2026-11-26';
  assert.equal(W.wnShowStart(run, 1).ok, true);
  assert.equal(W.wnShowStart(run, 2).why, 'on');
  for (const k of kinds){ run.show.cool = 0; W.wnShowMove(run, k, opts); }
  return {run, r: W.wnShowJudge(run, state)};
}

test('three original judges, each with a favourite move', () => {
  assert.equal(W.WN_JUDGE_LIST.length, 3);
  const likes = W.WN_JUDGE_LIST.map(j => j.likes).sort();
  assert.deepEqual(likes, ['hop', 'spin', 'spiral']);
  W.WN_JUDGE_LIST.forEach(j => assert.match(j.name, /^Judge /));
  assert.deepEqual(Object.keys(W.WN_SHOW_KINDS).sort(), ['hop', 'spin', 'spiral']);
});

test('moves need the show on, a short cooldown, and stop after five', () => {
  const run = W.wnNewVisit(null, 0).run;
  assert.equal(W.wnShowMove(run, 'spin').why, 'show');
  W.wnShowStart(run, 1);
  assert.equal(W.wnShowMove(run, 'cartwheel').why, 'kind');
  assert.equal(W.wnShowMove(run, 'spin', {onIce:false}).why, 'ice');
  const a = W.wnShowMove(run, 'spin', {speed: 3});
  assert.equal(a.ok, true); assert.equal(a.pts, 4); // 3 + speed bonus
  assert.equal(W.wnShowMove(run, 'hop').why, 'wait');
  W.wnShowTick(run, 0.2); W.wnShowTick(run, 0.2); W.wnShowTick(run, 0.2); W.wnShowTick(run, 0.2);
  const b = W.wnShowMove(run, 'hop');
  assert.equal(b.pts, 4); // 3 + variety bonus
  for (let i = 0; i < 6; i++){ run.show.cool = 0; W.wnShowMove(run, i % 2 ? 'spin' : 'spiral'); }
  assert.equal(run.show.moves.length, W.WN_SHOW_MOVES);
  assert.equal(run.show.done, true);
});

test('the show times out, and quitting before any moves pays nothing', () => {
  const run = W.wnNewVisit(null, 0).run;
  W.wnShowStart(run, 1);
  for (let i = 0; i < W.WN_SHOW_T * 5 + 10; i++) W.wnShowTick(run, 0.2);
  assert.equal(run.show.done, true);
  const r = W.wnShowJudge(run, null);
  assert.equal(r.ok, false); assert.equal(r.why, 'moves');
  W.wnShowQuit(run);
  assert.equal(run.show.on, false);
});

test('judges score 1-10, variety and speed score higher, medals follow the total', () => {
  const low = W.wnShowScores([{k:'spiral', pts:2}]);
  low.forEach(j => assert.ok(j.score >= 1 && j.score <= 10));
  const best = W.wnShowScores(Array.from({length:5}, (_, i) => ({k:['spin','hop','spiral'][i % 3], pts:5})));
  best.forEach(j => assert.equal(j.score, 10));
  const lowSum = low.reduce((n, j) => n + j.score, 0), bestSum = best.reduce((n, j) => n + j.score, 0);
  assert.ok(bestSum > lowSum);
  const g = show(null, ['spin', 'hop', 'spiral', 'spin', 'hop'], {speed: 3});
  assert.equal(g.r.ok, true); assert.equal(g.r.medal.id, 'gold');
  const b = show(null, ['spiral'], {speed: 0});
  assert.equal(b.r.medal.id, 'bronze');
  assert.match(g.r.message, /judges hold up/);
});

test('a show pays once, and only three shows a day pay at all (PR #65 pattern)', () => {
  let st = W.wnLoad(null);
  const first = show(st, ['spin', 'hop', 'spiral', 'spin', 'hop'], {speed: 3});
  assert.ok(first.r.coins > 0);
  assert.equal(first.r.coins, 3 + Math.floor(first.r.sum / 5));
  st = first.r.state;
  // judging the same show again never pays
  const again = W.wnShowJudge(first.run, st);
  assert.equal(again.coins || 0, 0);
  const paid = [first.r.coins];
  for (let i = 0; i < 5; i++){ const s = show(st, ['spin', 'hop'], {speed: 2}); paid.push(s.r.coins); st = s.r.state; }
  assert.equal(paid.filter(c => c > 0).length, W.WN_SHOW_PAID_PER_DAY);
  assert.equal(paid.slice(3).every(c => c === 0), true);
  assert.equal(st.shows, 6);
  // next day pays again
  const tomorrow = show(st, ['spin'], {}, '2026-11-27');
  assert.ok(tomorrow.r.coins > 0);
  assert.equal(tomorrow.r.state.showPaid, 1);
});

test('show save keys are new and optional', () => {
  const old = W.wnLoad({coinsEarned: 5, skateLaps: 3});
  assert.equal(old.shows, 0); assert.equal(old.showBest, 0); assert.equal(old.showDay, ''); assert.equal(old.showPaid, 0);
  assert.equal(W.wnLoad({showBest: 999}).showBest, 30);
  assert.equal(W.wnLoad({showDay: 12}).showDay, '');
});

test('show is wired for keyboard, pad and touch in index.html', () => {
  assert.match(html, /function wnBuildJudges\(/);
  assert.match(html, /function wnStartShow\(/);
  assert.match(html, /wnShowDo\('spiral'\)/);
  assert.match(html, /Star Show: E spin, Space hop, Q or F swan spiral/);
});
