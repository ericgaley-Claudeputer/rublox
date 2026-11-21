const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const F = require('../dev/fashion/fashion_show_logic.js');

describe('Fashion Show voting and solo judges', () => {
  test('you cannot vote for yourself, and solo walkers are just you', () => {
    assert.equal(F.fsCanRate('H', 'H'), false);
    assert.equal(F.fsCanRate('H', 'P2'), true);
    const self = F.fsCastRate({}, 'H', 'H', 5);
    assert.equal(self.ok, false);
    assert.equal(self.why, 'self');
    const ok = F.fsCastRate({}, 'H', 'P2', 4);
    assert.equal(ok.ok, true);
    assert.equal(ok.rates.H.P2, 4);
    assert.deepEqual(F.fsSoloWalkers('H'), ['H']);
    assert.equal(F.fsSoloWalkers('H').some(id => id === 'n0' || id === 'n1'), false);
    assert.equal(F.fsJudgePanel().length, 4);
    const score = F.fsSoloScore(0.9, 0.8, 0.8);
    assert.ok(score >= 3 && score <= 5);
  });

  test('optional fashion save fields default safely and solo shows count as judge shows', () => {
    const st = F.fsLoadProg({xp:10, shows:2, vip:true});
    assert.equal(st.xp, 10);
    assert.equal(st.shows, 2);
    assert.equal(st.vip, true);
    assert.equal(st.judgeShows, 0);
    const next = F.fsAfterSoloShow(st, 'Starlit Gala', 4.5);
    assert.equal(next.shows, 3);
    assert.equal(next.judgeShows, 1);
    assert.equal(next.lastTheme, 'Starlit Gala');
    assert.equal(next.best, 4.5);
  });

  test('the live Fashion Show uses a solo judge panel and blocks self votes', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'dev/fashion/fashion.js'), 'utf8');
    assert.match(src, /function fsRate\(n\)\{/);
    assert.match(src, /if \(!u \|\| u === fsUid\(\) \|\| n < 1 \|\| n > 5\) return false;/);
    assert.match(src, /else ord = \[fsUid\(\)\];/);
    assert.doesNotMatch(src, /else ord = \['H', \.\.\.FS_NPCS\.map/);
  });
});
