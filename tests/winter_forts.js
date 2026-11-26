// GB-6: Snowdrift Fort Field — snow blocks, snowball fights with real players only, kid-friendly poofs.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const W = require('../dev/winter/winter_logic.js');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const F = W.WN_FORT;

test('fort field sits in Pinebell Village and does not overlap anything', () => {
  const D = W.wnFortDims();
  assert.equal(D.cols, 18); assert.equal(D.rows, 12);
  assert.deepEqual(W.wnLayoutOverlaps(), []);
  assert.ok(W.wnLayoutBoxes().some(b => b.kind === 'fort'));
  assert.ok(W.wnLayoutBoxes().some(b => b.kind === 'judges'));
  assert.equal(W.WN_FORT_TARGETS.length, 3);
  W.WN_FORT_TARGETS.forEach(t => assert.ok(W.wnInFort(t.x, t.z)));
});

test('place stacks blocks up to the max height, scoop takes them away', () => {
  const fort = W.wnFortFresh();
  const x = F.x, z = F.z - 4; // standing in the field, facing -z by default dir below
  const r1 = W.wnFortPlace(fort, x, z, 0, 1);
  assert.equal(r1.ok, true); assert.equal(r1.h, 1); assert.equal(fort.n, 1);
  assert.equal(W.wnFortPlace(fort, x, z, 0, 1).h, 2);
  assert.equal(W.wnFortPlace(fort, x, z, 0, 1).h, 3);
  const tall = W.wnFortPlace(fort, x, z, 0, 1);
  assert.equal(tall.ok, false); assert.equal(tall.why, 'tall');
  assert.equal(fort.n, 3);
  const s = W.wnFortScoop(fort, x, z, 0, 1);
  assert.equal(s.ok, true); assert.equal(s.h, 2); assert.equal(fort.n, 2);
  W.wnFortScoop(fort, x, z, 0, 1); W.wnFortScoop(fort, x, z, 0, 1);
  const empty = W.wnFortScoop(fort, x, z, 0, 1);
  assert.equal(empty.ok, false); assert.equal(empty.why, 'empty');
  assert.equal(fort.n, 0);
});

test('placing is refused outside the field, on yourself, on flags, and past the block limit', () => {
  const fort = W.wnFortFresh();
  assert.equal(W.wnFortPlace(fort, 0, 0, 0, -1).why, 'field');
  assert.equal(W.wnFortScoop(fort, 0, 0, 0, -1).why, 'field');
  const t = W.WN_FORT_TARGETS[0];
  assert.equal(W.wnFortPlace(fort, t.x, t.z - 2, 0, 1).why, 'target');
  // fill to the limit through wnFortSet, then one more is refused
  const D = W.wnFortDims();
  let placed = 0;
  for (let j = 0; j < D.rows && placed < F.maxBlocks; j++) for (let i = 0; i < D.cols && placed < F.maxBlocks; i++){
    const add = Math.min(F.maxH, F.maxBlocks - placed);
    const r = W.wnFortSet(fort, i, j, add); assert.equal(r.ok, true); placed += add;
  }
  assert.equal(fort.n, F.maxBlocks);
  const free = W.wnFortFresh();
  const full = Object.assign(W.wnFortFresh(), {n: F.maxBlocks});
  assert.equal(W.wnFortPlace(full, F.x, F.z - 4, 0, 1).why, 'full');
  assert.equal(W.wnFortSet(free, -1, 0, 1).why, 'edge');
});

test('fort snapshots wire and unwire for multiplayer (and junk is ignored)', () => {
  const fort = W.wnFortFresh();
  W.wnFortSet(fort, 2, 3, 2); W.wnFortSet(fort, 5, 1, 1);
  const wire = W.wnFortWire(fort);
  const back = W.wnFortUnwire(wire);
  assert.deepEqual(back.cells, fort.cells); assert.equal(back.n, 3);
  const junk = W.wnFortUnwire('a,b,c;99,99,3;1,1,9;<script>');
  assert.equal(junk.n, 3); // 1,1 clamps to max height, out-of-grid ignored
  assert.equal(W.wnFortUnwire(null).n, 0);
});

