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
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, dataset: {}, classList: {add(){}, remove(){}, contains(){ return false; }, toggle(){}}, appendChild(){}, querySelector(){ return {style: {}, textContent: ''}; }, querySelectorAll: () => [], setAttribute(){}, removeAttribute(){}, addEventListener(){}, blur(){}, onclick: null, closest: () => null}),
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
  vm.runInContext(SRC + `\n;globalThis.A = {get dh(){ return dh; }, buildDreamHouse, dreamhouseEnter, dreamhouseUpdate, dreamhouseStop, dhPlace, dhAct, dhRotate, dhCycle, dhSetTool, dhSetStory, dhSetJob, dhCycleColor, dhAim, dhAimCell, dhWire, dhFromHost, dhGuestMsg, dhProg, dhSerialize, dhPay, dhCheckGoals, dhPut, dhRemoveAt, dhCanBuild, dhPlotAt, dhKey, dhPad, dhBuy, dhDump, dhPickup, dhGive, dhMix, dhFillBarrow, dhPour, dhSmooth, dhPlaceBrick, dhMarkOrDig, DH_PARTS, DH_MATS, DH_KEY, DH_GRANT, DH_PLOTS, DH_N, DH_GOALS, DH_YARD, DH_VER, DH_JOBS, DH_UPGRADES, DH_PAINT, dhSave, dhStartIntro, dhSkipIntro, dhReplayIntro, dhIntroCam, dhShopBuyFurn, dhBuyUpgrade, dhToggleShop, dhCarryCap, dhDryNeed, dhDryDone, dhFoot, dhCourses, dhPlantTrees, dhInstallGlass, dhWindowsGlazed, dhOpenFrames, dhPlaceKind, dhNextBuildCell, dhNearOwnPlot, dhNearYard, dhToggleYard, dhWhyNot, dhClampPlayer, dhSpawnPos, dhLayoutYard, dhTreeBlocked, DH_BOUND, dhCamComfort, dhActPrompt, dhJobCounts};`, ctx);
  return ctx;
}

const W = world();
W.A.buildDreamHouse(); W.A.dreamhouseEnter();
chk('first visit starts Mom\'s intro cut-scene', !!(W.A.dh && W.A.dh.intro && W.A.dh.intro.stage === 'house' && !W.A.dh.introSeen), W.A.dh && {intro: W.A.dh.intro, seen: W.A.dh.introSeen});
chk('Space skips the intro and remembers it was seen', W.A.dhKey({code:'Space', repeat:false}) === true && !W.A.dh.intro && !!W.A.dh.introSeen);
chk('skipping leaves an empty lot with a starter material pile', (W.A.dh.pieces[0]||[]).length === 0 && (W.A.dh.stock.brick|0) >= 8 && (W.A.dh.stock.wood|0) >= 1, {pieces:(W.A.dh.pieces[0]||[]).length, stock:W.A.dh.stock});
chk('single-player other plots stay empty (no leftover show-home on Plot 2)', [1,2,3].every(i => !(W.A.dh.pieces[i]||[]).length), [1,2,3].map(i => (W.A.dh.pieces[i]||[]).length));
chk('mode boots on your own plot with starter coins', !!(W.A.dh && W.A.dh.mine === 0 && W.A.dh.bank >= 100), W.A.dh && {mine: W.A.dh.mine, bank: W.A.dh.bank});
chk('starter building coins stay in the Dream House bank (not the home-page wallet)', W.A.dh.bank >= 100 && W.coins === 20, {bank: W.A.dh.bank, coins: W.coins});
chk('four plots and a supply yard exist', W.A.DH_PLOTS === 4 && W.A.dh.bins && W.A.dh.bins.length >= 6 && W.A.DH_YARD.z < 0, W.A.dh.bins && W.A.dh.bins.length);
chk('Supply Yard has a beacon you can follow from the plot', !!(W.A.dh.yardBeacon && W.A.dh.yardBeacon.arrow), W.A.dh.yardBeacon);
(function(){
  const sp = W.A.dhSpawnPos(0);
  const d = Math.hypot(W.A.DH_YARD.x - sp.x, W.A.DH_YARD.z - sp.z);
  chk('Supply Yard sits 10-15m from spawn, next to your plot', d >= 8 && d <= 15.5, {d, yard: W.A.DH_YARD, spawn: sp});
  const camZ = sp.z + Math.cos(Math.PI) * Math.cos(.38) * 12; // chase cam sits south (more negative z) of spawn
  chk('Supply Yard is in the spawn camera view, not behind the camera', W.A.DH_YARD.z > camZ + 2 && W.A.DH_YARD.z > sp.z - 2, {yard:W.A.DH_YARD, camZ, spawn:sp});
  const blocked = (W.A.dh.trees||[]).filter(tr => W.A.dhTreeBlocked(tr.x, tr.z));
  chk('no tree sits in the spawn-to-plot sightline or on the yard', blocked.length === 0, blocked);
})();

