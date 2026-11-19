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

  test('chatty passengers ride in solo and in multiplayer, and they are not opponents', () => {
    assert.equal(E.elevBuddyAllowed(false), true);
    assert.equal(E.elevBuddyAllowed(true), true);
    const solo = E.elevStartRun(E.elevFresh(), 0, false).run;
    assert.equal(solo.buddy, true);
    const pal = E.elevPickPal(solo, () => 0);
    assert.ok(pal && pal.id);
    const mp = E.elevStartRun(E.elevFresh(), 0, true).run;
    assert.equal(mp.buddy, true);
    assert.ok(E.elevPickPal(mp, () => 0) && E.elevPickPal(mp, () => 0).id);
    assert.equal(E.elevNoFight(), true);
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
    assert.equal(run.phase, 'board');
    E.elevTick(run, E.ELEV_BOARD + 0.05);
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


  test('every floor spawns the player on solid ground and a fall is scooped back', () => {
    const R = E.ELEV_BODY_R;
    assert.ok(E.ELEV_FLOORS.length >= 45);
    E.ELEV_FLOORS.forEach(f => {
      const room = E.elevRoomOf(f);
      const spawn = E.elevSpawnOf(f);
      assert.ok(room && room.w > 4 && room.d > 4, f.id + ' needs a real room');
      assert.ok(room.hall && room.hall.d > 4, f.id + ' needs a hall from the cab');
      assert.equal(E.elevOnSolid(spawn.x, spawn.z, room, R), true, f.id + ' spawn must be on the slab');
      // the live bug: z = -22 sat past the front edge of 14-deep rooms
      const legacy = {x:0, y:0.5, z:-22};
      const sim = E.elevSimStep(f.id, 3, {fps:60});
      assert.equal(sim.fell, false, f.id + ' should not free-fall from spawn');
      assert.ok(sim.y >= sim.top - 0.01, f.id + ' y=' + sim.y + ' below floor ' + sim.top);
      assert.ok(sim.onGround, f.id + ' should be grounded after a few seconds');
      assert.ok(sim.minY >= sim.top - 0.05, f.id + ' minY ' + sim.minY + ' dipped below the floor');
      const drop = E.elevSimStep(f.id, 2, {x:0, y:2, z:-80, fps:60, catchFall:true});
      assert.ok(drop.caught >= 1, f.id + ' fall-safety net should respawn at the start');
      assert.equal(drop.fell, false);
      assert.ok(E.elevOnSolid(drop.x, drop.z, room, R), f.id + ' catch should land back on the floor');
    });
  });


  test('chatty original passengers have running jokes, and Polo hops off shop floors', () => {
    assert.ok(E.ELEV_PALS.length >= 15);
    E.ELEV_PALS.forEach(p => {
      assert.ok(p.id && p.name && p.emoji);
      assert.ok((p.lines && p.lines.length >= 4) || (p.line && p.jokes), p.id + ' should be chatty');
    });
    const blob = JSON.stringify(E.ELEV_PALS) + JSON.stringify(E.ELEV_HOST) + JSON.stringify(E.ELEV_SHOP) + JSON.stringify(E.ELEV_FLOORS);
    BANNED.forEach(n => assert.equal(blob.toLowerCase().includes(n.toLowerCase()), false, 'must not include ' + n));
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    run.buddy = true;
    E.elevBeginFloor(run, 'snackstop');
    const aboard = E.elevPalsAboard(run, () => 0);
    assert.equal(aboard.some(p => p.hop === 'shopoff'), false);
    assert.ok(E.elevTalkLine(E.ELEV_PALS[0], {i:0}));
    assert.ok(E.elevTalkLine(E.ELEV_PALS[0], {joke:true, i:0}));
    const ic = E.elevIntercom(run, 'board');
    assert.match(ic, /Doors closing/);
    assert.match(E.elevIntercom(run, 'floor'), /snackstop|Snack/i);
  });

  test('a doors-closing countdown and late riders wait in the cab', () => {
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    assert.equal(run.phase, 'lobby');
    E.elevBeginBoard(run);
    assert.equal(run.phase, 'board');
    assert.ok(run.t <= E.ELEV_BOARD);
    assert.match(run.quote, /Get back in/);
    E.elevTick(run, E.ELEV_BOARD + 0.05);
    assert.equal(run.phase, 'ride');
    E.elevCloseDoors(run, false);
    assert.equal(run.watching, true);
    E.elevCloseDoors(run, true);
    assert.equal(run.watching, false);
    const snap = E.elevWire(run);
    assert.equal(snap.phase, 'ride');
    const guest = E.elevStartRun(E.elevFresh(), 0, true).run;
    E.elevApplyWire(guest, snap);
    assert.equal(guest.phase, 'ride');
    assert.equal(guest.floor, run.floor);
  });

  test('coin streak bonus grows with survives and a charm can keep it once', () => {
    assert.equal(E.elevStreakBonus(0), 0);
    assert.equal(E.elevStreakBonus(1), 1);
    assert.equal(E.elevStreakBonus(15), 15);
    assert.equal(E.elevStreakBonus(40), 15);
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginFloor(run, 'pillowpath');
    let r = E.elevClearFloor(state, run);
    state = r.state; run = r.run;
    assert.equal(run.streak, 1);
    E.elevBeginFloor(run, 'tickletiles');
    r = E.elevClearFloor(state, run);
    state = r.state; run = r.run;
    assert.equal(run.streak, 2);
    assert.ok(r.pay >= E.elevFloor('tickletiles').coins + E.elevStreakBonus(1));
    run.charm = true;
    E.elevBeginFloor(run, 'soapsurge');
    E.elevTouchHazard(run);
    const fail = E.elevFailFloor(state, run);
    assert.equal(fail.run.streak, 2);
    assert.match(fail.run.quote, /streak charm|kept/i);
    E.elevBeginFloor(fail.run, 'pillowpath');
    E.elevTouchHazard(fail.run);
    const fail2 = E.elevFailFloor(fail.state, fail.run);
    assert.equal(fail2.run.streak, 0);
  });

  test('lobby shop sells original hats and one-use items without touching old save keys', () => {
    assert.ok(E.ELEV_SHOP.length >= 10);
    const hats = E.elevShopList().filter(i => i.kind === 'hat');
    const uses = E.elevShopList().filter(i => i.kind === 'use');
    assert.ok(hats.length >= 6);
    assert.ok(uses.length >= 5);
    const old = {rides:2, best:1, seen:['pillowpath']};
    const loaded = E.elevLoad(old);
    assert.equal(loaded.rides, 2);
    assert.deepEqual(loaded.hats, []);
    assert.equal(loaded.hat, '');
    assert.equal(typeof loaded.pack, 'object');
    const no = E.elevBuyItem(loaded, 0, 'dingcap');
    assert.equal(no.why, 'coins');
    const yes = E.elevBuyItem(loaded, 80, 'dingcap');
    assert.equal(yes.ok, true);
    assert.equal(yes.wallet, 80 - E.elevShopItem('dingcap').cost);
    assert.ok(yes.state.hats.includes('dingcap'));
    const wear = E.elevWearHat(yes.state, 'dingcap');
    assert.equal(wear.state.hat, 'dingcap');
    let packState = yes.state;
    let packRun = E.elevStartRun(packState, 0, false).run;
    const cookie = E.elevBuyItem(packState, 40, 'luckycookie');
    packState = cookie.state;
    const applied = E.elevApplyPack(packState, packRun);
    assert.equal(applied.run.lucky, 4);
    assert.equal((applied.state.pack.luckycookie | 0), 0);
  });

  test('less-scary is optional, can inherit from Campfire, and new creepy floors stay kid-safe', () => {
    const fresh = E.elevFresh();
    assert.equal(typeof fresh.lessScary, 'boolean');
    const set = E.elevSetLessScary(fresh, true);
    assert.equal(set.lessScary, true);
    const ids = E.ELEV_FLOORS.map(f => f.id);
    ['softcloset','sparechair','politefog','almostdoors','moonmilk','dustorchestra','smileinventory','clockback'].forEach(id => {
      assert.ok(ids.includes(id), id);
      const f = E.elevFloor(id);
      assert.ok(f && f.name && f.kind);
    });
    assert.equal(E.elevNoGore(), true);
    assert.equal(E.elevEveryoneOkay(), true);
  });

  test('rides last long enough for muzak, a dial tick, and occasional harmless events', () => {
    assert.ok(E.ELEV_RIDE >= 4);
    assert.ok(E.ELEV_RIDE_EVENTS.length >= 4);
    const ev = E.elevPickRideEvent(() => 0);
    assert.ok(ev && ev.id && ev.text);
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginRide(run, () => 0);
    assert.ok(run.event === null || (run.event.id && run.event.text));
  });


  test('the host picks passengers, seats, and lines, and every client sees the same cab', () => {
    const host = E.elevStartRun(E.elevFresh(), 0, true).run;
    assert.equal(host.buddy, true);
    E.elevBeginRide(host, () => 0.2);
    const aboard = E.elevPalsAboard(host, () => 0.2);
    assert.ok(aboard.length >= 2);
    assert.ok((host.pals || []).length >= 2);
    host.pals.forEach(s => {
      assert.ok(E.elevPal(s.id));
      assert.ok(Math.abs(s.x) <= 4.4 && Math.abs(s.z) <= 4.4);
    });
    const talk = E.elevHostTalk(host, () => 0.9);
    assert.ok(talk && talk.text && talk.who);
    assert.ok(talk.seq >= 1);
    const snap = E.elevWire(host);
    assert.ok(Array.isArray(snap.pals) && snap.pals.length === host.pals.length);
    assert.equal(snap.pals[0].id, host.pals[0].id);
    assert.equal(snap.pals[0].x, host.pals[0].x);
    assert.equal(snap.pals[0].z, host.pals[0].z);
    assert.equal(snap.talk.text, talk.text);
    assert.equal(snap.talk.who, talk.who);
    const joiner = E.elevStartRun(E.elevFresh(), 0, true).run;
    joiner.pals = [];
    joiner.talk = null;
    E.elevApplyWire(joiner, snap);
    assert.equal(joiner.phase, host.phase);
    assert.equal(joiner.floor, host.floor);
    assert.deepEqual(joiner.pals, host.pals);
    assert.equal(joiner.talk.text, talk.text);
    assert.equal(joiner.talk.who, talk.who);
    assert.equal(joiner.talk.x, talk.x);
    assert.equal(joiner.talk.z, talk.z);
  });

  test('solo still boards chatty passengers, and they do not change the score or take player slots', () => {
    const {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    assert.equal(run.buddy, true);
    E.elevBeginFloor(run, 'pillowpath');
    const pay = E.elevReward(run);
    run.pals = E.elevCleanPals([{id:'sock', x:-3, z:-2},{id:'niblet', x:3, z:2},{id:'echo', x:-3, z:2}]);
    assert.equal(E.elevReward(run), pay);
    const mid = E.elevClearFloor(state, run);
    assert.equal(mid.pay, pay);
    assert.equal(E.ELEV_PAL_MAX < 10, true);
    E.elevBeginFloor(mid.run, 'snackstop');
    E.elevSeatPals(mid.run, [E.elevPal('polo'), E.elevPal('marm')]);
    const after = E.elevPalsHop(mid.run, () => 0);
    assert.equal(after.some(s => s.id === 'polo'), false);
    const soloTalk = E.elevHostTalk(mid.run, () => 0);
    assert.ok(soloTalk && soloTalk.text);
  });


  test('a doors-closing countdown starts from the lobby and is not reset if beginBoard is called again', () => {
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    assert.equal(run.phase, 'lobby');
    E.elevBeginBoard(run);
    assert.equal(run.phase, 'board');
    const left = run.t;
    assert.ok(left > 1);
    E.elevTick(run, 1);
    assert.ok(run.t < left);
    const mid = run.t;
    E.elevBeginBoard(run);
    assert.equal(run.phase, 'board');
    assert.equal(run.t, mid);
    E.elevTick(run, mid + 0.05);
    assert.equal(run.phase, 'ride');
    E.elevTick(run, E.ELEV_RIDE + 0.05);
    assert.equal(run.phase, 'floor');
    assert.ok(E.elevFloor(run.floor));
  });


});
