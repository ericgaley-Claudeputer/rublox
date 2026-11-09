const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/../p45/haunt.js', 'utf8');
function world(){
  const V = () => ({x:0,y:0,z:0,set(){return this;}}); const O = () => ({position:V(),rotation:V(),scale:V(),visible:true,children:[],add(){},remove(){},querySelector:()=>null});
  const store = {}, els = {};
  const ctx = {console, Math, JSON, Object, Array, Number, String, Date, THREE:new Proxy({}, {get:()=>function(){return O();}}), scene:{add(){},remove(){},background:null,fog:{color:V(),near:0,far:0}},
    load:(k,d)=>k in store?JSON.parse(store[k]):d, save:(k,v)=>{store[k]=JSON.stringify(v);},
    $:id=>els[id]||(els[id]={textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){}},querySelector:()=>null}),
    coins:0,runCoins:0,running:true,paused:false,choosing:false,over:false,worldT:0,mode:'haunt',banners:[],
    P:{x:0,y:.05,z:2,face:0,vx:0,vy:0,vz:0}, pad:{on:false},touchUI:false,keys:{},joy:{x:0,y:0},checkpoints:[],cam:{yaw:0,pitch:0,dist:10},tipTimer:0,mp:{on:false}, mpGuest:()=>false,
    plat:()=>({mesh:O(),active:true}), label:()=>O(), confetti(){}, SND:{coin(){},cp(){},win(){}}, store, stop(){ctx.stopped=true;},
    setCoins:n=>{ctx.coins=n;}, banner:t=>ctx.banners.push(t)};
  vm.createContext(ctx);
  vm.runInContext(SRC+'\n;globalThis.A={get hm(){return hm;},buildHaunt,hauntEnter,hauntUpdate,hmAct,hmReady,hmProg,HM_TIME};',ctx);
  return ctx;
}
const W=world(); W.A.buildHaunt(); W.A.hauntEnter();
chk('builds manor with keys/pads/colours/levers', W.A.hm.ghosts.filter(g=>g.kind==='key').length===3 && W.A.hm.ghosts.filter(g=>g.kind==='pad').length===4 && W.A.hm.ghosts.filter(g=>g.kind==='colour').length===3 && W.A.hm.ghosts.filter(g=>g.kind==='lever').length===3);
chk('timer starts full', W.A.hm.t===W.A.HM_TIME);
// pick up keys
W.A.hm.ghosts.filter(g=>g.kind==='key').forEach(g=>{ W.P.x=g.x; W.P.z=g.z; W.A.hm.near=W.A.hm.ghosts.indexOf(g); W.A.hmAct(); });
chk('3 keys collected', W.A.hm.keys===3);
// pattern
W.A.hm.pattern.forEach(dir=>{ const g=W.A.hm.ghosts.find(x=>x.kind==='pad'&&x.i===dir); W.P.x=g.x; W.P.z=g.z; W.A.hm.near=W.A.hm.ghosts.indexOf(g); W.A.hmAct(); });
chk('pattern solved', W.A.hm.patternDone===true);
// wrong colour then right
const wrong=W.A.hm.ghosts.find(g=>g.kind==='colour'&&g.col!==W.A.hm.needCol); W.P.x=wrong.x; W.P.z=wrong.z; W.A.hm.near=W.A.hm.ghosts.indexOf(wrong); W.A.hmAct();
chk('wrong colour not accepted', W.A.hm.colour!==W.A.hm.needCol);
const right=W.A.hm.ghosts.find(g=>g.kind==='colour'&&g.col===W.A.hm.needCol); W.P.x=right.x; W.P.z=right.z; W.A.hm.near=W.A.hm.ghosts.indexOf(right); W.A.hmAct();
chk('matching colour ghost hugged', W.A.hm.colour===W.A.hm.needCol);
W.A.hm.ghosts.filter(g=>g.kind==='lever').forEach(g=>{ W.P.x=g.x; W.P.z=g.z; W.A.hm.near=W.A.hm.ghosts.indexOf(g); W.A.hmAct(); });
chk('all levers on → ready', W.A.hmReady());
W.P.x=0; W.P.z=-18; const c0=W.coins; W.A.hauntUpdate(.1);
chk('at open door → win + coins', W.A.hm.ph==='win' && W.coins>c0, [W.A.hm.ph, W.coins-c0]);
const L=world(); L.A.buildHaunt(); L.A.hauntEnter(); L.A.hm.t=0.05; L.A.hauntUpdate(.1);
chk('timer expire → lose', L.A.hm.ph==='lose' && L.over);
console.log('RESULT', pass, '/', pass+fail); process.exit(fail?1:0);
