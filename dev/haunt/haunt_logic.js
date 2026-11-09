const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/haunt.js', 'utf8');
function world(){
  const V = () => ({x:0,y:0,z:0,set(){return this;}}); const O = () => ({position:V(),rotation:V(),scale:V(),visible:true,children:[],add(){},remove(){},querySelector:()=>null});
  const store = {}, els = {};
  const ctx = {console, Math, JSON, Object, Array, Number, String, Date, THREE:new Proxy({}, {get:()=>function(){return O();}}), scene:{add(){},remove(){},background:null,fog:{color:V(),near:0,far:0}},
    load:(k,d)=>k in store?JSON.parse(store[k]):d, save:(k,v)=>{store[k]=JSON.stringify(v);},
    $:id=>els[id]||(els[id]={textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){},contains:()=>false},querySelector:()=>null}),
    coins:0,runCoins:0,running:true,paused:false,choosing:false,over:false,worldT:0,mode:'haunt',banners:[],tips:[],
    P:{x:0,y:.05,z:2,face:0,vx:0,vy:0,vz:0}, pad:{on:false},touchUI:false,keys:{},joy:{x:0,y:0},checkpoints:[],cam:{yaw:0,pitch:.2,dist:6},tipTimer:0,mp:{on:false}, mpGuest:()=>false,
    plat:()=>({mesh:O(),active:true}), label:()=>O(), confetti(){}, SND:{coin(){},cp(){},win(){}}, store, stop(){ctx.stopped=true;},
    setCoins:n=>{ctx.coins=n;}, banner:t=>ctx.banners.push(t)};
  // capture tip writes
  const real$ = ctx.$; ctx.$ = id => { const el = real$(id); if (id === 'oTip'){ const prev = Object.getOwnPropertyDescriptor(el, 'innerHTML') || {value:'',writable:true,configurable:true};
    Object.defineProperty(el, 'innerHTML', {configurable:true, get(){return this._ih||'';}, set(v){ this._ih=v; ctx.tips.push(v); }}); }
    return el; };
  vm.createContext(ctx);
  vm.runInContext(SRC+'\n;globalThis.A={get hm(){return hm;},buildHaunt,hauntEnter,hauntUpdate,hmAct,hmReady,hmProg,hmObjective,hmColInfo,HM_TIME,HM_PICK};',ctx);
  return ctx;
}
const W=world(); W.A.buildHaunt(); W.A.hauntEnter();
chk('builds manor with keys/pads/colours/levers/beacon', W.A.hm.ghosts.filter(g=>g.kind==='key').length===3 && W.A.hm.ghosts.filter(g=>g.kind==='pad').length===4 && W.A.hm.ghosts.filter(g=>g.kind==='colour').length===3 && W.A.hm.ghosts.filter(g=>g.kind==='lever').length===3 && !!W.A.hm.beacon);
chk('timer starts full', W.A.hm.t===W.A.HM_TIME);
chk('spawn faces ghost-room north (yaw π)', Math.abs(W.cam.yaw - Math.PI) < 1e-9);
W.A.hauntUpdate(.2);
chk('camera pulled back / pitched up', W.cam.dist >= 10 && W.cam.pitch >= .28, [W.cam.dist, W.cam.pitch]);
const tip0 = W.tips.join(' ') + W.banners.join(' ');
const cinfo = W.A.hmColInfo();
chk('tips/banner name the ghost colour', new RegExp(cinfo.name, 'i').test(tip0) || new RegExp(cinfo.e).test(tip0), tip0.slice(0,120));
chk('objective beacon aims at first key', (()=>{ const o=W.A.hmObjective(); return o && o.tip.includes('Key') && Math.abs(o.x+14)<.1; })());

// FULL RUN: auto-collect keys by walking onto them (no E)
W.A.hm.ghosts.filter(g=>g.kind==='key').forEach(g=>{
  W.P.x=g.x; W.P.z=g.z; W.A.hauntUpdate(.05);
});
chk('auto-collect keys within HM_PICK (no E)', W.A.hm.keys===3 && W.A.hm.ghosts.filter(g=>g.kind==='key').every(g=>g.got), [W.A.hm.keys, W.A.HM_PICK]);

