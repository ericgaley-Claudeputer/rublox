// Non-GUI logic test for Tower of Doom (tests/p42/tower.js)
const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/../p42/tower.js', 'utf8');
function world(){
  const V = () => ({x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; }, setScalar(s){ this.x = this.y = this.z = s; }, multiplyScalar(){ return this; }, copy(){}});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {}, add(c){ this.children.push(c); }, remove(){}, querySelector: () => null});
  const store = {}, els = {};
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date,
    THREE: new Proxy({}, {get: (t, k) => function(){ return O(); }}), scene: {add(){}, remove(){}, background: null, fog: {color: V(), near: 0, far: 0}},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, classList: {add(){}, remove(){}}, querySelector: () => null}),
    coins: 0, runCoins: 0, running: true, paused: false, choosing: false, over: false, worldT: 0, mode: 'tower', banners: [],
    P: {x: 0, y: .05, z: -5.5, face: 0, vx: 0, vy: 0, vz: 0}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0},
    checkpoints: [], coinList: [], finish: null, topY: 0, maxY: 0, cam: {yaw: 0, pitch: 0, dist: 10}, tipTimer: 0, DEF: {},
    plat: () => ({mesh: O(), active: true}), coin(){}, confetti(){}, SND: {coin(){}, cp(){}, win(){}}, store, stop(){ ctx.stopped = true; },
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t), fmt: (t) => String(t), mp: {on: false}
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get td(){ return td; }, buildTower, towerEnter, towerUpdate, towerWin, towerLose, towerStop, tdProg, tdGooTop, TD_SECTIONS, TD_GOO_BASE, TD_GRACE};', ctx);
  return ctx;
}
const W = world(); W.A.buildTower(); W.A.towerEnter();
chk('builds with sections + goo mesh + spawn + rim', W.A.td && W.A.td.kind.length === W.A.TD_SECTIONS && !!W.A.td.gooMesh && W.checkpoints[0].spawn);
chk('goo starts well below the island', W.A.td.goo <= -6, W.A.td.goo);
chk('grace period active at start', W.A.td.grace === W.A.TD_GRACE);
const g0 = W.A.td.goo; W.A.towerUpdate(.5); chk('goo does not rise during grace', W.A.td.goo === g0 && W.A.td.grace < W.A.TD_GRACE, [W.A.td.goo, W.A.td.grace]);
W.A.td.grace = 0; W.A.towerUpdate(1); chk('goo rises after grace + mesh tracks top', W.A.td.goo > g0 && Math.abs(W.A.td.gooMesh.position.y - (W.A.td.goo - 1.2)) < 1e-6, [W.A.td.goo, W.A.td.gooMesh.position.y]);
// standing on island above goo must NOT kill
W.P.y = .05; W.A.td.goo = -2; W.A.towerUpdate(.1);
chk('feet above goo top → still alive', W.A.td.ph === 'play' && !W.over);
// feet below goo top → lose
W.A.td.goo = 1; W.P.y = .05; W.A.towerUpdate(.1);
chk('feet below goo top → lose', W.A.td.ph === 'lose' && W.over);
// win
const W2 = world(); W2.A.buildTower(); W2.A.towerEnter(); W2.A.td.grace = 0; W2.P.y = W2.finish.y; W2.P.x = 0; W2.P.z = -8; const c0 = W2.coins; W2.A.towerUpdate(.1);
chk('summit wins + pays', W2.A.td.ph === 'win' && W2.coins > c0);
W2.A.towerStop(); chk('stop clears td', W2.A.td == null);
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
