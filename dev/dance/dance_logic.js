const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/dance.js', 'utf8');
function world(){
  const V = () => ({x:0,y:0,z:0,set(){return this;}}); const O = () => ({position:V(),rotation:V(),visible:true,children:[],add(){},remove(){}});
  const store = {}, els = {};
  let resumed = 0;
  function FakeAC(){ this.state='suspended'; this.currentTime=0; this.destination={}; this.resume=()=>{this.state='running'; resumed++; return Promise.resolve();}; this.close=()=>{}; this.createOscillator=()=>({type:'',frequency:{value:0},connect(){return this;},start(){},stop(){}}); this.createGain=()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;}}); }
  const ctx = {console, Math, JSON, Object, Array, Number, String, Date, window:{AudioContext:FakeAC, webkitAudioContext:FakeAC}, muted:false,
    THREE:new Proxy({}, {get:()=>function(){return O();}}), scene:{add(){},remove(){},background:null},
    load:(k,d)=>k in store?JSON.parse(store[k]):d, save:(k,v)=>{store[k]=JSON.stringify(v);},
    $:id=>els[id]||(els[id]={textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){}}}),
    coins:0,runCoins:0,running:true,paused:false,choosing:false,over:false,worldT:0,mode:'dance',banners:[],
    P:{x:0,y:.05,z:1},pad:{on:false},touchUI:false,keys:{},joy:{x:0,y:0},checkpoints:[],cam:{yaw:0,pitch:0,dist:8},tipTimer:0,mp:{on:false}, mpGuest:()=>false,
    plat:()=>({mesh:O(),active:true}), confetti(){}, SND:{coin(){},cp(){},win(){}}, store, _resumed:()=>resumed,
    setCoins:n=>{ctx.coins=n;}, banner:t=>ctx.banners.push(t)};
  vm.createContext(ctx);
  vm.runInContext(SRC+'\n;globalThis.A={get db(){return db;},buildDance,danceEnter,danceUpdate,dbHit,dbFinish,dbProg,dbPose,dbRender,DB_LEN,DB_BPM,DB_GOOD,DB_PERFECT};',ctx);
  return ctx;
}
const W=world(); W.A.buildDance(); W.A.danceEnter();
chk('chart generated with notes', W.A.db.chart.length>8, W.A.db.chart.length);
chk('slower bpm for readability', W.A.DB_BPM===88);
chk('wider hit windows', W.A.DB_GOOD===.18 && W.A.DB_PERFECT===.07);
chk('AudioContext resumed on enter gesture', W._resumed()>=1, W._resumed());
chk('intro notes are sparser (first ~12 beats)', (()=>{
  const beat=60/W.A.DB_BPM; const early=W.A.db.chart.filter(n=>n.t < 12*beat); const later=W.A.db.chart.filter(n=>n.t >= 12*beat && n.t < 24*beat);
  return early.length <= later.length;
})(), [W.A.db.chart.filter(n=>n.t<12*(60/W.A.DB_BPM)).length]);

const note=W.A.db.chart[0]; W.A.db.t=note.t; const s0=W.A.db.score; W.A.dbHit(note.dir);
chk('hitting on beat scores + combo 1', note.hit && W.A.db.score>s0 && W.A.db.combo===1 && W.A.db.maxCombo===1, [W.A.db.score, W.A.db.combo, W.A.db.maxCombo]);
W.A.dbHud = null; // not needed
const hud = W.$('#dbN').textContent;
chk('HUD shows current and best combo', /🔥1 \(best 1\)/.test(hud), hud);

// within good window (±180ms) still hits
const n2 = W.A.db.chart.find(n=>!n.hit && !n.miss); W.A.db.t = n2.t + 0.15; W.A.dbHit(n2.dir);
chk('±150ms still counts as Good', n2.hit && W.A.db.combo===2, [n2.hit, W.A.db.combo]);

W.A.dbHit(3); // likely miss far from any note
chk('miss resets current combo but keeps maxCombo', W.A.db.combo===0 && W.A.db.maxCombo>=2, [W.A.db.combo, W.A.db.maxCombo]);
chk('dance pose available', !!W.A.dbPose());

W.A.db.t=W.A.DB_LEN; const c0=W.coins; W.A.danceUpdate(.1);
chk('song end finishes + pays', W.A.db.ph==='done' && W.coins>c0 && W.A.dbProg().plays===1, W.A.dbProg());
chk('own win title (not Obby Rush)', /Bossa Beat/.test(W.$('#oWinTitle').textContent) && !/Obby Rush/.test(W.$('#oWinTitle').textContent), W.$('#oWinTitle').textContent);
chk('results show maxCombo matching HUD best', /Best combo <b>/.test(W.$('#oWinStats').innerHTML) && W.$('#oWinStats').innerHTML.includes(String(W.A.db.maxCombo)));
chk('no copyrighted audio URLs in source', !/spotify|youtube|\.mp3/i.test(SRC));
console.log('RESULT', pass, '/', pass+fail); process.exit(fail?1:0);