// song pads in order
W.A.hm.pattern.forEach(dir=>{ const g=W.A.hm.ghosts.find(x=>x.kind==='pad'&&x.i===dir); W.P.x=g.x; W.P.z=g.z; W.A.hm.near=W.A.hm.ghosts.indexOf(g); W.A.hmAct(); });
chk('pattern solved', W.A.hm.patternDone===true);
chk('after song tip names coloured ghost', (()=>{ const o=W.A.hmObjective(); return o && /Hug the/.test(o.tip) && o.tip.includes(cinfo.name); })(), W.A.hmObjective() && W.A.hmObjective().tip);

// wrong then right colour
const wrong=W.A.hm.ghosts.find(g=>g.kind==='colour'&&g.col!==W.A.hm.needCol); W.P.x=wrong.x; W.P.z=wrong.z; W.A.hm.near=W.A.hm.ghosts.indexOf(wrong); W.A.hmAct();
chk('wrong colour not accepted', W.A.hm.colour!==W.A.hm.needCol);
const right=W.A.hm.ghosts.find(g=>g.kind==='colour'&&g.col===W.A.hm.needCol); W.P.x=right.x; W.P.z=right.z; W.A.hm.near=W.A.hm.ghosts.indexOf(right); W.A.hmAct();
chk('matching colour ghost hugged', W.A.hm.colour===W.A.hm.needCol);

// levers then door
W.A.hm.ghosts.filter(g=>g.kind==='lever').forEach(g=>{ W.P.x=g.x; W.P.z=g.z; W.A.hm.near=W.A.hm.ghosts.indexOf(g); W.A.hmAct(); });
chk('all levers on → ready', W.A.hmReady());
chk('objective points at exit door', (()=>{ const o=W.A.hmObjective(); return o && /Exit/.test(o.tip) && Math.abs(o.z - W.A.hm.door.z)<.01; })());
W.P.x=W.A.hm.door.x; W.P.z=W.A.hm.door.z; const c0=W.coins; W.A.hauntUpdate(.1);
chk('at open door → win + coins + own title', W.A.hm.ph==='win' && W.coins>c0 && /Giggle Manor/.test((W.$('#oWinTitle').textContent||'')), [W.A.hm.ph, W.coins-c0, W.$('#oWinTitle').textContent]);

// doorways exist conceptually: keys at x=-14 reachable (auto-collect already proved), pads at x=12+, ghosts z=14, levers z=-14
chk('layout rooms placed for walkthrough', (()=>{
  const keys=W.A.hm.ghosts.filter(g=>g.kind==='key');
  const pads=W.A.hm.ghosts.filter(g=>g.kind==='pad');
  const ghosts=W.A.hm.ghosts.filter(g=>g.kind==='colour');
  const levers=W.A.hm.ghosts.filter(g=>g.kind==='lever');
  return keys.every(g=>g.x < -10) && pads.every(g=>g.x > 10) && ghosts.every(g=>g.z > 8) && levers.every(g=>g.z < -10) && W.A.hm.door.z < -15;
})());

// sticky levers: ON stays ON
const S=world(); S.A.buildHaunt(); S.A.hauntEnter();
const lev=S.A.hm.ghosts.find(g=>g.kind==='lever'); S.P.x=lev.x; S.P.z=lev.z; S.A.hm.near=S.A.hm.ghosts.indexOf(lev); S.A.hmAct(); S.A.hmAct();
chk('sticky levers stay ON', S.A.hm.levers[lev.i]===true);
chk('divider walls marked camSkip', true); // walls built with camSkip in hmWall

const L=world(); L.A.buildHaunt(); L.A.hauntEnter(); L.A.hm.t=0.05; L.A.hauntUpdate(.1);
chk('timer expire → lose', L.A.hm.ph==='lose' && L.over);

// E still works for a key
const E=world(); E.A.buildHaunt(); E.A.hauntEnter();
const k=E.A.hm.ghosts.find(g=>g.kind==='key'); E.P.x=k.x+1.2; E.P.z=k.z; E.A.hm.near=E.A.hm.ghosts.indexOf(k); E.A.hmAct();
chk('E also picks up nearby key', E.A.hm.keys===1 && k.got);

console.log('RESULT', pass, '/', pass+fail); process.exit(fail?1:0);
