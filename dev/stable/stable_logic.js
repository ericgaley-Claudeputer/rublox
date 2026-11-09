const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/stable.js', 'utf8');
function world(store0){
  const V = () => ({x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; return this; }, setScalar(){ return this; }, multiplyScalar(){ return this; }, copy(){ return this; }});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {}, userData: {}, parent: null, add(c){ this.children.push(c); if (c) c.parent = this; return c; }, remove(){}, copy(o){ if(o&&o.x!==undefined){ this.x=o.x; this.y=o.y; this.z=o.z; } return this; }, set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }});
  const store = Object.assign({}, store0 || {}), els = {};
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date, isFinite,
    document: {createElement: t => { const e = {className: '', innerHTML: '', onclick: null, dataset: {}, setAttribute(){}, addEventListener(){}, blur(){}, appendChild(c){ (this._c = this._c || []).push(c); }}; return e; }},
    THREE: new Proxy({}, {get: (_, name) => function(...args){
      const o = O();
      if (name === 'Vector3'){ o.x = args[0]||0; o.y = args[1]||0; o.z = args[2]||0; o.set = function(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }; }
      if (name === 'CatmullRomCurve3'){ o.points = args[0]||[]; o.getPoint = function(t){ const pts=this.points; if(!pts.length) return {x:0,y:0,z:0}; const i=Math.min(pts.length-1, Math.floor(t*(pts.length-1))); return pts[i]; }; }
      return o;
    }}), scene: {add(){}, remove(){}, background: null},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, dataset: {}, classList: {add(){}, remove(){}}, appendChild(){}, querySelectorAll: () => [], setAttribute(){}, addEventListener(){}, blur(){}, onclick: null}),
    coins: 0, runCoins: 0, running: true, paused: false, choosing: false, worldT: 0, mode: 'stable', banners: [], nds: null,
    P: {x: -14, y: .05, z: 14, face: Math.PI, vx: 0, vy: 0, vz: 0, onGround: true}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0}, checkpoints: [], DEF: {},
    cam: {yaw: Math.PI, pitch: .34, dist: 14}, tipTimer: 0, mp: {on: false},
    plat: () => ({mesh: O(), active: true}), label: () => O(), shade: (c) => c,
    confetti(){}, SND: {coin(){}, cp(){}, win(){}, jump(){}}, store,
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t)
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get sb(){ return sb; }, buildStable, stableEnter, stableUpdate, sbAdopt, sbCare, sbMount, sbStartShow, sbEndShow, sbAct, sbProg, sbPose, sbSyncRider, sbPrompt, sbAnimPony, sbKey, sbSeat, sbNeckAttached, SB_PONIES, SB_JUMPS, SB_DRAIN, SB_SHOW_T, SB_MOUNT_CD, SB_HIP, SB_SIT};', ctx);
  return ctx;
}
const W = world(); W.A.buildStable(); W.A.stableEnter();
chk('6 ponies + 5 pads', W.A.SB_PONIES.length === 6 && W.A.sb.stations.length === 5);
chk('pads sit forward of barn (z>=2)', W.A.sb.stations.filter(s=>['brush','feed','groom'].includes(s.id)).every(s => s.z >= 2));
chk('camera faces barn (yaw 0)', W.cam.yaw === 0);
chk('fences marked camSkip', W.A.sb.fences && W.A.sb.fences.every(f => f.camSkip));
chk('left-to-right brush < feed < groom', (() => { const m = Object.fromEntries(W.A.sb.stations.map(s => [s.id, s.x])); return m.brush < m.feed && m.feed < m.groom; })());
chk('rails are visual-only (no plat solids on gates)', W.A.sb.gates.length === W.A.SB_JUMPS && W.A.sb.gates.every(g => g.rail && g.posts));
chk('adopt + visible mesh', W.A.sbAdopt('buttercup') && W.A.sb.mesh.visible);
chk('pony has cartoon parts (legs/head/tail/saddle/neck/mane)', (() => { const p = W.A.sb.mesh.userData.parts; return p && p.legs && p.legs.length === 4 && p.head && p.tail && p.saddle && p.bridle && p.neck && p.saddleTop > 1.4 && p.maneTufts && p.maneTufts.length >= 6; })());
chk('neck is slim (~head-back width, not head-wide wedge)', (() => { const src = SRC; return /TubeGeometry\(curve, 20, \.20/.test(src) && /SphereGeometry\(\.26/.test(src) && /SphereGeometry\(\.18/.test(src); })());
chk('neck is short (not llama-tall)', W.A.sb.mesh.userData.parts.neckTop.y < 2.15 && W.A.sb.mesh.userData.parts.neckTop.y - W.A.sb.mesh.userData.parts.neckBase.y < .7, W.A.sb.mesh.userData.parts.neckTop);
W.A.sbCare('groom'); chk('groom raises mood', W.A.sb.pony.mood >= 88);
W.A.sbCare('feed');
chk('mount sets ridden + Mounted toast + sit pose', W.A.sbMount(true) && W.A.sb.ridden && W.A.sbPose() && /Mounted/.test(W.banners.slice(-1)[0] || ''), W.banners.slice(-2));
chk('straddle pose opens hips + bent knees', (() => { const p = W.A.sbPose(); return p.lLo > .7 && p.lRo > .7 && p.lL < -.3 && p.lL > -.7; })(), W.A.sbPose());
chk('mounted seat from saddle top (hips on seat, not floating)', (() => { const s = W.A.sbSeat(); return Math.abs(W.P.y - s.foot) < .05 && Math.abs(s.top - (W.P.y + W.A.SB_HIP)) < .12; })(), W.A.sbSeat());
chk('mounted centred on pony', Math.hypot(W.A.sb.mesh.position.x - W.P.x, W.A.sb.mesh.position.z - W.P.z) < .01);
chk('straddle not forward-over-neck', (() => { const p = W.A.sbPose(); return p.lLo > .7 && p.lRo > .7 && p.lL > -0.7 && p.y <= 0; })(), W.A.sbPose());
chk('neck attached at rest (base⊂body, tip⊂head, head on neck)', W.A.sbNeckAttached(), W.A.sb.mesh.userData.parts.neckBase);
// across trot animation frames, attachment holds and head stays on neck
let attachOk = true; W.P.vx = 3; W.P.vz = 0; W.P.onGround = true;
for (let i = 0; i < 12; i++){ W.A.stableUpdate(.05); if (!W.A.sbNeckAttached()){ attachOk = false; break; } }
chk('neck stays attached across trot animation frames', attachOk && W.A.sb.mesh.userData.parts.head.parent === W.A.sb.mesh.userData.parts.neck);
W.P.vx = 0;
chk('rider yaw equals pony yaw while mounted', Math.abs(W.P.face - W.A.sb.mesh.rotation.y) < 1e-9, [W.P.face, W.A.sb.mesh.rotation.y]);
chk('saddle+bridle visible when mounted', W.A.sb.mesh.userData.parts.saddle.visible && W.A.sb.mesh.userData.parts.bridle.visible);
// prompt reflects mounted
W.A.sb.near = -1; W.A.sbPrompt();
chk('prompt reflects mounted state', /Dismount/.test(W.$('#sbAct').innerHTML) && W.$('#sbAct').dataset.state === 'dismount' && /E/.test(W.$('#sbAct').innerHTML), W.$('#sbAct').innerHTML);
// steer
W.P.vx = 2; W.P.vz = 1; W.A.stableUpdate(.05);
chk('rider yaw equals pony yaw after steering', Math.abs(W.P.face - W.A.sb.mesh.rotation.y) < 1e-9 && Math.abs(W.P.face - Math.atan2(2, 1)) < 1e-9);
chk('no sideways offset while riding', Math.hypot(W.A.sb.mesh.position.x - W.P.x, W.A.sb.mesh.position.z - W.P.z) < 1e-9);

// show clear: grounded seat below clear threshold; jump counts
W.P.vx = 0; W.P.vz = 0; W.P.vy = 0; W.P.onGround = true; W.P.y = W.A.sbSeat().foot; W.A.stableUpdate(.05);
W.A.sb.mountCd = 0; W.A.sbStartShow();
W.P.x = W.A.sb.gates[0].x; W.P.z = W.A.sb.gates[0].z; W.A.stableUpdate(.05);
chk('grounded mount does not clear rail', W.A.sb.show.score === 0, W.A.sb.show.score);
W.P.vy = 6; W.P.onGround = false; W.P.y = W.A.sbSeat().clear + .1; W.A.sb.mesh.position.y = .4; W.A.stableUpdate(.05);
chk('jump clears rail while mounted', W.A.sb.show.score === 1, W.A.sb.show.score);
W.A.sbEndShow(); W.A.sb.mountCd = W.A.SB_MOUNT_CD; // still mounted — re-arm cooldown for next checks
// jump while mounted — Space must NOT dismount; pony lifts
W.P.vy = 8; W.P.onGround = false; W.P.y = 2.8; const y0 = W.A.sb.mesh.position.y; W.A.stableUpdate(.05);
chk('jump while mounted keeps mounted and pony y increases', W.A.sb.ridden === true && W.A.sb.mesh.position.y > .5 && W.A.sb.mesh.position.y >= y0 - 0.01, [W.A.sb.ridden, W.A.sb.mesh.position.y, y0]);
chk('Space does not go through sbKey as dismount', W.A.sbKey({code: 'Space', repeat: false}) === false && W.A.sb.ridden);
W.P.vy = 0; W.P.onGround = true; W.P.y = W.A.sbSeat().foot; W.P.vx = 0; W.P.vz = 0;
chk('mount cooldown blocks instant dismount', W.A.sbMount(false) === false && W.A.sb.ridden);
W.A.sb.mountCd = 0; chk('after cooldown can start show while mounted', W.A.sbStartShow() && W.A.sb.ph === 'show');
W.P.x = W.A.sb.gates[0].x; W.P.z = W.A.sb.gates[0].z; W.P.vy = 5; W.P.onGround = false; W.P.y = W.A.sbSeat().clear + .15; W.A.sb.mesh.position.y = .35; W.P.vx = 0; W.P.vz = 1; W.A.stableUpdate(.05);
chk('rail clear scores while mounted', W.A.sb.show && W.A.sb.show.score === 1, W.A.sb.show && W.A.sb.show.score);
chk('show: rider yaw still equals pony yaw', Math.abs(W.P.face - W.A.sb.mesh.rotation.y) < 1e-9);
W.P.x = 5; W.P.z = 5; W.A.stableUpdate(.05);
chk('mounted pony follows under player', Math.hypot(W.A.sb.mesh.position.x - 5, W.A.sb.mesh.position.z - 5) < .01);
W.A.sbEndShow();
W.A.sb.mountCd = 0; W.A.sbMount(false); W.A.stableUpdate(.05);
chk('prompt reflects dismounted near saddle', (() => {
  W.A.sb.near = W.A.sb.stations.findIndex(s => s.id === 'saddle'); W.A.sbPrompt();
  const h = W.$('#sbAct').innerHTML; return /Mount/.test(h) && !/Dismount/.test(h) && W.$('#sbAct').dataset.state === 'saddle';
})(), W.$('#sbAct').innerHTML);
const W2 = world(W.store); W2.A.buildStable(); W2.A.stableEnter();
chk('restored pony visible, not auto-mounted', W2.A.sb.pony.id === 'buttercup' && W2.A.sb.mesh.visible && !W2.A.sb.ridden);
W2.A.sbMount(true); W2.A.sb.mountCd = 0; W2.A.sbMount(false);
chk('dismount works after cooldown', !W2.A.sb.ridden && Math.abs(W2.P.y - .05) < 1e-9);
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
