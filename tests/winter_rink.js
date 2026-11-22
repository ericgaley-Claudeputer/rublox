const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const W = require(path.join(__dirname, '..', 'dev/winter/winter_logic.js'));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Frostlane Rink uses ice slip, counts laps, and awards optional trick coins', () => {
  assert.match(W.WN_POND.name, /Frostlane Rink/);
  assert.equal(W.wnOnRink(W.WN_POND.x, W.WN_POND.z), true);
  assert.equal(W.wnOnRink(W.WN_POND.x + 40, W.WN_POND.z), false);
  const st0 = W.wnLoad({coinsEarned:2, skateLaps:1});
  assert.equal(st0.skateTricks, 0);
  assert.equal(st0.coinsEarned, 2);
  const run = W.wnNewVisit(st0, 1).run;
  assert.equal(W.wnSkateStart(run).ok, true);
  for (let i = 0; i < 80; i++){
    const a = (i / 10) * Math.PI;
    W.wnSkateTick(run, Math.cos(a), Math.sin(a), 0.05);
  }
  assert.ok((run.skate.laps | 0) >= 1, 'laps ' + run.skate.laps);
  const bank = W.wnSkateBank(run, st0);
  assert.equal(bank.ok, true);
  const trick = W.wnSkateTrick(run, bank.state);
  assert.equal(trick.ok, true);
  assert.match(trick.name, /twirl|spin|spiral/i);
  assert.ok(trick.coins > 0);
  assert.equal(trick.state.skateTricks, 1);
  const wait = W.wnSkateTrick(run, trick.state);
  assert.equal(wait.ok, false);
  for (let i = 0; i < 20; i++) W.wnSkateTick(run, 1, 0, 0.08);
  const trick2 = W.wnSkateTrick(run, trick.state);
  assert.equal(trick2.ok, true);
  assert.equal(trick2.state.skateTricks, 2);
});

test('Rink is built with an ice plat, boards, and a Frostlane sign', () => {
  assert.match(html, /ice\s*=\s*true/);
  assert.match(html, /Frostlane Rink/);
  assert.match(html, /function wnDoTrick/);
  assert.match(html, /function wnBuildRink/);
});
