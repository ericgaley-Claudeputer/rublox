const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const M = require('../dev/mermaid/mermaid_logic.js');
const R = require('../dev/reset/reset_logic.js');

describe('Glimmergill Cove mermaid town', () => {
  test('new save key rubloxMermaid is on Reset a game and starts empty', () => {
    assert.equal(M.MM_KEY, 'rubloxMermaid');
    const g = R.resetGame('mermaid');
    assert.ok(g);
    assert.equal(g.name, 'Glimmergill Cove');
    assert.deepEqual(g.keys, ['rubloxMermaid']);
    const st = M.mmLoad({visits:2});
    assert.equal(st.visits, 2);
    assert.equal(st.pearls, 0);
    assert.equal(st.tail, 'teal');
    assert.deepEqual(st.found, []);
    assert.equal(M.mmNoMonsters(), true);
    assert.equal(M.MM_TAILS.length >= 6, true);
  });

  test('you can swim up and down, ride a gentle current, and stay in the water column', () => {
    const run = M.mmNewVisit(null).run;
    run.y = 2;
    run.vy = 0;
    const up = M.mmSwimTick(run, {up:1, down:0, x:0, z:0}, 0.1);
    assert.ok(up.run.y > 2);
    const high = M.mmSwimTick({y:15.9, vy:4}, {up:1, down:0}, 0.2);
    assert.ok(high.run.y <= M.MM_Y_MAX);
    const cur = M.mmCurrentAt(0, 3, -28);
    assert.ok(cur);
    const lift = M.mmSwimTick({y:2, vy:0}, {up:0, down:0, x:0, z:-28}, 0.2);
    assert.equal(lift.current, 'garden-lift');
    assert.ok(lift.run.y > 2);
  });

  test('shells, a coral home, sea-pets, and the pearl shop all stay cozy', () => {
    let state = M.mmFresh();
    const visit = M.mmNewVisit(state);
    const got = M.mmCollectShell(visit.state, visit.run, 'swirl');
    assert.equal(got.ok, true);
    state = got.state;
    assert.equal(state.shells, 1);
    assert.ok(state.pearls >= 2);
    state.pearls = 40;
    const tail = M.mmBuy(state, 0, 'tail-pink');
    assert.equal(tail.ok, true);
    state = tail.state;
    assert.equal(state.tail, 'pink');
    const decor = M.mmBuy(state, 0, 'lantern');
    assert.equal(decor.ok, true);
    state = decor.state;
    assert.ok(state.decor.includes('lantern'));
    const treat = M.mmBuy(state, 0, 'treat');
    assert.equal(treat.ok, true);
    state = treat.state;
    const pal = M.mmBefriend(state, 'jellipop');
    assert.equal(pal.ok, true);
    assert.ok(pal.state.pals.includes('jellipop'));
    assert.match(pal.message, /Jellipop/);
    assert.equal(M.mmWalkable(0, 0), true);
    assert.equal(M.mmWalkable(0, -28), true);
    assert.equal(M.mmWalkable(80, 80), false);
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.match(html, /rubloxMermaid/);
    assert.match(html, /Glimmergill Cove/);
  });
});
