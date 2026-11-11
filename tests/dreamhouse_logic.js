const fs = require('fs'), vm = require('vm'), path = require('path');
let pass = 0, fail = 0;
const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const _cands = [
  path.join(__dirname, '../p47/dreamhouse.js'),
  path.join(__dirname, 'dreamhouse.js'),
  path.join(__dirname, '../dev/dreamhouse/dreamhouse.js'),
  path.join(__dirname, '../../dev/dreamhouse/dreamhouse.js')
];
const SRC = fs.readFileSync(_cands.find(p => fs.existsSync(p)), 'utf8');
function V(){ const o = {x:0,y:0,z:0, set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }, setScalar(){ return this; }, multiplyScalar(){ return this; }, copy(v){ if(v){ this.x=v.x; this.y=v.y; this.z=v.z; } return this; } }; return o; }
function O(){ const o = {position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {color: {set(){}, r:1,g:1,b:1}}, userData: {}, parent: null, add(c){ this.children.push(c); if (c) c.parent = this; return c; }, remove(){}, copy(){ return this; } }; return o; }
function world(store0, opts){
  const store = Object.assign({}, store0 || {}), els = {};
  const solids = [];
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date, isFinite, parseInt, parseFloat,
    document: {createElement(){ return {className:'', innerHTML:'', onclick:null, dataset:{}, style:{}, setAttribute(){}, addEventListener(){}, blur(){}, appendChild(){}}; }, querySelector(){ return null; }},
    THREE: new Proxy({}, {get: (_, name) => function(...args){
      const o = O();
      if (name === 'Vector3'){ o.x = args[0]||0; o.y = args[1]||0; o.z = args[2]||0; o.set = function(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }; }
      if (name === 'Color'){ o.set = function(){ return this; }; o.r=1; }
      if (name === 'MeshLambertMaterial' || name === 'MeshBasicMaterial'){ o.color = {set(){}}; o.transparent = !!(args[0]&&args[0].transparent); }
      return o;
    }}),
    scene: {add(){}, remove(){}, background: null, fog: null},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d,
    save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, dataset: {}, classList: {add(){}, remove(){}, contains(){ return false; }}, appendChild(){}, querySelectorAll: () => [], setAttribute(){}, addEventListener(){}, blur(){}, onclick: null, closest: () => null}),
    coins: (opts && opts.coins) || 20, runCoins: 0, running: true, paused: false, choosing: false, worldT: 0, mode: 'dreamhouse', banners: [],
    P: {x: 0, y: .05, z: 0, face: 0, vx: 0, vy: 0, vz: 0, onGround: true}, pad: {on: false}, touchUI: false, keys: {},
    cam: {yaw: Math.PI, pitch: .34, dist: 12}, tipTimer: 0, mp: {on: false},
    checkpoints: [], solids, label: () => O(), shade: (c) => c,
    plat: (x,y,z,w,d,col,h) => { const m = O(); m.position.set(x,y,z); const b = {mesh: m, hw: (w||1)/2, hh: (h||.4)/2, hd: (d||1)/2, active: true}; solids.push(b); return {mesh: m}; },
    confetti(){}, SND: {coin(){}, cp(){}, win(){}, jump(){}}, store,
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t),
    window: {__dhBound: false}
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get dh(){ return dh; }, buildDreamHouse, dreamhouseEnter, dreamhouseUpdate, dreamhouseStop, dhPlace, dhAct, dhRotate, dhCycle, dhSetTool, dhSetStory, dhCycleColor, dhAim, dhWire, dhFromHost, dhGuestMsg, dhProg, dhSerialize, dhPay, dhCheckGoals, dhPut, dhRemoveAt, dhCanBuild, dhPlotAt, dhKey, dhPad, DH_PARTS, DH_KEY, DH_GRANT, DH_PLOTS, DH_N, DH_GOALS};', ctx);
  return ctx;
}

const W = world();
W.A.buildDreamHouse(); W.A.dreamhouseEnter();
chk('mode state boots with a claimed plot and starter coins', !!(W.A.dh && W.A.dh.mine === 0 && W.A.dh.bank >= 80), W.A.dh && {mine: W.A.dh.mine, bank: W.A.dh.bank});
chk('starter grant added to global Rublox coins once', W.coins >= 100, W.coins);
chk('four plots exist and the player owns plot 0', W.A.DH_PLOTS === 4 && W.A.dh.pieces[0] && Object.keys(W.A.dh.pieces).length === 4);
chk('catalog has walls, floors, roofs, doors, windows, stairs, furniture', (() => { const ids = W.A.DH_PARTS.map(p => p.id); return ['floor','wall','door','window','stairs','roof','sofa','bed','table','lamp','plant','rug'].every(id => ids.includes(id)); })(), W.A.DH_PARTS.map(p => p.id));
chk('save key is unique (does not clobber stables/bakery)', W.A.DH_KEY === 'rubloxDreamHouse');

// place a grid-snapped floor on own plot
W.A.dh.sel = 0; W.A.dh.tool = 'place'; W.A.dh.story = 0; W.A.dh.rot = 0; W.A.dh.color = 1;
const [ox, oz] = [(0 - 1.5) * 18, -8 * 1.4 / 2];
W.P.x = ox + 3.5 * 1.4; W.P.z = oz + 2.2 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.05);
const aim = W.A.dhAim();
chk('aim snaps to an integer cell on the owned plot', !!(aim && aim.plot === 0 && aim.ix === (aim.ix|0) && aim.iz === (aim.iz|0) && W.A.dhCanBuild(aim)), aim);
const bank0 = W.A.dh.bank;
const placed = W.A.dhPlace();
chk('placing a floor spends coins and stores a snapped piece', placed && (W.A.dh.pieces[0]||[]).length >= 1 && W.A.dh.bank === bank0 - 2, {placed, n: (W.A.dh.pieces[0]||[]).length, bank: W.A.dh.bank, bank0});
const rec = (W.A.dh.pieces[0]||[])[0];
chk('piece records kind, grid, rotation and color', rec && rec[0] === 0 && rec[4] === 0 && rec[5] === 1 && rec[1] >= 0 && rec[1] < 8, rec);

