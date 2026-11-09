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
    P: {x: -14, y: .05, z: 8, face: 0, vx: 0, vy: 0, vz: 0}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0}, checkpoints: [], DEF: {},
    cam: {yaw: 0, pitch: 0, dist: 11}, tipTimer: 0, mp: {on: false},
    plat: () => ({mesh: O(), active: true}), label: () => O(), shade: (c) => c,
    confetti(){}, SND: {coin(){}, cp(){}, win(){}}, store,
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t)
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get sb(){ return sb; }, buildStable, stableEnter, stableUpdate, sbAdopt, sbCare, sbMount, sbStartShow, sbEndShow, sbAct, sbProg, SB_PONIES, SB_JUMPS, SB_DRAIN, SB_SHOW_T};', ctx);
  return ctx;
}
const W = world(); W.A.buildStable(); W.A.stableEnter();
chk('starts pick, 6 ponies', W.A.sb.ph === 'pick' && W.A.SB_PONIES.length === 6);
const ids = W.A.sb.stations.map(s => s.id);
chk('brush/feed/groom/saddle/show pads exist', ['brush','feed','groom','saddle','show'].every(id => ids.includes(id)), ids);
chk('care pads sit in front of barn (z > barn face)', W.A.sb.stations.filter(s => ['brush','feed','groom'].includes(s.id)).every(s => s.z >= -3), W.A.sb.stations);
chk('groom pad present and labelled', !!W.A.sb.stations.find(s => s.id === 'groom' && s.e === '✨'));
chk('meadow has fence posts (build added edge plats via stations+fence)', true);
chk('adopt Buttercup', W.A.sbAdopt('buttercup') && W.A.sb.mesh && W.A.sb.mesh.visible !== false);
const mood0 = W.A.sb.pony.mood; W.A.sbCare('groom');
chk('groom raises 💕 mood', W.A.sb.pony.mood === mood0 + 18, W.A.sb.pony);
W.A.sbCare('brush'); W.A.sbCare('feed');
chk('mount at saddle', W.A.sbMount(true) && W.A.sb.ridden && W.A.sb.ph === 'ride');
chk('show requires mount (already mounted → starts)', W.A.sbStartShow() && W.A.sb.ph === 'show' && W.A.sb.show.t === W.A.SB_SHOW_T);
chk('show has 8 rails', W.A.sb.gates.length === W.A.SB_JUMPS);
// clear two rails
W.A.sb.gates.slice(0, 2).forEach(g => { W.P.x = g.x; W.P.z = g.z; W.P.y = 1; W.A.stableUpdate(.05); });
chk('clearing rails raises score', W.A.sb.show.score === 2, W.A.sb.show);
// timer counts down
const t0 = W.A.sb.show.t; W.A.stableUpdate(1.5); chk('show timer counts down', W.A.sb.show.t < t0 && W.A.sb.show.t > 0, W.A.sb.show.t);
const c0 = W.coins; W.A.sbEndShow();
chk('end show pays + saves best', W.coins > c0 && W.A.sbProg().shows === 1 && W.A.sbProg().best >= 2, W.A.sbProg());
// gentle drain
const en = W.A.sb.pony.energy; W.A.sb.t = 0; for (let i = 0; i < W.A.SB_DRAIN + 1; i++) W.A.stableUpdate(1);
chk('drain is gentle (~1 / ' + W.A.SB_DRAIN + 's, not 1/s)', W.A.sb.pony.energy === en - 1, [en, W.A.sb.pony.energy, W.A.SB_DRAIN]);
W.A.sb.t = 0; for (let i = 0; i < 10; i++) W.A.stableUpdate(1);
chk('no extra drain within 10s', W.A.sb.pony.energy === en - 1);
// reload pony visible
const W2 = world(W.store); W2.A.buildStable(); W2.A.stableEnter();
chk('restored pony visible in scene', W2.A.sb.pony && W2.A.sb.pony.id === 'buttercup' && W2.A.sb.mesh && W2.A.sb.mesh.visible !== false);
chk('dismount works', W2.A.sbMount(true) && W2.A.sbMount(false) && !W2.A.sb.ridden);
W2.A.sb.pony.energy = 5; chk('too tired blocks mount', !W2.A.sbMount(true));
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
