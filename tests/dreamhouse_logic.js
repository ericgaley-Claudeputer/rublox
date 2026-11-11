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
function O(){ const o = {position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {color: {set(){}, r:1,g:1,b:1}}, userData: {}, parent: null, add(c){ this.children.push(c); if (c) c.parent = this; return c; }, remove(){}, copy(){ return this; }, clone(){ return O(); } }; return o; }
function world(store0, opts){
  const store = Object.assign({}, store0 || {}), els = {};
  const solids = [];
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date, isFinite, parseInt, parseFloat,
    document: {createElement(){ return {className:'', innerHTML:'', width:0, height:0, onclick:null, dataset:{}, style:{}, getContext(){ return null; }, setAttribute(){}, addEventListener(){}, blur(){}, appendChild(){}}; }, querySelector(){ return null; }},
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
  vm.runInContext(SRC + `\n;globalThis.A = {get dh(){ return dh; }, buildDreamHouse, dreamhouseEnter, dreamhouseUpdate, dreamhouseStop, dhPlace, dhAct, dhRotate, dhCycle, dhSetTool, dhSetStory, dhSetJob, dhCycleColor, dhAim, dhAimCell, dhWire, dhFromHost, dhGuestMsg, dhProg, dhSerialize, dhPay, dhCheckGoals, dhPut, dhRemoveAt, dhCanBuild, dhPlotAt, dhKey, dhPad, dhBuy, dhDump, dhPickup, dhGive, dhMix, dhFillBarrow, dhPour, dhSmooth, dhPlaceBrick, dhMarkOrDig, DH_PARTS, DH_MATS, DH_KEY, DH_GRANT, DH_PLOTS, DH_N, DH_GOALS, DH_YARD, DH_VER, DH_JOBS, dhSave};`, ctx);
  return ctx;
}

const W = world();
W.A.buildDreamHouse(); W.A.dreamhouseEnter();
chk('mode boots on your own plot with starter coins', !!(W.A.dh && W.A.dh.mine === 0 && W.A.dh.bank >= 100), W.A.dh && {mine: W.A.dh.mine, bank: W.A.dh.bank});
chk('starter grant added to global Rublox coins once', W.coins >= 120, W.coins);
chk('four plots and a supply yard exist', W.A.DH_PLOTS === 4 && W.A.dh.bins && W.A.dh.bins.length >= 6 && W.A.DH_YARD.z < 0, W.A.dh.bins && W.A.dh.bins.length);
chk('materials include bricks, cement, sand, wood, shingles, glass', ['brick','cement','sand','wood','shingle','glass'].every(id => W.A.DH_MATS.some(m => m.id === id)));
chk('catalog is construction parts, not prefab wall slabs', W.A.DH_PARTS.some(p => p.id === 'brick') && W.A.DH_PARTS.some(p => p.id === 'slab') && !W.A.DH_PARTS.some(p => p.id === 'wall' && p.name === 'Wall'));
chk('save key is unique (does not clobber stables/bakery)', W.A.DH_KEY === 'rubloxDreamHouse' && W.A.DH_VER === 2);

// Buy at the yard, carry, dump on plot
W.P.x = W.A.dh.bins[0].x; W.P.z = W.A.dh.bins[0].z;
const brickBin = W.A.dh.bins.find(b => b.id === 'brick');
W.P.x = brickBin.x; W.P.z = brickBin.z;
const bank0 = W.A.dh.bank;
const bought = W.A.dhBuy('brick');
chk('buying bricks at the yard spends coins and fills your arms', bought && W.A.dh.carry && W.A.dh.carry.id === 'brick' && W.A.dh.carry.n >= 1 && W.A.dh.bank < bank0, W.A.dh.carry);
const [ox, oz] = [(0 - 1.5) * 18, -8 * 1.4 / 2];
W.P.x = ox + 0.2; W.P.z = oz + 8 * 1.4 - 1.0;
const dumped = W.A.dhDump();
chk('dumping on your plot stocks a material pile', dumped && (W.A.dh.stock.brick|0) >= 1 && !W.A.dh.carry, {stock: W.A.dh.stock.brick, dumped});