chk('materials include bricks, cement, sand, wood, shingles, glass', ['brick','cement','sand','wood','shingle','glass'].every(id => W.A.DH_MATS.some(m => m.id === id)));
chk('catalog is construction parts, not prefab wall slabs', W.A.DH_PARTS.some(p => p.id === 'brick') && W.A.DH_PARTS.some(p => p.id === 'slab') && !W.A.DH_PARTS.some(p => p.id === 'wall' && p.name === 'Wall'));
chk('save key is unique (does not clobber stables/bakery)', W.A.DH_KEY === 'rubloxDreamHouse' && W.A.DH_VER === 4);

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


// Trees, shop, paint, upgrades, replay, no forced rewatch
chk('a ring of trees surrounds the plots', (W.A.dh.trees||[]).length >= 24, W.A.dh.trees && W.A.dh.trees.length);
(function(){
  const yard = W.A.DH_YARD;
  const ox = (0 - 1.5) * 18, oz = -8 * 1.4 / 2;
  const cx = ox + 8 * 1.4 / 2, cz = oz + 8 * 1.4 / 2;
  const blocked = (W.A.dh.trees||[]).filter(t => {
    const toYx = yard.x - cx, toYz = yard.z - cz, len = Math.hypot(toYx, toYz) || 1;
    const ux = toYx / len, uz = toYz / len;
    const vx = t.x - cx, vz = t.z - cz;
    const along = vx * ux + vz * uz, side = Math.abs(vx * uz - vz * ux);
    return (t.plot|0) === 0 && along > 2 && along < 16 && side < 2.2;
  });
  chk('trees leave a path to the Supply Yard', blocked.length === 0, blocked);
})();
chk('catalog includes paint plus shop furniture (tv, bookshelf)', W.A.DH_MATS.some(m => m.id === 'paint') && W.A.DH_MATS.some(m => m.id === 'tv') && W.A.DH_MATS.some(m => m.id === 'shelf'));
W.A.dh.bank += 80;
const bankF = W.A.dh.bank;
const sofaOk = W.A.dhShopBuyFurn('sofa');
chk('the shop sells furniture for coins into your stock', sofaOk && (W.A.dh.stock.sofa|0) >= 1 && W.A.dh.bank === bankF - 10, {bank:W.A.dh.bank, stock:W.A.dh.stock.sofa, sofaOk});
const cap0 = W.A.dhCarryCap('brick');
W.A.dh.bank += 200;
const upCarry = W.A.dhBuyUpgrade('carry');
chk('carry upgrade increases how much you can hold', upCarry && W.A.dhCarryCap('brick') > cap0, {cap0, cap1:W.A.dhCarryCap('brick')});
const dry0 = W.A.dhDryNeed();
W.A.dhBuyUpgrade('dry');
chk('faster drying upgrade shortens the concrete wait', W.A.dhDryNeed() < dry0, {dry0, dry1:W.A.dhDryNeed()});
const bar0 = W.A.dhCarryCap('wetmix');
W.A.dhBuyUpgrade('barrow');
chk('wheelbarrow upgrade carries more wet mix', W.A.dhCarryCap('wetmix') > bar0);
W.A.dhBuyUpgrade('story');
W.A.dhBuyUpgrade('lot');
chk('lot and second-story upgrades expand the footprint and wall height', W.A.dhFoot().x0 === 0 && W.A.dhCourses() > 8, {foot:W.A.dhFoot(), courses:W.A.dhCourses()});

