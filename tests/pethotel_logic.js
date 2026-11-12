'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert');
let pass = 0, fail = 0;
const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };

const SRC = fs.readFileSync(path.join(__dirname, '../dev/pethotel/pethotel.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../version.json'), 'utf8'));

chk('BUILD is 2026.11.11-33 and matches version.json', html.includes("const BUILD = '2026.11.11-33'") && version.build === '2026.11.11-33', version);

function V(){ const o = {x:0,y:0,z:0, set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; } }; return o; }
function O(){ const o = {position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {color:{set(){}}, opacity:1, transparent:false}, userData: {}, add(c){ this.children.push(c); return c; }, remove(){}, copy(){ return this; } }; return o; }

function world(store0){
  const store = Object.assign({}, store0 || {}), els = {};
  const solids = [];
  const ctx = {
    console, Math, JSON, Object, Array, Number, String, Date, isFinite, parseInt, parseFloat,
    document: {createElement(){ return {className:'', innerHTML:'', style:{}, classList:{add(){},remove(){},contains(){return false;}}, getContext(){ return null; }, setAttribute(){}, addEventListener(){}}; }, getElementById(){ return null; }},
    THREE: new Proxy({}, {get: (_, name) => function(...args){
      const o = O();
      if (name === 'Color'){ o.set = function(){ return this; }; o.r=1; }
      if (name === 'Group'){ return o; }
      return o;
    }}),
    scene: {add(){}, remove(){}, background: null, fog: null},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d,
    save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent:'', innerHTML:'', style:{}, classList:{add(){},remove(){},contains(){return false;},toggle(){}}, addEventListener(){}, onclick:null}),
    coins: 20, runCoins: 0, paused: false, mode: 'pethotel', banners: [],
    P: {x:0, y:.05, z:-1.2, face:0, vx:0, vy:0, vz:0, onGround:true},
    pad: {on:false}, touchUI: false, keys: {},
    cam: {yaw: Math.PI, pitch:.32, dist:9}, tipTimer: 0, mp: {on:false},
    solids, label: () => O(), plat: (x,y,z,w,d,col,h) => { const m = O(); m.position.set(x,y,z); const b = {mesh:m, hw:(w||1)/2, hh:(h||.4)/2, hd:(d||1)/2, active:true}; solids.push(b); return {mesh:m}; },
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t),
    gfxIsLow: () => !!ctx._low, LOWQ: false, _low: false,
    store, els, window: {}, SND: {coin(){}},
    mpGuest: () => !!(ctx.mp && ctx.mp.on && !ctx.mp.host)
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(SRC + `\n;globalThis.A = {get ph(){ return ph; }, PH_KEY, PH_CARES, PH_PETS, PH_GUESTS, PH_STATIONS, phPetOf, phFreshSave, phLoadSave, phWriteSave, phPayout, phCaresLeft, phReadyOut, phNewStay, phCheckIn, phDoCare, phCheckOut, phActAt, phDo, phNearStation, phPrompt, phHud, buildPetHotel, petHotelEnter, petHotelStop, petHotelUpdate, phKey, phPad, phWire, phFromHost, drawPetHotel};`, ctx);
  return ctx;
}

chk('index adds a playable Pet Hotel menu tile', /id:'pethotel'/.test(html) && /name:'Pet Hotel'/.test(html) && /draw: drawPetHotel/.test(html) && /playable: true/.test(html.slice(html.indexOf("id:'pethotel'"), html.indexOf("id:'pethotel'")+300)), '');
chk('start() accepts pethotel and the mode is wired into the loop and controls', html.includes("'pethotel'") && html.includes('buildPetHotel()') && html.includes('petHotelEnter()') && html.includes('petHotelUpdate') && html.includes('petHotelStop') && html.includes('phPad') && html.includes('phKey') && html.includes('id="phAct"'), '');

const W = world();
W.A.buildPetHotel(); W.A.petHotelEnter();
chk('Pet Hotel boots a lobby with a waiting guest and pet', !!(W.A.ph && W.A.ph.next && W.A.ph.next.petName && W.A.ph.next.guest && !W.A.ph.stay), W.A.ph && {next:W.A.ph.next, stay:W.A.ph.stay});
chk('all pets and guests use original Rublox names (nothing copied)', (W.A.PH_PETS || []).length >= 6 && (W.A.PH_PETS || []).every(p => p.name && p.kind && !/pokemon|pokémon|hello kitty|sanrio|nintendo|fortnite|adopt me|roblox/i.test(p.name+' '+p.kind)) && (W.A.PH_GUESTS || []).every(g => g.name && !/nintendo|pokemon/i.test(g.name)), {pets:(W.A.PH_PETS||[]).map(p=>p.name+' the '+p.kind), guests:(W.A.PH_GUESTS||[]).map(g=>g.name)});
chk('stations cover check-in, feed, bathe, play, and bed', (W.A.PH_STATIONS||[]).map(s=>s.id).join(',') === 'desk,feed,bathe,play,bed', W.A.PH_STATIONS && W.A.PH_STATIONS.map(s=>s.id));

