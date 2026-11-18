/* Sunny Patch Garden — original seeds, real-time plots, prize stand. Save key rubloxGarden. */
(function (root) {
  const GARDEN_KEY = 'rubloxGarden';
  const GARDEN_VER = 1;
  const GARDEN_PLOTS = 9;
  const GARDEN_STAND = 3;
  const GARDEN_SEEDS = [
    {id:'sprout', name:'Silly Sprout', emoji:'🌱', cost:2, sell:3, grow:15000, color:'#7ad46a'},
    {id:'bean', name:'Giggle Bean', emoji:'🫘', cost:5, sell:8, grow:45000, color:'#c45c4a'},
    {id:'cloud', name:'Cloudberry', emoji:'☁️', cost:10, sell:20, grow:120000, color:'#cfe8ff'},
    {id:'melon', name:'Moon Melon', emoji:'🍈', cost:20, sell:45, grow:300000, color:'#b4e07a'},
    {id:'squash', name:'Sparkle Squash', emoji:'✨', cost:35, sell:90, grow:600000, color:'#f4c84a'}
  ];

  function gardenFresh(){
    return {
      ver: GARDEN_VER,
      pouch: {},
      plots: Array.from({length: GARDEN_PLOTS}, (_, i) => ({id:i, seed:null, plantedAt:0})),
      basket: [],
      stand: Array(GARDEN_STAND).fill(null),
      sold: 0,
      earned: 0,
      planted: 0,
      harvested: 0
    };
  }

  function gardenSeed(id){ return GARDEN_SEEDS.find(s => s.id === id) || null; }

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
        const seed = gardenSeed(q.seed) ? q.seed : null;
        const plantedAt = seed && +q.plantedAt > 0 ? +q.plantedAt : 0;
        return {id:i, seed, plantedAt};
      });
    }
    if (Array.isArray(o.basket)){
      d.basket = o.basket.map(x => gardenSeed(x) ? x : (x && gardenSeed(x.id) ? x.id : null)).filter(Boolean).slice(0, 40);
    }
    if (Array.isArray(o.stand)){
      d.stand = d.stand.map((_, i) => {
        const x = o.stand[i];
        return gardenSeed(x) ? x : (x && gardenSeed(x.id) ? x.id : null);
      });
    }
    d.sold = Math.max(0, o.sold | 0);
    d.earned = Math.max(0, o.earned | 0);
    d.planted = Math.max(0, o.planted | 0);
    d.harvested = Math.max(0, o.harvested | 0);
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

  function gardenPlant(state, plotId, seedId, now, coins){
    state = gardenLoad(state);
    const i = plotId | 0;
    if (i < 0 || i >= GARDEN_PLOTS) return {ok:false, why:'plot', state, coins: coins|0};
    const plot = state.plots[i];
    if (plot.seed) return {ok:false, why:'busy', state, coins: coins|0};
    let sid = seedId;
    if (!sid){
      sid = GARDEN_SEEDS.map(s => s.id).find(id => (state.pouch[id] | 0) > 0) || null;
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
    plot.seed = seed.id;
    plot.plantedAt = +now || 0;
    state.planted++;
    return {ok:true, why:'ok', state, coins: coins|0, plot, seed};
  }

  function gardenHarvest(state, plotId, now){
    state = gardenLoad(state);
    const i = plotId | 0;
    if (i < 0 || i >= GARDEN_PLOTS) return {ok:false, why:'plot', state};
    const plot = state.plots[i];
    if (!gardenReady(plot, now)) return {ok:false, why:'wait', state, stage: gardenStage(plot, now)};
    const seed = plot.seed;
    plot.seed = null;
    plot.plantedAt = 0;
    state.basket.push(seed);
    state.harvested++;
    return {ok:true, why:'ok', state, seed, item: gardenSeed(seed)};
  }

  function gardenSell(state, index){
    state = gardenLoad(state);
    if (!state.basket.length) return {ok:false, why:'empty', state, pay:0};
    const i = index == null ? state.basket.length - 1 : (index | 0);
    if (i < 0 || i >= state.basket.length) return {ok:false, why:'item', state, pay:0};
    const sid = state.basket.splice(i, 1)[0];
    const seed = gardenSeed(sid);
    const pay = seed ? seed.sell : 0;
    state.sold++;
    state.earned += pay;
    return {ok:true, why:'ok', state, seed: sid, item: seed, pay};
  }

  function gardenShow(state, slot, index){
    state = gardenLoad(state);
    const s = slot | 0;
    if (s < 0 || s >= GARDEN_STAND) return {ok:false, why:'slot', state};
    if (!state.basket.length) return {ok:false, why:'empty', state};
    const i = index == null ? state.basket.length - 1 : (index | 0);
    if (i < 0 || i >= state.basket.length) return {ok:false, why:'item', state};
    const sid = state.basket.splice(i, 1)[0];
    const prev = state.stand[s];
    state.stand[s] = sid;
    if (prev) state.basket.push(prev);
    return {ok:true, why:'ok', state, seed: sid, prev};
  }

  function gardenPouchCount(state){
    state = gardenLoad(state);
    return Object.keys(state.pouch).reduce((n, k) => n + (state.pouch[k] | 0), 0);
  }

  const api = {
    GARDEN_KEY, GARDEN_VER, GARDEN_PLOTS, GARDEN_STAND, GARDEN_SEEDS,
    gardenFresh, gardenLoad, gardenSeed, gardenStage, gardenReady,
    gardenBuy, gardenPlant, gardenHarvest, gardenSell, gardenShow, gardenPouchCount
  };
  root.GardenRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
