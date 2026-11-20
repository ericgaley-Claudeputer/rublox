const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const S = require('../dev/shelter/shelter_logic.js');

describe('Wagwell Shelter', () => {
  test('uses a new save key and leaves old progress fields optional', () => {
    assert.equal(S.SH_KEY, 'rubloxShelter');
    const s = S.shLoad({rescued: 2, ups:{food:1}, pets:[{id:'p1', kind:'cat', name:'Miso', trait:'calm', fed:40, clean:40, play:40}]});
    assert.equal(s.rescued, 2);
    assert.equal(s.ups.food, 1);
    assert.equal(s.pets[0].name, 'Miso');
    assert.equal(S.shLoad(null).pets.length, 0);
  });

  test('you can rescue, care, and match a pet to a townsfolk family wish', () => {
    let state = S.shFresh();
    const stray = S.shRollStray(() => 0, 1);
    stray.kind = 'cat'; stray.trait = 'calm';
    const got = S.shRescue(state, stray);
    assert.equal(got.ok, true);
    state = got.state;
    let pet = state.pets[0];
    for (let i = 0; i < 4; i++){
      ['fed','clean','play'].forEach(act => {
        const r = S.shCare(state, pet.id, act);
        assert.equal(r.ok, true);
        state = r.state;
      });
    }
    pet = state.pets[0];
    assert.equal(S.shReady(pet), true);
    const no = S.shMatch(state, pet.id, 'puddle');
    assert.equal(no.ok, false);
    const yes = S.shMatch(state, pet.id, 'bramble');
    assert.equal(yes.ok, true);
    assert.ok(yes.coins > 0);
    assert.equal(yes.state.pets.length, 0);
    assert.equal(yes.state.matched, 1);
  });

  test('kennel upgrades cost coins, and a full shelter refuses another rescue', () => {
    let state = S.shFresh();
    const buy = S.shBuyUpgrade(state, 'kennels', 10);
    assert.equal(buy.ok, false);
    const ok = S.shBuyUpgrade(state, 'kennels', 80);
    assert.equal(ok.ok, true);
    assert.equal(ok.coins, 40);
    state = ok.state;
    assert.equal(state.kennels, 6);
    for (let i = 0; i < 6; i++){
      const s = S.shRollStray(() => 0.2, i + 2);
      const r = S.shRescue(state, s);
      assert.equal(r.ok, true);
      state = r.state;
    }
    const full = S.shRescue(state, S.shRollStray(() => 0.3, 99));
    assert.equal(full.ok, false);
    assert.equal(full.why, 'full');
  });

  test('a ready pet can be sent to the existing pet collection as an optional field', () => {
    let state = S.shFresh();
    const stray = S.shRollStray(() => 0, 1);
    state = S.shRescue(state, stray).state;
    const id = state.pets[0].id;
    for (let i = 0; i < 4; i++) ['fed','clean','play'].forEach(act => { state = S.shCare(state, id, act).state; });
    const empty = {v:2, pets:[]};
    const sent = S.shSendHome(state, id, empty);
    assert.equal(sent.ok, true);
    assert.equal(sent.pets.pets.length, 1);
    assert.equal(sent.pets.pets[0].src, 'shelter');
    assert.ok(S.SH_KINDS.some(k => k.id === sent.pets.pets[0].k));
    assert.equal(sent.state.pets.length, 0);
    const cap = {v:2, pets: new Array(6).fill(0).map((_,i) => ({k:'cat', n:'P'+i}))};
    state = S.shFresh();
    state = S.shRescue(state, stray).state;
    const pid = state.pets[0].id;
    for (let i = 0; i < 4; i++) ['fed','clean','play'].forEach(act => { state = S.shCare(state, pid, act).state; });
    const blocked = S.shSendHome(state, pid, cap);
    assert.equal(blocked.ok, false);
    assert.equal(blocked.why, 'full');
  });
});

  test('grooming uses optional fields, boosts happiness, and helps a pet get adopted sooner', () => {
    let state = S.shFresh();
    const stray = S.shRollStray(() => 0, 1);
    state = S.shRescue(state, stray).state;
    const id = state.pets[0].id;
    const before = S.shHappiness(state.pets[0]);
    assert.equal(state.pets[0].style, 'natural');
    assert.equal(state.pets[0].bow, 'none');
    ['wash','brush'].forEach(act => { state = S.shGroom(state, id, act).state; });
    state = S.shGroom(state, id, 'trim', 'fluffy').state;
    state = S.shGroom(state, id, 'bow', 'gold').state;
    state = S.shGroom(state, id, 'dye', 'lilac').state;
    const pet = state.pets[0];
    assert.ok(S.shHappiness(pet) > before);
    assert.equal(pet.style, 'fluffy');
    assert.equal(pet.bow, 'gold');
    assert.ok(pet.groomed >= 70);
    // old saves without groom fields still load
    const old = S.shLoad({rescued:1, pets:[{id:'p9', kind:'cat', name:'Miso', trait:'calm', fed:40, clean:40, play:40}]});
    assert.equal(old.pets[0].name, 'Miso');
    assert.equal(old.pets[0].style, 'natural');
    // a groomed pal is ready sooner than an ungroomed pal with the same care
    const mid = S.shCleanPet({id:'a', kind:'dog', name:'Scout', trait:'playful', fed:60, clean:60, play:60, groomed:80, style:'fluffy', bow:'red'});
    const plain = S.shCleanPet({id:'b', kind:'dog', name:'Biscuit', trait:'playful', fed:60, clean:60, play:60});
    assert.equal(S.shReady(plain), false);
    assert.equal(S.shReady(mid), true);
  });

  test('contest judges score player pets, refuse NPC rivals, and award ribbons', () => {
    let state = S.shFresh();
    const stray = S.shRollStray(() => 0, 1);
    stray.kind = 'dog'; stray.trait = 'playful';
    state = S.shRescue(state, stray).state;
    const pet = state.pets[0];
    state = S.shGroom(state, pet.id, 'wash').state;
    state = S.shGroom(state, pet.id, 'trim', 'fluffy').state;
    state = S.shGroom(state, pet.id, 'bow', 'gold').state;
    let show = S.shNewShow('fluff', 10, 'solo');
    assert.equal(S.shEnterShow(show, pet, {id:'npc-judge', npc:true, name:'Fake'}).ok, false);
    assert.equal(S.shEnterShow(show, pet, {id:'p1', name:'Tessa'}).ok, true);
    const judged = S.shJudgeShow(state, show);
    assert.equal(judged.ok, true);
    assert.ok(judged.coins > 0);
    assert.ok(judged.show.entries[0].score > 0);
    assert.ok(judged.show.entries[0].ribbon);
    assert.equal(judged.state.shows, 1);
    const versus = S.shNewShow('groomed', 11, 'versus');
    const p2 = S.shCleanPet({id:'p-other', kind:'cat', name:'Pip', trait:'calm', fed:90, clean:90, play:90, groomed:40, style:'neat'});
    S.shEnterShow(versus, pet, {id:'p1', name:'Tessa'});
    S.shEnterShow(versus, p2, {id:'p2', name:'Rio'});
    const vs = S.shJudgeShow(state, versus);
    assert.equal(vs.ok, true);
    assert.equal(vs.show.entries.length, 2);
    assert.ok(vs.show.entries.some(e => e.winner));
    assert.equal(S.shRealPlayersOnly([{id:'p1'}, {id:'npc-1', npc:true}, {id:'npc-host'}]).every(p => !p.npc), true);
  });