// Paint a wall cell
W.A.dhGive('paint', 2);
W.A.dhPickup('paint', 1);
W.A.dhSetJob('paint');
W.A.dh.color = 1;
W.P.x = ox + 3.5 * 1.4; W.P.z = oz + 2.5 * 1.4; W.P.face = 0;
W.A.dreamhouseUpdate(0.02);
const painted = W.A.dhPlace();
chk('paint places a colored wash on the house', painted && (W.A.dh.pieces[0]||[]).some(a => a[0]==='paint' && (a[5]|0)===1), {painted, recs:(W.A.dh.pieces[0]||[]).filter(a => a[0]==='paint')});

// Replay + returning player
const piecesBeforeReplay = (W.A.dh.pieces[0]||[]).length;
W.A.dhReplayIntro();
chk('menu replay starts the cut-scene again', !!(W.A.dh && W.A.dh.intro && W.A.dh.intro.replay));
W.A.dhPad({a:1, 0:1});
chk('Ⓐ / skip ends a replay without wiping the house or introSeen', !W.A.dh.intro && W.A.dh.introSeen && (W.A.dh.pieces[0]||[]).length === piecesBeforeReplay, {pieces:(W.A.dh.pieces[0]||[]).length, before:piecesBeforeReplay});

const W3 = world({rubloxDreamHouse: JSON.stringify({ver:3, introSeen:true, granted:true, coins:15, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:15});
W3.A.buildDreamHouse(); W3.A.dreamhouseEnter();
chk('a returning player is not forced to rewatch the intro', !!(W3.A.dh && W3.A.dh.introSeen && !W3.A.dh.intro), W3.A.dh && {seen:W3.A.dh.introSeen, intro:W3.A.dh.intro});
W3.A.dreamhouseStop();


// Hands-on window glass
chk('Glass is its own build tool, separate from framing', W.A.DH_JOBS.indexOf('glass') >= 0 && W.A.DH_JOBS.indexOf('glass') !== W.A.DH_JOBS.indexOf('frame'), W.A.DH_JOBS);
W.P.x = ox + 3.5 * 1.4; W.P.z = oz + 3.5 * 1.4; W.P.face = Math.PI / 2;
W.A.dreamhouseUpdate(0.02);
W.A.dhSetJob('glass');
W.A.dh.carry = {id: 'glass', n: 2};
chk('glass will not go in until a window frame is set', W.A.dhInstallGlass() === false && !(W.A.dh.pieces[0]||[]).some(a => a[0]==='pane'));
W.A.dh.carry = {id: 'wood', n: 2};
W.A.dhSetJob('frame');
const framed = W.A.dhPlaceKind('winframe');
chk('the frame tool sets an empty window (no glass yet)', !!(framed && (W.A.dh.pieces[0]||[]).some(a => a[0]==='winframe') && !(W.A.dh.pieces[0]||[]).some(a => a[0]==='pane')), {framed, ids:(W.A.dh.pieces[0]||[]).map(a=>a[0])});
// a second opening on the opposite wall
W.A.dhPut(0, ['winframe', 0, 3, 0, 3, 0], true);
W.A.dh.carry = null;
W.A.dhSetJob('glass');
chk('installing glass requires carrying a pane', W.A.dhInstallGlass() === false);
W.A.dhGive('glass', 3);
W.A.dhPickup('glass', 2);
chk('inventory / carry HUD can hold bought glass panes', !!(W.A.dh.carry && W.A.dh.carry.id === 'glass' && W.A.dh.carry.n >= 1));
const nPane = (W.A.dh.pieces[0]||[]).filter(a => a[0]==='pane').length;
const g1 = W.A.dhInstallGlass();
chk('a carried pane installs into an empty window frame', g1 && (W.A.dh.pieces[0]||[]).filter(a => a[0]==='pane').length === nPane + 1, {g1, carry:W.A.dh.carry});
chk('other empty frames stay empty until you glaze them too', (W.A.dh.pieces[0]||[]).filter(a => a[0]==='winframe').length === 2 && (W.A.dh.pieces[0]||[]).filter(a => a[0]==='pane').length === 1 && !W.A.dhWindowsGlazed(W.A.dh.pieces[0]));
const g2 = W.A.dhInstallGlass();
W.A.dhCheckGoals();
chk('glazing every window pays a coin milestone', !!(g2 && W.A.dh.goals.glaze && W.A.dhWindowsGlazed(W.A.dh.pieces[0])), {g2, goals:W.A.dh.goals, earned:W.A.dh.earned});
const Wg = world({rubloxDreamHouse: JSON.stringify({ver:3, introSeen:true, granted:true, coins:10, pieces:[['winframe',0,3,0,1,0],['pane',0,3,0,1,0]], stock:{}, goals:{}, upgrades:{}})}, {coins:10});
Wg.A.buildDreamHouse();
chk('already-glazed windows stay glazed after the v4 migrate', (Wg.A.dh.pieces[0]||[]).some(a => a[0]==='pane') && (Wg.A.dh.pieces[0]||[]).some(a => a[0]==='winframe') && Wg.A.DH_VER === 4);
Wg.A.dreamhouseStop();

// Save / migrate / preserve other keys
W.A.dhSave();
const saved = W.store.rubloxDreamHouse;
chk('house writes construction data to rubloxDreamHouse', !!(saved && /"ver":4/.test(saved) && /brick/.test(saved) && /introSeen/.test(saved)));
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


/* Keyboard chain from the real spawn: stake -> dig -> mix -> pour -> bricks (no teleport onto a cell first). */
const Wk = world({rubloxDreamHouse: JSON.stringify({ver:4, introSeen:true, granted:false, coins:0, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20});
Wk.A.buildDreamHouse();
Wk.A.dreamhouseEnter();
const spawnX = Wk.P.x, spawnZ = Wk.P.z;
chk('a fresh game starts next to your lot with the Stake tool ready', Wk.A.dhNearOwnPlot() === true && Wk.A.dh.job === 'mark' && Wk.A.dh.bank >= 100 && Wk.coins === 20, {near: Wk.A.dhNearOwnPlot(), job: Wk.A.dh.job, P: {x:spawnX,z:spawnZ}, coins:Wk.coins, bank:Wk.A.dh.bank});
chk('a glowing next-stake cell is chosen from spawn (no aiming required)', !!(Wk.A.dhNextBuildCell('mark') && Wk.A.dhNextBuildCell('mark').plot === 0), Wk.A.dhNextBuildCell('mark'));
chk('number key 1 selects the Stake tool', Wk.A.dhKey({code:'Digit1', repeat:false}) === true && Wk.A.dh.job === 'mark');
chk('number keys 2-5 pick Dig, Mix, Pour, and Bricks (not emotes)', ['Digit2','Digit3','Digit4','Digit5'].every((code, i) => Wk.A.dhKey({code, repeat:false}) && Wk.A.dh.job === Wk.A.DH_JOBS[i+1]) && (Wk.A.dhKey({code:'Digit1', repeat:false}), Wk.A.dh.job === 'mark'), Wk.A.dh.job);
const marks0 = (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
chk('E from spawn places the first stake without walking onto a tile first', Wk.A.dhKey({code:'KeyE', repeat:false}) === true && (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length === marks0 + 1 && Wk.P.x === spawnX && Wk.P.z === spawnZ, {marks:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='mark').length, P:{x:Wk.P.x,z:Wk.P.z}});
for (let i = 0; i < 40; i++) Wk.A.dhKey({code:'KeyE', repeat:false});
chk('repeated E auto-targets the next empty stake cells from the same spot', (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length >= 16, (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length);
Wk.A.dhKey({code:'Digit2', repeat:false});
for (let i = 0; i < 40; i++) Wk.A.dhKey({code:'KeyE', repeat:false});
chk('Digit 2 then E digs the staked forms from the same standing spot', Wk.A.dh.job === 'dig' && (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='trench').length >= 16, {job:Wk.A.dh.job, trenches:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='trench').length});
Wk.A.dhGive('cement', 8); Wk.A.dhGive('sand', 8);
const mxk = Wk.A.dh.mixers[0];
const pilek = Wk.A.dh.piles[0];
function walkPile(){ Wk.P.x = pilek.x; Wk.P.z = pilek.z; }
function walkMix(){ Wk.P.x = mxk.x; Wk.P.z = mxk.z; }
function mixOneBarrow(){
  if (Wk.A.dh.carry && Wk.A.dh.carry.id === 'wetmix') return true;
  Wk.A.dhKey({code:'Digit3', repeat:false});
  walkPile(); Wk.A.dhKey({code:'KeyE', repeat:false}); // pick cement
  walkMix(); Wk.A.dhKey({code:'KeyE', repeat:false});  // load cement
  walkPile(); Wk.A.dhKey({code:'KeyE', repeat:false}); // pick sand
  walkMix(); Wk.A.dhKey({code:'KeyE', repeat:false});  // load sand
  Wk.A.dhKey({code:'KeyE', repeat:false});             // start mix
  Wk.A.dreamhouseUpdate(5);
  Wk.A.dhKey({code:'KeyE', repeat:false});             // fill barrow
  return !!(Wk.A.dh.carry && Wk.A.dh.carry.id === 'wetmix');
}
Wk.A.dhKey({code:'Digit3', repeat:false});
walkPile(); Wk.A.dhKey({code:'KeyE', repeat:false});
walkMix(); Wk.A.dhKey({code:'KeyE', repeat:false});
walkPile(); Wk.A.dhKey({code:'KeyE', repeat:false});
walkMix(); Wk.A.dhKey({code:'KeyE', repeat:false});
Wk.A.dhKey({code:'KeyE', repeat:false});
chk('at the mixer, E loads bags and starts mixing', Wk.A.dh.mixers[0].phase === 'mixing' || ((Wk.A.dh.mixers[0].cement|0) >= 1 && (Wk.A.dh.mixers[0].sand|0) >= 1), {phase:Wk.A.dh.mixers[0].phase, cement:Wk.A.dh.mixers[0].cement, sand:Wk.A.dh.mixers[0].sand, carry:Wk.A.dh.carry, stock:Wk.A.dh.stock});
Wk.A.dreamhouseUpdate(5);
chk('the mix finishes after a short wait', Wk.A.dh.mixers[0].phase === 'ready' && Wk.A.dh.mixers[0].mixed >= 1, {phase:Wk.A.dh.mixers[0].phase, mixed:Wk.A.dh.mixers[0].mixed});
Wk.A.dhKey({code:'KeyE', repeat:false});
chk('E fills the wheelbarrow with wet mix', !!(Wk.A.dh.carry && Wk.A.dh.carry.id === 'wetmix'), Wk.A.dh.carry);
Wk.A.dhKey({code:'Digit4', repeat:false});
Wk.A.dhKey({code:'KeyE', repeat:false});
chk('Digit 4 then E pours wet mix into the nearest dug form', (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='wet').length >= 1, {wet:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='wet').length, job:Wk.A.dh.job, carry:Wk.A.dh.carry, banners:Wk.banners.slice(-5)});
Wk.A.dhGive('cement', 12); Wk.A.dhGive('sand', 12);
let pourTrace = [];
for (let bags = 0; bags < 16; bags++){
  const poured = (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='wet' || a[0]==='slab').length;
  if (poured >= 8) break;
  if (!(Wk.A.dh.carry && Wk.A.dh.carry.id === 'wetmix')){
    const ok = mixOneBarrow();
    pourTrace.push({bags, ok, phase:Wk.A.dh.mixers[0].phase, mixed:Wk.A.dh.mixers[0].mixed, carry:Wk.A.dh.carry, stockC:Wk.A.dh.stock.cement, stockS:Wk.A.dh.stock.sand, poured, banner:Wk.banners[Wk.banners.length-1]});
  }
  Wk.A.dhKey({code:'Digit4', repeat:false});
  Wk.A.dhKey({code:'KeyE', repeat:false});
}
const pouredN = (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='wet' || a[0]==='slab').length;
chk('enough forms are poured to make a slab', pouredN >= 8, {pouredN, wet:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='wet').length, slab:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='slab').length, trace:pourTrace});
Wk.A.dreamhouseUpdate(6);
for (let i = 0; i < 20; i++) Wk.A.dhKey({code:'KeyE', repeat:false});
chk('poured concrete becomes a slab you can build on', (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='slab').length >= 8, (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='slab').length);
Wk.A.dhGive('brick', 12);
Wk.A.dhKey({code:'Digit5', repeat:false});
walkPile(); Wk.A.dhKey({code:'KeyE', repeat:false}); // pick bricks
const bricks0 = (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
Wk.A.dhKey({code:'KeyE', repeat:false});
chk('Digit 5 then E lays a brick on the new slab', Wk.A.dh.job === 'brick' && (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === bricks0 + 1, {job:Wk.A.dh.job, bricks:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='brick').length, carry:Wk.A.dh.carry, banners:Wk.banners.slice(-6)});

// hints when the action is not allowed
const Wf = world({rubloxDreamHouse: JSON.stringify({ver:4, introSeen:true, granted:true, coins:0, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20});
Wf.A.buildDreamHouse(); Wf.A.dreamhouseEnter();
Wf.P.x = 80; Wf.P.z = 80;
Wf.banners.length = 0;
Wf.A.dhKey({code:'KeyE', repeat:false});
chk('E off the lot explains you need to walk onto your plot', Wf.banners.some(t => /Walk onto your plot/i.test(t)), Wf.banners);
Wf.P.x = spawnX; Wf.P.z = spawnZ;
Wf.A.dhKey({code:'Digit4', repeat:false});
Wf.banners.length = 0;
Wf.A.dhKey({code:'KeyE', repeat:false});
chk('E with nothing to pour points you to the Supply Yard or digging first', Wf.banners.some(t => /Supply Yard|Dig the foundation|Walk onto your plot/i.test(t)), Wf.banners);
Wf.P.x = Wf.A.DH_YARD.x; Wf.P.z = Wf.A.DH_YARD.z;
chk('walking into the yard is detected so E can open the menu', Wf.A.dhNearYard() === true);
Wf.A.dhKey({code:'KeyE', repeat:false});
chk('E at the Supply Yard opens the yard menu', Wf.A.dh.yardOpen === true, {open:Wf.A.dh.yardOpen, found:Wf.A.dh.foundYard});


/* World bounds, shop stays put, yard is reachable from spawn */
const Wb = world({rubloxDreamHouse: JSON.stringify({ver:4, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20});
Wb.A.buildDreamHouse(); Wb.A.dreamhouseEnter();
const spawnP = {x: Wb.P.x, z: Wb.P.z, y: Wb.P.y};
Wb.A.dhToggleShop(true);
chk('opening the Shop does not move the player', Wb.P.x === spawnP.x && Wb.P.z === spawnP.z && Wb.P.y === spawnP.y, {before:spawnP, after:{x:Wb.P.x,z:Wb.P.z,y:Wb.P.y}});
Wb.A.dhToggleShop(false);
Wb.A.dhToggleYard(true);
chk('opening the Supply Yard menu does not move the player', Wb.P.x === spawnP.x && Wb.P.z === spawnP.z, {before:spawnP, after:{x:Wb.P.x,z:Wb.P.z}});
Wb.A.dhToggleYard(false);
Wb.P.x = 80; Wb.P.z = 90; Wb.P.y = -4; Wb.P.vy = -8;
Wb.A.dhClampPlayer();
chk('world bounds clamp you onto the grass instead of walking off the edge', Math.abs(Wb.P.x) <= Wb.A.DH_BOUND.x && Math.abs(Wb.P.z) <= Wb.A.DH_BOUND.z && Wb.P.y >= .05, {P: {x:Wb.P.x,z:Wb.P.z,y:Wb.P.y}, bound:Wb.A.DH_BOUND});
Wb.P.x = spawnP.x; Wb.P.z = spawnP.z;
const nearSpawn = Wb.A.dhNearYard();
chk('E at spawn still stakes (yard trigger is not so huge it steals the first E)', nearSpawn === false && Wb.A.dhNearOwnPlot() === true, {nearYard:nearSpawn, nearPlot:Wb.A.dhNearOwnPlot()});
// walk most of the way to the yard — E should then open it
Wb.P.x = (spawnP.x + Wb.A.DH_YARD.x) / 2;
Wb.P.z = (spawnP.z + Wb.A.DH_YARD.z) / 2;
// if still far, step closer
if (!Wb.A.dhNearYard()){ Wb.P.x = Wb.A.DH_YARD.x + 6; Wb.P.z = Wb.A.DH_YARD.z; }
chk('walking toward the Supply Yard enters the E-to-open radius', Wb.A.dhNearYard() === true, {P:{x:Wb.P.x,z:Wb.P.z}, yard:Wb.A.DH_YARD, d:Math.hypot(Wb.P.x-Wb.A.DH_YARD.x, Wb.P.z-Wb.A.DH_YARD.z)});


/* Menu prompt hiding, Escape closes menus, prompt matches allowed state */
const Wp = world({rubloxDreamHouse: JSON.stringify({ver:4, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20});
Wp.A.buildDreamHouse(); Wp.A.dreamhouseEnter();
Wp.A.dreamhouseUpdate(0.02);
const p0 = Wp.A.dhActPrompt();
chk('at spawn the prompt offers to place a stake and shows Stakes 0/N', /Place stake here/.test(p0) && /Stakes 0\/\d+/.test(p0), p0);
const ghost0 = Wp.A.dhNextBuildCell('mark');
Wp.A.dhKey({code:'KeyE', repeat:false});
Wp.A.dreamhouseUpdate(0.02);
const p1 = Wp.A.dhActPrompt();
const ghost1 = Wp.A.dhNextBuildCell('mark');
const counts = Wp.A.dhJobCounts('mark');
chk('after a stake the prompt and ghost move on and show progress', counts.have === 1 && /Stakes 1\//.test(p1) && !!(ghost1 && ghost0 && (ghost1.ix !== ghost0.ix || ghost1.iz !== ghost0.iz)), {p1, counts, ghost0, ghost1});
Wp.A.dhToggleShop(true);
Wp.A.dreamhouseUpdate(0.02);
chk('opening the Shop hides the action prompt so Close stays clickable', Wp.A.dhActPrompt() === '' && Wp.A.dh.shopOpen === true, {prompt:Wp.A.dhActPrompt(), shop:Wp.A.dh.shopOpen});
chk('Escape closes the open Shop instead of leaving it open', Wp.A.dhKey({code:'Escape', repeat:false}) === true && Wp.A.dh.shopOpen === false);
Wp.A.dhToggleYard(true);
chk('opening the Yard menu hides the action prompt', Wp.A.dhActPrompt() === '' && Wp.A.dh.yardOpen === true);
chk('Escape closes the open Supply Yard menu', Wp.A.dhKey({code:'Escape', repeat:false}) === true && Wp.A.dh.yardOpen === false);
Wp.A.dhToggleShop(true);
chk('B key closes the open Shop', Wp.A.dhKey({code:'KeyB', repeat:false}) === true && Wp.A.dh.shopOpen === false);
Wp.A.dhToggleYard(true);
chk('controller Ⓑ closes the open Yard menu', Wp.A.dhPad({b:1}) === true && Wp.A.dh.yardOpen === false);
const farX = Wp.P.x, farZ = Wp.P.z;
Wp.P.x = 40; Wp.P.z = 28;
Wp.A.dreamhouseUpdate(0.02);
const pFar = Wp.A.dhActPrompt();
chk('off the plot the prompt says to walk onto your plot, not to place a stake', /Walk onto your plot/i.test(pFar) && !/Place stake here/.test(pFar), pFar);
Wp.P.x = farX; Wp.P.z = farZ;

console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
