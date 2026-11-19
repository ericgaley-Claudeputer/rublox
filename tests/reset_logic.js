const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const R = require('../dev/reset/reset_logic.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('Reset a game', () => {
  test('maps every inventoried game save key, including the ones Tessa named', () => {
    const named = {
      elevator: 'rubloxElevator',
      garden: 'rubloxGarden',
      meadow: 'rubloxMeadow',
      rides: 'rubloxRides',
      hive: 'rubloxHive',
      camp: 'rubloxCamp',
      fish: 'rubloxFish',
      cafe: 'rubloxCafe',
      petshow: 'rubloxPetShow',
      hunt: 'rubloxHunt',
      tower: 'rubloxTower',
      dreamhouse: 'rubloxDreamHouse',
      pets: 'rubloxPets',
      obby: 'rubloxObby',
      snowfest: 'rubloxSeason'
    };
    Object.entries(named).forEach(([id, key]) => {
      const g = R.resetGame(id);
      assert.ok(g, id + ' should be listed');
      assert.ok(g.keys.includes(key), id + ' should clear ' + key);
    });
    const allKeys = R.RESET_GAMES.flatMap(g => g.keys);
    assert.equal(new Set(allKeys).size, allKeys.length, 'no key belongs to two games');
    allKeys.forEach(k => {
      assert.ok(html.includes("'" + k + "'") || html.includes('"' + k + '"'), k + ' should exist in the page source');
    });
    assert.equal(R.resetKeys('missing').length, 0);
  });

  test('a single-game reset leaves other keys, the wallet, character, and achievements untouched', () => {
    const store = {
      rubloxGarden: {planted: 3},
      rubloxMeadow: {xp: 50},
      rubloxCoins: 999,
      rubloxPlayer: {name:'Tessa'},
      rubloxAvatar: {hair: 1},
      rubloxAchievements: {got:['a']},
      rubloxPets: {pets:[1]},
      rubloxObby: {lvl: 12}
    };
    const after = R.resetApply(store, 'garden');
    assert.equal(after.rubloxGarden, undefined);
    assert.deepEqual(after.rubloxMeadow, {xp: 50});
    assert.equal(after.rubloxCoins, 999);
    assert.deepEqual(after.rubloxPlayer, {name:'Tessa'});
    assert.deepEqual(after.rubloxAvatar, {hair: 1});
    assert.deepEqual(after.rubloxAchievements, {got:['a']});
    assert.deepEqual(after.rubloxPets, {pets:[1]});
    assert.deepEqual(after.rubloxObby, {lvl: 12});
    const pets = R.resetApply(store, 'pets');
    assert.equal(pets.rubloxPets, undefined);
    assert.equal(pets.rubloxCoins, 999);
    assert.deepEqual(pets.rubloxGarden, {planted: 3});
  });

  test('Reset ALL games needs a double confirm, and keeps wallet, character, pets, and achievements', () => {
    let st = R.resetAllFresh();
    assert.equal(R.resetAllCanApply(st, false), false);
    assert.equal(R.resetAllCanApply(st, true), false, 'the first Confirm must not apply yet');
    const first = R.resetAllAdvance(st, true);
    assert.equal(first.apply, false);
    assert.equal(first.state.step, 1);
    const second = R.resetAllAdvance(first.state, true);
    assert.equal(second.apply, true);

    st = R.resetAllStart();
    const typed = R.resetAllType(st, 'reset');
    assert.equal(R.resetAllCanApply(typed, false), true, 'typing RESET on step 2 also confirms');

    const store = {
      rubloxGarden: {x:1},
      rubloxMeadow: {x:1},
      rubloxRides: {x:1},
      rubloxHive: {x:1},
      rubloxCamp: {x:1},
      rubloxObby: {x:1},
      rubloxDreamHouse: {x:1},
      rubloxBuild: {x:1},
      rubloxBuildSlots: [1],
      rubloxSeason: {x:1},
      rubloxCoins: 40,
      rubloxPlayer: {name:'Tessa'},
      rubloxAvatar: {hair:2},
      rubloxOwned: ['hat'],
      rubloxAchievements: {got:['b']},
      rubloxPets: {pets:[7]},
      rubloxGraphics: 'high',
      rubloxFriends: {n:1}
    };
    const after = R.resetApplyAll(store);
    assert.equal(after.rubloxGarden, undefined);
    assert.equal(after.rubloxObby, undefined);
    assert.equal(after.rubloxBuild, undefined);
    assert.equal(after.rubloxSeason, undefined);
    assert.equal(after.rubloxCoins, 40);
    assert.deepEqual(after.rubloxPlayer, {name:'Tessa'});
    assert.deepEqual(after.rubloxAvatar, {hair:2});
    assert.deepEqual(after.rubloxOwned, ['hat']);
    assert.deepEqual(after.rubloxAchievements, {got:['b']});
    assert.deepEqual(after.rubloxPets, {pets:[7]});
    assert.equal(after.rubloxGraphics, 'high');
    assert.deepEqual(after.rubloxFriends, {n:1});
    R.resetAllKeys().forEach(k => assert.equal(R.resetIsKept(k), false, k + ' should not be a kept key'));
  });

  test('confirm copy names the game and says the erase cannot be undone', () => {
    assert.equal(R.resetConfirmTitle('garden'), 'Reset Sunny Patch Garden?');
    assert.match(R.resetConfirmBody('garden'), /can't be undone/);
    assert.match(R.resetConfirmBody('garden'), /Sunny Patch Garden/);
    assert.equal(R.resetConfirmTitle('all'), 'Reset ALL games?');
    assert.match(R.resetConfirmBody('all'), /coins, character/i);
    assert.equal(R.RESET_ALL_WORD, 'RESET');
  });
});
