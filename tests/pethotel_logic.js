'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert');
let pass = 0, fail = 0;
const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };

const SRC = fs.readFileSync(path.join(__dirname, '../dev/pethotel/pethotel.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '../version.json'), 'utf8'));

chk('BUILD is 2026.11.12-16 and matches version.json', html.includes("const BUILD = '2026.11.12-16'") && version.build === '2026.11.12-16', version);

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
  vm.runInContext(SRC + `\n;globalThis.A = {get ph(){ return ph; }, PH_KEY, PH_CARES, PH_PETS, PH_GUESTS, PH_STATIONS, PH_CARE_ICON, PH_NEED_LABEL, PH_CARE_LABEL, PH_DESK_ICON, PH_HOTEL_ICON, PH_BAD_GLYPHS, phPetOf, phFreshSave, phLoadSave, phWriteSave, phPayout, phCaresLeft, phReadyOut, phNewStay, phCheckIn, phDoCare, phCheckOut, phActAt, phDo, phNearStation, phPrompt, phHud, phNeedsBarHtml, phHudTextHasBadGlyph, phApplyMood, phMakePetMesh, phCareDoneCount, phMeshBudget, buildPetHotel, petHotelEnter, petHotelStop, petHotelUpdate, phKey, phPad, phWire, phFromHost, drawPetHotel};`, ctx);
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


/* ---------- polish: cute pets, cozy hotel, needs bar, safe glyphs ---------- */
(function(){
  const bad = W.A.PH_BAD_GLYPHS || ['🍽️','🛏️','🛎️','🫘','🛁'];
  const icons = W.A.PH_CARE_ICON;
  chk('needs-bar icons are the safe food, bath, play, sleep glyphs', !!(icons && icons.feed === '🍖' && icons.bathe === '💧' && icons.play === '🎾' && icons.bed === '💤'), icons);
  const waitingHud = (W.els['#phBox'] || W.els['phBox'] || {}).innerHTML || '';
  // rebuild a stay bar from a fresh world so we can inspect HTML
  const bar0 = W.A.phNeedsBarHtml({done:{feed:false,bathe:false,play:false,bed:false}, petName:'Puddle'});
  const bar1 = W.A.phNeedsBarHtml({done:{feed:true,bathe:false,play:false,bed:false}, petName:'Puddle'});
  chk('needs bar lists Feed, Bath, Play, and Sleep for each pet', /Feed/.test(bar0) && /Bath/.test(bar0) && /Play/.test(bar0) && /Sleep/.test(bar0) && /data-care="feed"/.test(bar0) && /data-care="bed"/.test(bar0), bar0);
  chk('needs bar marks a finished care as done (and leaves the others open)', /phneed on/.test(bar1) && (bar1.match(/class="phneed on"/g)||[]).length === 1 && (bar1.match(/class="phneed"/g)||[]).length === 3, bar1);
  chk('needs bar and hotel icons never use the broken-box glyphs', !W.A.phHudTextHasBadGlyph(bar0) && !W.A.phHudTextHasBadGlyph(bar1) && !W.A.phHudTextHasBadGlyph(W.A.phPrompt('desk')) && !bad.some(g => (W.A.PH_DESK_ICON||'').indexOf(g)>=0 || Object.values(icons||{}).join('').indexOf(g)>=0), {bar0, prompt:W.A.phPrompt('desk')});
  const petE = (W.A.PH_PETS||[]).map(p => p.e).join('');
  chk('pet header glyphs are simple characters (no broken bean / plate / bed / bell)', !bad.some(g => petE.indexOf(g)>=0 || ((W.A.PH_PETS||[]).some(p => /🍽️|🛏️|🛎️|🫘/.test(p.e)))), {glyphs:(W.A.PH_PETS||[]).map(p=>p.e)});

  const Pw = world();
  Pw.A.buildPetHotel();
  const kinds = (Pw.A.ph && Pw.A.ph.kinds) || {};
  chk('cozy hotel has wallpaper, windows, plants, a rug, and a front-desk bell', (kinds.wallpaper|0) >= 2 && (kinds.window|0) >= 2 && (kinds.plant|0) >= 2 && (kinds.rug|0) >= 1 && (kinds.bell|0) >= 1, kinds);
  chk('snack nook has food bowls and a treat shelf', (kinds.bowl|0) >= 2 && (kinds.shelf|0) >= 1 && (kinds.treat|0) >= 3, kinds);
  chk('wash room has a tub with bubbles', (kinds.tub|0) >= 1 && (kinds.bubble|0) >= 3, kinds);
  chk('play nook has several toys', (kinds.toy|0) >= 5, kinds);
  chk('sleep rooms have pet beds with blankets', (kinds.bed|0) >= 4, kinds);

  const pet = Pw.A.ph && Pw.A.ph.petM;
  chk('pets have big eyes, ears, and a tail', !!(pet && pet.userData && pet.userData.eyes && pet.userData.ears && pet.userData.tail), pet && pet.userData && Object.keys(pet.userData));
  chk('pets have a visible happy/sad mood (hearts and bubbles)', !!(pet && pet.userData && pet.userData.hearts && pet.userData.tears), pet && pet.userData);

  Pw.A.phDo('desk');
  Pw.A.phHud();
  const mood0 = Pw.A.phApplyMood(Pw.A.ph.petM, Pw.A.ph.stay);
  chk('a freshly checked-in pet looks sad until you care for it', mood0 === 'sad' && !!(Pw.A.ph.petM.userData.tears && Pw.A.ph.petM.userData.tears.visible) && !Pw.A.ph.petM.userData.hearts.visible, {mood0, tears:Pw.A.ph.petM.userData.tears && Pw.A.ph.petM.userData.tears.visible, hearts:Pw.A.ph.petM.userData.hearts && Pw.A.ph.petM.userData.hearts.visible});
  Pw.A.phDo('feed'); Pw.A.phDo('bathe');
  const mood1 = Pw.A.phApplyMood(Pw.A.ph.petM, Pw.A.ph.stay);
  chk('after care the pet looks happy and shows hearts', mood1 === 'happy' && !!(Pw.A.ph.petM.userData.hearts && Pw.A.ph.petM.userData.hearts.visible) && !Pw.A.ph.petM.userData.tears.visible, {mood1});
  chk('after care the pet stays at the last station you used', Pw.A.ph.at === 'bathe', Pw.A.ph.at);
  Pw.A.phHud();
  const hud = (Pw.els['#phBox'] || {}).innerHTML || '';
  chk('the header needs bar uses safe glyphs after a feed (no broken box)', /🍖/.test(hud) && /Puddle|Mochi|Bumble|Noodle|Pippa|Tater/.test(hud) && !Pw.A.phHudTextHasBadGlyph(hud) && !/▯|�/.test(hud), hud);

  const L = world(); L._low = true; L.A.buildPetHotel();
  const lk = (L.A.ph && L.A.ph.kinds) || {};
  const mats = L.A.ph && L.A.ph._mats && Object.keys(L.A.ph._mats).length;
  const geos = L.A.ph && L.A.ph._geo && Object.keys(L.A.ph._geo).length;
  const budget = L.A.phMeshBudget();
  chk('Low graphics reuses shared basic materials and unit geometry (old Mac)', mats >= 8 && geos >= 2 && geos <= 12 && budget > 20 && budget <= 180, {mats, geos, budget, kinds:lk});
  chk('Low path still has the readable stations (bowls, tub, toys, beds) with fewer extras', (lk.bowl|0) >= 2 && (lk.tub|0) >= 1 && (lk.toy|0) >= 5 && (lk.bed|0) >= 4 && (lk.bubble|0) >= 3 && (lk.bubble|0) <= 6 && (lk.plant|0) <= (kinds.plant|0), {low:lk, high:kinds});
  L.A.petHotelStop();
  Pw.A.petHotelStop();
})();



(function(){
  const start = SRC.indexOf('Collision walls match the visual wallpaper height');
  const end = SRC.indexOf('wallpaper skins just inside the collision walls', start);
  const block = start >= 0 && end > start ? SRC.slice(start, end) : '';
  const plats = [...block.matchAll(/plat\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*'#[^']+'\s*,\s*(-?[\d.]+)\s*\)/g)]
    .map(m => ({x:+m[1], top:+m[2], z:+m[3], w:+m[4], d:+m[5], h:+m[6]}));
  chk('Pet Hotel collision walls reach the 4 m wallpaper top so the camera cannot fly over a short box',
    plats.length === 5 && plats.every(p => p.top === 4 && p.h === 4), plats);

  chk('index clips the Pet Hotel orbit camera along the look-segment, not just the orbit point',
    /function clipOrbitCam\(/.test(html) && /function camSolidAt\(/.test(html) &&
    /dist = clipOrbitCam\(/.test(html) && html.includes("mode === 'pethotel'"));

  const a = html.indexOf('function camSolidAt(');
  const b = html.indexOf('function updateCamera(){', a);
  assert.ok(a >= 0 && b > a, 'could not extract clipOrbitCam');
  const ctx = {Math, cam: {yaw: Math.PI / 2, pitch: 0.2, dist: 11}, solids: []};
  vm.createContext(ctx);
  vm.runInContext(html.slice(a, b), ctx);

  // Real +X wallpaper wall: plat(13.7, 4, 2.5, 0.5, 25, …, 4) → mesh y = 2, hh = 2 (top = 4).
  const wall = {mesh:{position:{x:13.7, y:2, z:2.5}, visible:true, material:{transparent:false}}, hw:0.25, hh:2, hd:12.5, active:true};
  ctx.solids = [wall];
  const tx = 12.5, ty = 2.25, tz = 2.5, want = 11;
  const dist = ctx.clipOrbitCam(tx, ty, tz, want, 1.2);
  const cp = Math.cos(0.2);
  const camX = tx + Math.sin(ctx.cam.yaw) * cp * dist;
  const rawX = tx + Math.sin(ctx.cam.yaw) * cp * want;
  const camY = ty + Math.sin(0.2) * dist;
  chk('Pet Hotel third-person camera is pulled in before a wall can hide the player (including a shot just over the wall top)',
    dist < want - 1 && camX < 13.7 && rawX > 13.7 && camY < 4.5,
    {dist, want, camX, rawX, camY, wallTop: 4});

  const open = {Math, cam: {yaw: 0, pitch: 0.2, dist: 11}, solids: [wall]};
  vm.createContext(open);
  vm.runInContext(html.slice(a, b), open);
  const openDist = open.clipOrbitCam(0, 2.25, 0, 11, 1.2);
  chk('an open Pet Hotel orbit (looking down the room, not through a wall) keeps the full camera distance',
    Math.abs(openDist - 11) < 1e-9, {openDist});
})();



(function(){
  // Visual skins must not poke past the collision inner faces, and walls must meet at corners.
  const src = SRC;
  const start = src.indexOf('Collision walls match the visual wallpaper height');
  const end = src.indexOf('lobby rug with a border', start);
  const block = start >= 0 && end > start ? src.slice(start, end) : '';
  const plats = [...block.matchAll(/plat\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*'#[^']+'\s*,\s*(-?[\d.]+)\s*\)/g)]
    .map(m => ({x:+m[1], top:+m[2], z:+m[3], w:+m[4], d:+m[5], h:+m[6]}));
  const papers = [...block.matchAll(/phPaperWall\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/g)]
    .map(m => ({x:+m[1], y:+m[2], z:+m[3], w:+m[4], h:+m[5], d:+m[6]}));
  const front = plats.filter(p => p.d < p.w && p.z < 0).sort((a,b)=>a.z-b.z)[0];
  const left = plats.filter(p => p.w < p.d && p.x < 0).sort((a,b)=>a.x-b.x)[0];
  const right = plats.filter(p => p.w < p.d && p.x > 0).sort((a,b)=>b.x-a.x)[0];
  const frontInner = front ? front.z + front.d/2 : null;
  const leftInner = left ? left.x + left.w/2 : null;
  const rightInner = right ? right.x - right.w/2 : null;
  const paperFront = papers.filter(p => p.d < p.w && p.z < 0)[0];
  const paperLeft = papers.filter(p => p.w < p.d && p.x < 0)[0];
  const paperRight = papers.filter(p => p.w < p.d && p.x > 0)[0];
  const paperFrontInner = paperFront ? paperFront.z + paperFront.d/2 : null;
  const paperLeftInner = paperLeft ? paperLeft.x + paperLeft.w/2 : null;
  const paperRightInner = paperRight ? paperRight.x - paperRight.w/2 : null;
  const frontOk = paperFrontInner != null && paperFrontInner <= frontInner + 0.02;
  const leftOk = paperLeftInner != null && paperLeftInner <= leftInner + 0.02;
  const rightOk = paperRightInner != null && paperRightInner >= rightInner - 0.02;
  const frontLo = front.x - front.w/2, frontHi = front.x + front.w/2;
  const leftHi = left.x + left.w/2, rightLo = right.x - right.w/2;
  const cornersSealed = frontLo <= leftHi + 0.01 && frontHi >= rightLo - 0.01
    && (left.z - left.d/2) <= (front.z + front.d/2) + 0.01;
  chk('Pet Hotel wallpaper sits on or inside the collision inner faces and walls meet at the corners',
    plats.length >= 5 && papers.length >= 5 && frontOk && leftOk && rightOk && cornersSealed
      && paperFront.h >= 3.9 && paperLeft.h >= 3.9,
    {frontInner, paperFrontInner, leftInner, paperLeftInner, rightInner, paperRightInner, cornersSealed, paperH: paperFront && paperFront.h, nPlats: plats.length, nPapers: papers.length});

  const R = 0.45;
  const wall = {mesh:{position:{x:13.7, y:2, z:2.15}}, hw:0.25, hh:2, hd:12.9, active:true};
  const frontW = {mesh:{position:{x:0, y:2, z:-10.5}}, hw:13.7, hh:2, hd:0.25, active:true};
  const visRight = 13.45, visFront = -10.25;
  const ctx = {
    Math,
    cam: {yaw: -Math.PI / 2, pitch: 0, dist: 6},
    solids: [wall, frontW],
    mode: 'pethotel',
    P: {x: 12.5, y: 0.05, z: -9.0, px: 12.5, py: 0.05, pz: -9.0, vx: 16, vy: 0, vz: -16},
    camera: {position: {x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }}, near: 0.1, lookAt(){}, updateProjectionMatrix(){}},
    fpOn: () => true,
    R,
    bodyH: () => 2.8,
    eyeHeight: () => 2.45,
    overlaps(b, pad, B){
      B = B || ctx.P; pad = pad || 0;
      if (!b || !b.mesh) return false;
      const p = b.mesh.position, rad = 0.45;
      return Math.abs(B.x - p.x) < b.hw + rad + pad && Math.abs(B.z - p.z) < b.hd + rad + pad;
    }
  };
  const bodySlice = html.slice(html.indexOf('function camBodyR('), html.indexOf('function input(){'));
  const clipSlice = html.slice(html.indexOf('function camSolidAt('), html.indexOf('function updateCamera(){'));
  vm.createContext(ctx);
  vm.runInContext(bodySlice + '\n' + clipSlice + '\nthis.clipFpCamera = clipFpCamera; this.recoverFpPlayer = recoverFpPlayer; this.ejectXZ = ejectXZ; this.camSolidAt = camSolidAt; this.camBodyR = camBodyR; this.clipOrbitCam = clipOrbitCam;', ctx);
  function bump(axis){
    ctx.solids.forEach(b => {
      const p = b.mesh.position;
      const rad = ctx.camBodyR(ctx.P);
      const px = (b.hw + rad) - Math.abs(ctx.P.x - p.x);
      const pz = (b.hd + rad) - Math.abs(ctx.P.z - p.z);
      if (px <= 0 || pz <= 0) return;
      if (axis === 'x' && px <= pz + 1e-6) ctx.ejectXZ('x', ctx.P, b);
      if (axis === 'z' && pz <= px + 1e-6) ctx.ejectXZ('z', ctx.P, b);
    });
  }
  const near = 0.05, need = near * 2;
  let minRight = 99, minFront = 99, inside = false;
  const dt = 1/60;
  for (let i = 0; i < 240; i++){
    ctx.P.px = ctx.P.x; ctx.P.x += ctx.P.vx * dt; bump('x');
    ctx.P.pz = ctx.P.z; ctx.P.z += ctx.P.vz * dt; bump('z');
    if (ctx.recoverFpPlayer) ctx.recoverFpPlayer();
    ctx.clipFpCamera();
    const cam = ctx.camera.position;
    const dR = visRight - cam.x;
    const dF = cam.z - visFront;
    if (dR < minRight) minRight = dR;
    if (dF < minFront) minFront = dF;
    if (dR < need - 1e-6 || dF < need - 1e-6) inside = true;
    if (ctx.camSolidAt(cam.x, cam.y, cam.z, 0.02)) inside = true;
  }
  chk('Pet Hotel first-person keeps the eye at least near*2 from visual walls, including in a corner',
    !inside && minRight >= need && minFront >= need && ctx.camera.near <= 0.05,
    {minRight, minFront, need, cam: {x: ctx.camera.position.x, y: ctx.camera.position.y, z: ctx.camera.position.z}, P: {x: ctx.P.x, z: ctx.P.z}, near: ctx.camera.near});

  const tx = 13.7 - 0.25 - 0.85, ty = 2.25, tz = 2.15;
  ctx.cam.yaw = Math.PI / 2;
  ctx.cam.pitch = 0.42;
  const dist = ctx.clipOrbitCam(tx, ty, tz, 6, 1.2);
  const cp = Math.cos(0.42), sx = Math.sin(ctx.cam.yaw);
  const camX = tx + sx * cp * dist;
  const wallInner = 13.7 - 0.25;
  const raw12 = tx + sx * cp * 1.2;
  chk('the first third-person frame after V is already clipped and is not left inside a Pet Hotel wall',
    dist < 1.2 - 1e-6 && camX < wallInner - 0.05 && raw12 >= wallInner - 0.4,
    {dist, camX, wallInner, raw12, tx});
  chk('setFP applies updateCamera on the same tick so the first frame after V is clipped',
    /function setFP\(on, quiet\)\{/.test(html) && /if \(running && typeof updateCamera === 'function'\) updateCamera\(\);/.test(html));
})();

console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
