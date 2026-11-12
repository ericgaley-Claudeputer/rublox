'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'dev/achievements/achievements.js'), 'utf8');

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); }
}

function fresh(opts) {
  opts = opts || {};
  const store = Object.assign({}, opts.store || {});
  if (opts.coins != null && store.rubloxCoins == null) store.rubloxCoins = JSON.stringify(opts.coins);
  const bannerLog = [];
  const sandbox = {
    console,
    JSON, Math, Date, Object, Array, String, Number, Boolean, parseInt, parseFloat, isNaN, Infinity, undefined,
    localStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k,v){ store[k] = String(v); },
      removeItem(k){ delete store[k]; }
    },
    document: {
      getElementById(){ return null; },
      querySelector(){ return null; },
      querySelectorAll(){ return []; },
      createElement(){ return { classList:{add(){},remove(){},toggle(){}}, style:{}, appendChild(){}, setAttribute(){} }; }
    },
    coins: opts.coins != null ? opts.coins : 0,
    setCoins(n){
      sandbox.coins = n;
      store.rubloxCoins = JSON.stringify(n);
    },
    load(k, d){
      if (!Object.prototype.hasOwnProperty.call(store, k) || store[k] == null || store[k] === '') return d;
      try { const v = JSON.parse(store[k]); return (v === undefined || v === null) ? d : v; }
      catch (e){ return d; }
    },
    save(k, v){ store[k] = JSON.stringify(v); },
    banner(s){ bannerLog.push(String(s)); },
    toast(s){ bannerLog.push(String(s)); },
    location: {hash: opts.hash || ''},
    dhTestBlockPersist(){ return !!opts.block; },
    dhTestActive(){ return !!opts.block; },
    requestAnimationFrame(){ return 0; },
    setTimeout(){ return 0; },
    clearTimeout(){},
    performance: { now(){ return 0; } },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.bannerLog = bannerLog;
  sandbox.store = store;
  vm.runInNewContext(SRC, sandbox, { filename: 'achievements.js' });
  return sandbox;
}

(function(){
  const W = fresh();
  const list = W.ACHIEVEMENTS;
  const cats = W.ACH_CATS;
  const ids = list.map(a => a.id);
  const catIds = cats.map(c => c.id).filter(id => id !== 'all');
  chk('registry has at least 50 achievements', list.length >= 50, {n: list.length});
  chk('every achievement has an id, name, description, emoji, category, and prove fn',
    list.every(a => a && a.id && a.name && a.desc && a.emoji && a.cat && catIds.includes(a.cat) && typeof a.prove === 'function'),
    {bad: list.filter(a => !(a && a.id && a.name && a.desc && a.emoji && a.cat && typeof a.prove === 'function')).map(a => a && a.id)});
  chk('achievement ids are unique', ids.length === new Set(ids).size, {dups: ids.filter((id,i)=>ids.indexOf(id)!==i)});
  chk('registry covers the expected category tabs',
    ['dreamhouse','pets','adventure','creative','friends','collection'].every(c => catIds.includes(c)),
    {cats: catIds});
  chk('every listed category has at least one achievement',
    catIds.every(c => list.some(a => a.cat === c)),
    {empty: catIds.filter(c => !list.some(a => a.cat === c))});
})();

(function(){
  const prior = {
    rubloxSave: JSON.stringify({name:'Tess', coins:80, hat:'none', face:'smile'}),
    rubloxDreamHouse: JSON.stringify({ver:6, coins:12, likes:0, pieces:[['slab',2,0,2,0,0]], goals:{slab:1}}),
    rubloxCoins: JSON.stringify(80)
  };
  const W = fresh({coins:80, store: prior});
  W.achInit();
  const beforeSave = W.store.rubloxSave;
  const beforeDh = W.store.rubloxDreamHouse;
  const beforeCoins = W.store.rubloxCoins;
  const ok = W.achUnlock('welcome', {pay:false});
  const rec = JSON.parse(W.store.rubloxAchievements);
  chk('unlocks persist under a new rubloxAchievements key',
    ok === true && !!(rec && rec.ver === 1 && rec.unlocked && rec.unlocked.welcome),
    rec);
  chk('unlock persistence does not rewrite existing player or Dream House saves',
    W.store.rubloxSave === beforeSave
      && W.store.rubloxDreamHouse === beforeDh
      && String(W.store.rubloxCoins) === String(beforeCoins),
    {save: W.store.rubloxSave, dh: W.store.rubloxDreamHouse, coins: W.store.rubloxCoins});
})();

