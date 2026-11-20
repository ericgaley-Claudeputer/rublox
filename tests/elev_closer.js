const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dev/elevator/elev_logic.js');

const BANNED = [
  'Regretevator', 'Pest', 'Poob', 'PartyNoob', 'Split', 'Bive', 'Lampert', 'Prototype',
  'Reddy', 'Melanie', 'Scag', 'Gregoriah', 'Gnarpy', 'Voomba', 'FleshCousin', 'Floppy Shoppy',
  'Axolotl Sun', 'Mr. Bitter', 'Mozelle', 'Unpleasant', 'Glevil', 'JAOBA', 'Enphoso'
];

describe('Wobblevator closer ride loop', () => {
  test('new floors, items, and events stay original and kid-safe', () => {
    assert.ok(E.ELEV_FLOORS.length >= 65);
    ['cloudnook','porchswing','buttonbazaar','mirrorattic','starwell','stubdesk','pillowfort','hushlibrary','windchimes','gigglecarousel'].forEach(id => {
      const f = E.elevFloor(id);
      assert.ok(f && f.name, id);
    });
    assert.equal(E.elevFloor('stubdesk').ticket, 1);
    assert.equal(E.elevFloor('hushlibrary').secret, true);
    assert.equal(E.elevFloor('cloudnook').kind, 'chill');
    assert.equal(E.elevNoGore(), true);
    assert.equal(E.elevEveryoneOkay(), true);
    const blob = JSON.stringify(E.ELEV_FLOORS) + JSON.stringify(E.ELEV_PALS) + JSON.stringify(E.ELEV_SHOP) + JSON.stringify(E.ELEV_RIDE_EVENTS) + JSON.stringify(E.ELEV_BADGE_CATALOG) + JSON.stringify(E.ELEV_DAILIES);
    BANNED.forEach(n => assert.equal(blob.toLowerCase().includes(n.toLowerCase()), false, n));
  });

  test('shop floors come every 15 clears and special floors every 25', () => {
    assert.equal(E.ELEV_SHOP_EVERY, 15);
    assert.equal(E.ELEV_SPECIAL_EVERY, 25);
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    run.survived = 14;
    assert.equal(E.elevDueShop(run), true);
    assert.equal(E.elevDueSpecial(run), false);
    assert.equal(E.elevPickFloor(run, () => 0.4).kind, 'shop');
    run.survived = 24;
    run.queued = null;
    assert.equal(E.elevDueSpecial(run), true);
    const special = E.elevPickFloor(run, () => 0.1);
    assert.ok(special.kind === 'special' || special.kind === 'boss' || special.rare);
  });

  test('a ride ticket queues the next floor and is optional on old saves', () => {
    const loaded = E.elevLoad({rides: 2, best: 1, seen:['pillowpath']});
    assert.equal(loaded.tickets, 0);
    assert.equal(loaded.lobbySecret, false);
    assert.deepEqual(loaded.met, []);
    loaded.tickets = 1;
    loaded.seen.push('pillowpath');
    const {run} = E.elevStartRun(loaded, 0, false);
    const no = E.elevQueueNext(E.elevLoad({tickets:0, seen:['pillowpath']}), run, 'pillowpath');
    assert.equal(no.why, 'tickets');
    const yes = E.elevQueueNext(loaded, run, 'pillowpath');
    assert.equal(yes.ok, true);
    assert.equal(run.queued, 'pillowpath');
    assert.equal(yes.state.tickets, 0);
    assert.equal(yes.state.ticketsUsed, 1);
    const f = E.elevPickFloor(run, () => 0.9);
    assert.equal(f.id, 'pillowpath');
    assert.equal(run.queued, null);
  });

  test('clearing Stub Desk grants a ticket, and milestones add bonus coins', () => {
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginFloor(run, 'stubdesk');
    assert.equal(E.elevPickItem(run, 'ridestub').ok, true);
    E.elevTurnIn(run);
    const r = E.elevClearFloor(state, run);
    assert.equal(r.ok, true);
    assert.equal(r.tickets, 1);
    assert.equal(r.state.tickets, 1);
    assert.match(r.run.quote, /🎫/);

    state = r.state; run = r.run;
    run.survived = 9;
    E.elevBeginFloor(run, 'pillowpath');
    const mile = E.elevClearFloor(state, run);
    assert.equal(mile.milestone, 10);
    assert.ok(mile.pay >= E.elevFloor('pillowpath').coins + 10);
  });

  test('passengers can be gifted, board from a home floor, and stay off the score', () => {
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    const bought = E.elevBuyItem(state, 40, 'ribbonwrap');
    assert.equal(bought.ok, true);
    state = bought.state;
    E.elevBeginRide(run, () => 0.2);
    E.elevSeatPals(run, [E.elevPal('pip'), E.elevPal('lumen')]);
    const pay = E.elevReward(run);
    const gift = E.elevGiftPal(state, run, 'pip');
    assert.equal(gift.ok, true);
    assert.equal(gift.pay, 3);
    assert.equal(gift.state.gifts, 1);
    assert.ok(gift.state.met.includes('pip'));
    assert.equal((gift.state.pack.ribbonwrap | 0), 0);
    assert.equal(E.elevReward(run), pay);
    run.floor = 'stubdesk';
    run.phase = 'floor';
    run.pals = [];
    const hopped = E.elevPalsHop(run, () => 0);
    assert.ok(hopped.some(s => s.id === 'pip'));
  });

  test('daily challenges, lobby secret, and new badges use optional save fields', () => {
    let state = E.elevEnsureDaily(E.elevFresh(), Date.parse('2026-11-20T12:00:00'));
    assert.ok(state.daily && state.daily.id && state.daily.goal >= 1);
    const day = state.daily.day;
    assert.equal(day, '2026-11-20');
    const same = E.elevEnsureDaily(state, Date.parse('2026-11-20T18:00:00'));
    assert.equal(same.daily.id, state.daily.id);
    const next = E.elevEnsureDaily(state, Date.parse('2026-11-21T12:00:00'));
    assert.equal(next.daily.day, '2026-11-21');
    state = E.elevEnsureDaily(E.elevFresh(), Date.parse('2026-11-20T12:00:00'));
    state.daily.kind = 'survive';
    state.daily.goal = 1;
    state.daily.progress = 0;
    state.daily.claimed = false;
    state.daily.reward = 8;
    state.daily.tickets = 1;
    let {run} = E.elevStartRun(state, 0, false);
    E.elevBeginFloor(run, 'cloudnook');
    const cleared = E.elevClearFloor(state, run);
    state = cleared.state;
    const claim = E.elevDailyClaim(state, Date.parse('2026-11-20T12:00:00'));
    assert.equal(claim.ok, true);
    assert.equal(claim.pay, 8);
    assert.equal(claim.state.tickets, 1);
    assert.equal(claim.state.dailyClaims, 1);

    const hid = E.elevFindLobbySecret(E.elevFresh());
    assert.equal(hid.ok, true);
    assert.equal(hid.pay, 5);
    assert.equal(E.elevFindLobbySecret(hid.state).why, 'have');

    const badges = E.elevBadges({rides:1, cleared:10, best:5, creepy:1, found:1, seen: E.ELEV_FLOORS.map(f => f.id), shopped:3, ticketsUsed:1, gifts:1, dailyClaims:1, lobbySecret:true, met: E.ELEV_PALS.slice(0, 8).map(p => p.id)});
    ['elev-ride','elev-five','elev-ten','elev-creepy','elev-find','elev-seen25','elev-seenall','elev-shopper','elev-special','elev-boss','elev-ticket','elev-gift','elev-daily','elev-secret','elev-lobby','elev-rare','elev-friends'].forEach(id => {
      assert.ok(badges.includes(id), id);
    });
    assert.ok(E.elevBadgeCatalog().length >= 18);
  });

  test('a ride event is guaranteed every 8 floors and bazaar items stay floor-only', () => {
    assert.ok(E.ELEV_RIDE_EVENTS.length >= 10);
    const {run} = E.elevStartRun(E.elevFresh(), 0, false);
    run.survived = 7;
    assert.equal(E.elevDueEvent(run), true);
    const ev = E.elevPickRideEvent(() => 0.99, run);
    assert.ok(ev && ev.id);
    const none = E.elevPickRideEvent(() => 0.99, {survived: 0});
    assert.equal(none, null);
    const lobby = E.elevShopList();
    assert.equal(lobby.some(i => i.id === 'ribbonwrap'), true);
    assert.equal(lobby.some(i => i.floorOnly), false);
    const bazaar = E.elevShopList({floor:'buttonbazaar'});
    assert.deepEqual(bazaar.map(i => i.id).sort(), ['jumblejam','sparklepin']);
    const blocked = E.elevBuyItem(E.elevFresh(), 80, 'jumblejam');
    assert.equal(blocked.why, 'floor');
    const {run: shopRun} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginFloor(shopRun, 'buttonbazaar');
    const buy = E.elevBuyFloorItem(E.elevFresh(), 40, shopRun, 'jumblejam');
    assert.equal(buy.ok, true);
    assert.equal((buy.state.pack.jumblejam | 0), 1);
  });
});
