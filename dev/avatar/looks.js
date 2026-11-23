/* New optional avatar looks — Y2K, grunge, cozy, fancy. Ids are additive only. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LookRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const LOOK_ITEMS = [
    {id:'body-boy', cat:'style', also:'looks', emoji:'🧍‍♂️', name:'Boy Body', price:0, slot:'body', val:'boy', desc:'Broader shoulders, a bit squarer than Classic'},
    {id:'hat-beanie', cat:'looks', emoji:'🧶', name:'Cozy Beanie', price:120, slot:'hat', val:'beanie', vibe:'cozy'},
    {id:'hat-bucket', cat:'looks', emoji:'🧢', name:'Y2K Bucket Hat', price:140, slot:'hat', val:'bucket', vibe:'y2k'},
    {id:'hat-visor', cat:'looks', emoji:'😎', name:'Sun Visor', price:110, slot:'hat', val:'visor', vibe:'y2k'},
    {id:'hat-beret', cat:'looks', emoji:'🎨', name:'Fancy Beret', price:160, slot:'hat', val:'beret', vibe:'fancy'},
    {id:'hat-tophat', cat:'looks', emoji:'🎩', name:'Tiny Top Hat', price:200, slot:'hat', val:'tophat', vibe:'fancy'},
    {id:'hat-slouch', cat:'looks', emoji:'🖤', name:'Slouch Beanie', price:130, slot:'hat', val:'slouch', vibe:'grunge'},
    {id:'hat-earmuffs', cat:'looks', emoji:'🎧', name:'Fuzzy Earmuffs', price:130, slot:'hat', val:'earmuffs', vibe:'cozy'},
    {id:'hat-newsboy', cat:'looks', emoji:'📰', name:'Newsboy Cap', price:140, slot:'hat', val:'newsboy', vibe:'grunge'},
    {id:'hat-flower', cat:'looks', emoji:'🌸', name:'Flower Crown', price:180, slot:'hat', val:'flower', vibe:'fancy'},
    {id:'hat-jellycap', cat:'looks', emoji:'🧢', name:'Moonveil Jelly Cap', price:40, slot:'hat', val:'jellycap', vibe:'cozy'},
    {id:'hat-tidecap', cat:'looks', emoji:'🎩', name:'Tideglass Tide Cap', price:42, slot:'hat', val:'tidecap', vibe:'cozy'},
    {id:'hair-wolf', cat:'looks', also:'hair', emoji:'💇', name:'Wolf Cut', price:175, slot:'hair', val:'wolf', vibe:'grunge'},
    {id:'hair-shag', cat:'looks', also:'hair', emoji:'💇', name:'Messy Shag', price:150, slot:'hair', val:'shag', vibe:'grunge'},
    {id:'hair-curtains', cat:'looks', also:'hair', emoji:'💇', name:'Curtain Bangs', price:160, slot:'hair', val:'curtains', vibe:'y2k'},
    {id:'hair-crimped', cat:'looks', also:'hair', emoji:'💇', name:'Crimped Hair', price:160, slot:'hair', val:'crimped', vibe:'y2k'},
    {id:'hair-waves', cat:'looks', also:'hair', emoji:'💇', name:'Soft Waves', price:150, slot:'hair', val:'waves', vibe:'cozy'},
    {id:'hair-updo', cat:'looks', also:'hair', emoji:'💇', name:'Fancy Updo', price:180, slot:'hair', val:'updo', vibe:'fancy'},
    {id:'hair-slickbob', cat:'looks', also:'hair', emoji:'💇', name:'Sleek Bob', price:150, slot:'hair', val:'slickbob', vibe:'fancy'},
    {id:'hair-undercut', cat:'looks', also:'hair', emoji:'💇', name:'Undercut', price:140, slot:'hair', val:'undercut', vibe:'grunge'},
    {id:'hair-milkmaid', cat:'looks', also:'hair', emoji:'💇', name:'Milkmaid Braids', price:170, slot:'hair', val:'milkmaid', vibe:'cozy'},
    {id:'hair-mullet', cat:'looks', also:'hair', emoji:'💇', name:'Star Mullet', price:160, slot:'hair', val:'mullet', vibe:'y2k'},
    {id:'shirt-babyt', cat:'looks', also:'shirt', emoji:'👕', name:'Y2K Baby Tee', price:140, slot:'shirtPat', val:'babyt', vibe:'y2k'},
    {id:'shirt-flannel', cat:'looks', also:'shirt', emoji:'👕', name:'Grunge Flannel', price:160, slot:'shirtPat', val:'flannel', vibe:'grunge'},
    {id:'shirt-sweater', cat:'looks', also:'shirt', emoji:'👕', name:'Cozy Sweater', price:160, slot:'shirtPat', val:'sweater', vibe:'cozy'},
    {id:'shirt-blouse', cat:'looks', also:'shirt', emoji:'👕', name:'Fancy Blouse', price:170, slot:'shirtPat', val:'blouse', vibe:'fancy'},
    {id:'shirt-tux', cat:'looks', also:'shirt', emoji:'👔', name:'Tuxedo Shirt', price:200, slot:'shirtPat', val:'tux', vibe:'fancy'},
    {id:'shirt-cardigan', cat:'looks', also:'shirt', emoji:'🧥', name:'Soft Cardigan', price:160, slot:'shirtPat', val:'cardigan', vibe:'cozy'},
    {id:'pants-cargo', cat:'looks', also:'pants', emoji:'👖', name:'Y2K Cargos', price:150, slot:'pantsPat', val:'cargo', vibe:'y2k'},
    {id:'pants-ripped', cat:'looks', also:'pants', emoji:'👖', name:'Ripped Jeans', price:150, slot:'pantsPat', val:'ripped', vibe:'grunge'},
    {id:'pants-joggers', cat:'looks', also:'pants', emoji:'👖', name:'Cozy Joggers', price:130, slot:'pantsPat', val:'joggers', vibe:'cozy'},
    {id:'pants-dressy', cat:'looks', also:'pants', emoji:'👖', name:'Dress Pants', price:160, slot:'pantsPat', val:'dressy', vibe:'fancy'},
    {id:'pants-baggy', cat:'looks', also:'pants', emoji:'👖', name:'Baggy Pants', price:150, slot:'pantsPat', val:'baggy', vibe:'y2k'},
    {id:'pants-gown', cat:'looks', also:'style', emoji:'👗', name:'Fancy Gown', price:0, slot:'pantsPat', val:'gown', vibe:'fancy', desc:'A long dress that matches your shirt color'},
    {id:'pants-sundress', cat:'looks', also:'style', emoji:'👗', name:'Cozy Sundress', price:0, slot:'pantsPat', val:'sundress', vibe:'cozy'}
  ];

  const OLD_IDS = [
    'hair-short','hair-long','hair-ponytail','hair-pigtails','hair-curly','hair-spiky','hair-bun',
    'hair-beehive','hair-braid','hair-bowl','hair-spacebuns','hair-combover','hair-sidepony','hair-twinbraids','hair-curl',
    'hat-toque','hat-burger','hat-backcap','hat-propeller','hat-pumpkin','hat-witch','hat-santa','hat-turkey',
    'body-classic','body-girl','pants-dress','pants-skirt','lash-on'
  ];

  function lookItem(id){ return LOOK_ITEMS.find(it => it.id === id) || null; }
  function lookIds(){ return LOOK_ITEMS.map(it => it.id); }
  function lookIsNew(id){ return lookIds().indexOf(id) >= 0 && OLD_IDS.indexOf(id) < 0; }
  function lookVibes(){ return ['y2k','grunge','cozy','fancy']; }

  function lookFixAv(a){
    if (!a || typeof a !== 'object') return a;
    const next = Object.assign({}, a);
    if (next.body !== 'girl' && next.body !== 'boy' && next.body !== 'classic') next.body = 'classic';
    return next;
  }

  function lookWearSafe(owned, itemId){
    const it = lookItem(itemId);
    if (!it) return {ok:false, why:'missing'};
    if (it.price > 0 && owned && !owned.has && !owned[it.id] && !(owned instanceof Set && owned.has(it.id))){
      if (Array.isArray(owned) && owned.indexOf(it.id) < 0) return {ok:false, why:'owned'};
      if (!Array.isArray(owned) && !(owned instanceof Set) && !owned[it.id]) return {ok:false, why:'owned'};
    }
    return {ok:true, item: it};
  }

  return {LOOK_ITEMS, OLD_IDS, lookItem, lookIds, lookIsNew, lookVibes, lookFixAv, lookWearSafe};
});
