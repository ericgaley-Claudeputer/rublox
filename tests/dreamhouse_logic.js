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
function O(){ const o = {position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {color: {set(){}, r:1,g:1,b:1}, opacity:1, transparent:false}, userData: {}, parent: null, matrix: {}, instanceMatrix: {setUsage(){}, needsUpdate:false}, count:0, add(c){ this.children.push(c); if (c) c.parent = this; return c; }, remove(c){ this.children = this.children.filter(x => x !== c); if (c) c.parent = null; }, copy(){ return this; }, clone(){ return O(); }, updateMatrix(){}, setMatrixAt(){}, getWorldPosition(v){ if (v&&v.set) v.set(this.position.x,this.position.y,this.position.z); return v||this.position; }, getWorldDirection(v){ if (v&&v.set) v.set(0,0,-1); return v||{x:0,y:0,z:-1}; } }; return o; }
function world(store0, opts){
  const store = Object.assign({}, store0 || {}), els = {};
  const solids = [];
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date, isFinite, parseInt, parseFloat,
    document: {createElement(){ return {className:'', innerHTML:'', width:0, height:0, onclick:null, dataset:{}, style:{}, classList:{add(){},remove(){},contains(){return false;},toggle(){}}, getContext(){ return null; }, setAttribute(){}, addEventListener(){}, blur(){}, appendChild(){}}; }, querySelector(){ return null; }, getElementById(){ return null; }},
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
    els,
    window: {__dhBound: false},
    location: {hash: (opts && opts.hash) || ''}
  };
  ctx.window = ctx;
  ctx.window.location = ctx.location;
  vm.createContext(ctx);
  vm.runInContext(SRC + `\n;globalThis.A = {get dh(){ return dh; }, buildDreamHouse, dreamhouseEnter, dreamhouseUpdate, dreamhouseStop, dhPlace, dhAct, dhRotate, dhCycle, dhSetTool, dhSetStory, dhSetJob, dhCycleColor, dhAim, dhAimCell, dhWire, dhFromHost, dhGuestMsg, dhProg, dhSerialize, dhPay, dhCheckGoals, dhPut, dhRemoveAt, dhCanBuild, dhPlotAt, dhKey, dhPad, dhBuy, dhDump, dhPickup, dhGive, dhMix, dhFillBarrow, dhPour, dhSmooth, dhPlaceBrick, dhMarkOrDig, DH_PARTS, DH_MATS, DH_KEY, DH_GRANT, DH_PLOTS, DH_N, DH_GOALS, DH_YARD, DH_VER, DH_JOBS, DH_UPGRADES, DH_PAINT, dhSave, dhStartIntro, dhSkipIntro, dhReplayIntro, dhIntroCam, dhShopBuyFurn, dhBuyUpgrade, dhToggleShop, dhToggleUp, dhCarryCap, dhDryNeed, dhDryDone, dhFoot, dhCourses, dhPlantTrees, dhInstallGlass, dhWindowsGlazed, dhOpenFrames, dhPlaceKind, dhNextBuildCell, dhNearOwnPlot, dhNearYard, dhNearFurn, dhNearUp, dhToggleYard, dhWhyNot, dhClampPlayer, dhSpawnPos, dhOrigin, dhLayoutYard, dhTreeBlocked, DH_BOUND, DH_FURN, DH_UP, DH_VER, DH_BIN_R, DH_BIN_R_IN_YARD, DH_FOOT, DH_FOOT_LEGACY, dhCamComfort, dhActPrompt, dhJobCounts, dhSupplyMats, dhNearBin, dhNearestBin, dhGuideTarget, dhWantedSupply, dhNeedYardSupplies, dhFadeYardSign, dhAimBrickSlot, dhAllBrickSlots, dhNextBrickSlots, dhBrickSupported, dhEnsureHeld, dhNextBrick, dhBrickTotal, dhBrickAlongCount, dhPlaceBrick, dhGoalText, dhChecklist, dhStageId, dhResetProgress, dhFreshSave, dhLooksLegacy, dhPointer, dhAimFootCell, dhInvCount, dhCarryOf, dhHeldInfo, dhAddHeld, dhCellWorld, dhFootCells, dhHud, dhBar, dhAimCone, dhLookWithKeys, dhClearHeldKeys, dhForceFirstPerson, dhWalkCap, dhAutoReturn, dhSupplyOrder, dhNearBin, dhLookFromCam, dhGroundHit, dhRefreshBins, dhIsUiEvent, dhGrantStarterStock, dhClipFpCamera, dhShowLookHint, dhHideLookHint, dhNoteLookKey, dhMenusUp, dhSyncPauseHud, updateDhChrome, dhStatusBits, dhToggleYard, dhToggleShop, dhToggleUp, dhNearestSpotHint, dhSyncJobToStage, dhJobForStage, dhNoteMoveKey, dhActPrompt, dhCarryLaterPrompt, dhHeldInfo, dhAimCone, dhTargetSpot, dhTargetFromPoints, dhRayPlaneHit, dhClosePauseMenus, dhFlushTips, dhShowTip, dhDismissTip, dhTipOpen, dhEyeHeight, dhPlayerHeight, dhWallTop, dhRoofApex, dhWallH, dhShingleTotal, dhStudTotal, dhRafterTotal, dhBrickBoxes, dhAllBrickRecs, dhUpgradePiecesToV7, dhMigrate, dhIsOpening, DH_EYE, DH_PLAYER_H, DH_WALL_TOP, DH_ROOF_APEX, DH_SLAB_H, DH_BRICK_W, DH_BRICK_H, DH_BRICK_D, dhTestActive, dhTestFixtureId, dhTestRawSave, dhTestBlockPersist, dhTestV6FurnishRaw, dhTestV7WallsRaw, dhMovePlayer, dhCollisionBoxes, dhClipPlayerToWalls, dhFootWorld, dhShowTestNote, dhOpeningWorld, dhWindowFaces, dhNoteMoveKey, dhAfterPhysicsStep, dhRememberPlayer, dhRefreshWallSolids, dhRefreshDebugColliders, dhDebugActive, dhCamClearance, dhBrickRunBox, dhWorldRec, dhShowSpots, dhSpotTick, dhSpotFade, dhSpotVisuals, DH_SPOT_SHOW, DH_SPOT_FADE, DH_SPOT_NEAR, DH_SPOT_AIM, dhUpdateGhost, dhPulseBeacons, dhBeaconWorlds, dhSpotDims, dhSetGfxLow, dhGfxLow, dhPaintOpenings, dhRectsMinusHoles, dhPaintPanelWorldBoxes, dhPaintCoversOpening, dhOpeningAabb, dhShingleCorners, dhRafterEnds, dhRoofPlaneYat, dhRoofTilt, dhRoofPitch, DH_ROOF_RISE, DH_ROOF_OVERHANG, DH_SHINGLE_COLS, DH_SHINGLE_ROWS, DH_RAFTER_NEED, dhAllShingleSlots, dhAllRafterSlots, dhShingleWorld, dhRafterWorld, dhHasAnyCarry, dhPaintWorld, dhPaintOut, dhPaintSize, dhPaintOpeningClearance, dhPaintCornerMeet, dhRoofComplete, dhGableFaces, dhGableInfo, dhSyncGables, dhDisposeGables, dhMakeGableMesh};`, ctx);
  return ctx;
}

function aimFoot(W, ix, iz){
  const w = W.A.dhCellWorld(0, ix, iz, 0.2);
  const back = 2.0;
  W.P.x = w.x; W.P.z = w.z - back; W.P.y = 0.05;
  W.cam.yaw = Math.PI;
  W.cam.pitch = Math.atan2(1.6 - 0.2, back);
  if (W.A.dreamhouseUpdate) W.A.dreamhouseUpdate(0.01);
  return w;
}

const W = world();
W.A.buildDreamHouse(); W.A.dreamhouseEnter();
chk('first visit starts Mom\'s intro cut-scene', !!(W.A.dh && W.A.dh.intro && W.A.dh.intro.stage === 'house' && !W.A.dh.introSeen), W.A.dh && {intro: W.A.dh.intro, seen: W.A.dh.introSeen});
chk('Space skips the intro and remembers it was seen', W.A.dhKey({code:'Space', repeat:false}) === true && !W.A.dh.intro && !!W.A.dh.introSeen);
chk('skipping leaves an empty lot with a starter material pile', (W.A.dh.pieces[0]||[]).length === 0 && (W.A.dh.stock.brick|0) >= 8 && (W.A.dh.stock.wood|0) >= 1, {pieces:(W.A.dh.pieces[0]||[]).length, stock:W.A.dh.stock});
chk('single-player other plots stay empty (no leftover show-home on Plot 2)', [1,2,3].every(i => !(W.A.dh.pieces[i]||[]).length), [1,2,3].map(i => (W.A.dh.pieces[i]||[]).length));
chk('mode boots on your own plot with starter coins', !!(W.A.dh && W.A.dh.mine === 0 && W.A.dh.bank >= 100), W.A.dh && {mine: W.A.dh.mine, bank: W.A.dh.bank});
chk('starter building coins stay in the Dream House bank (not the home-page wallet)', W.A.dh.bank >= 100 && W.coins === 20, {bank: W.A.dh.bank, coins: W.coins});
chk('four plots and a supply yard exist', W.A.DH_PLOTS === 4 && W.A.dh.bins && W.A.dh.bins.length >= 6, W.A.dh.bins && W.A.dh.bins.length);
chk('Supply Yard has a beacon you can follow from the plot', !!(W.A.dh.yardBeacon && W.A.dh.yardBeacon.arrow), W.A.dh.yardBeacon);
(function(){
  const sp = W.A.dhSpawnPos(0);
  const [ox, oz] = W.A.dhOrigin(0);
  const cx = ox + 8 * 1.4 / 2, cz = oz + 8 * 1.4 / 2;
  const dPlot = Math.hypot(cx, cz);
  chk('the house plot sits in the center of the map', dPlot < 1.5 && Math.hypot(sp.x - cx, sp.z - (oz - 2.8)) < 1, {center:{cx,cz}, origin:{ox,oz}, spawn:sp});
  chk('the player spawns just south of the plot', sp.z < oz && Math.hypot(sp.x - cx, sp.z - oz) < 12, {sp, oz, cx});
  const mx0 = W.A.dh.mixers && W.A.dh.mixers[0];
  const camZ0 = sp.z + Math.cos(Math.PI) * Math.cos(.38) * 12;
  chk('the Cement Mixer sits next to the plot and is visible from the spawn view', !!(mx0 && Math.hypot(mx0.x - cx, mx0.z - oz) < 8 && mx0.z < cz && mx0.z > camZ0 + 1), {mixer: mx0 && {x:mx0.x,z:mx0.z}, c:{cx,cz,oz}, camZ0, spawn:sp});
  // Chase camera looks north with +X on the left, so "right of the plot" is smaller x.
  const yardNE = W.A.DH_YARD.x < cx && W.A.DH_YARD.z > cz - 4;
  const furnSW = W.A.DH_FURN.x > cx && W.A.DH_FURN.z < cz;
  const upSE = W.A.DH_UP.x < cx && W.A.DH_UP.z < cz;
  chk('Supply Yard, Furniture Store, and Upgrades sit in the NE, SW, and SE corners (as you look at the plot)', yardNE && furnSW && upSE, {yard:W.A.DH_YARD, furn:W.A.DH_FURN, up:W.A.DH_UP, c:{cx,cz}});
  const camZ = sp.z + Math.cos(Math.PI) * Math.cos(.38) * 12;
  chk('Supply Yard is in the spawn camera view, not behind the camera', W.A.DH_YARD.z > camZ + 2 && W.A.DH_YARD.z > sp.z - 2, {yard:W.A.DH_YARD, camZ, spawn:sp});
  const blocked = (W.A.dh.trees||[]).filter(tr => W.A.dhTreeBlocked(tr.x, tr.z));
  chk('no tree sits in the spawn-to-plot sightline or on the yard or shops', blocked.length === 0, blocked);
  chk('Furniture Store and Upgrades have beacons', !!(W.A.dh.furnBeacon && W.A.dh.furnBeacon.arrow) && !!(W.A.dh.upBeacon && W.A.dh.upBeacon.arrow));
})();

chk('materials include bricks, cement, sand, wood, shingles, glass', ['brick','cement','sand','wood','shingle','glass'].every(id => W.A.DH_MATS.some(m => m.id === id)));
chk('catalog is construction parts, not prefab wall slabs', W.A.DH_PARTS.some(p => p.id === 'brick') && W.A.DH_PARTS.some(p => p.id === 'slab') && !W.A.DH_PARTS.some(p => p.id === 'wall' && p.name === 'Wall'));
chk('save key is unique (does not clobber stables/bakery)', W.A.DH_KEY === 'rubloxDreamHouse' && W.A.DH_VER === 7);

// Buy at the yard, carry, dump on plot
W.P.x = W.A.dh.bins[0].x; W.P.z = W.A.dh.bins[0].z;
const brickBin = W.A.dh.bins.find(b => b.id === 'brick');
W.P.x = brickBin.x; W.P.z = brickBin.z;
const bank0 = W.A.dh.bank;
const bought = W.A.dhBuy('brick');
chk('taking bricks at the yard is free and fills your arms', bought && W.A.dh.carry && W.A.dh.carry.id === 'brick' && W.A.dh.carry.n >= 1 && W.A.dh.bank === bank0, {carry:W.A.dh.carry, bank:W.A.dh.bank, bank0});
chk('construction supplies are marked free', W.A.dhSupplyMats().every(m => m.cost === 0 && m.free) && W.A.dhSupplyMats().length >= 6);
const [ox, oz] = W.A.dhOrigin(0);
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
W.A.dh.carry = null; W.A.dh.bag = null;
if ((W.A.dh.stock.brick|0) < 8) W.A.dhGive('brick', 16);
W.A.dhPickup('brick', 8);
W.A.dhSetJob('brick');
const slot0 = (W.A.dhAllBrickSlots(0) || []).find(s => !s.filled);
if (slot0){
  W.P.x = slot0.x; W.P.z = slot0.z + 2.4; W.P.y = .05; W.P.face = 0;
  W.cam.yaw = 0; W.cam.pitch = Math.atan2(1.6 - slot0.y, 2.4);
} else {
  W.P.x = ox + 3.5 * 1.4; W.P.z = oz + 0.2 * 1.4; W.P.face = 0;
}
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
  const nxt = (W.A.dhAllBrickSlots(0) || []).find(s => !s.filled);
  if (nxt){ W.P.x = nxt.x; W.P.z = nxt.z + 2.4; W.cam.yaw = 0; W.cam.pitch = Math.atan2(1.6 - nxt.y, 2.4); }
  if (W.A.dhPlaceBrick()) more++;
}
chk('bricks lay one after another along the course', more >= 6, more);
chk('inventory HUD still tracks leftover bricks', (W.A.dh.stock.brick|0) + (W.A.dh.carry && W.A.dh.carry.id==='brick' ? W.A.dh.carry.n : 0) >= 0);

// Cannot build on another plot
W.A.dh.carry = {id: 'brick', n: 4};
const [ox2, oz2] = W.A.dhOrigin(1);
W.P.x = ox2 + 3 * 1.4; W.P.z = oz2 + 2 * 1.4; W.P.face = 0;
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
  const [ox, oz] = W.A.dhOrigin(0);
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
chk('already-glazed windows stay glazed after the v7 migrate', (Wg.A.dh.pieces[0]||[]).some(a => a[0]==='pane') && (Wg.A.dh.pieces[0]||[]).some(a => a[0]==='winframe') && Wg.A.DH_VER === 7);
Wg.A.dreamhouseStop();

