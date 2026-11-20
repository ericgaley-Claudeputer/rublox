const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dev/elevator/elev_logic.js');

describe('Wobblevator friendship hearts', () => {
  test('old elevator saves gain empty hearts and ribbon gifts still work', () => {
    const st = E.elevLoad({rides:4, coins:20, gifts:1, met:['pip']});
    assert.equal(st.rides, 4);
    assert.equal(st.gifts, 1);
    assert.deepEqual(st.hearts, {});
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    const bought = E.elevBuyItem(state, 40, 'ribbonwrap');
    assert.equal(bought.ok, true);
    state = bought.state;
    E.elevBeginRide(run, () => 0.2);
    E.elevSeatPals(run, [E.elevPal('pip')]);
    const gift = E.elevGiftPal(state, run, 'pip');
    assert.equal(gift.ok, true);
    assert.equal(gift.pay, 3);
    assert.equal(gift.mood, 'ok');
    assert.ok((gift.state.hearts.pip.xp | 0) >= 3);
  });

  test('talking, riding, and liked or disliked gifts raise heart levels and unlock rewards', () => {
    let {state, run} = E.elevStartRun(E.elevFresh(), 0, false);
    E.elevBeginRide(run, () => 0.2);
    E.elevSeatPals(run, [E.elevPal('niblet')]);
    const talk = E.elevHeartTalk(state, run, 'niblet');
    assert.equal(talk.ok, true);
    state = talk.state;
    assert.equal(E.elevHeartTalk(state, run, 'niblet').why, 'already');
    const ride = E.elevHeartRide(state, run, 'niblet');
    assert.equal(ride.ok, true);
    state = ride.state;
    assert.equal(E.elevHeartRide(state, run, 'niblet').why, 'already');
    const cookie = E.elevBuyItem(state, 80, 'cookie');
    assert.equal(cookie.ok, true);
    state = cookie.state;
    const liked = E.elevGiftPal(state, run, 'niblet', 'cookie');
    assert.equal(liked.ok, true);
    assert.equal(liked.mood, 'like');
    assert.equal(liked.pay, 4);
    state = liked.state;
    // climb to level 3
    let leveled = E.elevHeartAdd(state, 'niblet', 'talks', 30);
    state = leveled.state;
    assert.ok(E.elevHeartLevel(state, 'niblet') >= 3);
    assert.ok(leveled.reward >= 5);
    assert.equal(leveled.badge, true);
    assert.ok(E.elevBadges(state, run).includes('elev-hearts'));
    const line = E.elevTalkLine(E.elevPal('niblet'), {level:3, i:0});
    assert.ok(line.length > 0);
    const base = E.elevTalkLine(E.elevPal('niblet'), {level:0, i:0});
    assert.notEqual(line, base);
    const pub = E.elevHeartPub(state, 'H');
    assert.equal(pub.uid, 'H');
    assert.ok(pub.levels.niblet >= 3);
    E.elevMergeHeartPub(run, pub);
    const wire = E.elevWire(run);
    assert.equal(wire.heartsPub.H.niblet, pub.levels.niblet);
  });

  test('gift likes and dislikes are per passenger and stay kid-friendly', () => {
    const cookie = E.elevGiftItem('cookie');
    assert.ok(cookie.likes.includes('niblet'));
    assert.equal(E.elevGiftMood(E.elevPal('niblet'), cookie), 'like');
    assert.equal(E.elevGiftMood(E.elevPal('crisp'), cookie), 'dislike');
    const quote = E.elevGiftQuote(E.elevPal('crisp'), cookie, 'dislike');
    assert.match(quote, /appreciate|kind/i);
    assert.doesNotMatch(quote, /hate|stupid|ugly/i);
  });
});
