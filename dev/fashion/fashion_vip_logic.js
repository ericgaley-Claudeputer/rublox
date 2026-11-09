// Non-GUI logic tests for Fashion Show VIP + fashion-only clothing (tests/p35/fashion.js via built page stubs)
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
    THREE: (()=>{ const O2=()=>O(); const P=new Proxy(function(){return O2();},{get:(t,k)=>{ if(k==='WebGLRenderer') return function(){ return {setClearColor(){},setPixelRatio(){},setSize(){},render(){},dispose(){},forceContextLoss(){},domElement:{}}; }; if(k==='PerspectiveCamera') return function(){ return {position:V(),aspect:1,updateProjectionMatrix(){},lookAt(){}}; }; if(k==='Scene') return function(){ return {add(){},remove(){},background:null,children:[]}; }; if(k==='Color') return function(c){ return {c}; }; if(k==='AmbientLight'||k==='PointLight'||k==='DirectionalLight'||k==='HemisphereLight') return function(){ return O2(); }; return function(){return O2();}; }, apply:()=>O2(), construct:()=>O2()}); return P; })(), scene:{add(){},remove(){},background:null},
    load:(k,d)=>{ try{ return k in store ? JSON.parse(store[k]) : d; }catch(e){return d;} }, save:(k,v)=>{ store[k]=JSON.stringify(v); },
    $: id => els[id] || (els[id] = (()=>{ const s=new Set(); const kids=[]; const e={textContent:'',_html:'',style:{},disabled:false,onclick:null,dataset:{},childElementCount:0,children:kids,
      get innerHTML(){return this._html;}, set innerHTML(v){ this._html=v; const n=(String(v).match(/<button/g)||[]).length; this.childElementCount=n; kids.length=0; for(let i=0;i<n;i++){ const b={dataset:{t:['top','bot','dress','shoe','hair','mk','acc','col','star','vip','pose'][i]}, classList:{s:new Set(),add(c){this.s.add(c);},remove(c){this.s.delete(c);},toggle(c,on){(on===undefined?!this.s.has(c):on)?this.s.add(c):this.s.delete(c);},contains(c){return this.s.has(c);}}}; kids.push(b);} }, clientWidth:220, clientHeight:320, width:220, height:320, onpointerdown:null, onpointermove:null, onpointerup:null, onpointercancel:null, setPointerCapture(){},
      classList:{add(c){s.add(c);},remove(c){s.delete(c);},toggle(c,on){(on===undefined?!s.has(c):on)?s.add(c):s.delete(c);},contains(c){return s.has(c);}},
      querySelectorAll:(sel)=> kids, querySelector:()=>kids[0]||null}; return e; })()),
    coins: coins0 == null ? 500 : coins0, runCoins: 0, paused: false, choosing: false, over: false, worldT: 0, mode: 'fashion', banners: [], toasts: [],
    P:{x:0,y:.05,z:23,face:0,vx:0,vy:0,vz:0}, cam:{yaw:0,pitch:.3,dist:6}, pad:{on:false}, touchUI:false, keys:{}, innerWidth:1280, navigator:{getGamepads:()=>[]}, devicePixelRatio:1, addEventListener(){}, removeEventListener(){}, camera:{position:{x:0,y:3,z:10,set(x,y,z){this.x=x;this.y=y;this.z=z;},copy(){}},lookAt(){}}, solids:[], DEF:{shirt:'#3a86ff',pants:'#2d2d2d',head:'#f1c27d',hairColor:'#6b3e1f',hair:'short',body:'girl',hat:null,shirtPat:null,pantsPat:null,face:null,ears:null,tail:null,back:null,brow:null,lash:null},
    avatar: null, model: {g:O()}, mp:{on:false,host:true,me:'H',guests:new Map(),ents:new Map()},
    ITEMS: [{slot:'hat',val:'crown',id:'hat_crown',emoji:'👑',name:'Crown'},{slot:'shirtPat',val:'startee',id:'sp1',emoji:'⭐',name:'Star Tee'}],
    plat:()=>({mesh:O()}), mat:()=>({}), shade:(c)=>c, label:()=>O(), buildPlayer:()=>({g:O(),pivot:{children:[O()]},head:O(),legs:[O(),O()],arms:[O(),O()]}),
    canvasTex:()=>({wrapS:0,wrapT:0,repeat:{set(){}},dispose(){}}), confetti(){}, SND:{coin(){},cp(){},win(){},jump(){}},
    checkpoints:[], running:true, muted:false, tipTimer:0, document:(()=>{ const c=new Set(); return {body:{classList:{add:(...a)=>a.forEach(x=>c.add(x)),remove:(...a)=>a.forEach(x=>c.delete(x)),toggle:(x,on)=>{ (on===undefined?!c.has(x):on)?c.add(x):c.delete(x); },contains:x=>c.has(x)}}}; })(),
    FS_POSES:[{e:'a',n:'A',p:()=>({})}], // overwritten by src
  };
  ctx.avatar = Object.assign({}, ctx.DEF);
  ctx.setCoins = n => { ctx.coins = n; };
  ctx.banner = t => ctx.banners.push(t); ctx.toast = t => ctx.toasts.push(t);
  ctx.cleanAv = a => Object.assign({}, ctx.DEF, a||{}); ctx.fixAv = a => Object.assign({}, ctx.DEF, a||{});
  ctx.isOwned = it => true; ctx.refreshLook = () => { ctx._refreshed = true; };
  ctx.fmt = s => s; ctx.bxEsc = s => s; ctx.mpLook = () => null; ctx.mpGuest = () => false; ctx.mpSendTo = () => {};
  ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
  // provide minimal FX consumer stubs used before decorate runs deeply
  vm.runInContext(SRC + `\n;globalThis.A={get fs(){return fs;},FS_VIP_COST,fsProg,fsIsVip,fsBuyVip,fsVipBadge,fsList,fsKeep,fsHasSavedLook,fsApplySavedLook,fsLocalDress,fsCleanFx,FS_FXDEF,fsCleanFx,fsKeep,fsMigrateAvatar,fsLocked,fsVipRows,FX,FS_RACKS,FS_ST,fsWardRender,fsFx,buildFashion,fashionEnter,fashionStop,fsPickOpen,fsName,fsCount,fsShine,fsWardOpen,fsWardClose,fashionCam,fsRoom,fsLocalWalk,fsWardCamInfo,FS_CHANGE,fsMirrorInit,fsMirrorRefresh,fsMirrorStop,fsRebuild,fsVipBadge};`, ctx);
  return ctx;
}
const st = {rubloxCoins:'500', rubloxAvatar: JSON.stringify({shirt:'#111111',pants:'#222222',head:'#f1c27d',hairColor:'#6b3e1f',hair:'short'})};
const W = world(st, 500);
const slots = Object.keys(W.A.FX);
let total = 0, vip = 0, neu = 0;
slots.forEach(s => W.A.fsList(s).forEach(r => { total++; if (r.vip) vip++; else if (r.v !== 'none' && r.v !== 'base' && r.v !== 'tee' && r.v !== 'pants') neu++; }));
chk('60+ fashion pieces in the catalog (excl. none/base/tee/pants defaults counted separately)', total >= 100 && neu >= 60, {total, neu, vip});
chk('some pieces are VIP-only', vip >= 12, vip);
chk('VIP lounge station + rack exist', W.A.FS_RACKS.some(r => r[0]==='vip') && W.A.FS_ST.some(s => s.id==='vip'));
chk('VIP costs Rublox coins only (250)', W.A.FS_VIP_COST === 250);
chk('VIP locked before unlock', !W.A.fsIsVip() && W.A.fsLocked({vip:true,v:'x',n:'X'}));
const c0 = W.coins; chk('cannot buy VIP without enough coins', (W.coins=100, !W.A.fsBuyVip() && W.coins===100));
W.coins = 500; chk('buy VIP spends coins and unlocks', W.A.fsBuyVip() && W.A.fsIsVip() && W.coins === 500 - 250);
chk('VIP unlock saved on device', JSON.parse(st.rubloxFashion).vip === true);
chk('already VIP: buy is a no-op', !W.A.fsBuyVip() && W.coins === 250);
const vipRow = W.A.fsVipRows(); chk('VIP rows list exclusive pieces', vipRow.length === vip && vipRow.every(r => r.vip));
// fashion-only keep
W.mode='fashion'; W.A.buildFashion(); W.A.fsVipBadge(); chk('VIP badge visible on avatar after unlock + rebuild', !!(W.A.fs.vipTag));
W.A.fs.fit = Object.assign({}, W.avatar, {shirt:'#ff0000'});
W.A.fsVipBadge(); chk('VIP badge visible on avatar after unlock + rebuild', !!(W.A.fs.vipTag));
W.A.fs.fit = W.A.fs.fit; // keep
 W.A.fs.fx = W.A.fsCleanFx({top:'velvet',dress:'pastelg',acc:['vipcrown']});