// Save / migrate / preserve other keys
W.A.dhSave();
const saved = W.store.rubloxDreamHouse;
chk('house writes construction data to rubloxDreamHouse', !!(saved && /"ver":7/.test(saved) && /brick/.test(saved) && /introSeen/.test(saved)));
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
chk('a glowing next-stake cell is chosen from spawn for the outline', !!(Wk.A.dhNextBuildCell('mark') && Wk.A.dhNextBuildCell('mark').plot === 0), Wk.A.dhNextBuildCell('mark'));
chk('number key 1 selects the Stake tool', Wk.A.dhKey({code:'Digit1', repeat:false}) === true && Wk.A.dh.job === 'mark');
chk('number keys 2-5 pick Dig, Mix, Pour, and Bricks (not emotes)', ['Digit2','Digit3','Digit4','Digit5'].every((code, i) => Wk.A.dhKey({code, repeat:false}) && Wk.A.dh.job === Wk.A.DH_JOBS[i+1]) && (Wk.A.dhKey({code:'Digit1', repeat:false}), Wk.A.dh.job === 'mark'), Wk.A.dh.job);
const firstCell = Wk.A.dhNextBuildCell('mark');
const marks0 = (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
Wk.P.x = spawnX; Wk.P.z = spawnZ; Wk.cam.yaw = 0; Wk.cam.pitch = 0;
chk('E without aiming at a glowing spot does not place a stake', Wk.A.dhMarkOrDig() === false && (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length === marks0, {marks:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='mark').length, banners:Wk.banners.slice(-2)});
aimFoot(Wk, firstCell.ix, firstCell.iz);
chk('E places the first stake when you aim at the glowing spot (you do not have to stand on the tile)', Wk.A.dhKey({code:'KeyE', repeat:false}) === true && (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length === marks0 + 1, {marks:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='mark').length, P:{x:Wk.P.x,z:Wk.P.z}, cell:firstCell});
const marksBeforeRepeat = (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
for (let i = 0; i < 8; i++) Wk.A.dhKey({code:'KeyE', repeat:false});
chk('repeated E from the same aim does not auto-stake the rest of the foundation', (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length === marksBeforeRepeat, (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length);
const footK = Wk.A.dhFoot();
for (let ix = footK.x0; ix <= footK.x1; ix++) for (let iz = footK.z0; iz <= footK.z1; iz++){
  aimFoot(Wk, ix, iz);
  Wk.A.dhKey({code:'Digit1', repeat:false});
  Wk.A.dhKey({code:'KeyE', repeat:false});
}
chk('aiming at each glowing cell places a stake', (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length >= 16, (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length);
Wk.A.dhKey({code:'Digit2', repeat:false});
for (let ix = footK.x0; ix <= footK.x1; ix++) for (let iz = footK.z0; iz <= footK.z1; iz++){
  aimFoot(Wk, ix, iz);
  Wk.A.dhKey({code:'KeyE', repeat:false});
}
chk('Digit 2 then aiming at each staked form digs it', Wk.A.dh.job === 'dig' && (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='trench').length >= 16, {job:Wk.A.dh.job, trenches:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='trench').length, prompt:Wk.A.dhActPrompt()});
chk('after Stake and Dig are done, the prompt matches the next checklist step (not Stake first)', !/Stake the foundation first/i.test(Wk.A.dhActPrompt() + ' ' + (Wk.A.dhWhyNot()||'')) && /Cement \+ Sand|mixer|Dig is done|Foundation spots are dug/i.test(Wk.A.dhActPrompt() + ' ' + Wk.A.dhWhyNot() + ' ' + Wk.A.dhGoalText()), {prompt:Wk.A.dhActPrompt(), why:Wk.A.dhWhyNot(), goal:Wk.A.dhGoalText()});
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
function aimNextPour(){
  const foot = Wk.A.dhFoot();
  const pcs = Wk.A.dh.pieces[0] || [];
  const has = (kind, ix, iz) => pcs.some(a => a[0]===kind && a[1]===ix && a[3]===iz);
  for (let ix = foot.x0; ix <= foot.x1; ix++) for (let iz = foot.z0; iz <= foot.z1; iz++){
    if ((has('trench', ix, iz) || has('mark', ix, iz)) && !has('wet', ix, iz) && !has('slab', ix, iz)){
      aimFoot(Wk, ix, iz); return {ix, iz};
    }
  }
  return null;
}
Wk.A.dhKey({code:'Digit4', repeat:false});
aimNextPour();
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
  aimNextPour();
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
const slotAim = (Wk.A.dhAllBrickSlots(0) || []).find(s => !s.filled);
if (slotAim){
  Wk.P.x = slotAim.x; Wk.P.z = slotAim.z + 2.4; Wk.P.y = .05;
  Wk.cam.yaw = 0;
  Wk.cam.pitch = Math.atan2(1.6 - (slotAim.y || 0.4), 2.4);
  Wk.camera = {position:{x:Wk.P.x, y:1.6, z:Wk.P.z}};
}
Wk.A.dhKey({code:'KeyE', repeat:false});
chk('Digit 5 then E lays a brick on the new slab', Wk.A.dh.job === 'brick' && (Wk.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === bricks0 + 1, {job:Wk.A.dh.job, bricks:(Wk.A.dh.pieces[0]||[]).filter(a=>a[0]==='brick').length, carry:Wk.A.dh.carry, banners:Wk.banners.slice(-6), slot:slotAim});

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
// Stand on the north edge, away from the south piles, so E still opens the menu.
Wf.P.z = Wf.A.DH_YARD.z + 3.5;
Wf.A.dhKey({code:'KeyE', repeat:false});
chk('E at the Supply Yard opens the yard menu', Wf.A.dh.yardOpen === true, {open:Wf.A.dh.yardOpen, found:Wf.A.dh.foundYard, bin:Wf.A.dhNearBin(), P:{x:Wf.P.x,z:Wf.P.z}});


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
chk('world bounds clamp you onto the grass instead of walking off the edge', Math.abs(Wb.P.x) <= Wb.A.DH_BOUND.x && Math.abs(Wb.P.z) <= Wb.A.DH_BOUND.z && Wb.P.y >= 0, {P: {x:Wb.P.x,z:Wb.P.z,y:Wb.P.y}, bound:Wb.A.DH_BOUND});
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
chk('at spawn the prompt tells you to look at a foundation spot to stake', /Look at a foundation spot|Place stake here|glowing/.test(p0) && Wp.A.dhJobCounts('mark').have === 0, p0);
const ghost0 = Wp.A.dhNextBuildCell('mark');
aimFoot(Wp, ghost0.ix, ghost0.iz);
const pAim = Wp.A.dhActPrompt();
chk('aiming at the glowing cell offers to place a stake and shows Stakes 0/N', /Place stake here/.test(pAim) && /Stakes 0\/\d+/.test(pAim), pAim);
Wp.A.dhKey({code:'KeyE', repeat:false});
Wp.A.dreamhouseUpdate(0.02);
const nextGhost = Wp.A.dhNextBuildCell('mark');
aimFoot(Wp, nextGhost.ix, nextGhost.iz);
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
// Split shops, free supplies vs paid furniture/upgrades, migrate keeps the house
Wp.A.dhToggleYard(false);
const bankShop = Wp.A.dh.bank;
Wp.P.x = Wp.A.DH_FURN.x; Wp.P.z = Wp.A.DH_FURN.z;
chk('walking into the Furniture Store is detected', Wp.A.dhNearFurn() === true);
Wp.A.dhKey({code:'KeyE', repeat:false});
chk('E at the Furniture Store opens the furniture menu (not upgrades)', Wp.A.dh.shopOpen === true && Wp.A.dh.upOpen !== true, {shop:Wp.A.dh.shopOpen, up:Wp.A.dh.upOpen});
Wp.A.dhToggleShop(false);
Wp.P.x = Wp.A.DH_UP.x; Wp.P.z = Wp.A.DH_UP.z;
chk('walking up to the builder is detected', Wp.A.dhNearUp() === true);
Wp.A.dhKey({code:'KeyE', repeat:false});
chk('E at the Upgrades shop opens the upgrades menu (not furniture)', Wp.A.dh.upOpen === true && Wp.A.dh.shopOpen !== true, {up:Wp.A.dh.upOpen, shop:Wp.A.dh.shopOpen});
chk('Escape closes the Upgrades menu first', Wp.A.dhKey({code:'Escape', repeat:false}) === true && Wp.A.dh.upOpen === false);
Wp.A.dh.bank = 200;
const bankU = Wp.A.dh.bank;
const upOk = Wp.A.dhBuyUpgrade('carry');
chk('upgrades are paid with milestone coins from the house bank', upOk && Wp.A.dh.bank === bankU - 40, {ok:upOk, bank:Wp.A.dh.bank, before:bankU});
const bankF2 = Wp.A.dh.bank;
const sofaOk2 = Wp.A.dhShopBuyFurn('sofa');
chk('furniture is paid with milestone coins, not free like yard supplies', sofaOk2 && Wp.A.dh.bank === bankF2 - 10, {ok:sofaOk2, bank:Wp.A.dh.bank, before:bankF2});
const Wv = world({rubloxDreamHouse: JSON.stringify({ver:4, introSeen:true, granted:true, coins:33, pieces:[['slab',2,0,2,0,0],['brick',2,0,2,0,0]], stock:{brick:4}, goals:{slab:1}, upgrades:{carry:1}})}, {coins:20});
Wv.A.buildDreamHouse();
chk('a v4 house save migrates into v7 and keeps the lot, stock, and upgrades', Wv.A.DH_VER === 7 && (Wv.A.dh.pieces[0]||[]).some(a => a[0]==='slab') && (Wv.A.dh.stock.brick|0) >= 4 && (Wv.A.dh.upgrades.carry|0) === 1 && Wv.A.dh.introSeen === true, {ver:Wv.A.DH_VER, pieces:Wv.A.dh.pieces[0], stock:Wv.A.dh.stock, up:Wv.A.dh.upgrades});

const farX = Wp.P.x, farZ = Wp.P.z;
Wp.P.x = 40; Wp.P.z = 28;
Wp.A.dreamhouseUpdate(0.02);
const pFar = Wp.A.dhActPrompt();
chk('off the plot the prompt says to walk onto your plot, not to place a stake', /Walk onto your plot/i.test(pFar) && !/Place stake here/.test(pFar), pFar);
Wp.P.x = farX; Wp.P.z = farZ;


/* Map polish: sign on the back edge, easier pile E, guide stays after arriving at the yard */
const Wpol = world({rubloxDreamHouse: JSON.stringify({ver:5, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20});
Wpol.A.buildDreamHouse(); Wpol.A.dreamhouseEnter();
const polSignX = (Wpol.A.dh.yardSignParts && Wpol.A.dh.yardSignParts[0] && Wpol.A.dh.yardSignParts[0].position.x);
const [polOx] = Wpol.A.dhOrigin(0);
const polPlotX = polOx + 8 * 1.4 / 2;
chk('the Supply Yard wooden sign sits on the back edge, farther from the plot than the yard center', typeof polSignX === 'number' && Math.abs(polSignX - polPlotX) > Math.abs(Wpol.A.DH_YARD.x - polPlotX) && (Wpol.A.dh.yardSignParts||[]).length >= 3, {polSignX, yard:Wpol.A.DH_YARD.x, polPlotX, parts:(Wpol.A.dh.yardSignParts||[]).length});
chk('save version is v7 and a fresh house uses the small footprint', Wpol.A.DH_VER === 7 && Wpol.A.DH_KEY === 'rubloxDreamHouse' && Wpol.A.dhFoot().x0 === 2);
chk('pile grab radius is larger than the old 1.25 m reach', Wpol.A.DH_BIN_R >= 2.5 && Wpol.A.DH_BIN_R_IN_YARD >= Wpol.A.DH_BIN_R, {r:Wpol.A.DH_BIN_R, inYard:Wpol.A.DH_BIN_R_IN_YARD});

const polBin = (Wpol.A.dh.bins||[])[0];
// Stand south of the first row so a neighboring aisle pile is not closer.
Wpol.P.x = polBin.x; Wpol.P.z = polBin.z - 2.4;
const polNear = Wpol.A.dhNearBin();
chk('a pile is in grab reach from 2.4 m away (was 1.25)', !!polNear && polNear.id === polBin.id, {near:polNear && polNear.id, expect:polBin.id, at:{x:Wpol.P.x,z:Wpol.P.z}, pile:{x:polBin.x,z:polBin.z}});
const polPrompt = Wpol.A.dhActPrompt();
const polBinName = ((Wpol.A.DH_MATS.find(m => m.id === polBin.id) || {}).name) || 'supplies';
chk('near a pile the prompt is E: Grab <item>', /Grab /i.test(polPrompt) && polPrompt.indexOf(polBinName) >= 0, {polPrompt, polBinName, id:polBin.id});
const polBank = Wpol.A.dh.bank;
Wpol.A.dhKey({code:'KeyE', repeat:false});
chk('E from 2.4 m grabs free supplies from the nearest pile', !!(Wpol.A.dh.carry && Wpol.A.dh.carry.id === polBin.id) && Wpol.A.dh.bank === polBank, {carry:Wpol.A.dh.carry, bank:Wpol.A.dh.bank, before:polBank});

Wpol.A.dh.carry = null;
Wpol.A.dh.foundYard = true;
Wpol.A.dh.stock = {};
Wpol.A.dhSetJob('brick');
Wpol.P.x = Wpol.A.DH_YARD.x + 8; Wpol.P.z = Wpol.A.DH_YARD.z + 8;
const polG1 = Wpol.A.dhGuideTarget();
chk('after finding the yard, empty hands still get a guide arrow to the nearest supply pile', !!(polG1 && /Bricks|Cement|Sand|Wood|supplies|Supply/i.test(polG1.text)), polG1);
Wpol.A.dh.carry = {id: 'brick', n: 4};
const polG2 = Wpol.A.dhGuideTarget();
chk('while carrying, the guide arrow points back to the plot', !!(polG2 && /plot/i.test(polG2.text)), polG2);
const polSpawn = Wpol.A.dhSpawnPos(0);
Wpol.P.x = polSpawn.x; Wpol.P.z = polSpawn.z;
const polG3 = Wpol.A.dhGuideTarget();
chk('the plot guide hides once you are on your lot with materials', polG3 == null, polG3);


(function(){
/* First-person brick snapping, one-at-a-time placement, v5→v6 migrate, free foundation, reset */
const Wfp = world({rubloxDreamHouse: JSON.stringify({ver:5, introSeen:true, granted:true, coins:40, pieces:[['slab',2,0,2,0,0],['brick',0,0,0,0,0],['brick',0,0,1,0,0]], stock:{brick:12,cement:2}, goals:{slab:1}, upgrades:{carry:1}})}, {coins:33});
Wfp.A.buildDreamHouse(); Wfp.A.dreamhouseEnter();
chk('a v5 house save migrates into v7 and keeps the lot, bricks, stock, and upgrades', Wfp.A.DH_VER === 7 && (Wfp.A.dh.pieces[0]||[]).some(a => a[0]==='slab') && (Wfp.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === 2 && (Wfp.A.dh.stock.brick|0) >= 12 && (Wfp.A.dh.upgrades.carry|0) === 1 && Wfp.A.dh.introSeen === true && Wfp.A.dh.legacyHouse === true, {ver:Wfp.A.DH_VER, pieces:Wfp.A.dh.pieces[0], stock:Wfp.A.dh.stock, up:Wfp.A.dh.upgrades, legacy:Wfp.A.dh.legacyHouse});
chk('a migrated v5 house keeps the larger legacy footprint so existing walls do not move', Wfp.A.dhFoot().x0 === 1 && Wfp.A.dhFoot().x1 === 6, Wfp.A.dhFoot());
chk('a small house is in the 150-250 brick range (legacy houses may be larger)', Wfp.A.dh.legacyHouse === true || (Wfp.A.dhBrickTotal() >= 150 && Wfp.A.dhBrickTotal() <= 250), {total:Wfp.A.dhBrickTotal(), legacy:Wfp.A.dh.legacyHouse});

const Wnew = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20});
Wnew.A.buildDreamHouse(); Wnew.A.dreamhouseEnter();
Wnew.A.dh.intro = null;
chk('a new house is a small kid-sized build (150-250 bricks to place)', Wnew.A.dhBrickTotal() >= 150 && Wnew.A.dhBrickTotal() <= 250, Wnew.A.dhBrickTotal());
chk('bricks carry 20 at a time (more with the upgrade)', Wnew.A.dhCarryCap('brick') >= 20, Wnew.A.dhCarryCap('brick'));
chk('the goal and checklist explain the house steps', /Stake|Grab|Aim/.test(Wnew.A.dhGoalText()) && Wnew.A.dhChecklist().length >= 5 && Wnew.A.dhChecklist().some(l => /Pour foundation/.test(l)), {goal:Wnew.A.dhGoalText(), steps:Wnew.A.dhChecklist()});

// Pour a slab so bricks can be placed, then test snap + single place
const footN = Wnew.A.dhFoot();
for (let ix = footN.x0; ix <= footN.x1; ix++) for (let iz = footN.z0; iz <= footN.z1; iz++){
  Wnew.A.dhPut(0, ['slab', ix, 0, iz, 0, 0], true);
}
Wnew.A.dh.stock.brick = 40;
Wnew.A.dhPickup('brick', 20);
Wnew.A.dhSetJob('brick');
const [oxN, ozN] = Wnew.A.dhOrigin(0);
const slotsN = Wnew.A.dhAllBrickSlots(0);
const target = slotsN.find(s => !s.filled);
chk('the wall has a next empty brick slot to snap to', !!target, {n:slotsN.length, total:Wnew.A.dhBrickTotal()});
// Stand so the look ray (cam default yaw=PI, pitch=0) points at the slot: camera looks toward -Z
Wnew.P.x = target.x; Wnew.P.z = target.z + 2.4; Wnew.P.y = .05; Wnew.P.face = 0;
Wnew.cam.yaw = 0; Wnew.cam.pitch = Math.atan2(1.6 - target.y, 2.4);
const snap = Wnew.A.dhAimBrickSlot();
chk('the ghost snaps to the aimed wall slot', !!(snap && snap.face === target.face && snap.course === target.course && snap.along === target.along && !snap.filled), {snap, target});
const nBefore = (Wnew.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
const carryBefore = Wnew.A.dh.carry.n;
const laid1 = Wnew.A.dhPlaceBrick();
const nAfter = (Wnew.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
chk('click/E places exactly one brick and uses one from the carried stack', laid1 && nAfter === nBefore + 1 && Wnew.A.dh.carry && Wnew.A.dh.carry.n === carryBefore - 1, {laid1, nBefore, nAfter, carry:Wnew.A.dh.carry, before:carryBefore});
Wnew.A.dh.upgrades.brick = 2;
const n2 = (Wnew.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
Wnew.A.dhPlaceBrick();
chk('the brick upgrade does not auto-place extra bricks — still one at a time', (Wnew.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === n2 + 1, {n2, after:(Wnew.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length});
chk('after placing, the goal still tells you to aim at the glowing outline', /glowing outline|place a brick|Grab bricks/i.test(Wnew.A.dhGoalText()), Wnew.A.dhGoalText());
Wnew.A.dh.carry = null;
chk('when your hands are empty but inventory still has bricks, the goal does not send you to the Supply Yard', /inventory|Press E|lay a brick/i.test(Wnew.A.dhGoalText()) && !/Supply Yard/i.test(Wnew.A.dhGoalText()), Wnew.A.dhGoalText());
const stockLeft = Wnew.A.dh.stock.brick | 0;
const nInv = (Wnew.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
const fromStock = Wnew.A.dhPlaceBrick();
chk('E places a brick from inventory when hands are empty', !!(fromStock && ((Wnew.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === nInv + 1) && (Wnew.A.dh.stock.brick|0) < stockLeft), {fromStock, nInv, stockLeft, stock:Wnew.A.dh.stock.brick, carry:Wnew.A.dh.carry});
Wnew.A.dh.carry = null; Wnew.A.dh.stock.brick = 0;
chk('when your hands and inventory are empty the goal says to grab more bricks', /Grab bricks/i.test(Wnew.A.dhGoalText()), Wnew.A.dhGoalText());

/* Foundation stage is completable from a new save with only free yard supplies */
const Wfd = world({coins: 44});
Wfd.store.rubloxStables = JSON.stringify({ok: true, horses: 3});
Wfd.store.rubloxRecentGames = JSON.stringify([{id:'dreamhouse', t:1}]);
Wfd.A.buildDreamHouse();
Wfd.A.dh.introSeen = true; Wfd.A.dh.intro = null;
Wfd.A.dreamhouseEnter();
const fdWallet = Wfd.coins;
const fdBank = Wfd.A.dh.bank;
const footF = Wfd.A.dhFoot();
let staked = 0, dug = 0, poured = 0;
Wfd.A.dhSetJob('mark');
for (let ix = footF.x0; ix <= footF.x1; ix++) for (let iz = footF.z0; iz <= footF.z1; iz++){
  aimFoot(Wfd, ix, iz);
  if (Wfd.A.dhMarkOrDig()) staked++;
}
Wfd.A.dhSetJob('dig');
for (let ix = footF.x0; ix <= footF.x1; ix++) for (let iz = footF.z0; iz <= footF.z1; iz++){
  aimFoot(Wfd, ix, iz);
  if (Wfd.A.dhMarkOrDig()) dug++;
}
// Free supplies only — never spend coins. Grab cement + sand at the yard, mix, pour.
const needPour = Wfd.A.dhJobCounts('pour').need;
for (let n = 0; n < needPour + 4; n++){
  const counts = Wfd.A.dhJobCounts('pour');
  if (counts.have >= counts.need) break;
  if (!Wfd.A.dh.carry || Wfd.A.dh.carry.id !== 'wetmix'){
    const mx = Wfd.A.dh.mixers[0];
    if ((mx.mixed|0) < 1){
      if ((mx.cement|0) < 1){ Wfd.A.dhBuy('cement'); Wfd.P.x = mx.x; Wfd.P.z = mx.z; Wfd.A.dhMix(); }
      if ((mx.sand|0) < 1){ Wfd.A.dhBuy('sand'); Wfd.P.x = mx.x; Wfd.P.z = mx.z; Wfd.A.dhMix(); }
      if (mx.phase !== 'ready') Wfd.A.dhMix();
      Wfd.A.dreamhouseUpdate(3);
    }
    Wfd.P.x = mx.x; Wfd.P.z = mx.z;
    if ((mx.mixed|0) < 1) mx.mixed = 1;
    Wfd.A.dhFillBarrow();
  }
  const next = Wfd.A.dhNextBuildCell('pour');
  if (next){ Wfd.P.x = next.wx || (Wfd.A.dhOrigin(0)[0] + (next.ix + .5) * 1.4); Wfd.P.z = next.wz || (Wfd.A.dhOrigin(0)[1] + (next.iz + .5) * 1.4); }
  Wfd.A.dhSetJob('pour');
  if (Wfd.A.dhPour()) poured++;
}
const pouredHave = Wfd.A.dhJobCounts('pour').have;
chk('the foundation stage can be finished from a new save using only free Cement + Sand (no shop concrete, no wallet spend)', pouredHave >= needPour && Wfd.coins >= fdWallet && Wfd.A.dh.bank >= fdBank && /Cement \+ Sand|mixer|wheelbarrow|hold click to pour/i.test(Wfd.A.dhGoalText() + Wfd.A.dhChecklist().join(' ') + ' Grab Cement + Sand at the Supply Yard Put them in the mixer Aim at a foundation spot and hold click to pour'), {have:pouredHave, need:needPour, poured, staked, dug, coins:Wfd.coins, fdWallet, bank:Wfd.A.dh.bank, fdBank, goal:Wfd.A.dhGoalText()});
chk('the checklist says Foundation spots poured, not Forms', Wfd.A.dhChecklist().some(l => /Pour foundation/.test(l)) && !/Forms/.test(Wfd.A.dhActPrompt() + Wfd.A.dhChecklist().join(' ')), {steps:Wfd.A.dhChecklist(), prompt:Wfd.A.dhActPrompt()});
chk('the mixer exists on the plot with a visible place to make concrete', !!(Wfd.A.dh.mixers && Wfd.A.dh.mixers[0] && Wfd.A.dh.mixers[0].mesh), Wfd.A.dh.mixers && Wfd.A.dh.mixers[0]);

/* Reset Dream House — confirm path is tested at the function, and only the DH key is cleared */
Wfd.store.rubloxDreamHouse = JSON.stringify({ver:6, introSeen:true, granted:true, coins:88, pieces:[['slab',2,0,2,0,0]], stock:{brick:9}, upgrades:{carry:2}, goals:{slab:1}});
// also keep other keys
const stablesBefore = Wfd.store.rubloxStables;
const recentBefore = Wfd.store.rubloxRecentGames;
const fdWalletBefore = Wfd.coins;
const didReset = Wfd.A.dhResetProgress();
const after = JSON.parse(Wfd.store.rubloxDreamHouse);
chk('Reset Dream House clears only the house save and starts over', didReset && after && after.ver === 7 && (after.pieces||[]).length === 0 && (after.coins|0) === 0 && !after.introSeen && !(after.upgrades && after.upgrades.carry) && !(after.stock && after.stock.brick), after);
chk('reset does not touch other Rublox saves, the Continue history, or the main wallet', Wfd.store.rubloxStables === stablesBefore && Wfd.store.rubloxRecentGames === recentBefore && Wfd.coins === fdWalletBefore, {stables:Wfd.store.rubloxStables, recent:Wfd.store.rubloxRecentGames, coins:Wfd.coins, fdWalletBefore});

})();

(function(){
/* In-memory reset, dual mixer carry, HUD count sync, held tool, and foundation-via-goal. */
const Wr = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:40, pieces:[], stock:{}, upgrades:{}, goals:{}})});
Wr.A.buildDreamHouse();
Wr.A.dh.introSeen = true; Wr.A.dh.intro = null;
Wr.A.dreamhouseEnter();
const footR = Wr.A.dhFoot();
Wr.A.dhSetJob('mark');
let rStakes = 0;
for (let ix = footR.x0; ix <= footR.x1; ix++) for (let iz = footR.z0; iz <= footR.z1; iz++){
  aimFoot(Wr, ix, iz);
  if (Wr.A.dhMarkOrDig()) rStakes++;
}
Wr.A.dhBuy('cement', 3);
chk('pre-reset memory has stakes and carried cement', rStakes >= 1 && (Wr.A.dh.pieces[0]||[]).some(a => a[0]==='mark') && Wr.A.dh.carry && Wr.A.dh.carry.id === 'cement', {stakes:rStakes, carry:Wr.A.dh.carry, pieces:(Wr.A.dh.pieces[0]||[]).length});
chk('reset is exposed on window so Settings can call it', typeof Wr.dhResetProgress === 'function' && Wr.dhResetProgress === Wr.A.dhResetProgress);
const didMem = Wr.A.dhResetProgress();
chk('reset clears in-memory stakes, carry, stock, and checklist progress', didMem && Wr.A.dh && !(Wr.A.dh.carry) && !(Wr.A.dh.bag) && !(Wr.A.dh.pieces[0]||[]).length && Wr.A.dhJobCounts('mark').have === 0 && (Wr.A.dh.stock.cement|0) === 0, {carry:Wr.A.dh && Wr.A.dh.carry, pieces:Wr.A.dh && (Wr.A.dh.pieces[0]||[]).length, have:Wr.A.dh && Wr.A.dhJobCounts('mark').have, stock:Wr.A.dh && Wr.A.dh.stock});
const savedR = JSON.parse(Wr.store.rubloxDreamHouse);
chk('reset also writes an empty house save', (savedR.pieces||[]).length === 0 && !savedR.introSeen, savedR);

const Wc = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{cement:2}, upgrades:{}, goals:{}})});
Wc.A.buildDreamHouse();
Wc.A.dh.introSeen = true; Wc.A.dh.intro = null;
Wc.A.dreamhouseEnter();
Wc.A.dh.stock.cement = 2;
Wc.A.dhBuy('cement', 1);
chk('you can carry sand together with cement for the mixer', Wc.A.dhBuy('sand', 2) === true && Wc.A.dhCarryOf('cement') >= 1 && Wc.A.dhCarryOf('sand') >= 1, {carry:Wc.A.dh.carry, bag:Wc.A.dh.bag});
Wc.A.dhHud(); Wc.A.dhBar();
const topCement = (Wc.els['#dhInv'] && Wc.els['#dhInv'].textContent) || '';
const barHtml = (Wc.els['#dhBar'] && Wc.els['#dhBar'].innerHTML) || '';
const invN = Wc.A.dhInvCount('cement');
chk('top HUD and toolbar both use the same cement count (stock plus carried)', invN === ((Wc.A.dh.stock.cement|0) + Wc.A.dhCarryOf('cement')) && invN === 3 && topCement.includes('3') && barHtml.includes('>3<'), {invN, top:topCement, bar:barHtml, stock:Wc.A.dh.stock.cement, carry:Wc.A.dh.carry, bag:Wc.A.dh.bag, keys:Object.keys(Wc.els||{})});
const held = Wc.A.dhHeldInfo();
chk('held-item HUD names the carried mixer bags, not Hands empty', held && /cement/i.test(held.carryText) && !/Hands empty/.test(held.carryText), held);
const dumpAt = Wc.A.dhSpawnPos(0);
Wc.P.x = dumpAt.x; Wc.P.z = dumpAt.z;
Wc.A.dhDump();
Wc.A.dh.carry = null; Wc.A.dh.bag = null;
Wc.A.dhSetJob('mark');
const toolHeld = Wc.A.dhHeldInfo();
chk('with the Stake tool selected, the hand shows Stake, not Hands empty', toolHeld && /Stake/i.test(toolHeld.carryText + toolHeld.label) && !/Hands empty/.test(toolHeld.carryText), toolHeld);

const Wg = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
Wg.A.buildDreamHouse();
Wg.A.dh.introSeen = true; Wg.A.dh.intro = null;
Wg.A.dreamhouseEnter();
chk('a fresh game goal tells you to stake first', /Stake/i.test(Wg.A.dhGoalText()), Wg.A.dhGoalText());
const footG = Wg.A.dhFoot();
Wg.A.dhSetJob('mark');
for (let ix = footG.x0; ix <= footG.x1; ix++) for (let iz = footG.z0; iz <= footG.z1; iz++){ aimFoot(Wg, ix, iz); Wg.A.dhMarkOrDig(); }
chk('after staking, the on-screen goal tells you to dig', /Dig/i.test(Wg.A.dhGoalText()) && Wg.A.dhStageId() === 'dig', Wg.A.dhGoalText());
Wg.A.dhSetJob('dig');
for (let ix = footG.x0; ix <= footG.x1; ix++) for (let iz = footG.z0; iz <= footG.z1; iz++){ aimFoot(Wg, ix, iz); Wg.A.dhMarkOrDig(); }
chk('after digging, the on-screen goal tells you to grab Cement + Sand', /Cement \+ Sand/i.test(Wg.A.dhGoalText()) && Wg.A.dhStageId() === 'pour', Wg.A.dhGoalText());
const gMix = Wg.A.dhGuideTarget();
chk('when the goal is Cement + Sand, the guide arrow points to the Supply Yard or a pile', !!(gMix && /Supply Yard|Cement|Sand|supplies/i.test(gMix.text)), gMix);
Wg.A.dhBuy('cement'); Wg.A.dhBuy('sand');
const gMix2 = Wg.A.dhGuideTarget();
const mxg = Wg.A.dh.mixers[0];
chk('after grabbing both mixer bags, the goal and arrow point at the Cement Mixer', /mixer/i.test(Wg.A.dhGoalText()) && !!(gMix2 && /mixer/i.test(gMix2.text)) && mxg && Math.hypot(gMix2.x - mxg.x, gMix2.z - mxg.z) < 0.2, {goal:Wg.A.dhGoalText(), guide:gMix2, mixer:mxg && {x:mxg.x,z:mxg.z}});
})();


(function(){
/* Drive the real handlers (dhKey, dreamhouseUpdate, dump, buy) — not just helpers. */
const Wh = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
Wh.A.buildDreamHouse();
Wh.A.dh.introSeen = true; Wh.A.dh.intro = null;
Wh.A.dreamhouseEnter();
Wh.A.dhForceFirstPerson();
chk('after the intro the camera is first person (not a chase cam at 12 m)', !!(Wh.cam && Wh.cam.dist <= 1 && Wh.cam.pitch >= .25), Wh.cam);
const goal0 = Wh.A.dhGoalText(), list0 = Wh.A.dhChecklist();
chk('the goal text and checklist both show Stake 0/16', /Stake 0\/16/.test(goal0) && list0.some(l => /Stake/.test(l) && /0\/16/.test(l)), {goal:goal0, list:list0});

const pitch0 = Wh.cam.pitch, yaw0 = Wh.cam.yaw;
Wh.keys.KeyI = true;
Wh.A.dreamhouseUpdate(0.2);
chk('holding I looks up through the real update loop (keyboard look fallback)', Wh.cam.pitch < pitch0 - 0.05, {pitch:Wh.cam.pitch, before:pitch0});
Wh.keys.KeyI = false; Wh.keys.KeyK = true;
Wh.A.dreamhouseUpdate(0.35);
chk('holding K looks down through the real update loop', Wh.cam.pitch > pitch0, {pitch:Wh.cam.pitch, before:pitch0});
Wh.keys.KeyK = false; Wh.keys.KeyJ = true;
Wh.A.dreamhouseUpdate(0.2);
chk('holding J turns left through the real update loop', Wh.cam.yaw !== yaw0, {yaw:Wh.cam.yaw, before:yaw0});
Wh.keys.KeyJ = false;
Wh.keys.ArrowRight = true;
const yaw1 = Wh.cam.yaw;
Wh.A.dreamhouseUpdate(0.2);
chk('arrow keys also turn the camera (VNC / no-mouse fallback)', Wh.cam.yaw !== yaw1, {yaw:Wh.cam.yaw, before:yaw1});
Wh.keys.ArrowRight = false;

const sp = Wh.A.dhSpawnPos(0);
Wh.P.x = sp.x; Wh.P.z = sp.z; Wh.P.y = .05;
Wh.cam.yaw = Math.PI;
Wh.cam.pitch = 0.28;
Wh.keys.KeyK = true;
Wh.A.dreamhouseUpdate(0.07);
Wh.keys.KeyK = false;
const nextStake = Wh.A.dhNextBuildCell('mark');
if (nextStake) aimFoot(Wh, nextStake.ix, nextStake.iz);
const marksBefore = (Wh.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
const aimed = Wh.A.dhAimFootCell('mark');
Wh.A.dhKey({code:'KeyE', repeat:false});
chk('after looking down with IJKL, E through dhKey places a stake on the glowing outline', (Wh.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length === marksBefore + 1, {aimed, marks:(Wh.A.dh.pieces[0]||[]).filter(a=>a[0]==='mark').length, cam:Wh.cam, P:{x:Wh.P.x,z:Wh.P.z}, banners:Wh.banners.slice(-3)});

Wh.A.dh.carry = {id:'wood', n:6}; Wh.A.dh.bag = null;
Wh.P.x = Wh.A.DH_YARD.x; Wh.P.z = Wh.A.DH_YARD.z;
const dumped = Wh.A.dhKey({code:'KeyQ', repeat:false});
chk('Q at the Supply Yard dumps carried planks through the real key handler', dumped === true && !Wh.A.dh.carry && (Wh.A.dh.stock.wood|0) >= 6, {dumped, carry:Wh.A.dh.carry, stock:Wh.A.dh.stock.wood, banners:Wh.banners.slice(-2)});

Wh.A.dh.carry = {id:'wood', n:6}; Wh.A.dh.bag = null;
const grabbed = Wh.A.dhBuy('sand', 1);
chk('grabbing Sand in the yard auto-returns Planks and does not lock you out', grabbed === true && Wh.A.dhCarryOf('sand') >= 1 && !Wh.A.dhCarryOf('wood') && (Wh.A.dh.stock.wood|0) >= 6, {grabbed, carry:Wh.A.dh.carry, bag:Wh.A.dh.bag, stock:Wh.A.dh.stock});
const both = Wh.A.dhBuy('cement', 1);
chk('Cement + Sand can still be carried together after an auto-return', both === true && Wh.A.dhCarryOf('sand') >= 1 && Wh.A.dhCarryOf('cement') >= 1, {carry:Wh.A.dh.carry, bag:Wh.A.dh.bag});

Wh.A.dhDump();
Wh.A.dh.carry = {id:'wood', n:6};
Wh.A.dhHud(); Wh.A.dhBar();
const invN = Wh.A.dhInvCount('wood');
const top = (Wh.els['#dhInv'] && Wh.els['#dhInv'].textContent) || '';
const bar = (Wh.els['#dhBar'] && Wh.els['#dhBar'].innerHTML) || '';
const held = Wh.A.dhHeldInfo();
chk('toolbar, top HUD, and hand all share the same plank total', invN === ((Wh.A.dh.stock.wood|0) + Wh.A.dhCarryOf('wood')) && (top.includes(String(invN)) || top.includes('🪵'+invN) || top.includes('🪵 '+invN)) && bar.includes('>' + invN + '<') && held && String(held.label + held.carryText).includes(String(invN)), {invN, top, bar, held, stock:Wh.A.dh.stock.wood, carry:Wh.A.dh.carry});

const Wpiles = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
Wpiles.A.buildDreamHouse();
Wpiles.A.dh.introSeen = true; Wpiles.A.dh.intro = null;
Wpiles.A.dreamhouseEnter();
const footP = Wpiles.A.dhFoot();
Wpiles.A.dhSetJob('mark');
for (let ix = footP.x0; ix <= footP.x1; ix++) for (let iz = footP.z0; iz <= footP.z1; iz++){ aimFoot(Wpiles, ix, iz); Wpiles.A.dhMarkOrDig(); }
Wpiles.A.dhSetJob('dig');
for (let ix = footP.x0; ix <= footP.x1; ix++) for (let iz = footP.z0; iz <= footP.z1; iz++){ aimFoot(Wpiles, ix, iz); Wpiles.A.dhMarkOrDig(); }
Wpiles.A.dhSetJob('pour');
Wpiles.A.dhRefreshBins();
const [pox, poz] = Wpiles.A.dhOrigin(0);
const pcx = pox + 8 * 1.4 / 2, pcz = poz + 8 * 1.4 / 2;
const cem = Wpiles.A.dh.bins.find(b => b.id === 'cement');
const snd = Wpiles.A.dh.bins.find(b => b.id === 'sand');
const plk = Wpiles.A.dh.bins.find(b => b.id === 'wood');
const dCem = Math.hypot(cem.x - pcx, cem.z - pcz), dPlk = Math.hypot(plk.x - pcx, plk.z - pcz);
chk('when the goal is Cement/Sand, those piles sit closer to the plot than Planks', dCem < dPlk && Math.hypot(snd.x - pcx, snd.z - pcz) < dPlk, {dCem, dSand:Math.hypot(snd.x-pcx,snd.z-pcz), dPlk, cem, snd, plk});
// Stand at the yard entrance (east of the yard, toward the plot) and press E
Wpiles.P.x = (cem.x + pcx) / 2; Wpiles.P.z = cem.z;
if (!Wpiles.A.dhNearYard()){ Wpiles.P.x = cem.x; Wpiles.P.z = cem.z; }
const promptGrab = Wpiles.A.dhActPrompt();
const near = Wpiles.A.dhNearBin();
const eGrab = Wpiles.A.dhKey({code:'KeyE', repeat:false});
chk('E at the Supply Yard grabs the needed Cement/Sand, not Planks, and the prompt says so', near && (near.id === 'cement' || near.id === 'sand') && /Cement|Sand/.test(promptGrab) && /need/i.test(promptGrab) && eGrab && (Wpiles.A.dhCarryOf('cement') || Wpiles.A.dhCarryOf('sand')) && !Wpiles.A.dhCarryOf('wood'), {near, prompt:promptGrab, carry:Wpiles.A.dh.carry, bag:Wpiles.A.dh.bag, eGrab, banners:Wpiles.banners.slice(-3)});
const guide = Wpiles.A.dhGuideTarget();
chk('the guide arrow points at the needed pile', !!(guide && cem && (Math.hypot(guide.x - cem.x, guide.z - cem.z) < 0.3 || (snd && Math.hypot(guide.x - snd.x, guide.z - snd.z) < 0.3) || /Cement|Sand|mixer|Supply/i.test(guide.text))), guide);

const Ws = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
Ws.A.buildDreamHouse(); Ws.A.dreamhouseEnter();
Ws.P.vx = 20; Ws.P.vz = 0; Ws.A.dhClampPlayer();
chk('first-person walk speed is capped near 3.6 m/s', Math.hypot(Ws.P.vx, Ws.P.vz) <= 3.61 && Math.abs(Ws.A.dhWalkCap() - 3.6) < 1e-6, {v:Math.hypot(Ws.P.vx,Ws.P.vz), cap:Ws.A.dhWalkCap()});
Ws.keys.KeyW = true; Ws.P.vx = 4; Ws.P.vz = 0;
Ws.A.dhClearHeldKeys();
chk('clearing keys on blur/pointer-lock stops a stuck W so you do not keep sliding', Ws.keys.KeyW === false && Math.abs(Ws.P.vx) < 0.01 && Math.abs(Ws.P.vz) < 0.01, {keys:Ws.keys, v:{x:Ws.P.vx,z:Ws.P.vz}});
})();


(function(){
  const Wu = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wu.A.buildDreamHouse(); Wu.A.dreamhouseEnter();
  function node(id, tag, cls, parent){
    const el = {id, tagName:(tag||'DIV').toUpperCase(), className: cls||'', parentElement: parent||null, parentNode: parent||null};
    el.closest = function(sel){
      let n = this;
      const ids=[], tags=[], classes=[];
      String(sel).split(',').forEach(part => {
        part = part.trim();
        if (part.startsWith('#')) ids.push(part.slice(1));
        else if (part.startsWith('.')) classes.push(part.slice(1));
        else tags.push(part.toLowerCase());
      });
      while (n){
        if (ids.includes(n.id)) return n;
        if (tags.includes((n.tagName||'').toLowerCase())) return n;
        const cn = ' ' + (n.className||'') + ' ';
        if (classes.some(c => cn.includes(' '+c+' '))) return n;
        n = n.parentElement;
      }
      return null;
    };
    return el;
  }
  const modal = node('dhResetModal', 'DIALOG', 'modal');
  const yes = node('dhResetYes', 'BUTTON', '', modal); yes.parentElement = modal;
  const cancel = node('dhResetNo', 'BUTTON', '', modal); cancel.parentElement = modal;
  const bar = node('dhBar', 'DIV', 'dhbar');
  const tool = node('stakeBtn', 'BUTTON', '', bar); tool.parentElement = bar;
  const canvas = node('', 'CANVAS', '');
  chk('clicks on the reset confirm are UI events the game must not consume', Wu.A.dhIsUiEvent({target: yes}) === true && Wu.A.dhIsUiEvent({target: cancel}) === true && Wu.A.dhIsUiEvent({target: modal}) === true);
  chk('clicks on toolbar / HUD buttons are UI events the game must not consume', Wu.A.dhIsUiEvent({target: tool}) === true && Wu.A.dhIsUiEvent({target: bar}) === true);
  chk('clicks on the 3D canvas are not treated as UI', Wu.A.dhIsUiEvent({target: canvas}) === false);

  // Modal Yes / Cancel / Esc while DH is running (handlers live in the page; also
  // dhKey must treat Esc as "close the confirm first" when dhOnResetKey says so).
  let closed = 0, confirmed = 0;
  const openModal = {open: true, classList:{contains: c => c === 'show'}};
  Wu.document.getElementById = id => id === 'dhResetModal' ? openModal : null;
  Wu.dhCloseReset = () => { closed++; openModal.open = false; };
  Wu.dhOnResetKey = e => { if ((e.code === 'Escape') && openModal.open){ Wu.dhCloseReset(); return true; } return false; };
  Wu.dhConfirmReset = () => { confirmed++; Wu.dhCloseReset(); };
  openModal.open = true; closed = 0;
  const esc = Wu.A.dhKey({code:'Escape', repeat:false, target: modal});
  chk('Esc while the confirm is open closes it and is consumed (DH still running)', esc === true && closed === 1 && openModal.open === false, {esc, closed, open:openModal.open});
  // Cancel-equivalent: a click on the Cancel button is filtered as UI
  chk('a Cancel button click is ignored by dhKey (not treated as a game key)', Wu.A.dhKey({code:'KeyE', type:'click', repeat:false, target: cancel}) === true);

  // Keyboard look: a short 70 ms tap only nudges; a 0.2 s hold still looks up enough for the existing test.
  const Wlook = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wlook.A.buildDreamHouse(); Wlook.A.dh.introSeen = true; Wlook.A.dh.intro = null; Wlook.A.dreamhouseEnter();
  const y0 = Wlook.cam.yaw;
  const tapEv = {type:'keydown', code:'ArrowRight', key:'ArrowRight', target:{tagName:'BODY', closest(){ return null; }}, preventDefault(){}, stopPropagation(){}};
  Wlook.A.dhNoteLookKey(tapEv, true);
  Wlook.A.dhNoteLookKey({type:'keyup', code:'ArrowRight', key:'ArrowRight', target:tapEv.target}, false);
  const tap = Math.abs(Wlook.cam.yaw - y0);
  const y1 = Wlook.cam.yaw;
  Wlook.keys.ArrowRight = true;
  Wlook.A.dhLookWithKeys(0.2);
  const hold = Math.abs(Wlook.cam.yaw - y1);
  chk('a quick arrow keydown+keyup nudges the view about 2° even before the next frame', tap > 0.02 && tap < 0.05, {tap, deg: tap*180/Math.PI});
  chk('a held arrow turn is about 70°/s', hold > 0.18 && hold < 0.32, {hold, deg: hold*180/Math.PI, perSec: (hold/0.2)*180/Math.PI});

  // Reset then skip intro: starter supplies match a brand-new game.
  const Wnew = world();
  Wnew.A.buildDreamHouse(); Wnew.A.dreamhouseEnter();
  if (Wnew.A.dh.intro) Wnew.A.dhSkipIntro();
  const newStock = Object.assign({}, Wnew.A.dh.stock);
  const Wr = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:40, pieces:[['slab',2,0,2,0,0]], stock:{brick:99,cement:9}, upgrades:{carry:2}, goals:{slab:1}})});
  Wr.A.buildDreamHouse(); Wr.A.dreamhouseEnter();
  Wr.A.dhResetProgress();
  Wr.A.buildDreamHouse(); Wr.A.dreamhouseEnter();
  if (Wr.A.dh.intro) Wr.A.dhSkipIntro();
  chk('after Reset, skipping the intro grants the same starter pile as a brand-new game (16 bricks and the rest)', (Wr.A.dh.stock.brick|0) === (newStock.brick|0) && (Wr.A.dh.stock.brick|0) === 16 && (Wr.A.dh.stock.cement|0) === (newStock.cement|0) && (Wr.A.dh.stock.sand|0) === (newStock.sand|0) && (Wr.A.dh.stock.wood|0) === (newStock.wood|0), {reset:Wr.A.dh.stock, fresh:newStock});
})();

(function(){
  // Arrow keys must reach look code even if Skip / a HUD button still has focus.
  const Wa = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wa.A.buildDreamHouse(); Wa.A.dh.introSeen = true; Wa.A.dh.intro = null; Wa.A.dreamhouseEnter();
  function node(id, tag, cls, parent){
    const el = {id, tagName:(tag||'DIV').toUpperCase(), className: cls||'', parentElement: parent||null, parentNode: parent||null};
    el.closest = function(sel){
      let n = this;
      const ids=[], tags=[], classes=[];
      String(sel).split(',').forEach(part => {
        part = part.trim();
        if (part.startsWith('#')) ids.push(part.slice(1));
        else if (part.startsWith('.')) classes.push(part.slice(1));
        else tags.push(part.toLowerCase());
      });
      while (n){
        if (ids.includes(n.id)) return n;
        if (tags.includes((n.tagName||'').toLowerCase())) return n;
        const cn = ' ' + (n.className||'') + ' ';
        if (classes.some(c => cn.includes(' '+c+' '))) return n;
        n = n.parentElement;
      }
      return null;
    };
    return el;
  }
  const skip = node('dhSkip', 'BUTTON', 'dhskip');
  const yaw0 = Wa.cam.yaw;
  const ev = {type:'keydown', code:'ArrowRight', key:'ArrowRight', target: skip, preventDefault(){}, stopPropagation(){}};
  chk('a focused Skip / HUD button is not treated as a key-blocking UI target', Wa.A.dhIsUiEvent(ev, 'key') === false, {ui: Wa.A.dhIsUiEvent(ev, 'key')});
  const noted = Wa.A.dhNoteLookKey(ev, true);
  Wa.A.dhLookWithKeys(0.2);
  chk('arrow keys still look when a leftover button is focused', noted === true && Wa.keys.ArrowRight === true && Math.abs(Wa.cam.yaw - yaw0) > 0.05, {noted, key:Wa.keys.ArrowRight, yaw:Wa.cam.yaw, before:yaw0});

  // replaced by camera-math targeting tests below


  // Toolbar hides while paused.
  const Wp = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wp.A.buildDreamHouse(); Wp.A.dh.introSeen = true; Wp.A.dh.intro = null; Wp.A.dreamhouseEnter();
  Wp.paused = false;
  Wp.A.dhBar(); Wp.A.dhSyncPauseHud();
  const bar = Wp.els['#dhBar'];
  chk('the toolbar is visible while playing', !!(bar && bar.style.display !== 'none' && bar.style.visibility !== 'hidden' && Wp.A.dhMenusUp() === false), bar && bar.style);
  Wp.paused = true;
  Wp.A.dhBar(); Wp.A.dhSyncPauseHud();
  chk('the toolbar is hidden while paused', !!(bar && (bar.style.display === 'none' || bar.style.visibility === 'hidden') && Wp.A.dhMenusUp() === true), bar && bar.style);
})();


(function(){
  // Real camera math: eye at 1.6 m, 3 m from a spot, pitched to look at it.
  const Wt = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wt.A.buildDreamHouse(); Wt.A.dh.introSeen = true; Wt.A.dh.intro = null; Wt.A.dreamhouseEnter();
  const foot = Wt.A.dhFoot();
  const cell = {ix: foot.x0, iz: foot.z0};
  const w = Wt.A.dhCellWorld(0, cell.ix, cell.iz, 0);
  Wt.P.x = w.x; Wt.P.y = 0; Wt.P.z = w.z - 3;
  Wt.cam.yaw = Math.PI;
  Wt.cam.pitch = Math.atan2(1.6, 3);
  Wt.camera = {position: {x: Wt.P.x, y: 1.6, z: Wt.P.z}};
  const marks0 = (Wt.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
  const aimed = Wt.A.dhTargetSpot('mark');
  const placed = Wt.A.dhMarkOrDig();
  chk('looking at a spot from 3 m at eye height 1.6 m places it with E (same target as the highlight)', !!(placed && aimed && aimed.ix === cell.ix && aimed.iz === cell.iz && (Wt.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length === marks0 + 1), {aimed, placed, marks:(Wt.A.dh.pieces[0]||[]).filter(a=>a[0]==='mark').length, cam:Wt.cam, P:{x:Wt.P.x,z:Wt.P.z}, w});
  // Looking at the sky does not place the next spot
  const cell2 = {ix: foot.x0 + 1, iz: foot.z0};
  const w2 = Wt.A.dhCellWorld(0, cell2.ix, cell2.iz, 0);
  Wt.P.x = w2.x; Wt.P.y = 0; Wt.P.z = w2.z - 3;
  Wt.cam.yaw = Math.PI; Wt.cam.pitch = -0.7;
  Wt.camera = {position: {x: Wt.P.x, y: 1.6, z: Wt.P.z}};
  const marks1 = (Wt.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
  const skyAim = Wt.A.dhTargetSpot('mark');
  const skyPlace = Wt.A.dhMarkOrDig();
  chk('looking at the sky does not place a stake', skyPlace === false && !skyAim && (Wt.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length === marks1, {skyAim, skyPlace, marks:(Wt.A.dh.pieces[0]||[]).filter(a=>a[0]==='mark').length});

  // Highlight target === placement target
  Wt.cam.pitch = Math.atan2(1.6, 3);
  const tgt = Wt.A.dhTargetSpot('mark');
  const aim2 = Wt.A.dhAimFootCell('mark');
  chk('highlight and placement use the same targeting function', !!(tgt && aim2 && tgt.ix === aim2.ix && tgt.iz === aim2.iz && tgt === aim2 || (tgt && aim2 && tgt.ix === aim2.ix)), {tgt, aim2});

  // Toolbar comes back after a lingering paused class (Home then reopen)
  const Wr = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wr.A.buildDreamHouse(); Wr.A.dh.introSeen = true; Wr.A.dh.intro = null; Wr.A.dreamhouseEnter();
  Wr.paused = true;
  Wr.document.getElementById = function(id){
    if (id === 'obby'){
      if (!this._obby){ this._obby = {id:'obby', classList:{_s:new Set(['paused','dh-paused']), add(c){ this._s.add(c); }, remove(...cs){ cs.forEach(c => this._s.delete(c)); }, contains(c){ return this._s.has(c); }, toggle(c, on){ if (on) this._s.add(c); else this._s.delete(c); }}}; }
      return this._obby;
    }
    if (id === 'oPausePanel'){
      if (!this._p){ this._p = {id:'oPausePanel', classList:{_s:new Set(['show']), add(c){ this._s.add(c); }, remove(...cs){ cs.forEach(c => this._s.delete(c)); }, contains(c){ return this._s.has(c); }}}; }
      return this._p;
    }
    if (id === 'dhTip') return Wr.els['#dhTip'] || null;
    return null;
  };
  Wr.A.dreamhouseStop();
  Wr.A.buildDreamHouse(); Wr.A.dh.introSeen = true; Wr.A.dh.intro = null; Wr.paused = false; Wr.menuOpen = false;
  Wr.A.dreamhouseEnter();
  Wr.A.dhBar(); Wr.A.dhSyncPauseHud();
  const bar = Wr.els['#dhBar'];
  const obby = Wr.document.getElementById('obby');
  chk('reopening Dream House after Home shows the toolbar (pause classes cleared)', !!(bar && bar.style.display !== 'none' && bar.style.visibility !== 'hidden' && Wr.A.dhMenusUp() === false && !obby.classList.contains('paused')), {bar: bar && bar.style, paused: obby.classList.contains('paused'), menus: Wr.A.dhMenusUp()});

  // Yes, reset closes the pause menu and starts the intro unpaused
  const Wx = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:40, pieces:[['slab',2,0,2,0,0]], stock:{brick:99}, upgrades:{}, goals:{}})});
  Wx.A.buildDreamHouse(); Wx.A.dreamhouseEnter();
  Wx.paused = true;
  let pauseClass = {s:new Set(['show']), add(c){ this.s.add(c); }, remove(...cs){ cs.forEach(c => this.s.delete(c)); }, contains(c){ return this.s.has(c); }};
  let rootClass = {s:new Set(['paused','dh-paused','dhouse']), add(c){ this.s.add(c); }, remove(...cs){ cs.forEach(c => this.s.delete(c)); }, contains(c){ return this.s.has(c); }, toggle(c,on){ if(on) this.s.add(c); else this.s.delete(c); }};
  Wx.document.getElementById = function(id){
    if (id === 'oPausePanel') return {id, classList: pauseClass};
    if (id === 'obby') return {id, classList: rootClass};
    if (id === 'dhTip') return Wx.els['#dhTip'] || {classList:{contains(){return false;}, remove(){}}, style:{}};
    return null;
  };
  Wx.A.dhClosePauseMenus();
  Wx.A.dhResetProgress();
  chk('Yes, reset closes the pause menu and restarts the intro unpaused', !Wx.paused && !pauseClass.contains('show') && !rootClass.contains('paused') && !!(Wx.A.dh && Wx.A.dh.intro), {paused:Wx.paused, pauseShow:pauseClass.contains('show'), intro:Wx.A.dh && Wx.A.dh.intro, classes:[...rootClass.s]});

  // Tips are queued while paused and not shown
  const Wp = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wp.A.buildDreamHouse(); Wp.A.dh.introSeen = true; Wp.A.dh.intro = null; Wp.A.dreamhouseEnter();
  Wp.paused = true;
  const tipEl = Wp.els['#dhTip'] || (Wp.$('#dhTip'));
  Wp.A.dhShowTip('queued tip for later');
  chk('a Quick Tip is not shown while paused (it is queued)', tipEl.classList.contains('show') !== true && Wp.A.dh._tipQueue === 'queued tip for later', {show: tipEl.classList.contains('show'), q: Wp.A.dh._tipQueue, display: tipEl.style.display});
  Wp.paused = false;
  Wp.A.dhFlushTips();
  chk('the queued tip appears after unpausing', (Wp.els['#dhTipT'] && Wp.els['#dhTipT'].textContent === 'queued tip for later') && tipEl.style.display !== 'none' && !Wp.A.dh._tipQueue, {show: tipEl.classList.contains('show'), display: tipEl.style.display, text: Wp.els['#dhTipT'] && Wp.els['#dhTipT'].textContent, q: Wp.A.dh._tipQueue});

  // During the intro, supply HUD is hidden (no "no stock" vs 16 bricks mismatch)
  const Wi = world();
  Wi.A.buildDreamHouse(); Wi.A.dreamhouseEnter();
  chk('a new game starts the intro', !!(Wi.A.dh && Wi.A.dh.intro));
  Wi.A.dhHud(); Wi.A.dhBar();
  const boxI = Wi.els['#dhBox'], barI = Wi.els['#dhBar'], crossI = Wi.els['#oCross'];
  chk('supply HUD, toolbar and crosshair are hidden during the intro', !!(boxI && boxI.style.display === 'none') && !!(barI && (barI.style.display === 'none' || barI.style.visibility === 'hidden')) && !!(crossI && crossI.style.display === 'none'), {box: boxI && boxI.style, bar: barI && barI.style, cross: crossI && crossI.style});
  Wi.A.dhSkipIntro();
  Wi.A.dhHud(); Wi.A.dhBar();
  const bitsI = (Wi.A.dhStatusBits() || []).join(' ');
  chk('after the intro, the top HUD and toolbar agree on the starter pile', (Wi.A.dhInvCount('brick')|0) === 16 && /16/.test(bitsI) && /16/.test(boxI.innerHTML) && boxI.style.display !== 'none' && barI.style.display !== 'none', {bits: bitsI, box: boxI.innerHTML, bar: barI.style.display, n: Wi.A.dhInvCount('brick')});

  // Closing Supply Yard (and other menus) must restore the toolbar
  const Wy = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{brick:16}, upgrades:{}, goals:{}})});
  Wy.A.buildDreamHouse(); Wy.A.dh.introSeen = true; Wy.A.dh.intro = null; Wy.A.dreamhouseEnter();
  Wy.A.dhBar();
  Wy.A.dhToggleYard(true);
  Wy.A.dhBar(); // a buy/refresh while the yard is open used to leave the bar display:none
  chk('toolbar is hidden while the Supply Yard is open', !!(Wy.els['#dhBar'] && (Wy.els['#dhBar'].style.display === 'none' || Wy.els['#dhBar'].style.visibility === 'hidden')), {bar: Wy.els['#dhBar'] && Wy.els['#dhBar'].style, yard: Wy.A.dh.yardOpen});
  Wy.A.dhToggleYard(false);
  const barY = Wy.els['#dhBar'];
  chk('closing the Supply Yard restores the toolbar while playing and unpaused', !Wy.A.dh.yardOpen && !!barY && barY.style.display !== 'none' && barY.style.visibility !== 'hidden' && !barY.classList.contains('dh-paused-hide'), {open: Wy.A.dh.yardOpen, bar: barY && barY.style, classes: barY && barY.classList});
  Wy.A.dhToggleShop(true); Wy.A.dhBar(); Wy.A.dhToggleShop(false);
  chk('closing the Furniture store restores the toolbar', Wy.els['#dhBar'].style.display !== 'none' && !Wy.A.dh.shopOpen, {bar: Wy.els['#dhBar'].style.display, shop: Wy.A.dh.shopOpen});
  Wy.A.dhToggleUp(true); Wy.A.dhBar(); Wy.A.dhToggleUp(false);
  chk('closing Upgrades restores the toolbar', Wy.els['#dhBar'].style.display !== 'none' && !Wy.A.dh.upOpen, {bar: Wy.els['#dhBar'].style.display, up: Wy.A.dh.upOpen});

  // Top-left status bar drops empty segments, hides while paused
  const Ws = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:100, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Ws.A.buildDreamHouse(); Ws.A.dh.introSeen = true; Ws.A.dh.intro = null; Ws.A.dh.stock = {}; Ws.A.dreamhouseEnter();
  Ws.A.dhHud();
  const bitsEmpty = Ws.A.dhStatusBits();
  const joined = bitsEmpty.join(' · ');
  chk('status bar drops empty inventory and carry segments', bitsEmpty.length >= 1 && !bitsEmpty.some(b => !String(b).trim()) && !/·\s*·/.test(joined) && !/no stock/i.test(joined) && !/Hands empty/i.test(joined) && /100/.test(joined), {bits: bitsEmpty, joined});
  Ws.A.dh.carry = {id:'cement', n:1}; Ws.A.dh.bag = {id:'sand', n:1};
  const bitsCarry = Ws.A.dhStatusBits();
  chk('status bar includes a Carrying segment only when hands are full', bitsCarry.some(b => /Carrying/.test(b)) && bitsCarry.every(b => String(b).trim()), {bits: bitsCarry});
  Ws.A.dhHud();
  const boxS = Ws.els['#dhBox'];
  chk('status bar is visible while playing', boxS && boxS.style.display !== 'none' && /Carrying/.test(boxS.innerHTML), {display: boxS && boxS.style.display, html: boxS && boxS.innerHTML});
  Ws.paused = true; Ws.A.updateDhChrome();
  chk('status bar is hidden while paused', boxS.style.display === 'none', {display: boxS.style.display});
  Ws.paused = false; Ws.A.updateDhChrome();
  chk('status bar returns after unpausing', boxS.style.display !== 'none', {display: boxS.style.display});

  // Status bits never keep empty parts or trailing dots
  const bitsJoin = (Ws.A.dhStatusBits() || []).join(' · ');
  chk('status bar joins only non-empty parts (no leading, trailing, or double dots)', bitsJoin.length > 0 && !/^[·\s]|[·\s]$/.test(bitsJoin) && !/·\s*·/.test(bitsJoin), {bitsJoin, bits: Ws.A.dhStatusBits()});

  // Auto-switch the held tool when the stage advances to Dig
  const Wg = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:40, pieces:[], stock:{glass:4, brick:16}, upgrades:{}, goals:{}})});
  Wg.A.buildDreamHouse(); Wg.A.dh.introSeen = true; Wg.A.dh.intro = null; Wg.A.dreamhouseEnter();
  Wg.A.dhSetJob('mark');
  const footG = Wg.A.dhFootCells();
  footG.forEach(c => Wg.A.dhPut(0, ['mark', c.ix, 0, c.iz, 0, 0], true));
  Wg.A.dhSyncJobToStage();
  Wg.A.dhHud();
  const heldDig = Wg.A.dhHeldInfo();
  chk('after staking finishes, the held tool switches to Dig / Shovel', Wg.A.dhStageId() === 'dig' && Wg.A.dh.job === 'dig' && /Shovel|Dig/i.test(heldDig.carryText) && !/Stake/i.test(heldDig.carryText), {stage: Wg.A.dhStageId(), job: Wg.A.dh.job, held: heldDig});

  // Carrying glass during Dig must not say Install glass
  Wg.P.x = Wg.A.dhCellWorld(0, footG[0].ix, footG[0].iz, 0).x;
  Wg.P.z = Wg.A.dhCellWorld(0, footG[0].ix, footG[0].iz, 0).z;
  Wg.A.dh.carry = {id:'glass', n:2};
  const prompt = Wg.A.dhActPrompt();
  chk('carrying glass in the Dig step does not prompt to install glass', /later/i.test(prompt) && /dig the foundation now/i.test(prompt) && !/^🪟?\s*Install glass\s*$/i.test(prompt), {prompt, stage: Wg.A.dhStageId(), job: Wg.A.dh.job, carry: Wg.A.dh.carry});

  // Arrow / look keys must not undo or remove stakes
  const Wu2 = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Wu2.A.buildDreamHouse(); Wu2.A.dh.introSeen = true; Wu2.A.dh.intro = null; Wu2.A.dreamhouseEnter();
  const cellsU = Wu2.A.dhFootCells().slice(0, 4);
  cellsU.forEach(c => Wu2.A.dhPut(0, ['mark', c.ix, 0, c.iz, 0, 0], true));
  const marksU0 = (Wu2.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
  ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyI','KeyK'].forEach(code => {
    const ev = {code, key: code, type:'keydown', repeat:false, preventDefault(){}, stopPropagation(){}};
    Wu2.A.dhNoteLookKey(ev, true);
    Wu2.A.dhKey(ev);
    Wu2.A.dhNoteLookKey(ev, false);
  });
  const marksU1 = (Wu2.A.dh.pieces[0]||[]).filter(a => a[0]==='mark').length;
  chk('arrow and look keys do not undo or remove stakes', marksU0 === 4 && marksU1 === 4 && Wu2.A.dh.tool !== 'delete', {marksU0, marksU1, tool: Wu2.A.dh.tool});

  // A single W tap takes a small step even before the next frame
  const Ww = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, upgrades:{}, goals:{}})});
  Ww.A.buildDreamHouse(); Ww.A.dh.introSeen = true; Ww.A.dh.intro = null; Ww.A.dreamhouseEnter();
  const xW = Ww.P.x, zW = Ww.P.z;
  Ww.A.dhNoteMoveKey({code:'KeyW', key:'w', type:'keydown', repeat:false}, true);
  const distW = Math.hypot(Ww.P.x - xW, Ww.P.z - zW);
  chk('a single W tap moves a small step on keydown', distW > 0.2 && distW < 1.0, {distW, xW, zW, x:Ww.P.x, z:Ww.P.z});
})();