test('a fort wall blocks a snowball: it poofs on the wall and pays nothing', () => {
  const fort = W.wnFortFresh();
  const c = W.wnFortCenter(9, 6);
  W.wnFortSet(fort, 9, 6, 2);
  const run = W.wnNewVisit(null, 0).run;
  const friend = {id:'p2', name:'Friend', x: c.x, z: c.z - 4};
  const r = W.wnThrowAimed(run, null, 'me', {x: c.x, z: c.z + 3}, {x:0, z:-1}, [friend], [], fort);
  assert.equal(r.why, 'wall'); assert.equal(r.coins, 0); assert.equal(r.wall, true);
  assert.equal(run.fight.walls, 1);
  assert.match(r.message, /poof/i);
  assert.doesNotMatch(r.message, /hurt|blood|ouch|injur|kill|dead/i);
  // without the wall the same throw hits the real player
  run.snowball.cool = 0;
  const hit = W.wnThrowAimed(run, null, 'me', {x: c.x, z: c.z + 3}, {x:0, z:-1}, [friend], [], W.wnFortFresh());
  assert.equal(hit.why, 'hit'); assert.equal(hit.toId, 'p2'); assert.equal(hit.fight, true);
  assert.equal(run.fight.hits, 1);
  assert.match(hit.message, /giggle/);
});

test('snowball fights are real players only: NPCs and bots are never targets', () => {
  const run = W.wnNewVisit(null, 0).run;
  const roster = [{id:'npc-1', name:'Bot', x:0, z:-4}, {id:'b1', bot:true, x:0, z:-4}, {id:'n2', npc:true, x:0, z:-4}];
  const r = W.wnThrowAimed(run, null, 'me', {x:0, z:0}, {x:0, z:-1}, roster, [], null);
  assert.equal(r.why, 'miss'); assert.equal(r.coins, 0);
  assert.deepEqual(W.wnRealPlayers(roster), []);
  assert.equal(W.wnGotHit(run).fight.got, 1);
});

test('practice flags pay a little, and the daily coin jar stops farming', () => {
  const st0 = W.wnLoad(null);
  const run = W.wnNewVisit(null, 0).run;
  run.day = '2026-11-26';
  const t = W.WN_FORT_TARGETS[0];
  let st = st0, total = 0;
  for (let i = 0; i < 80; i++){
    run.snowball.cool = 0;
    const r = W.wnThrowAimed(run, st, 'me', {x: t.x, z: t.z + 4}, {x:0, z:-1}, [], W.WN_FORT_TARGETS, W.wnFortFresh());
    assert.equal(r.why, 'target');
    total += r.coins; st = r.state;
  }
  assert.equal(total, W.WN_FREE_CAP);
  assert.equal(st.freeCoins, W.WN_FREE_CAP);
  // a new day refills the jar
  run.day = '2026-11-27'; run.snowball.cool = 0;
  const next = W.wnThrowAimed(run, st, 'me', {x: t.x, z: t.z + 4}, {x:0, z:-1}, [], W.WN_FORT_TARGETS, null);
  assert.equal(next.coins, 1);
  assert.equal(W.wnDayKey(Date.UTC(2026, 10, 26, 12)), '2026-11-26');
});

test('fort and fight save keys are new and optional; old saves still load', () => {
  const old = W.wnLoad({coinsEarned: 30, sledBest: 4, snowHits: 2});
  assert.equal(old.coinsEarned, 30);
  assert.equal(old.forts, 0); assert.equal(old.fortHits, 0);
  assert.equal(old.freeDay, ''); assert.equal(old.freeCoins, 0);
  assert.equal(W.wnLoad({freeCoins: 9999}).freeCoins, W.WN_FREE_CAP);
  assert.equal(W.wnFortBank(old, 7).forts, 7);
  assert.equal(W.wnFortBank(old, -5).forts, 0);
});

test('fort and snowball controls are listed for keyboard, Xbox pad and touch', () => {
  const c = vm.createContext({globalThis: {}});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'dev/controls/mode_controls.js'), 'utf8') + '\nglobalThis.out = MODE_CONTROLS;', c);
  const m = c.globalThis.out.winter;
  const s = JSON.stringify(m);
  assert.match(JSON.stringify(m.pad), /scoop/i);
  assert.match(JSON.stringify(m.touch), /scoop|block/i);
  assert.match(s, /fort|snow block/i);
  assert.match(s, /Ⓨ|\bY\b/);
  assert.match(s, /scoop/i);
  assert.match(html, /id="wnFortBtn"/);
  assert.match(html, /wnFortDo\(/);
  assert.match(html, /ev:'poof'/);
  assert.match(html, /mpBroadcast\(d, g\.conn\)/);
  for (const f of ['dev/winter/winter_logic.js', 'dev/winter/runtime.js']){
    const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8').replace(/\n$/, '');
    assert.ok(html.includes(src), f + ' is in index.html verbatim');
  }
});
