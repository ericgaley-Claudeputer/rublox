const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const R = require('../dev/tower/tower_logic.js');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const TOWER_JS = fs.readFileSync(path.join(ROOT, 'dev/tower/tower.js'), 'utf8');

test('engine physics used by the tower audit match the live game loop', () => {
  assert.match(HTML, /const COIN_VALUE = 5, FINISH_BONUS = 50, R = 0\.45, H = 2\.8, GRAV = 45, JUMP = 16, SPEED = 10/);
  assert.match(HTML, /const RUN_MUL = 1\.6/);
  assert.equal(R.TD_PHYS.jump, 16);
  assert.equal(R.TD_PHYS.grav, 45);
  assert.equal(R.TD_PHYS.speed, 10);
  assert.equal(R.TD_PHYS.runMul, 1.6);
  assert.equal(R.TD_PHYS.r, 0.45);
  const maxH = R.tdMaxJumpHeight();
  assert.ok(Math.abs(maxH - 16 * 16 / (2 * 45)) < 1e-9);
  assert.equal(R.TD_MARGIN, 0.75);
});

test('every generated tower jump and step is inside 75% of max jump height and walk reach', () => {
  let worstH = 0, worstR = 0, n = 0;
  const check = (layout, label) => {
    const walk = R.tdWalkReachable(layout.plats);
    assert.equal(walk.ok, true, label + ' unreachable: ' + (walk.missing || []).slice(0, 4).map(p => (p.kind || p.role) + '@' + p.y).join(','));
    for (const j of walk.jumps){
      n++;
      worstH = Math.max(worstH, j.chk.usedH || 0);
      worstR = Math.max(worstR, j.chk.usedR || 0);
      assert.ok(j.chk.ok, label);
      assert.ok((j.chk.usedH || 0) <= R.TD_MARGIN + 1e-9, label + ' height ' + j.chk.usedH);
      assert.ok((j.chk.usedR || 0) <= R.TD_MARGIN + 1e-9, label + ' reach ' + j.chk.usedR);
    }
    for (const p of layout.plats){
      if (!R.tdIsStandable(p) || p.role === 'island') continue;
      assert.ok(Math.min(p.w, p.d) + 1e-9 >= R.TD_MIN_PAD, 'narrow ' + p.role + ' ' + p.w + 'x' + p.d);
    }
    assert.ok(layout.checkpoints.length >= 7, 'expected start + 6 gold pads');
    assert.ok(walk.reached.some(p => p.role === 'finish') || walk.reached.some(p => p.role === 'summit'));
  };
  for (const a of R.TD_KINDS){
    for (const b of R.TD_KINDS){
      const kinds = Array.from({length: R.TD_SECTIONS}, (_, i) => (i % 2 ? b : a));
      check(R.tdLayoutFromKinds(kinds), a + '->' + b);
    }
  }
  for (let seed = 0; seed < 200; seed++) check(R.tdLayout(seed), 'seed ' + seed);
  assert.ok(n > 100);
  assert.ok(worstH <= 0.75 && worstH > 0);
  assert.ok(worstR <= 0.75);
});

test('legacy section gaps were at or past max jump height, which is why the tower felt impossible', () => {
  const TD_H = 7.2, maxH = R.tdMaxJumpHeight();
  // The last pad of a "spin" section sat 2.7 m above the first, and the next
  // section started another ~3 m up — past the 2.84 m max jump.
  const spinFirst = 1.2 + 1.5;
  const spinLast = 1.2 + 4.2;
  const nextFirst = 1.2 + TD_H + 1.5;
  assert.ok(spinFirst - 0 >= 0.75 * maxH, 'first spin pad from the island');
  assert.ok(spinLast - (1.2 + 1.5) >= 0.75 * maxH, 'intra-spin rise');
  assert.ok(nextFirst - spinLast > maxH, 'spin section gap is impossible');
  const stepsLast = 1.2 + 4 * 1.15;
  const nextSteps = 1.2 + TD_H;
  assert.ok(nextSteps - stepsLast > 0.75 * maxH);
  const plats = [];
  plats.push({x:0,y:0,z:0,w:14,d:14,role:'island'});
  plats.push({x:0,y:0.5,z:-5.5,w:2,d:2,role:'spawn'});
  for (let i = 0; i < 3; i++){
    const y0 = 1.2 + i * TD_H;
    plats.push({x:0,y:y0+1.5,z:-3,w:3.2,d:3.2,role:'pad',kind:'spin',section:i});
    plats.push({x:0,y:y0+4.2,z:-6,w:2.6,d:2.6,role:'pad',kind:'spin',section:i});
  }
  const walk = R.tdWalkReachable(plats);
  assert.equal(walk.ok, false);
  assert.ok(walk.missing.some(p => p.section >= 1));
});

