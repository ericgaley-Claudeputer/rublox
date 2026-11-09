// Voter feedback tags + blank dress start (tests/p35/fashion.js)
const fs = require('fs'), vm = require('vm'), path = require('path');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(process.env.FS_SRC || path.join(__dirname, '../p35/fashion.js'), 'utf8');
const HTML = process.env.PS_HTML || path.join(__dirname, '../../index.html');
function world(store, coins0){
  const V = () => ({x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;},clone(){return V();},copy(o){this.x=o.x;this.y=o.y;this.z=o.z;return this;},multiplyScalar(){return this;}});
  const O = () => { const o = {position:V(),rotation:V(),scale:V(),visible:true,add(){},remove(){},children:[],material:{color:{setHSL(){}},map:null,needsUpdate:false,dispose(){}},geometry:{dispose(){}},userData:{}}; o.clone = () => O(); return o; };
  const els = {};
  const ctx = {
    console, Math, JSON, Object, Array, Number, String, Date, Set, Map, parseInt, parseFloat, isNaN, performance: {now:()=>1e6},
    THREE: (()=>{ const O2=()=>O(); const P=new Proxy(function(){return O2();},{get:(t,k)=>{ if(k==='WebGLRenderer') return function(){ return {setClearColor(){},setPixelRatio(){},setSize(){},render(){},dispose(){},forceContextLoss(){},domElement:{}}; }; if(k==='PerspectiveCamera') return function(){ return {position:V(),aspect:1,updateProjectionMatrix(){},lookAt(){}}; }; if(k==='Scene') return function(){ return {add(){},remove(){},background:null,children:[]}; }; if(k==='Color') return function(c){ return {c}; }; if(k==='Vector3') return function(x,y,z){ const o={x:x||0,y:y||0,z:z||0,set(a,b,c){this.x=a;this.y=b;this.z=c;return this;},copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}}; return o; }; if(k==='Box3') return function(){ return {min:{x:-.5,y:0,z:-.3},max:{x:.5,y:3.2,z:.3},isEmpty:()=>false,setFromObject(){ this.min={x:-.6,y:0,z:-.4}; this.max={x:.6,y:3.4,z:.5}; return this; }, getSize(v){ v.x=1.2;v.y=3.4;v.z=.9; return v; }, getCenter(v){ v.x=0;v.y=1.7;v.z=0; return v; } }; }; if(k==='AmbientLight'||k==='PointLight'||k==='DirectionalLight'||k==='HemisphereLight') return function(){ return O2(); }; return function(){return O2();}; }, apply:()=>O2(), construct:()=>O2()}); return P; })(), scene:{add(){},remove(){},background:null},
    load:(k,d)=>{ try{ return k in store ? JSON.parse(store[k]) : d; }catch(e){return d;} }, save:(k,v)=>{ store[k]=JSON.stringify(v); },
    $: id => els[id] || (els[id] = (()=>{ const s=new Set(); const kids=[]; const e={textContent:'',_html:'',style:{},disabled:false,onclick:null,dataset:{},childElementCount:0,children:kids,
      get innerHTML(){return this._html;}, set innerHTML(v){ this._html=v; const n=(String(v).match(/<button/g)||[]).length; this.childElementCount=n; kids.length=0; for(let i=0;i<n;i++){ const b={dataset:{t:['top','bot','dress','shoe','hair','mk','acc','col','star','vip','pose'][i]}, classList:{s:new Set(),add(c){this.s.add(c);},remove(c){this.s.delete(c);},toggle(c,on){(on===undefined?!this.s.has(c):on)?this.s.add(c):this.s.delete(c);},contains(c){return this.s.has(c);}}}; kids.push(b);} }, clientWidth:220, clientHeight:320, width:220, height:320, onpointerdown:null, onpointermove:null, onpointerup:null, onpointercancel:null, setPointerCapture(){},
      classList:{add(c){s.add(c);},remove(c){s.delete(c);},toggle(c,on){(on===undefined?!s.has(c):on)?s.add(c):s.delete(c);},contains(c){return s.has(c);}},
      querySelectorAll:(sel)=> kids, querySelector:()=>kids[0]||null}; return e; })()),
    coins: coins0 == null ? 500 : coins0, runCoins: 0, paused: false, choosing: false, over: false, worldT: 0, mode: 'fashion', banners: [], toasts: [],
    P:{x:0,y:.05,z:23,face:0,vx:0,vy:0,vz:0}, cam:{yaw:0,pitch:.3,dist:6}, pad:{on:false}, touchUI:false, keys:{}, innerWidth:1280, navigator:{getGamepads:()=>[]}, devicePixelRatio:1, addEventListener(){}, removeEventListener(){}, camera:{position:{x:0,y:3,z:10,set(x,y,z){this.x=x;this.y=y;this.z=z;},copy(){}},lookAt(){}}, solids:[], DEF:{shirt:'#3a86ff',pants:'#2d2d2d',head:'#f1c27d',hairColor:'#6b3e1f',hair:'short',body:'girl',hat:null,shirtPat:null,pantsPat:null,face:null,ears:null,tail:null,back:null,brow:null,lash:null},
    avatar: null, model: {g:O()}, mp:{on:false,host:true,me:'H',guests:new Map(),ents:new Map()},
    ITEMS: [{slot:'hat',val:'crown',id:'hat_crown',emoji:'👑',name:'Crown'},{slot:'shirtPat',val:'startee',id:'sp1',emoji:'⭐',name:'Star Tee'}],
    plat:()=>({mesh:O()}), mat:()=>({}), shade:(c)=>c, label:()=>O(), buildPlayer:()=>({g:Object.assign(O(),{updateMatrixWorld(){}}),pivot:{children:[O()]},head:O(),legs:[O(),O()],arms:[O(),O()]}),
    canvasTex:()=>({wrapS:0,wrapT:0,repeat:{set(){}},dispose(){}}), confetti(){}, SND:{coin(){},cp(){},win(){},jump(){}},
    checkpoints:[], running:true, muted:false, tipTimer:0, document:(()=>{ const c=new Set(); return {body:{classList:{add:(...a)=>a.forEach(x=>c.add(x)),remove:(...a)=>a.forEach(x=>c.delete(x)),toggle:(x,on)=>{ (on===undefined?!c.has(x):on)?c.add(x):c.delete(x); },contains:x=>c.has(x)}}}; })(),
  };
  ctx.avatar = Object.assign({}, ctx.DEF);
  ctx.setCoins = n => { ctx.coins = n; };
  ctx.banner = t => ctx.banners.push(t); ctx.toast = t => ctx.toasts.push(t);
  ctx.cleanAv = a => Object.assign({}, ctx.DEF, a||{}); ctx.fixAv = a => Object.assign({}, ctx.DEF, a||{});
  ctx.isOwned = it => true; ctx.refreshLook = () => { ctx._refreshed = true; };
  ctx.fmt = s => s; ctx.bxEsc = s => s; ctx.mpLook = () => null; ctx.mpGuest = () => false; ctx.mpSendTo = (...a) => { ctx._sent = ctx._sent || []; ctx._sent.push(a); };
  ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
  vm.runInContext(SRC + `\n;globalThis.A={get fs(){return fs;},FS_TAGS,FS_TAGIDS,FS_TIPS,FS_FXDEF,FS_THEMES,FS_WALK,FS_POSE_IN,FS_POSE_OUT,fsBlankAv,fsBlankFx,fsCleanFx,fsCleanTags,fsNpcTags,fsTagTotals,fsTopLiked,fsTipFor,fsFeedbackHtml,fsToggleTag,fsJudgeWalker,fsSendRate,fsLocalDress,fsBeginDress,fsApplySavedLook,fsHasSavedLook,fsKeep,fsCount,buildFashion,fashionWire,fsAvg,fsRateLeft,fsBuild};`, ctx);
  return ctx;
}
const st = {rubloxCoins:'500'};
const W = world(st, 500);
W.A.buildFashion();
chk('FS_TAGS has 8 kid-friendly feedback chips', W.A.FS_TAGS.length === 8 && W.A.FS_TAGS.every(t => t.id && t.e && t.n), W.A.FS_TAGS.map(t=>t.id));
chk('tag ids cover Colors/Theme/Acc/Hair/Makeup/Creative/Shoes/Pose', ['colors','theme','acc','hair','makeup','creative','shoes','pose'].every(id => W.A.FS_TAGIDS.has(id)));

