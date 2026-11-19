const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dev/elevator/elev_logic.js');

const BANNED = [
  'Regretevator', 'Pest', 'Poob', 'PartyNoob', 'Split', 'Bive', 'Lampert', 'Prototype',
  'Reddy', 'Melanie', 'Scag', 'Gregoriah', 'Gnarpy', 'Voomba', 'FleshCousin', 'Floppy Shoppy',
  'Axolotl Sun'
];

describe('Wobblevator', () => {
  test('uses an original name, 12+ original floors, and never copies Regretevator branding', () => {
    assert.equal(E.ELEV_KEY, 'rubloxElevator');
    assert.ok(E.ELEV_FLOORS.length >= 45);
    const ids = E.ELEV_FLOORS.map(f => f.id);
    assert.equal(new Set(ids).size, ids.length);
    const kinds = new Set(E.ELEV_FLOORS.map(f => f.kind));
    ['obby', 'find', 'dodge', 'puzzle', 'creepy', 'funny', 'survive', 'shop', 'special', 'coop', 'quiz', 'memory', 'race', 'stack', 'rhythm', 'secret', 'holiday', 'boss'].forEach(k => assert.ok(kinds.has(k), k));
    const blob = JSON.stringify(E.ELEV_FLOORS) + JSON.stringify(E.ELEV_PALS) + JSON.stringify(E.ELEV_HOST);
    BANNED.forEach(n => assert.equal(blob.toLowerCase().includes(n.toLowerCase()), false, 'must not include ' + n));
    assert.equal(E.ELEV_HOST.name, 'Bingle the Bellhop');
    assert.ok(E.ELEV_PALS.length >= 4);
    assert.equal(E.elevNoFight(), true);
    assert.equal(E.elevNoGore(), true);
    assert.equal(E.elevEveryoneOkay(), true);
  });

  test('passengers only ride along in single-player', () => {
    assert.equal(E.elevBuddyAllowed(false), true);
    assert.equal(E.elevBuddyAllowed(true), false);
    const solo = E.elevStartRun(E.elevFresh(), 0, false).run;
    assert.equal(solo.buddy, true);
    const pal = E.elevPickPal(solo, () => 0);
    assert.ok(pal && pal.id);
    const mp = E.elevStartRun(E.elevFresh(), 0, true).run;
    assert.equal(mp.buddy, false);
    assert.equal(E.elevPickPal(mp, () => 0), null);
  });

  test('a run boards, rides to a floor, clears it for coins, and tracks the best streak', () => {
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    assert.equal(state.rides, 1);
    assert.equal(run.phase, 'lobby');
    E.elevBeginRide(run, () => 0);
    assert.equal(run.phase, 'ride');
    assert.ok(E.elevFloor(run.floor));
    E.elevTick(run, E.ELEV_RIDE + 0.05);
    assert.equal(run.phase, 'floor');
    const f = E.elevFloor(run.floor);
    const clear = E.elevClearFloor(state, run);
    assert.equal(clear.ok, true);
    assert.ok(clear.pay >= f.coins);
    assert.equal(clear.run.streak, 1);
    assert.equal(clear.state.best, 1);
    assert.equal(clear.state.cleared, 1);
    assert.ok(clear.state.seen.includes(f.id));
  });

  test('failing a floor resets the streak, everyone is okay, and banked coins stay', () => {
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginFloor(run, 'pillowpath');
    const mid = E.elevClearFloor(state, run);
    state = mid.state; run = mid.run;
    assert.equal(run.streak, 1);
    const banked = state.coins;
    E.elevTick(run, E.ELEV_INTER + 0.05);
    assert.equal(run.phase, 'ride');
    E.elevBeginFloor(run, 'soapsurge');
    E.elevTouchHazard(run);
    const fail = E.elevFailFloor(state, run);
    assert.equal(fail.ok, true);
    assert.equal(fail.everyoneOkay, true);
    assert.equal(fail.run.streak, 0);
    assert.equal(fail.state.coins, banked);
    assert.equal(fail.state.failed, 1);
    assert.equal(E.elevEveryoneOkay(), true);
  });

  test('find, puzzle, and paint floors clear only after the right action', () => {
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginFloor(run, 'sockhunt');
    assert.equal(E.elevPickItem(run, 'lunch').why, 'wrong');
    assert.equal(E.elevPickItem(run, 'sock').ok, true);
    E.elevTurnIn(run);
    const found = E.elevClearFloor(state, run);
    assert.equal(found.ok, true);
    assert.equal(found.state.found, 1);

    E.elevBeginFloor(run, 'chimeorder', () => 0);
    assert.ok(run.seq.length === 3);
    const first = run.seq[0];
    const wrong = [0, 1, 2].find(n => n !== first);
    assert.equal(E.elevRing(run, wrong).why, 'wrong');
    run.seq.forEach(n => assert.equal(E.elevRing(run, n).ok, true));
    assert.equal(run.wantClear, true);

    E.elevBeginFloor(run, 'partypaint');
    E.elevPaint(run, 0); E.elevPaint(run, 1); E.elevPaint(run, 2);
    assert.equal(run.wantClear, true);
  });

  test('a shop floor is due every 8 clears, and a lucky cookie spends coins from the wallet only', () => {
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    run.survived = 7;
    assert.equal(E.elevDueShop(run), true);
    assert.equal(E.elevPickFloor(run, () => 0.9).kind, 'shop');
    E.elevBeginFloor(run, 'snackstop');
    const no = E.elevBuySnack(E.elevFresh(), 3, run);
    assert.equal(no.why, 'coins');
    const yes = E.elevBuySnack(E.elevFresh(), 20, run);
    assert.equal(yes.ok, true);
    assert.equal(yes.wallet, 12);
    assert.equal(run.lucky, 4);
  });

  test('timer survival floors clear when time runs out, while find floors fail if you miss the item', () => {
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginFloor(run, 'pieparade');
    E.elevTick(run, 20);
    assert.equal(run.wantClear, true);
    E.elevBeginFloor(run, 'lostlunch');
    E.elevTick(run, 30);
    assert.equal(run.wantFail, true);
  });

  test('badges follow rides, streaks, finds, and creepy clears, and old saves stay compatible', () => {
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    assert.ok(E.elevBadges(state, run).includes('elev-ride'));
    run.streak = 5;
    assert.ok(E.elevBadges(state, run).includes('elev-five'));
    run.streak = 12;
    assert.ok(E.elevBadges(state, run).includes('elev-twelve'));
    state.found = 1; state.creepy = 1;
    const b = E.elevBadges(state, run);
    assert.ok(b.includes('elev-find'));
    assert.ok(b.includes('elev-creepy'));
    const loaded = E.elevLoad({ver:0, rides:2, best:4});
    assert.equal(loaded.rides, 2);
    assert.equal(loaded.best, 4);
    assert.equal(loaded.ver, E.ELEV_VER);
    assert.ok(Array.isArray(loaded.seen));
    assert.ok(Array.isArray(loaded.bag));
    state.seen = E.ELEV_FLOORS.slice(0, 25).map(f => f.id);
    assert.ok(E.elevBadges(state, run).includes('elev-seen25'));
    state.seen = E.ELEV_FLOORS.map(f => f.id);
    assert.ok(E.elevBadges(state, run).includes('elev-seenall'));
  });

  test('every floor has setup, update, and a win or fail path', () => {
    E.ELEV_FLOORS.forEach(f => {
      const spec = E.elevFloorSpec(f.id);
      assert.equal(typeof spec.setup, 'function', f.id + ' setup');
      assert.equal(typeof spec.update, 'function', f.id + ' update');
      assert.equal(typeof spec.win, 'function', f.id + ' win');
      assert.equal(typeof spec.fail, 'function', f.id + ' fail');
      const {run} = E.elevStartRun(E.elevFresh(), 0, false);
      spec.setup(run, () => 0.4);
      assert.equal(run.phase, 'floor');
      assert.equal(run.floor, f.id);
      spec.update(run, {dt: 0.2});
      assert.equal(spec.win(run) || spec.fail(run), false, f.id + ' should not end on a tiny tick');
      if (E.elevTimerWins(f)){
        spec.update(run, {dt: 40});
        assert.equal(spec.win(run), true, f.id + ' timer should win');
      } else {
        const ev =
          spec.clear === 'door' || spec.clear === 'lit' ? (spec.clear === 'lit' ? {lit:true, door:true} : {door:true}) :
          spec.clear === 'find' ? {item: f.item, turnIn:true} :
          spec.clear === 'seq' ? null :
          spec.clear === 'paint' ? {paint:0} :
          spec.clear === 'quiz' ? {quiz: run.quiz ? run.quiz.i : 0} :
          spec.clear === 'stack' ? {stack:true} :
          spec.clear === 'rhythm' ? {beat:true} :
          spec.clear === 'coop' ? {pad:0, on:true} :
          spec.clear === 'boss' ? {bossReady:true, tag:true} :
          spec.clear === 'shop' ? {dt: 20} :
          {door:true};
        if (spec.clear === 'seq'){
          run.seq.forEach(n => spec.update(run, {ring:n}));
        } else if (spec.clear === 'paint'){
          for (let i = 0; i < (f.paints || 3); i++) spec.update(run, {paint:i});
        } else if (spec.clear === 'stack'){
          for (let i = 0; i < (f.need || 5); i++) spec.update(run, {stack:true});
        } else if (spec.clear === 'rhythm'){
          for (let i = 0; i < (f.need || 6); i++) spec.update(run, {beat:true});
        } else if (spec.clear === 'coop'){
          spec.update(run, {pad:0, on:true});
          spec.update(run, {pad:1, on:true});
        } else {
          spec.update(run, ev);
        }
        assert.equal(spec.win(run), true, f.id + ' should win via ' + spec.clear);
      }
      const {run: failRun} = E.elevStartRun(E.elevFresh(), 0, false);
      spec.setup(failRun, () => 0.4);
      if (E.elevTimerWins(f)){
        spec.update(failRun, {hazard:true});
        assert.equal(spec.fail(failRun), true, f.id + ' hazard should fail');
      } else {
        spec.update(failRun, {dt: 80});
        assert.equal(spec.fail(failRun), true, f.id + ' timeout should fail');
      }
    });
  });

  test('the shuffle bag does not repeat a floor until most of the pool has been seen', () => {
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    run.survived = 1;
    const pool = E.elevPool(run, {snow:false});
    assert.ok(pool.length >= 30);
    assert.equal(pool.some(f => f.holiday || f.secret || f.kind === 'shop'), false);
    const seen = [];
    let n = 0;
    const rand = () => { n = (n + 0.173) % 1; return n; };
    const most = Math.floor(pool.length * (1 - E.ELEV_BAG_KEEP));
    for (let i = 0; i < most; i++){
      const f = E.elevPickFloor(run, rand, {snow:false});
      assert.ok(f && f.id, 'pick ' + i);
      seen.push(f.id);
      run.last = f.id;
    }
    assert.equal(new Set(seen).size, seen.length, 'no repeats until most of the bag is used');
    const snowed = [];
    for (let i = 0; i < 16; i++){
      run.last = 'pillowpath';
      snowed.push(E.elevPickFloor(run, () => 0.05, {snow:true, want:'holiday'}).id);
    }
    const hol = E.ELEV_FLOORS.filter(f => f.holiday).map(f => f.id);
    assert.ok(snowed.some(id => hol.includes(id)), 'holiday floors appear during the Snow Festival');
    const dry = [];
    for (let i = 0; i < 24; i++){
      dry.push(E.elevPickFloor(run, rand, {snow:false}).kind);
    }
    assert.equal(dry.includes('holiday'), false);
    const secret = E.elevPickFloor(run, () => 0, {want:'secret'});
    assert.equal(secret.secret, true);
    const rows = E.elevIndexRows({seen:['pillowpath']}, {snow:false});
    assert.equal(rows.length, E.ELEV_FLOORS.length);
    assert.equal(rows.find(r => r.id === 'pillowpath').seen, true);
    const hid = rows.find(r => r.id === 'whisperwell');
    assert.equal(hid.seen, false);
    assert.equal(hid.name, '???');
  });
});
