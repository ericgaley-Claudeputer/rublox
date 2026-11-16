'use strict';
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const T = require('../dev/trade/trade_logic.js');

function pet(k, n, b, extra){
  return Object.assign({k, n, c: 0, xp: 0, f: 80, u: 80, e: 80, b, acc: {}, g: 'g'}, extra || {});
}

function inv(pets, items){
  const bag = {};
  (items || []).forEach(id => bag[id] = 1);
  return {pets: pets.slice(), inv: bag, a: 0};
}

describe('trading', () => {
  test('atomic swap moves a pet and an accessory both ways', () => {
    const a = inv([pet('dog', 'Pip', 11)], ['bow', 'cape']);
    const b = inv([pet('cat', 'Mochi', 22), pet('bird', 'Pippin', 33)], ['hat']);
    const sw = T.trSwap(
      a, [{kind: 'pet', pet: a.pets[0]}, {kind: 'acc', id: 'bow', n: 'Bow', r: 1}],
      b, [{kind: 'pet', pet: b.pets[0]}, {kind: 'acc', id: 'hat', n: 'Hat', r: 0}]
    );
    assert.equal(sw.ok, true);
    assert.equal(sw.a.pets.length, 1);
    assert.equal(sw.a.pets[0].n, 'Mochi');
    assert.equal(!!sw.a.inv.hat, true);
    assert.equal(!!sw.a.inv.bow, false);
    assert.equal(!!sw.a.inv.cape, true);
    assert.equal(sw.b.pets.some(p => p.n === 'Pip'), true);
    assert.equal(sw.b.pets.some(p => p.n === 'Mochi'), false);
    assert.equal(sw.b.pets.some(p => p.n === 'Pippin'), true);
    assert.equal(!!sw.b.inv.bow, true);
    assert.equal(!!sw.b.inv.hat, false);
    // Originals are not mutated
    assert.equal(a.pets.length, 1);
    assert.equal(!!a.inv.bow, true);
  });

  test('cannot trade a default or free item, or something you do not own', () => {
    const a = inv([pet('dog', 'Pip', 11)], ['none', 'smile', 'bow']);
    const b = inv([], []);
    const cat = {none: {price: 0, free: true}, smile: {price: 0}, bow: {price: 40, r: 1}};
    const blocked = T.trSwap(a, [{kind: 'acc', id: 'none', n: 'None', catalog: cat}], b, []);
    assert.equal(blocked.ok, false);
    const free = T.trSwap(a, [{kind: 'acc', id: 'smile', n: 'Smile', catalog: cat}], b, []);
    assert.equal(free.ok, false);
    const missing = T.trSwap(a, [{kind: 'acc', id: 'cape', n: 'Cape'}], b, []);
    assert.equal(missing.ok, false);
    const ok = T.trSwap(a, [{kind: 'acc', id: 'bow', n: 'Bow', r: 1}], b, []);
    assert.equal(ok.ok, true);
  });

  test('refuses a swap that would go over the pet cap or vanish a pet', () => {
    const aPets = [];
    for (let i = 0; i < 6; i++) aPets.push(pet('dog', 'P' + i, 100 + i));
    const a = inv(aPets, []);
    const b = inv([pet('cat', 'Mochi', 1)], []);
    const overflow = T.trSwap(a, [], b, [{kind: 'pet', pet: b.pets[0]}]);
    assert.equal(overflow.ok, false);
    assert.equal(overflow.why, 'full-a');
    // One-for-one at the cap is fine
    const even = T.trSwap(a, [{kind: 'pet', pet: a.pets[0]}], b, [{kind: 'pet', pet: b.pets[0]}]);
    assert.equal(even.ok, true);
    assert.equal(even.a.pets.length, 6);
    assert.equal(even.b.pets.length, 1);
  });

  test('unequips a traded accessory from the giver pet', () => {
    const a = inv([pet('dog', 'Pip', 11, {acc: {hat: 'bow'}})], ['bow']);
    const b = inv([], []);
    const sw = T.trSwap(a, [{kind: 'acc', id: 'bow', n: 'Bow'}], b, []);
    assert.equal(sw.ok, true);
    assert.equal(sw.a.pets[0].acc.hat, undefined);
    assert.equal(!!sw.b.inv.bow, true);
  });

  test('Ready then Confirm; changing an offer resets Ready; cancel anytime', () => {
    let s = T.trNewSession('t1', ' ann', 'bob');
    // trim happens? wait I passed ' ann' with space - that's ok
    s = T.trNewSession('t1', 'ann', 'bob');
    const a = inv([pet('dog', 'Pip', 11)], ['bow']);
    const b = inv([pet('cat', 'Mochi', 22)], ['hat']);
    let r = T.trSetOffer(s, 'ann', [{kind: 'pet', pet: a.pets[0]}], a);
    assert.equal(r.ok, true);
    r = T.trSetReady(s, 'ann', true);
    r = T.trSetReady(s, 'bob', true);
    assert.equal(s.ph, 'ready');
    // Offer change resets ready
    r = T.trSetOffer(s, 'ann', [{kind: 'acc', id: 'bow', n: 'Bow'}], a);
    assert.equal(s.readyA, false);
    assert.equal(s.readyB, false);
    assert.equal(s.ph, 'open');
    T.trSetReady(s, 'ann', true);
    T.trSetReady(s, 'bob', true);
    // Confirm before ready-both already set
    let c = T.trSetConfirm(s, 'ann');
    assert.equal(c.ok, true);
    assert.equal(c.both, false);
    c = T.trSetConfirm(s, 'bob');
    assert.equal(c.both, true);
    assert.equal(s.ph, 'confirm');
    const done = T.trCommit(s, a, b);
    assert.equal(done.ok, true);
    assert.equal(s.ph, 'done');
    assert.equal(!!done.b.inv.bow, true);
    assert.equal(done.b.pets.some(p => p.n === 'Mochi'), true);
    assert.equal(done.a.pets.some(p => p.n === 'Pip'), true);
    assert.equal(!!done.a.inv.bow, false);
    // Cancel mid-trade leaves inventories alone
    s = T.trNewSession('t2', 'ann', 'bob');
    T.trSetOffer(s, 'ann', [{kind: 'acc', id: 'bow', n: 'Bow'}], a);
    T.trCancel(s, 'bob');
    assert.equal(s.ph, 'cancel');
    const late = T.trCommit(s, a, b);
    assert.equal(late.ok, false);
    assert.equal(!!a.inv.bow, true);
  });

  test('commit fails closed if an item disappeared after Ready', () => {
    const s = T.trNewSession('t3', 'ann', 'bob');
    const a = inv([pet('dog', 'Pip', 11)], ['bow']);
    const b = inv([], ['hat']);
    T.trSetOffer(s, 'ann', [{kind: 'acc', id: 'bow', n: 'Bow'}], a);
    T.trSetReady(s, 'ann', true);
    T.trSetReady(s, 'bob', true);
    T.trSetConfirm(s, 'ann');
    T.trSetConfirm(s, 'bob');
    const gone = inv([pet('dog', 'Pip', 11)], []); // bow vanished
    const r = T.trCommit(s, gone, b);
    assert.equal(r.ok, false);
    assert.equal(s.ph, 'open');
  });

  test('rarity labels and history entries have no free-text fields to fill', () => {
    assert.equal(T.trRarityName(0), 'Common');
    assert.equal(T.trRarityName(4), 'Legendary');
    assert.equal(T.trRarityName(99), 'Legendary');
    const e = T.trHistEntry(1, 'Mochi', [{kind: 'acc', n: 'Bow'}], [{kind: 'pet', n: 'Pip'}]);
    assert.deepEqual(Object.keys(e).sort(), ['gave', 'got', 't', 'with']);
    const h = T.trLoadHist({list: [e, {t: 2, with: 'A', gave: ['X'], got: []}]});
    assert.equal(h.list.length, 2);
  });

  test('empty offers are refused and blocked items never enter an offer', () => {
    const a = inv([pet('dog', 'Pip', 11)], ['none']);
    const b = inv([], []);
    const empty = T.trSwap(a, [], b, []);
    assert.equal(empty.ok, false);
    const cleaned = T.trCleanOffer(a, [{kind: 'acc', id: 'none', n: 'None'}]);
    assert.equal(cleaned.length, 0);
  });
});
