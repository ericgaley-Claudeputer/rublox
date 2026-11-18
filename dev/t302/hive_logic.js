/* Honeyhill Hive — gentle bee swarm, pollen, honey, bear quests, no fighting. Save key rubloxHive. */
(function (root) {
  const HIVE_KEY = 'rubloxHive';
  const HIVE_VER = 1;
  const HIVE_PER = 10;
  const HIVE_MAX_BEES = 12;
  const HIVE_FLOWERS = [
    {id:'sun', name:'Sunnycup', color:'#ffd23f', pollen:2, trail:'meadow'},
    {id:'blue', name:'Bluebell Pop', color:'#5aa9ff', pollen:3, trail:'meadow'},
    {id:'rose', name:'Rosypuff', color:'#ff6fb5', pollen:3, trail:'brook'},
    {id:'mint', name:'Mintcloud', color:'#7ad4a0', pollen:4, trail:'brook'},
    {id:'dusk', name:'Duskpetal', color:'#b48cff', pollen:5, trail:'glade'},
    {id:'star', name:'Starblossom', color:'#fff4c2', pollen:6, trail:'glade'}
  ];
  const HIVE_TRAILS = [
    {id:'meadow', name:'Clover Trail', need:null},
    {id:'brook', name:'Brook Trail', need:'berry-bear'},
    {id:'glade', name:'Lantern Glade Trail', need:'clover-bear'}
  ];
  const HIVE_BEARS = [
    {id:'berry-bear', name:'Berry Bear', emoji:'🐻', want:'honey', count:2, sticker:'berry-badge', unlock:'brook', line:'Could you bring 2 pots of honey for my picnic?'},
    {id:'clover-bear', name:'Clover Bear', emoji:'🧸', want:'visit', trail:'brook', sticker:'clover-badge', unlock:'glade', line:'Walk the Brook Trail and tell me how the flowers smell!'},
    {id:'honey-bear', name:'Honey Bear', emoji:'🍯', want:'honey', count:5, sticker:'honey-badge', unlock:null, line:'Five pots of honey would make the sweetest gift.'}
  ];
  const HIVE_STICKERS = [
    {id:'berry-badge', name:'Berry Picnic Sticker', emoji:'🍓'},
    {id:'clover-badge', name:'Clover Path Sticker', emoji:'🍀'},
    {id:'honey-badge', name:'Golden Honey Sticker', emoji:'🍯'}
  ];

  function hiveFresh(){
    return {
      ver: HIVE_VER,
      pollen: 0,
      honey: 0,
      bees: 3,
      made: 0,
      collected: 0,
      stickers: [],
      trails: ['meadow'],
      quests: {},
      visits: []
    };
  }

  function hiveFlower(id){ return HIVE_FLOWERS.find(f => f.id === id) || null; }
  function hiveBear(id){ return HIVE_BEARS.find(b => b.id === id) || null; }
  function hiveTrail(id){ return HIVE_TRAILS.find(t => t.id === id) || null; }
  function hiveSticker(id){ return HIVE_STICKERS.find(s => s.id === id) || null; }

  function hiveLoad(raw){
    const d = hiveFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.pollen = Math.max(0, o.pollen | 0);
    d.honey = Math.max(0, o.honey | 0);
    d.bees = Math.max(1, Math.min(HIVE_MAX_BEES, o.bees == null ? 3 : (o.bees | 0)));
    d.made = Math.max(0, o.made | 0);
    d.collected = Math.max(0, o.collected | 0);
    if (Array.isArray(o.stickers)) d.stickers = o.stickers.filter(id => hiveSticker(id));
    if (Array.isArray(o.trails) && o.trails.length){
      const tr = o.trails.filter(id => hiveTrail(id));
      d.trails = tr.indexOf('meadow') >= 0 ? tr : ['meadow'].concat(tr);
    }
    if (o.quests && typeof o.quests === 'object'){
      HIVE_BEARS.forEach(b => {
        const q = o.quests[b.id];
        if (q && (q === true || q.done || q === 'done')) d.quests[b.id] = 'done';
        else if (q) d.quests[b.id] = 'open';
      });
    }
    if (Array.isArray(o.visits)) d.visits = o.visits.filter(id => hiveTrail(id));
    return d;
  }

  function hiveTrailOpen(state, trailId){
    state = hiveLoad(state);
    return state.trails.indexOf(trailId) >= 0;
  }

  function hiveCollect(state, flowerId, now){
    state = hiveLoad(state);
    const f = hiveFlower(flowerId);
    if (!f) return {ok:false, why:'flower', state};
    if (!hiveTrailOpen(state, f.trail)) return {ok:false, why:'locked', state};
    state.pollen += f.pollen;
    state.collected++;
    return {ok:true, why:'ok', state, flower:f, got:f.pollen};
  }

  function hiveMakeHoney(state){
    state = hiveLoad(state);
    if (state.pollen < HIVE_PER) return {ok:false, why:'pollen', state, need: HIVE_PER - state.pollen};
    const pots = Math.floor(state.pollen / HIVE_PER);
    state.pollen -= pots * HIVE_PER;
    state.honey += pots;
    state.made += pots;
    return {ok:true, why:'ok', state, pots};
  }

  function hiveVisit(state, trailId){
    state = hiveLoad(state);
    if (!hiveTrail(trailId)) return {ok:false, why:'trail', state};
    if (!hiveTrailOpen(state, trailId)) return {ok:false, why:'locked', state};
    if (state.visits.indexOf(trailId) < 0) state.visits.push(trailId);
    return {ok:true, why:'ok', state};
  }

  function hiveStartQuest(state, bearId){
    state = hiveLoad(state);
    const b = hiveBear(bearId);
    if (!b) return {ok:false, why:'bear', state};
    if (state.quests[b.id] === 'done') return {ok:false, why:'done', state, bear:b};
    state.quests[b.id] = 'open';
    return {ok:true, why:'ok', state, bear:b};
  }

  function hiveTurnIn(state, bearId){
    state = hiveLoad(state);
    const b = hiveBear(bearId);
    if (!b) return {ok:false, why:'bear', state};
    if (state.quests[b.id] === 'done') return {ok:false, why:'done', state, bear:b};
    if (b.want === 'honey'){
      const need = b.count | 0;
      if (state.honey < need) return {ok:false, why:'honey', state, bear:b, need: need - state.honey};
      state.honey -= need;
    } else if (b.want === 'visit'){
      if (state.visits.indexOf(b.trail) < 0) return {ok:false, why:'visit', state, bear:b};
    }
    state.quests[b.id] = 'done';
    if (b.sticker && state.stickers.indexOf(b.sticker) < 0) state.stickers.push(b.sticker);
    if (b.unlock && state.trails.indexOf(b.unlock) < 0) state.trails.push(b.unlock);
    if (state.bees < HIVE_MAX_BEES) state.bees += 1;
    return {ok:true, why:'ok', state, bear:b, sticker: hiveSticker(b.sticker), trail: b.unlock};
  }

  function hiveFight(){ return false; }

  const api = {
    HIVE_KEY, HIVE_VER, HIVE_PER, HIVE_MAX_BEES, HIVE_FLOWERS, HIVE_TRAILS, HIVE_BEARS, HIVE_STICKERS,
    hiveFresh, hiveLoad, hiveFlower, hiveBear, hiveTrail, hiveSticker, hiveTrailOpen,
    hiveCollect, hiveMakeHoney, hiveVisit, hiveStartQuest, hiveTurnIn, hiveFight
  };
  root.HiveRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