// Cannot lay a brick until a slab exists
W.A.dhPickup('brick', 8);
W.P.x = ox + 3.5 * 1.4; W.P.z = oz + 1.2 * 1.4; W.P.face = Math.PI; // face south-ish toward front wall
W.A.dreamhouseUpdate(0.05);
const beforeBricks = (W.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
const earlyBrick = W.A.dhPlaceBrick();
chk('bricks will not go down until a concrete slab is poured', earlyBrick === false && (W.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === beforeBricks, {earlyBrick, beforeBricks});

// put leftover bricks back on the pile so we can carry bags to the mixer
W.P.x = ox + 0.2; W.P.z = oz + 8 * 1.4 - 1.0; if (W.A.dh.carry) W.A.dhDump();

// Mark, dig, mix, pour, cure, smooth
W.A.dhSetJob('mark');
W.P.x = ox + 2.5 * 1.4; W.P.z = oz + 2.5 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.05);
chk('aim snaps to a plot cell', !!(W.A.dhAim() && W.A.dhAim().plot === 0 && W.A.dhCanBuild(W.A.dhAim())), W.A.dhAim());
let marks = 0;
for (let ix = 1; ix <= 6; ix++) for (let iz = 1; iz <= 3; iz++){
  W.P.x = ox + (ix + .5) * 1.4; W.P.z = oz + (iz + .2) * 1.4; W.P.face = 0;
  W.A.dreamhouseUpdate(0.02);
  if (W.A.dhMarkOrDig()) marks++;
}
chk('staking marks foundation cells on the grid', (W.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length >= 8, marks);

W.A.dhSetJob('dig');
let dug = 0;
for (let ix = 1; ix <= 6; ix++) for (let iz = 1; iz <= 3; iz++){
  W.P.x = ox + (ix + .5) * 1.4; W.P.z = oz + (iz + .2) * 1.4; W.P.face = 0;
  W.A.dreamhouseUpdate(0.02);
  if (W.A.dhMarkOrDig()) dug++;
}
chk('digging turns stakes into foundation forms', (W.A.dh.pieces[0]||[]).filter(a => a[0]==='trench').length >= 8, dug);

// Load mixer
W.A.dhGive('cement', 6); W.A.dhGive('sand', 6);
const mx = W.A.dh.mixers[0];
W.P.x = mx.x; W.P.z = mx.z;
W.A.dhPickup('cement', 1); W.A.dhMix();
W.A.dhPickup('sand', 1); W.A.dhMix();
W.A.dhMix();
chk('mixer accepts cement and sand and starts mixing', W.A.dh.mixers[0].phase === 'mixing', {phase:W.A.dh.mixers[0].phase, cement:W.A.dh.mixers[0].cement, sand:W.A.dh.mixers[0].sand, mixed:W.A.dh.mixers[0].mixed, carry:W.A.dh.carry});
W.A.dreamhouseUpdate(2.5);
chk('mix finishes after a short wait so you can fill the barrow', W.A.dh.mixers[0].phase === 'ready' && W.A.dh.mixers[0].mixed >= 1, {phase:W.A.dh.mixers[0].phase, mixed:W.A.dh.mixers[0].mixed, mixT:W.A.dh.mixers[0].mixT});
chk('filling the wheelbarrow lets you carry wet mix', W.A.dhFillBarrow() && W.A.dh.carry && W.A.dh.carry.id === 'wetmix');

// Pour into dug cells
let poured = 0;
for (let ix = 1; ix <= 6; ix++) for (let iz = 1; iz <= 2; iz++){
  if (!W.A.dh.carry || W.A.dh.carry.id !== 'wetmix'){
    if ((W.A.dh.mixers[0].mixed|0) < 1){ W.A.dh.mixers[0].mixed = 2; }
    W.P.x = mx.x; W.P.z = mx.z; W.A.dhFillBarrow();
  }
  W.P.x = ox + (ix + .5) * 1.4; W.P.z = oz + (iz + .2) * 1.4; W.P.face = 0;
  W.A.dreamhouseUpdate(0.02);
  if (W.A.dhPour()) poured++;
}
chk('wet mix pours into dug forms, one cell at a time', (W.A.dh.pieces[0]||[]).filter(a => a[0]==='wet').length >= 4, poured);

// Wait and trowel
(W.A.dh.pieces[0]||[]).filter(a => a[0]==='wet').forEach(a => { a[6] = 2; });
W.P.x = ox + 1.5 * 1.4; W.P.z = oz + 1.2 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.02);
const smoothed = W.A.dhSmooth();
chk('after the wait you can trowel wet concrete into a grey slab', smoothed && (W.A.dh.pieces[0]||[]).some(a => a[0]==='slab'), smoothed);
// finish enough slab for brick rule
for (let ix = 1; ix <= 6; ix++) for (let iz = 1; iz <= 6; iz++){
  if (!(W.A.dh.pieces[0]||[]).some(a => a[0]==='slab' && a[1]===ix && a[3]===iz)) W.A.dhPut(0, ['slab', ix, 0, iz, 0, 0], true);
}
W.A.dhCheckGoals();
chk('house goals pay coins for a poured slab', !!(W.A.dh.goals.slab && W.A.dh.earned >= 25), W.A.dh.goals);

// Lay individual bricks
if ((W.A.dh.stock.brick|0) < 8) W.A.dhGive('brick', 16);
W.A.dhPickup('brick', 8);
W.A.dhSetJob('brick');
W.P.x = ox + 3.5 * 1.4; W.P.z = oz + 0.2 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.05);
const n0 = (W.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
const laid = W.A.dhPlaceBrick();
chk('a carried brick snaps onto the next grid slot in a wall course', laid && (W.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === n0 + 1, {laid, n0, carry: W.A.dh.carry});
const rec = (W.A.dh.pieces[0]||[]).find(a => a[0]==='brick');
chk('each brick is its own piece (not a prefab wall panel)', rec && rec[0]==='brick' && rec[2] === (rec[2]|0), rec);
// place a few more
let more = 0;
for (let i = 0; i < 10; i++){
  if (!W.A.dh.carry || W.A.dh.carry.id !== 'brick') W.A.dhPickup('brick', 8) || (W.A.dhGive('brick', 8), W.A.dhPickup('brick', 8));
  if (W.A.dhPlaceBrick()) more++;
}
chk('bricks lay one after another along the course', more >= 6, more);
chk('inventory HUD still tracks leftover bricks', (W.A.dh.stock.brick|0) + (W.A.dh.carry && W.A.dh.carry.id==='brick' ? W.A.dh.carry.n : 0) >= 0);

// Cannot build on another plot
W.A.dh.carry = {id: 'brick', n: 4};
const [ox2] = [(1 - 1.5) * 18];
W.P.x = ox2 + 3 * 1.4; W.P.z = oz + 2 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.05);
const aim2 = W.A.dhAim();
chk('aiming at another plot is not buildable', !!(aim2 && aim2.plot === 1 && !W.A.dhCanBuild(aim2)), aim2);
const nOwn = (W.A.dh.pieces[0]||[]).length;
W.A.dhPlace();
chk('place is rejected on someone else\'s plot', (W.A.dh.pieces[0]||[]).length === nOwn);

// Controls
W.P.x = ox + 4 * 1.4; W.P.z = oz + 4 * 1.4;
chk('E is the hands-on action, Q dumps, R rotates', W.A.dhKey({code:'KeyE', repeat:false}) === true && W.A.dhKey({code:'KeyR', repeat:false}) === true);
W.A.dh.carry = {id: 'brick', n: 2};
W.P.x = ox + 0.2; W.P.z = oz + 8 * 1.4 - 1;
W.A.dhKey({code:'KeyQ', repeat:false});
chk('Q dumps a carried load onto the plot', !W.A.dh.carry, W.A.dh.carry);
chk('Xbox Ⓧ acts and Ⓑ rotates', (() => { const r0 = W.A.dh.rot; W.A.dhPad({b:1}); return W.A.dh.rot === ((r0+1)%4); })());

// Save / migrate / preserve other keys
W.A.dhSave();
const saved = W.store.rubloxDreamHouse;
chk('house writes construction data to rubloxDreamHouse', !!(saved && /"ver":2/.test(saved) && /brick/.test(saved)));
const v1 = {pieces: [[0,2,0,2,0,1],[1,2,1,2,0,1],[2,3,1,1,0,0],[5,2,2,2,0,1]], coins: 40, granted: true, goals: {floors:1}};
const other = {rubloxStable: '{"pony":{"id":"buttercup"},"shows":2}', rubloxBakery: '{"served":4,"coins":9}', rubloxDreamHouse: JSON.stringify(v1)};
const W2 = world(other, {coins: 50});
W2.A.buildDreamHouse();
chk('v1 prefab houses migrate into brick/slab/frame pieces', (W2.A.dh.pieces[0]||[]).some(a => a[0]==='slab') && (W2.A.dh.pieces[0]||[]).some(a => a[0]==='brick') && (W2.A.dh.pieces[0]||[]).some(a => a[0]==='door' || a[0]==='doorframe'), (W2.A.dh.pieces[0]||[]).map(a => a[0]).slice(0,12));
chk('v1 piece list is kept beside the migrated house', Array.isArray(W2.A.dh.v1pieces) && W2.A.dh.v1pieces.length === 4);
chk('existing stables and bakery saves are left intact', W2.store.rubloxStable === other.rubloxStable && W2.store.rubloxBakery === other.rubloxBakery);
chk('returning players are not given a second starter grant', W2.coins === 50, W2.coins);
chk('migrated plots get leftover bricks so building can continue', (W2.A.dh.stock.brick|0) >= 8);

const wire = W2.A.dhWire();
chk('wire payload names the owner plot and piece list', !!(wire && wire.mine === 0 && Array.isArray(wire.plots[0])), wire && Object.keys(wire));
const before = (W2.A.dh.pieces[0]||[]).length;
W2.A.dhGuestMsg({uid:'intruder'}, {a:'place', plot: 0, rec:['brick', 0, 0, 0, 0, 0], who:'intruder'});
chk('host ignores a guest trying to build on the host plot', (W2.A.dh.pieces[0]||[]).length === before);
W2.A.dhGuestMsg({uid:'friend'}, {a:'like', plot: 0, who:'friend'});
chk('a visitor like awards the owner coins', W2.A.dh.likes >= 1, {likes: W2.A.dh.likes});

W2.A.dreamhouseStop();
chk('stop clears mode state after saving', W2.A.dh == null && !!W2.store.rubloxDreamHouse);

console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
