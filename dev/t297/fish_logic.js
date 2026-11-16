/* Ripple Lake fishing rules — rarities, collection, seasonal ice fish. */
(function (root) {
  'use strict';

  const FISH_KEY = 'rubloxFish';
  const FISH_VER = 1;
  const FISH_LIST = [
    {id:'minnow',   name:'Splish Minnow',  emoji:'🐟', r:0, wt:28, coin:2,  lo:8,  hi:16},
    {id:'sunperch', name:'Sunperch',       emoji:'🐠', r:0, wt:22, coin:3,  lo:10, hi:20},
    {id:'trout',    name:'Ribbon Trout',   emoji:'🐟', r:0, wt:18, coin:3,  lo:14, hi:26},
    {id:'carp',     name:'Daisy Carp',     emoji:'🐠', r:0, wt:16, coin:3,  lo:16, hi:30},
    {id:'bass',     name:'Pebble Bass',    emoji:'🐟', r:1, wt:14, coin:5,  lo:18, hi:34},
    {id:'pike',     name:'Moss Pike',      emoji:'🐟', r:1, wt:12, coin:6,  lo:22, hi:40},
    {id:'catfish',  name:'Cloud Catfish',  emoji:'🐟', r:1, wt:10, coin:6,  lo:20, hi:38},
    {id:'bluegill', name:'Berry Bluegill', emoji:'🐠', r:1, wt:10, coin:5,  lo:12, hi:22},
    {id:'koi',      name:'Copper Koi',     emoji:'🐟', r:2, wt:6,  coin:10, lo:16, hi:28},
    {id:'loach',    name:'Glow Loach',     emoji:'🐟', r:2, wt:5,  coin:10, lo:10, hi:20},
    {id:'starfin',  name:'Starfin',        emoji:'🌟', r:2, wt:4,  coin:12, lo:14, hi:24},
    {id:'eel',      name:'Marble Eel',     emoji:'🐍', r:2, wt:4,  coin:12, lo:20, hi:36},
    {id:'salmon',   name:'Silk Salmon',    emoji:'🐟', r:2, wt:4,  coin:12, lo:24, hi:42},
    {id:'bubble',   name:'Bubblefish',     emoji:'🫧', r:2, wt:3,  coin:14, lo:8,  hi:16},
    {id:'moon',     name:'Moon Perch',     emoji:'🌙', r:3, wt:2,  coin:20, lo:16, hi:28},
    {id:'golden',   name:'Goldenfin',      emoji:'✨', r:3, wt:1.5,coin:24, lo:18, hi:32},
    {id:'tetra',    name:'Fairy Tetra',    emoji:'🧚', r:3, wt:1.2,coin:26, lo:6,  hi:12},
    {id:'thunder',  name:'Thunder Bass',   emoji:'⚡', r:3, wt:1,  coin:28, lo:28, hi:50},
    {id:'crown',    name:'Crown Koi',      emoji:'👑', r:3, wt:0.7,coin:35, lo:20, hi:36},
    {id:'frost',    name:'Frost Minnow',   emoji:'❄️', r:1, wt:10, coin:8,  lo:8,  hi:16, ice:true},
    {id:'icepike',  name:'Ice Pike',       emoji:'🧊', r:2, wt:5,  coin:16, lo:22, hi:40, ice:true},
    {id:'cocoa',    name:'Cocoa Crappie',  emoji:'🍫', r:2, wt:4,  coin:14, lo:12, hi:22, ice:true},
    {id:'flake',    name:'Snowflake Tang', emoji:'❄️', r:3, wt:1,  coin:30, lo:10, hi:18, ice:true}
  ];
  const FISH_RARITY = [
    {n:'Common',    e:'⚪', c:'#9aa3b5'},
    {n:'Uncommon',  e:'🟢', c:'#2ec27e'},
    {n:'Rare',      e:'🔵', c:'#3a86ff'},
    {n:'Legendary', e:'🌟', c:'#ffc61a'}
  ];

  function fishFresh(){ return {ver: FISH_VER, caught:{}, best:{}, total:0, earned:0, biggest:0}; }

  function fishLoad(raw){
    const s = fishFresh();
    const o = raw && typeof raw === 'object' ? raw : null;
    if (!o) return s;
    s.total = Math.max(0, o.total | 0);
    s.earned = Math.max(0, o.earned | 0);
    s.biggest = Math.max(0, +o.biggest || 0);
    if (o.caught && typeof o.caught === 'object'){
      for (const k in o.caught){ const v = o.caught[k] | 0; if (v > 0 && FISH_LIST.some(f => f.id === k)) s.caught[k] = v; }
    }
    if (o.best && typeof o.best === 'object'){
      for (const k in o.best){ const v = +o.best[k]; if (isFinite(v) && v > 0 && FISH_LIST.some(f => f.id === k)) s.best[k] = v; }
    }
    return s;
  }

  function fishPool(ice){
    return FISH_LIST.filter(f => ice ? true : !f.ice);
  }

  function fishPick(rand, ice, quality){
    const pool = fishPool(!!ice);
    const q = Math.max(0, Math.min(1, +quality || 0));
    // Better timing shifts weight toward rarer fish.
    const rows = pool.map(f => ({f, w: Math.max(0.05, f.wt * (1 + q * f.r * 0.85))}));
    let sum = 0; rows.forEach(r => { sum += r.w; });
    let t = ((typeof rand === 'function') ? rand() : Math.random()) * sum;
    for (const r of rows){ t -= r.w; if (t <= 0) return r.f; }
    return rows[rows.length - 1].f;
  }

  function fishSize(f, rand, quality){
    const q = Math.max(0, Math.min(1, +quality || 0));
    const u = (typeof rand === 'function') ? rand() : Math.random();
    const span = f.hi - f.lo;
    const cm = f.lo + span * (0.25 * u + 0.75 * q * q);
    return Math.round(cm * 10) / 10;
  }

  function fishCatch(state, fish, size){
    state = fishLoad(state);
    if (!fish) return {ok:false, why:'miss', state, coins:0};
    const cm = Math.max(fish.lo, Math.min(fish.hi, +size || fish.lo));
    state.caught[fish.id] = (state.caught[fish.id] | 0) + 1;
    if (state.best[fish.id] == null || cm > state.best[fish.id]) state.best[fish.id] = cm;
    state.total += 1;
    if (cm > state.biggest) state.biggest = cm;
    const bonus = cm >= fish.hi - 1 ? 2 : 0;
    const coins = fish.coin + bonus;
    state.earned += coins;
    return {ok:true, why:'ok', state, coins, size: cm, fish, first: state.caught[fish.id] === 1};
  }

  function fishKinds(state){
    state = fishLoad(state);
    return Object.keys(state.caught).length;
  }

  function fishIndex(state, ice){
    state = fishLoad(state);
    const pool = FISH_LIST.filter(f => ice || !f.ice);
    return pool.map(f => ({
      id: f.id, name: f.name, emoji: f.emoji, r: f.r, ice: !!f.ice,
      rarity: FISH_RARITY[f.r].n, rec: FISH_RARITY[f.r].e,
      count: state.caught[f.id] | 0,
      best: state.best[f.id] || null,
      found: (state.caught[f.id] | 0) > 0
    }));
  }

  // quality 0..1 from timing minigame (1 = perfect center).
  function fishQuality(cursor, sweet, width){
    const w = Math.max(0.04, +width || 0.16);
    const d = Math.abs((+cursor || 0) - (+sweet || 0.5));
    if (d > w) return 0;
    return Math.max(0, Math.min(1, 1 - d / w));
  }

  const api = {
    FISH_KEY, FISH_VER, FISH_LIST, FISH_RARITY,
    fishFresh, fishLoad, fishPool, fishPick, fishSize, fishCatch, fishKinds, fishIndex, fishQuality
  };
  root.FishRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