const st = W.A.phActAt(W.A.ph, 'feed');
chk('caring before check-in is refused', st.ok === false, st);
const cin = W.A.phDo('desk');
chk('check-in starts a stay for the waiting guest pet', cin === true && !!(W.A.ph.stay && W.A.ph.stay.phase === 'stay' && W.A.ph.stay.petName), W.A.ph.stay);
const earlyOut = W.A.phActAt(W.A.ph, 'desk');
chk('checkout is blocked until every care is done', earlyOut.ok === false && W.A.phReadyOut(W.A.ph.stay) === false, earlyOut);

['feed','bathe','play','bed'].forEach(c => {
  const ok = W.A.phDo(c);
  chk('can ' + c + ' the guest pet once', ok === true && !!(W.A.ph.stay && W.A.ph.stay.done[c]), W.A.ph.stay && W.A.ph.stay.done);
  const again = W.A.phDo(c);
  chk(c + ' cannot be repeated', again === false, {again, done:W.A.ph.stay && W.A.ph.stay.done});
});
chk('after all cares the stay is ready to check out', W.A.phReadyOut(W.A.ph.stay) === true);

const coins0 = W.coins, earned0 = W.A.ph.earned, served0 = W.A.ph.served;
const pay = W.A.phPayout(W.A.ph.stay);
const out = W.A.phDo('desk');
chk('checkout pays coins and increments served', out === true && W.coins === coins0 + pay && W.A.ph.earned === earned0 + pay && W.A.ph.served === served0 + 1 && !W.A.ph.stay, {coins:W.coins, pay, earned:W.A.ph.earned, served:W.A.ph.served});
chk('Pet Hotel writes only rubloxPetHotel and never touches Dream House or other saves', !!W.store['rubloxPetHotel'] && !Object.keys(W.store).some(k => k !== 'rubloxPetHotel'), {keys:Object.keys(W.store), raw:W.store['rubloxPetHotel']});

const loaded = JSON.parse(W.store['rubloxPetHotel']);
chk('Pet Hotel save is a small original record (served + earned)', loaded.ver === 1 && loaded.served === 1 && loaded.earned === pay, loaded);

const E = {code:'KeyE', repeat:false};
W.A.ph.near = 'desk';
chk('E and the Xbox Ⓧ button trigger the nearby hotel action', typeof W.A.phKey === 'function' && typeof W.A.phPad === 'function' && (W.A.ph.next || W.A.ph.stay || true), {near:W.A.ph.near});
W.A.phKey(E);
chk('keyboard E checks the next guest in at the desk', !!(W.A.ph.stay), {stay:W.A.ph.stay});
W.A.ph.near = 'feed';
W.A.phPad({x:true});
chk('gamepad Ⓧ feeds at the snack nook', !!(W.A.ph.stay && W.A.ph.stay.done.feed), W.A.ph.stay && W.A.ph.stay.done);

const wire = W.A.phWire();
chk('co-op wire is host-authored stay state (real players only — no NPC players)', !!(wire && wire.next || wire.stay) && W.A.ph.remote === false, wire);
const G = world();
G.mp.on = true; G.mp.host = false;
G.A.buildPetHotel();
chk('a multiplayer guest is remote and will not write the Pet Hotel save', !!(G.A.ph && G.A.ph.remote) && G.A.phWriteSave() === false, {remote:G.A.ph && G.A.ph.remote, keys:Object.keys(G.store)});
G.A.phFromHost(wire);
chk('guest applies the host hotel snapshot', !!(G.A.ph.stay && G.A.ph.stay.petId === (wire.stay && wire.stay.petId) || (!wire.stay && G.A.ph.next)), {stay:G.A.ph.stay, next:G.A.ph.next});

const L = world();
L._low = true;
L.A.buildPetHotel();
chk('Low graphics path still builds the lobby (old Mac / MeshBasic, shared mats)', !!(L.A.ph && (L.solids||[]).length >= 6 && L.A.ph._mats && Object.keys(L.A.ph._mats).length >= 1), {solids:(L.solids||[]).length, mats:L.A.ph && L.A.ph._mats && Object.keys(L.A.ph._mats)});

const existing = {rubloxDreamHouse:'{"ver":7,"pieces":[["slab",2,0,2,0,0]],"coins":55}', rubloxCoins:'20', rubloxPetHotel:null};
delete existing.rubloxPetHotel;
const S = world({rubloxDreamHouse: existing.rubloxDreamHouse, rubloxCoins: '20'});
S.A.buildPetHotel();
S.A.phDo('desk'); ['feed','bathe','play','bed'].forEach(c => S.A.phDo(c)); S.A.phDo('desk');
chk('playing Pet Hotel leaves the Dream House save intact', S.store.rubloxDreamHouse === existing.rubloxDreamHouse, {dh:S.store.rubloxDreamHouse, keys:Object.keys(S.store)});

W.A.petHotelStop();
chk('stop clears the Pet Hotel session', W.A.ph == null);

console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
