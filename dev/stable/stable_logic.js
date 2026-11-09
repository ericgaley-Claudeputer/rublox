// Non-GUI logic test for Clover Meadow Stables (tests/p44/stable.js)
const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/../p44/stable.js', 'utf8');
function world(store0){
  const V = () => ({x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; return this; }, setScalar(){ return this; }, multiplyScalar(){ return this; }, copy(){ return this; }});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {}, add(c){ this.children.push(c); }, remove(){}});
  const store = Object.assign({}, store0 || {}), els = {};
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date,
    document: {createElement: t => { const e = {className: '', innerHTML: '', onclick: null, appendChild(c){ (this._c = this._c || []).push(c); }}; return e; }},
    THREE: new Proxy({}, {get: () => function(){ return O(); }}), scene: {add(){}, remove(){}, background: null},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, classList: {add(){}, remove(){}}, appendChild(){}, querySelectorAll: () => []}),
    coins: 0, runCoins: 0, running: true, paused: false, choosing: false, worldT: 0, mode: 'stable', banners: [],
    P: {x: -14, y: .05, z: 2, face: 0, vx: 0, vy: 0, vz: 0}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0}, checkpoints: [], DEF: {},
    cam: {yaw: 0, pitch: 0, dist: 11}, tipTimer: 0, mp: {on: false},
    plat: () => ({mesh: O(), active: true}), label: () => O(), shade: (c) => c,
    confetti(){}, SND: {coin(){}, cp(){}, win(){}}, store,
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t)
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get sb(){ return sb; }, buildStable, stableEnter, stableUpdate, sbAdopt, sbCare, sbMount, sbStartShow, sbEndShow, sbAct, sbProg, SB_PONIES, SB_JUMPS};', ctx);
  return ctx;
}
const W = world(); W.A.buildStable(); W.A.stableEnter();
chk('starts in pick phase with no pony', W.A.sb.ph === 'pick' && !W.A.sb.pony);
chk('6 original ponies available', W.A.SB_PONIES.length === 6 && W.A.SB_PONIES.every(p => p.id && p.name && p.coat));
chk('adopt Buttercup', W.A.sbAdopt('buttercup') && W.A.sb.pony.id === 'buttercup' && W.A.sb.ph === 'care');
chk('pony persisted', W.A.sbProg().pony && W.A.sbProg().pony.id === 'buttercup', W.A.sbProg());
const sh0 = W.A.sb.pony.shine; W.A.sbCare('brush'); chk('brush raises shine', W.A.sb.pony.shine === sh0 + 18);
const en0 = W.A.sb.pony.energy; W.A.sbCare('feed'); chk('feed raises energy', W.A.sb.pony.energy === en0 + 18);
W.A.sbCare('groom'); chk('groom raises mood', W.A.sb.pony.mood >= 70);
chk('mount works when energy ok', W.A.sbMount(true) && W.A.sb.ridden && W.A.sb.ph === 'ride');
chk('start jumping show', W.A.sbStartShow() && W.A.sb.ph === 'show' && W.A.sb.show.t === 90);
// clear a gate by standing on it with height
const g0 = W.A.sb.gates[0]; W.P.x = g0.x; W.P.z = g0.z; W.P.y = 1.0; W.A.stableUpdate(.1);
chk('clearing a rail scores', W.A.sb.show.score === 1 && g0.cleared, W.A.sb.show);
const c0 = W.coins; W.A.sbEndShow();
chk('show pays coins + saves best', W.coins > c0 && W.A.sbProg().shows === 1 && W.A.sbProg().best >= 1, W.A.sbProg());
// reload preserves pony
const W2 = world(W.store); W2.A.buildStable(); W2.A.stableEnter();
chk('saved pony restored on re-enter', W2.A.sb.pony && W2.A.sb.pony.id === 'buttercup' && W2.A.sb.ph === 'care');
chk('reject unknown pony id', !W2.A.sbAdopt('shadowfax'));
W2.A.sb.pony.energy = 5; chk('too tired to mount', !W2.A.sbMount(true) && W2.banners.some(b => /tired/.test(b)));
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
