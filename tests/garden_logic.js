const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const G = require('../dev/t302/garden_logic.js');

describe('Sunny Patch Garden', () => {
  test('uses the rubloxGarden save key and loads missing fields safely', () => {
    assert.equal(G.GARDEN_KEY, 'rubloxGarden');
    const s = G.gardenLoad(null);
    assert.equal(s.plots.length, 9);
    assert.equal(s.stand.length, 3);
    assert.deepEqual(s.pouch, {});
    const messy = G.gardenLoad({pouch:{sprout:2, notASeed:9}, plots:[{seed:'bean', plantedAt:100}], basket:['nope', 'melon'], stand:['squash']});
    assert.equal(messy.pouch.sprout, 2);
    assert.equal(messy.pouch.notASeed, undefined);
    assert.equal(messy.plots[0].seed, 'bean');
    assert.equal(messy.plots[1].seed, null);
    assert.equal(messy.basket[0].id, 'melon');
    assert.equal(messy.stand[0].id, 'squash');
    assert.equal(messy.stand[1], null);
  });

  test('plants from the pouch, grows in real time while you are away, then harvests', () => {
    let coins = 20;
    let s = G.gardenFresh();
    const buy = G.gardenBuy(s, 'sprout', coins);
    assert.equal(buy.ok, true);
    coins = buy.coins;
    const plant = G.gardenPlant(buy.state, 0, 'sprout', 1_000);
    assert.equal(plant.ok, true);
    assert.equal(G.gardenPouchCount(plant.state), 0);
    assert.equal(G.gardenStage(plant.state.plots[0], 1_000), 1);
    assert.equal(G.gardenReady(plant.state.plots[0], 1_000 + 14_000), false);
    const later = 1_000 + G.gardenSeed('sprout').grow;
    assert.equal(G.gardenReady(plant.state.plots[0], later), true);
    const early = G.gardenHarvest(plant.state, 0, 1_000 + 1000);
    assert.equal(early.ok, false);
    const got = G.gardenHarvest(plant.state, 0, later);
    assert.equal(got.ok, true);
    assert.equal(got.seed, 'sprout');
    assert.equal(got.state.harvested, 1);
    assert.equal(got.state.plots[0].seed, null);
  });

  test('sells harvested plants for coins and shows a prize on the stand', () => {
    let s = G.gardenFresh();
    s.basket = ['cloud', 'melon'];
    const sold = G.gardenSell(s, 0);
    assert.equal(sold.ok, true);
    assert.equal(sold.pay, G.gardenSeed('cloud').sell);
    assert.equal(sold.state.earned, sold.pay);
    const show = G.gardenShow(sold.state, 1, 0);
    assert.equal(show.ok, true);
    assert.equal(show.state.stand[1].id, 'melon');
    assert.equal(show.state.basket.length, 0);
  });

  test('cannot plant on a busy plot or buy without coins', () => {
    const s = G.gardenLoad({plots:[{seed:'bean', plantedAt:5}]});
    assert.equal(G.gardenPlant(s, 0, 'sprout', 10, 100).ok, false);
    assert.equal(G.gardenBuy(G.gardenFresh(), 'squash', 1).why, 'coins');
    assert.equal(G.gardenPlant(G.gardenFresh(), 0, 'sprout', 10, 0).why, 'coins');
  });

  test('a brand-new garden gets three Silly Sprout starter seeds, later saves do not', () => {
    const first = G.gardenGrantStarter(G.gardenFresh());
    assert.equal(first.pouch.sprout, 3);
    assert.equal(first.starter, true);
    const again = G.gardenGrantStarter(first);
    assert.equal(again.pouch.sprout, 3);
    const busy = G.gardenGrantStarter(G.gardenLoad({planted:1, starter:false, pouch:{}}));
    assert.equal(busy.pouch.sprout, undefined);
  });

  test('grow countdown reaches zero exactly when the plant is ready', () => {
    const plant = G.gardenPlant(G.gardenLoad({pouch:{sprout:1}, starter:true}), 2, 'sprout', 1000, 0, () => 0.5);
    assert.equal(G.gardenLeft(plant.state.plots[2], 1000), G.gardenSeed('sprout').grow);
    assert.equal(G.gardenReady(plant.state.plots[2], 1000 + G.gardenSeed('sprout').grow - 1), false);
    assert.equal(G.gardenLeft(plant.state.plots[2], 1000 + G.gardenSeed('sprout').grow), 0);
    assert.equal(G.gardenReady(plant.state.plots[2], 1000 + G.gardenSeed('sprout').grow), true);
  });

  test('the seed picker prefers the chosen seed in the pouch', () => {
    let s = G.gardenLoad({pouch:{sprout:1, bean:1}, starter:true});
    s = G.gardenPick(s, 'bean');
    const p = G.gardenPlant(s, 1, null, 50, 0, () => 0.5);
    assert.equal(p.ok, true);
    assert.equal(p.seed.id, 'bean');
  });

  test('seeds have rarity tiers and mutations sell for more than the base plant', () => {
    const tiers = G.GARDEN_SEEDS.map(s => s.rarity);
    assert.ok(tiers.includes('common') && tiers.includes('uncommon') && tiers.includes('rare'));
    assert.ok(tiers.includes('epic') && tiers.includes('legendary'));
    const prism = G.gardenSeed('prism');
    assert.equal(prism.rarity, 'legendary');
    assert.ok(prism.sell > G.gardenSeed('squash').sell);
    const sprout = G.gardenPlant(G.gardenLoad({pouch:{sprout:1}, starter:true}), 0, 'sprout', 10, 0, () => 0.5);
    assert.equal(sprout.rarity, 'common');
    assert.equal(sprout.mutated, false);
    const mutated = G.gardenPlant(G.gardenLoad({pouch:{sprout:1}, starter:true}), 0, 'sprout', 10, 0, () => 0);
    assert.equal(mutated.rarity, 'legendary');
    assert.equal(mutated.mutated, true);
    const later = 10 + G.gardenSeed('sprout').grow;
    const got = G.gardenHarvest(mutated.state, 0, later);
    assert.equal(got.rarity, 'legendary');
    const sold = G.gardenSell(got.state);
    assert.ok(sold.pay > G.gardenSeed('sprout').sell);
    assert.equal(sold.pay, G.gardenSellValue({id:'sprout', rarity:'legendary'}));
    assert.equal(G.gardenSellValue('cloud'), G.gardenSeed('cloud').sell);
  });
});
