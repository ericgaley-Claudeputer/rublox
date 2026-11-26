// GB-7: 🌾 Little Ones Ring — farm babies at the Pet Talent Show. Coins once per show, grooming every show, a daily cap.
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const F = require('../dev/farmshow/farmshow_logic.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const nugget = {k: 'chick', n: 'Nugget', src: 'farm', c: 0};
const groomAll = run => { F.FB_GROOM.forEach(() => assert.equal(F.fbGroom(run).ok, true)); };
function showOnce(state, run, pet, now){
  groomAll(run);
  assert.equal(F.fbStart(run, pet, ['sit']).ok, true);
  const j = F.fbJudge(run, [0.9, 0.8]);
  return F.fbRecord(state, run, j, now);
}

describe('Little Ones Ring rules', () => {
  test('only adopted farm babies can enter, and every Honeymeadow baby kind has a signature trick', () => {
    const pets = [{k: 'dog', n: 'Rex'}, nugget, {k: 'lamb', n: 'Puff', src: 'farm'}, {k: 'kit', n: 'Velvet'}, {k: 'cat', n: 'Mimi'}];
    assert.deepEqual(F.fbBabies(pets).map(p => p.n), ['Nugget', 'Puff', 'Velvet']);
    const farm = require('../dev/farm/farm_logic.js');
    farm.FM_BABIES.forEach(b => { assert.ok(F.FB_KINDS.includes(b.kind), b.kind); assert.ok(F.FB_SIG[b.kind], 'signature for ' + b.kind); });
    assert.equal(F.fbStart(F.fbNewRun(), {k: 'dog', n: 'Rex'}, []).why, 'baby');
  });

  test('a show needs all three grooming steps first, and a new pick needs fresh grooming', () => {
    const run = F.fbNewRun();
    assert.equal(F.fbStart(run, nugget, []).why, 'groom');
    F.fbGroom(run); F.fbGroom(run);
    assert.equal(F.fbStart(run, nugget, []).need, 1);
    assert.equal(F.fbGroom(run).done, true);
    assert.equal(F.fbGroom(run).why, 'done');
    const babies = [nugget, {k: 'piglet', n: 'Puddle', src: 'farm'}];
    assert.equal(F.fbPick(run, babies, 1).pet.n, 'Puddle');
    assert.equal(run.groom.length, 0, 'switching babies clears the grooming');
  });

  test('the routine starts with the baby\u2019s signature trick and adds taught Pet Show tricks', () => {
    assert.deepEqual(F.fbRoutine(nugget, ['sit', 'bogus', 'sit', 'spin']), ['peep', 'sit', 'spin']);
    assert.equal(F.fbPoseOf('peep'), 'jump');
    assert.equal(F.fbPoseOf('roll'), 'roll');
    const run = F.fbNewRun(); groomAll(run); F.fbStart(run, nugget, ['sit', 'spin', 'jump']);
    const j = F.fbJudge(run, [1, 1, 1, 1]);
    assert.equal(j.judges.length, 3);
    j.judges.forEach(x => assert.ok(x.score >= 0 && x.score <= 10 && x.name.startsWith('Judge ')));
    assert.ok(F.FB_RIBBON.some(r => r.id === j.ribbon.id));
  });

  test('coins are paid exactly once per show — pressing again pays nothing', () => {
    const run = F.fbNewRun();
    const r1 = showOnce(F.fbFresh(), run, nugget, Date.UTC(2026, 10, 26, 15));
    assert.equal(r1.ok, true);
    assert.ok(r1.coins > 0 && r1.coins <= 15);
    // spam the finish / record again: no second payout, and no show is running
    for (let i = 0; i < 20; i++){
      const again = F.fbRecord(r1.state, run, F.fbJudge(run, [1]), Date.UTC(2026, 10, 26, 15));
      assert.equal(again.ok, false); assert.equal(again.coins, 0);
    }
    assert.equal(run.show, false);
    assert.equal(F.fbStart(run, nugget, []).why, 'groom', 'the next show needs a fresh grooming');
  });

  test('only the first three shows each day pay coins; ribbons still count, and a new day pays again', () => {
    let st = F.fbFresh(); const run = F.fbNewRun(); const day = Date.UTC(2026, 10, 26, 15);
    let paid = 0;
    for (let i = 0; i < 6; i++){ const r = showOnce(st, run, nugget, day); st = r.state; if (r.coins) paid++; }
    assert.equal(paid, F.FB_DAILY_PAID);
    assert.equal(st.shows, 6);
    assert.equal(Object.values(st.ribbons).reduce((a, b) => a + b, 0), 6);
    const next = showOnce(st, run, nugget, day + 86400000);
    assert.ok(next.coins > 0);
  });

  test('old or junk saves load safely', () => {
    const s = F.fbLoad({shows: -4, paidToday: 99, best: 42, ribbons: {gold: 2, fake: 9}, babies: {x: {shows: 2, best: 99}}, day: 123});
    assert.equal(s.shows, 0); assert.equal(s.paidToday, F.FB_DAILY_PAID); assert.equal(s.best, 10);
    assert.deepEqual(s.ribbons, {gold: 2}); assert.equal(s.babies.x.best, 10); assert.equal(s.day, '');
    assert.deepEqual(F.fbLoad(null), F.fbFresh());
  });
});

describe('Little Ones Ring is wired into the Pet Talent Show', () => {
  test('the page carries the same rules as the dev source', () => {
    assert.ok(html.includes(fs.readFileSync(path.join(__dirname, '..', 'dev/farmshow/farmshow_logic.js'), 'utf8').trim()));
  });
  test('pshowAct, psUpdate and the build hook use the ring, in the page and the dev runtime', () => {
    for (const src of [html, fs.readFileSync(path.join(__dirname, '..', 'dev/t297/runtime.js'), 'utf8')]){
      assert.match(src, /if \(psg\.farm && psg\.farm\.run\.show\) return true;\n    if \(psFarmAct\(\)\) return true;/);
      assert.match(src, /if \(psFarmUpdate\(dt\)\)\{/);
      assert.match(src, /try \{ psFarmBuild\(\); \} catch \(e\)\{ psg\.farm = null; \}/);
      assert.match(src, /const rec = FR\.fbRecord\(F\.sv, F\.run, judged, Date\.now\(\)\);/);
      assert.match(src, /if \(rec\.coins\) t297Pay\(rec\.coins, head\);/);
      // judges are real avatar NPCs facing the ring
      assert.match(src, /m = buildPlayer\(Object\.assign\(\{\}, typeof DEF !== 'undefined' \? DEF : \{\}, looks\[i\]\)\); m\.g\.position\.set\(x, 0\.05, z\); m\.g\.rotation\.y = Math\.atan2\(PSF_RING\.x - x, PSF_RING\.z - z\);/);
    }
  });
  test('the new save key is reset with the Pet Talent Show', () => {
    const R = require('../dev/reset/reset_logic.js');
    assert.ok(R.resetGame('petshow').keys.includes('rubloxFarmShow'));
  });
});
