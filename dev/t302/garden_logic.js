/* Sunny Patch Garden — original seeds, real-time plots, prize stand. Save key rubloxGarden. */
(function (root) {
  const GARDEN_KEY = 'rubloxGarden';
  const GARDEN_VER = 1;
  const GARDEN_PLOTS = 9;
  const GARDEN_STAND = 3;
  const GARDEN_RARITIES = [
    {id:'common', name:'Common', color:'#7ad46a', glow:null},
    {id:'uncommon', name:'Uncommon', color:'#3a86ff', glow:'#7ec8ff'},
    {id:'rare', name:'Rare', color:'#b48cff', glow:'#d4b8ff'},
    {id:'epic', name:'Epic', color:'#ff9f1c', glow:'#ffd23f'},
    {id:'legendary', name:'Legendary', color:'#ffd23f', glow:'#fff4c2'}
  ];
  const GARDEN_SEEDS = [
    {id:'sprout', name:'Silly Sprout', emoji:'🌱', cost:2, sell:3, grow:15000, color:'#7ad46a', rarity:'common'},
    {id:'bean', name:'Giggle Bean', emoji:'🫘', cost:5, sell:8, grow:45000, color:'#c45c4a', rarity:'common'},
    {id:'cloud', name:'Cloudberry', emoji:'☁️', cost:10, sell:20, grow:120000, color:'#cfe8ff', rarity:'uncommon'},
    {id:'melon', name:'Moon Melon', emoji:'🍈', cost:20, sell:45, grow:300000, color:'#b4e07a', rarity:'rare'},
    {id:'squash', name:'Sparkle Squash', emoji:'✨', cost:35, sell:90, grow:600000, color:'#f4c84a', rarity:'epic'},
    {id:'prism', name:'Prism Peony', emoji:'🌺', cost:80, sell:220, grow:900000, color:'#ff6fb5', rarity:'legendary'}
  ];
  const RARITY_RANK = {common:0, uncommon:1, rare:2, epic:3, legendary:4};
  const MUT_MUL = [1, 1.8, 3, 5, 8];

  function gardenFresh(){
    return {
      ver: GARDEN_VER,
      pouch: {},
      plots: Array.from({length: GARDEN_PLOTS}, (_, i) => ({id:i, seed:null, plantedAt:0, rarity:null})),
      basket: [],
      stand: Array(GARDEN_STAND).fill(null),
      sold: 0,
      earned: 0,
      planted: 0,
      harvested: 0
    };
  }

  function gardenSeed(id){
    if (id && typeof id === 'object') id = id.id;
    return GARDEN_SEEDS.find(s => s.id === id) || null;
  }
  function gardenRarity(id){ return GARDEN_RARITIES.find(r => r.id === id) || null; }
  function gardenRarityId(id){ return gardenRarity(id) ? id : null; }

  function gardenItem(x){
    if (!x) return null;
    if (typeof x === 'string'){
      const seed = gardenSeed(x);
      return seed ? {id: seed.id, rarity: seed.rarity || 'common'} : null;
    }
    const seed = gardenSeed(x.id);
    if (!seed) return null;
    return {id: seed.id, rarity: gardenRarityId(x.rarity) || seed.rarity || 'common'};
  }

  function gardenSellValue(item){
    const it = gardenItem(item);
    const seed = it && gardenSeed(it.id);
    if (!seed) return 0;
    const baseR = seed.rarity || 'common';
    const r = it.rarity || baseR;
    const steps = Math.max(0, (RARITY_RANK[r] || 0) - (RARITY_RANK[baseR] || 0));
    return Math.round(seed.sell * (MUT_MUL[steps] || 1));
  }

  function gardenRollRarity(seedId, rng){
    const seed = gardenSeed(seedId);
    const rank = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    let i = Math.max(0, rank.indexOf((seed && seed.rarity) || 'common'));
    const r = typeof rng === 'function' ? +rng() : Math.random();
    const n = isFinite(r) ? r : 1;
    if (n < 0.004) i = Math.min(4, i + 4);
    else if (n < 0.02) i = Math.min(4, i + 2);
    else if (n < 0.14) i = Math.min(4, i + 1);
    return rank[i];
  }

  function gardenLoad(raw){
    const d = gardenFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    if (o.pouch && typeof o.pouch === 'object'){
      GARDEN_SEEDS.forEach(s => {
        const n = o.pouch[s.id] | 0;
        if (n > 0) d.pouch[s.id] = Math.min(99, n);
      });
    }
    if (Array.isArray(o.plots)){
      d.plots = d.plots.map((p, i) => {
        const q = o.plots[i] || {};
        const seed = gardenSeed(q.seed) ? (q.seed.id || q.seed) : null;
        const plantedAt = seed && +q.plantedAt > 0 ? +q.plantedAt : 0;
        const rarity = seed ? (gardenRarityId(q.rarity) || gardenSeed(seed).rarity || 'common') : null;
        return {id:i, seed, plantedAt, rarity};
      });
    }
    if (Array.isArray(o.basket)){
      d.basket = o.basket.map(x => gardenItem(x)).filter(Boolean).slice(0, 40);
    }
    if (Array.isArray(o.stand)){
      d.stand = d.stand.map((_, i) => gardenItem(o.stand[i]));
    }
    d.sold = Math.max(0, o.sold | 0);
    d.earned = Math.max(0, o.earned | 0);
    d.planted = Math.max(0, o.planted | 0);
    d.harvested = Math.max(0, o.harvested | 0);
    d.starter = !!o.starter;
    d.pick = gardenSeed(o.pick) ? (o.pick.id || o.pick) : null;
    return d;
  }

  function gardenStage(plot, now){
    if (!plot || !plot.seed || !plot.plantedAt) return 0;
    const seed = gardenSeed(plot.seed);
    if (!seed) return 0;
    const t = Math.max(0, (+now || 0) - plot.plantedAt);
    if (t >= seed.grow) return 3;
    if (t >= seed.grow * 0.45) return 2;
    return 1;
  }

  function gardenReady(plot, now){ return gardenStage(plot, now) === 3; }

  function gardenBuy(state, seedId, coins){
    state = gardenLoad(state);
    const seed = gardenSeed(seedId);
    if (!seed) return {ok:false, why:'seed', state, coins: coins|0};
    const c = coins|0;
    if (c < seed.cost) return {ok:false, why:'coins', state, coins:c};
    state.pouch[seed.id] = (state.pouch[seed.id] | 0) + 1;
    return {ok:true, why:'ok', state, coins: c - seed.cost, seed};
  }

  function gardenPlant(state, plotId, seedId, now, coins, rng){
    state = gardenLoad(state);
    const i = plotId | 0;
    if (i < 0 || i >= GARDEN_PLOTS) return {ok:false, why:'plot', state, coins: coins|0};
    const plot = state.plots[i];
    if (plot.seed) return {ok:false, why:'busy', state, coins: coins|0};
    let sid = seedId || state.pick;
    if (!sid || (state.pouch[sid] | 0) <= 0){
      sid = GARDEN_SEEDS.map(s => s.id).find(id => (state.pouch[id] | 0) > 0) || sid || null;
    }
    const seed = gardenSeed(sid);
    if (!seed) return {ok:false, why:'seed', state, coins: coins|0};
    if ((state.pouch[seed.id] | 0) <= 0){
      const bought = gardenBuy(state, seed.id, coins);
      if (!bought.ok) return bought;
      state = bought.state;
      coins = bought.coins;
    }
    state.pouch[seed.id] = (state.pouch[seed.id] | 0) - 1;
    if (state.pouch[seed.id] <= 0) delete state.pouch[seed.id];
    const rarity = gardenRollRarity(seed.id, rng);
    plot.seed = seed.id;
    plot.plantedAt = +now || 0;
    plot.rarity = rarity;
    state.planted++;
    const mutated = rarity !== (seed.rarity || 'common');
    return {ok:true, why:'ok', state, coins: coins|0, plot, seed, rarity, mutated};
  }

  function gardenHarvest(state, plotId, now){
    state = gardenLoad(state);
    const i = plotId | 0;
    if (i < 0 || i >= GARDEN_PLOTS) return {ok:false, why:'plot', state};
    const plot = state.plots[i];
    if (!gardenReady(plot, now)) return {ok:false, why:'wait', state, stage: gardenStage(plot, now)};
    const packed = gardenItem({id: plot.seed, rarity: plot.rarity});
    const seed = plot.seed;
    const def = packed && gardenSeed(packed.id);
    plot.seed = null;
    plot.plantedAt = 0;
    plot.rarity = null;
    state.basket.push(packed);
    state.harvested++;
    return {ok:true, why:'ok', state, seed, item: def, packed, rarity: packed && packed.rarity};
  }

  function gardenSell(state, index){
    state = gardenLoad(state);
    if (!state.basket.length) return {ok:false, why:'empty', state, pay:0};
    const i = index == null ? state.basket.length - 1 : (index | 0);
    if (i < 0 || i >= state.basket.length) return {ok:false, why:'item', state, pay:0};
    const packed = state.basket.splice(i, 1)[0];
    const item = gardenItem(packed);
    const seed = item && gardenSeed(item.id);
    const pay = gardenSellValue(item);
    state.sold++;
    state.earned += pay;
    return {ok:true, why:'ok', state, seed: item && item.id, item: seed, rarity: item && item.rarity, packed: item, pay};
  }

  function gardenShow(state, slot, index){
    state = gardenLoad(state);
    const s = slot | 0;
    if (s < 0 || s >= GARDEN_STAND) return {ok:false, why:'slot', state};
    if (!state.basket.length) return {ok:false, why:'empty', state};
    const i = index == null ? state.basket.length - 1 : (index | 0);
    if (i < 0 || i >= state.basket.length) return {ok:false, why:'item', state};
    const packed = gardenItem(state.basket.splice(i, 1)[0]);
    const prev = state.stand[s];
    state.stand[s] = packed;
    if (prev) state.basket.push(gardenItem(prev) || prev);
    return {ok:true, why:'ok', state, seed: packed && packed.id, item: packed, prev};
  }

  function gardenPouchCount(state){
    state = gardenLoad(state);
    return Object.keys(state.pouch).reduce((n, k) => n + (state.pouch[k] | 0), 0);
  }

  function gardenGrantStarter(state){
    state = gardenLoad(state);
    const unused = !state.planted && !state.harvested && !state.sold && !Object.keys(state.pouch).length && !(state.basket && state.basket.length);
    if (!state.starter && unused){
      state.pouch.sprout = 3;
    }
    state.starter = true;
    return state;
  }

  function gardenLeft(plot, now){
    if (!plot || !plot.seed || !plot.plantedAt) return 0;
    const seed = gardenSeed(plot.seed);
    if (!seed) return 0;
    return Math.max(0, seed.grow - Math.max(0, (+now || 0) - plot.plantedAt));
  }

  function gardenPick(state, seedId){
    state = gardenLoad(state);
    if (seedId && gardenSeed(seedId)) state.pick = gardenSeed(seedId).id;
    else if (!gardenSeed(state.pick)) state.pick = state.pick || null;
    return state;
  }

  const api = {
    GARDEN_KEY, GARDEN_VER, GARDEN_PLOTS, GARDEN_STAND, GARDEN_SEEDS, GARDEN_RARITIES,
    gardenFresh, gardenLoad, gardenSeed, gardenItem, gardenRarity, gardenRarityId,
    gardenSellValue, gardenRollRarity, gardenStage, gardenReady,
    gardenBuy, gardenPlant, gardenHarvest, gardenSell, gardenShow, gardenPouchCount,
    gardenGrantStarter, gardenLeft, gardenPick
  };
  root.GardenRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
