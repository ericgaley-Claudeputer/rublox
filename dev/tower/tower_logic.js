// Non-GUI logic test for Tower of Doom (tests/p42/tower.js)
const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/../p42/tower.js', 'utf8');
function world(){
  const V = () => ({x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; }, setScalar(s){ this.x = this.y = this.z = s; }, multiplyScalar(){ return this; }, copy(){}});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {}, add(c){ this.children.push(c); }, remove(){}});
  const store = {}, els = {};
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date,
    THREE: new Proxy({}, {get: (t, k) => function(){ return O(); }}), scene: {add(){}, remove(){}, background: null, fog: {color: V(), near: 0, far: 0}},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, classList: {add(){}, remove(){}}}),
    coins: 0, runCoins: 0, running: true, paused: false, choosing: false, over: false, worldT: 0, mode: 'tower', banners: [],
    P: {x: 0, y: .05, z: -5.5, face: 0, vx: 0, vy: 0, vz: 0}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0},
    checkpoints: [], coinList: [], finish: null, topY: 0, maxY: 0, cam: {yaw: 0, pitch: 0, dist: 10}, tipTimer: 0, DEF: {},
    plat: () => ({mesh: O(), active: true}), coin(){}, confetti(){}, SND: {coin(){}, cp(){}, win(){}}, store,
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t), fmt: (t) => String(t), mp: {on: false}
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get td(){ return td; }, buildTower, towerEnter, towerUpdate, towerWin, towerLose, towerStop, tdProg, TD_SECTIONS, TD_GOO_BASE};', ctx);
  return ctx;
}
const W = world(); W.A.buildTower(); W.A.towerEnter();
chk('builds with sections + goo mesh + spawn checkpoint', W.A.td && W.A.td.kind.length === W.A.TD_SECTIONS && !!W.A.td.gooMesh && W.checkpoints.length >= 1, W.A.td && W.A.td.kind);
chk('enter starts play phase', W.A.td.ph === 'play' && W.over === false);
const g0 = W.A.td.goo; W.A.towerUpdate(.5); chk('goo rises over time', W.A.td.goo > g0, [g0, W.A.td.goo]);
W.P.y = 20; W.A.towerUpdate(.1); chk('maxY tracks climb', W.maxY >= 20, W.maxY);
// win at summit
W.P.y = W.finish.y; W.P.x = 0; W.P.z = -8; const c0 = W.coins; W.A.towerUpdate(.1);
chk('reaching finish wins + pays coins', W.A.td.ph === 'win' && W.A.td.paid && W.coins > c0, [W.A.td.ph, W.coins - c0]);
chk('progress saved wins/best', W.A.tdProg().wins === 1 && W.A.tdProg().best > 0, W.A.tdProg());
// lose to goo
const L = world(); L.A.buildTower(); L.A.towerEnter(); L.A.td.goo = 5; L.P.y = 1; L.A.towerUpdate(.1);
chk('goo catch triggers lose', L.A.td.ph === 'lose' && L.over === true);
L.A.towerStop(); chk('stop clears td', L.A.td == null);
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