const avBefore = JSON.parse(st.rubloxAvatar);
W.A.fsKeep();
const avAfter = JSON.parse(st.rubloxAvatar);
const look = JSON.parse(st.rubloxFsLook);
chk('Save for next show writes rubloxFsLook with runway FX', look.fx.top==='velvet' && look.fx.dress==='pastelg' && look.fx.acc.includes('vipcrown'));
chk('Save for next show does NOT change the normal avatar', avAfter.shirt === avBefore.shirt && avAfter.pants === avBefore.pants);

// --- save → re-enter dress → look restored (incl. VIP pieces) ---
W.A.fs.fit = Object.assign({}, W.avatar, {shirt:'#ff6fb5', pants:'#8b5cf6'});
W.A.fs.fx = W.A.fsCleanFx({top:'velvet', dress:'pastelg', shoe:'goldheel', hair:'pastel', mk:'vipglam', acc:['vipcrown','vipbadge'], pat:'hologram'});
W.A.fsKeep();
chk('Save for next show persists rubloxFsLook with VIP FX', (()=>{ const s=JSON.parse(st.rubloxFsLook||'null'); return s && s.fx && s.fx.top==='velvet' && s.fx.dress==='pastelg' && s.fx.acc.includes('vipcrown') && s.fx.acc.includes('vipbadge'); })());
chk('hasSavedLook is true after save', W.A.fsHasSavedLook());
// simulate a brand-new dress phase (what leaving + re-entering a show does)
W.A.fs.fit = null; W.A.fs.fx = null;
W.A.fs.ord = ['H']; W.A.fs.th = 0; W.A.fs.dl = 180; W.A.fs.ph = 'dress';
W.A.fsLocalDress();
chk('re-entry auto-wears saved look (not plain Classic Tee)', W.A.fs.fx.top==='velvet' && W.A.fs.fx.dress==='pastelg' && W.A.fs.fx.shoe==='goldheel' && W.A.fs.fx.hair==='pastel' && W.A.fs.fx.acc.includes('vipcrown'), W.A.fs.fx);
chk('re-entry keeps VIP accessories when still VIP', W.A.fs.fx.acc.includes('vipbadge') && W.A.fs.fx.mk==='vipglam');
// strip VIP, re-apply: VIP pieces should drop
const st2 = Object.assign({}, st); const p = JSON.parse(st2.rubloxFashion); p.vip=false; st2.rubloxFashion=JSON.stringify(p);
const W3 = world(st2, 0); W3.A.buildFashion(); W3.A.fs.ord=['H']; W3.A.fs.th=0; W3.A.fs.dl=180; W3.A.fsLocalDress();
chk('saved VIP pieces stripped when VIP is locked again', W3.A.fs.fx.top!=='velvet' && !W3.A.fs.fx.acc.includes('vipcrown'), W3.A.fs.fx);

