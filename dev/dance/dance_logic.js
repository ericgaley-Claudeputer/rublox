const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/../p46/dance.js', 'utf8');
function world(){
  const V = () => ({x:0,y:0,z:0,set(){return this;}}); const O = () => ({position:V(),rotation:V(),visible:true,children:[],add(){},remove(){}});
  const store = {}, els = {};
  const ctx = {console, Math, JSON, Object, Array, Number, String, Date, window:{AudioContext:null}, muted:true,
    THREE:new Proxy({}, {get:()=>function(){return O();}}), scene:{add(){},remove(){},background:null},
    load:(k,d)=>k in store?JSON.parse(store[k]):d, save:(k,v)=>{store[k]=JSON.stringify(v);},
    $:id=>els[id]||(els[id]={textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){}}}),
    coins:0,runCoins:0,running:true,paused:false,choosing:false,over:false,worldT:0,mode:'dance',banners:[],
    P:{x:0,y:.05,z:1},pad:{on:false},touchUI:false,keys:{},joy:{x:0,y:0},checkpoints:[],cam:{yaw:0,pitch:0,dist:8},tipTimer:0,mp:{on:false}, mpGuest:()=>false,
    plat:()=>({mesh:O(),active:true}), confetti(){}, SND:{coin(){},cp(){},win(){}}, store,
    setCoins:n=>{ctx.coins=n;}, banner:t=>ctx.banners.push(t)};
  vm.createContext(ctx);
  vm.runInContext(SRC+'\n;globalThis.A={get db(){return db;},buildDance,danceEnter,danceUpdate,dbHit,dbFinish,dbProg,dbPose,DB_LEN,DB_BPM};',ctx);
  return ctx;
}
const W=world(); W.A.buildDance(); W.A.danceEnter();
chk('chart generated with notes', W.A.db.chart.length>10, W.A.db.chart.length);
chk('original procedural bpm', W.A.DB_BPM===96);
const note=W.A.db.chart[0]; W.A.db.t=note.t; const s0=W.A.db.score; W.A.dbHit(note.dir);
chk('hitting on beat scores', note.hit && W.A.db.score>s0 && W.A.db.combo===1, [W.A.db.score, W.A.db.combo]);
W.A.dbHit(3); // likely miss
chk('miss resets combo', W.A.db.combo===0);
chk('dance pose available', !!W.A.dbPose());
W.A.db.t=W.A.DB_LEN; const c0=W.coins; W.A.danceUpdate(.1);
chk('song end finishes + pays', W.A.db.ph==='done' && W.coins>c0 && W.A.dbProg().plays===1, W.A.dbProg());
chk('no copyrighted audio URLs in source', !/spotify|youtube|\.mp3/i.test(SRC));
console.log('RESULT', pass, '/', pass+fail); process.exit(fail?1:0);