// themed look → NPC tags include theme / hair / makeup / acc / shoes
const beach = 0;
const themed = W.A.fsCleanFx({top:'tank', bot:'shorts', dress:'none', shoe:'sneak', hair:'pony', mk:'stars', pat:'flowers', acc:['bag','sunnies']});
const tags = W.A.fsNpcTags({shirt:'#ffd23f', pants:'#3ac6ff', hairColor:'#ffd23f'}, themed, beach);
chk('NPC tags for beachy look include theme and at least one style tag', tags.includes('theme') && (tags.includes('hair') || tags.includes('makeup') || tags.includes('acc') || tags.includes('shoes') || tags.includes('creative')), tags);

W.A.fs.ph = 'walk'; W.A.fs.th = beach; W.A.fs.ord = ['H','n0']; W.A.fs.rates = {}; W.A.fs.tags = {};
W.A.fs.fits = {H: Object.assign({}, W.avatar, {shirt:'#ffd23f'}), n0: Object.assign({}, W.avatar)};
W.A.fs.fxs = {H: themed, n0: W.A.fsBlankFx()};
W.A.fs.judges = [{voteT:0},{voteT:0},{voteT:0},{voteT:0}];
W.mp.on = false;
W.A.fsJudgeWalker('H');
const voterKeys = Object.keys(W.A.fs.tags);
chk('single-player judge walkers leave tags for the look', voterKeys.length >= 4 && voterKeys.every(v => (W.A.fs.tags[v].H||[]).length >= 1), W.A.fs.tags);
const top = W.A.fsTopLiked('H', 3);
chk('top liked returns up to 3 tags with counts', top.length >= 1 && top.length <= 3 && top.every(t => t.c >= 1 && t.e && t.n), top);
const tip = W.A.fsTipFor('H');
chk('tip is kind (never mean words)', typeof tip === 'string' && tip.length > 5 && !/ugly|bad|hate|stupid|gross|fail|worst|suck/i.test(tip), tip);
chk('feedback HTML shows Your feedback + average + tip', (()=>{ const h=W.A.fsFeedbackHtml('H'); return /Your feedback/.test(h) && /average/.test(h) && /💡/.test(h); })());

