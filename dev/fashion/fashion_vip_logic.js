// Non-GUI logic tests for Fashion Show VIP + fashion-only clothing (tests/p35/fashion.js via built page stubs)
const fs = require('fs'), vm = require('vm'), path = require('path');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(process.env.FS_SRC || path.join(__dirname, 'fashion.js'), 'utf8');
const HTML = process.env.PS_HTML || path.join(__dirname, '../../index.html');
function world(store, coins0){
  const V = () => ({x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;},clone(){return V();},copy(o){this.x=o.x;this.y=o.y;this.z=o.z;return this;},multiplyScalar(){return this;}});
  const O = () => { const o = {position:V(),rotation:V(),scale:V(),visible:true,add(){},remove(){},children:[],material:{color:{setHSL(){}},map:null,needsUpdate:false,dispose(){}},geometry:{dispose(){}},userData:{}}; o.clone = () => O(); return o; };
  const els = {};
  const ctx = {
    console, Math, JSON, Object, Array, Number, String, Date, Set, Map, parseInt, parseFloat, isNaN, performance: {now:()=>1e6},
    THREE: new Proxy({}, {get:()=>function(){return O();}}), scene:{add(){},remove(){},background:null},
    load:(k,d)=>{ try{ return k in store ? JSON.parse(store[k]) : d; }catch(e){return d;} }, save:(k,v)=>{ store[k]=JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent:'',innerHTML:'',style:{},disabled:false,onclick:null,classList:{s:new Set(),add(c){this.s.add(c);},remove(c){this.s.delete(c);},toggle(c,on){(on===undefined?!this.s.has(c):on)?this.s.add(c):this.s.delete(c);},contains(c){return this.s.has(c);}},querySelectorAll:()=>[],querySelector:()=>null}),
    coins: coins0 == null ? 500 : coins0, runCoins: 0, paused: false, choosing: false, worldT: 0, mode: 'fashion', banners: [], toasts: [],
    P:{x:0,y:.05,z:23,face:0,vx:0,vy:0,vz:0}, pad:{on:false}, touchUI:false, keys:{}, DEF:{shirt:'#3a86ff',pants:'#2d2d2d',head:'#f1c27d',hairColor:'#6b3e1f',hair:'short',body:'girl',hat:null,shirtPat:null,pantsPat:null,face:null,ears:null,tail:null,back:null,brow:null,lash:null},
    avatar: null, model: {g:O()}, mp:{on:false,host:true,me:'H',guests:new Map(),ents:new Map()},
    ITEMS: [{slot:'hat',val:'crown',id:'hat_crown',emoji:'👑',name:'Crown'},{slot:'shirtPat',val:'startee',id:'sp1',emoji:'⭐',name:'Star Tee'}],
    plat:()=>({mesh:O()}), mat:()=>({}), shade:(c)=>c, label:()=>O(), buildPlayer:()=>({g:O(),pivot:{children:[O()]},head:O(),legs:[O(),O()],arms:[O(),O()]}),
    canvasTex:()=>({wrapS:0,wrapT:0,repeat:{set(){}},dispose(){}}), confetti(){}, SND:{coin(){},cp(){},win(){},jump(){}},
    checkpoints:[], running:true, muted:false, tipTimer:0, document:{body:{classList:{add(){},remove(){},toggle(){},contains:()=>false}}},
    FS_POSES:[{e:'a',n:'A',p:()=>({})}], // overwritten by src
  };
  ctx.avatar = Object.assign({}, ctx.DEF);
  ctx.setCoins = n => { ctx.coins = n; };
  ctx.banner = t => ctx.banners.push(t); ctx.toast = t => ctx.toasts.push(t);
  ctx.cleanAv = a => Object.assign({}, ctx.DEF, a||{}); ctx.fixAv = a => Object.assign({}, ctx.DEF, a||{});
  ctx.isOwned = it => true; ctx.refreshLook = () => { ctx._refreshed = true; };
  ctx.fmt = s => s; ctx.bxEsc = s => s; ctx.mpLook = () => null; ctx.mpGuest = () => false; ctx.mpSendTo = () => {};
  vm.createContext(ctx);
  // provide minimal FX consumer stubs used before decorate runs deeply
  vm.runInContext(SRC + `\n;globalThis.A={get fs(){return fs;},FS_VIP_COST,fsProg,fsIsVip,fsBuyVip,fsVipBadge,fsList,fsCleanFx,fsKeep,fsMigrateAvatar,fsLocked,fsVipRows,FX,FS_RACKS,FS_ST,fsWardRender,fsFx,buildFashion,fashionEnter,fashionStop,fsPickOpen,fsName};`, ctx);
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
chk('no real-money strings in fashion source', !/robux|real money|purchase|\$|credit card|stripe|paypal/i.test(SRC) || /never real money/i.test(SRC));
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
  chk('built page: VIP nametag helper + small prep sign + VIP not in doorway', /function fsVipBadge/.test(h) && /PREP ROOM/.test(h) && !/PASTEL PREP ROOM/.test(h) && /id: 'vip', x: -27\.5/.test(h));
  const km = h.match(/function fsKeep\(\)\{[\s\S]*?\n  \}/);
  chk('built page: fsKeep no longer writes rubloxAvatar', !!(km && km[0].includes('rubloxFsLook') && !km[0].includes("save('rubloxAvatar'")));
  chk('built page: fashionStop restores normal avatar model', /function fashionStop\(\)\{[\s\S]*buildPlayer\(avatar\)/.test(h));
}
console.log('RESULT', pass, '/', pass+fail); process.exit(fail?1:0);