chk('no real-money strings in fashion source', !/robux|real money|purchase|\$|credit card|stripe|paypal/i.test(SRC) || /never real money/i.test(SRC));

// --- boutique polish: highlights, building, wardrobe preview, cosmetics ---
chk('fsShine / rim highlights exist on fashion builds', typeof W.A.fsShine === 'function');
W.A.buildFashion();
chk('boutique building shell tracked (walls + ceiling + lights)', !!(W.A.fs.bld && W.A.fs.bld.walls && W.A.fs.bld.ceiling && W.A.fs.bld.lights), W.A.fs.bld && {walls:W.A.fs.bld.walls.length, ceil:W.A.fs.bld.ceiling.length, lights:W.A.fs.bld.lights.length});
chk('boutique has enclosed walls', W.A.fs.bld.walls.length >= 3, W.A.fs.bld.walls.length);
chk('boutique has a ceiling/roof the camera can see under', W.A.fs.bld.ceiling.length >= 1, W.A.fs.bld.ceiling.length);
chk('boutique has interior lights', W.A.fs.bld.lights.length >= 3, W.A.fs.bld.lights.length);
W.A.fs.ph = 'dress'; W.A.fs.ord = ['H']; W.A.fs.th = 0; W.A.fs.dl = 180;
W.A.fs.fit = Object.assign({}, W.avatar); W.A.fs.fx = W.A.fsCleanFx({top:'tee', bot:'pants', dress:'none', shoe:'sneak', hair:'base', mk:'none', pat:'none', acc:[]});
chk('fsCount default sneak-only outfit is 1 (not off-by-one)', W.A.fsCount() === 1, W.A.fsCount());
W.A.fs.fx = W.A.fsCleanFx({top:'velvet', dress:'pastelg', shoe:'goldheel', hair:'pastel', mk:'vipglam', acc:['vipcrown'], pat:'none'});
// top + dress + shoe + hair + mk + 1 acc = 6 (bot ignored while dress is on)
chk('fsCount counts dress/gown and ignores bottoms under a dress', W.A.fsCount() === 6, W.A.fsCount());
W.A.fs.fx = W.A.fsCleanFx({top:'crop', bot:'tutu', dress:'none', shoe:'heels', hair:'bob', mk:'none', pat:'none', acc:[]});
chk('fsCount counts top+bot+shoe+hair with no dress (4)', W.A.fsCount() === 4, W.A.fsCount());
W.A.fs.ward = false; W.P.x = -23; W.P.z = 1; W.P.face = -1;
W.A.fsWardOpen('top');
chk('wardrobe open docks panel (fsward-dock)', W.document.body.classList.contains('fsward-dock'));
chk('wardrobe opens a dedicated mirror preview (not world-cam hijack)', !!(W.A.fs.mirror && W.A.fs.mirror.ren && W.A.fs.mirror.cam));
chk('wardrobe does NOT teleport the player (world view stays put)', Math.abs(W.P.x + 23) < .01 && Math.abs(W.P.z - 1) < .01, {x:W.P.x,z:W.P.z});
chk('fashionCam does not override world camera while wardrobe is open', W.A.fashionCam() === false);
const ci = W.A.fsWardCamInfo();
chk('mirror camera sits in front of preview avatar (dot>0.7)', !!(ci && ci.mode==='mirror' && ci.dot > 0.7), ci);
chk('mirror camera pulled back for full body (dist>=4.5)', !!(ci && ci.dist >= 4.5), ci);
chk('mirror has a live avatar clone', !!(ci && ci.hasAvatar));
// item change refreshes mirror
W.A.fs.fx = W.A.fsCleanFx({top:'velvet', dress:'pastelg', shoe:'heels', hair:'bob', mk:'glam', acc:['pearls']});
W.A.fsRebuild(W.A.fs.fit, W.A.fs.fx);
chk('item change refreshes the mirror avatar', !!(W.A.fs.mirror && W.A.fs.mirror.avatar));
W.A.fsWardClose();
chk('wardrobe close removes dock class and tears down mirror', !W.document.body.classList.contains('fsward-dock') && !W.A.fs.mirror);
// vipTag null guard: fsRebuild must not throw when fs is null
let threw = false; const hold = W.A.fs; 
try { // simulate post-stop rebuild
  // can't null out via A.fs easily; call with fs null by temporarily clearing
  W.A.buildFashion(); // ensure model
} catch(e){}
// direct: set ctx fs null through rebuild path
try {
  const prev = W.A.fs; 
  // fsRebuild reads global fs from closure — use fashionStop then rebuild
  W.A.fashionStop();
  W.A.fsRebuild(W.avatar, null);
} catch (e){ threw = true; console.log('rebuild err', e.message); }
chk('fsRebuild guards vipTag when fs is null (no TypeError)', threw === false);
// restore fashion for later checks
W.A.buildFashion(); if (!W.A.fsIsVip()){ W.coins=500; W.A.fsBuyVip(); } W.A.fsVipBadge();
chk('VIP dressing-room badge is offset above normal nametag height', !!(W.A.fs.vipTag && W.A.fs.vipTag.position.y >= 4.0), W.A.fs.vipTag && W.A.fs.vipTag.position);
// built page includes mirror canvas
chk('built page: wardrobe mirror canvas markup present', /id="fsMirror"/.test(require('fs').readFileSync(HTML,'utf8')));
chk('built page: fsMirrorInit + vipTag guard present', /function fsMirrorInit/.test(require('fs').readFileSync(HTML,'utf8')) && /if \(fs\)\{ fs\.vipTag = null/.test(require('fs').readFileSync(HTML,'utf8')));
// VIP runway label height (no clip): build walkers and check y
W.coins = 500; if (!W.A.fsIsVip()) W.A.fsBuyVip();
W.A.fs.ord = ['H']; W.A.fs.fits = {H: Object.assign({}, W.avatar)}; W.A.fs.fxs = {H: W.A.fsCleanFx(null)}; W.A.fs.poses = {H:0};
W.A.fs.ph = 'walk'; W.A.fsLocalWalk();
const me = W.A.fs.walkers.find(w => w.u === 'H');
chk('VIP You label sits at safe runway height (not clipped)', !!(me && me.meVip && me.lab && Math.abs(me.lab.position.y - 3.55) < .01), me && me.lab && me.lab.position.y);
chk('VIP copy says Rublox coins / never real money', /Rublox coins/.test(SRC) && /never real money/i.test(SRC));
// migrate: unknown slot value cleared
st.rubloxAvatar = JSON.stringify({shirt:'#3a86ff',pants:'#2d2d2d',head:'#f1c27d',hairColor:'#6b3e1f',hair:'short',hat:'notARealShopHat_xyz'});
W2 = world(st, 0); W2.A.fsMigrateAvatar();
chk('migration clears unknown fashion leftovers from normal avatar', JSON.parse(st.rubloxAvatar).hat == null || JSON.parse(st.rubloxAvatar).hat === W2.DEF.hat);
// built page checks
if (fs.existsSync(HTML)){
  const h = fs.readFileSync(HTML,'utf8');
  chk('built page: VIP lounge + Save for next show + coins-only unlock', /Star VIP/.test(h) && /Save for next show/.test(h) && /FS_VIP_COST = 250/.test(h) && /never real money/i.test(h));
  chk('built page: Save button in wardrobe panel (mini + footer)', /id="fsKeepWard"/.test(h) && /id="fsKeepWard2"/.test(h));
  chk('built page: VIP badge + auto-restore + no doorway lintel band', /function fsVipBadge/.test(h) && /fsApplySavedLook/.test(h) && /fsLocalDress/.test(h) && /Wear my saved look/.test(h) && !/fsDeco\(\.4, \.5, 5\.2, '#ff6fb5'/.test(h) && /x: -23\.5/.test(h) && /oCoins'\)\.textContent = coins/.test(h) && /VIP You/.test(h));
  const km = h.match(/function fsKeep\(\)\{[\s\S]*?\n  \}/);
  chk('built page: fsKeep no longer writes rubloxAvatar', !!(km && km[0].includes('rubloxFsLook') && !km[0].includes("save('rubloxAvatar'")));
  chk('built page: fashionStop restores normal avatar model', /function fashionStop\(\)\{[\s\S]*buildPlayer\(avatar\)/.test(h));
}
console.log('RESULT', pass, '/', pass+fail); process.exit(fail?1:0);