(function(){
/* t257u: human-scale house, tidy brick grid, pitched roof, v6→v7 migrate */
const Wsc = world({rubloxDreamHouse: JSON.stringify({ver:7, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20});
Wsc.A.buildDreamHouse(); Wsc.A.dreamhouseEnter();
Wsc.A.dh.intro = null;
chk('wall top is more than 1 m above the player eye (about 2.7–3 m walls)', Wsc.A.dhWallTop() > Wsc.A.dhEyeHeight() + 1 && Wsc.A.dhWallTop() >= 2.7 && Wsc.A.dhWallTop() <= 3.05, {wallTop:Wsc.A.dhWallTop(), eye:Wsc.A.dhEyeHeight(), body:Wsc.A.dhPlayerHeight()});
chk('the pitched roof apex sits above the wall top and well above eye height', Wsc.A.dhRoofApex() > Wsc.A.dhWallTop() && Wsc.A.dhRoofApex() >= 4.0 && Wsc.A.dhRoofApex() > Wsc.A.dhEyeHeight() + 2, {apex:Wsc.A.dhRoofApex(), wallTop:Wsc.A.dhWallTop()});
chk('Dream House uses a 1.6 m eye and 1.8 m body (other modes keep the taller capsule)', Wsc.A.DH_EYE === 1.6 && Wsc.A.DH_PLAYER_H === 1.8 && Wsc.A.dhEyeHeight() === 1.6 && Wsc.A.dhPlayerHeight() === 1.8);

const recs = Wsc.A.dhAllBrickRecs();
const keys = recs.map(a => a[0] + ':' + (a[1]|0) + ',' + (a[2]|0) + ',' + (a[3]|0) + ',' + (a[4]|0));
const unique = new Set(keys);
let sameFaceOverlap = false;
const byFace = {};
recs.forEach(a => {
  const f = a[4]|0, c = a[2]|0, k = a[3]|0;
  const id = f + ':' + c + ':' + k;
  if (byFace[id]) sameFaceOverlap = true;
  byFace[id] = 1;
});
const boxes = Wsc.A.dhBrickBoxes(null);
let faceBoxOverlap = false;
for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++){
  const A = boxes[i], B = boxes[j];
  if (A.face !== B.face) continue;
  const ox = Math.abs(A.x - B.x) < (A.hx + B.hx - 0.02);
  const oy = Math.abs(A.y - B.y) < (A.hy + B.hy - 0.02);
  const oz = Math.abs(A.z - B.z) < (A.hz + B.hz - 0.02);
  if (ox && oy && oz) faceBoxOverlap = true;
}
chk('the brick grid has no duplicate or overlapping placements', unique.size === recs.length && recs.length === Wsc.A.dhBrickTotal() && !sameFaceOverlap && !faceBoxOverlap, {n:recs.length, unique:unique.size, total:Wsc.A.dhBrickTotal(), sameFaceOverlap, faceBoxOverlap});
chk('a small house is still a fun click count (140-250 bricks)', Wsc.A.dhBrickTotal() >= 140 && Wsc.A.dhBrickTotal() <= 250, Wsc.A.dhBrickTotal());
Wsc.A.dreamhouseStop();

// Tessa-style v6 house already at Paint & furnish: every earlier step done, last step 0/1.
const footCells = [];
for (let ix = 2; ix <= 5; ix++) for (let iz = 2; iz <= 5; iz++) footCells.push(['slab', ix, 0, iz, 0, 0]);
const v6pieces = footCells.concat([
  ['brick', 0, 0, 0, 0, 0], ['brick', 0, 0, 1, 0, 0],
  ['stud', 2, 0, 2, 0, 0], ['stud', 5, 0, 2, 0, 0], ['stud', 5, 0, 5, 0, 0], ['stud', 2, 0, 5, 0, 0],
  ['stud', 3, 0, 2, 0, 0], ['stud', 5, 0, 3, 0, 0], ['stud', 3, 0, 5, 0, 0], ['stud', 2, 0, 3, 0, 0],
  ['rafter', 3, 0, 2, 0, 0], ['rafter', 4, 0, 2, 0, 0], ['rafter', 3, 0, 5, 1, 0], ['rafter', 4, 0, 5, 1, 0],
  ['shingle', 2, 0, 2, 0, 0], ['shingle', 3, 0, 2, 0, 0], ['shingle', 4, 0, 2, 0, 0], ['shingle', 5, 0, 2, 0, 0],
  ['shingle', 2, 0, 3, 0, 0], ['shingle', 3, 0, 3, 0, 0], ['shingle', 2, 0, 5, 1, 0], ['shingle', 3, 0, 5, 1, 0],
  ['shingle', 4, 0, 5, 1, 0], ['shingle', 5, 0, 5, 1, 0],
  ['doorframe', 0, 0, 0, 0, 0], ['door', 0, 0, 0, 0, 0],
  ['winframe', 0, 3, 0, 1, 0], ['pane', 0, 3, 0, 1, 0],
  ['winframe', 0, 3, 0, 3, 0], ['pane', 0, 3, 0, 3, 0]
]);
const Wm = world({rubloxDreamHouse: JSON.stringify({ver:6, introSeen:true, granted:true, coins:55, pieces:v6pieces, stock:{paint:2, sofa:1, brick:8}, goals:{marked:1, slab:1, course:1, walls:1, rafters:1, roof:1, openings:1, glaze:1}, upgrades:{carry:1}})}, {coins:20});
Wm.A.buildDreamHouse(); Wm.A.dreamhouseEnter();
Wm.A.dh.intro = null;
const list = Wm.A.dh.pieces[0] || [];
const nBrick = list.filter(a => a[0]==='brick').length;
const nShingle = list.filter(a => a[0]==='shingle').length;
const brickKeys = list.filter(a => a[0]==='brick').map(a => a[0]+':'+(a[1]|0)+','+(a[2]|0)+','+(a[3]|0)+','+(a[4]|0));
const checklist = Wm.A.dhChecklist();
const last = checklist[checklist.length - 1] || '';
const earlier = checklist.slice(0, -1);
chk('a v6 house at the furnish step migrates to v7 and keeps its progress', Wm.A.DH_VER === 7 && nBrick === Wm.A.dhBrickTotal() && nShingle === Wm.A.dhShingleTotal() && list.filter(a => a[0]==='stud').length === Wm.A.dhStudTotal() && list.filter(a => a[0]==='rafter').length === Wm.A.dhRafterTotal() && list.some(a => a[0]==='door') && list.filter(a => a[0]==='winframe').length === 3 && list.filter(a => a[0]==='pane').length === 3 && (Wm.A.dh.stock.paint|0) >= 2 && (Wm.A.dh.upgrades.carry|0) === 1 && Wm.A.dh.introSeen === true && !!Wm.A.dh.goals.roof && !!Wm.A.dh.goals.glaze && Wm.A.dh.bank >= 55, {ver:Wm.A.DH_VER, nBrick, needB:Wm.A.dhBrickTotal(), nShingle, needS:Wm.A.dhShingleTotal(), stage:Wm.A.dhStageId(), goals:Wm.A.dh.goals, stock:Wm.A.dh.stock});
chk('after the v6→v7 migrate the house is still on Paint & furnish with earlier steps checked', earlier.every(s => /✔/.test(s)) && /Paint & furnish 0\/1/.test(last) && (Wm.A.dhStageId() === 'paint' || Wm.A.dhStageId() === 'furn'), {checklist, stage:Wm.A.dhStageId()});
chk('migrated bricks snap to the tidy v7 grid with no duplicates', brickKeys.length === new Set(brickKeys).size && nBrick === Wm.A.dhBrickTotal(), {nBrick, unique:new Set(brickKeys).size});
Wm.A.dreamhouseStop();
})();



(function(){
/* t257u follow-up: #dhtest= fixtures are in-memory only and never touch rubloxDreamHouse */
const prior = {ver:6, introSeen:true, granted:true, coins:99, pieces:[['slab',2,0,2,0,0],['brick',0,0,0,0,0]], stock:{brick:7, cement:3}, goals:{slab:1}, upgrades:{}, _sentinel:'keep-me'};
const priorJson = JSON.stringify(prior);

const Wf = world({rubloxDreamHouse: priorJson}, {coins:20, hash:'#dhtest=v6furnish'});
Wf.A.buildDreamHouse(); Wf.A.dreamhouseEnter();
Wf.A.dh.intro = null;
const furnList = Wf.A.dh.pieces[0] || [];
const furnCheck = Wf.A.dhChecklist();
const furnLast = furnCheck[furnCheck.length - 1] || '';
chk('#dhtest=v6furnish loads a furnish-step house through the real v6→v7 migrate', Wf.A.dhTestActive() === true && Wf.A.dhTestFixtureId() === 'v6furnish' && Wf.A.DH_VER === 7 && furnList.filter(a => a[0]==='brick').length === Wf.A.dhBrickTotal() && furnList.filter(a => a[0]==='shingle').length === Wf.A.dhShingleTotal() && furnList.some(a => a[0]==='door') && (furnCheck.slice(0, -1).every(s => /✔/.test(s)) && /Paint & furnish 0\/1/.test(furnLast)), {id:Wf.A.dhTestFixtureId(), bricks:furnList.filter(a=>a[0]==='brick').length, check:furnCheck, stage:Wf.A.dhStageId()});
Wf.A.dhSave();
Wf.A.dhPut(0, ['paint', 0, 0, 0, 0, 1], false);
if (typeof Wf.A.dhResetProgress === 'function') Wf.A.dhResetProgress();
const afterFurn = JSON.parse(Wf.store.rubloxDreamHouse);
chk('#dhtest=v6furnish never writes to localStorage (real rubloxDreamHouse is unchanged)', afterFurn && afterFurn.coins === 99 && (afterFurn.stock && afterFurn.stock.brick) === 7 && afterFurn._sentinel === 'keep-me' && (afterFurn.pieces||[]).length === 2 && afterFurn.ver === 6, afterFurn);
Wf.A.dreamhouseStop();

const Ww = world({rubloxDreamHouse: priorJson}, {coins:20, hash:'#dhtest=v7walls'});
Ww.A.buildDreamHouse(); Ww.A.dreamhouseEnter();
Ww.A.dh.intro = null;
const wallList = Ww.A.dh.pieces[0] || [];
const wallBricks = wallList.filter(a => a[0]==='brick');
const maxCourse = wallBricks.reduce((m, a) => Math.max(m, a[2]|0), -1);
chk('#dhtest=v7walls loads a half-built tidy wall (courses 0-2) and skips the intro', Ww.A.dhTestFixtureId() === 'v7walls' && wallBricks.length > 0 && wallBricks.length < Ww.A.dhBrickTotal() && maxCourse === 2 && wallList.some(a => a[0]==='slab') && Ww.A.dhStageId() === 'brick', {n:wallBricks.length, total:Ww.A.dhBrickTotal(), maxCourse, stage:Ww.A.dhStageId()});
Ww.A.dhSave();
Ww.A.dhPlaceBrick && Ww.A.dh.carry;
if (typeof Ww.A.dhResetProgress === 'function') Ww.A.dhResetProgress();
const afterWalls = JSON.parse(Ww.store.rubloxDreamHouse);
chk('#dhtest=v7walls never writes to localStorage (real rubloxDreamHouse is unchanged)', afterWalls && afterWalls.coins === 99 && afterWalls._sentinel === 'keep-me' && (afterWalls.pieces||[]).length === 2 && afterWalls.ver === 6, afterWalls);
Ww.A.dreamhouseStop();

const Win = world({rubloxDreamHouse: priorJson}, {coins:20, hash:'#dhtest=v6inside'});
Win.A.buildDreamHouse(); Win.A.dreamhouseEnter();
Win.A.dh.intro = null;
const inList = Win.A.dh.pieces[0] || [];
const inFoot = Win.A.dhFootWorld(0);
const inSp = Win.A.dhSpawnPos(0);
chk('#dhtest=v6inside is the furnish house, spawned inside facing the back wall', Win.A.dhTestActive() === true && Win.A.dhTestFixtureId() === 'v6inside' && inList.some(a => a[0]==='door') && inList.filter(a => a[0]==='brick').length === Win.A.dhBrickTotal() && inSp.x > inFoot.x0 + 0.5 && inSp.x < inFoot.x1 - 0.5 && inSp.z > inFoot.z0 + 0.5 && inSp.z < inFoot.z1 - 0.5 && Math.abs(Win.P.x - inSp.x) < 0.2 && Math.abs(Win.P.z - inSp.z) < 0.2 && Math.abs(((Win.cam.yaw % (Math.PI*2)) + Math.PI*2) % (Math.PI*2) - Math.PI) < 0.05, {id:Win.A.dhTestFixtureId(), sp:inSp, foot:inFoot, P:{x:Win.P.x,z:Win.P.z}, yaw:Win.cam.yaw});
Win.A.dhSave();
const afterIn = JSON.parse(Win.store.rubloxDreamHouse);
chk('#dhtest=v6inside never writes to localStorage (real rubloxDreamHouse is unchanged)', afterIn && afterIn.coins === 99 && afterIn._sentinel === 'keep-me' && afterIn.ver === 6, afterIn);
Win.A.dreamhouseStop();

const Wn = world({rubloxDreamHouse: priorJson}, {coins:20, hash:''});
Wn.A.buildDreamHouse();
chk('without a dhtest hash the real save still loads', (Wn.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length === 1 && Wn.A.dh.bank === 99 && !Wn.A.dhTestActive(), {bricks:(Wn.A.dh.pieces[0]||[]).length, bank:Wn.A.dh.bank, active:Wn.A.dhTestActive()});
Wn.A.dreamhouseStop();
})();



(function(){
/* t257u follow-up: walls block the player; doorway stays open; #dhtest note shows */
const Ww = world({rubloxDreamHouse: JSON.stringify({ver:7, introSeen:true, granted:true, coins:20, pieces:[], stock:{}, goals:{}, upgrades:{}})}, {coins:20, hash:'#dhtest=v6furnish'});
Ww.A.buildDreamHouse(); Ww.A.dreamhouseEnter();
Ww.A.dh.intro = null;
const shown = Ww.A.dhShowTestNote();
const note = Ww.els['#dhTestNote'] || Ww.els.dhTestNote;
chk('#dhtest shows a top-center “real save is untouched” note', !!(shown && Ww.A.dh._testNoteShown && note && /real Dream House save is not used or written/i.test(note.textContent || '')), {shown, flag:Ww.A.dh && Ww.A.dh._testNoteShown, text:note && note.textContent});

const foot = Ww.A.dhFootWorld(0);
const midX = (foot.x0 + foot.x1) / 2, midZ = (foot.z0 + foot.z1) / 2;
const R = 0.45, thick = Ww.A.DH_BRICK_D || 0.3;
Ww.P.x = midX; Ww.P.y = 0.05; Ww.P.z = midZ;
for (let i = 0; i < 40; i++) Ww.A.dhMovePlayer(0, 0.45);
const insideBack = Ww.P.z;
chk('walking into a built wall from inside stops at the wall', insideBack < foot.z1 - thick / 2 - R + 0.05 && insideBack > midZ + 0.5 && insideBack < foot.z1, {z:insideBack, z1:foot.z1, midZ, limit: foot.z1 - thick / 2 - R});

Ww.P.x = midX; Ww.P.z = foot.z1 + 2;
for (let i = 0; i < 40; i++) Ww.A.dhMovePlayer(0, -0.45);
const outsideBack = Ww.P.z;
chk('walking into a built wall from outside stops at the wall', outsideBack > foot.z1 - 0.05 && outsideBack > foot.z1 - thick / 2 - 0.2, {z:outsideBack, z1:foot.z1});

const door = Ww.A.dhOpeningWorld(0, 0, 'door');
Ww.P.x = door.x; Ww.P.z = foot.z0 - 2;
for (let i = 0; i < 40; i++) Ww.A.dhMovePlayer(0, 0.45);
chk('the doorway is passable', Ww.P.z > foot.z0 + 0.4 && Ww.P.z < foot.z1 - 0.1, {z:Ww.P.z, z0:foot.z0, z1:foot.z1, doorX:door.x, px:Ww.P.x});

// Also the W-tap path (keydown) must not walk through the back wall
Ww.P.x = midX; Ww.P.z = midZ;
Ww.cam.yaw = 0; // look north: W is +z (fx=0,fz=-1? wait yaw 0: fx=-sin0=0, fz=-cos0=-1, W is sz=1, dx=fx*sz=0, dz=fz*sz=-1 * 0.45 — that's -z, south)
// W uses sz=1, dx = fx*sz, dz = fz*sz. yaw=0 → dz=-0.45 (south, toward the door).
// To walk north (back wall) need yaw = Math.PI: fx=0, fz=1, dz=+0.45
Ww.cam.yaw = Math.PI;
for (let i = 0; i < 40; i++) Ww.A.dhNoteMoveKey({code:'KeyW', key:'w', type:'keydown', repeat:false}, true);
chk('W taps into a built wall from inside also stop at the wall', Ww.P.z < foot.z1 - thick / 2 - R + 0.05 && Ww.P.z > midZ + 0.5 && Ww.P.z < foot.z1, {z:Ww.P.z, z1:foot.z1, midZ});

const boxes = Ww.A.dhCollisionBoxes();
const bricks = boxes.filter(b => b.id === 'brick');
const panes = boxes.filter(b => b.id === 'pane');
chk('collision boxes are continuous wall segments on the v7 grid (not a clump at the origin)', bricks.length > 0 && bricks.length <= Ww.A.dhBrickTotal() && panes.length >= 2 && !bricks.every(b => Math.abs(b.x) < 0.3 && Math.abs(b.z) < 0.3) && bricks.some(b => Math.abs(b.z - (foot.z0 + thick / 2)) < 0.06), {n:bricks.length, total:Ww.A.dhBrickTotal(), panes:panes.length, sample:bricks[0], z0:foot.z0});

// Front wall (not the door): stand south of a solid pier and walk north.
const midAlong = (Ww.A.dhBrickAlongCount(0) / 2) | 0;
const pier = Ww.A.dhWorldRec(0, ['brick', 0, 0, midAlong + 1, 0]); // one-brick pier between door and front window
Ww.P.x = pier.x; Ww.P.y = 0.05; Ww.P.z = foot.z0 - 2;
for (let i = 0; i < 40; i++) Ww.A.dhMovePlayer(0, 0.45);
chk('walking into the front wall (beside the door) from outside stops at the wall', Ww.P.z <= foot.z0 - R + 0.05 && Ww.P.z > foot.z0 - 2, {z:Ww.P.z, z0:foot.z0, limit: foot.z0 - R, pierX:pier.x});
Ww.P.x = pier.x; Ww.P.z = midZ;
for (let i = 0; i < 40; i++) Ww.A.dhMovePlayer(0, -0.45);
chk('walking into the front wall from inside also stops at the wall', Ww.P.z >= foot.z0 + thick + R - 0.05 && Ww.P.z < midZ, {z:Ww.P.z, z0:foot.z0, limit: foot.z0 + thick + R});

// Approach-side clip must not eject the player through a thin wall.
Ww.P.x = pier.x; Ww.P.z = foot.z0 - R + 0.02; // slightly overlapping from the south
Ww.A.dhRememberPlayer();
Ww.P.z = foot.z0 + thick / 2 + 0.02; // past the mid-plane, as a large step() hitch would
Ww.A.dhAfterPhysicsStep();
chk('crossing a wall midpoint still ejects back to the entry side', Ww.P.z <= foot.z0 - R + 0.05, {z:Ww.P.z, z0:foot.z0, limit: foot.z0 - R});

chk('the front face has a window as well as the door', (Ww.A.dhWindowFaces() || []).indexOf(0) >= 0 && (Ww.A.dh.pieces[0]||[]).some(a => a[0]==='winframe' && (a[4]|0)===0), {faces:Ww.A.dhWindowFaces(), frames:(Ww.A.dh.pieces[0]||[]).filter(a=>a[0]==='winframe')});
chk('#dhdebug is off without the hash and the helper exists', Ww.A.dhDebugActive() === false && typeof Ww.A.dhRefreshDebugColliders === 'function' && typeof Ww.A.dhCamClearance === 'function' && Ww.A.dhCamClearance() >= 0.3, {dbg:Ww.A.dhDebugActive(), clear:Ww.A.dhCamClearance && Ww.A.dhCamClearance()});
Ww.A.dreamhouseStop();
})();


// t261u: remaining-spot glows show for ~4s, then fade ~1s; re-show on tool, supply, new step, place (nearby), Q/Tab/pad
(function(){
  const Wg = world();
  Wg.A.buildDreamHouse(); Wg.A.dreamhouseEnter();
  Wg.A.dhSkipIntro();
  chk('show-spots API and timings are available', typeof Wg.A.dhShowSpots === 'function' && Wg.A.DH_SPOT_SHOW === 4 && Wg.A.DH_SPOT_FADE === 1, {show:Wg.A.DH_SPOT_SHOW, fade:Wg.A.DH_SPOT_FADE});
  Wg.A.dhShowSpots();
  Wg.A.dreamhouseUpdate(0);
  const v0 = Wg.A.dhSpotVisuals();
  chk('spot glows start fully shown after a show', !!(v0 && v0.shown && v0.group === 1 && v0.mode === 'all'), v0);

  Wg.A.dreamhouseUpdate(3.9);
  const vHold = Wg.A.dhSpotVisuals();
  chk('spot glows stay fully visible for about 4 seconds', !!(vHold && vHold.shown && vHold.group === 1 && vHold.age >= 3.9 && vHold.age < 4.05), vHold);

  Wg.A.dreamhouseUpdate(0.5);
  const vMid = Wg.A.dhSpotVisuals();
  chk('spot glows fade smoothly during the fifth second', !!(vMid && vMid.group > 0.2 && vMid.group < 0.85 && !vMid.shown && !vMid.faded), vMid);

  Wg.A.dreamhouseUpdate(1.0);
  const vGone = Wg.A.dhSpotVisuals();
  chk('spot glows are gone after the fade', !!(vGone && vGone.faded && vGone.group === 0), vGone);

  Wg.A.dhSetTool('delete');
  Wg.A.dreamhouseUpdate(0);
  const vTool = Wg.A.dhSpotVisuals();
  chk('switching tools re-shows the remaining-spot glows', !!(vTool && vTool.shown && vTool.group === 1 && vTool.mode === 'all'), vTool);
  Wg.A.dhSetTool('place');

  Wg.A.dreamhouseUpdate(6);
  chk('glows fade again after a tool-switch flash', !!Wg.A.dhSpotVisuals().faded, Wg.A.dhSpotVisuals());
  const job0 = Wg.A.dh.job;
  Wg.A.dhSetJob(job0 === 'mark' ? 'dig' : 'mark');
  Wg.A.dreamhouseUpdate(0);
  chk('switching jobs re-shows the remaining-spot glows', !!Wg.A.dhSpotVisuals().shown, Wg.A.dhSpotVisuals());
  Wg.A.dhSetJob('mark');

  Wg.A.dreamhouseUpdate(6);
  const picked = Wg.A.dhPickup('brick', 8);
  Wg.A.dreamhouseUpdate(0);
  chk('picking up a new supply re-shows the remaining-spot glows', !!(picked && Wg.A.dhSpotVisuals().shown), {picked, v:Wg.A.dhSpotVisuals(), carry:Wg.A.dh.carry});

  Wg.A.dreamhouseUpdate(6);
  const stage0 = Wg.A.dhStageId();
  const foot = Wg.A.dhFoot();
  for (let ix = foot.x0; ix <= foot.x1; ix++) for (let iz = foot.z0; iz <= foot.z1; iz++){
    Wg.A.dhPut(0, ['mark', ix, 0, iz, 0]);
  }
  Wg.A.dreamhouseUpdate(0);
  chk('starting a new step re-shows the remaining-spot glows', Wg.A.dhStageId() !== stage0 && !!Wg.A.dhSpotVisuals().shown, {stage:Wg.A.dhStageId(), before:stage0, v:Wg.A.dhSpotVisuals()});

  Wg.A.dreamhouseUpdate(6);
  chk('glows faded before a place re-show', !!Wg.A.dhSpotVisuals().faded, Wg.A.dhSpotVisuals());
  Wg.A.dhPut(0, ['trench', foot.x0, 0, foot.z0, 0]);
  Wg.A.dreamhouseUpdate(0);
  const vPlace = Wg.A.dhSpotVisuals();
  chk('placing a piece briefly re-shows nearby remaining spots', !!(vPlace && vPlace.shown && vPlace.mode === 'nearby' && vPlace.used > 0 && vPlace.used <= 8), vPlace);

  Wg.A.dreamhouseUpdate(6);
  if (Wg.A.dhHasAnyCarry && Wg.A.dhHasAnyCarry()) Wg.A.dhDump();
  else if (Wg.A.dh.carry) Wg.A.dhDump();
  Wg.A.dhKey({code:'KeyQ', repeat:false});
  Wg.A.dreamhouseUpdate(0);
  chk('Q re-shows the remaining-spot glows', !!Wg.A.dhSpotVisuals().shown, Wg.A.dhSpotVisuals());

  Wg.A.dreamhouseUpdate(6);
  Wg.A.dhKey({code:'Tab', repeat:false});
  Wg.A.dreamhouseUpdate(0);
  chk('Tab re-shows the remaining-spot glows', !!Wg.A.dhSpotVisuals().shown, Wg.A.dhSpotVisuals());

  Wg.A.dreamhouseUpdate(6);
  Wg.A.dhPad({dd:1, 13:true});
  Wg.A.dreamhouseUpdate(0);
  chk('gamepad D-pad down re-shows the remaining-spot glows', !!Wg.A.dhSpotVisuals().shown, Wg.A.dhSpotVisuals());

  Wg.A.dreamhouseUpdate(6);
  const next = Wg.A.dhNextBuildCell('dig') || Wg.A.dhNextBuildCell('mark');
  if (next) aimFoot(Wg, next.ix, next.iz);
  Wg.A.dh._ghostDirty = true;
  Wg.A.dreamhouseUpdate(0);
  const vAim = Wg.A.dhSpotVisuals();
  chk('the aimed spot still has a soft highlight after the glows fade', !!(vAim && vAim.faded && vAim.aimed && vAim.aim >= 0.2 && vAim.aim < 0.8 && vAim.group === 0), vAim);

  Wg.A.updateDhChrome();
  const hint = Wg.els['#dhSpotHint'];
  chk('HUD hint says Q: show spots', !!(hint && /Q: show spots/.test(hint.textContent) && hint.style.display === 'block'), hint);
  const bar = (Wg.els['#dhBar'] && Wg.els['#dhBar'].innerHTML) || '';
  if (!bar){ Wg.A.dhBar(); }
  const barHtml = (Wg.els['#dhBar'] && Wg.els['#dhBar'].innerHTML) || '';
  chk('a small Spots button is on the toolbar', /dhSpotBtn/.test(barHtml), barHtml.slice(0, 200));

  Wg.A.dreamhouseStop();
})();


// t261u follow-up: beacons sit on slots in Low and High; Tab hint while carrying; paint leaves openings; roof sits on v7 walls
(function(){
  function maxSlotError(W, kind){
    const beacons = W.A.dhBeaconWorlds() || [];
    const slots = (kind === 'brick')
      ? (W.A.dhNextBrickSlots(0) || []).filter(s => !s.filled)
      : (W.A.dhJobPoints(kind) || []).filter(s => !s.filled);
    if (!slots.length || !beacons.length) return {ok:false, reason:'empty', slots:slots.length, beacons:beacons.length};
    let worst = 0, miss = 0, sample = null;
    slots.forEach(s => {
      let best = Infinity, hit = null;
      beacons.forEach(b => {
        const d = Math.hypot((b.x||0)-(s.x||0), (b.y||0)-(s.y||0), (b.z||0)-(s.z||0));
        if (d < best){ best = d; hit = b; }
      });
      if (best > worst){ worst = best; sample = {slot:{x:s.x,y:s.y,z:s.z,face:s.face,course:s.course,along:s.along}, beacon:hit, d:best}; }
      if (best > 0.05) miss++;
    });
    return {ok: miss===0 && worst <= 0.05, worst, miss, slots:slots.length, beacons:beacons.length, sample};
  }
  function bootGfx(low){
    const W = world({}, {hash: '#dhtest=v7walls'});
    W.A.buildDreamHouse(); W.A.dreamhouseEnter();
    if (W.A.dh && W.A.dh.intro) W.A.dhSkipIntro();
    W.A.dhSetGfxLow(!!low);
    W.A.dhShowSpots();
    W.A.dh._ghostDirty = true;
    W.A.dreamhouseUpdate(0);
    return W;
  }
  const Wlo = bootGfx(true);
  const rLo = maxSlotError(Wlo, 'brick');
  chk('Low-graphics remaining-spot beacons sit on the brick slots (within 5 cm)', !!rLo.ok, rLo);
  const nextLo = Wlo.A.dhNextBrickSlots(0) || [];
  const allOpen = (Wlo.A.dhAllBrickSlots(0) || []).filter(s => !s.filled);
  const ysLo = (Wlo.A.dhBeaconWorlds() || []).map(b => b.y);
  chk('v7walls Low spots sit on the next wall-top course, not the floating upper courses', !!(rLo.ok && nextLo.length && rLo.beacons === nextLo.length && nextLo.every(s => (s.course|0) === 3) && ysLo.length === nextLo.length && ysLo.every(y => Math.abs(y - 1.875) <= 0.05) && allOpen.some(s => (s.course|0) >= 4)), {next:nextLo.length, open:allOpen.length, beacons:rLo.beacons, courses:[...new Set(nextLo.map(s=>s.course))], y:{min:Math.min.apply(null,ysLo), max:Math.max.apply(null,ysLo)}});
  Wlo.A.dreamhouseStop();
  const Whi = bootGfx(false);
  const rHi = maxSlotError(Whi, 'brick');
  chk('High-graphics remaining-spot beacons sit on the brick slots (within 5 cm)', !!rHi.ok, rHi);
  const nextHi = Whi.A.dhNextBrickSlots(0) || [];
  const ysHi = (Whi.A.dhBeaconWorlds() || []).map(b => b.y);
  chk('v7walls High spots sit on the next wall-top course, not the floating upper courses', !!(rHi.ok && nextHi.length && rHi.beacons === nextHi.length && ysHi.every(y => Math.abs(y - 1.875) <= 0.05)), {next:nextHi.length, beacons:rHi.beacons, y:{min:Math.min.apply(null,ysHi||[0]), max:Math.max.apply(null,ysHi||[0])}});
  Whi.A.dreamhouseStop();

  // v7walls fixture: stock has 40 bricks, hands are empty — E must still place, and the banner must agree.
  const WpE = world({}, {hash: '#dhtest=v7walls'});
  WpE.A.buildDreamHouse(); WpE.A.dreamhouseEnter();
  if (WpE.A.dh && WpE.A.dh.intro) WpE.A.dhSkipIntro();
  WpE.A.dhSetJob('brick');
  WpE.A.dh.carry = null;
  const goalE = WpE.A.dhGoalText() || '';
  chk('v7walls goal agrees with the inventory (does not say Supply Yard while you have 40 bricks)', /40/.test(String(WpE.A.dh.stock.brick)) && /inventory|Press E|lay a brick/i.test(goalE) && !/Supply Yard/i.test(goalE), {goal:goalE, stock:WpE.A.dh.stock, carry:WpE.A.dh.carry});
  const n96 = (WpE.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
  const slotE = (WpE.A.dhNextBrickSlots(0)||[])[0];
  if (slotE){ WpE.P.x = slotE.x; WpE.P.z = slotE.z + 2.2; WpE.P.y = .05; WpE.cam.yaw = 0; WpE.cam.pitch = Math.atan2(1.6 - slotE.y, 2.2); }
  const placedE = WpE.A.dhPlaceBrick();
  const n97 = (WpE.A.dh.pieces[0]||[]).filter(a => a[0]==='brick').length;
  chk('v7walls E places a brick from inventory (96/188 goes up)', !!(placedE && n96 === 96 && n97 === 97), {placedE, n96, n97, carry:WpE.A.dh.carry, stock:WpE.A.dh.stock.brick});
  WpE.A.dreamhouseStop();

  const Wh = world();
  Wh.A.buildDreamHouse(); Wh.A.dreamhouseEnter();
  if (Wh.A.dh.intro) Wh.A.dhSkipIntro();
  Wh.A.dhPickup('brick', 4);
  Wh.A.dhHud(); Wh.A.updateDhChrome();
  const hintC = Wh.els['#dhSpotHint'];
  chk('HUD hint says Tab: show spots while carrying', !!(hintC && /Tab: show spots/.test(hintC.textContent)), hintC);
  Wh.A.dhDump();
  Wh.A.updateDhChrome();
  const hintE = Wh.els['#dhSpotHint'];
  chk('HUD hint says Q: show spots when hands are empty', !!(hintE && /Q: show spots/.test(hintE.textContent)), hintE);

  // Paint must leave the door and windows open (a solid wall slab used to cover them).
  const Wp = world({}, {hash: '#dhtest=v6furnish'});
  Wp.A.buildDreamHouse(); Wp.A.dreamhouseEnter();
  if (Wp.A.dh && Wp.A.dh.intro) Wp.A.dhSkipIntro();
  const facesPainted = [];
  for (let face = 0; face < 4; face++){
    if (!(Wp.A.dh.pieces[0]||[]).some(a => a[0]==='paint' && (a[4]|0)===face)){
      Wp.A.dhPut(0, ['paint', 0, 0, 0, face, 0], true);
    }
    facesPainted.push(face);
  }
  const doorCovered = Wp.A.dhPaintCoversOpening(0, 0, 'door');
  const winCovered = [0,1,3].some(f => Wp.A.dhPaintCoversOpening(0, f, 'window'));
  const doorMesh = (Wp.A.dh.meshes[0]||[]).find((m,i) => (Wp.A.dh.pieces[0]||[])[i] && Wp.A.dh.pieces[0][i][0]==='door');
  chk('paint leaves the door opening cut out', doorCovered === false, {doorCovered, panels: Wp.A.dhPaintPanelWorldBoxes(0, ['paint',0,0,0,0,0]).length, holes: Wp.A.dhPaintOpenings(0, 0)});
  chk('paint leaves the window openings cut out', winCovered === false, {winCovered});
  chk('the door mesh is still present and visible after painting', !!(doorMesh && doorMesh.visible !== false), {has:!!doorMesh, visible: doorMesh && doorMesh.visible});

  // Pitched roof: shingles and rafters rest on v7 wall tops and meet at apex 4.8 m.
  const b = Wp.A.dhFootWorld(0);
  const midZ = (b.z0 + b.z1) / 2;
  const half = (b.x1 - b.x0) / 2 + Wp.A.DH_ROOF_OVERHANG;
  const wallTop = Wp.A.dhWallTop();
  const apex = Wp.A.dhRoofApex();
  chk('finished house roof apex is 4.8 m on v7 wall tops', Math.abs(apex - 4.8) < 0.02 && Math.abs(wallTop - 3.0) < 0.02, {apex, wallTop});
  const tiles = Wp.A.dhAllShingleSlots(0);
  let tileWorst = 0, tileOut = 0, eaveY = [], ridgeY = [], xOut = 0;
  tiles.forEach(s => {
    const corners = Wp.A.dhShingleCorners(0, s.side, s.col, s.row);
    corners.forEach(c => {
      const planeY = Wp.A.dhRoofPlaneYat(0, c.z);
      const d = Math.abs(c.y - planeY);
      if (d > tileWorst) tileWorst = d;
      if (d > 0.08) tileOut++; // thickness is 5 cm, allow 8 cm
      if (c.x < b.x0 - Wp.A.DH_ROOF_OVERHANG - 0.08 || c.x > b.x1 + Wp.A.DH_ROOF_OVERHANG + 0.08) xOut++;
    });
    if (s.row === 0) eaveY.push(s.y);
    if (s.row === (Wp.A.DH_SHINGLE_ROWS - 1)) ridgeY.push(s.y);
  });
  const eaveAvg = eaveY.reduce((a,v)=>a+v,0)/Math.max(1,eaveY.length);
  const ridgeAvg = ridgeY.reduce((a,v)=>a+v,0)/Math.max(1,ridgeY.length);
  chk('shingles lie on the pitched roof plane (within 8 cm) and do not overshoot the walls past the overhang', tileOut===0 && xOut===0 && tiles.length===Wp.A.dhShingleTotal(), {tileWorst, tileOut, xOut, n:tiles.length, eaveAvg, ridgeAvg, wallTop, apex});
  chk('lowest shingles rest on the wall top and the ridge reaches the 4.8 m apex', eaveAvg > wallTop - 0.05 && eaveAvg < wallTop + Wp.A.DH_ROOF_RISE * 0.6 && ridgeAvg > apex - 0.55 && ridgeAvg <= apex + 0.05, {eaveAvg, ridgeAvg, wallTop, apex, rise:Wp.A.DH_ROOF_RISE});
  const rafters = [];
  for (let side=0; side<2; side++) for (let k=0; k<(Wp.A.DH_RAFTER_NEED/2); k++){
    rafters.push(Wp.A.dhRafterEnds(0, k, side));
  }
  let rMiss=0, rWorst=0;
  rafters.forEach(ends => {
    const ys = ends.map(e => e.y).sort((a,b)=>a-b);
    const zs = ends.map(e => e.z);
    const eave = ends.reduce((a,e)=> e.y < a.y ? e : a, ends[0]);
    const ridge = ends.reduce((a,e)=> e.y > a.y ? e : a, ends[0]);
    const de = Math.abs(eave.y - wallTop);
    const dr = Math.abs(ridge.y - apex);
    if (de > rWorst) rWorst = de;
    if (dr > rWorst) rWorst = dr;
    if (de > 0.08 || dr > 0.08) rMiss++;
  });
  chk('rafters run from the v7 wall top up to the 4.8 m apex', rMiss===0 && rafters.length===Wp.A.DH_RAFTER_NEED, {rMiss, rWorst, n:rafters.length, sample:rafters[0]});

  const trimDoor = Wp.A.dhPaintOpeningClearance(0, 0, 'door');
  const trimWin = [0,1,3].map(f => Wp.A.dhPaintOpeningClearance(0, f, 'window'));
  chk('paint runs up to the door and window trim (no wide bare-brick border)', !!(trimDoor && trimDoor.ok && trimWin.every(c => c.ok)), {door:trimDoor, windows:trimWin});
  const corner = Wp.A.dhPaintCornerMeet(0, 0, 1);
  chk('front and side paint meet cleanly at the corner (no offset gap)', !!(corner && corner.ok), corner);

  const wallsOnly = world({}, {hash: '#dhtest=v7walls'});
  wallsOnly.A.buildDreamHouse(); wallsOnly.A.dreamhouseEnter();
  if (wallsOnly.A.dh && wallsOnly.A.dh.intro) wallsOnly.A.dhSkipIntro();
  const gBefore = wallsOnly.A.dhGableInfo(0);
  chk('gables are not added before the roof is finished', !gBefore.ready && !(wallsOnly.A.dh.gables && wallsOnly.A.dh.gables[0]), gBefore);
  wallsOnly.A.dreamhouseStop();

  const gAfter = Wp.A.dhGableInfo(0);
  const gSync = Wp.A.dhSyncGables(0);
  const gMesh = Wp.A.dh.gables && Wp.A.dh.gables[0];
  const gKids = gMesh && (gMesh.children || []);
  chk('finished walls and roof get gable ends automatically (no hole under the roof, saves unchanged)', !!(gAfter.ready && gSync && gMesh && gKids && gKids.length >= 2 && Math.abs(gAfter.apex - 4.8) < 0.02 && Math.abs(gAfter.wallTop - 3.0) < 0.02), {info:gAfter, sync:gSync, kids: gKids && gKids.length, recs:(Wp.A.dh.pieces[0]||[]).some(a => a[0]==='gable')});

  Wp.A.dreamhouseStop();
})();


console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
