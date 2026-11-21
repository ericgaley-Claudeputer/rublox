const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const W = require('../dev/winter/winter_logic.js');

describe('Pinebell holiday lights and gift wrap', () => {
  test('old winter saves keep their sled stats and new fields default to zero', () => {
    const st = W.wnLoad({coinsEarned:9, sledBest:12.5, snowmen:2});
    assert.equal(st.coinsEarned, 9);
    assert.equal(st.sledBest, 12.5);
    assert.equal(st.snowmen, 2);
    assert.equal(st.lights, 0);
    assert.equal(st.wraps, 0);
    assert.equal(st.wrapBest, 0);
    assert.deepEqual(st.ribbons, []);
  });

  test('lights hang on house and tree slots and night mode shows them off', () => {
    let state = W.wnFresh();
    const visit = W.wnNewVisit(state);
    const run = visit.run;
    assert.equal(run.night, false);
    const hung = W.wnPlaceLight(state, run, 'cottage-a');
    assert.equal(hung.ok, true);
    state = hung.state;
    assert.equal(run.lights.includes('cottage-a'), true);
    assert.equal(W.wnPlaceLight(state, run, 'cottage-a').why, 'has');
    W.wnPlaceLight(state, run, 'tree-a');
    const night = W.wnSetNight(run, true);
    assert.equal(night.night, true);
    const show = W.wnShowLights(state, run);
    assert.equal(show.ok, true);
    assert.equal(show.state.nightShows, 1);
    assert.ok(show.message.toLowerCase().includes('glow'));
  });

  test('Ribbon Rue scores a finished wrap, awards ribbons, and real players can compete', () => {
    let state = W.wnFresh();
    const run = W.wnNewVisit(state).run;
    assert.equal(W.wnWrapJudge(state, run).ok, false);
    W.wnWrapOpen(run, false);
    assert.equal(W.wnWrapPick(run, 'ribbon', 'red').ok, false);
    assert.equal(W.wnWrapPick(run, 'paper', 'pine').ok, true);
    assert.equal(W.wnWrapPick(run, 'ribbon', 'red').ok, true);
    assert.equal(W.wnWrapPick(run, 'bow', 'classic').ok, true);
    assert.equal(W.wnWrapPick(run, 'tag', 'joy').ok, true);
    const judged = W.wnWrapJudge(state, run);
    assert.equal(judged.ok, true);
    assert.equal(judged.judge.name, 'Ribbon Rue');
    assert.ok(judged.score >= 70);
    assert.ok(judged.ribbon);
    assert.ok(judged.coins >= 4);
    assert.equal(judged.state.wraps, 1);
    assert.equal(judged.state.wrapBest, judged.score);
    const vs = W.wnWrapCompete([
      {id:'H', name:'You', score:80},
      {id:'P2', name:'Pal', score:92},
      {id:'npc', name:'Bot', score:99, npc:true}
    ], 80);
    assert.equal(vs.mode, 'compete');
    assert.equal(vs.winner.id, 'P2');
    assert.equal(vs.scores.length, 2);
    assert.equal(W.WN_WRAP_JUDGE.role, 'judge');
  });
});