(function(){
  const dh = {
    ver: 7, introSeen: true, granted: true, coins: 40, likes: 3,
    pieces: [['slab',2,0,2,0,0],['sofa',3,0,3,0,0],['paint',0,0,0,0,1]],
    goals: {marked:1, slab:1, course:1, walls:1, rafters:1, roof:1, openings:1, glaze:1, paint:1, furnish:1},
    upgrades: {}, tipsSeen: {hello:true}
  };
  const save = {name:'Tess', coins:40, hat:'none', face:'smile'};
  const W = fresh({
    coins: 40,
    store: {
      rubloxDreamHouse: JSON.stringify(dh),
      rubloxSave: JSON.stringify(save),
      rubloxCoins: JSON.stringify(40),
      rubloxObby: JSON.stringify({done:{1:true,2:true,3:true}})
    }
  });
  W.achInit();
  const rec = JSON.parse(W.store.rubloxAchievements);
  const unlocked = Object.keys(rec.unlocked || {});
  chk('first-load backfill unlocks proven Dream House and Obby accomplishments',
    rec.backfilled === true && unlocked.includes('dh-done') && unlocked.includes('obby-first'),
    {unlocked, backfilled: rec.backfilled});
  const coinsAfter = Number(JSON.parse(W.store.rubloxCoins));
  const paidFromFlag = unlocked.reduce((n,id) => {
    const u = rec.unlocked[id];
    return n + ((u && u.paid) ? ((W.achById(id)||{}).coins|0) : 0);
  }, 0);
  chk('backfill pays a one-time coin reward and respects the 200-coin cap',
    rec.backfilled === true && coinsAfter >= 40 && (coinsAfter - 40) <= 200 && (coinsAfter - 40) > 0 && (coinsAfter - 40) <= paidFromFlag,
    {coinsAfter, paidFromFlag, delta: coinsAfter-40});
  const midCoins = W.store.rubloxCoins;
  const midRaw = W.store.rubloxAchievements;
  const midDh = W.store.rubloxDreamHouse;
  const midSave = W.store.rubloxSave;
  W.achInit();
  W.achBackfill();
  chk('a second backfill does not pay coins again or rewrite other saves',
    W.store.rubloxCoins === midCoins
      && W.store.rubloxAchievements === midRaw
      && W.store.rubloxDreamHouse === midDh
      && W.store.rubloxSave === midSave,
    {coins: W.store.rubloxCoins, ach: W.store.rubloxAchievements});
})();

(function(){
  const prior = {
    rubloxSave: JSON.stringify({name:'Tess', coins:99}),
    rubloxDreamHouse: JSON.stringify({ver:6, coins:12, _sentinel:'keep-me'}),
    rubloxCoins: JSON.stringify(99),
    rubloxAchievements: JSON.stringify({ver:1, unlocked:{welcome:{at:1,paid:true}}, backfilled:true})
  };
  const W = fresh({coins:99, store: Object.assign({}, prior), block:true});
  W.achInit();
  const r = W.achUnlock('dh-done');
  chk('a test hash never writes rubloxAchievements, the player wallet, or other saves',
    W.store.rubloxAchievements === prior.rubloxAchievements
      && W.store.rubloxCoins === prior.rubloxCoins
      && W.store.rubloxDreamHouse === prior.rubloxDreamHouse
      && W.store.rubloxSave === prior.rubloxSave,
    {r, ach: W.store.rubloxAchievements, coins: W.store.rubloxCoins});
})();

(function(){
  const W = fresh({
    coins:10,
    store:{
      rubloxSave: JSON.stringify({name:'A', coins:10, hat:'none', face:'smile'}),
      rubloxAvatar: JSON.stringify({hat:'none', face:'smile'})
    }
  });
  const snap = W.achSnapshot();
  const look = W.achById('shop-style');
  chk('default smile and hat do not prove the New Look achievement',
    !!look && look.prove(snap) === false,
    {look: look && look.id, snapAvatar: snap && snap.avatar});
})();


(function(){
  const prior = {
    rubloxSave: JSON.stringify({name:'Tess', coins:99}),
    rubloxDreamHouse: JSON.stringify({ver:6, coins:12, _sentinel:'keep-me'}),
    rubloxCoins: JSON.stringify(99)
  };
  const W = fresh({coins:99, store: Object.assign({}, prior), hash:'#dhtest=v7done'});
  // Even if the Dream House helpers are out of scope, a #dhtest hash must not persist.
  W.dhTestBlockPersist = undefined;
  W.dhTestActive = undefined;
  W.achInit();
  W.achUnlock('dh-done');
  W.achUnlock('first-game');
  chk('#dhtest hash blocks achievement and wallet writes even without dhTestActive in scope',
    W.store.rubloxAchievements == null
      && W.store.rubloxCoins === prior.rubloxCoins
      && W.store.rubloxDreamHouse === prior.rubloxDreamHouse
      && W.store.rubloxSave === prior.rubloxSave,
    {ach: W.store.rubloxAchievements, coins: W.store.rubloxCoins});
})();

console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