// multiplayer: fsJudgeWalker is a no-op for NPC tags
W.mp.on = true; W.A.fs.tags = {}; W.A.fs.rates = {};
W.A.fsJudgeWalker('H');
chk('multiplayer: no NPC voter tags from fsJudgeWalker', Object.keys(W.A.fs.tags).length === 0, W.A.fs.tags);

// PeerJS fsrate payload includes tags via fsSendRate
W.mp.on = false; W.A.fs.remote = true; W.A.fs.ph = 'walk'; W.A.fs.wt = 0; W.A.fs.ord = ['n0','H']; // n0 is current
W.A.fs.rated = {}; W.A.fs.myTags = {}; W.A.fs.tags = {}; W._sent = [];
W.A.fs.rated['n0'] = 4; W.A.fs.myTags['n0'] = ['colors','theme','pose'];
W.A.fsSendRate('n0');
const msg = (W._sent||[]).map(a => a[1]).find(d => d && d.t === 'fsrate');
chk('fsrate PeerJS message carries stars + tags', !!(msg && msg.n === 4 && Array.isArray(msg.tags) && msg.tags.includes('theme') && msg.tags.includes('colors')), msg);

// fashionWire includes tg on podium/end
W.A.fs.remote = false; W.A.fs.ph = 'end'; W.A.fs.n = 1; W.A.fs.t = 1; W.A.fs.wt = 0; W.A.fs.th = 0; W.A.fs.ord = ['H']; W.A.fs.ready = new Set(); W.A.fs.dl = 180; W.A.fs.poses = {}; W.A.fs.res = [['H',40,3]]; W.A.fs.pod = ['H'];
W.A.fs.tags = {j0:{H:['theme','hair']}, j1:{H:['theme']}};
const wire = W.A.fashionWire();
chk('fashionWire syncs tag map on results', !!(wire.tg && wire.tg.j0 && wire.tg.j0.H.includes('theme')), wire.tg);

// sanitize
chk('fsCleanTags drops junk and caps at 3', W.A.fsCleanTags(['theme','nope','hair','colors','pose','acc']).join(',') === 'theme,hair,colors');

// blank start still holds with feedback helpers loaded
W.A.fs.ph = 'dress'; W.A.fs.ord = ['H']; W.A.fs.th = 0; W.A.fs.dl = 180;
W.A.fsLocalDress();
chk('dress still starts blank with feedback build', W.A.fs.fx.top==='tee' && W.A.fs.fx.bot==='shorts' && W.A.fs.fx.shoe==='none' && W.A.fsCount()===0, W.A.fs.fx);
chk('blank tee soft slate for jacket contrast', /^#9aa4bc$/i.test(W.A.fs.fit.shirt), W.A.fs.fit.shirt);
chk('walk slot >=14s with ~8.5s+ pose/rate window', W.A.FS_WALK >= 14 && (W.A.FS_POSE_OUT - W.A.FS_POSE_IN) >= 8, {w:W.A.FS_WALK, pose:W.A.FS_POSE_OUT-W.A.FS_POSE_IN});
W.A.fs.ph='walk'; W.A.fs.wt = 2; W.A.fs.ord=['n0','H'];
chk('fsRateLeft counts down within the current look', W.A.fsRateLeft() === 12, W.A.fsRateLeft());

if (fs.existsSync(HTML)){
  const h = fs.readFileSync(HTML,'utf8');
  chk('built page: feedback tag UI + Your feedback card', /id="fsRateTags"/.test(h) && /id="fsEndFb"/.test(h) && /FS_TAGS/.test(h) && /Your feedback/.test(h));
  chk('built page: fsrate accepts tags + wire tg', /d\.tags/.test(h) && /w\.tg/.test(h) && /fsNpcTags/.test(h));
  chk('built page: blank start helpers present', /function fsBlankAv/.test(h) && /never auto-wear/.test(h) && /bot: 'shorts'/.test(h));
  chk('built page: rate countdown + build stamp visible', /id="fsRateCd"/.test(h) && /id="fsBuild"/.test(h) && /FS_WALK = 14/.test(h) && /2026\.11\.09-9/.test(h));
}
console.log('RESULT', pass, '/', pass+fail); process.exit(fail?1:0);