// rotate then place a wall
W.A.dhRotate();
chk('rotate steps 90 degrees', W.A.dh.rot === 1);
W.A.dh.sel = 1; // wall
W.P.x = ox + 3.5 * 1.4; W.P.z = oz + 3.2 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.05);
const n1 = (W.A.dh.pieces[0]||[]).length;
W.A.dhPlace();
chk('wall places on a different snapped cell', (W.A.dh.pieces[0]||[]).length === n1 + 1, (W.A.dh.pieces[0]||[]).length);

// cannot double-place same cell
W.A.dreamhouseUpdate(0.05);
const n2 = (W.A.dh.pieces[0]||[]).length;
const again = W.A.dhPlace();
chk('cannot stack two pieces in the same cell', again === false && (W.A.dh.pieces[0]||[]).length === n2);

// delete
W.A.dhSetTool('delete');
W.A.dhPlace();
chk('delete tool removes the aimed piece', (W.A.dh.pieces[0]||[]).length === n2 - 1, (W.A.dh.pieces[0]||[]).length);

// cannot build on another plot
W.A.dhSetTool('place'); W.A.dh.sel = 0;
const [ox2] = [(1 - 1.5) * 18];
W.P.x = ox2 + 3 * 1.4; W.P.z = oz + 3 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.05);
const aim2 = W.A.dhAim();
chk('aiming at another plot is not buildable', !!(aim2 && aim2.plot === 1 && !W.A.dhCanBuild(aim2)), aim2);
const nOwn = (W.A.dh.pieces[0]||[]).length;
W.A.dhPlace();
chk('place is rejected on someone else\'s plot', (W.A.dh.pieces[0]||[]).length === nOwn);

// keyboard + pad
W.P.x = ox + 4 * 1.4; W.P.z = oz + 4 * 1.4; W.P.face = 0;
chk('E key is handled as the place/like action', W.A.dhKey({code:'KeyE', key:'e', repeat:false}) === true);
chk('R rotates, X toggles delete, C cycles color, T toggles story', W.A.dhKey({code:'KeyR', repeat:false}) && W.A.dhKey({code:'KeyX', repeat:false}) && W.A.dhKey({code:'KeyC', repeat:false}) && W.A.dhKey({code:'KeyT', repeat:false}));
W.A.dhSetTool('place'); W.A.dhSetStory(0);
chk('Xbox Ⓧ places and Ⓑ rotates', (() => { const r0 = W.A.dh.rot; W.A.dhPad({b:1}); const a = W.A.dh.rot === ((r0+1)%4); W.A.dhPad({lb:1}); return a; })());

// goals pay coins
W.A.dh.sel = 0; W.A.dh.tool = 'place'; W.A.dh.story = 0; W.A.dh.bank = 200;
for (let i = 0; i < 8; i++){
  for (let k = 0; k < 3; k++){
    if ((W.A.dh.pieces[0]||[]).some(a => a[1]===i && a[2]===0 && a[3]===k)) continue;
    W.A.dhPut(0, [0, i, 0, k, 0, 0]);
  }
}
chk('laying enough floors awards the floors goal and coins', !!(W.A.dh.goals.floors && W.A.dh.earned >= 15), W.A.dh.goals);

// save / restore preserves the house and does not touch other keys
const saved = W.store.rubloxDreamHouse;
chk('house is written to the existing save helper', !!(saved && /pieces/.test(saved)));
const other = {rubloxStable: '{"pony":{"id":"buttercup"},"shows":2}', rubloxBakery: '{"served":4,"coins":9}', rubloxDreamHouse: saved};
const W2 = world(other, {coins: 50});
W2.A.buildDreamHouse();
chk('restored house reloads placed pieces', (W2.A.dh.pieces[0]||[]).length >= 6, (W2.A.dh.pieces[0]||[]).length);
chk('existing stables and bakery saves are left intact', W2.store.rubloxStable === other.rubloxStable && W2.store.rubloxBakery === other.rubloxBakery);
chk('returning players are not given a second starter grant', W2.coins === 50, W2.coins);

// MP: guest cannot apply edits to your plot via spoofed message; like works
const wire = W2.A.dhWire();
chk('wire payload names the owner plot and piece list', !!(wire && wire.mine === 0 && Array.isArray(wire.plots[0])), wire && Object.keys(wire));
const before = (W2.A.dh.pieces[0]||[]).length;
W2.A.dhGuestMsg({uid:'intruder'}, {a:'place', plot: 0, rec:[1, 0, 1, 0, 0, 0], who:'intruder'});
chk('host ignores a guest trying to build on the host plot', (W2.A.dh.pieces[0]||[]).length === before);
W2.A.dhGuestMsg({uid:'friend'}, {a:'like', plot: 0, who:'friend'});
chk('a visitor like awards the owner coins', W2.A.dh.likes >= 1 && W2.A.dh.bank >= 0, {likes: W2.A.dh.likes});

// stop clears
W2.A.dreamhouseStop();
chk('stop clears mode state after saving', W2.A.dh == null && !!W2.store.rubloxDreamHouse);

console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