test('rising goo is slower, rests at the start and at gold pads, and cannot catch a normal climber', () => {
  assert.equal(R.TD_GOO_BASE, 0.16);
  assert.equal(R.TD_GRACE, 12);
  assert.equal(R.TD_CP_GRACE, 8);
  assert.ok(R.tdGooSpeed(0) < 0.42);
  assert.ok(R.tdGooSpeed(90) <= 0.22 + 1e-9);
  const layout = R.tdLayout(7);
  const sim = R.tdGooVsClimber({
    climbRate: R.TD_CLIMB_RATE,
    summit: layout.top,
    checkpointYs: layout.checkpoints.map(c => c.y)
  });
  assert.equal(sim.ok, true, 'goo caught a 0.30 m/s climber at t=' + sim.t + ' clear=' + sim.minClear);
  assert.ok(sim.minClear >= 4);
  assert.ok(sim.goo < sim.y - 4);
});

test('touching goo respawns at the last checkpoint instead of failing the run', () => {
  assert.match(TOWER_JS, /function towerGooHit\(/);
  assert.match(TOWER_JS, /respawn\(\)/);
  assert.match(TOWER_JS, /The bubbly goo sent you back to a gold pad/);
  assert.match(TOWER_JS, /if \(td\.grace <= 0 && P\.y < td\.goo \+ \.15\)\{ towerGooHit\(\); return; \}/);
  assert.doesNotMatch(TOWER_JS, /if \(td\.grace <= 0 && P\.y < td\.goo \+ \.15\)\{ towerLose\(\)/);
  assert.match(HTML, /if \(mode === 'tower'\)\{ if \(P\.y < -25\) respawn\(\); collectCoins\(\); if \(typeof towerChecks === 'function'\) towerChecks\(\); return; \}/);
  assert.match(HTML, /function towerChecks\(/);
  assert.match(TOWER_JS, /checkpoint\(b, cpAt\+\+\)/);
});

test('saves and tower-climb / tower-win achievements stay compatible', () => {
  assert.equal(R.TD_KEY, 'rubloxTower');
  assert.match(HTML, /\{id:'tower-climb', cat:'adventure'/);
  assert.match(HTML, /\{id:'tower-win', cat:'adventure'/);
  assert.match(HTML, /prove:s => !!\(s\.tower && \(s\.tower\.best \| 0\) >= 10\)/);
  assert.match(HTML, /prove:s => !!\(s\.tower && \(s\.tower\.wins \| 0\) >= 1\)/);
  const loaded = R.tdLoadProg({best: 15, wins: 2, coins: 40, extra: 1});
  assert.deepEqual(loaded, {best: 15, wins: 2, coins: 40});
  const empty = R.tdLoadProg(null);
  assert.deepEqual(empty, {best: 0, wins: 0, coins: 0});
  assert.match(TOWER_JS, /p\.wins\+\+/);
  assert.match(TOWER_JS, /p\.best = Math\.max\(p\.best, Math\.floor\(maxY\)\)/);
});

test('Tower of Doom still launches from the card and keeps Xbox and mobile jump controls', () => {
  assert.match(HTML, /\{id:'tower', name:'Tower of Doom'/);
  assert.match(HTML, /mode === 'tower' && td && tdPad\(jp\)/);
  assert.match(HTML, /🕹️ Left thumb moves · Ⓐ jump/);
  assert.match(HTML, /WASD move · Space jump/);
  assert.match(HTML, /gold pads are checkpoints/);
  assert.match(TOWER_JS, /function tdPad\(jp\)\{ return false; \}/);
});
