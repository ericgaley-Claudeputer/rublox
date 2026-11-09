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
    coins: 0, runCoins: 0, running: true, paused: false, choosing: false, worldT: 0, mode: 'stable', banners: [], nds: null,
    P: {x: -14, y: .05, z: 14, face: Math.PI, vx: 0, vy: 0, vz: 0}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0}, checkpoints: [], DEF: {},
    cam: {yaw: Math.PI, pitch: .34, dist: 14}, tipTimer: 0, mp: {on: false},
    plat: () => ({mesh: O(), active: true}), label: () => O(), shade: (c) => c,
    confetti(){}, SND: {coin(){}, cp(){}, win(){}}, store,
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t)
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get sb(){ return sb; }, buildStable, stableEnter, stableUpdate, sbAdopt, sbCare, sbMount, sbStartShow, sbEndShow, sbAct, sbProg, sbPose, SB_PONIES, SB_JUMPS, SB_DRAIN, SB_SHOW_T, SB_MOUNT_CD};', ctx);
  return ctx;
}
const W = world(); W.A.buildStable(); W.A.stableEnter();
chk('6 ponies + 5 pads', W.A.SB_PONIES.length === 6 && W.A.sb.stations.length === 5);
chk('pads sit forward of barn (z>=3)', W.A.sb.stations.every(s => s.z >= 3), W.A.sb.stations.map(s => [s.id, s.z]));
chk('left-to-right brush < feed < groom', (() => { const m = Object.fromEntries(W.A.sb.stations.map(s => [s.id, s.x])); return m.brush < m.feed && m.feed < m.groom; })());
chk('rails are visual-only (no plat solids on gates)', W.A.sb.gates.length === W.A.SB_JUMPS && W.A.sb.gates.every(g => g.rail && g.posts));
chk('adopt + visible mesh', W.A.sbAdopt('buttercup') && W.A.sb.mesh.visible);
W.A.sbCare('groom'); chk('groom raises mood', W.A.sb.pony.mood >= 88);
W.A.sbCare('feed');
chk('mount sets ridden + Mounted toast + sit pose', W.A.sbMount(true) && W.A.sb.ridden && W.A.sbPose() && /Mounted/.test(W.banners.slice(-1)[0] || ''), W.banners.slice(-2));
chk('mount cooldown blocks instant dismount', W.A.sbMount(false) === false && W.A.sb.ridden);
W.A.sb.mountCd = 0; chk('after cooldown can start show while mounted', W.A.sbStartShow() && W.A.sb.ph === 'show');
W.A.sb.gates[0]; W.P.x = W.A.sb.gates[0].x; W.P.z = W.A.sb.gates[0].z; W.P.y = 1; W.A.stableUpdate(.05);
chk('rail clear scores while mounted', W.A.sb.show.score === 1);
// pony stays under rider
W.P.x = 5; W.P.z = 5; W.A.stableUpdate(.05);
chk('mounted pony follows under player', Math.hypot(W.A.sb.mesh.position.x - 5, W.A.sb.mesh.position.z - 5) < .01);
W.A.sbEndShow();
const W2 = world(W.store); W2.A.buildStable(); W2.A.stableEnter();
chk('restored pony visible, not auto-mounted', W2.A.sb.pony.id === 'buttercup' && W2.A.sb.mesh.visible && !W2.A.sb.ridden);
W2.A.sbMount(true); W2.A.sb.mountCd = 0; W2.A.sbMount(false);
chk('dismount works after cooldown', !W2.A.sb.ridden);
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
