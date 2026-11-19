/* Chow Chuck Meadow — snack toss, slow levels, rebirth, rarity pals. Save key rubloxMeadow. */
(function (root) {
  const MEADOW_KEY = 'rubloxMeadow';
  const MEADOW_VER = 1;
  const MEADOW_BASE = 12;
  const MEADOW_STEP = 3;
  const MEADOW_MAX_LEVEL = 20;
  const MEADOW_MAX_TRAIN = 18; // kept so older saves/tests still have a named cap
  const MEADOW_REBIRTH_LEVEL = 10;
  const MEADOW_XP_THROW = 3;
  const MEADOW_XP_TRAIN = 14;
  const MEADOW_XP_FIND = 22;
  const MEADOW_REBIRTH_MUL = 0.4;
  const MEADOW_RARITIES = [
    {id:'common', name:'Common', color:'#7ad46a'},
    {id:'uncommon', name:'Uncommon', color:'#3a86ff'},
    {id:'rare', name:'Rare', color:'#b48cff'},
    {id:'epic', name:'Epic', color:'#ff9f1c'},
    {id:'legendary', name:'Legendary', color:'#ffd23f'},
    {id:'secret', name:'Secret', color:'#c9b6ff'}
  ];
  const MEADOW_BADGES = [
    {id:'sprout', name:'Meadow Sprout', emoji:'🌱', at:0},
    {id:'born', name:'Reborn Tosser', emoji:'♻️', at:1},
    {id:'hero', name:'Snack Hero', emoji:'🎖️', at:3},
    {id:'legend', name:'Chuck Legend', emoji:'🏆', at:5},
    {id:'mythic', name:'Meadow Mythic', emoji:'🌟', at:10}
  ];
  const MEADOW_ANIMALS = [
    {id:'puddle', name:'Puddle Pup', emoji:'🐶', color:'#7ec8e3', rarity:'common'},
    {id:'clover', name:'Clover Kit', emoji:'🦊', color:'#f4a05c', rarity:'uncommon'},
    {id:'berry', name:'Berry Bun', emoji:'🐰', color:'#e88bb0', rarity:'rare'},
    {id:'moss', name:'Moss Mouse', emoji:'🐭', color:'#8fbf6a', rarity:'epic'},
    {id:'starlit', name:'Starlit Fawn', emoji:'🦌', color:'#d4b483', rarity:'legendary'},
    {id:'wisp', name:'Dusk Wisp', emoji:'🌙', color:'#c9b6ff', rarity:'secret'}
  ];
  const MEADOW_FIELDS = [
    {id:'patch', name:'Sunny Patch', min:8, animal:'puddle'},
    {id:'hill', name:'Clover Hill', min:16, animal:'clover'},
    {id:'brook', name:'Berry Brook', min:24, animal:'berry'},
    {id:'hollow', name:'Moss Hollow', min:32, animal:'moss'},
    {id:'glade', name:'Star Glade', min:40, animal:'starlit', secret:'wisp', secretChance:0.1}
  ];

  function meadowFresh(){
    return {ver: MEADOW_VER, found:[], trained:0, throws:0, best:0, snacks:12, xp:0, rebirths:0, badge:'sprout'};
  }

  function meadowAnimal(id){ return MEADOW_ANIMALS.find(a => a.id === id) || null; }
  function meadowField(id){ return MEADOW_FIELDS.find(f => f.id === id) || null; }
  function meadowRarity(id){ return MEADOW_RARITIES.find(r => r.id === id) || null; }

  function meadowXpToReach(level){
    const L = Math.max(0, level | 0);
    let t = 0;
    for (let i = 1; i <= L; i++) t += 40 + i * 25;
    return t;
  }

  function meadowLevelFromXp(xp){
    const n = Math.max(0, +xp || 0);
    let lvl = 0;
    while (lvl < MEADOW_MAX_LEVEL && n >= meadowXpToReach(lvl + 1)) lvl++;
    return lvl;
  }

  function meadowBadge(rebirths){
    const n = rebirths | 0;
    let b = MEADOW_BADGES[0];
    MEADOW_BADGES.forEach(x => { if (n >= x.at) b = x; });
    return b;
  }

  function meadowXpMul(state){
    state = state && state.ver != null ? state : meadowLoad(state);
    return 1 + Math.max(0, state.rebirths | 0) * MEADOW_REBIRTH_MUL;
  }

  function meadowLoad(raw){
    const d = meadowFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    if (Array.isArray(o.found)){
      d.found = o.found.map(x => meadowAnimal(x) ? x : null).filter(Boolean);
      d.found = d.found.filter((id, i, arr) => arr.indexOf(id) === i);
    }
    d.trained = Math.max(0, Math.min(MEADOW_MAX_TRAIN, o.trained | 0));
    d.throws = Math.max(0, o.throws | 0);
    d.best = Math.max(0, +o.best || 0);
    d.snacks = Math.max(0, o.snacks == null ? 12 : (o.snacks | 0));
    d.rebirths = Math.max(0, o.rebirths | 0);
    if (o.xp == null && d.trained > 0) d.xp = meadowXpToReach(d.trained);
    else d.xp = Math.max(0, +o.xp || 0);
    const badge = meadowBadge(d.rebirths);
    d.badge = (o.badge && MEADOW_BADGES.some(b => b.id === o.badge)) ? o.badge : badge.id;
    return d;
  }

  function meadowLevel(state){
    state = meadowLoad(state);
    return meadowLevelFromXp(state.xp);
  }

  function meadowPower(state){
    state = meadowLoad(state);
    return MEADOW_BASE + meadowLevel(state) * MEADOW_STEP;
  }

  function meadowCharge(v){
    const n = +v;
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function meadowFieldAt(dist){
    let best = null;
    MEADOW_FIELDS.forEach(f => { if (dist + 1e-9 >= f.min) best = f; });
    return best;
  }

  function meadowGrantXp(state, amount){
    state = meadowLoad(state);
    const raw = Math.max(0, +amount || 0);
    if (!raw) return {state, gained:0, level: meadowLevel(state)};
    const gained = Math.round(raw * meadowXpMul(state) * 10) / 10;
    const before = meadowLevel(state);
    state.xp = Math.round((state.xp + gained) * 10) / 10;
    const level = meadowLevel(state);
    return {state, gained, level, up: level > before};
  }

  function meadowToss(state, charge, ownerId, animalOwnerId){
    state = meadowLoad(state);
    if (animalOwnerId && ownerId && animalOwnerId !== ownerId){
      return {ok:false, why:'owned', state, dist:0};
    }
    if ((state.snacks | 0) <= 0) return {ok:false, why:'snacks', state, dist:0};
    const c = meadowCharge(charge);
    if (c <= 0) return {ok:false, why:'charge', state, dist:0};
    const dist = meadowPower(state) * c;
    state.snacks -= 1;
    state.throws += 1;
    if (dist > state.best) state.best = Math.round(dist * 10) / 10;
    const xp = meadowGrantXp(state, MEADOW_XP_THROW);
    state = xp.state;
    return {ok:true, why:'ok', state, dist, xp: xp.gained, level: xp.level, leveled: xp.up};
  }

  function meadowAward(state, fieldLike, rng){
    state = meadowLoad(state);
    const field = fieldLike && (meadowField(fieldLike.id) || meadowField(fieldLike.field) || fieldLike);
    const meta = field && field.id ? meadowField(field.id) || field : field;
    let aid = meta && (meta.animal || fieldLike.animal || fieldLike.id);
    const secretId = meta && meta.secret;
    const chance = (meta && meta.secretChance != null) ? +meta.secretChance : 0;
    const roll = typeof rng === 'function' ? +rng() : Math.random();
    if (secretId && chance > 0 && roll < chance) aid = secretId;
    const animal = meadowAnimal(aid);
    let foundNew = false;
    if (animal && state.found.indexOf(animal.id) < 0){
      state.found.push(animal.id);
      foundNew = true;
      const xp = meadowGrantXp(state, MEADOW_XP_FIND);
      state = xp.state;
    }
    return {state, field: meta && meta.id ? meadowField(meta.id) || meta : meta, animal, foundNew};
  }

  function meadowThrow(state, charge, ownerId, animalOwnerId, rng){
    const tossed = meadowToss(state, charge, ownerId, animalOwnerId);
    if (!tossed.ok) return tossed;
    const field = meadowFieldAt(tossed.dist);
    const got = field ? meadowAward(tossed.state, field, rng) : {state:tossed.state, field:null, animal:null, foundNew:false};
    return Object.assign({}, tossed, {ok:true, why:'ok', state: got.state, field: got.field, animal: got.animal, foundNew: got.foundNew});
  }

  function meadowTrain(state){
    state = meadowLoad(state);
    if (meadowLevel(state) >= MEADOW_MAX_LEVEL) return {ok:false, why:'max', state, power: meadowPower(state)};
    const xp = meadowGrantXp(state, MEADOW_XP_TRAIN);
    state = xp.state;
    state.trained = Math.min(MEADOW_MAX_TRAIN, meadowLevel(state));
    return {ok:true, why:'ok', state, power: meadowPower(state), xp: xp.gained, level: xp.level, leveled: xp.up};
  }

  function meadowCanRebirth(state){
    state = meadowLoad(state);
    return meadowLevel(state) >= MEADOW_REBIRTH_LEVEL;
  }

  function meadowRebirth(state){
    state = meadowLoad(state);
    if (!meadowCanRebirth(state)){
      return {ok:false, why:'level', state, need: MEADOW_REBIRTH_LEVEL, level: meadowLevel(state)};
    }
    state.xp = 0;
    state.trained = 0;
    state.snacks = 12;
    state.rebirths = (state.rebirths | 0) + 1;
    const badge = meadowBadge(state.rebirths);
    state.badge = badge.id;
    return {ok:true, why:'ok', state, rebirths: state.rebirths, badge, mul: meadowXpMul(state), power: meadowPower(state)};
  }

  function meadowRestock(state, n){
    state = meadowLoad(state);
    state.snacks = Math.min(99, (state.snacks | 0) + Math.max(1, n|0 || 6));
    return state;
  }

  function meadowBook(state){
    state = meadowLoad(state);
    const badge = meadowBadge(state.rebirths);
    return MEADOW_ANIMALS.map(a => ({
      id: a.id, name: a.name, emoji: a.emoji, color: a.color,
      rarity: a.rarity,
      rarityInfo: meadowRarity(a.rarity),
      found: state.found.indexOf(a.id) >= 0,
      field: MEADOW_FIELDS.find(f => f.animal === a.id || f.secret === a.id)
    })).concat(); // book is just the animals; callers also read level from state
  }

  function meadowCard(state){
    state = meadowLoad(state);
    const badge = meadowBadge(state.rebirths);
    const level = meadowLevel(state);
    const into = meadowXpToReach(level + 1);
    const prev = meadowXpToReach(level);
    return {
      level, xp: state.xp, next: into, need: Math.max(0, into - state.xp),
      progress: level >= MEADOW_MAX_LEVEL ? 1 : (into === prev ? 1 : (state.xp - prev) / (into - prev)),
      power: meadowPower(state),
      rebirths: state.rebirths,
      canRebirth: meadowCanRebirth(state),
      rebirthNeed: MEADOW_REBIRTH_LEVEL,
      mul: meadowXpMul(state),
      badge
    };
  }

  function meadowCanTake(ownerId, otherId){
    if (!otherId || !ownerId) return true;
    return ownerId === otherId;
  }

  function meadowLanding(fromX, fromZ, dirX, dirZ, dist){
    const L = Math.hypot(+dirX || 0, +dirZ || 0) || 1;
    const d = Math.max(0, +dist || 0);
    return {x: (+fromX || 0) + (dirX / L) * d, z: (+fromZ || 0) + (dirZ / L) * d, dist: d};
  }

  function meadowHitField(fields, x, z, radius){
    const r = radius == null ? 5.5 : +radius;
    let best = null, bestD = r;
    (fields || []).forEach(f => {
      if (!f) return;
      const d = Math.hypot((+f.x || 0) - x, (+f.z || 0) - z);
      const allow = f.r != null ? +f.r : r;
      if (d <= allow && d <= bestD){ best = f; bestD = d; }
    });
    return best;
  }

  function meadowThrowTo(state, charge, fromX, fromZ, dirX, dirZ, fields, ownerId, animalOwnerId, rng){
    const tossed = meadowToss(state, charge, ownerId, animalOwnerId);
    if (!tossed.ok) return tossed;
    const land = meadowLanding(fromX, fromZ, dirX, dirZ, tossed.dist);
    const hit = meadowHitField(fields, land.x, land.z, 5.5);
    if (!hit){
      return Object.assign({}, tossed, {ok:true, why:'ok', land, field:null, animal:null, foundNew:false, missed:true});
    }
    const got = meadowAward(tossed.state, hit, rng);
    return Object.assign({}, tossed, {ok:true, why:'ok', state: got.state, land, field: got.field || hit, animal: got.animal, foundNew: got.foundNew, missed:false});
  }

  const api = {
    MEADOW_KEY, MEADOW_VER, MEADOW_BASE, MEADOW_STEP, MEADOW_MAX_TRAIN, MEADOW_MAX_LEVEL,
    MEADOW_REBIRTH_LEVEL, MEADOW_XP_THROW, MEADOW_XP_TRAIN, MEADOW_XP_FIND, MEADOW_REBIRTH_MUL,
    MEADOW_ANIMALS, MEADOW_FIELDS, MEADOW_RARITIES, MEADOW_BADGES,
    meadowFresh, meadowLoad, meadowAnimal, meadowField, meadowRarity, meadowPower, meadowCharge,
    meadowFieldAt, meadowToss, meadowThrow, meadowThrowTo, meadowLanding, meadowHitField,
    meadowTrain, meadowRestock, meadowBook, meadowCard, meadowCanTake,
    meadowLevel, meadowXpToReach, meadowGrantXp, meadowXpMul, meadowBadge,
    meadowCanRebirth, meadowRebirth
  };
  root.MeadowRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
